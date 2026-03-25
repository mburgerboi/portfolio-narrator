export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body = req.body;

  // If body is a string (unparsed), parse it manually
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.status(400).json({ error: "Invalid JSON body" });
    }
  }

  // If body is still empty, read it from the raw stream
  if (!body) {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    try {
      body = JSON.parse(Buffer.concat(chunks).toString());
    } catch (e) {
      return res.status(400).json({ error: "Could not parse request body" });
    }
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  res.status(response.status).json(data);
}
