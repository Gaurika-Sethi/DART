import { useState, useEffect } from "react";
import { Cpu, Wifi, WifiOff, AlertTriangle, Activity, ChevronDown, X, Download } from "lucide-react";
import { cityLocationForDevice, cityMapPoint, displayDeviceId, isVisibleDetection, truncateConfidencePercent, visibleLogEntries, type Device, type Incident, type LogEntry } from "../data";
import ThreatIcon from "../components/ThreatIcon";
import CityMap from "../components/CityMap";

/* ── helpers ── */
const STATUS_COLOR: Record<string,string> = { ONLINE:"#3FB950", OFFLINE:"#8C9199", ALERT:"#E05252", WARNING:"#F4B942" };
const RESULT_COLOR: Record<string,string> = { "SAFE":"#3FB950","CAUTION":"#F4B942","ALCOHOL":"#E05252","ALCOHOL PROXY":"#E05252","NARCOTIC":"#E05252","NARCOTIC PROXY":"#E05252" };
const DETECTION_KEYWORDS = ["safe", "caution", "weather", "alcohol", "sanitizer", "narcotic"];

function displayEvent(event: string) {
  return event.replace(/\bCAUTION\b/gi, "WEATHER DRIFT");
}

function displayResult(result: string) {
  return result === "CAUTION" ? "WEATHER DRIFT" : result;
}

function Badge({ status }: { status: Device["status"] }) {
  const c = STATUS_COLOR[status];
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-[3px] font-mono text-[8.5px] tracking-widest"
      style={{ background:`${c}20`, color:c, border:`1px solid ${c}40` }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:c}}/>
      {status}
    </span>
  );
}

function displayStatus(device: Device): Device["status"] {
  return isVisibleDetection(device.lastResult) ? "ALERT" : device.status;
}

function LogStatus({ level }: { level:string }) {
  const map:Record<string,{c:string}> = { ALERT:{c:"#E05252"}, WARNING:{c:"#F4B942"}, SUCCESS:{c:"#3FB950"}, INFO:{c:"#F4B942"} };
  const { c } = map[level]??{c:"#8C9199"};
  return <span className="font-mono text-[8.5px] tracking-widest px-1.5 py-[3px]" style={{background:`${c}20`,color:c,border:`1px solid ${c}40`}}>{level}</span>;
}

/* ── Metric Card ── */
function MetricCard({ label, value, desc, badge, badgeColor, trend, dark }:{
  label:string; value:string|number; desc:string; badge?:string; badgeColor?:string; trend?:"up"|"down"|"flat"; dark:boolean;
}) {
  return (
    <div className={`relative overflow-hidden p-4 panel ${dark?"bg-gunmetal":"bg-white panel-light"}`}>
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-signal-red/30"/>
      <div className={`font-mono text-[8.5px] tracking-[.22em] uppercase mb-3 ${dark?"text-warm-grey":"text-[#8C9199]"}`}>{label}</div>
      <div className={`font-display text-[42px] leading-none mb-1 ${dark?"text-ivory":"text-obsidian"}`}>{value}</div>
      <div className={`font-mono text-[9px] tracking-widest ${dark?"text-warm-grey":"text-[#8C9199]"}`}>{desc}</div>
      {badge && (
        <div className="absolute bottom-3 right-3">
          <span className="font-mono text-[8px] tracking-widest px-1.5 py-[3px]" style={{background:`${badgeColor}22`,color:badgeColor,border:`1px solid ${badgeColor}44`}}>{badge}</span>
        </div>
      )}
      {trend && (
        <div className="absolute top-3 right-3">
          <span className={`font-mono text-[9px] ${trend==="up"?"text-signal-red":trend==="down"?"text-safe":"text-warm-grey"}`}>
            {trend==="up"?"↑":trend==="down"?"↓":"→"}
          </span>
        </div>
      )}
    </div>
  );
}

/* ── Station Map ── */
function StationMap({ dark, devices, onDevice }:{ dark:boolean; devices:Device[]; onDevice:(d:Device)=>void }) {
  return (
    <div className={`relative w-full h-72 md:h-[340px] overflow-hidden ${dark?"bg-[#090A0C]":"bg-[#15171A]"} grid-bg`}>
      {/* SVG station layout */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 640 380" preserveAspectRatio="xMidYMid meet">
        {/* Station boundary */}
        <rect x="20" y="15" width="600" height="350" fill="none" stroke="#F4B942" strokeWidth=".8" strokeOpacity=".18"/>

        {/* Platform 3 — top rail pair */}
        <rect x="60" y="55" width="500" height="55" rx="0" fill={dark?"#15171A20":"#15171A20"} stroke="#F4B942" strokeWidth=".7" strokeOpacity=".25"/>
        <line x1="60" y1="72" x2="560" y2="72" stroke="#F4B942" strokeWidth="1.8" strokeOpacity=".35"/>
        <line x1="60" y1="94" x2="560" y2="94" stroke="#F4B942" strokeWidth="1.8" strokeOpacity=".35"/>
        {[80,110,140,170,200,230,260,290,320,350,380,410,440,470,500,530].map(x=>(
          <line key={x} x1={x} y1="69" x2={x} y2="97" stroke="#F4B942" strokeWidth="1.2" strokeOpacity=".2"/>
        ))}
        <text x="310" y="68" textAnchor="middle" fontSize="8" fill="#F4B942" fillOpacity=".6" fontFamily="JetBrains Mono, monospace" letterSpacing="3">PLATFORM 3</text>

        {/* Platform 5 — mid rail pair */}
        <rect x="60" y="155" width="500" height="55" rx="0" fill={dark?"#15171A20":"#15171A20"} stroke="#F4B942" strokeWidth=".7" strokeOpacity=".25"/>
        <line x1="60" y1="172" x2="560" y2="172" stroke="#F4B942" strokeWidth="1.8" strokeOpacity=".35"/>
        <line x1="60" y1="194" x2="560" y2="194" stroke="#F4B942" strokeWidth="1.8" strokeOpacity=".35"/>
        {[80,110,140,170,200,230,260,290,320,350,380,410,440,470,500,530].map(x=>(
          <line key={x} x1={x} y1="169" x2={x} y2="197" stroke="#F4B942" strokeWidth="1.2" strokeOpacity=".2"/>
        ))}
        <text x="310" y="168" textAnchor="middle" fontSize="8" fill="#F4B942" fillOpacity=".6" fontFamily="JetBrains Mono, monospace" letterSpacing="3">PLATFORM 5</text>

        {/* Coaching Bay */}
        <rect x="400" y="265" width="160" height="70" rx="0" fill={dark?"#15171A20":"#15171A20"} stroke="#F4B942" strokeWidth=".7" strokeOpacity=".2"/>
        <text x="480" y="283" textAnchor="middle" fontSize="7" fill="#F4B942" fillOpacity=".5" fontFamily="JetBrains Mono, monospace" letterSpacing="2">COACHING AREA</text>

        {/* Entry gates */}
        <rect x="20" y="250" width="70" height="110" rx="0" fill="none" stroke="#F4B942" strokeWidth=".6" strokeOpacity=".18"/>
        <text x="55" y="268" textAnchor="middle" fontSize="7" fill="#F4B942" fillOpacity=".5" fontFamily="JetBrains Mono, monospace" letterSpacing="1">ENTRY</text>
        <text x="55" y="278" textAnchor="middle" fontSize="7" fill="#F4B942" fillOpacity=".5" fontFamily="JetBrains Mono, monospace" letterSpacing="1">GATE 1</text>
        <rect x="20" y="140" width="70" height="95" rx="0" fill="none" stroke="#F4B942" strokeWidth=".6" strokeOpacity=".18"/>
        <text x="55" y="175" textAnchor="middle" fontSize="7" fill="#F4B942" fillOpacity=".5" fontFamily="JetBrains Mono, monospace" letterSpacing="1">ENTRY</text>
        <text x="55" y="185" textAnchor="middle" fontSize="7" fill="#F4B942" fillOpacity=".5" fontFamily="JetBrains Mono, monospace" letterSpacing="1">GATE 2</text>

        {/* Waiting Hall */}
        <rect x="200" y="270" width="165" height="70" rx="0" fill={dark?"#15171A20":"#15171A20"} stroke="#F4B942" strokeWidth=".6" strokeOpacity=".18"/>
        <text x="283" y="290" textAnchor="middle" fontSize="7" fill="#F4B942" fillOpacity=".5" fontFamily="JetBrains Mono, monospace" letterSpacing="2">WAITING HALL</text>

        {/* Compass / scale */}
        <text x="610" y="360" textAnchor="end" fontSize="6.5" fill="#F4B942" fillOpacity=".3" fontFamily="JetBrains Mono, monospace">NDLS // SIM</text>
      </svg>

      {/* Device markers */}
      {devices.filter(d=>d.status!=="OFFLINE").map(d=>{
        const c = RESULT_COLOR[d.lastResult] || STATUS_COLOR[d.status];
        const resultColor = RESULT_COLOR[d.lastResult] || c;
        return (
          <button key={d.id} onClick={()=>onDevice(d)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10"
            style={{ left:`${d.mapX}%`, top:`${d.mapY}%` }}>
            <div className="relative">
              {/* pulse ring */}
              {d.status==="ALERT"&&d.lastResult!=="ALCOHOL"&&<div className="absolute inset-0 rounded-full pulse-red" style={{background:c,opacity:.5}}/>}
              {(d.status==="WARNING"||d.lastResult==="ALCOHOL")&&<div className="absolute inset-0 rounded-full pulse-amber" style={{background:c,opacity:.4}}/>}
              {d.status==="ONLINE"&&<div className="absolute inset-0 rounded-full pulse-green" style={{background:c,opacity:.3}}/>}
              <div className="w-7 h-7 rounded-full border-[2px] border-obsidian relative z-10 transition-transform group-hover:scale-125 flex items-center justify-center"
                style={{background:c, color:resultColor, boxShadow:`0 0 8px ${c}80`}}>
                <ThreatIcon state={d.lastResult} size={19} className="bg-obsidian/90 rounded-full p-0.5" />
              </div>
              {/* tooltip */}
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 panel ${dark?"bg-gunmetal":"bg-white panel-light"} px-2.5 py-1.5`}>
                <div className="font-mono text-[9px] tracking-widest" style={{color:c}}>{d.id}</div>
                <div className={`font-mono text-[8px] ${dark?"text-warm-grey":"text-[#8C9199]"}`}>{d.location}</div>
                <div className="font-mono text-[8px] tracking-widest" style={{color:resultColor}}>{displayResult(d.lastResult)}</div>
              </div>
            </div>
          </button>
        );
      })}

      {/* Legend */}
      <div className={`absolute bottom-3 right-3 p-2.5 ${dark?"bg-charcoal/90":"bg-white/90"} border ${dark?"border-border":"border-border"}`}>
        {[["ONLINE","#3FB950"],["ALERT","#E05252"],["WARNING","#F4B942"]].map(([l,c])=>(
            <div key={l} className="flex items-center gap-1.5 mb-1 last:mb-0">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:c}}/>
            <span className="font-mono text-[8px] tracking-widest" style={{color:c}}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Device Popup ── */
function DevicePopup({ d, dark, onClose, onView }:{ d:Device; dark:boolean; onClose:()=>void; onView:()=>void }) {
  const sc = RESULT_COLOR[d.lastResult] || STATUS_COLOR[d.status];
  const rc = RESULT_COLOR[d.lastResult]||"#8C9199";
  return (
    <div className={`absolute z-30 w-72 panel shadow-2xl slide-in ${dark?"bg-gunmetal":"bg-white panel-light"}`}
      style={{ top:"10%", left:"50%", transform:"translateX(-50%)" }}>
      <div className="h-[2px]" style={{background:sc}}/>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className={`font-display text-[26px] tracking-widest leading-none ${dark?"text-ivory":"text-obsidian"}`}>{displayDeviceId(d.id)}</div>
            <div className={`font-mono text-[9px] tracking-widest uppercase ${dark?"text-warm-grey":"text-[#8C9199]"}`}>{cityLocationForDevice(d.id, d.location)}</div>
          </div>
          <button onClick={onClose} className={`${dark?"text-warm-grey hover:text-ivory":"text-[#8C9199] hover:text-obsidian"} transition-colors mt-0.5`}>
            <X className="w-4 h-4"/>
          </button>
        </div>
        <div className="mb-3"><Badge status={displayStatus(d)}/></div>
        {/* Battery */}
        <div className={`p-2.5 mb-2 ${dark?"bg-charcoal":"bg-[#15171A]"}`}>
          <div className={`font-mono text-[7.5px] tracking-widest uppercase mb-0.5 ${dark?"text-warm-grey":"text-[#8C9199]"}`}>BATTERY</div>
          <div className={`font-mono text-[14px] font-medium ${dark?"text-ivory":"text-obsidian"}`}>
            {d.battery>0?`${d.battery}%`:"—"}
          </div>
        </div>
        {/* Last threat scan */}
        {d.status!=="OFFLINE"&&(
          <div className={`p-2.5 mb-2 ${isVisibleDetection(d.lastResult)?"bg-signal-red/10 border border-signal-red/30":d.lastResult==="CAUTION"?"bg-caution/10 border border-caution/30":"bg-safe/10 border border-safe/30"}`}>
            <div className={`font-mono text-[7.5px] tracking-widest uppercase mb-0.5 ${dark?"text-warm-grey":"text-[#8C9199]"}`}>LAST SCAN RESULT</div>
            <div className="flex items-center gap-2" style={{color:rc}}>
              <ThreatIcon state={d.lastResult} size={34} className="flex-shrink-0" />
              <div className="font-heading text-[13px] font-semibold tracking-widest">{displayResult(d.lastResult)}</div>
            </div>
          </div>
        )}
        {/* Confidence + scan time */}
        <div className={`p-2.5 mb-3 ${dark?"bg-charcoal":"bg-[#15171A]"}`}>
          <div className={`font-mono text-[7.5px] tracking-widest uppercase mb-0.5 ${dark?"text-warm-grey":"text-[#8C9199]"}`}>CONFIDENCE</div>
          <div className={`font-mono text-[14px] font-medium ${dark?"text-ivory":"text-obsidian"}`}>
            {d.status==="OFFLINE"?"—":`${truncateConfidencePercent(d.confidence)}%`}
          </div>
        </div>
        <button onClick={onView} className="btn-primary w-full text-[11px]">VIEW FULL DEVICE</button>
      </div>
    </div>
  );
}

/* ── Main component ── */
interface Props {
  theme:"dark"|"light";
  devices: Device[];
  incidents: Incident[];
  logs: LogEntry[];
  summary: { connectedDevices:number; online:number; offline:number; activeAlerts:number };
  onViewDevice:(id:string)=>void;
  onViewAnomaly:()=>void;
}

export default function Dashboard({ theme, devices, incidents, logs, summary, onViewDevice, onViewAnomaly }: Props) {
  const dark = theme==="dark";
  const [popup, setPopup]       = useState<Device|null>(null);
  const [logFilter, setLogFilter]= useState("ALL");
  const [time, setTime] = useState(()=>new Date().toLocaleTimeString("en-IN",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"}));
  const [date]          = useState(()=>new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}));

  useEffect(()=>{
    const id=setInterval(()=>{
      setTime(new Date().toLocaleTimeString("en-IN",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"}));
    },1000);
    return ()=>clearInterval(id);
  },[]);

  const LOG_FILTERS=["ALL","DEVICES","ALERTS"];
  const bg=dark?"bg-obsidian":"bg-[#F5F5F5]";
  const cBg=dark?"bg-gunmetal":"bg-white";
  const text=dark?"text-ivory":"text-obsidian";
  const muted=dark?"text-warm-grey":"text-[#8C9199]";
  const bdr="border-border";
  const DEVICE_KEYWORDS=["battery","sensor","calibr","connection","temperature","humidity","heartbeat","operator","handover","environmental","noise","firmware"];
  const safeLogs=visibleLogEntries(logs);
  const filteredLogs=logFilter==="ALERTS"
    ?safeLogs.filter(l=>l.level==="ALERT"||DETECTION_KEYWORDS.some(keyword=>l.event.toLowerCase().includes(keyword)))
    :logFilter==="DEVICES"
      ?safeLogs.filter(l=>DEVICE_KEYWORDS.some(keyword=>l.event.toLowerCase().includes(keyword)))
      :safeLogs;

  function exportLogs() {
    const header="TIMESTAMP,DEVICE,EVENT,LOCATION,STATUS\n";
    const rows=filteredLogs.map(l=>`${l.timestamp},${l.device},"${l.event}",${l.location},${l.level}`).join("\n");
    const blob=new Blob([header+rows],{type:"text/csv"});
    const url=URL.createObjectURL(blob);
    const anchor=document.createElement("a");
    anchor.href=url;
    anchor.download=`dart-logs-${Date.now()}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={`min-h-full ${bg} relative`}>
      <div className={`absolute inset-0 pointer-events-none ${dark?"grid-bg":"grid-bg-light"} opacity-50`}/>
      <div className="relative z-10 p-4 md:p-6 space-y-5 pb-20 md:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <div className={`font-display text-[40px] md:text-[52px] tracking-widest leading-none ${text}`}>CITY COMMAND</div>
            <div className={`font-mono text-[9.5px] tracking-widest uppercase mt-1 ${muted}`}>Alcohol and narcotics detection across New Delhi.</div>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className={`flex items-center gap-2 px-3 py-2 border ${bdr} ${cBg}`}>
              <span className={`font-mono text-[9.5px] tracking-widest ${muted}`}><span className="text-brass">CITY //</span> NEW DELHI, INDIA</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[9px] tracking-widest text-signal-red">SYSTEM LIVE</span>
              <span className={`font-mono text-[9px] tracking-widest ${muted}`}>{date} // {time}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <MetricCard label="CONNECTED DEVICES" value={summary.connectedDevices} desc="Total registered" dark={dark}/>
          <MetricCard label="ONLINE" value={summary.online} desc="Active right now" badge={summary.connectedDevices?`${Math.round(summary.online/summary.connectedDevices*100)}%`:"0%"} badgeColor="#3FB950" dark={dark}/>
          <MetricCard label="OFFLINE" value={summary.offline} desc="No heartbeat" badge={summary.offline?"ATTENTION":"CLEAR"} badgeColor="#8C9199" trend={summary.offline?"up":"flat"} dark={dark}/>
          <MetricCard label="ACTIVE ALERTS" value={String(summary.activeAlerts).padStart(2,"0")} desc="Require attention" badge={summary.activeAlerts?"CRITICAL":"CLEAR"} badgeColor="#E05252" trend={summary.activeAlerts?"up":"flat"} dark={dark}/>
        </div>
        <div className={`panel ${cBg}`}>
          <div className="h-[2px] bg-signal-red/25"/>
          <div className={`px-4 py-3 flex items-center justify-between border-b ${bdr}`}>
            <div>
              <div className={`font-heading text-[12px] tracking-[.14em] font-semibold uppercase ${text}`}>DART CITY DETECTORS</div>
              <div className={`font-mono text-[9px] tracking-widest ${muted} mt-0.5`}>Central New Delhi // connected detection points</div>
            </div>
            <span className={`font-mono text-[8.5px] tracking-widest ${muted}`}><span className="text-brass">LIVE GRID</span> // NEW DELHI</span>
          </div>
          <div className="relative">
            <CityMap devices={devices} onDevice={setPopup} className={`h-72 md:h-[340px] ${dark ? "grid-bg" : ""}`}/>
            {popup&&<DevicePopup d={popup} dark={dark} onClose={()=>setPopup(null)} onView={()=>{onViewDevice(popup.id);setPopup(null);}}/>}
          </div>
          {/* device list row */}
          <div className={`px-4 py-3 border-t ${bdr}`}>
            <div className="flex flex-wrap gap-2">
              {devices.map(d=>(
                <button key={d.id} onClick={()=>isVisibleDetection(d.lastResult)?onViewAnomaly():onViewDevice(d.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 border ${bdr} ${dark?"hover:bg-charcoal":"hover:bg-[#15171A]"} transition-colors`}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:isVisibleDetection(d.lastResult)?"#E05252":STATUS_COLOR[d.status]}}/>
                  <span className={`font-mono text-[9px] tracking-widest ${text}`}>{displayDeviceId(d.id)}</span>
                  <span className={`font-mono text-[8px] ${muted}`}>{cityLocationForDevice(d.id,d.location)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Incident banner ── */}
        {incidents.length>0&&(
          <div className="border border-signal-red/35 bg-signal-red/5 p-4 fade-up">
            <div className="flex items-center gap-2.5 mb-3">
              <AlertTriangle className="w-4 h-4 text-signal-red flex-shrink-0"/>
              <span className="font-heading text-[12px] tracking-[.14em] font-semibold text-signal-red">DETECTION INCIDENTS</span>
              <span className="ml-auto font-mono text-[8.5px] text-signal-red border border-signal-red/30 px-2 py-0.5">
                {incidents.filter(i=>i.status!=="RESOLVED").length} ACTIVE // {incidents.filter(i=>i.status==="RESOLVED").length} RESOLVED
              </span>
            </div>
            {incidents.map(inc=>(
              <div key={inc.id} className={`flex items-center gap-3 px-3 py-2 mb-2 last:mb-0 ${dark?"bg-charcoal":"bg-white"} border-l-2 ${inc.status==="RESOLVED"?"border-l-safe":"border-l-signal-red"}`}>
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-[9px] text-signal-red">{displayResult(inc.type)} DETECTION</span>
                  <span className={`font-mono text-[9px] ${muted} ml-3`}>{cityLocationForDevice(inc.device,inc.location)}</span>
                </div>
                <span className={`font-mono text-[8.5px] ${inc.status==="RESOLVED"?"text-safe":"text-signal-red"}`}>{inc.status==="RESOLVED"?"RESOLVED":"ACTIVE"}</span>
                {inc.status!=="RESOLVED"&&<button onClick={onViewAnomaly} className="font-mono text-[8.5px] text-signal-red border border-signal-red/30 px-2 py-1 hover:bg-signal-red hover:text-ivory transition-all flex-shrink-0">VIEW</button>}
              </div>
            ))}
          </div>
        )}

        {/* ── System Logs ── */}
        <div className={`panel ${cBg}`}>
          <div className="h-[1px] bg-brass/25"/>
          <div className={`px-4 py-3 border-b ${bdr}`}>
            <div className={`font-heading text-[12px] tracking-[.14em] font-semibold uppercase ${text}`}>SYSTEM LOGS</div>
            <div className={`font-mono text-[9px] tracking-widest ${muted} mt-0.5`}>Monitor device connectivity, sensor health and system activity.</div>
          </div>
          {/* filters + export */}
          <div className={`px-4 py-2.5 border-b ${bdr} flex flex-wrap items-center gap-2`}>
            <div className="flex gap-1 flex-wrap">
              {LOG_FILTERS.map(f=>(
                <button key={f} onClick={()=>setLogFilter(f)}
                  className={`font-mono text-[8.5px] tracking-widest px-2 py-1 border transition-all ${logFilter===f?"bg-signal-red text-ivory border-signal-red":`${bdr} ${muted} hover:border-brass`}`}>
                  {f}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className={`font-mono text-[8px] tracking-widest ${muted}`}>{filteredLogs.length} ENTRIES</span>
              <button onClick={exportLogs}
                className={`flex items-center gap-1.5 px-2.5 py-1 border ${bdr} font-mono text-[8.5px] tracking-widest transition-all ${muted} hover:border-brass hover:text-brass`}>
                <Download className="w-3 h-3"/> EXPORT CSV
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className={`border-b ${bdr} ${dark?"bg-charcoal/50":"bg-[#15171A]"}`}>
                  {["TIMESTAMP","DEVICE","EVENT","LOCATION","STATUS"].map(h=>(
                    <th key={h} className={`px-4 py-2.5 font-mono text-[8.5px] tracking-[.2em] uppercase ${muted}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((l,i)=>(
                  <tr key={i} className={`border-b ${bdr} transition-colors hover:bg-signal-red/5`}
                    style={{background:i%2===0?(dark?"rgba(21,23,26,.25)":"rgba(21,23,26,.35)"):undefined}}>
                    <td className="px-4 py-2.5 font-mono text-[9.5px] text-brass whitespace-nowrap">{l.timestamp}</td>
                    <td className="px-4 py-2.5 font-mono text-[9.5px] text-brass whitespace-nowrap">{displayDeviceId(l.device)}</td>
                    <td className={`px-4 py-2.5 font-mono text-[9.5px] ${text} max-w-[240px] truncate`}>{displayEvent(l.event)}</td>
                    <td className={`px-4 py-2.5 font-mono text-[9.5px] ${muted} whitespace-nowrap`}>{cityLocationForDevice(l.device,l.location)}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap"><LogStatus level={l.level}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between pt-4 border-t ${bdr}`}>
          <div className={`font-mono text-[8.5px] tracking-widest ${muted}`}>DART OS v1.0.0 // CITYWIDE DETECTION</div>
          <div className={`font-mono text-[8.5px] tracking-widest ${muted}`}>SESSION: DART_OPS_001 // NEW-DELHI</div>
        </div>
      </div>
    </div>
  );
}
