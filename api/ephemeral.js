/**
 * This API route creates an ephemeral key for use with the Realtime API.
 * It’s called by the client to get a short-lived session token that can be used
 * to connect directly to OpenAI’s Realtime API from the browser.
 */

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Create a new ephemeral session
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // ✅ Fixed model name - remove old preview date
        model: "gpt-4o-realtime-preview",
        voice: "alloy",
        // ✅ Explicit transcription model so speech-to-text works
        input_audio_transcription: { model: "whisper-1" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error creating ephemeral session:", errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();

    // Return the ephemeral key to the client
    res.status(200).json(data);

  } catch (error) {
    console.error("Server error creating ephemeral session:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
