import { test } from "node:test"
import assert from "node:assert/strict"
import worker from "../src/worker.js"

const page = new Response("<h1>mordle</h1>", { status: 200 })
const assets = { fetch: async () => page }

test("spor tap passes the asset response through and writes one redacted data point", async () => {
  const points = []
  const env = { ASSETS: assets, SPOR_ANALYTICS: { writeDataPoint: (p) => points.push(p) } }
  const request = new Request("https://mordle.damsleth.no/?seed=secret", {
    headers: { "user-agent": "Mozilla/5.0", referer: "https://example.com/from?token=abc" }
  })
  const response = await worker.fetch(request, env)
  assert.equal(response, page)
  assert.equal(points.length, 1)
  assert.deepEqual(points[0].indexes, ["mordle.damsleth.no"])
  assert.deepEqual(points[0].blobs, ["/", "https://example.com", "Mozilla/5.0", "", "200", "", "", "GET"])
  assert.doesNotMatch(JSON.stringify(points[0]), /secret|token/)
})

test("spor tap never breaks the site: missing binding or failing write", async () => {
  const request = new Request("https://mordle.damsleth.no/")
  assert.equal((await worker.fetch(request, { ASSETS: assets })).status, 200)
  const failing = { ASSETS: assets, SPOR_ANALYTICS: { writeDataPoint: () => { throw new Error("quota") } } }
  assert.equal((await worker.fetch(request, failing)).status, 200)
})
