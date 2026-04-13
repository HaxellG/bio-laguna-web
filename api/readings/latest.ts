import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_utils/supabase';

// Helper: promediar lecturas (copiado de sensorService lógica original)
function avgReadings(list: any[]) {
  const n = list.length;
  if (n === 0) return null;
  return {
    timestamp: list[0].timestamp,
    temperature: list.reduce((s, r) => s + r.temperature, 0) / n,
    ph: list.reduce((s, r) => s + r.ph, 0) / n,
    salinity: list.reduce((s, r) => s + r.salinity, 0) / n,
    turbidity: list.reduce((s, r) => s + r.turbidity, 0) / n,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { deviceCodes } = req.query;

  try {
    let query = supabase
      .from('live_measurements')
      .select('*')
      .order('created_at', { ascending: false });

    if (deviceCodes && typeof deviceCodes === 'string') {
      const codes = deviceCodes.split(',');
      query = query.in('device_id', codes);
      
      // Necesitamos asegurar que tomamos hasta 1 de cada device y los promediamos,
      // para mantener backend MÍNIMO obtenemos el top 50, sacamos la ultima de cada código de ref y promediamos
      const { data, error } = await query.limit(50);
      if (error) throw error;

      // Group by device_id and pick the first (latest)
      const latestPerDevice = new Map();
      for (const row of (data || [])) {
        if (!latestPerDevice.has(row.device_id)) {
          latestPerDevice.set(row.device_id, {
            timestamp: new Date(row.created_at),
            temperature: row.temperature,
            ph: row.ph,
            salinity: row.conductivity || 0,
            turbidity: row.turbidity
          });
        }
      }

      const values = Array.from(latestPerDevice.values());
      return res.status(200).json(avgReadings(values) || null);
    } else {
      // By zoneId (we only have 1 global zone really, just return absolute latest reading)
      const { data, error } = await query.limit(1).maybeSingle();
      if (error) throw error;

      if (!data) return res.status(200).json(null);

      return res.status(200).json({
        timestamp: new Date(data.created_at),
        temperature: data.temperature,
        ph: data.ph,
        salinity: data.conductivity || 0,
        turbidity: data.turbidity
      });
    }

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
