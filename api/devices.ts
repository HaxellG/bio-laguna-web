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

    // Obtener última ubicación válida de cada device
    const { data, error } = await supabase
      .rpc('get_devices_latest_location');

    if (error) {
      return res.status(500).json({
        error: error.message
      });
    }

    const devices = (data || []).map((record: any) => ({
      code: record.device_id,
      zoneId: 'global-zone',
      zoneName: 'Zona 1 – Bio-Laguna Global',
      lat: record.lat,
      lng: record.lon,
      readings: [] // vacío por performance
    }));

    return res.status(200).json(devices);

  } catch (err: any) {
    return res.status(500).json({
      error: err.message
    });
  }
}