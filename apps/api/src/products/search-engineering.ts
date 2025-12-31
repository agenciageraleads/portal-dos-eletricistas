/**
 * Search Engineering Configuration
 * 
 * Este arquivo centraliza a lógica de "search engineering" para melhorar a precisão da busca.
 * Aqui definimos sinônimos, abreviações e termos equivalentes.
 */

// Mapa Base de Sinônimos e Abreviações (Unidirecional ou Bidirecional explícito)
const RAW_SYNONYMS: Record<string, string[]> = {
    // Iluminação
    'PAINEL': ['LUMINARIA', 'PLAFON', 'LED', 'LUM', 'LUMIN'],
    'LUMINARIA': ['PAINEL', 'PLAFON', 'LED', 'LUM', 'LUMIN'],
    'PLAFON': ['PAINEL', 'LUMINARIA', 'LED'],
    'LED': ['LUMINARIA', 'PAINEL', 'REFLETOR'],
    'ARANDELA': ['ARAND'],
    'REFLETOR': ['REF'],
    'LAMPADA': ['LAMP'],

    // Fios e Cabos
    'FIO': ['CABO', 'CONDUTOR', 'CB', 'CAB'],
    'CABO': ['FIO', 'CONDUTOR', 'CB', 'CAB'],

    // Infraestrutura
    'ELETRODUTO': ['CONDUITE', 'TUBO', 'ELET'],
    'CONDUITE': ['ELETRODUTO', 'TUBO', 'MANGUEIRA', 'MANGUEIRA CORRUGADA', 'ELETRODUTO CORRUGADO'],
    'CONDULETE': ['CAIXA MULTIPLA', 'CX MULTIPLA'],
    'CAIXA': ['CX', 'CX.', 'CXA'],
    'QUADRO': ['QD', 'QD.', 'QDR', 'QUAD'],
    'QUADRADA': ['QUAD', 'QD', 'QDR'],
    'QUADRADO': ['QUAD', 'QD', 'QDR'],

    // Dispositivos e Módulos
    'DISJUNTOR': ['MINI DISJUNTOR', 'DPS', 'DR', 'DISJ', 'DISJ.', 'DISJUN', 'BREAKER'],
    'TOMADA': ['CONJUNTO', 'PLACA', 'TOM', 'TOM.'],
    'INTERRUPTOR': ['CONJUNTO', 'TECLA', 'INT', 'INT.', 'INTER'],
    'MODULO': ['MOD', 'MOD.', 'MÓDULO'],
    'PLACA': ['PL', 'PL.', 'ESPELHO'],
    'DR': ['DIFERENCIAL', 'RESIDUAL'], // Feedback

    // Instalação
    'EMBUTIR': ['EMB', 'EMB.'],
    'SOBREPOR': ['SOB', 'SOB.', 'EXTERNO'],
    'ABRACADEIRA': ['ABRAC'],
    'DISTRIBUICAO': ['DIST'],
    'ISOLANTE': ['ISOL'],

    // Materiais
    'ALUMINIO': ['ALUM'],
    'GALVANIZADO': ['GALV'],
    'ZINCADO': ['ZINC'],
    'FLEXIVEL': ['FLEX'],

    // Fases
    'MONOFASICO': ['MONOPOLAR', 'MONO'], 'MONOPOLAR': ['MONOFASICO', 'MONO'],
    'BIFASICO': ['BIPOLAR'], 'BIPOLAR': ['BIFASICO'],
    'TRIFASICO': ['TRIPOLAR'], 'TRIPOLAR': ['TRIFASICO'],

    // Cores
    'BRANCO': ['BC'], 'PRETO': ['PT'], 'VERMELHO': ['VM'],
    'VERDE': ['VD'], 'AMARELO': ['AM'], 'AZUL': ['AZ'], 'CINZA': ['CZ'],

    // Unidades e Medidas
    'PC': ['PECA'],
    'MT': ['METRO'],
    'MM': ['MILIMETRO'],

    // Buchas / Fixação
    'TIJOLO': ['TIJ'],
    'FURADO': ['FUR'],
};

// Gerar mapa reverso e normalizado (Upper Case)
export const SEARCH_SYNONYMS: Record<string, Set<string>> = {};

// Inicialização
Object.entries(RAW_SYNONYMS).forEach(([key, values]) => {
    const normalizedKey = key.toUpperCase();
    if (!SEARCH_SYNONYMS[normalizedKey]) SEARCH_SYNONYMS[normalizedKey] = new Set();

    values.forEach(v => {
        const normalizedVal = v.toUpperCase();

        // Adiciona Forward: KEY -> VAL
        SEARCH_SYNONYMS[normalizedKey].add(normalizedVal);

        // Adiciona Reverse: VAL -> KEY
        if (!SEARCH_SYNONYMS[normalizedVal]) SEARCH_SYNONYMS[normalizedVal] = new Set();
        SEARCH_SYNONYMS[normalizedVal].add(normalizedKey);
    });
});

/**
 * Retorna todas as variações conhecidas para um token
 */
export function getVariations(token: string): string[] {
    const normalized = token.toUpperCase();
    const variations = new Set<string>();
    variations.add(normalized);

    // 1. Match exato em Sinônimos
    if (SEARCH_SYNONYMS[normalized]) {
        SEARCH_SYNONYMS[normalized].forEach(v => variations.add(v));
    }

    // 2. Match parcial (prefixo)
    if (normalized.length >= 3) {
        Object.keys(RAW_SYNONYMS).forEach(key => {
            if (key.startsWith(normalized)) {
                variations.add(key);
                if (SEARCH_SYNONYMS[key]) {
                    SEARCH_SYNONYMS[key].forEach(v => variations.add(v));
                }
            }
        });
    }

    // 3. Match de Padrões
    // S8 <-> S08
    const sMatch = normalized.match(/^S(0)?(\d+)$/);
    if (sMatch) {
        const digit = sMatch[2];
        if (digit.length === 1) { // Só aplica para s8, s6, etc. s10 não muda
            variations.add(`S${digit}`);
            variations.add(`S0${digit}`);
        } else {
            variations.add(`S${digit}`); // s10 -> S10
        }
    }

    // Numbers: 2.5 <-> 2,5
    if (normalized.includes('.') || normalized.includes(',')) {
        const withDot = normalized.replace(',', '.');
        const withComma = normalized.replace('.', ',');
        variations.add(withDot);
        variations.add(withComma);
    }

    // Units: 2.5mm -> 2.5
    // Regex para pegar numero seguido de mm (ex: 2.5mm, 4mm)
    const mmMatch = normalized.match(/^(\d+(?:[\.,]\d+)?)MM$/);
    if (mmMatch) {
        const numberPart = mmMatch[1];
        variations.add(numberPart); // Adiciona "2.5"

        // E suas variações de ponto/vírgula
        const withDot = numberPart.replace(',', '.');
        const withComma = numberPart.replace('.', ',');
        variations.add(withDot);
        variations.add(withComma);
    }

    // Se é só número, talvez adicionar variação com mm?
    // Ex: "2.5" -> "2.5mm"? Perigoso (pode ser R$2.5). Melhor não.
    // O contexto de busca "cabo 2.5" vai achar "cabo 2.5mm" se o produto tiver "2.5mm" no nome?
    // Se produto tem "Cabo 2,5mm", e busco "2.5", o contains pega? Não necessariamente se "2.5" != "2,5".
    // Mas agora adicionamos "2,5" como variação de "2.5". Então "contains(2,5)" vai pegar.

    return Array.from(variations);
}

export const STOPWORDS = new Set(['DE', 'DA', 'DO', 'PARA', 'COM', 'EM', 'P/', 'O', 'A', 'OS', 'AS']);
