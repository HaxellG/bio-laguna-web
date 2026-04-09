import { Zone, Device, SensorReading, DOPrediction } from '../models';

const API_BASE = '/api'; // Servido por Vercel local/remoto

// ── Public API (Async) ────────────────────────────────────────────────────

export async function getZones(): Promise<Zone[]> {
  const res = await fetch(`${API_BASE}/zones`);
  if (!res.ok) throw new Error('Error fetching zones');
  return res.json();
}

export async function getAllDevices(): Promise<Device[]> {
  const res = await fetch(`${API_BASE}/devices`);
  if (!res.ok) throw new Error('Error fetching devices');
  return res.json();
}

export async function getLatestReading(zoneId: string): Promise<SensorReading | null> {
  const res = await fetch(`${API_BASE}/readings/latest?zoneId=${zoneId}`);
  if (!res.ok) throw new Error('Error fetching latest reading');
  return res.json();
}

export async function getLatestReadingByDeviceCodes(codes: string[]): Promise<SensorReading | null> {
  const res = await fetch(`${API_BASE}/readings/latest?deviceCodes=${codes.join(',')}`);
  if (!res.ok) throw new Error('Error fetching latest reading by codes');
  return res.json();
}

export async function getReadingsInRange(
  zoneId: string,
  from: Date,
  to: Date,
): Promise<SensorReading[]> {
  const query = new URLSearchParams({ zoneId, from: from.toISOString(), to: to.toISOString() });
  const res = await fetch(`${API_BASE}/readings/history?${query}`);
  if (!res.ok) throw new Error('Error fetching history by zone');
  const data = await res.json();
  return data.map((r: any) => ({ ...r, timestamp: new Date(r.timestamp) }));
}

export async function getReadingsByDeviceCodes(
  codes: string[],
  from: Date,
  to: Date,
): Promise<SensorReading[]> {
  const query = new URLSearchParams({ deviceCodes: codes.join(','), from: from.toISOString(), to: to.toISOString() });
  const res = await fetch(`${API_BASE}/readings/history?${query}`);
  if (!res.ok) throw new Error('Error fetching history by codes');
  const data = await res.json();
  return data.map((r: any) => ({ ...r, timestamp: new Date(r.timestamp) }));
}

export async function getDOPredictions(): Promise<DOPrediction[]> {
  const res = await fetch(`${API_BASE}/predictions/do`);
  if (!res.ok) throw new Error('Error fetching predictions');
  return res.json();
}

export async function getTotalDevices(): Promise<number> {
  const devices = await getAllDevices();
  return devices.length;
}
