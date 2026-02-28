import { internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// Helper: call Hasab AI to transliterate a name
async function transliterateToAmharic(name: string): Promise<string> {
    const apiKey = process.env.HASAB_API_KEY;
    if (!apiKey) throw new Error("HASAB_API_KEY is not set");

    const response = await fetch("https://hasab.co/api/v1/chat", {
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
    let content: string = data.message?.content?.trim() || "";

    // Strip XML-like tags
    content = content.replace(/<[^>]*>[\s\S]*?<\/[^>]*>/g, "").replace(/<[^>]*>/g, "").trim();

    // Pick first line with Amharic characters
    const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
    return lines.find((l) => /[\u1200-\u137F]/.test(l)) ?? lines[0] ?? "";
}

export const patchChildAmhName = internalMutation({
    args: { childId: v.id("children"), fullNameAmh: v.string() },
    handler: async (ctx, { childId, fullNameAmh }) => {
        await ctx.db.patch(childId, { fullNameAmh });
    },
});

export const patchGuardianAmhName = internalMutation({
    args: { guardianId: v.id("guardians"), fullNameAmh: v.string() },
    handler: async (ctx, { guardianId, fullNameAmh }) => {
        await ctx.db.patch(guardianId, { fullNameAmh });
    },
});

export const getChildrenWithoutAmhName = internalMutation({
    args: {},
    handler: async (ctx) => {
        const all = await ctx.db.query("children").collect();
        return all
            .filter((c) => !c.fullNameAmh || c.fullNameAmh.trim() === "")
            .map((c) => ({ _id: c._id, fullName: c.fullName }));
    },
});

export const getGuardiansWithoutAmhName = internalMutation({
    args: {},
    handler: async (ctx) => {
        const all = await ctx.db.query("guardians").collect();
        return all
            .filter((g) => !g.fullNameAmh || g.fullNameAmh.trim() === "")
            .map((g) => ({ _id: g._id, fullName: g.fullName }));
    },
});

/**
 * Run from Convex dashboard → Functions → backfill:backfillAmharicNames
 * Requires HASAB_API_KEY set in Convex Environment Variables.
 */
export const backfillAmharicNames = internalAction({
    args: {},
    handler: async (ctx) => {
        const results = {
            children: { success: 0, failed: 0, skipped: 0 },
            guardians: { success: 0, failed: 0, skipped: 0 },
        };

        // --- Children ---
        const children: { _id: any; fullName: string }[] =
            await ctx.runMutation(internal.backfill.getChildrenWithoutAmhName, {});
        console.log(`Found ${children.length} children without Amharic names.`);

        for (const child of children) {
            if (!child.fullName?.trim()) { results.children.skipped++; continue; }
            try {
                const amh = await transliterateToAmharic(child.fullName);
                if (amh) {
                    await ctx.runMutation(internal.backfill.patchChildAmhName, {
                        childId: child._id,
                        fullNameAmh: amh,
                    });
                    console.log(`✓ Child: "${child.fullName}" → "${amh}"`);
                    results.children.success++;
                } else {
                    console.warn(`⚠ Child: "${child.fullName}" → empty, skipping.`);
                    results.children.skipped++;
                }
            } catch (err) {
                console.error(`✗ Child: "${child.fullName}" failed:`, err);
                results.children.failed++;
            }
            await new Promise((r) => setTimeout(r, 300));
        }

        // --- Guardians ---
        const guardians: { _id: any; fullName: string }[] =
            await ctx.runMutation(internal.backfill.getGuardiansWithoutAmhName, {});
        console.log(`Found ${guardians.length} guardians without Amharic names.`);

        for (const guardian of guardians) {
            if (!guardian.fullName?.trim()) { results.guardians.skipped++; continue; }
            try {
                const amh = await transliterateToAmharic(guardian.fullName);
                if (amh) {
                    await ctx.runMutation(internal.backfill.patchGuardianAmhName, {
                        guardianId: guardian._id,
                        fullNameAmh: amh,
                    });
                    console.log(`✓ Guardian: "${guardian.fullName}" → "${amh}"`);
                    results.guardians.success++;
                } else {
                    console.warn(`⚠ Guardian: "${guardian.fullName}" → empty, skipping.`);
                    results.guardians.skipped++;
                }
            } catch (err) {
                console.error(`✗ Guardian: "${guardian.fullName}" failed:`, err);
                results.guardians.failed++;
            }
            await new Promise((r) => setTimeout(r, 300));
        }

        console.log("Backfill complete:", JSON.stringify(results, null, 2));
        return results;
    },
});
