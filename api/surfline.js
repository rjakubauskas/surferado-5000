const https = require('https');

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Surferado/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Invalid JSON')); }
      });
    }).on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  const { spotId, type } = req.query;
  if (!spotId || !type) {
    return res.status(400).json({ error: 'Missing spotId or type' });
  }
  if (!['wave', 'wind'].includes(type)) {
    return res.status(400).json({ error: 'type must be wave or wind' });
  }
  if (!/^[a-f0-9]{24}$/.test(spotId)) {
    return res.status(400).json({ error: 'Invalid spotId' });
  }
  const url = `https://services.surfline.com/kbyg/spots/forecasts/${type}?spotId=${spotId}&days=1&intervalHours=3`;
  try {
    const data = await fetchJSON(url);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.status(200).json(data);
  } catch (e) {
    return res.status(502).json({ error: 'Surfline API error', detail: e.message });
  }
};
