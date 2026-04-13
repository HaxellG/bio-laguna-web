import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, requireSupabase } from './_utils/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    requireSupabase();
    // Para no romper la UI, enviaremos una zona "Global" pero contando los dispositivos reales.
    // Obtenemos los device_id únicos de live_measurements
    const { data: devices, error } = await supabase
      .from('live_measurements')
      .select('device_id')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }

    const uniqueDevices = new Set((devices || []).map((d: any) => d.device_id));

    // Zone Mock basado en los datos reales (Zona Global)
    const mockZones = [
      {
        id: 'global-zone',
        name: 'Zona 1 – Bio-Laguna Global',
        deviceCount: uniqueDevices.size,
        lat: 11.0050, // Ejemplo
        lng: -74.8120, // Ejemplo
        readings: [] // No enviamos readings aquí por rendimiento
      }
    ];

    return res.status(200).json(mockZones);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
