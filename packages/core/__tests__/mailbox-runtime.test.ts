import assert from "assert";

import { InMemoryMailbox } from "../inmemory-mailbox";
import { MailboxRuntime } from "../mailbox-runtime";
import { ActorMessage } from "../message";

function createMessage(id: string, type = "Test"): ActorMessage {
  return {
    message_id: id,
    type,
    source: "test-suite",
    target: "runtime",
    timestamp: new Date().toISOString(),
    payload: { id },
  };
}

async function suppressConsoleError(fn: () => Promise<void>) {
  const original = console.error;
  console.error = () => {};
  try {
    await fn();
  } finally {
    console.error = original;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function test(name: string, fn: () => Promise<void> | void) {
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

test("runtime processes enqueued message", async () => {
  const mailbox = new InMemoryMailbox();
  const runtime = new MailboxRuntime({ mailbox, idleDelayMs: 1 });

  let handled = false;

  runtime.register("Test", {
    async handle() {
      handled = true;
    },
  });

  runtime.start();

  runtime.deliver(createMessage("1"));

  await delay(10);

  runtime.stop();

  assert.strictEqual(handled, true);
});

test("runtime processes messages sequentially", async () => {
  const mailbox = new InMemoryMailbox();
  const runtime = new MailboxRuntime({ mailbox, idleDelayMs: 1 });

  const order: string[] = [];

  runtime.register("Test", {
    async handle(msg) {
      order.push(msg.message_id);
      await delay(5);
    },
  });

  runtime.start();

  runtime.deliver(createMessage("A"));
  runtime.deliver(createMessage("B"));
  runtime.deliver(createMessage("C"));

  await delay(30);

  runtime.stop();

  assert.deepStrictEqual(order, ["A", "B", "C"]);
});

test("runtime survives actor error", async () => {
  await suppressConsoleError(async () => {
    const mailbox = new InMemoryMailbox();
    const runtime = new MailboxRuntime({ mailbox, idleDelayMs: 1 });

    let successHandled = false;

    runtime.register("Fail", {
      async handle() {
        throw new Error("boom");
      },
    });

    runtime.register("Success", {
      async handle() {
        successHandled = true;
      },
    });

    runtime.start();

    runtime.deliver(createMessage("1", "Fail"));
    runtime.deliver(createMessage("2", "Success"));

    await delay(20);

    runtime.stop();

    assert.strictEqual(successHandled, true);
  });
});

test("deliver does not block on actor execution", async () => {
  const mailbox = new InMemoryMailbox();
  const runtime = new MailboxRuntime({ mailbox, idleDelayMs: 1 });

  runtime.register("Slow", {
    async handle() {
      await delay(20);
    },
  });

  runtime.start();

  const start = Date.now();
  runtime.deliver(createMessage("1", "Slow"));
  const elapsed = Date.now() - start;

  runtime.stop();

  assert.ok(elapsed < 5, "deliver() should not block");
});
