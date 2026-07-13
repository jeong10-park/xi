module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST 요청만 허용됩니다.' });
    return;
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const body = req.body;

    if (body.action === 'text') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const geminiRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: body.userPrompt }] }],
          systemInstruction: { parts: [{ text: body.systemPrompt }] },
          generationConfig: { responseMimeType: 'application/json' }
        })
      });
      const data = await geminiRes.json();
      res.status(geminiRes.status).json(data);
      return;
    }

    if (body.action === 'image') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;
      const parts = [];
      if (body.referenceImage && body.referenceImage.data) {
        parts.push({ inlineData: { mimeType: body.referenceImage.mimeType, data: body.referenceImage.data } });
      }
      parts.push({ text: body.imagePrompt });
      const geminiRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts }] })
      });
      const data = await geminiRes.json();
      res.status(geminiRes.status).json(data);
      return;
    }

    res.status(400).json({ error: 'action 값이 올바르지 않습니다.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
