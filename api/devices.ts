import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, requireSupabase } from './_utils/supabase.js';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    requireSupabase();

    // Obtener última ubicación válida de cada device usando la función RPC
    const { data, error } = await supabase
      .rpc('get_devices_latest_location');

    if (error) {
      return res.status(500).json({
        error: error.message
      });
    }

    // Retornar la lista limpia: solo device_id, lat, lon
    const devices = (data || []).map((record: any) => ({
      device_id: record.device_id,
      lat: record.lat,
      lon: record.lon,
    }));

    return res.status(200).json(devices);

  } catch (err: any) {
    return res.status(500).json({
      error: err.message
    });
  }
}