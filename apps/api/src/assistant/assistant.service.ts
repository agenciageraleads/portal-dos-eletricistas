
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ServicesService } from '../services/services.service';
import { BudgetsService } from '../budgets/budgets.service';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssistantService {
    private openai: OpenAI;

    constructor(
        private configService: ConfigService,
        private servicesService: ServicesService,
        private budgetsService: BudgetsService,
        private prisma: PrismaService
    ) {
        this.openai = new OpenAI({
            apiKey: this.configService.get<string>('OPENAI_API_KEY'),
        });
    }

    async chat(userMessage: string, userId: string, audioUrl?: string, imageUrl?: string, sessionId?: string) {
        let finalMessage = userMessage;

        // 1. Transcribe Audio if present
        if (audioUrl) {
            try {
                const transcription = await this.transcribeAudio(audioUrl);
                finalMessage = transcription ? `${transcription} ${userMessage || ''}` : userMessage;
            } catch (error) {
                console.error('Transcription failed', error);
                return { reply: 'Desculpe, não consegui ouvir seu áudio. Pode escrever?' };
            }
        }

        if (!finalMessage && !imageUrl) {
            return { reply: 'Por favor, diga algo ou envie uma imagem.' };
        }

        // 2. Resolve Session
        let finalSessionId = sessionId;
        let isNewSession = false;

        if (!finalSessionId || finalSessionId === 'new') {
            const session = await this.createSession(userId);
            finalSessionId = session.id;
            isNewSession = true;
        }

        // 3. Load PREVIOUS History for this Session
        const previousMsgs = await this.prisma.chatMessage.findMany({
            where: { sessionId: finalSessionId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        const historyMessages = previousMsgs.reverse().map(msg => ({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content
        }));

        // 4. Save User Message
        await this.prisma.chatMessage.create({
            data: {
                userId,
                sessionId: finalSessionId,
                role: 'user',
                content: finalMessage || '[Envio de Imagem]',
            }
        });


        const systemPrompt = `
      Você é o 'Eletricista GPT', o assistente oficial do aplicativo 'Portal do Eletricista'. 
      Sua persona é a de um eletricista sênior com anos de experiência, amigável, direto e prestativo.

      **Suas Responsabilidades:**
      1. **Suporte Técnico:** Tirar dúvidas sobre elétrica, instalações, normas (NBR 5410) e materiais.
      2. **Guia e Operador do Sistema:** Ensinar o usuário a navegar E realizar ações por ele (criar orçamentos, postar vagas).

      **Mapa do Sistema:**
      - **Orçamentos (/orcamento):** Criar propostas para clientes.
      - **Ferramentas (/ferramentas):** Calcular bitola de cabos e disjuntores.
      - **Mural de Vagas (/services):** Anunciar vagas ou disponibilidade.
      - **Perfil (/perfil):** Editar dados.

      **Uso de Ferramentas (Tools):**
      - Se o usuário pedir para criar um orçamento, use 'create_budget_draft'.
      - Se o usuário pedir para postar uma vaga/serviço, use 'post_service_listing'.
      - Se o usuário perguntar algo que dependa dessas ações, execute a ação primeiro.

      **Diretrizes de Resposta:**
      - Seja conciso.
      - Responda sempre em Português do Brasil.
      - Se criar algo, forneça o link no formato Markdown: [Ver Item](/rota/ID).
    `;

        const messages: any[] = [
            { role: 'system', content: systemPrompt },
            ...historyMessages
        ];

        // Construct User Message with Image if present
        if (imageUrl) {
            const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${process.env.APP_URL || 'http://localhost:3333'}${imageUrl}`;
            messages.push({
                role: 'user',
                content: [
                    { type: 'text', text: finalMessage || 'Analise esta imagem.' },
                    { type: 'image_url', image_url: { url: fullImageUrl } }
                ]
            });
        } else {
            // Avoid duplicating if it was already in history? 
            // Ideally we shouldn't fetch the *just inserted* message if we are appending it here.
            // But we inserted it above. 
            // Actually, OpenAI expects the last message to be user.
            // If we fetched it in 'history', we should NOT push it again.
            // Let's refine:
            // 1. insert user message to DB.
            // 2. fetch all history (including the one we just inserted).
            // 3. send to OpenAI.

            // BUT, if we use the history array, the last item IS the user message.
            // Does OpenAI handle images in history? Yes, but `content` is simple string in DB.
            // So for image we need to be careful.
            // If this turn has an image, we should probably construct the array such that the last message HAS the image object.

            // CORRECT APPROACH:
            // Don't rely on DB for the *current* rich message (with image). 
            // We DO validly want to retrieve previous context.
            // So:
            // 1. Fetch PREVIOUS interactions (exclude current).
            // 2. Append CURRENT interaction (with image struct if needed).
            // 3. Save CURRENT interaction to DB (as text representation).

            // Let's adjust logic:
            // 1. Fetch History FIRST (before saving current).
            // 2. Save Current to DB (async or await).
            // 3. Construct messages = [System, ...History, Current].
            // Note: 'History' from DB is text only. If user sent image previously, we stored "[Envio de Imagem]" or description.

            // Let's redo this block to follow the "Fetch first" strategy.
        }

        // Re-writing the replacement block with corrected logic inside:



        const tools = [
            {
                type: 'function',
                function: {
                    name: 'post_service_listing',
                    description: 'Cria um novo anúncio de vaga (REQUEST) ou disponibilidade (OFFER) no mural de serviços.',
                    parameters: {
                        type: 'object',
                        properties: {
                            title: { type: 'string', description: 'Título do anúncio. Ex: Preciso de ajudante' },
                            description: { type: 'string', description: 'Detalhes do serviço' },
                            price: { type: 'number', description: 'Valor em reais (opcional)' },
                            city: { type: 'string', description: 'Cidade' },
                            state: { type: 'string', description: 'UF (Sigla)' },
                            date: { type: 'string', description: 'Data do serviço (ISO 8601 YYYY-MM-DD)' },
                            type: { type: 'string', enum: ['REQUEST', 'OFFER'], description: 'REQUEST=Precisa de ajuda, OFFER=Oferece serviço' },
                            whatsapp: { type: 'string', description: 'Telefone para contato' }
                        },
                        required: ['title', 'description', 'city', 'state', 'date', 'type', 'whatsapp']
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'create_budget_draft',
                    description: 'Cria um rascunho de orçamento profissional.',
                    parameters: {
                        type: 'object',
                        properties: {
                            clientName: { type: 'string', description: 'Nome do cliente' },
                            description: { type: 'string', description: 'Descrição do serviço (Mão de obra)' },
                            laborValue: { type: 'number', description: 'Valor da mão de obra (opcional, default 0)' }
                        },
                        required: ['clientName']
                    }
                }
            }
        ];

        try {
            // 1. First Call: AI decides to use tool or not
            const completion = await this.openai.chat.completions.create({
                messages: messages,
                model: 'gpt-4o-mini',
                tools: tools as any,
                tool_choice: 'auto',
            });

            const reply = completion.choices[0].message;

            // 2. If no tool call, just return text
            if (!reply.tool_calls || reply.tool_calls.length === 0) {
                // Save Reply
                await this.prisma.chatMessage.create({
                    data: {
                        userId,
                        sessionId: finalSessionId,
                        role: 'assistant',
                        content: reply.content || '...',
                    }
                });

                // Auto-Title
                if (isNewSession && finalMessage) {
                    const simpleTitle = finalMessage.slice(0, 40) + (finalMessage.length > 40 ? '...' : '');
                    await this.prisma.chatSession.update({
                        where: { id: finalSessionId },
                        data: { title: simpleTitle }
                    });
                }

                return { reply: reply.content, sessionId: finalSessionId };
            }

            // 3. Handle Tool Calls
            messages.push(reply); // Add AI intent to history

            for (const toolCall of reply.tool_calls) {
                const tc = toolCall as any;
                const fnName = tc.function.name;
                const fnArgs = JSON.parse(tc.function.arguments);
                let result = '';

                try {
                    if (fnName === 'post_service_listing') {
                        const service = await this.servicesService.create(userId, fnArgs);
                        result = JSON.stringify({ success: true, id: service.id, link: `/services` });
                    } else if (fnName === 'create_budget_draft') {
                        // Create budget with empty items
                        const budget = await this.budgetsService.create(userId, {
                            clientName: fnArgs.clientName,
                            clientPhone: '',
                            items: [], // Draft starts empty
                            laborValue: fnArgs.laborValue || 0,
                            laborDescription: fnArgs.description || '',
                            notes: '',
                            status: 'DRAFT'
                        });
                        result = JSON.stringify({ success: true, id: budget.id, link: `/orcamento?id=${budget.id}` });
                    } else {
                        result = JSON.stringify({ error: 'Function not found' });
                    }
                } catch (error) {
                    console.error('Tool Error', error);
                    result = JSON.stringify({ error: 'Failed to execute action' });
                }

                // Add tool result to history
                messages.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: result
                });
            }

            // 4. Second Call: AI generates final response based on tool result
            const finalCompletion = await this.openai.chat.completions.create({
                messages: messages,
                model: 'gpt-4o-mini',
            });

            const finalReply = finalCompletion.choices[0].message.content;

            // --- NEW: Save Assistant Reply ---

            await this.prisma.chatMessage.create({
                data: {
                    userId,
                    sessionId: finalSessionId,
                    role: 'assistant',
                    content: finalReply || '...',
                }
            });

            // Auto-title if new session and enough content
            if (isNewSession && finalMessage.length > 0) {
                // Simple title from first user message
                const simpleTitle = finalMessage.slice(0, 40) + (finalMessage.length > 40 ? '...' : '');
                await this.prisma.chatSession.update({
                    where: { id: finalSessionId },
                    data: { title: simpleTitle }
                });
            }

            return { reply: finalReply, sessionId: finalSessionId };

        } catch (error) {
            console.error('OpenAI Error:', error);
            return { reply: 'Desculpe, tivemos uma falha na comunicação. Tente novamente.' };
        }
    }

    async transcribeAudio(audioUrl: string): Promise<string> {
        // Since we don't have direct FS access to the file if it's external, or need to fetch it.
        // For simplicity, assuming local dev environment where we can fetch via fetch() or FS if path is known.
        // But OpenAI SDK expects a File object or ReadStream.

        try {
            // Fetch file
            const fullUrl = audioUrl.startsWith('http') ? audioUrl : `${process.env.APP_URL || 'http://localhost:3333'}${audioUrl}`;
            const response = await fetch(fullUrl);
            const blob = await response.blob();

            // Convert to File object for OpenAI
            const file = new File([blob], 'audio.webm', { type: 'audio/webm' });

            const transcription = await this.openai.audio.transcriptions.create({
                file: file,
                model: 'whisper-1',
                language: 'pt',
            });

            return transcription.text;
        } catch (error) {
            console.error('Whisper Error:', error);
            throw error;
        }
    }
    async getHistory(userId: string) {
        // Deprecated? No, useful for default view or search. 
        // But for UI we now want Sessions.
        return [];
    }

    async getUserSessions(userId: string) {
        return this.prisma.chatSession.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            select: { id: true, title: true, updatedAt: true }
        });
    }

    async createSession(userId: string) {
        return this.prisma.chatSession.create({
            data: { userId, title: 'Nova Conversa' }
        });
    }

    async getSessionMessages(sessionId: string, userId: string) {
        // Verify ownership?
        // const session = ...
        return this.prisma.chatMessage.findMany({
            where: { sessionId, userId }, // basic security
            orderBy: { createdAt: 'asc' }
        });
    }

    private getSystemPrompt() {
        return `
      Você é o 'Eletricista GPT', o assistente oficial do aplicativo 'Portal do Eletricista'. 
      Sua persona é a de um eletricista sênior com anos de experiência.
      
      **Suas Responsabilidades:**
      1. Suporte Técnico (NBR 5410).
      2. Guia do Sistema.

      **Mapa do Sistema:**
      - /orcamento: Criar propostas.
      - /ferramentas: Calculadoras.
      - /services: Mural de Vagas.
      - /perfil: Dados.

      **Tools:** 'create_budget_draft', 'post_service_listing'.

      **Regras:**
      - Responda em Português do Brasil.
      - Seja direto.
        `;
    }
}
