import assert from "node:assert";
import { InMemoryMailbox } from "../inmemory-mailbox";
import { ActorMessage } from "../message";

function createMessage(id: string): ActorMessage {
  return {
    message_id: id,
    type: "TestMessage",
    source: "test-suite",
    target: "runtime",
    timestamp: new Date().toISOString(),
    payload: { id },
  };
}

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (err) {
    console.error(`✗ ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

test("enqueue increases size", () => {
  const mailbox = new InMemoryMailbox();

  assert.strictEqual(mailbox.size(), 0);

  mailbox.enqueue(createMessage("1"));
  mailbox.enqueue(createMessage("2"));

  assert.strictEqual(mailbox.size(), 2);
});

test("dequeue returns messages in FIFO order", () => {
  const mailbox = new InMemoryMailbox();

  mailbox.enqueue(createMessage("A"));
  mailbox.enqueue(createMessage("B"));

  assert.strictEqual(mailbox.dequeue()?.message_id, "A");
  assert.strictEqual(mailbox.dequeue()?.message_id, "B");
});

test("dequeue returns undefined when empty", () => {
  const mailbox = new InMemoryMailbox();

  assert.strictEqual(mailbox.dequeue(), undefined);
});

test("size reflects dequeue operations", () => {
  const mailbox = new InMemoryMailbox();

  mailbox.enqueue(createMessage("1"));
  mailbox.enqueue(createMessage("2"));

  assert.strictEqual(mailbox.size(), 2);

  mailbox.dequeue();
  assert.strictEqual(mailbox.size(), 1);

  mailbox.dequeue();
  assert.strictEqual(mailbox.size(), 0);
});

test("mailbox does not mutate message object", () => {
  const mailbox = new InMemoryMailbox();
  const msg = createMessage("immutable");

  mailbox.enqueue(msg);
  const out = mailbox.dequeue();

  assert.strictEqual(out, msg);
});
