// Smart Inputs AI recommendation edge function
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { region, lang } = await req.json();
    if (!region || typeof region !== "string") {
      return new Response(JSON.stringify({ error: "region required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const month = new Date().toLocaleString("en-US", { month: "long" });
    const sys = `You are an Ethiopian agricultural extension agent. Give ${lang === "am" ? "Amharic" : "English"} recommendations for the region and current season. Be specific and practical.`;
    const prompt = `Region: ${region}, Ethiopia. Current month: ${month}.
Recommend the BEST currently-available inputs for this region & season.
Return JSON only via the function call.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: sys }, { role: "user", content: prompt }],
        tools: [{
          type: "function",
          function: {
            name: "recommend_inputs",
            description: "Return seasonal farming input recommendations.",
            parameters: {
              type: "object",
              properties: {
                seeds: { type: "array", items: { type: "string" }, description: "3-5 recommended seed varieties" },
                fertilizers: { type: "array", items: { type: "string" }, description: "3-5 fertilizer/soil recs" },
                feed: { type: "array", items: { type: "string" }, description: "3-5 livestock feed recs" },
                seasonal_tip: { type: "string", description: "One short tip for this month/region" },
              },
              required: ["seeds", "fertilizers", "feed", "seasonal_tip"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "recommend_inputs" } },
      }),
    });

    if (resp.status === 429) return new Response(JSON.stringify({ error: "Rate limit, try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (resp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI error", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await resp.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const parsed = args ? JSON.parse(args) : null;
    return new Response(JSON.stringify({ data: parsed, generated_at: new Date().toISOString() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
