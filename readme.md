# ⏱️ Temporal One-Time Scheduler

## 🧾 Code-Based Project Summary

This project implements a **Temporal-based one-time workflow scheduling system** that allows pre-configured actions (like sending emails or logging events) to be executed relative to a future event (e.g. a user's check-in time). It also supports automatic cleanup (pause or delete) of completed schedules.

Temporal Code Exchange - https://temporal.io/code-exchange/one-time-schedule-based-workflow-triggering

---

## 🧩 Folder Structure

```
.
├── activities
│   └── index.ts                          # Activity handlers (e.g., send email, pause schedule)
├── createPauseMonitorSchedule.ts        # Creates daily watcher schedule (for cleanup)
├── createSchedule.ts                    # Creates a one-time schedule to run a workflow
├── package-lock.json
├── package.json
├── readme.md
├── scheduleWatcher.ts                   # Manually inspects and pauses completed schedules
├── tsconfig.json
├── worker.ts                            # Temporal worker: runs workflows and activities
└── workflow
    ├── index.ts                         # Re-exports workflows for bundling
    ├── osExecuteAutoTriggerActions.ts   # Main workflow for executing scheduled actions
    └── pauseSchedulesWithCompletedWorkflows.ts  # Workflow to pause completed schedules
```

---

## 🧩 Code Components

### ✅ 1. `createSchedule.ts`

Creates a **one-time schedule** that will trigger a workflow at a specific time.

- Uses `@temporalio/client`
- Dynamically generates a cron string for the exact trigger moment
- Passes `actions` and `data` to the workflow
- Assigns unique `scheduleId` and `workflowId`

---

### ✅ 2. `workflow/osExecuteAutoTriggerActions.ts`

The core workflow that gets executed by the schedule:

- Iterates over `actions` and calls an activity
- Relays logic to `handleAutoTriggerActions()` (defined in `activities/index.ts`)
- Example actions: log event, send email (mocked)

---

### ✅ 3. `workflow/pauseSchedulesWithCompletedWorkflows.ts`

This is a **workflow version of the schedule watcher**:

- Runs the same logic as `scheduleWatcher.ts`
- Queries all schedules
- If any schedule’s last workflow is `COMPLETED`, it pauses that schedule
- Used in scheduled cleanups (e.g. daily cleanup via Temporal)

---

### ✅ 4. `activities/index.ts`

- Hosts all **activity functions**
- Currently includes:
  - `handleAutoTriggerActions`
  - `pauseCompletedSchedules` (used by watcher logic or workflow cleanup)

---

### ✅ 5. `worker.ts`

- Starts a Temporal worker on the `auto-triggers` task queue
- Registers all workflows and activities
- Uses `workflowsPath` pointing to `workflow/index.ts`

---

### ✅ 6. `scheduleWatcher.ts`

- Manually run checker that:
  - Lists all schedules
  - Finds the last executed workflow ID from `.info.recentActions[0]`
  - If the workflow is `COMPLETED`, it **pauses** the schedule

---

### ✅ 7. `createPauseMonitorSchedule.ts`

- Sets up a **daily scheduled workflow** that runs `pauseSchedulesWithCompletedWorkflows`
- This workflow uses the same watcher logic from above, but as a Temporal workflow
- Prevents leftover active schedules from piling up

---

## 🔄 Runtime Flow

1. **Create a schedule** with `createSchedule.ts`
2. Workflow (`osExecuteAutoTriggerActions`) is triggered at the specified time
3. Workflow executes its logic via activity
4. Optionally, run `scheduleWatcher.ts` or the scheduled `pauseSchedulesWithCompletedWorkflows` workflow to pause completed schedules

---

## ✅ Prerequisites

- Temporal installed via [`brew install temporal`](https://docs.temporal.io)
- Node.js + TypeScript
- ESM support configured:
  - "type": "module" in `package.json`
  - "module": "esnext" in `tsconfig.json`
- Dependencies installed:
  ```bash
  npm install
  ```

---

## 🧪 Terminal Setup (3-Terminal Layout)

| Terminal | Purpose                       | Command                                            |
| -------- | ----------------------------- | -------------------------------------------------- |
| 1        | Temporal server               | `temporalite start` or `temporal server start-dev` |
| 2        | Worker (runs workflows)       | `npx ts-node --esm worker.ts`                      |
| 3        | Create schedule               | `npx ts-node --esm createSchedule.ts`              |
| 4 (opt.) | Watcher (pause cleanup)       | `npx ts-node --esm scheduleWatcher.ts`             |
| 5 (opt.) | Schedule the watcher workflow | `npx ts-node --esm createPauseMonitorSchedule.ts`  |


---

## 🕒 Create a One-Time Workflow

```bash
npx ts-node --esm createSchedule.ts
```

Inside the script:

```ts
const triggerTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
```

---

## 🛑 (Optional) Cleanup via Watcher

**Manually** run this to pause completed workflows:

```bash
npx ts-node --esm scheduleWatcher.ts
```
This script:

* Lists all schedules
* Extracts the most recent workflowId
* If the workflow is `COMPLETED`, it pauses the schedule

Or run once daily by scheduling via:

```bash
npx ts-node --esm createPauseMonitorSchedule.ts
```

This ensures stale schedules don’t accumulate over time.

---

## ✅ Summary

This project supports:

- One-time workflow execution via Temporal schedules
- Dynamic configuration of actions and metadata
- Post-run cleanup through either a watcher script or a scheduled cleanup workflow
