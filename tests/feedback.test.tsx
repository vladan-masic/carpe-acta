// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { CompletionFeedback } from "../src/components/CompletionFeedback";
import { completionStorageKey, loadCompletions, saveCompletion, saveCompletionFeedback } from "../src/utils/completions";
import { saveAccountFeedback } from "../src/completions/feedback";
vi.mock("../src/completions/feedback", () => ({ saveAccountFeedback: vi.fn() }));
const record = { id: "event-one", tipId: "two-minute-start", completedAt: "2026-10-01T12:00:00Z" };
const client = {} as SupabaseClient;
beforeEach(() => { localStorage.clear(); vi.resetAllMocks(); vi.mocked(saveAccountFeedback).mockResolvedValue(); });
afterEach(cleanup);
it("adds and changes local feedback without adding completions or changing their dates", () => {
  saveCompletion(record);
  expect(saveCompletionFeedback(record.id, false)).toBe(true);
  expect(loadCompletions().records).toEqual([{ ...record, feedback: false }]);
  expect(saveCompletionFeedback(record.id, true)).toBe(true);
  expect(loadCompletions().records).toEqual([{ ...record, feedback: true }]);
});
it("does not create orphan feedback or replace corrupt history", () => {
  expect(saveCompletionFeedback("missing", true)).toBe(false);
  localStorage.setItem(completionStorageKey, "broken");
  expect(saveCompletionFeedback(record.id, false)).toBe(false);
  expect(localStorage.getItem(completionStorageKey)).toBe("broken");
});
it("leaves feedback unset until the user answers, then persists guest feedback", async () => {
  saveCompletion(record);
  const onSaved = vi.fn();
  render(<CompletionFeedback record={record} owner={null} client={null} locale="en" onSaved={onSaved} />);
  expect(loadCompletions().records[0].feedback).toBeUndefined();
  fireEvent.click(screen.getByRole("button", { name: "Not helpful this time" }));
  await waitFor(() => expect(screen.getByRole("status").textContent).toContain("Feedback saved"));
  expect(loadCompletions().records[0].feedback).toBe(false);
  expect(onSaved).toHaveBeenCalledOnce();
  expect(saveAccountFeedback).not.toHaveBeenCalled();
});
it("reports failure and retries the same completion without modifying guest data", async () => {
  vi.mocked(saveAccountFeedback).mockRejectedValueOnce(new Error("offline"));
  render(<CompletionFeedback record={record} owner="alice" client={client} locale="en" onSaved={() => {}} />);
  fireEvent.click(screen.getByRole("button", { name: "Helped me start" }));
  await waitFor(() => expect(screen.getByRole("status").textContent).toContain("Couldn’t save"));
  expect(screen.getByRole("button", { name: "Helped me start" }).getAttribute("aria-pressed")).toBe("false");
  fireEvent.click(screen.getByRole("button", { name: "Helped me start" }));
  await waitFor(() => expect(screen.getByRole("status").textContent).toContain("Feedback saved"));
  expect(saveAccountFeedback).toHaveBeenLastCalledWith(client, "alice", record.id, true);
  expect(localStorage.getItem(completionStorageKey)).toBeNull();
});
it("ignores pending feedback after the completion component unmounts", async () => {
  let finish!: () => void;
  vi.mocked(saveAccountFeedback).mockReturnValue(new Promise<void>((resolve) => { finish = resolve; }));
  const onSaved = vi.fn();
  const { unmount } = render(<CompletionFeedback record={record} owner="alice" client={client} locale="en" onSaved={onSaved} />);
  fireEvent.click(screen.getByRole("button", { name: "Helped me start" }));
  fireEvent.click(screen.getByRole("button", { name: "Helped me start" }));
  expect(saveAccountFeedback).toHaveBeenCalledOnce();
  unmount(); await act(async () => finish());
  expect(onSaved).not.toHaveBeenCalled();
});
it("preserves selection while translating the prompt into Serbian", async () => {
  saveCompletion(record);
  const props = { record, owner: null, client: null, onSaved: () => {} };
  const { rerender } = render(<CompletionFeedback {...props} locale="en" />);
  fireEvent.click(screen.getByRole("button", { name: "Helped me start" }));
  await waitFor(() => expect(screen.getByRole("status").textContent).toContain("Feedback saved"));
  rerender(<CompletionFeedback {...props} locale="sr-Latn" />);
  expect(screen.getByRole("button", { name: "Pomoglo mi je da počnem" }).getAttribute("aria-pressed")).toBe("true");
});
