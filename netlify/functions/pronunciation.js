exports.handler = async (event) => {
  const word = String(event.queryStringParameters?.word || "").trim();
  if (!word) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "A word is required." }),
    };
  }

  const apiKey = process.env.MW_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 503,
      body: JSON.stringify({ error: "Merriam-Webster API key is not configured." }),
    };
  }

  try {
    const apiUrl = new URL(
      `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${encodeURIComponent(word)}`
    );
    apiUrl.searchParams.set("key", apiKey);

    const upstreamResponse = await fetch(apiUrl);
    if (!upstreamResponse.ok) {
      return {
        statusCode: 502,
        body: JSON.stringify({ error: "Pronunciation lookup failed." }),
      };
    }

    const data = await upstreamResponse.json();
    const entry = Array.isArray(data)
      ? data.find((item) => item && typeof item === "object" && item.hwi?.prs?.length)
      : null;
    const pronunciation = entry?.hwi.prs.find((item) => item.mw || item.sound?.audio);

    if (!pronunciation) {
      return { statusCode: 200, body: "null" };
    }

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

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: pronunciation.mw || "",
        audio: audio
          ? `https://media.merriam-webster.com/audio/prons/en/us/mp3/${audioDirectory}/${encodeURIComponent(audio)}.mp3`
          : "",
      }),
    };
  } catch {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: "Pronunciation lookup failed." }),
    };
  }
};
