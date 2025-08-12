// /api/ephemeral.js (Vercel serverless function)
// Issues a short-lived ephemeral key for the OpenAI Realtime API, with CORS enabled.
export default async function handler(req, res) {
  // --- CORS ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY on server" });
    }
    // Create a Realtime session to mint an ephemeral client_secret.
    const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview"
      })
    });
    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).json({ error: "OpenAI session create failed", details: text });
    }
    const session = await r.json();
    // session.client_secret.value is the ephemeral key to use in the browser
    return res.status(200).json({ client_secret: session.client_secret });
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) });
  }
}
