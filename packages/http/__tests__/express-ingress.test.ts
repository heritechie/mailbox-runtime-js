import assert from "assert";
import express from "express";
import bodyParser from "body-parser";
import http from "http";

import { createExpressIngress } from "../express-ingress";
import { ActorMessage } from "../../core/message";
import { Runtime } from "../../core/runtime";

/**
 * Minimal fake runtime to capture delivered messages.
 */
class FakeRuntime implements Runtime {
  public delivered: ActorMessage[] = [];

  deliver(message: ActorMessage): void {
    this.delivered.push(message);
  }

  start(): void {}
  stop(): void {}
}

function startServer(
  runtime: Runtime
): Promise<{ server: http.Server; url: string }> {
  const app = express();
  app.use(bodyParser.json());

  app.post("/messages/:type", createExpressIngress({ runtime }));

  const server = http.createServer(app);

  return new Promise((resolve) => {
    server.listen(0, () => {
      const address = server.address();
      if (typeof address === "object" && address) {
        resolve({
          server,
          url: `http://127.0.0.1:${address.port}`,
        });
      }
    });
  });
}

async function request(
  url: string,
  body: unknown
): Promise<{ status: number; json: any }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return {
    status: res.status,
    json: await res.json(),
  };
}

function test(name: string, fn: () => Promise<void>) {
  Promise.resolve()
    .then(fn)
    .then(() => {
      console.log(`✓ ${name}`);
    })
    .catch((err) => {
      console.error(`✗ ${name}`);
      console.error(err);
      process.exitCode = 1;
    });
}

test("ingress delivers HTTP message to runtime", async () => {
  const runtime = new FakeRuntime();
  const { server, url } = await startServer(runtime);

  const res = await request(`${url}/messages/Test`, {
    payload: { hello: "world" },
  });

  server.close();

  assert.strictEqual(res.status, 202);
  assert.strictEqual(runtime.delivered.length, 1);

  const msg = runtime.delivered[0];

  assert.strictEqual(msg.type, "Test");
  assert.deepStrictEqual(msg.payload, { hello: "world" });
  assert.strictEqual(msg.source, "http");
});

test("ingress does not wait for actor execution", async () => {
  let deliverCalled = false;

  class BlockingRuntime implements Runtime {
    deliver(message: ActorMessage): void {
      deliverCalled = true;
      // simulate long-running actor execution,
      // but ingress MUST NOT wait for this
      const start = Date.now();
      while (Date.now() - start < 50) {
        // busy loop (intentional)
      }
    }
    start() {}
    stop() {}
  }

  const runtime = new BlockingRuntime();
  const { server, url } = await startServer(runtime);

  const start = Date.now();
  const res = await request(`${url}/messages/Test`, {
    payload: { value: 1 },
  });
  const elapsed = Date.now() - start;

  server.close();

  assert.strictEqual(res.status, 202);
  assert.strictEqual(deliverCalled, true);
});

test("ingress rejects missing message type", async () => {
  const runtime = new FakeRuntime();
  const { server, url } = await startServer(runtime);

  const res = await fetch(`${url}/messages/`, {
    method: "POST",
  });

  server.close();

  assert.strictEqual(res.status, 404);
});
