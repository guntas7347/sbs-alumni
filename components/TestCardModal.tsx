"use client";

import { useState } from "react";
import { X, CreditCard, Copy, Check } from "lucide-react";

export default function TestCardModal() {
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState("");

  const card = {
    name: "Test Card",
    network: "VISA",
    country: "INDIA",
    number: "4100 2800 0000 1007",
    cvv: "123",
    expiry: "12/30",
  };

  async function copyValue(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed right-4 top-4 z-[9999] rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-lg"
      >
        Show test card
      </button>
    );
  }

  return (
    <div className="fixed inset-x-0 top-0 z-[9999] flex justify-center px-3 pt-3">
      <section
        role="dialog"
        aria-label="Test card details"
        className="w-full max-w-xl rounded-2xl border border-white/10 bg-gray-950 text-white shadow-2xl shadow-black/30"
      >
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-semibold">Test Card</span>
            <span className="rounded-md bg-blue-500/15 px-2 py-1 text-xs font-medium text-blue-300">
              DEMO
            </span>
          </div>

          <button
            onClick={() => setOpen(false)}
            aria-label="Close test card modal"
            className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400">
                Network
              </p>
              <p className="mt-1 font-semibold">VISA · INDIA</p>
            </div>
            <span className="text-xl font-black italic tracking-wider text-blue-400">
              VISA
            </span>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-widest text-gray-400">
              Card number
            </p>
            <button
              onClick={() =>
                copyValue("number", card.number.replaceAll(" ", ""))
              }
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10"
            >
              <span className="font-mono text-lg tracking-wider">
                {card.number}
              </span>
              {copied === "number" ? (
                <Check className="h-4 w-4 shrink-0 text-green-400" />
              ) : (
                <Copy className="h-4 w-4 shrink-0 text-gray-400" />
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "CVV", value: card.cvv },
              { label: "EXPIRY", value: card.expiry },
            ].map(({ label, value }) => (
              <button
                key={label}
                onClick={() => copyValue(label, value)}
                className="rounded-xl border border-white/10 bg-white/5 p-3 text-left transition hover:bg-white/10"
              >
                <span className="block text-xs tracking-widest text-gray-400">
                  {label}
                </span>
                <span className="mt-1 flex items-center justify-between font-mono text-base">
                  {value}
                  {copied === label ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-500" />
                  )}
                </span>
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-500">
            For payment integration testing only. Use your provider's official
            test environment.
          </p>
        </div>
      </section>
    </div>
  );
}
