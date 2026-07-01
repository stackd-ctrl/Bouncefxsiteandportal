"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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

  // "Talk to a human" — sends the chat to the team as a contact inquiry.
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", note: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  function transcript(): string {
    return msgs
      .map((m) => `${m.role === "user" ? "Guest" : "Bot"}: ${m.text}`)
      .join("\n");
  }

  async function submitToTeam(e: React.FormEvent) {
    e.preventDefault();
    if (sending || !form.name.trim() || !form.email.trim()) return;
    setSending(true);
    try {
      const message =
        (form.note.trim() ? `${form.note.trim()}\n\n` : "") +
        `--- Party Planner chat ---\n${transcript()}`;
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          message,
          source: "Party Planner chat",
        }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
      setShowForm(false);
      setMsgs((m) => [
        ...m,
        {
          role: "bot",
          text: `Thanks ${form.name.trim()}! I've sent your chat to the team — they'll reach out within 24 hours. 🎉`,
        },
      ]);
    } catch {
      setMsgs((m) => [
        ...m,
        {
          role: "bot",
          text: "Hmm, that didn't go through. You can also call or text us at 571-264-9996.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

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
          className="fixed bottom-24 right-4 z-40 flex items-center gap-2.5 rounded-full bg-party-ink py-2 pl-2 pr-5 font-display text-base font-bold italic text-white shadow-card transition-transform hover:-translate-y-0.5 lg:bottom-6"
          aria-label="Open party planner chat"
        >
          <Image
            src="/party-planner-avatar.png"
            alt="Party Planner"
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover ring-2 ring-party-yellow"
          />
          Party Planner
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[70vh] max-h-[560px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-party-ink/10 lg:bottom-6">
          {/* Header */}
          <div className="flex items-center justify-between bg-party-ink px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <Image
                src="/party-planner-avatar.png"
                alt="Party Planner"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-party-yellow"
              />
              <div>
                <p className="font-display text-lg font-bold italic leading-none">
                  Party Planner
                </p>
                <p className="mt-1 text-xs text-white/60">
                  Usually replies instantly
                </p>
              </div>
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

          {/* Talk to a human — contact form */}
          {showForm ? (
            <form
              onSubmit={submitToTeam}
              className="space-y-2 border-t border-party-ink/10 bg-white p-3"
            >
              <p className="text-xs font-semibold text-party-ink/70">
                Send your chat to the team — we&apos;ll reply within 24 hours.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  required
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="rounded-lg border border-party-ink/20 px-3 py-2 text-sm outline-none focus:border-party-red"
                />
                <input
                  required
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="rounded-lg border border-party-ink/20 px-3 py-2 text-sm outline-none focus:border-party-red"
                />
              </div>
              <input
                placeholder="Phone (optional)"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-lg border border-party-ink/20 px-3 py-2 text-sm outline-none focus:border-party-red"
              />
              <textarea
                rows={2}
                placeholder="Anything to add? (optional)"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="w-full resize-none rounded-lg border border-party-ink/20 px-3 py-2 text-sm outline-none focus:border-party-red"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-full border border-party-ink/20 px-4 py-2 text-sm font-semibold text-party-ink/70 hover:bg-party-cream"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={sending || !form.name.trim() || !form.email.trim()}
                  className="flex-1 rounded-full bg-party-red px-4 py-2 text-sm font-semibold text-white hover:bg-[#c5371d] disabled:opacity-50"
                >
                  {sending ? "Sending…" : "Send to the team"}
                </button>
              </div>
            </form>
          ) : (
            !sent && (
              <button
                onClick={() => setShowForm(true)}
                className="flex w-full items-center justify-center gap-2 border-t border-party-ink/10 bg-white py-2.5 text-sm font-semibold text-party-red hover:bg-party-cream/50"
              >
                💬 Talk to a human
              </button>
            )
          )}

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
