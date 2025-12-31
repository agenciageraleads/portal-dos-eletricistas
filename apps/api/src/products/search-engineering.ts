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
    'DISJUNTOR': ['MINI DISJUNTOR', 'DPS', 'DR', 'DISJ', 'DISJ.', 'DISJUN'],
    'TOMADA': ['CONJUNTO', 'PLACA', 'TOM', 'TOM.'],
    'INTERRUPTOR': ['CONJUNTO', 'TECLA', 'INT', 'INT.', 'INTER'],
    'MODULO': ['MOD', 'MOD.', 'MÓDULO'],
    'PLACA': ['PL', 'PL.', 'ESPELHO'],

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

    // Match exato
    if (SEARCH_SYNONYMS[normalized]) {
        SEARCH_SYNONYMS[normalized].forEach(v => variations.add(v));
    }

    // Match parcial (prefixo) para chaves longas (ex: "VERBE" -> "VERMELHO"?)
    // Não, apenas prefixo da chave no mapa
    // Ex: "VERM" -> match "VERMELHO" -> expand para "VM"
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

    // Match Patterns (S8 <-> S08) - Fixation Anchors
    // Expands "S8" -> "S08" and "S08" -> "S8", but ignores "S10", "S12" (only single digit logic usually)
    // Actually, user said "s8 é o mesmo que bucha s08 e isso vale para todas as buchas".
    // Usually only relevant for single digits S4, S5, S6, S8, but maybe S10 is just S10.
    // Regex: ^S0?(\d)$ matches S4, S04, S8, S08. Does not match S10.
    const sMatch = normalized.match(/^S(0)?(\d)$/);
    if (sMatch) {
        const digit = sMatch[2];
        variations.add(`S${digit}`);
        variations.add(`S0${digit}`);
    }

    return Array.from(variations);
}

export const STOPWORDS = new Set(['DE', 'DA', 'DO', 'PARA', 'COM', 'EM', 'P/', 'O', 'A', 'OS', 'AS']);
