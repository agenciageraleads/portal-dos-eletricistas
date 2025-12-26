
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyze() {
    try {
        const products = await prisma.product.findMany({
            select: { name: true, sankhya_code: true }
        });

        console.log(`Analyzing ${products.length} products...`);

        const shortTokens = new Map();
        const dottedTokens = new Map();
        const commonTerms = new Map();

        products.forEach(p => {
            if (!p.name) return;
            // Normalize: uppercase, remove special chars except dot
            const name = p.name.toUpperCase();

            // Standard cleanup for tokenization
            const words = name.split(/[\s,]+/);

            words.forEach(w => {
                const clean = w.trim();
                // 1. Dotted words (e.g., "CX.", "INT.")
                if (clean.includes('.') && clean.length > 1) {
                    dottedTokens.set(clean, (dottedTokens.get(clean) || 0) + 1);
                }
                // 2. Short words (e.g., "CX", "LUM") - verifying candidates
                else if (clean.length > 1 && clean.length <= 4 && /^[A-Z0-9]+$/.test(clean)) {
                    shortTokens.set(clean, (shortTokens.get(clean) || 0) + 1);
                }

                // 3. Count all terms to identify what's "common" (for potential abbreviation mapping source)
                if (clean.length > 4) {
                    commonTerms.set(clean, (commonTerms.get(clean) || 0) + 1);
                }
            });
        });

        console.log("\nTop 50 Potential Abbreviations (Short Tokens <= 4 chars):");
        console.log("count | term");
        console.log("---|---");
        [...shortTokens.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 50)
            .forEach(([t, c]) => console.log(`${c} | ${t}`));

        console.log("\nTop Dotted Abbreviations (ending in .):");
        console.log("count | term");
        console.log("---|---");
        [...dottedTokens.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 50)
            .forEach(([t, c]) => console.log(`${c} | ${t}`));

        console.log("\nTop Common Terms (> 4 chars - Candidates for Abbreviation):");
        console.log("count | term");
        console.log("---|---");
        [...commonTerms.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 30) // Only top 30
            .forEach(([t, c]) => console.log(`${c} | ${t}`));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

analyze();
