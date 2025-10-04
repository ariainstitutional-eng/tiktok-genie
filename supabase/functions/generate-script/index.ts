import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { niche, promptExtra } = await req.json();

    if (!niche) {
      console.error('Missing niche parameter');
      return new Response(JSON.stringify({ error: 'Niche is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!lovableApiKey) {
      console.error('Missing Lovable API key');
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Generating script for niche:', niche);

    const systemPrompt = `You are a short-form social media copywriter specializing in viral TikTok and Instagram Reels content. 

Your task:
- Write engaging 18-22 second spoken scripts (40-60 words)
- Include a powerful hook within the first 3 seconds
- Use short, punchy sentences
- End with "Check link in bio" as CTA
- Make it conversational and authentic
- Focus on curiosity gaps and emotional triggers

Write ONE script only in a natural speaking style.`;

    const userPrompt = `Niche: ${niche}${promptExtra ? `\nExtra instructions: ${promptExtra}` : ''}

Create a viral script that hooks viewers immediately and keeps them watching until the end.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 200,
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('AI API error:', error);
      throw new Error(error.error?.message || 'Failed to generate script');
    }

    const data = await response.json();
    const script = data.choices[0].message.content.trim();

    console.log('Generated script:', script);

    return new Response(JSON.stringify({ script }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-script function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});