const assert = require('node:assert/strict')
const { createServer } = require('node:http')
const test = require('node:test')
const {
  TaskForgeClient,
} = require('../dist/modules/reports/taskforge/taskforge.client')

test('submits an idempotent minimal user-report HTTP job to TaskForge', async () => {
  let receivedRequest
  const server = createServer(async (request, response) => {
    const chunks = []
    for await (const chunk of request) chunks.push(chunk)
    receivedRequest = {
      method: request.method,
      url: request.url,
      headers: request.headers,
      body: JSON.parse(Buffer.concat(chunks).toString('utf8')),
    }

    response.writeHead(201, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({
      id: '8d4e1fc4-f4c0-4c50-bd77-c51daf2f41d2',
      status: 'Queued',
    }))
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))

  const previousTaskForgeUrl = process.env.TASKFORGE_URL
  const previousCallbackUrl = process.env.TASKFORGE_USER_REPORT_CALLBACK_BASE_URL

  try {
    const address = server.address()
    process.env.TASKFORGE_URL = `http://127.0.0.1:${address.port}`
    process.env.TASKFORGE_USER_REPORT_CALLBACK_BASE_URL = 'http://127.0.0.1:5000'
    const client = new TaskForgeClient()
    const job = await client.submitUserReport({
      id: '42',
      type: 'incorrect-content',
      title: 'Private report title',
      description: 'Private report description',
      pagePath: '/database/items/19019',
      status: 'pending',
      createdAt: '2026-07-28T12:00:00.000Z',
      taskForgeSubmissionStatus: 'pending',
      taskForgeSubmissionAttempts: 0,
    })

    assert.deepEqual(job, {
      id: '8d4e1fc4-f4c0-4c50-bd77-c51daf2f41d2',
      status: 'Queued',
    })
    assert.equal(receivedRequest.method, 'POST')
    assert.equal(receivedRequest.url, '/api/jobs')
    assert.equal(
      receivedRequest.headers['idempotency-key'],
      'wowiki-user-report-42',
    )
    assert.deepEqual(receivedRequest.body, {
      type: 'http-request',
      priority: 'Normal',
      payload: {
        url: 'http://127.0.0.1:5000/api/internal/taskforge/user-reports/42/ready',
        method: 'POST',
        body: {
          reportId: '42',
          externalReference: 'WOW-42',
        },
        headers: {
          'X-TaskForge-Source': 'wowiki-user-reports',
        },
      },
      maxRetries: 3,
      timeoutSeconds: 10,
    })
    assert.equal(JSON.stringify(receivedRequest.body).includes('Private report'), false)
  } finally {
    if (previousTaskForgeUrl === undefined) {
      delete process.env.TASKFORGE_URL
    } else {
      process.env.TASKFORGE_URL = previousTaskForgeUrl
    }
    if (previousCallbackUrl === undefined) {
      delete process.env.TASKFORGE_USER_REPORT_CALLBACK_BASE_URL
    } else {
      process.env.TASKFORGE_USER_REPORT_CALLBACK_BASE_URL = previousCallbackUrl
    }
    await new Promise((resolve, reject) => server.close((error) => (
      error ? reject(error) : resolve()
    )))
  }
})
