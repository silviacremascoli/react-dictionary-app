exports.handler = async (event) => {
  const query = String(event.queryStringParameters?.query || "").trim();
  if (!query) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "A query is required." }),
    };
  }

  const apiKey = process.env.SHE_CODES_IMAGES_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 503,
      body: JSON.stringify({ error: "SheCodes Images API key is not configured." }),
    };
  }

  try {
    const apiUrl = new URL("https://api.shecodes.io/images/v1/search");
    apiUrl.searchParams.set("query", query);
    apiUrl.searchParams.set("key", apiKey);

    const upstreamResponse = await fetch(apiUrl);

    const data = await upstreamResponse.json();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: "Images lookup failed." }),
    };
  }
};