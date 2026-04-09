import { VercelRequest, VercelResponse } from '@vercel/node';

// Simulamos temporalmente la predicción en backend hasta integrar modelo de IA
// Esto limpia el código de frontend
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const rand = (min: number, max: number, dec = 1) => parseFloat((Math.random() * (max - min) + min).toFixed(dec));

  const formatTime = (d: Date) => {
    let hh = d.getHours();
    let mm = String(d.getMinutes()).padStart(2, '0');
    const ampm = hh >= 12 ? 'PM' : 'AM';
    hh = hh % 12 || 12;
    return `${hh}:${mm} ${ampm}`;
  };

  const now = new Date();
  const predictions = Array.from({ length: 9 }, (_, i) => ({
    time: formatTime(new Date(now.getTime() + i * 60 * 60 * 1000)),
    value: parseFloat((rand(3, 10, 1)).toFixed(1)),
  }));

  return res.status(200).json(predictions);
}
