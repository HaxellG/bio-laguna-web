import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_utils/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { deviceCodes, zoneId, from, to } = req.query;

  try {
    let query = supabase
      .from('live_measurements')
      .select('*')
      .order('created_at', { ascending: true }); // Orden cronológico para las gráficas

    if (from) {
      query = query.gte('created_at', from as string);
    }
    if (to) {
      query = query.lte('created_at', to as string);
    }

    if (deviceCodes && typeof deviceCodes === 'string') {
      const codes = deviceCodes.split(',');
      query = query.in('device_id', codes);
    }
    // Si envían zoneId y no deviceCodes, por ahora asumimos Global, entonces fetch todo el rango temporal

    const { data, error } = await query;
    if (error) throw error;

    const readings = (data || []).map(row => ({
      timestamp: new Date(row.created_at),
      temperature: row.temperature,
      ph: row.ph,
      // Mapeamos conductivity a salinity para que el front no se rompa
      salinity: row.conductivity || 0, 
      turbidity: row.turbidity
    }));

    // TODO: Si el frontend se traba con muchos puntos (ej. 7 días de datos per minuto),
    // aquí podemos meter lógica de agrupamiento por horas.
    // Por ahora enviamos crudo para mantener sencillez.

    return res.status(200).json(readings);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
