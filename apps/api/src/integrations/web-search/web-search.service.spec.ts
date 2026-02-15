import { Test, TestingModule } from '@nestjs/testing';
import { WebSearchService } from './web-search.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WebSearchService', () => {
  let service: WebSearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebSearchService],
    }).compile();

    service = module.get<WebSearchService>(WebSearchService);
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('searchImages', () => {
    it('deve retornar URLs de imagens quando a busca tem sucesso', async () => {
      // Mock do Passo 1: busca inicial para pegar o VQD
      mockedAxios.get.mockResolvedValueOnce({
        data: 'vqd="12345-67890"',
      });

      // Mock do Passo 2: busca de imagens i.js
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          results: [
            { image: 'http://example.com/img1.jpg' },
            { image: 'http://example.com/img2.jpg' },
            { image: 'http://example.com/img3.jpg' },
            { image: 'http://example.com/img4.jpg' },
            { image: 'http://example.com/img5.jpg' },
          ],
        },
      });

      const results = await service.searchImages('test query');

      expect(results).toHaveLength(4); // Deve limitar a 4
      expect(results[0]).toBe('http://example.com/img1.jpg');
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });

    it('deve retornar array vazio se não encontrar o token VQD', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: 'no vqd token here',
      });

      const results = await service.searchImages('test query');

      expect(results).toEqual([]);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it('deve lidar com erro na requisição e retornar array vazio', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

      const results = await service.searchImages('test query');

      expect(results).toEqual([]);
    });
  });
});
