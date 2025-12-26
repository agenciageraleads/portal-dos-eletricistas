
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

// Mirroring the backend logic for query generation simulation
const ABBREVIATIONS: Record<string, string> = {
    // We map FULL -> ABBR here to simulate user typing abbr
    'TOMADA': 'TOM',
    'MODULO': 'MOD',
    'CAIXA': 'CX',
    'QUADRO': 'QD',
    'DISJUNTOR': 'DISJ',
    'INTERRUPTOR': 'INT',
    'PLACA': 'PL',
    'CABO': 'FIO', // User might type FIO for CABO
    'EMBUTIR': 'EMB',
    'SOBREPOR': 'SOB',
    'LUMINARIA': 'LUM',
    'LAMPADA': 'LAMP',
    'ALUMINIO': 'ALUM',
    'GALVANIZADO': 'GALV',
    'ZINCADO': 'ZINC',
    'FLEXIVEL': 'FLEX',
    'ELETRODUTO': 'ELET',
    'ABRACADEIRA': 'ABRAC',
    'REFLETOR': 'REF',
    'DISTRIBUICAO': 'DIST',
    'ARANDELA': 'ARAND',
    'BRANCO': 'BC',
    'PRETO': 'PT',
    'VERMELHO': 'VM',
    'AMARELO': 'AM',
    'AZUL': 'AZ',
    'CINZA': 'CZ'
};

function generateQuery(productName: string): string {
    // 1. Remove stopwords/connectors manually just to be messy
    let words = productName.toUpperCase().split(/[\s,.-]+/);

    // 2. Filter out short boring words sometimes
    words = words.filter(w => w.length > 2 && !['COM', 'PARA'].includes(w));

    // 3. Abbreviate some words
    const queryWords = words.map(w => {
        // 50% chance to abbreviate if possible
        if (ABBREVIATIONS[w] && Math.random() > 0.5) {
            return ABBREVIATIONS[w];
        }
        return w;
    });

    // 4. Select a subset of words (simulating partial search)
    // Keep 30-70% of words
    const keepCount = Math.max(1, Math.floor(queryWords.length * 0.6));
    const shuffled = queryWords.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, keepCount);

    return selected.join(' ');
}

async function runStressTest() {
    console.log("Fetching products to generate test set...");
    const allProducts = await prisma.product.findMany({
        take: 2000 // Sample pool
    });

    // Shuffle and pick 300
    const testSet = allProducts.sort(() => 0.5 - Math.random()).slice(0, 300);

    console.log(`Starting execution of 300 tests...\n`);

    let foundCount = 0;
    let notFoundCount = 0;
    let errors = 0;

    const failures: any[] = [];

    // Process in chunks to avoid overwhelming local server if needed, but serial is safer for accuracy
    for (let i = 0; i < testSet.length; i++) {
        const product = testSet[i];
        const query = generateQuery(product.name);

        try {
            const url = `http://localhost:3333/products`;
            const res = await axios.get(url, { params: { q: query, limit: 5 } });

            const results = res.data.data;
            // Check if our target product is in the result list
            const found = results.some((p: any) => p.id === product.id);

            if (found) {
                foundCount++;
                process.stdout.write('.');
            } else {
                notFoundCount++;
                process.stdout.write('x');
                console.log(`\n❌ FAIL: Target: "${product.name}" | Query: "${query}" | Top Result: "${results[0]?.name}"`);
                failures.push({
                    target: product.name,
                    query: query,
                    topResult: results[0] ? results[0].name : 'EMPTY'
                });
            }
        } catch (e: any) {
            errors++;
            process.stdout.write('E');
            if (e.response && e.response.status === 429) {
                await new Promise(r => setTimeout(r, 1000)); // Backoff
            }
        }
        await new Promise(r => setTimeout(r, 50)); // Throttle
    }

    console.log("\n\n--- Stress Test Report ---");
    console.log(`Total Tests: ${testSet.length}`);
    console.log(`✅ Success (Recall): ${foundCount} (${((foundCount / testSet.length) * 100).toFixed(1)}%)`);
    console.log(`❌ Failed: ${notFoundCount}`);
    console.log(`⚠️ Errors: ${errors}`);

    if (failures.length > 0) {
        console.log("\nTop 20 Failures:");
        console.log("| Target Product | Synthetic Query | Top 1 Result |");
        console.log("|---|---|---|");
        failures.slice(0, 20).forEach(f => {
            console.log(`| ${f.target} | ${f.query} | ${f.topResult} |`);
        });
    }
}

runStressTest()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
