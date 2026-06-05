"use client";

import { useEffect, useState } from "react";

const WMO: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Foggy",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Rain showers",
  82: "Heavy showers",
  95: "Thunderstorms",
  96: "Thunderstorms",
  99: "Thunderstorms",
};

interface Weather {
  hi: number;
  lo: number;
  code: number;
  precip: number;
}

function daysUntil(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const a = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const b = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((b - a) / 86400000);
}

function gcalLink(iso: string): string {
  const ymd = iso.replace(/-/g, "");
  const end = new Date(
    Number(iso.slice(0, 4)),
    Number(iso.slice(5, 7)) - 1,
    Number(iso.slice(8, 10)) + 1
  );
  const endYmd = `${end.getFullYear()}${String(end.getMonth() + 1).padStart(2, "0")}${String(end.getDate()).padStart(2, "0")}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: "Bounce FX Party Rental",
    dates: `${ymd}/${endYmd}`,
    details:
      "Your Bounce FX rental is scheduled for today! We'll deliver and set up. Balance due on delivery.",
    location: "Fredericksburg, VA",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function downloadIcs(iso: string) {
  const ymd = iso.replace(/-/g, "");
  const end = new Date(
    Number(iso.slice(0, 4)),
    Number(iso.slice(5, 7)) - 1,
    Number(iso.slice(8, 10)) + 1
  );
  const endYmd = `${end.getFullYear()}${String(end.getMonth() + 1).padStart(2, "0")}${String(end.getDate()).padStart(2, "0")}`;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bounce FX//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${ymd}-bouncefx@bouncefxpartyrentals.com`,
    `DTSTART;VALUE=DATE:${ymd}`,
    `DTEND;VALUE=DATE:${endYmd}`,
    "SUMMARY:Bounce FX Party Rental",
    "DESCRIPTION:Your Bounce FX rental day! We deliver & set up. Balance due on delivery.",
    "LOCATION:Fredericksburg\\, VA",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bounce-fx-event.ics";
  a.click();
  URL.revokeObjectURL(url);
}

export default function EventExtras({ eventDate }: { eventDate: string }) {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [weatherState, setWeatherState] = useState<"loading" | "done" | "far">(
    "loading"
  );
  const days = daysUntil(eventDate);

  useEffect(() => {
    if (days < 0 || days > 15) {
      setWeatherState("far");
      return;
    }
    (async () => {
      try {
        const url = new URL("https://api.open-meteo.com/v1/forecast");
        url.searchParams.set("latitude", "38.3032");
        url.searchParams.set("longitude", "-77.4605");
        url.searchParams.set(
          "daily",
          "temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max"
        );
        url.searchParams.set("temperature_unit", "fahrenheit");
        url.searchParams.set("timezone", "America/New_York");
        url.searchParams.set("start_date", eventDate);
        url.searchParams.set("end_date", eventDate);
        const res = await fetch(url.toString());
        const data = await res.json();
        const d = data?.daily;
        if (d?.temperature_2m_max?.[0] != null) {
          setWeather({
            hi: Math.round(d.temperature_2m_max[0]),
            lo: Math.round(d.temperature_2m_min[0]),
            code: d.weather_code?.[0] ?? 0,
            precip: d.precipitation_probability_max?.[0] ?? 0,
          });
          setWeatherState("done");
        } else {
          setWeatherState("far");
        }
      } catch {
        setWeatherState("far");
      }
    })();
  }, [eventDate, days]);

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {/* Countdown */}
      <div className="rounded-2xl bg-white/10 p-6 text-center ring-1 ring-white/15">
        <div className="font-display text-5xl font-bold italic text-party-yellow">
          {days > 0 ? days : days === 0 ? "Today" : "—"}
        </div>
        <div className="mt-1 text-sm font-semibold uppercase tracking-wider text-white/80">
          {days > 1
            ? "days until your party"
            : days === 1
            ? "day until your party"
            : days === 0
            ? "your party is today!"
            : "event has passed"}
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <a
            href={gcalLink(eventDate)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-party-ink transition-colors hover:bg-party-cream"
          >
            Add to Google Calendar
          </a>
          <button
            onClick={() => downloadIcs(eventDate)}
            className="rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Add to Apple / Outlook
          </button>
        </div>
      </div>

      {/* Weather */}
      <div className="rounded-2xl bg-white/10 p-6 text-center ring-1 ring-white/15">
        <p className="text-sm font-semibold uppercase tracking-wider text-white/70">
          Forecast in Fredericksburg
        </p>
        {weatherState === "loading" && (
          <p className="mt-4 text-white/70">Checking the skies…</p>
        )}
        {weatherState === "far" && (
          <p className="mt-4 text-white/85">
            We'll keep an eye on the forecast and reach out before your date.
          </p>
        )}
        {weatherState === "done" && weather && (
          <>
            <div className="mt-2 font-display text-4xl font-bold italic">
              {weather.hi}°{" "}
              <span className="text-xl text-white/60">/ {weather.lo}°</span>
            </div>
            <div className="mt-1 font-semibold">
              {WMO[weather.code] ?? "Mixed conditions"}
            </div>
            <div className="mt-1 text-sm text-white/70">
              {weather.precip}% chance of rain
            </div>
            {weather.precip >= 40 && (
              <p className="mt-3 rounded-lg bg-party-yellow/20 px-3 py-2 text-xs font-semibold text-party-yellow">
                Rain in the forecast? Ask us about adding a tent!
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
