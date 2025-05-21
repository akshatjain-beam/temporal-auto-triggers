// activities/index.ts
import { Client } from '@temporalio/client';

export async function handleAutoTriggerActions({ actions, data }: { actions: string[]; data: any }) {
  console.log('📦 Actions:', actions);
  console.log('📄 Data:', data);

  for (const action of actions) {
    console.log(`🔧 Executing action: ${action}`);
    // Place real action logic here (e.g., send email, post webhook)
  }
}

export async function pauseCompletedSchedules() {
  const client = new Client();

  try {
    for await (const summary of client.schedule.list()) {
      const scheduleId = summary.scheduleId;
      const scheduleHandle = client.schedule.getHandle(scheduleId);
      const scheduleDesc = await scheduleHandle.describe();

      const recentAction = scheduleDesc.info?.recentActions?.[0];
      const workflowId = recentAction?.action?.type === 'startWorkflow'
        ? recentAction.action.workflow?.workflowId
        : undefined;

      if (!workflowId) {
        console.warn(`⚠️ Schedule '${scheduleId}' has no workflowId defined.`);
        continue;
      }

      try {
        const wfHandle = client.workflow.getHandle(workflowId);
        const wfDesc = await wfHandle.describe();

        if (wfDesc.status.name === 'COMPLETED') {
          if (!scheduleDesc.state.paused) {
            await scheduleHandle.pause(`Paused after workflow ${workflowId} completed`);
            console.log(`⏸️ Paused schedule '${scheduleId}' (workflow '${workflowId}' completed)`);
          } else {
            console.log(`ℹ️ Schedule '${scheduleId}' already paused`);
          }
        } else {
          console.log(`⏳ Workflow '${workflowId}' is still ${wfDesc.status.name}`);
        }
      } catch (err: any) {
        if (err.message.includes('NotFound')) {
          console.warn(`⚠️ Workflow '${workflowId}' not found — maybe not started yet?`);
        } else {
          throw err;
        }
      }
    }
  } finally {
    await client.connection.close();
    console.log('🔌 Client connection closed');
  }
}
