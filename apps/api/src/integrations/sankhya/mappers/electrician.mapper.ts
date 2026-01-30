import { Prisma } from '@prisma/client';

export class ElectricianMapper {
    /**
     * Converte dados da VIEW VW_RANKING_TECNICOS para o modelo User
     * Campos da VIEW (array ou objeto):
     * 0: CODPARC, 1: NOME_PARCEIRO, 2: CPF, 3: TELEFONE_WHATSAPP, 4: CODVENDTEC, 5: NOME_TECNICO_PRINCIPAL,
     * 6: CIDADE, 7: ESTADO, 8: QTD_PEDIDOS_1100, 9: VLR_TOTAL_1100, 10: TICKET_MEDIO, 11: INDICE_COMERCIAL
     */
    static toPortalUser(sankhyaElectrician: any): any {
        let codparc, nome, cpf, telefone, codvendtec, nomeTecnico, cidade, estado, qtdPedidos, vlrTotal, ticketMedio, indiceComercial;

        if (Array.isArray(sankhyaElectrician)) {
            [codparc, nome, cpf, telefone, codvendtec, nomeTecnico, cidade, estado, qtdPedidos, vlrTotal, ticketMedio, indiceComercial] = sankhyaElectrician;
        } else {
            // Fallback para objeto
            codparc = sankhyaElectrician.CODPARC;
            nome = sankhyaElectrician.NOME_PARCEIRO;
            cpf = sankhyaElectrician.CPF;
            telefone = sankhyaElectrician.TELEFONE_WHATSAPP;
            codvendtec = sankhyaElectrician.CODVENDTEC;
            nomeTecnico = sankhyaElectrician.NOME_TECNICO_PRINCIPAL;
            cidade = sankhyaElectrician.CIDADE;
            estado = sankhyaElectrician.ESTADO;
            qtdPedidos = sankhyaElectrician.QTD_PEDIDOS_1100;
            vlrTotal = sankhyaElectrician.VLR_TOTAL_1100;
            ticketMedio = sankhyaElectrician.TICKET_MEDIO;
            indiceComercial = sankhyaElectrician.INDICE_COMERCIAL;
        }

        // Limpar CPF
        const cleanCpf = String(cpf || '').replace(/\D/g, '');

        // Telefone já vem padronizado da VIEW (55XXXXXXXXXXX)
        const whatsappPhone = telefone ? String(telefone).trim() : null;

        // Gerar email temporário único baseado no CPF
        const tempEmail = `eletricista.${cleanCpf}@pre-cadastro.portal.temp`;

        // Senha aleatória (usuário não conhece até ativar)
        const randomPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        return {
            name: String(nome || nomeTecnico || 'Eletricista').trim(),
            email: tempEmail,
            password: randomPassword, // Será hasheado no service
            cpf_cnpj: cleanCpf,
            phone: whatsappPhone,
            city: cidade ? String(cidade).trim() : null,
            state: estado ? String(estado).trim() : null,
            role: 'ELETRICISTA',

            // Flags de pré-cadastro
            pre_cadastrado: true,
            cadastro_finalizado: false,
            registration_origin: 'IMPORTED',

            // Se tem WhatsApp, marca como disponível automaticamente
            isAvailableForWork: !!whatsappPhone,

            // Dados Sankhya (backend only)
            sankhya_partner_id: parseInt(codparc) || null,
            sankhya_vendor_id: parseInt(codvendtec) || null,
            commercial_index: parseFloat(indiceComercial) || null,
            total_orders: parseInt(qtdPedidos) || null,
            total_revenue: parseFloat(vlrTotal) || null,
            average_ticket: parseFloat(ticketMedio) || null,
            sankhya_synced_at: new Date(),
        };
    }

    /**
     * Converte múltiplos eletricistas em lote
     */
    static toPortalUsers(sankhyaElectricians: any[]) {
        return sankhyaElectricians.map(electrician => this.toPortalUser(electrician));
    }
}
