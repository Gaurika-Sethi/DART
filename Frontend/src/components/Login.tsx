import { useState } from "react";
import { Shield, Eye, EyeOff } from "lucide-react";

interface Props { onLogin: () => void; }

export default function Login({ onLogin }: Props) {
  const [showPass, setShowPass] = useState(false);
  const [operatorId, setOperatorId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-obsidian">

      {/* ─── LEFT PANEL ─── */}
      <div className="relative flex-1 flex flex-col justify-between p-8 md:p-14 overflow-hidden bg-obsidian">
        {/* grid */}
        <div className="absolute inset-0 grid-bg opacity-70 pointer-events-none" />

        {/* SVG background — city street grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.055] pointer-events-none" viewBox="0 0 800 600" fill="none" preserveAspectRatio="xMidYMid meet">
          {/* Main rails */}
          <path d="M-30 120 C150 155 280 60 420 110 S660 180 840 125 M-20 320 C140 270 300 350 450 300 S650 270 830 330" stroke="#8C9199" strokeWidth="10"/>
          <path d="M150 -30 C210 130 80 260 150 630 M450 -20 C380 130 520 250 440 630 M690 -20 C610 130 760 280 650 630" stroke="#8C9199" strokeWidth="8"/>
          <path d="M90 80 H240 V185 H90 Z M270 40 H390 V95 H270 Z M505 125 H625 V235 H505 Z M205 365 H335 V470 H205 Z M490 370 H620 V485 H490 Z" stroke="#F4B942" strokeWidth="2"/>
          <circle cx="440" cy="275" r="62" stroke="#F4B942" strokeWidth="2.5"/>
          <circle cx="440" cy="275" r="38" stroke="#F4B942" strokeWidth="1.2" strokeDasharray="5 6"/>
          <path d="M440 337 V430 L525 495" stroke="#F4B942" strokeWidth="2"/>
          <circle cx="300" cy="180" r="13" stroke="#3FB950" strokeWidth="2.5"/>
          <circle cx="560" cy="300" r="13" stroke="#F4B942" strokeWidth="2.5"/>
          <circle cx="520" cy="475" r="16" stroke="#E05252" strokeWidth="3"/>
          <text x="440" y="280" textAnchor="middle" fontSize="12" fill="#F4B942" fontFamily="monospace" letterSpacing="2">DART</text>
        </svg>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-signal-red flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-ivory"/>
            </div>
            <div>
              <div className="font-display text-3xl text-ivory tracking-widest leading-none">DART</div>
              <div className="font-mono text-[8.5px] text-warm-grey tracking-[.18em] uppercase leading-tight mt-0.5">CITYWIDE ALCOHOL & NARCOTICS DETECTION</div>
            </div>
          </div>
          <div className="h-[1px] bg-signal-red w-28 mt-4"/>
        </div>

        {/* Headline */}
        <div className="relative z-10">
          <div className="font-display text-[56px] md:text-[72px] text-ivory leading-[.92] tracking-wide mb-6">
            SECURE THE<br/><span className="text-signal-red">CITY.</span><br/>DETECT THE<br/>UNSEEN.
          </div>
        </div>

        {/* Footer meta */}
        
      </div>

      {/* ─── RIGHT PANEL ─── */}
      <div className="w-full md:w-[420px] flex flex-col justify-center p-8 md:p-12 relative bg-charcoal">
        {/* thin red top bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-signal-red"/>

        <div className="max-w-sm w-full mx-auto">
          <div className="mb-8">
            <div className="font-display text-[32px] tracking-widest leading-none mb-1 text-ivory">WELCOME TO DART</div>
            <div className="font-mono text-[10px] tracking-[.18em] uppercase text-warm-grey">New Delhi City Detection Center</div>
          </div>

          <form onSubmit={e=>{e.preventDefault();onLogin();}} className="space-y-5">
            {/* Operator ID */}
            <div>
              <label className="block font-mono text-[9.5px] tracking-[.22em] uppercase mb-2 text-brass">OPERATOR ID</label>
              <input type="text" className="input-dart" placeholder="e.g. DART_OPS_001"
                value={operatorId} onChange={e=>setOperatorId(e.target.value)}/>
            </div>
            {/* Password */}
            <div>
              <label className="block font-mono text-[9.5px] tracking-[.22em] uppercase mb-2 text-brass">PASSWORD</label>
              <div className="relative">
                <input type={showPass?"text":"password"} className="input-dart pr-10"
                  placeholder="Enter password" value={password} onChange={e=>setPassword(e.target.value)}/>
                <button type="button" onClick={()=>setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors text-warm-grey hover:text-brass">
                  {showPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>
            {/* Remember */}
            <div className="flex items-center gap-3">
              <div onClick={()=>setRemember(!remember)}
                className={`w-4 h-4 border cursor-pointer flex items-center justify-center flex-shrink-0 transition-all ${remember?"bg-signal-red border-signal-red":"border-border"}`}>
                {remember && <div className="w-2 h-1.5 bg-ivory"/>}
              </div>
              <span onClick={()=>setRemember(!remember)}
                className="font-mono text-[10px] tracking-[.15em] uppercase cursor-pointer text-warm-grey">
                REMEMBER THIS DEVICE
              </span>
            </div>
            {/* Submit */}
            <button type="submit" className="btn-primary w-full tracking-[.16em]">LOGIN TO DART</button>
          </form>
        </div>
      </div>
    </div>
  );
}
