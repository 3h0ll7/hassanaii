import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Generate portrait with black t-shirt
    const casualPrompt = `Using the face and identity from the reference image, create a photorealistic portrait of this exact person wearing a plain black t-shirt. The image should be:
- Passport photo style framing (head and shoulders, upper chest visible)
- Pure white background with no texture
- Professional studio lighting from the front
- Person looking directly at camera with neutral expression
- Sharp focus, 4K quality
- Maintain exact facial features, skin tone, and identity from the reference`;

    // Generate portrait with Iron Man suit
    const ironManPrompt = `Using the face and identity from the reference image, create a photorealistic portrait of this exact person wearing the classic Iron Man suit with closed helmet. The image should be:
- Passport photo style framing (head/helmet and shoulders, upper chest visible)
- Pure white background with no texture
- Professional studio lighting from the front
- Helmet looking directly at camera
- The suit should be the classic red and gold cinematic Iron Man armor
- Sharp focus, 4K quality, highly detailed armor
- Same exact positioning and framing as a standard portrait`;

    console.log("Generating casual portrait...");
    
    // Generate casual portrait
    const casualResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: casualPrompt },
              { 
                type: "image_url", 
                image_url: { url: imageBase64 }
              }
            ]
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!casualResponse.ok) {
      const errorText = await casualResponse.text();
      console.error("Casual portrait error:", casualResponse.status, errorText);
      
      if (casualResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (casualResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Failed to generate casual portrait: ${errorText}`);
    }

    const casualData = await casualResponse.json();
    const casualImage = casualData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    console.log("Generating Iron Man portrait...");

    // Generate Iron Man portrait
    const ironManResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: ironManPrompt },
              { 
                type: "image_url", 
                image_url: { url: imageBase64 }
              }
            ]
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!ironManResponse.ok) {
      const errorText = await ironManResponse.text();
      console.error("Iron Man portrait error:", ironManResponse.status, errorText);
      
      if (ironManResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (ironManResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Failed to generate Iron Man portrait: ${errorText}`);
    }

    const ironManData = await ironManResponse.json();
    const ironManImage = ironManData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    console.log("Both portraits generated successfully");

    return new Response(
      JSON.stringify({ 
        casualImage,
        ironManImage,
        success: true 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating portraits:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to generate portraits" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
