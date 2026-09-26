export type DeviceStatus = "ONLINE" | "OFFLINE" | "ALERT" | "WARNING";
export type ScanResult  = "SAFE" | "CAUTION" | "ALCOHOL" | "ALCOHOL PROXY" | "NARCOTIC" | "NARCOTIC PROXY";
export type LogLevel    = "ALERT" | "WARNING" | "SUCCESS" | "INFO";

export interface SensorReading {
  device_id: string;
  timestamp: string | number;
  temperature: number;
  humidity: number;
  mq2: number;
  mq3: number;
  mq135: number;
  sen0567: number;
  battery?: number;
  signal?: number;
  source_status?: string;
  test_object?: string;
}

export interface PredictionResult {
  id: string;
  window_id: string;
  timestamp: string;
  device_id: string;
  status: "SAFE" | "ALERT" | "ERROR";
  prediction: string | null;
  displayResult?: ScanResult;
  confidence: number;
  probabilities: Record<string, number>;
  features: Record<string, number>;
}

export interface Device {
  id: string;
  location: string;
  platform: string;
  status: DeviceStatus;
  battery: number | null;
  signal: number | null;
  health: number | null;
  lastSync: string | null;
  operatingTime: string | null;
  lastResult: ScanResult;
  confidence: number;
  mapX: number; // percent positions on SVG viewbox 0-100
  mapY: number;
  latestReading?: SensorReading | null;
  latestPrediction?: PredictionResult | null;
}

export interface LogEntry {
  timestamp: string;
  device: string;
  event: string;
  location: string;
  level: LogLevel;
}

export interface Incident {
  id: string;
  type: ScanResult;
  location: string;
  platform: string;
  confidence: number;
  status: "RESPONSE DISPATCHED" | "TEAM NOTIFIED" | "RESOLVED" | "ACKNOWLEDGED";
  team: string;
  time: string;
  device: string;
  latestReading?: SensorReading | null;
}

export interface AlertEvent {
  id: string;
  device_id: string;
  prediction: string;
  display_result: string;
  confidence: number;
  location: string | null;
  platform: string | null;
  status: string;
  created_at: string;
  resolved_at: string | null;
}

const CITY_DEVICE_PROFILES: Record<string, { location: string; mapX: number; mapY: number }> = {
  "SENTRY-014": { location: "Connaught Place", mapX: 48, mapY: 45 },
  "SENTRY-021": { location: "India Gate", mapX: 66, mapY: 76 },
  "SENTRY-032": { location: "Kashmere Gate", mapX: 43, mapY: 20 },
  "SENTRY-008": { location: "ITO", mapX: 59, mapY: 59 },
  "SENTRY-019": { location: "Karol Bagh", mapX: 28, mapY: 46 },
  "SENTRY-027": { location: "Chandni Chowk", mapX: 41, mapY: 33 },
  "SENTRY-041": { location: "Civil Lines", mapX: 38, mapY: 26 },
};

export const DEMO_DEVICES: Device[] = [
  { id: "SENTRY-014", location: "Connaught Place", platform: "Central District", status: "ONLINE", battery: 82, signal: 91, health: 98, lastSync: "09:42:18", operatingTime: "18d 4h", lastResult: "SAFE", confidence: 0.99, mapX: 48, mapY: 45 },
  { id: "SENTRY-021", location: "India Gate", platform: "Central District", status: "ONLINE", battery: 74, signal: 86, health: 96, lastSync: "09:42:12", operatingTime: "12d 7h", lastResult: "SAFE", confidence: 0.98, mapX: 66, mapY: 76 },
  { id: "SENTRY-032", location: "Kashmere Gate", platform: "North District", status: "ALERT", battery: 63, signal: 89, health: 94, lastSync: "09:42:20", operatingTime: "21d 2h", lastResult: "NARCOTIC PROXY", confidence: 0.9634, mapX: 43, mapY: 20 },
  { id: "SENTRY-008", location: "ITO", platform: "East Central District", status: "ONLINE", battery: 91, signal: 95, health: 99, lastSync: "09:42:15", operatingTime: "9d 11h", lastResult: "SAFE", confidence: 0.99, mapX: 59, mapY: 59 },
  { id: "SENTRY-019", location: "Karol Bagh", platform: "West Central District", status: "OFFLINE", battery: 0, signal: 0, health: 76, lastSync: "08:57:02", operatingTime: "6d 1h", lastResult: "SAFE", confidence: 0, mapX: 28, mapY: 46 },
  { id: "SENTRY-027", location: "Chandni Chowk", platform: "Old Delhi District", status: "ONLINE", battery: 57, signal: 82, health: 91, lastSync: "09:42:09", operatingTime: "14d 6h", lastResult: "CAUTION", confidence: 0.84, mapX: 41, mapY: 33 },
  { id: "SENTRY-041", location: "Civil Lines", platform: "North District", status: "ONLINE", battery: 88, signal: 93, health: 97, lastSync: "09:42:17", operatingTime: "4d 9h", lastResult: "SAFE", confidence: 0.99, mapX: 38, mapY: 26 },
];

export function displayDeviceId(id: string): string {
  return id.replace(/^SENTRY-/, "DART-");
}

export function cityLocationForDevice(id: string, fallback = "New Delhi"): string {
  return CITY_DEVICE_PROFILES[id]?.location ?? fallback;
}

export function cityMapPoint(device: Device): { x: number; y: number } {
  const profile = CITY_DEVICE_PROFILES[device.id];
  return profile ? { x: profile.mapX, y: profile.mapY } : { x: device.mapX, y: device.mapY };
}

export function cityMapPointForId(id: string): { x: number; y: number } {
  const profile = CITY_DEVICE_PROFILES[id];
  return profile ? { x: profile.mapX, y: profile.mapY } : { x: 50, y: 50 };
}

export function isAlcoholResult(result: string): boolean {
  return result === "ALCOHOL" || result === "ALCOHOL PROXY";
}

export function isNarcoticResult(result: string): boolean {
  return result === "NARCOTIC" || result === "NARCOTIC PROXY";
}

export function isVisibleDetection(result: string): boolean {
  return isAlcoholResult(result) || isNarcoticResult(result);
}

export const DEMO_INCIDENTS: Incident[] = [
  { id: "DEMO-DART-INC-001", type: "NARCOTIC PROXY", location: "Kashmere Gate", platform: "North District", confidence: 0.9634, status: "RESPONSE DISPATCHED", team: "DART City Response", time: "09:42:18", device: "SENTRY-032" },
  { id: "DEMO-DART-INC-002", type: "ALCOHOL PROXY", location: "India Gate", platform: "Central District", confidence: 0.9412, status: "RESOLVED", team: "DART City Response", time: "09:18:04", device: "SENTRY-021" },
];

export function dashboardIncidentFeed(incidents: Incident[]): Incident[] {
  const visible = incidents.filter(incident => isVisibleDetection(incident.type));
  const activeNarcotic = visible.find(incident => isNarcoticResult(incident.type) && incident.status !== "RESOLVED");
  const resolvedAlcohol = visible.find(incident => isAlcoholResult(incident.type) && incident.status === "RESOLVED");
  return [activeNarcotic ?? DEMO_INCIDENTS[0], resolvedAlcohol ?? DEMO_INCIDENTS[1]];
}

export function dashboardDeviceFeed(devices: Device[], incidents: Incident[]): Device[] {
  const source = devices.length ? devices : DEMO_DEVICES;
  const allowedResults = ["SAFE", "CAUTION", "ALCOHOL", "ALCOHOL PROXY", "NARCOTIC", "NARCOTIC PROXY"];
  return source.map(device => {
    const activeDetection = incidents.find(incident => incident.device === device.id && incident.status !== "RESOLVED" && isVisibleDetection(incident.type));
    if (activeDetection) {
      return { ...device, status: "ALERT", lastResult: activeDetection.type, confidence: activeDetection.confidence };
    }
    if (!allowedResults.includes(String(device.lastResult))) {
      return { ...device, status: device.status === "ALERT" ? "ONLINE" : device.status, lastResult: "SAFE" };
    }
    return device;
  });
}

export function visibleAlertEvents(events: AlertEvent[]): AlertEvent[] {
  return events.filter(event => isVisibleDetection(event.display_result));
}

export function visibleLogEntries(logs: LogEntry[]): LogEntry[] {
  return logs.filter(log => !/explosives?/i.test(log.event));
}

export function truncateConfidencePercent(value: number): string {
  return (Math.trunc(value * 100) / 100).toFixed(2);
}

export const DETECTION_DIST = [
  { name:"SAFE",           value:847, color:"#3FB950" },
  { name:"CAUTION",        value:43,  color:"#F4B942" },
  { name:"ALCOHOL PROXY",  value:18,  color:"#E05252" },
  { name:"NARCOTIC PROXY", value:12,  color:"#E05252" },
];
