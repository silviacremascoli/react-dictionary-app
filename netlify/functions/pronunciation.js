const { parseMwPronunciation } = require("../../src/lib/pronunciation");

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
    const result = parseMwPronunciation(data);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    };
  } catch {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: "Pronunciation lookup failed." }),
    };
  }
};
