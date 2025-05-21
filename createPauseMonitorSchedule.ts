// createPauseMonitorSchedule.ts
import { Client, ScheduleOverlapPolicy } from '@temporalio/client';

const MONITOR_SCHEDULE_ID = 'pause-monitor-schedule';
const MONITOR_WORKFLOW_ID = 'pause-monitor-workflow';
const WORKFLOW_TYPE = 'pauseSchedulesWithCompletedWorkflows';
const TASK_QUEUE = 'auto-triggers';
const CRON = 'CRON_TZ=UTC 0 3 * * *'; // Run every day at 03:00 UTC

async function run() {
  const client = new Client();

  try {
    // 🔍 Check if the schedule already exists
    for await (const summary of client.schedule.list()) {
      if (summary.scheduleId === MONITOR_SCHEDULE_ID) {
        console.log(`✅ Schedule '${MONITOR_SCHEDULE_ID}' already exists. Skipping.`);
        return;
      }
    }

    // 🆕 Create the daily schedule
    await client.schedule.create({
      scheduleId: MONITOR_SCHEDULE_ID,
      action: {
        type: 'startWorkflow',
        workflowType: WORKFLOW_TYPE,
        workflowId: MONITOR_WORKFLOW_ID,
        taskQueue: TASK_QUEUE,
        args: [],
      },
      spec: {
        cronExpressions: [CRON],
      },
      policies: {
        overlap: ScheduleOverlapPolicy.SKIP,
      },
    });

    console.log(`📅 Created daily monitor schedule '${MONITOR_SCHEDULE_ID}' to run '${WORKFLOW_TYPE}' at: ${CRON}`);
  } finally {
    await client.connection.close();
    console.log('🔌 Client connection closed');
  }
}

run().catch((err) => {
  console.error('❌ Error creating pause-monitor schedule:', err);
  process.exit(1);
});
