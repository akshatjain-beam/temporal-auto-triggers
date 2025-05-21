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


// // src/workflows/osExecuteAutoTriggerActions.ts
// export interface AutoTriggerArgs {
//   actions: string[]; // you can refine this
//   data: Record<string, any>;
// }

// export async function osExecuteAutoTriggerActions({ actions, data }: AutoTriggerArgs) {
//   console.log('🚀 AutoTrigger Workflow started');
//   console.log('📦 Actions:', actions);
//   console.log('📄 Data:', data);

//   // Simulate doing something (send email, etc.)
//   for (const action of actions) {
//     console.log(`🔧 Executing action: ${action}`);
//   }

//   console.log('✅ AutoTrigger Workflow completed');
  
// }
