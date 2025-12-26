import { SankhyaProduct } from '../dto/sankhya-product.dto';

export class ProductMapper {
    /**
     * Converte um produto da VIEW VW_PORTAL_PRODUTOS para o formato do Portal
     */
    static toPortalProduct(sankhyaProduct: any) {
        // O retorno do Sankhya via DbExplorerSP é um ARRAY de valores na ordem do SELECT
        // Indices baseados na query do SankhyaClient:
        // 0: CODPROD, 1: DESCRPROD, 2: MARCA, 3: MARCA_CONTROLE, 4: CODVOL, 5: ATIVO, 6: ESTOQUE, 7: PRECO_CONSUMIDOR, 8: ENDIMAGEM, 9: CATEGORIA_MACRO

        let codprod, descrprod, marca, marca_controle, codvol, ativo, estoque, preco, endimagem, categoria_macro;

        if (Array.isArray(sankhyaProduct)) {
            [codprod, descrprod, marca, marca_controle, codvol, ativo, estoque, preco, endimagem, categoria_macro] = sankhyaProduct;
        } else {
            // Fallback
            codprod = sankhyaProduct.CODPROD || sankhyaProduct.codprod;
            descrprod = sankhyaProduct.DESCRPROD;
            marca = sankhyaProduct.MARCA;
            marca_controle = sankhyaProduct.MARCA_CONTROLE;
            codvol = sankhyaProduct.CODVOL;
            ativo = sankhyaProduct.ATIVO;
            estoque = sankhyaProduct.ESTOQUE;
            preco = sankhyaProduct.PRECO_CONSUMIDOR;
            endimagem = sankhyaProduct.ENDIMAGEM;
            categoria_macro = sankhyaProduct.CATEGORIA_MACRO;
        }

        return {
            sankhya_code: parseInt(codprod),
            name: descrprod?.trim() || 'Produto sem nome',
            price: parseFloat(preco || 0),
            unit: codvol || 'UN',
            brand: marca_controle?.trim() || marca?.trim() || null,
            is_available: ativo === 'S' && (estoque || 0) > 0,
            category: this.mapCategory(categoria_macro) || this.inferCategory(descrprod),
            description: null,
            image_url: null, // Será definido pelo serviço de sync após download da imagem
        };
    }

    private static mapCategory(code: string): string | null {
        if (!code) return null;

        const categories: Record<string, string> = {
            'AB': 'Acabamento',
            'AC': 'Acessórios',
            'AT': 'Automação',
            'CD': 'Cabos Diversos',
            'CE': 'Cabos Energia',
            'CI': 'Combate a Incêndio',
            'EQ': 'Equipamentos',
            'FE': 'Ferragens',
            'FR': 'Ferramentas',
            'HD': 'Hidraulico',
            'IC': 'Iluminação Comercial',
            'ID': 'Iluminação Decorativa',
            'IN': 'Infraestrutura',
            'MT': 'Média Tensão',
            'SP': 'SPDA'
        };

        return categories[code.toUpperCase()] || code; // Retorna o nome mapeado ou o próprio código se não achar
    }

    /**
     * Fallback: Infere a categoria baseado no nome do produto se não tiver macro
     */
    private static inferCategory(name: string): string {
        const lowerName = name?.toLowerCase() || '';

        if (lowerName.includes('disjuntor') || lowerName.includes('dr')) {
            return 'Elétrica';
        }
        if (lowerName.includes('fio') || lowerName.includes('cabo')) {
            return 'Fios e Cabos';
        }
        if (lowerName.includes('tomada') || lowerName.includes('interruptor')) {
            return 'Acabamento';
        }
        if (lowerName.includes('lampada') || lowerName.includes('led')) {
            return 'Iluminação';
        }
        if (lowerName.includes('condulete') || lowerName.includes('caixa')) {
            return 'Infraestrutura';
        }

        return 'Geral';
    }

    /**
     * Converte múltiplos produtos em lote
     */
    static toPortalProducts(sankhyaProducts: SankhyaProduct[]) {
        return sankhyaProducts.map(product => this.toPortalProduct(product));
    }
}
