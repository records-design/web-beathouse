/**
 * Val.town HTTP Val — VirusTotal proxy para BeatHouse
 *
 * SETUP:
 * 1. Creá cuenta en https://val.town
 * 2. Click en "New Val" → HTTP Val
 * 3. Pegá este código completo
 * 4. En el panel izquierdo → "Environment Variables" → agregá:
 *    VT_API_KEY = tu key de virustotal.com
 * 5. Click en "Run" — te da una URL tipo:
 *    https://TU-USUARIO-vt-proxy-beathouse.web.val.run
 * 6. Copiá esa URL y pegala en script.js donde dice VT_WORKER
 */

const ALLOWED_ORIGIN = "https://records-design.github.io";

export default async function(req: Request): Promise<Response> {
  const origin = req.headers.get("Origin") || "";

  const corsHeaders = {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const VT_KEY = Deno.env.get("VT_API_KEY");
  if (!VT_KEY) {
    return new Response("VT_API_KEY no configurada", { status: 500 });
  }

  let vtRes: Response;

  if (body.action === "scan") {
    const params = new URLSearchParams();
    params.append("url", body.url);
    vtRes = await fetch("https://www.virustotal.com/api/v3/urls", {
      method: "POST",
      headers: {
        "x-apikey": VT_KEY,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
  } else if (body.action === "result") {
    vtRes = await fetch(
      "https://www.virustotal.com/api/v3/analyses/" + body.id,
      { headers: { "x-apikey": VT_KEY } }
    );
  } else {
    return new Response("action inválida", { status: 400 });
  }

  const data = await vtRes.json();
  return new Response(JSON.stringify(data), {
    status: vtRes.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
