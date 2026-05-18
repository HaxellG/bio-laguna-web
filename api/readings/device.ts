import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_utils/supabase.js';

/**
 * GET /api/readings/device?deviceId=<device_id>
 * Retorna la última lectura de un dispositivo específico.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { deviceId } = req.query;

  if (!deviceId || typeof deviceId !== 'string') {
    return res.status(400).json({ error: 'Se requiere el parámetro deviceId' });
  }

  try {
    const { data, error } = await supabase
      .from('live_measurements')
      .select('*')
      .eq('device_id', deviceId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(200).json(null);
    }

    return res.status(200).json({
      device_id: data.device_id,
      timestamp: new Date(data.created_at),
      temperature: data.temperature,
      ph: data.ph,
      turbidity: data.turbidity,
      conductivity: data.conductivity || 0,
      dissolved_oxygen: data.dissolved_oxygen ?? null,
      lat: data.lat,
      lon: data.lon,
    });

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
