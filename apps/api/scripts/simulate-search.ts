
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- 1. CONFIGURATION: Proposed Improvements ---

// @ts-ignore
const STOPWORDS = new Set(['DE', 'DA', 'DO', 'PARA', 'COM', 'EM', 'P/', 'O', 'A', 'OS', 'AS']);

const ABBREVIATIONS: Record<string, string[]> = {
    'TOMADA': ['TOM', 'TOM.'],
    'MODULO': ['MOD', 'MOD.', 'MÓDULO'],
    'CAIXA': ['CX', 'CX.', 'CXA'],
    'QUADRO': ['QD', 'QD.', 'QDR', 'QUAD'],
    'QUADRADA': ['QUAD', 'QD', 'QDR'],
    'QUADRADO': ['QUAD', 'QD', 'QDR'],
    'DISJUNTOR': ['DISJ', 'DISJ.', 'DISJUN', 'DR'],
    'INTERRUPTOR': ['INT', 'INT.', 'INTER'],
    'PLACA': ['PL', 'PL.', 'ESPELHO'],
    'CABO': ['CB', 'CAB', 'FIO'],
    'FIO': ['CABO'],
    'EMBUTIR': ['EMB', 'EMB.'],
    'SOBREPOR': ['SOB', 'SOB.', 'EXTERNO'],
    'LUMINARIA': ['LUM', 'LUMIN'],
    'LAMPADA': ['LAMP'],
    'ALUMINIO': ['ALUM'],
    'GALVANIZADO': ['GALV'],
    'ZINCADO': ['ZINC'], // Added user request
    'FLEXIVEL': ['FLEX'],
    'ELETRODUTO': ['ELET'],
    'ABRACADEIRA': ['ABRAC'],
    'REFLETOR': ['REF'],
    'DISTRIBUICAO': ['DIST'],
    'ARANDELA': ['ARAND'],

    // Synonyms / Equivalence
    'MONOFASICO': ['MONOPOLAR', 'MONO'],
    'MONOPOLAR': ['MONOFASICO', 'MONO'],
    'BIFASICO': ['BIPOLAR'],
    'BIPOLAR': ['BIFASICO'],
    'TRIFASICO': ['TRIPOLAR'],
    'TRIPOLAR': ['TRIFASICO'],

    // Colors (High freq tokens)
    'BRANCO': ['BC'],
    'PRETO': ['PT'],
    'VERMELHO': ['VM'],
    'VERDE': ['VD'],
    'AMARELO': ['AM'],
    'AZUL': ['AZ'],
    'CINZA': ['CZ'],
};

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

    const tokens = normalizedQuery.split(/\s+/)
        .filter(t => !STOPWORDS.has(t));

    if (tokens.length === 0) return [];

    const tokenConditions = tokens.map(token => {
        const variations = new Set<string>();
        variations.add(token);

        if (ABBREVIATIONS[token]) {
            ABBREVIATIONS[token].forEach(v => variations.add(v));
        }

        if (REVERSE_ABBREVIATIONS[token]) {
            REVERSE_ABBREVIATIONS[token].forEach(v => variations.add(v));
        }

        return Array.from(variations);
    });

    const results = products.filter(p => {
        const pName = p.name ? p.name.toUpperCase() : "";
        return tokenConditions.every(variations => {
            return variations.some(v => {
                if (v.length <= 3) {
                    const words = pName.split(/[\s,]+/);
                    return words.some((w: string) => w.startsWith(v));
                }
                return pName.includes(v);
            });
        });
    });

    results.sort((a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();

        if (nameA === normalizedQuery && nameB !== normalizedQuery) return -1;
        if (nameB === normalizedQuery && nameA !== normalizedQuery) return 1;

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
        "LUMINARIA DE EMBUTIR QUADRADA DE LED",
        "Fio",
        "Cabo",
        "LUM LED",
    ],
    "Produtos Básicos": [
        "Tomada", "Interruptor", "Fio", "Cabo", "Disjuntor", "Lampada", "LED"
    ],
    "Abreviações": [
        "LUM", "EMB", "QUAD", "CX"
    ],
    "Compostas": [
        "Fio 2.5", "Cabo Flexivel", "Disjuntor 20A"
    ],
    "Novos Casos": [
        "Disjuntor Monofasico", // Should find Monopolar
        "Quadro Dist", // Should find Quadro Distribuicao
        "Refletor", // Should find REF if abbr exists (or vice versa)
        "Aran" // Should find Arandela if partial matching works well
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
        // @ts-ignore
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
