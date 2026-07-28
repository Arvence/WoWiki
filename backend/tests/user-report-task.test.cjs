const assert = require('node:assert/strict')
const { mkdtempSync, rmSync } = require('node:fs')
const { tmpdir } = require('node:os')
const { join } = require('node:path')
const test = require('node:test')
const { DatabaseService } = require('../dist/common/database/database.service')
const { ReportsService } = require('../dist/modules/reports/reports.service')
const {
  TaskForgeUserReportDispatcher,
} = require('../dist/modules/reports/taskforge/taskforge-user-report.dispatcher')

test('user reports move through TaskForge submission and moderation intake states', async () => {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'wowiki-reports-'))
  const databasePath = join(temporaryDirectory, 'reports.db')
  const previousDatabasePath = process.env.BACKEND_DATABASE_PATH
  let database

  try {
    process.env.BACKEND_DATABASE_PATH = databasePath
    database = new DatabaseService()
    const reports = new ReportsService(database)
    const report = reports.create({
      type: 'incorrect-content',
      title: 'Thunderfury source is incorrect',
      description: 'The listed source does not match the source shown in Classic.',
      pagePath: '/database/items/19019',
      targetType: 'item',
      targetId: '19019',
      targetTitle: 'Thunderfury, Blessed Blade of the Windseeker',
    })

    assert.equal(report.status, 'pending')
    assert.equal(report.taskForgeSubmissionStatus, 'pending')
    assert.equal(report.taskForgeSubmissionAttempts, 0)
    assert.equal(report.taskForgeJobId, undefined)
    assert.deepEqual(reports.findAwaitingTaskForgeSubmission(), [report])

    const taskForgeClient = {
      async submitUserReport() {
        return {
          id: '4a45db63-9d4e-4a1e-8310-68ec15598fb3',
          status: 'Queued',
        }
      },
    }
    const dispatcher = new TaskForgeUserReportDispatcher(
      reports,
      taskForgeClient,
    )
    const submittedReport = await dispatcher.dispatchNow(report.id)

    assert.equal(submittedReport.taskForgeSubmissionStatus, 'submitted')
    assert.equal(submittedReport.taskForgeSubmissionAttempts, 1)
    assert.equal(
      submittedReport.taskForgeJobId,
      '4a45db63-9d4e-4a1e-8310-68ec15598fb3',
    )
    assert.equal(submittedReport.taskForgeJobStatus, 'Queued')
    assert.deepEqual(reports.findAwaitingTaskForgeSubmission(), [])

    const readyReport = reports.markReadyForReview(report.id, `WOW-${report.id}`)
    assert.equal(readyReport.status, 'ready-for-review')
    assert.deepEqual(
      reports.markReadyForReview(report.id, `WOW-${report.id}`),
      readyReport,
    )
  } finally {
    database?.close()
    if (previousDatabasePath === undefined) {
      delete process.env.BACKEND_DATABASE_PATH
    } else {
      process.env.BACKEND_DATABASE_PATH = previousDatabasePath
    }
    rmSync(temporaryDirectory, { recursive: true, force: true })
  }
})

test('failed TaskForge submissions remain eligible for bounded resubmission', () => {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'wowiki-reports-'))
  const databasePath = join(temporaryDirectory, 'reports.db')
  const previousDatabasePath = process.env.BACKEND_DATABASE_PATH
  let database

  try {
    process.env.BACKEND_DATABASE_PATH = databasePath
    database = new DatabaseService()
    const reports = new ReportsService(database)
    let report = reports.create({
      type: 'missing-content',
      title: 'Item source is missing',
      description: 'The item page does not say which encounter drops this item.',
      pagePath: '/database/items/18832',
    })

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      report = reports.markTaskForgeSubmissionFailed(
        report.id,
        'TaskForge unavailable',
      )
      assert.equal(report.taskForgeSubmissionAttempts, attempt)
      assert.equal(
        reports.findAwaitingTaskForgeSubmission().length,
        attempt < 3 ? 1 : 0,
      )
    }
  } finally {
    database?.close()
    if (previousDatabasePath === undefined) {
      delete process.env.BACKEND_DATABASE_PATH
    } else {
      process.env.BACKEND_DATABASE_PATH = previousDatabasePath
    }
    rmSync(temporaryDirectory, { recursive: true, force: true })
  }
})
