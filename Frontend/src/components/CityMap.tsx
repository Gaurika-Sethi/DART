import type { ReactNode } from "react";
import type { Device } from "../data";
import { cityLocationForDevice, cityMapPoint, displayDeviceId, isVisibleDetection } from "../data";
import ThreatIcon from "./ThreatIcon";

const ROADS = [
  "M 70 82 C 230 110, 390 68, 640 105 S 850 132, 960 102",
  "M 38 190 C 200 170, 310 210, 500 188 S 760 180, 925 220",
  "M 55 318 C 250 284, 420 337, 608 300 S 815 310, 930 282",
  "M 122 30 C 178 142, 177 270, 120 390",
  "M 300 24 C 256 126, 340 240, 304 390",
  "M 520 18 C 458 137, 550 256, 500 388",
  "M 744 20 C 684 150, 770 274, 702 386",
  "M 180 300 C 270 210, 389 176, 474 198 C 555 220, 572 282, 528 330",
  "M 474 198 C 542 226, 620 264, 730 344",
];

export default function CityMap({ devices, onDevice, selectedId, className = "", children }: {
  devices: Device[];
  onDevice?: (device: Device) => void;
  selectedId?: string;
  className?: string;
  children?: ReactNode;
}) {
  const mappedDevices = selectedId ? devices.filter(device => device.id === selectedId) : devices;

  return (
    <div className={`relative w-full overflow-hidden bg-obsidian ${className}`}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 420" preserveAspectRatio="none" aria-label="Map of central New Delhi" role="img">
        <defs>
          <pattern id="city-blocks" width="46" height="38" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
            <path d="M 4 4 H 38 V 30 H 4 Z" fill="#15171A" fillOpacity=".8" stroke="#292C30" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="1000" height="420" fill="#090A0C" />
        <path d="M 760 -15 C 825 70, 782 152, 846 218 S 900 342, 850 440 L 1015 440 L 1015 -15 Z" fill="#102126" />
        <path d="M 770 -10 C 835 76, 794 150, 855 220 S 910 342, 860 430" fill="none" stroke="#356270" strokeOpacity=".45" strokeWidth="24" />
        <path d="M 0 0 H 770 V 420 H 0 Z" fill="url(#city-blocks)" />
        <path d="M 568 288 C 610 260, 674 270, 711 304 C 738 329, 717 376, 674 390 C 622 400, 577 368, 558 334 Z" fill="#14251B" stroke="#292C30" strokeWidth="2" />
        <path d="M 424 174 C 451 150, 501 150, 529 174 C 548 192, 542 219, 520 234 C 486 250, 446 234, 427 214 Z" fill="#14251B" stroke="#292C30" strokeWidth="2" />
        {ROADS.map((road, index) => (
          <g key={road}>
            <path d={road} fill="none" stroke="#292C30" strokeWidth={index < 3 ? 22 : 16} strokeLinecap="round" />
            <path d={road} fill="none" stroke={index === 1 ? "#D98E04" : "#8C9199"} strokeOpacity={index === 1 ? ".46" : ".38"} strokeWidth="2" strokeDasharray={index === 1 ? "none" : "8 11"} />
          </g>
        ))}
        <circle cx="478" cy="203" r="43" fill="none" stroke="#F4B942" strokeOpacity=".36" strokeWidth="2" />
        <circle cx="478" cy="203" r="28" fill="none" stroke="#F4B942" strokeOpacity=".22" strokeWidth="1" />
        <path d="M 675 362 L 675 319 L 648 319 L 648 362 Z M 675 320 L 700 275" fill="none" stroke="#F4B942" strokeOpacity=".36" strokeWidth="2" />
        <g fill="#8C9199" fontFamily="JetBrains Mono, monospace" fontSize="12" letterSpacing="2">
          <text x="84" y="67">NORTH DELHI</text>
          <text x="354" y="134">CHANDNI CHOWK</text>
          <text x="449" y="265">CONNAUGHT PLACE</text>
          <text x="555" y="251">ITO</text>
          <text x="603" y="400">INDIA GATE</text>
          <text x="821" y="170" transform="rotate(78 821 170)" fill="#6A929D">YAMUNA</text>
        </g>
        <g fill="#F4B942" fontFamily="JetBrains Mono, monospace" fontSize="10" letterSpacing="1.5">
          <text x="40" y="398">NEW DELHI, INDIA</text>
          <text x="916" y="398" textAnchor="end">CITY GRID // LIVE</text>
        </g>
      </svg>
      {mappedDevices.map(device => {
        const point = cityMapPoint(device);
        const location = cityLocationForDevice(device.id, device.location);
        const detection = isVisibleDetection(device.lastResult);
        const markerColor = detection ? "#E05252" : device.status === "ONLINE" ? "#3FB950" : "#8C9199";
        const Marker = onDevice ? "button" : "div";
        return (
          <Marker key={device.id} {...(onDevice ? { type: "button", onClick: () => onDevice(device) } : {})}
            aria-label={`${displayDeviceId(device.id)} at ${location}`}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}>
            <span className="relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-obsidian" style={{ background: markerColor, boxShadow: `0 0 9px ${markerColor}80` }}>
              <ThreatIcon state={device.lastResult} size={19} className="rounded-full bg-obsidian/90 p-0.5" />
              {detection && device.status === "ALERT" && <span className="absolute inset-0 rounded-full pulse-red" style={{ background: markerColor }} />}
            </span>
            <span className="absolute left-8 top-0 whitespace-nowrap border border-border bg-charcoal/95 px-2 py-1">
              <span className="block font-mono text-[8.5px] tracking-widest text-ivory">{displayDeviceId(device.id)}</span>
              <span className="block font-mono text-[7.5px] text-warm-grey">{location}</span>
            </span>
          </Marker>
        );
      })}
      {!selectedId && <div className="absolute bottom-3 right-3 border border-border bg-charcoal/95 p-2.5">
        {[["ONLINE", "#3FB950"], ["DETECTION", "#E05252"], ["OFFLINE", "#8C9199"]].map(([label, color]) => (
          <div key={label} className="mb-1 flex items-center gap-1.5 last:mb-0">
            <span className="h-2 w-2 rounded-full" style={{ background: color }} />
            <span className="font-mono text-[8px] tracking-widest" style={{ color }}>{label}</span>
          </div>
        ))}
      </div>}
      {children}
    </div>
  );
}