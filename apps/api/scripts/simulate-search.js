
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- 1. CONFIGURATION: Proposed Improvements ---

const STOPWORDS = new Set(['DE', 'DA', 'DO', 'PARA', 'COM', 'EM', 'P/', 'O', 'A', 'OS', 'AS']);

const ABBREVIATIONS: Record<string, string[]> = {
    'TOMADA': ['TOM', 'TOM.'],
    'MODULO': ['MOD', 'MOD.', 'MÓDULO'],
    'CAIXA': ['CX', 'CX.', 'CXA'],
    'QUADRO': ['QD', 'QD.', 'QDR', 'QUAD'], // Added QUAD
    'DISJUNTOR': ['DISJ', 'DISJ.', 'DISJUN', 'DR'],
    'INTERRUPTOR': ['INT', 'INT.', 'INTER'],
    'PLACA': ['PL', 'PL.', 'ESPELHO'],
    'CABO': ['CB', 'CAB', 'FIO'],
    'FIO': ['CABO'], // Removed FIL
    'EMBUTIR': ['EMB', 'EMB.'], // Verified
    'SOBREPOR': ['SOB', 'SOB.', 'EXTERNO'], // Verified
    'LUMINARIA': ['LUM', 'LUMIN'], // Added
    'LAMPADA': ['LAMP'], // Verified
    'ALUMINIO': ['ALUM'], // Added
    'GALVANIZADO': ['GALV'], // Added
    'FLEXIVEL': ['FLEX'], // Added
    'ELETRODUTO': ['ELET'], // Added
    'ABRACADEIRA': ['ABRAC'], // Added to map ABRAC -> ABRACADEIRA (reverse map logic handles this)

    // Colors (High freq tokens)
    'BRANCO': ['BC'],
    'PRETO': ['PT'],
    'VERMELHO': ['VM'],
    'VERDE': ['VD'],
    'AMARELO': ['AM'],
    'AZUL': ['AZ'],
    'CINZA': ['CZ'],
};

// Reverse map for search: abbreviations -> full words
// e.g., if user types "LUM", we also look for "LUMINARIA"
const REVERSE_ABBREVIATIONS: Record<string, string[]> = {};
Object.entries(ABBREVIATIONS).forEach(([full, abbrevs]) => {
    abbrevs.forEach(abbr => {
        if (!REVERSE_ABBREVIATIONS[abbr]) REVERSE_ABBREVIATIONS[abbr] = [];
        REVERSE_ABBREVIATIONS[abbr].push(full);
    });
});

// --- 2. SEARCH LOGIC (In-Memory Simulation) ---

function search(products: any[], query: string, limit: number = 3) {
    const normalizedQuery = query.toUpperCase().trim();

    // 1. Tokenize & Filter Stopwords
    const tokens = normalizedQuery.split(/\s+/)
        .filter(t => !STOPWORDS.has(t));

    if (tokens.length === 0) return [];

    // 2. Expand Tokens (Synonyms/Abbreviations)
    const tokenConditions = tokens.map(token => {
        const variations = new Set < string > ();
        variations.add(token);

        // Forward: Full -> Abbr (e.g., LUMINARIA -> LUM)
        if (ABBREVIATIONS[token]) {
            ABBREVIATIONS[token].forEach(v => variations.add(v));
        }

        // Reverse: Abbr -> Full (e.g., LUM -> LUMINARIA)
        if (REVERSE_ABBREVIATIONS[token]) {
            REVERSE_ABBREVIATIONS[token].forEach(v => variations.add(v));
        }

        return Array.from(variations);
    });

    // 3. Score/Filter Products
    const results = products.filter(p => {
        const pName = p.name.toUpperCase();
        // AND Logic: Product must satisfy match for ALL token groups
        return tokenConditions.every(variations => {
            // OR Logic: Product must match AT LEAST ONE variation in the group
            return variations.some(v => {
                // Strict check for short tokens to avoid "FIL" -> "PERFIL" noise
                if (v.length <= 3) {
                    // Use word boundary check (regex) or exact match logic
                    // regex: \bVAR\b or startsWith if it's a prefix standard
                    // Simulating "startsWith" or "includes with boundary"
                    // Simple startswith is safer for organized naming conventions like "LUM LED..."
                    // But "CABO FLEX" -> FLEX matches FLEXIVEL? Yes if contains.
                    // Let's try: Contains if > 3, StartsWith if <= 3 ?

                    // Problem: "FIO" (3) inside "DESAFIO" (noise).
                    // Correct approach for short tokens: Word Boundary or StartsWith
                    // DB `contains` is loose. Here we can be stricter.

                    // Let's implement a heuristic: 
                    // Match if product has word STARTING with v
                    const words = pName.split(/[\s,]+/);
                    return words.some(w => w.startsWith(v));
                }
                return pName.includes(v);
            });
        });
    });

    // 4. Sort (Simple heuristic implementation)
    // Preference: Exact matches, Matches at start of string
    results.sort((a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();

        // Exact match
        if (nameA === normalizedQuery && nameB !== normalizedQuery) return -1;
        if (nameB === normalizedQuery && nameA !== normalizedQuery) return 1;

        // Starts with
        const aStarts = nameA.startsWith(normalizedQuery);
        const bStarts = nameB.startsWith(normalizedQuery);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        return nameA.localeCompare(nameB);
    });

    return results.slice(0, limit);
}

// --- 3. TEST SUITE ---

const testCategories = {
    "Validation Specific": [
        "LUMINARIA DE EMBUTIR QUADRADA DE LED", // The main issue
        "Fio", // Should avoid PERFIL
        "Cabo", // Should find CABO or FIO
        "LUM LED", // Should find LUMINARIA
    ],
    "Produtos Básicos": [
        "Tomada", "Interruptor", "Fio", "Cabo", "Disjuntor", "Lampada", "LED"
    ],
    "Abreviações": [
        "LUM", "EMB", "QUAD", "CX"
    ],
    "Compostas": [
        "Fio 2.5", "Cabo Flexivel", "Disjuntor 20A"
    ]
};

async function runSimulation() {
    console.log("Loading products...");
    const products = await prisma.product.findMany({ select: { name: true, sankhya_code: true } });
    console.log(`Loaded ${products.length} products.\n`);

    let total = 0;
    let found = 0;

    console.log("| Query | Result 1 | Result 2 | Status |");
    console.log("|---|---|---|---|");

    for (const [cat, queries] of Object.entries(testCategories)) {
        console.log(`\n### ${cat}`);
        for (const q of queries) {
            total++;
            const res = search(products, q);
            const r1 = res[0] ? res[0].name : "-";
            const r2 = res[1] ? res[1].name : "-";
            const status = res.length > 0 ? "✅" : "❌";
            if (res.length > 0) found++;

            console.log(`| ${q} | ${r1} | ${r2} | ${status} |`);
        }
    }

    console.log(`\n**Simulation Results:** ${found}/${total} found (${((found / total) * 100).toFixed(1)}%)`);
}

runSimulation()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
