import { useState } from "react";
import { cityLocationForDevice, displayDeviceId, isVisibleDetection, truncateConfidencePercent, type AlertEvent, type Incident } from "../data";
import ThreatIcon from "../components/ThreatIcon";

type IncStatus = "LIVE" | "RECOGNISED" | "RESOLVED";

const STATUS_MAP: Record<string, IncStatus> = {
  "RESPONSE DISPATCHED": "LIVE",
  "TEAM NOTIFIED":       "RECOGNISED",
  "RESOLVED":            "RESOLVED",
  "ACKNOWLEDGED":        "RECOGNISED",
};

const STATUS_COLOR: Record<IncStatus, string> = {
  LIVE:       "#E81A1A",
  RECOGNISED: "#F4B942",
  RESOLVED:   "#3FB950",
};

const GLOW: Record<IncStatus, string> = {
  LIVE:       "0 0 10px #E0525299, 0 0 24px #E0525244",
  RECOGNISED: "0 0 10px #F4B94299, 0 0 24px #F4B94244",
  RESOLVED:   "0 0 10px #3FB95099, 0 0 24px #3FB95044",
};

function displayResult(result: string) {
  return result === "CAUTION" ? "WEATHER DRIFT" : result;
}

export default function ThreatHistory({ theme, incidents, alertEvents }: { theme: "dark" | "light"; incidents: Incident[]; alertEvents: AlertEvent[] }) {
  const dark  = theme === "dark";
  const bg    = dark ? "bg-obsidian"   : "bg-[#F5F5F5]";
  const cBg   = dark ? "bg-gunmetal"   : "bg-white";
  const text  = dark ? "text-ivory"    : "text-obsidian";
  const muted = dark ? "text-warm-grey": "text-[#8C9199]";
  const bdr   = dark ? "border-border" : "border-border";

  const [filter, setFilter] = useState<"ALL" | IncStatus>("ALL");

  const tc = (type: string) => isVisibleDetection(type) ? "#E05252" : "#8C9199";

  const items = incidents.map(inc => ({
    ...inc,
    derivedStatus: STATUS_MAP[inc.status] ?? "LIVE" as IncStatus,
  }));

  const shown = filter === "ALL" ? items : items.filter(i => i.derivedStatus === filter);

  const counts = {
    LIVE:       items.filter(i => i.derivedStatus === "LIVE").length,
    RECOGNISED: items.filter(i => i.derivedStatus === "RECOGNISED").length,
    RESOLVED:   items.filter(i => i.derivedStatus === "RESOLVED").length,
  };

  return (
    <div className={`min-h-full ${bg}`}>
      <div className="p-4 md:p-6 space-y-4 pb-20 md:pb-6">

        {/* Header */}
        <div>
          <div className={`font-display text-[40px] md:text-[50px] tracking-widest leading-none ${text}`}>THREAT HISTORY</div>
          <div className={`font-mono text-[9.5px] tracking-widest uppercase mt-1 ${muted}`}>Incident log and status tracking.</div>
          <div className="h-[1px] bg-signal-red/25 mt-4" />
        </div>

        {/* Summary — only ACTIVE + RESOLVED */}
        <div className="grid grid-cols-2 gap-3">
          {([
            { l: "ACTIVE INCIDENTS", v: counts.LIVE,     c: "#E05252", glow: GLOW.LIVE     },
            { l: "RESOLVED TODAY",   v: counts.RESOLVED,  c: "#3FB950", glow: GLOW.RESOLVED },
          ] as const).map(s => (
            <div key={s.l} className={`panel ${cBg} p-4 flex flex-col gap-1`}
              style={{ boxShadow: s.v > 0 ? s.glow : undefined }}>
              <div className={`font-mono text-[8px] tracking-widest ${muted}`}>{s.l}</div>
              <div className="font-display text-[38px] tracking-widest" style={{ color: s.c }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className={`panel ${cBg} p-3 flex flex-wrap gap-1`}>
          {(["ALL", "LIVE", "RECOGNISED", "RESOLVED"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`font-mono text-[8.5px] tracking-widest px-3 py-1.5 border transition-all
                ${filter === f ? "bg-signal-red text-ivory border-signal-red" : `${bdr} ${muted} hover:border-brass`}`}>
              {f}
            </button>
          ))}
        </div>

        {/* Alert event history */}
        {alertEvents.length > 0 && (
          <div className={`panel ${cBg}`}>
            <div className="p-4">
              <div className="font-mono text-[9px] tracking-[.2em] uppercase text-brass mb-3">ALERT EVENT HISTORY</div>
              <div className="space-y-2">
                {alertEvents.slice(0, 8).map(event => (
                  <div key={event.id} className={`flex flex-col md:flex-row md:items-center justify-between gap-2 p-3 border ${bdr}`}>
                    <div>
                      <div className="font-mono text-[9px] tracking-widest text-brass">{event.created_at}</div>
                      <div className="font-mono text-[10px] text-ivory">{displayDeviceId(event.device_id)} / {cityLocationForDevice(event.device_id,event.location || "Unknown")}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[8.5px] px-2 py-1" style={{ background: `${tc(event.display_result)}20`, color: tc(event.display_result), border: `1px solid ${tc(event.display_result)}40` }}>
                        {event.display_result}
                      </span>
                      <span className="font-mono text-[8px] tracking-widest uppercase" style={{ color: event.resolved_at ? "#3FB950" : "#F4B942" }}>
                        {event.resolved_at ? "RESOLVED" : "ACTIVE"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Incident cards */}
        <div className="space-y-3">
          {shown.map(inc => {
            const t = tc(inc.type);
            const st = inc.derivedStatus;
            const sc = STATUS_COLOR[st];
            const isLive = st === "LIVE";
            const iconStyle = { color: t };
            return (
              <div key={inc.id} className={`panel ${cBg} overflow-hidden`}
                style={{ borderLeft: `3px solid ${t}`, boxShadow: isLive ? GLOW.LIVE : undefined }}>
                <div className="h-[1px]" style={{ background: `${t}60` }} />
                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-[9px] ${muted}`}>INCIDENT</span>
                      <span className="font-mono text-[10px] text-brass font-medium">#{inc.id}</span>
                    </div>
                    {/* Status badge with glow */}
                    <span
                      className="ml-auto font-mono text-[8.5px] px-2 py-[3px] tracking-widest"
                      style={{
                        background: `${sc}22`,
                        color: sc,
                        border: `1px solid ${sc}60`,
                        boxShadow: GLOW[st],
                      }}>
                      {st}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3" style={{ color: t }}>
                    <span className="flex-shrink-0" style={iconStyle}>
                      <ThreatIcon state={inc.type} size={58} />
                    </span>
                    <div className="font-display text-[28px] tracking-widest leading-none">{displayResult(inc.type)}</div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      { l: "LOCATION",   v: cityLocationForDevice(inc.device,inc.location) },
                      { l: "DISTRICT",   v: inc.platform },
                      { l: "CONFIDENCE", v: `${truncateConfidencePercent(inc.confidence)}%` },
                    ].map(r => (
                      <div key={r.l} className={`p-2 ${dark ? "bg-charcoal" : "bg-[#15171A]"}`}>
                        <div className={`font-mono text-[7.5px] tracking-widest ${muted} mb-0.5`}>{r.l}</div>
                        <div className={`font-mono text-[11px] ${text}`}>{r.v}</div>
                      </div>
                    ))}
                  </div>

                  <div className={`mt-3 pt-2.5 border-t ${bdr}`}>
                    <span className={`font-mono text-[8.5px] ${muted}`}>DEVICE // </span>
                    <span className="font-mono text-[9.5px] text-brass">{displayDeviceId(inc.device)}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {shown.length === 0 && (
            <div className={`panel ${cBg} p-10 text-center`}>
              <div className={`font-mono text-[10px] tracking-widest ${muted}`}>NO INCIDENTS MATCH FILTER</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
