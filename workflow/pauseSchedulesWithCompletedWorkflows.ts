// workflow/pauseSchedulesWithCompletedWorkflows.ts
import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

const { pauseCompletedSchedules } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 minutes',
});

export async function pauseSchedulesWithCompletedWorkflows() {
  console.log('🚀 pauseSchedulesWithCompletedWorkflows workflow started');
  await pauseCompletedSchedules();
  console.log('✅ pauseSchedulesWithCompletedWorkflows workflow completed');
}

// // workflow/pauseSchedulesWithCompletedWorkflows.ts
// import { Client } from '@temporalio/client';

// export async function pauseSchedulesWithCompletedWorkflows() {
//   const client = new Client();

//   try {
//     for await (const summary of client.schedule.list()) {
//       const scheduleId = summary.scheduleId;
//       const scheduleHandle = client.schedule.getHandle(scheduleId);
//       const scheduleDesc = await scheduleHandle.describe();

//       const action = scheduleDesc.action;
//       const workflowId = action?.type === 'startWorkflow' ? action.workflowId : undefined;

//       if (!workflowId) {
//         console.warn(`⚠️ Schedule '${scheduleId}' does not define a workflowId.`);
//         continue;
//       }

//       try {
//         const wfHandle = client.workflow.getHandle(workflowId);
//         const wfDesc = await wfHandle.describe();

//         if (wfDesc.status.name === 'COMPLETED') {
//           if (!scheduleDesc.state.paused) {
//             await scheduleHandle.pause(`Paused after workflow ${workflowId} completed`);
//             console.log(`⏸️ Paused schedule '${scheduleId}' (workflow '${workflowId}' completed)`);
//           } else {
//             console.log(`ℹ️ Schedule '${scheduleId}' already paused`);
//           }
//         } else {
//           console.log(`⏳ Workflow '${workflowId}' is still ${wfDesc.status.name}`);
//         }
//       } catch (err: any) {
//         if (err.message.includes('NotFound')) {
//           console.warn(`⚠️ Workflow '${workflowId}' not found — maybe not started yet?`);
//         } else {
//           throw err;
//         }
//       }
//     }
//   } finally {
//     await client.connection.close();
//     console.log('🔌 Client connection closed');
//   }
// }
