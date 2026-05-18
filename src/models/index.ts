// ── Sensor reading snapshot ─────────────────────────────────────────────
export interface SensorReading {
  timestamp: Date;
  temperature: number; // °C
  ph: number;
  turbidity: number;   // NTU
  dissolved_oxygen?: number | null; // mg/L
}

// ── Zone ─────────────────────────────────────────────────────────────────
export interface Zone {
  id: string;
  name: string;
  deviceCount: number;
  lat: number;
  lng: number;
  readings: SensorReading[];
}

// ── Device ────────────────────────────────────────────────────────────────
export interface Device {
  code: string;     // e.g. "buoy_live_01"
  zoneId: string;
  zoneName: string;
  lat?: number;
  lng?: number;
  readings: SensorReading[];
}

// ── Map Device (simplified from get_devices_latest_location RPC) ─────────
export interface MapDevice {
  device_id: string;
  lat: number;
  lon: number;
}

// ── Single device latest reading ──────────────────────────────────────────
export interface DeviceReading {
  device_id: string;
  timestamp: Date;
  temperature: number;
  ph: number;
  turbidity: number;
  conductivity: number;
  dissolved_oxygen: number | null;
  lat: number;
  lon: number;
}

export type FilterMode = 'zone' | 'device';

// ── Dissolved-oxygen prediction point ────────────────────────────────────
export interface DOPrediction {
  time: string;
  value: number; // mg/L
}

// ── Custom chart config ───────────────────────────────────────────────────
export type SensorVariable = 'temperature' | 'ph' | 'turbidity' | 'dissolved_oxygen';

export interface CustomChart {
  id: string;
  variableX: SensorVariable;
  variableY: SensorVariable;
  from: Date;
  to: Date;
}

// ── Chat message ──────────────────────────────────────────────────────────
export type MessageRole = 'assistant' | 'user';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}
