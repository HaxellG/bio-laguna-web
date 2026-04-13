import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, requireSupabase } from './_utils/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    requireSupabase();
    // Extraer registros recientes de live_measurements para mapear GPS a los devices
    const { data, error } = await supabase
      .from('live_measurements')
      .select('device_id, lat, lon')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Remover duplicados y obtener los metadados correctos (lat y lon de la lectura más reciente de cada uno)
    const devicesMap = new Map();
    for (const record of data || []) {
      if (!devicesMap.has(record.device_id)) {
        devicesMap.set(record.device_id, {
          code: record.device_id,
          zoneId: 'global-zone',
          zoneName: 'Zona 1 – Bio-Laguna Global',
          lat: record.lat,
          lng: record.lon,
          readings: [] // vacío por perfomance
        });
      }
    }

    return res.status(200).json(Array.from(devicesMap.values()));
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
