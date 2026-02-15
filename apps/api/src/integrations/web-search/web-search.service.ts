import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WebSearchService {
  private readonly logger = new Logger(WebSearchService.name);

  /**
   * Busca imagens no DuckDuckGo sem necessidade de API Key.
   * Retorna as 4 primeiras URLs de imagens encontradas.
   */
  async searchImages(query: string): Promise<string[]> {
    try {
      this.logger.debug(`Buscando imagens para: ${query}`);

      // 1. Obter o token VQD
      const step1 = await axios.get(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`);
      const vqdMatch = step1.data.match(/vqd=['"]?([^'"]+)/);
      
      if (!vqdMatch) {
         this.logger.warn(`Não foi possível encontrar o token VQD para: ${query}`);
         return [];
      }

      const vqd = vqdMatch[1];

      // 2. Buscar as imagens
      const step2 = await axios.get(`https://duckduckgo.com/i.js`, {
        params: {
          q: query,
          o: 'json',
          vqd: vqd,
          f: ',,,',
          p: '1'
        }
      });

      if (!step2.data || !step2.data.results) {
        return [];
      }

      // 3. Extrair as URLs (limitando a 4)
      const results = step2.data.results
        .slice(0, 4)
        .map((res: any) => res.image);

      this.logger.debug(`Encontradas ${results.length} imagens para: ${query}`);
      return results;
    } catch (error) {
      this.logger.error(`Erro ao buscar imagens para: ${query}`, error.message);
      return [];
    }
  }
}
