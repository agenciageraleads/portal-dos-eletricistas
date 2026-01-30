/**
 * Search Engineering Configuration
 * 
 * Este arquivo centraliza a lógica de "search engineering" para melhorar a precisão da busca.
 * Aqui definimos sinônimos, abreviações e termos equivalentes.
 */

// Mapa Base de Sinônimos e Abreviações (Unidirecional ou Bidirecional explícito)
export const RAW_SYNONYMS: Record<string, string[]> = {
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
// Agora mutável para permitir recarregamento do Banco
export let SEARCH_SYNONYMS: Record<string, Set<string>> = {};
// Mantemos referência ao mapa raw atual para prefix search
let CURRENT_RAW_SYNONYMS: Record<string, string[]> = RAW_SYNONYMS;

// Inicialização
function buildSynonymMap(raw: Record<string, string[]>) {
    const map: Record<string, Set<string>> = {};
    Object.entries(raw).forEach(([key, values]) => {
        const normalizedKey = key.toUpperCase();
        if (!map[normalizedKey]) map[normalizedKey] = new Set();

        values.forEach(v => {
            const normalizedVal = v.toUpperCase();

            // Adiciona Forward: KEY -> VAL
            map[normalizedKey].add(normalizedVal);

            // Adiciona Reverse: VAL -> KEY
            if (!map[normalizedVal]) map[normalizedVal] = new Set();
            map[normalizedVal].add(normalizedKey);
        });
    });
    return map;
}

// Build initial map from static file (Fallback)
SEARCH_SYNONYMS = buildSynonymMap(RAW_SYNONYMS);

/**
 * Atualiza os sinônimos em memória.
 * Chamado pelo Service ao iniciar ou ao atualizar via Admin.
 */
export function reloadSynonyms(newRawSynonyms: Record<string, string[]>) {
    CURRENT_RAW_SYNONYMS = newRawSynonyms;
    SEARCH_SYNONYMS = buildSynonymMap(newRawSynonyms);
    console.log(`[SearchEngineering] Synonyms reloaded. ${Object.keys(SEARCH_SYNONYMS).length} terms indexed.`);
}

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
        Object.keys(CURRENT_RAW_SYNONYMS).forEach(key => {
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

    // Numbers: 10 <-> 10,0
    const intMatch = normalized.match(/^(\d+)$/);
    if (intMatch) {
        const val = intMatch[1];
        variations.add(`${val},0`);
        variations.add(`${val}.0`);
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

        // Adiciona também a versão com ",0" se for inteiro
        if (!numberPart.includes('.') && !numberPart.includes(',')) {
            variations.add(`${numberPart},0`);
            variations.add(`${numberPart}.0`);
        }
    }

    return Array.from(variations);
}

export const STOPWORDS = new Set(['DE', 'DA', 'DO', 'PARA', 'COM', 'EM', 'P/', 'O', 'A', 'OS', 'AS']);
