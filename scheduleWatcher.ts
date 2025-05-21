import { Client, WorkflowNotFoundError } from "@temporalio/client";

async function run() {
  const client = new Client();

  try {
    for await (const summary of client.schedule.list()) {
      const scheduleId = summary.scheduleId;
      console.log(`🔍 Checking schedule: ${scheduleId}`);

      const scheduleHandle = client.schedule.getHandle(scheduleId);
      const scheduleDesc = await scheduleHandle.describe();

      // console.log(`Schedule Description:`, JSON.stringify(scheduleDesc))

      const recentAction = scheduleDesc.info?.recentActions?.[0];
      const workflowId =
        recentAction?.action?.type === "startWorkflow"
          ? recentAction.action.workflow?.workflowId
          : undefined;

      if (!workflowId) {
        console.warn(`⚠️ Schedule '${scheduleId}' has no workflowId defined.`);
        continue;
      }

      try {
        const wfHandle = client.workflow.getHandle(workflowId);
        const wfDesc = await wfHandle.describe();

        if (wfDesc.status.name === "COMPLETED") {
          if (!scheduleDesc.state.paused) {
            await scheduleHandle.pause(
              `Paused after workflow '${workflowId}' completed.`
            );
            console.log(
              `⏸️ Paused schedule '${scheduleId}' (workflow '${workflowId}' completed)`
            );
          } else {
            console.log(`ℹ️ Schedule '${scheduleId}' already paused`);
          }
        } else {
          console.log(
            `⏳ Workflow '${workflowId}' is still in status: ${wfDesc.status.name}`
          );
        }
      } catch (err: any) {
        if (
          err instanceof WorkflowNotFoundError ||
          err.message?.includes("not found")
        ) {
          console.warn(
            `⚠️ Workflow '${workflowId}' not found — maybe not triggered yet or has expired?`
          );
        } else {
          throw err;
        }
      }
    }
  } finally {
    await client.connection.close();
    console.log("🔌 Client connection closed");
  }
}

run().catch((err) => {
  console.error("❌ Error in schedule workflow monitor:", err);
  process.exit(1);
});
