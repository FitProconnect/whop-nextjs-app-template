// Server-side proxy to the Whop API.
// Protects the WHOP_API_KEY by attaching it server-side only.
// Supports GET and POST (and other common methods) and forwards headers/body.

/**
 * TODO: Add rate limiting (e.g. per IP / per API key) to prevent abuse.
 * TODO: Restrict allowed endpoints (whitelist) to avoid open proxy behavior.
 */

export default async function handler(req, res) {
  const { method, query } = req;

  const WHOP_API_KEY = process.env.WHOP_API_KEY;
  if (!WHOP_API_KEY) {
    return res.status(500).json({ error: 'WHOP_API_KEY not configured on server' });
  }

  // Determine target path. Use query.param `path` (e.g. /v1/users) or fallback to '/'.
  // Accept both ?path=/users and ?path=users
  let targetPath = query.path || '';
  if (Array.isArray(targetPath)) targetPath = targetPath.join('/');
  if (!targetPath) targetPath = '/';
  if (!targetPath.startsWith('/')) targetPath = `/${targetPath}`;

  const WHOP_BASE = process.env.WHOP_API_BASE || 'https://api.whop.com';
  const targetUrl = `${WHOP_BASE.replace(/\/+$/,'')}${targetPath}`;

  try {
    // Build forwarded headers: copy incoming headers except hop-by-hop and sensitive ones.
    const forbidden = new Set(['host', 'connection', 'content-length', 'cookie', 'authorization']);
    const forwardedHeaders = {};
    for (const [k, v] of Object.entries(req.headers || {})) {
      if (forbidden.has(k.toLowerCase())) continue;
      if (v === undefined) continue;
      forwardedHeaders[k] = v;
    }

    // Attach server-side API key
    forwardedHeaders['authorization'] = `Bearer ${WHOP_API_KEY}`;

    // Prepare fetch options
    const fetchOptions = {
      method,
      headers: forwardedHeaders,
      redirect: 'follow',
    };

    // Forward body for methods that typically have one
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      // If body was parsed (JSON), stringify it and ensure content-type
      if (req.body && typeof req.body === 'object' && !(req.body instanceof Buffer)) {
        fetchOptions.body = JSON.stringify(req.body);
        if (!fetchOptions.headers['content-type']) {
          fetchOptions.headers['content-type'] = 'application/json';
        }
      } else if (typeof req.body === 'string' || req.body instanceof Buffer) {
        fetchOptions.body = req.body;
      }
    }

    const upstream = await fetch(targetUrl, fetchOptions);

    const contentType = upstream.headers.get('content-type') || '';
    const status = upstream.status;

    // Try parse JSON, otherwise return text
    const text = await upstream.text();
    if (contentType.includes('application/json')) {
      try {
        const json = JSON.parse(text);
        return res.status(status).json(json);
      } catch (e) {
        // fallthrough to return raw text
      }
    }

    // Return as plain text with original status
    res.status(status).setHeader('content-type', contentType || 'text/plain; charset=utf-8');
    return res.send(text);
  } catch (err) {
    console.error('Whop proxy error', err);
    return res.status(502).json({ error: 'Bad gateway', details: String(err) });
  }
}
