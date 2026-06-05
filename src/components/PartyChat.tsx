"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Msg {
  role: "user" | "bot";
  text: string;
  links?: { label: string; href: string }[];
  suggestions?: string[];
}

const GREETING: Msg = {
  role: "bot",
  text: "Hi! I'm the Bounce FX party planner. Ask me about rentals, pricing, delivery, or tell me your guest count and I'll plan a setup.",
  suggestions: [
    "What do you rent?",
    "How much is a bounce house?",
    "I'm planning for 50 guests",
  ],
};

export default function PartyChat() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 9e9, behavior: "smooth" });
  }, [msgs, typing, open]);

  if (pathname?.startsWith("/admin")) return null;

  async function send(text: string) {
    const q = text.trim();
    if (!q || typing) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setTyping(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q }),
      });
      const data = await res.json();
      setMsgs((m) => [
        ...m,
        {
          role: "bot",
          text: data.reply ?? "Sorry, try again?",
          links: data.links,
          suggestions: data.suggestions,
        },
      ]);
    } catch {
      setMsgs((m) => [
        ...m,
        { role: "bot", text: "Hmm, I hit a snag — text us at 571-494-3903!" },
      ]);
    } finally {
      setTyping(false);
    }
  }

  return (
    <>
      {/* Launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full bg-party-ink px-5 py-3 font-display text-base font-bold italic text-white shadow-card transition-transform hover:-translate-y-0.5 lg:bottom-6"
          aria-label="Open party planner chat"
        >
          <span className="grid h-6 w-6 place-items-center rounded-full bg-party-yellow text-party-ink">
            ?
          </span>
          Party Planner
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[70vh] max-h-[560px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-party-ink/10 lg:bottom-6">
          {/* Header */}
          <div className="flex items-center justify-between bg-party-ink px-5 py-4 text-white">
            <div>
              <p className="font-display text-lg font-bold italic leading-none">
                Party Planner
              </p>
              <p className="mt-1 text-xs text-white/60">
                Usually replies instantly
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-full text-xl hover:bg-white/10"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto bg-party-cream px-4 py-4"
          >
            {msgs.map((m, i) => (
              <div key={i}>
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === "user"
                      ? "ml-auto bg-party-red text-white"
                      : "bg-white text-party-ink shadow-soft"
                  }`}
                >
                  {m.text}
                </div>
                {m.links && m.links.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {m.links.map((l) => (
                      <Link
                        key={l.href + l.label}
                        href={l.href}
                        onClick={() => setOpen(false)}
                        className="rounded-full bg-party-ink px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-black"
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                )}
                {m.suggestions && m.suggestions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {m.suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="rounded-full border border-party-ink/25 bg-white px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-party-yellow/40"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div className="flex w-14 gap-1 rounded-2xl bg-white px-4 py-3 shadow-soft">
                <span className="h-2 w-2 animate-bounce rounded-full bg-party-ink/40 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-party-ink/40 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-party-ink/40" />
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-party-ink/10 bg-white p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your party…"
              className="flex-1 rounded-full border border-party-ink/20 px-4 py-2.5 text-sm outline-none focus:border-party-red"
            />
            <button
              type="submit"
              disabled={typing || !input.trim()}
              className="rounded-full bg-party-red px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#c5371d] disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
