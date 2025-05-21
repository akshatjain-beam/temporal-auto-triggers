// src/workflows/osExecuteAutoTriggerActions.ts
import { proxyActivities } from '@temporalio/workflow';

export interface AutoTriggerArgs {
  actions: string[]; // you can refine this
  data: Record<string, any>;
}

export async function osExecuteAutoTriggerActions({ actions, data }: AutoTriggerArgs) {
  console.log('🚀 AutoTrigger Workflow started');
  console.log('📦 Actions:', actions);
  console.log('📄 Data:', data);

  // Simulate doing something (send email, etc.)
  for (const action of actions) {
    console.log(`🔧 Executing action: ${action}`);
  }

  console.log('✅ AutoTrigger Workflow completed');
  
}
