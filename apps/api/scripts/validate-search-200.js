const testCategories = {
    "Produtos Básicos": [
        "Tomada", "Interruptor", "Fio", "Cabo", "Disjuntor", "Lampada", "LED",
        "Placa", "Modulo", "Caixa", "Quadro", "Espelho", "Plugue", "Bocal"
    ],

    "Abreviações Comuns (Jargão)": [
        "TOM", "INT", "DISJ", "CX", "QD", "MOD", "PL", "CB", "FIL", "LAMP",
        "EMB", "SOB", "DR", "DJ", "DPS", "IDR"
    ],

    "Infraestrutura": [
        "Canaleta", "Eletroduto", "Condulete", "Luva", "Curva", "Cotovelo",
        "Bucha", "Parafuso", "Abraçadeira", "Prensa", "Terminal", "Conector",
        "Arruela", "Porca", "Haste", "Arame", "Fita Isolante", "Fita Hellerman"
    ],

    "Iluminação": [
        "Reator", "Starter", "Sensor", "Refletor", "Pendente", "Lustre",
        "Arandela", "Spot", "Trilho", "Plafon", "Soquete", "Lampada Bulbo",
        "Lampada Tubular", "Lampada Dicroica", "Strip LED", "Fita LED"
    ],

    "Proteção": [
        "Disjuntor Monopolar", "Disjuntor Bipolar", "Disjuntor Tripolar",
        "DDR", "DPS", "IDR", "Fusível", "Relé", "Contator", "Temporizador"
    ],

    "Automação": [
        "Sensor Presença", "Sensor Movimento", "Minuteria", "Dimmer",
        "Interruptor Touch", "Tomada Inteligente", "Fechadura Digital",
        "Campainha Wireless", "Interfone", "Camera"
    ],

    "Cabos e Fios (Especificações)": [
        "Fio 1,5", "Fio 2,5", "Fio 4", "Fio 6", "Fio 10",
        "Cabo 2,5", "Cabo 4", "Cabo 6", "Cabo Flexivel 2,5", "Cabo PP",
        "Cabo Coaxial", "Cabo Rede", "Cabo CFTV", "Cabo Alarme"
    ],

    "Busca Composta (Múltiplos Termos)": [
        "Tomada 10A", "Tomada 20A", "Interruptor Simples", "Interruptor Paralelo",
        "Interruptor 3 Vias", "Caixa 4x2", "Caixa 4x4", "Placa 4x2 Branca",
        "Modulo Tomada", "Modulo Interruptor", "Lampada LED 9W", "Lampada LED 12W"
    ],

    "Sinônimos e Variações": [
        "Fio Flexivel", "Luz LED", "Quadro Distribuição", "Caixa Luz",
        "Espelho Placa", "Bocal Lampada", "Soquete E27", "Plugue Tomada"
    ],

    "Numéricos e Especiais": [
        "10A", "16A", "20A", "32A", "40A", "63A", "110V", "220V", "127V",
        "2,5mm", "4mm", "6mm", "10mm", "E27", "E14", "GU10", "4x2", "4x4"
    ],

    "Erros de Digitação Comuns": [
        "Disjunto", "Interuptor", "Lampda", "Fil", "Cuadrada", "Trifasica",
        "Isolan", "Helerman", "Canalleta", "Eletrodut"
    ],

    "Marcas e Fabricantes": [
        "Tramontina", "Pial Legrand", "Schneider", "Siemens", "ABB",
        "Intelbras", "Tigre", "Fortlev", "Krona", "Avant"
    ],

    "Produtos Específicos": [
        "Tomada USB", "Interruptor Bipolar", "Disjuntor Motor", "Cabo Manga",
        "Fio Terra", "Barramento Cobre", "Neutro Isolado", "Haste Aterramento",
        "Para-raio", "SPDA", "Malha Terra", "Caixa Medidor", "Poste Padrão"
    ],

    "Ambiguidades": [
        "Anel", "Base", "Suporte", "Alicate", "Chave", "Adaptador",
        "Prolongador", "Redutor", "Extensor", "Organizador"
    ],

    "Termos Técnicos": [
        "Neutro", "Fase", "Terra", "Retorno", "Paralelo", "Intermediário",
        "Multipolar", "Curva C", "Curva B", "IP65", "IP44", "Estanque"
    ]
};

async function runComprehensiveTest() {
    let totalQueries = 0;
    let successCount = 0;
    let noisyCount = 0;
    let emptyCount = 0;

    const problemPatterns = {
        'shortAbbrevMatch': [],
        'alphabeticBias': [],
        'irrelevantResults': [],
        'emptyResults': []
    };

    console.log("# Análise Completa de Busca (200 Queries)\n");
    console.log("**Critérios de Avaliação:**");
    console.log("- ✅ Sucesso: Resultado relevante");
    console.log("- ⚠️ Ruído: Resultado parcialmente relevante ou acessório");
    console.log("- ❌ Falha: Resultado irrelevante");
    console.log("- 🔍 Vazio: Sem resultados\n");

    for (const [category, queries] of Object.entries(testCategories)) {
        console.log(`\n## ${category}\n`);
        console.log("| Query | Top 1 | Top 2 | Status |");
        console.log("|---|---|---|---|");

        for (const q of queries) {
            totalQueries++;
            try {
                const res = await fetch(`http://localhost:3333/products?q=${encodeURIComponent(q)}&limit=3`);
                const json = await res.json();
                const data = json.data || [];

                if (data.length === 0) {
                    console.log(`| ${q} | - | - | 🔍 Vazio |`);
                    emptyCount++;
                    problemPatterns.emptyResults.push(q);
                    continue;
                }

                const r1 = data[0]?.name || "-";
                const r2 = data[1]?.name || "-";

                // Simple heuristic for relevance
                const queryLower = q.toLowerCase();
                const r1Lower = r1.toLowerCase();

                let status = "✅";

                // Check if it's noisy (accessory when looking for main product)
                if (r1Lower.includes("abrac") || r1Lower.includes("suporte") ||
                    r1Lower.includes("arruel") || r1Lower.includes("alicate")) {
                    if (!queryLower.includes("abrac") && !queryLower.includes("alicate")) {
                        status = "⚠️ Ruído";
                        noisyCount++;
                        problemPatterns.alphabeticBias.push({ query: q, result: r1 });
                    } else {
                        successCount++;
                    }
                }
                // Check for completely irrelevant
                else if (!r1Lower.includes(queryLower.split(' ')[0].substring(0, 3)) &&
                    !queryLower.includes(r1Lower.split(' ')[0].substring(0, 3))) {
                    status = "❌ Irrelev";
                    noisyCount++;
                    problemPatterns.irrelevantResults.push({ query: q, result: r1 });
                } else {
                    successCount++;
                }

                console.log(`| ${q} | ${r1} | ${r2} | ${status} |`);

            } catch (e) {
                console.log(`| ${q} | ERRO | - | ❌ |`);
                noisyCount++;
            }
        }
    }

    // Summary Statistics
    console.log(`\n## 📊 Estatísticas\n`);
    console.log(`- **Total de Queries:** ${totalQueries}`);
    console.log(`- **✅ Sucessos:** ${successCount} (${((successCount / totalQueries) * 100).toFixed(1)}%)`);
    console.log(`- **⚠️ Ruído/Falhas:** ${noisyCount} (${((noisyCount / totalQueries) * 100).toFixed(1)}%)`);
    console.log(`- **🔍 Vazios:** ${emptyCount} (${((emptyCount / totalQueries) * 100).toFixed(1)}%)`);

    console.log(`\n## 🔍 Padrões Identificados\n`);

    if (problemPatterns.emptyResults.length > 0) {
        console.log(`### Queries sem Resultado (${problemPatterns.emptyResults.length})`);
        console.log(problemPatterns.emptyResults.slice(0, 10).join(", "));
        if (problemPatterns.emptyResults.length > 10) {
            console.log(`... e mais ${problemPatterns.emptyResults.length - 10}`);
        }
        console.log("");
    }

    if (problemPatterns.alphabeticBias.length > 0) {
        console.log(`### Viés Alfabético Detectado (${problemPatterns.alphabeticBias.length})`);
        problemPatterns.alphabeticBias.slice(0, 5).forEach(p => {
            console.log(`- "${p.query}" → "${p.result}"`);
        });
        console.log("");
    }

    if (problemPatterns.irrelevantResults.length > 0) {
        console.log(`### Resultados Irrelevantes (${problemPatterns.irrelevantResults.length})`);
        problemPatterns.irrelevantResults.slice(0, 5).forEach(p => {
            console.log(`- "${p.query}" → "${p.result}"`);
        });
        console.log("");
    }
}

runComprehensiveTest();
