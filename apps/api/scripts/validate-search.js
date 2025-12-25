const queries = [
    // Básicos
    "Tomada", "Interruptor", "Fio", "Cabo", "Disjuntor",
    "Lampada", "LED", "Placa", "Modulo", "Caixa",

    // Infraestrutura
    "Canaleta", "Eletroduto", "Luva", "Curva", "Cotovelo",
    "Bucha", "Parafuso", "Abracadeira", "Prensa", "Terminal",

    // Iluminação
    "Reator", "Sensor", "Refletor", "Pendente", "Lustre",
    "Arandela", "Spot", "Trilho", "Plafon", "Tortuga",

    // Conexões & Acessórios
    "Conector", "Barramento", "Quadro", "Campainha", "Interfone",
    "Fechadura", "Fonte", "Extensao", "Adaptador", "Plugue",

    // Testes de Inteligência (Sinônimos/Erros/Compostos)
    "Fio Flexivel",    // Esperado: Cabo Flexivel (Sinônimo + Composto)
    "Luz Led",         // Esperado: Lampada/Refletor Led
    "Disjuntor 20A",   // Esperado: Busca exata de spec
    "Int Simples",     // Esperado: Interruptor Simples (Abreviação)
    "Tomada 20A",      // Spec
    "Cx Luz",          // Abreviação
    "Fita Isolan",     // Parcial
    "Cabo 2,5",        // Numérico com vírgula
    "Cabo 2.5",        // Numérico com ponto
    "Disjunto"         // Erro de digitação
];

async function runTests() {
    console.log("| Termo Pesquisado | Top 1 Resultado | Top 2 Resultado | Top 3 Resultado |");
    console.log("|---|---|---|---|");

    for (const q of queries) {
        try {
            const res = await fetch(`http://localhost:3333/products?q=${encodeURIComponent(q)}&limit=3`);
            const json = await res.json();
            const data = json.data || [];

            const r1 = data[0] ? `**${data[0].name}**` : "-";
            const r2 = data[1] ? data[1].name : "-";
            const r3 = data[2] ? data[2].name : "-";

            console.log(`| ${q} | ${r1} | ${r2} | ${r3} |`);
        } catch (e) {
            console.log(`| ${q} | ERRO | - | - |`);
        }
    }
}

runTests();
