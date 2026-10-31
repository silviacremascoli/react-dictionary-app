require("dotenv").config();

const axios = require("axios");
const express = require("express");
const { parseMwPronunciation } = require("./src/lib/pronunciation");

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
    const result = parseMwPronunciation(data);
    return response.json(result);
  } catch {
    return response.status(502).json({ error: "Pronunciation lookup failed." });
  }
});


app.get("/api/images", async (request, response) => {
  const query = String(request.query.query || "").trim();
  if (!query) {
    return response.status(400).json({ error: "A query is required." });
  }

  const apiKey = String(process.env.SHE_CODES_IMAGES_API_KEY || "");
  if (!apiKey) {
    return response.status(503).json({ error: "SheCodes Images API key is not configured." });
  }

  try {
    const apiUrl = `https://api.shecodes.io/images/v1/search?query=${encodeURIComponent(query)}&key=${apiKey}`;
    const { data } = await axios.get(apiUrl);

    return response.json(data);
  } catch (error) {
    return response.status(502).json({ error: "Images lookup failed." });
  }
});

const port = process.env.PORT || 5050;
app.listen(port, () => {
  console.log(`API proxy listening on port ${port}`);
});