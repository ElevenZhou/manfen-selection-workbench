"use client";

import { useState } from "react";

export function FeishuPushButton({
  reportId,
  compact = false,
}: {
  reportId: string;
  compact?: boolean;
}) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function push() {
    if (state === "sending") return;
    const idempotencyKey = `${reportId}:manual:${crypto.randomUUID()}`;
    setState("sending");
    setMessage("");
    try {
      const response = await fetch(`/api/reports/${encodeURIComponent(reportId)}/feishu`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ idempotencyKey }),
      });
      const body = await response.json() as { message?: string; error?: string };
      if (!response.ok) throw new Error(body.error ?? body.message ?? "推送失败");
      setState("sent");
      setMessage(body.message ?? "已推送");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "推送失败");
    }
  }

  return (
    <div className={`feishu-push ${compact ? "compact" : ""}`}>
      <button type="button" onClick={push} disabled={state === "sending" || state === "sent"} aria-live="polite">
        <span aria-hidden="true">{state === "sent" ? "✓" : "✦"}</span>
        {state === "sending" ? "推送中…" : state === "sent" ? "已推送飞书" : "推送飞书"}
      </button>
      {message ? <small className={state === "error" ? "error" : ""}>{message}</small> : null}
    </div>
  );
}
