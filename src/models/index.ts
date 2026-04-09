// ── Sensor reading snapshot ─────────────────────────────────────────────
export interface SensorReading {
  timestamp: Date;
  temperature: number; // °C
  ph: number;
  salinity: number;    // ppt
  turbidity: number;   // NTU
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

export type FilterMode = 'zone' | 'device';

// ── Dissolved-oxygen prediction point ────────────────────────────────────
export interface DOPrediction {
  time: string;
  value: number; // mg/L
}

// ── Custom chart config ───────────────────────────────────────────────────
export type SensorVariable = 'temperature' | 'ph' | 'salinity' | 'turbidity';

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
