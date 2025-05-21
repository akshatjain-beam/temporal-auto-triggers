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
