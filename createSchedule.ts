// createSchedule.ts
import { Client, ScheduleOverlapPolicy } from '@temporalio/client';

async function run() {
  const client = new Client();

  // Input values (normally come from CMS/config)
  const userJourneyId = 'test-user-123';
  const triggerTime = new Date(Date.now() + 5000); // 5 seconds from now
  // const triggerTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
  
  const uniqueSuffix = Date.now(); // makes ID unique per run
  const scheduleId = `auto-trigger-${userJourneyId}-${uniqueSuffix}`;

  // Convert trigger time to cron format: second minute hour day month dayOfWeek year
  const sec = triggerTime.getUTCSeconds();
  const min = triggerTime.getUTCMinutes();
  const hour = triggerTime.getUTCHours();
  const day = triggerTime.getUTCDate();
  const month = triggerTime.getUTCMonth() + 1; // month is 0-based
  const year = triggerTime.getUTCFullYear();

  const cron = `CRON_TZ=UTC ${sec} ${min} ${hour} ${day} ${month} * ${year}`;

  // Create the schedule
  await client.schedule.create({
    scheduleId,
    action: {
      type: 'startWorkflow',
      workflowType: 'osExecuteAutoTriggerActions', // Make sure this matches your registered workflow
      args: [{
        actions: ['sendEmail', 'logEvent'],
        data: { userId: 'abc123', note: 'Pre-checkin email' }
      }],
      taskQueue: 'auto-triggers',
    },
    spec: {
      cronExpressions: [cron],
    },
    policies: {
      overlap: ScheduleOverlapPolicy.SKIP,
    },
  });

  console.log(`✅ Created schedule '${scheduleId}' to fire at ${triggerTime.toISOString()}`);
  await client.connection.close();
}

run().catch((err) => {
  console.error('❌ Schedule error:', err);
  process.exit(1);
});
