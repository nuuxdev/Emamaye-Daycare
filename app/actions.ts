"use server";

export async function translateName(name: string): Promise<string> {
    const apiKey = process.env.HASAB_API_KEY;
    if (!apiKey) {
        console.error("HASAB_API_KEY is not set");
        return "";
    }

    try {
        const response = await fetch("https://hasab.co/api/v1/chat", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "hasab-1-lite",
                message: `Transliterate this name to Amharic: "${name}". Return ONLY the Amharic text. Do not include any tags, explanations, or other text.`,
                temperature: 0.1,
                max_tokens: 100,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Hasab AI API Error:", response.status, errorText);
            return "";
        }

        const data = await response.json();
        const content = data.message?.content?.trim() || "";
        // Remove any <thought> tags or other XML-like tags if they slip through
        return content.replace(/<[^>]*>.*?<\/[^>]*>/g, "").replace(/<[^>]*>/g, "").trim();

    } catch (error) {
        console.error("Failed to translate name:", error);
        return "";
    }
}
