// workflow/osExecuteAutoTriggerActions.ts
import { proxyActivities } from '@temporalio/workflow';
import * as activities from '../activities';

export interface AutoTriggerArgs {
  actions: string[];
  data: Record<string, any>;
}

const { handleAutoTriggerActions } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 minutes',
});

export async function osExecuteAutoTriggerActions({ actions, data }: AutoTriggerArgs) {
  console.log('🚀 osExecuteAutoTriggerActions workflow started');
  await handleAutoTriggerActions({ actions, data });
  console.log('✅ osExecuteAutoTriggerActions workflow completed');
}
