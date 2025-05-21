// // worker.ts
// import { Worker } from '@temporalio/worker';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import * as activities from './activities/index.ts';

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// async function run() {
//   const worker = await Worker.create({
//     // workflowsPath: path.join(__dirname, 'workflow'), // 👈 includes all workflows in /workflow
//     workflowsPath: new URL('./workflow', import.meta.url).pathname,
//     activities,
//     taskQueue: 'auto-triggers',
//   });

//   console.log('👷 Worker started. Listening for workflows...');
//   await worker.run();
// }

// run().catch((err) => {
//   console.error('❌ Worker error:', err);
//   process.exit(1);
// });



// worker.ts
import { Worker } from '@temporalio/worker';
import path from 'path';
import { fileURLToPath } from 'url';
import * as activities from './activities/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const worker = await Worker.create({
    workflowsPath: path.join(__dirname, 'workflow'), // ✅ Use path.join to avoid file:// issues
    activities,
    taskQueue: 'auto-triggers',
  });

  console.log('👷 Worker started. Listening for workflows...');
  await worker.run();
}

run().catch((err) => {
  console.error('❌ Worker error:', err);
  process.exit(1);
});
