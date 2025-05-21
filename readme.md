## 🧾 Code-Based Project Summary

This project implements a **Temporal-based one-time workflow scheduling system** that allows pre-configured actions (like sending emails or logging events) to be executed relative to a future event (e.g. a user's check-in time).

---

## 🧩 Components in Code

### 1. `createSchedule.ts`

* **Purpose**: Creates a one-time Temporal schedule to run a specific workflow at a calculated future time.
* **Key logic**:

  * Computes a `triggerTime` (e.g., `Date.now() + 1 hour`)
  * Constructs a one-off **cron expression** using that time
  * Schedules the `osExecuteAutoTriggerActions` workflow with:

    * `actions`: e.g., `["sendEmail", "logEvent"]`
    * `data`: arbitrary input like `{ userId, note }`
  * Assigns a unique `scheduleId` and `workflowId`

---

### 2. `workflow/osExecuteAutoTriggerActions.ts`

* **Purpose**: Executes the triggered automation logic.
* **Key logic**:

  * Iterates over `actions` and performs logic (mocked for now)
  * After completion, calls an **activity** to delete the schedule (`deleteSchedule(scheduleId)`)
  * This is done using `proxyActivities` to avoid using `@temporalio/client` inside the workflow

---

### 3. `worker.ts`

* **Purpose**: Runs the Temporal worker that:

  * Listens on the `auto-triggers` task queue
  * Executes workflows and activities
* **Config**:

  * Uses `workflowsPath` to include your workflow code
  * Registers `activities` for external operations

---

### 4. `scheduleWatcher.ts`

* **Purpose**: Monitors all schedules to:

  * Fetch their most recent `workflowId` from `scheduleDesc.info.recentActions[0]`
  * Check if the workflow has **COMPLETED**
  * If so, it **pauses** the schedule (to avoid clutter and accidental re-triggers)

---

## 🔄 Runtime Flow

1. You run `createSchedule.ts` → a schedule is created to run 1 hour from now.
2. When the time arrives, Temporal triggers the workflow (`osExecuteAutoTriggerActions`).
3. The workflow executes its `actions[]`, then calls an activity to **delete its own schedule**.
4. Alternatively, `scheduleWatcher.ts` can detect that the workflow has finished and **pause** the schedule.

---

## ✅ Result

You now have a full, deterministic Temporal system that:

* Creates one-time schedules based on time
* Executes dynamic logic on trigger
* Cleans itself up automatically or via a watcher

---
---

## ✅ Prerequisites

Make sure you've:

* Installed Temporal via [`brew install temporal`](https://docs.temporal.io)
* Installed dependencies (`npm install`)
* Configured your project with:

  * `package.json` with `"type": "module"`
  * TypeScript support via `ts-node` and proper `"module": "esnext"` in `tsconfig.json`

---

## ✅ Terminal Setup (3-Terminal Layout)

### 🚪 **Terminal 1: Start Temporal Server**

If using **Temporalite**:

```bash
temporalite start
```

Or using **full dev server**:

```bash
temporal server start-dev
```

This launches the Temporal backend at `localhost:7233`.

---

### 👷 **Terminal 2: Start Worker**

```bash
npx ts-node --esm worker.ts
```

This runs your `worker.ts`, which listens on the `auto-triggers` task queue to execute workflows.

---

### 🕐 **Terminal 3: Create Schedule**

Create a one-time schedule to run a workflow 1 hour from now:

```bash
npx ts-node --esm createSchedule.ts
```

✔️ Make sure your `createSchedule.ts` includes variable `triggerTime`, for Example:

```ts
const triggerTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
```

---

## 🔁 (Optional) Monitor & Pause Completed Schedules

You can run the schedule watcher **manually** or via cron to auto-pause one-time schedules after they complete:

```bash
npx ts-node --esm scheduleWatcher.ts
```

This script:

* Lists all schedules
* Extracts the most recent workflowId
* If the workflow is `COMPLETED`, it pauses the schedule

---

## ✅ Summary Table

| Terminal | Purpose                 | Command                                            |
| -------- | ----------------------- | -------------------------------------------------- |
| 1        | Temporal server         | `temporalite start` or `temporal server start-dev` |
| 2        | Worker (runs workflows) | `npx ts-node --esm worker.ts`                      |
| 3        | Create schedule         | `npx ts-node --esm createSchedule.ts`              |
| 4 (opt.) | Watcher (pause cleanup) | `npx ts-node --esm scheduleWatcher.ts`             |
