// worker.ts (ESM style)
import { Worker } from '@temporalio/worker';

async function run() {
  const worker = await Worker.create({
    workflowsPath: new URL('./workflow/osExecuteAutoTriggerActions.ts', import.meta.url).pathname,
    taskQueue: 'auto-triggers',
  });

  console.log('👷 Worker started. Listening for workflows...');
  await worker.run();
}

run().catch((err) => {
  console.error('❌ Worker error:', err);
  process.exit(1);
});
