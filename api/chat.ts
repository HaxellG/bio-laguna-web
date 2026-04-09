import { VercelRequest, VercelResponse } from '@vercel/node';

const DEMO_RESPONSES: string[] = [
  'Based on the current sensor data, the turbidity levels are elevated at 4.2 NTU. High turbidity can reduce photosynthesis in submerged vegetation, which in turn lowers dissolved oxygen production. Please monitor this closely.',
  'The pH reading of 7.8 is within the healthy range for most freshwater species (6.5–8.5). However, a rising trend combined with high temperatures may signal algal growth.',
  'Temperature at 26 °C is near the upper comfort threshold for many tropical freshwater species. I recommend correlating this with the dissolved oxygen prediction model in the Dashboard.',
  'The salinity trend appears stable. Sudden changes in salinity stress osmoregulation in fish — I recommend setting alerts if it deviates more than ±3 ppt from baseline.',
  'Note: I can provide theoretical analysis and interpret sensor trends, but I cannot generate charts directly. Please use the **Dashboard** for visual data.',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Simulate delay logic before replying
  await new Promise((resolve) => setTimeout(resolve, 800));

  const reply = DEMO_RESPONSES[Math.floor(Math.random() * DEMO_RESPONSES.length)];

  return res.status(200).json({
    role: 'assistant',
    content: reply,
    timestamp: new Date().toISOString()
  });
}
