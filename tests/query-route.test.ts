import test from "node:test";
import assert from "node:assert/strict";
import { POST } from "../app/api/query/route";

const jsonRequest = (payload: unknown) =>
  new Request("http://localhost/api/query", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "content-type": "application/json" },
  });

test("responds with 400 when query is missing", async () => {
  const response = await POST(jsonRequest({}));

  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.error, "Query is required");
});

test("returns results payload when query is provided", async () => {
  const response = await POST(jsonRequest({ query: "test" }));

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.deepEqual(body, { results: [] });
});
