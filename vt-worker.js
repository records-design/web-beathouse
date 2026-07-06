/**
 * Cloudflare Worker — VirusTotal proxy para BeatHouse
 *
 * DEPLOY:
 * 1. Entrá a https://dash.cloudflare.com/ → Workers & Pages → Create Worker
 * 2. Pegá este código y guardá el worker (ej: "vt-proxy-beathouse")
 * 3. En Settings → Variables → agregá:
 *    VT_API_KEY = <tu API key de VirusTotal (gratis en virustotal.com)>
 * 4. Anotá la URL del worker (ej: https://vt-proxy-beathouse.TU-USUARIO.workers.dev)
 * 5. En script.js de BeatHouse, reemplazá VT_WORKER con esa URL
 */

const ALLOWED_ORIGIN = 'https://records-design.github.io'; // tu dominio de GitHub Pages

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response('Invalid JSON', { status: 400 });
    }

    const VT_KEY = env.VT_API_KEY;
    if (!VT_KEY) return new Response('VT_API_KEY no configurada', { status: 500 });

    let vtRes;

    if (body.action === 'scan') {
      // Enviar URL a VirusTotal para escanear
      const fd = new FormData();
      fd.append('url', body.url);
      vtRes = await fetch('https://www.virustotal.com/api/v3/urls', {
        method: 'POST',
        headers: { 'x-apikey': VT_KEY },
        body: fd,
      });
    } else if (body.action === 'result') {
      // Consultar resultado del análisis por ID
      vtRes = await fetch('https://www.virustotal.com/api/v3/analyses/' + body.id, {
        headers: { 'x-apikey': VT_KEY },
      });
    } else {
      return new Response('action inválida', { status: 400 });
    }

    const data = await vtRes.json();
    return new Response(JSON.stringify(data), {
      status: vtRes.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      },
    });
  },
};
