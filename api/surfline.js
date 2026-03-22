export default async function handler(req, res) {
  const { spotId, type } = req.query;
  if (!spotId || !type) {
    return res.status(400).json({ error: 'Missing spotId or type' });
  }
  const validTypes = ['wave', 'wind'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: 'type must be wave or wind' });
  }
  // Only allow valid Surfline spot IDs (24-char hex)
  if (!/^[a-f0-9]{24}$/.test(spotId)) {
    return res.status(400).json({ error: 'Invalid spotId' });
  }
  const url = `https://services.surfline.com/kbyg/spots/forecasts/${type}?spotId=${spotId}&days=1&intervalHours=3`;
  try {
    const r = await fetch(url);
    const data = await r.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.status(200).json(data);
  } catch (e) {
    return res.status(502).json({ error: 'Surfline API error' });
  }
}
