require("dotenv").config();

const axios = require("axios");
const express = require("express");

const app = express();

app.get("/api/pronunciation", async (request, response) => {
  const word = String(request.query.word || "").trim();
  if (!word) {
    return response.status(400).json({ error: "A word is required." });
  }

  if (!process.env.MW_API_KEY) {
    return response.status(503).json({ error: "Merriam-Webster API key is not configured." });
  }

  try {
    const apiUrl = `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${encodeURIComponent(word)}`;
    const { data } = await axios.get(apiUrl, {
      params: { key: process.env.MW_API_KEY },
    });
    const entry = Array.isArray(data)
      ? data.find((item) => item && typeof item === "object" && item.hwi?.prs?.length)
      : null;
    const pronunciation = entry?.hwi.prs.find((item) => item.mw || item.sound?.audio);

    if (!pronunciation) return response.json(null);

    const audio = pronunciation.sound?.audio;
    const audioDirectory = audio
      ? audio.startsWith("bix")
        ? "bix"
        : audio.startsWith("gg")
          ? "gg"
          : /^[0-9_]/.test(audio)
            ? "number"
            : audio[0].toLowerCase()
      : null;

    return response.json({
      text: pronunciation.mw || "",
      audio: audio
        ? `https://media.merriam-webster.com/audio/prons/en/us/mp3/${audioDirectory}/${encodeURIComponent(audio)}.mp3`
        : "",
    });
  } catch {
    return response.status(502).json({ error: "Pronunciation lookup failed." });
  }
});

const port = process.env.PORT || 5050;
app.listen(port, () => {
  console.log(`Pronunciation API proxy listening on port ${port}`);
});