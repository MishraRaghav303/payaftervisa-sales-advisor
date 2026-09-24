"use client";

import { useEffect, useState } from "react";

type CustomerRow = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  createdAt: string;
  destinationCountry: string | null;
  leadStatus: string | null;
  totalCostUsd: string;
};

type Detail = {
  customer: CustomerRow;
  messages: { id: string; role: string; content: string; createdAt: string }[];
  profile: Record<string, unknown> | null;
  leads: Record<string, unknown>[];
  usage: { model: string; inputTokens: number; outputTokens: number; estimatedCostUsd: string; purpose: string }[];
  totalCostUsd: number;
};

export default function AdminPage() {
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);

  useEffect(() => {
    fetch("/api/admin/conversations")
      .then((r) => r.json())
      .then((data) => setRows(data.customers ?? []));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    fetch(`/api/admin/conversations/${selectedId}`)
      .then((r) => r.json())
      .then((data) => setDetail(data));
  }, [selectedId]);

  return (
    <div className="flex h-screen font-sans text-sm">
      <div className="w-96 overflow-y-auto border-r border-neutral-200">
        <h1 className="border-b border-neutral-200 px-4 py-3 text-base font-semibold">
          Conversations
        </h1>
        {rows.map((row) => (
          <button
            key={row.id}
            onClick={() => setSelectedId(row.id)}
            className={`block w-full border-b border-neutral-100 px-4 py-3 text-left hover:bg-neutral-50 ${
              selectedId === row.id ? "bg-neutral-100" : ""
            }`}
          >
            <div className="font-medium">{row.name ?? "Unnamed customer"}</div>
            <div className="text-xs text-neutral-500">
              {row.destinationCountry ?? "no destination yet"} ·{" "}
              {row.leadStatus ?? "no lead yet"} · ${Number(row.totalCostUsd).toFixed(4)}
            </div>
          </button>
        ))}
        {rows.length === 0 && (
          <div className="px-4 py-6 text-neutral-400">No conversations yet.</div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {!detail && <div className="text-neutral-400">Select a conversation.</div>}
        {detail && (
          <div className="space-y-6">
            <section>
              <h2 className="mb-2 font-semibold">Customer details</h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-neutral-700">
                <div>Name: {detail.customer.name ?? "-"}</div>
                <div>Email: {detail.customer.email ?? "-"}</div>
                <div>Phone: {detail.customer.phone ?? "-"}</div>
                <div>First seen: {new Date(detail.customer.createdAt).toLocaleString()}</div>
              </div>
            </section>

            <section>
              <h2 className="mb-2 font-semibold">Extracted profile</h2>
              <pre className="whitespace-pre-wrap rounded bg-neutral-100 p-3 text-xs">
                {JSON.stringify(detail.profile, null, 2)}
              </pre>
            </section>

            <section>
              <h2 className="mb-2 font-semibold">Lead records</h2>
              {detail.leads.length === 0 && (
                <div className="text-neutral-400">No lead created yet.</div>
              )}
              {detail.leads.map((lead, i) => (
                <pre
                  key={i}
                  className="mb-2 whitespace-pre-wrap rounded bg-neutral-100 p-3 text-xs"
                >
                  {JSON.stringify(lead, null, 2)}
                </pre>
              ))}
            </section>

            <section>
              <h2 className="mb-2 font-semibold">
                AI cost — total ${detail.totalCostUsd.toFixed(6)}
              </h2>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="py-1">Model</th>
                    <th>Purpose</th>
                    <th>Input tok</th>
                    <th>Output tok</th>
                    <th>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.usage.map((u, i) => (
                    <tr key={i} className="border-b border-neutral-100">
                      <td className="py-1">{u.model}</td>
                      <td>{u.purpose}</td>
                      <td>{u.inputTokens}</td>
                      <td>{u.outputTokens}</td>
                      <td>${Number(u.estimatedCostUsd).toFixed(6)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="mb-2 font-semibold">Transcript</h2>
              <div className="space-y-2">
                {detail.messages.map((m) => (
                  <div key={m.id}>
                    <span className="font-medium">{m.role}:</span> {m.content}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
