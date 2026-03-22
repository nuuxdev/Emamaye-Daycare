"use server";

async function callHasab(name: string): Promise<string> {
    const apiKey = process.env.HASAB_API_KEY;
    if (!apiKey) throw new Error("HASAB_API_KEY is not set");

    const response = await fetch("https://api.hasab.ai/v1/chat", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "hasab-1-lite",
            message: `Transliterate this name to Amharic script. Output ONLY the Amharic text, nothing else. Name: ${name}`,
            temperature: 0,
            max_tokens: 1024,
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Hasab API Error ${response.status}: ${err}`);
    }

    const data = await response.json();
    return data.message?.content?.trim() || "";
}

function extractAmharic(raw: string): string {
    // Strip XML-like tags (e.g. <thought>...</thought>)
    let content = raw.replace(/<[^>]*>[\s\S]*?<\/[^>]*>/g, "").replace(/<[^>]*>/g, "").trim();
    // Pick the first line containing actual Amharic characters
    const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
    return lines.find((l) => /[\u1200-\u137F]/.test(l)) ?? lines[0] ?? "";
}

export async function translateName(name: string): Promise<string> {
    if (!name?.trim()) return "";
    try {
        const raw = await callHasab(name);
        return extractAmharic(raw);
    } catch (error) {
        console.error("Failed to translate name:", error);
        throw error;
    }
}
