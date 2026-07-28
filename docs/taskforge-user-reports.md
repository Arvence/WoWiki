# TaskForge user-report integration

WoWiki uses [Arvence/TaskForge](https://github.com/Arvence/TaskForge) as a
durable background job processor. User content reports are the first integrated
workflow. Technical bug reports remain separate.

## Flow

```text
Browser
  -> POST /api/reports
  -> WoWiki saves the complete report in SQLite
  -> WoWiki submits an idempotent http-request job to TaskForge
  -> TaskForge calls WoWiki's private moderation-intake endpoint
  -> WoWiki marks the report ready-for-review
```

The public request does not wait for TaskForge. A report remains saved even
when TaskForge is unavailable.

TaskForge receives only the WoWiki report ID and stable `WOW-{reportId}`
reference. Titles, descriptions, and other user content stay in WoWiki's
database because TaskForge exposes job payloads through its job API.

## TaskForge job

WoWiki submits:

- type: `http-request`
- priority: `Normal`
- idempotency key: `wowiki-user-report-{reportId}`
- maximum retries: `3`
- timeout: `10` seconds
- callback: `POST /api/internal/taskforge/user-reports/{reportId}/ready`

TaskForge retries callback failures and applies its normal dead-letter rules.
The callback is idempotent.

## Network boundary

TaskForge v1 is designed for a trusted local or private network and does not
provide authentication. WoWiki therefore does not expose the callback through
its public YARP gateway: all `/api/internal/*` requests receive `404`.

TaskForge calls the NestJS backend directly over its private address. Do not
route the callback through the public gateway and do not place credentials in
the TaskForge job payload or headers.

The callback host must appear in TaskForge's
`HttpRequestJobs:AllowedHosts` configuration. The local defaults already allow
`127.0.0.1` and `localhost`.

## WoWiki configuration

| Environment variable | Default | Purpose |
| --- | --- | --- |
| `TASKFORGE_URL` | `http://127.0.0.1:8275` | TaskForge API base URL |
| `TASKFORGE_USER_REPORT_CALLBACK_BASE_URL` | `http://127.0.0.1:5000` | Private WoWiki backend address reachable by TaskForge |
| `TASKFORGE_SUBMISSION_TIMEOUT_MS` | `3000` | WoWiki-to-TaskForge submission timeout |

## Stored state

WoWiki records the submission status, attempt count, TaskForge job ID, initial
job status, last submission time, and a bounded error message. Existing or
failed reports without a job ID remain discoverable for later resubmission.

Automatic resubmission when TaskForge is unavailable, polling TaskForge job
status, and webhook-driven terminal-state synchronization are not part of this
first integration.
