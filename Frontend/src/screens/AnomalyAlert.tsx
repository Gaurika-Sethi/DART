import { useState } from "react";
import { AlertTriangle, MapPin, Cpu, CheckCircle, X } from "lucide-react";
import ThreatIcon from "../components/ThreatIcon";
import { cityLocationForDevice, DEMO_DEVICES, displayDeviceId, truncateConfidencePercent, type Incident } from "../data";
import CityMap from "../components/CityMap";

interface Props {
  theme: "dark" | "light";
  incident?: Incident;
  onAcknowledge: (id: string) => void;
  onResolved: (id: string) => void;
}

function Modal({ title, msg, onOk, onCancel, dark, okLabel, okClass }: {
  title: string; msg: string; onOk: () => void; onCancel: () => void;
  dark: boolean; okLabel: string; okClass?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-obsidian/80" onClick={onCancel} />
      <div className={`relative z-10 w-80 panel ${dark ? "bg-gunmetal" : "bg-white panel-light"} slide-in`}>
        <div className="h-[2px] bg-signal-red" />
        <div className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-signal-red flex-shrink-0" />
            <div className={`font-heading text-[13px] tracking-widest font-semibold ${dark ? "text-ivory" : "text-obsidian"}`}>{title}</div>
          </div>
          <p className={`font-mono text-[10px] leading-relaxed ${dark ? "text-warm-grey" : "text-[#8C9199]"} mb-5`}>{msg}</p>
          <div className="flex gap-2">
            <button onClick={onCancel} className="btn-ghost flex-1 text-[11px]">CANCEL</button>
            <button onClick={onOk} className={`${okClass || "btn-primary"} flex-1 text-[11px]`}>{okLabel}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnomalyAlert({ theme, incident, onAcknowledge, onResolved }: Props) {
  const dark = theme === "dark";
  const [ack, setAck]             = useState(false);
  const [showAckConfirm, setAckConf]  = useState(false);
  const [showResConfirm, setResConf]  = useState(false);
  const [showLoc, setLoc]         = useState(false);

  const bg   = dark ? "bg-obsidian"    : "bg-[#F5F5F5]";
  const cBg  = dark ? "bg-gunmetal"    : "bg-white";
  const text = dark ? "text-ivory"     : "text-obsidian";
  const muted= dark ? "text-warm-grey" : "text-[#8C9199]";
  const bdr  = dark ? "border-border" : "border-border";
  if (!incident) {
    return (
      <div className={`min-h-full ${bg} p-4 md:p-6`}>
        <div className={`panel ${cBg} p-10 text-center`}>
          <div className={`font-mono text-[10px] tracking-widest ${muted}`}>NO ACTIVE INCIDENTS</div>
        </div>
      </div>
    );
  }
  const activeIncident = incident;

  return (
    <div className={`min-h-full ${bg}`}>
      {/* Alert strip */}
      <div className="bg-signal-red px-5 md:px-6 py-2.5 flex items-center gap-3">
        <AlertTriangle className="w-4 h-4 text-ivory blink flex-shrink-0" />
        <span className="font-heading text-[12px] tracking-[.18em] font-semibold text-ivory">
          ANOMALY DETECTED — ACTIVE INCIDENT #{activeIncident.id}
        </span>
        <span className="ml-auto font-mono text-[9px] text-ivory/70 tracking-widest hidden sm:block">ACTIVE INCIDENT</span>
      </div>

      <div className="p-4 md:p-6 space-y-4 pb-20 md:pb-6">

        {/* Main anomaly panel */}
        <div className="border border-signal-red/40 bg-signal-red/5">
          <div className="p-5 md:p-6">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex-1">
                <div className="font-mono text-[9px] tracking-[.22em] uppercase text-signal-red mb-2">ANOMALY DETECTED</div>
                <div className="flex items-center gap-4 text-signal-red mb-3">
                  <ThreatIcon state={activeIncident.type} size={76} className="flex-shrink-0" />
                  <div className="font-display text-[56px] md:text-[72px] tracking-widest leading-[.88]">
                    {activeIncident.type}
                  </div>
                </div>
                <div className={`font-mono text-[10px] tracking-widest ${muted} mb-5`}>
                  CONFIDENCE: <span className="text-signal-red font-medium">{truncateConfidencePercent(activeIncident.confidence)}%</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { l: "DEVICE",   v: displayDeviceId(activeIncident.device), ic: Cpu },
                    { l: "LOCATION", v: cityLocationForDevice(activeIncident.device, activeIncident.location), ic: MapPin },
                    { l: "DISTRICT", v: activeIncident.platform, ic: MapPin },
                  ].map(item => (
                    <div key={item.l} className="p-3 border border-signal-red/18 bg-signal-red/5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <item.ic className="w-3 h-3 text-signal-red" />
                        <span className="font-mono text-[7.5px] tracking-widest text-signal-red">{item.l}</span>
                      </div>
                      <div className={`font-mono text-[11px] font-medium ${text}`}>{item.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              
            </div>
          </div>
        </div>

        
        {/* Action buttons */}
        <div className={`panel ${cBg} p-4`}>
          <div className="flex flex-wrap gap-3 items-center">
            {/* View Location */}
            <button onClick={() => setLoc(true)} className="btn-ghost text-[11px]">
              VIEW LOCATION
            </button>

            {/* Issue Recognised (Acknowledge) */}
            <button
              onClick={() => !ack && setAckConf(true)}
              disabled={ack}
              className={`btn-danger text-[11px] ${ack ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {ack
                ? <span className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5" /> ISSUE RECOGNISED</span>
                : "ISSUE RECOGNISED"
              }
            </button>

            {/* Issue Resolved */}
            <button onClick={() => setResConf(true)} className="btn-primary text-[11px]">
              ISSUE RESOLVED
            </button>

            {ack && (
              <span className="font-mono text-[9px] text-safe tracking-widest">
                ● Recognised by DART_OPS_001 at {new Date().toLocaleTimeString("en-IN", { hour12: false })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Issue Recognised confirm */}
      {showAckConfirm && (
        <Modal
          title="ISSUE RECOGNISED"
          msg={`Confirm that INCIDENT #${activeIncident.id} has been recognised. This logs your DART operator ID and timestamp. Field team must be aware before confirming.`}
          onOk={() => { setAck(true); setAckConf(false); onAcknowledge(activeIncident.id); }}
          onCancel={() => setAckConf(false)}
          dark={dark}
          okLabel="CONFIRM"
        />
      )}

      {/* Issue Resolved confirm */}
      {showResConfirm && (
        <Modal
          title="ISSUE RESOLVED"
          msg={`Confirm that INCIDENT #${activeIncident.id} has been fully resolved and the area is clear. This will close the active anomaly and move it to Threat History.`}
          onOk={() => { setResConf(false); onResolved(activeIncident.id); }}
          onCancel={() => setResConf(false)}
          dark={dark}
          okLabel="MARK RESOLVED"
        />
      )}

      {/* Location modal */}
      {showLoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-obsidian/80" onClick={() => setLoc(false)} />
          <div className={`relative z-10 w-96 panel ${dark ? "bg-gunmetal" : "bg-white panel-light"} slide-in`}>
            <div className="h-[2px] bg-signal-red" />
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className={`font-heading text-[13px] tracking-widest font-semibold ${text}`}>DEVICE LOCATION</div>
                <button onClick={() => setLoc(false)} className={`${muted} hover:text-signal-red transition-colors`}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              <CityMap devices={DEMO_DEVICES} selectedId={activeIncident.device} className="h-44 border border-signal-red/30 mb-4">
                <div className="absolute bottom-2 right-2 font-mono text-[7.5px] text-signal-red">{cityLocationForDevice(activeIncident.device, activeIncident.location)}</div>
              </CityMap>
              <div className="space-y-1.5 font-mono text-[9.5px]">
                <div className="flex justify-between"><span className={muted}>CITY</span><span className="text-brass">NEW DELHI, INDIA</span></div>
                <div className="flex justify-between"><span className={muted}>AREA</span><span className={text}>{cityLocationForDevice(activeIncident.device, activeIncident.location)}</span></div>
                <div className="flex justify-between"><span className={muted}>DISTRICT</span><span className={text}>{activeIncident.platform}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
