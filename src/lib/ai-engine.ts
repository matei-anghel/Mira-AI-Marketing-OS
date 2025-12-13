import { extractDominantColors } from './image-processing';

interface AIConfig {
    apiKey: string;
    provider: string;
}

function getSettings(): AIConfig {
    return {
        apiKey: localStorage.getItem('mira_api_key') || '',
        provider: localStorage.getItem('mira_provider') || 'gemini'
    };
}

export function buildAdPrompt(category: string, palette: string[], userText: string, hasModel: boolean, aspectRatio: string): string {
    const paletteText = palette.slice(0, 3).join(", ");
    let base = `You are an award-winning art director. Design a premium advertisement. \n`;
    base += `Product Category: ${category}. Palette: ${paletteText}. Aspect Ratio: ${aspectRatio}. \n`;
    base += `Camera: commercial product photography, studio lighting. \n`;

    if (hasModel) {
        base += `Use the person in the first reference image as the model. Keep identity, face, and skin tone exactly. Change wardrobe to match the product style if needed. `;
    } else {
        base += `Hero product shot. No model required. `;
    }

    if (userText) base += `User instructions: ${userText}. `;

    base += `Return a single cohesive image. High quality, photorealistic.`;
    return base;
}

async function callGeminiImage(prompt: string, imagesB64: string[], config: AIConfig, count: number = 1) {
    if (!config.apiKey) throw new Error("Missing Gemini API Key in Settings");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${config.apiKey}`;

    const parts: { text?: string; inline_data?: { mime_type: string; data: string } }[] = [{ text: prompt }];
    for (const b64 of imagesB64) {
        const cleanB64 = b64.includes('base64,') ? b64.split('base64,')[1] : b64;
        parts.push({
            inline_data: {
                mime_type: "image/jpeg",
                data: cleanB64
            } as any
        });
    }

    const payload = {
        contents: [{ parts }],
        generationConfig: {
            temperature: 0.5,
            response_modalities: ["image"],
            candidate_count: count
        }
    };

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Gemini API Error ${res.status}: ${err}`);
    }

    const data = await res.json();
    const imgs: string[] = [];
    if (data.candidates?.[0]?.content?.parts) {
        for (const p of data.candidates[0].content.parts) {
            if (p.inline_data && p.inline_data.data) {
                imgs.push(p.inline_data.data);
            }
        }
    }
    return { images: imgs, log: "Gemini Success" };
}

async function callOpenRouterImage(prompt: string, imagesB64: string[], config: AIConfig, count: number = 1) {
    if (!config.apiKey) throw new Error("Missing OpenRouter Key");

    const url = "https://openrouter.ai/api/v1/chat/completions";
    const model = "google/gemini-3-pro-image-preview";

    const contentParts: any[] = [{ type: "text", text: prompt }];

    // Add reference images if any
    for (const b64 of imagesB64) {
        const cleanB64 = b64.includes('base64,') ? b64.split('base64,')[1] : b64;
        contentParts.push({
            type: "image_url",
            image_url: {
                url: `data:image/jpeg;base64,${cleanB64}`
            }
        });
    }

    const payload = {
        model: model,
        messages: [
            {
                role: "user",
                content: contentParts
            }
        ],
        n: count,
        modalities: ["image", "text"]
    };

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
        },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`OpenRouter Error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const imgs: string[] = [];

    // Parse response for images
    // Based on docs: result.choices[0].message.images or multiple choices
    // OpenRouter / OpenAI standard: multiple choices if n > 1?
    // Or single choice with multiple images? Gemini usually returns 1 choice with multiple parts.
    // OpenAI standard is multiple choices.

    if (data.choices) {
        for (const choice of data.choices) {
            if (choice.message?.images) {
                for (const img of choice.message.images) {
                    if (img.image_url?.url) imgs.push(img.image_url.url);
                }
            } else if (choice.message?.content) {
                // basic text fallback or markdown images
            }
        }
    }

    // Fallback if structure is slightly different (some providers wrap differently)
    const message = data.choices?.[0]?.message;
    if (imgs.length === 0 && message?.images) {
        for (const img of message.images) {
            if (img.image_url?.url) {
                imgs.push(img.image_url.url);
            }
        }
    }

    if (imgs.length === 0) {
        // Deep fail check - maybe no images generated
        return { images: [], log: "OpenRouter Success - No images returned" };
    }

    return { images: imgs, log: "OpenRouter Success" };
}

async function callGeminiText(prompt: string, config: AIConfig) {
    if (!config.apiKey) throw new Error("Missing Gemini API Key");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${config.apiKey}`;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, response_modalities: ["text"] }
    };

    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    let text = "";
    if (data.candidates?.[0]?.content?.parts) {
        text = data.candidates[0].content.parts.map((p: any) => p.text).join("");
    }
    return text;
}

async function callOpenRouterText(prompt: string, config: AIConfig) {
    const url = "https://openrouter.ai/api/v1/chat/completions";
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
        },
        body: JSON.stringify({
            model: "google/gemini-3-pro-image-preview",
            messages: [{ role: "user", content: prompt }]
        })
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
}

export async function generateImage(prompt: string, refs: string[], count: number = 1): Promise<{ images: string[], log: string }> {
    const conf = getSettings();
    if (conf.provider === 'openrouter') return callOpenRouterImage(prompt, refs, conf, count);
    return callGeminiImage(prompt, refs, conf, count);
}

export async function generateText(prompt: string): Promise<string> {
    const conf = getSettings();
    if (conf.provider === 'openrouter') return callOpenRouterText(prompt, conf);
    return callGeminiText(prompt, conf);
}
