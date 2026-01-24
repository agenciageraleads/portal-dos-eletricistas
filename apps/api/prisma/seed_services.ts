
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Tabela de Preços Médios do Eletricista - 2025 (baseada na Engehall)
const services = [
    // SERVIÇOS CONTRATAÇÃO DIÁRIA
    { name: 'Substitução de Disjuntor Monopolar', price: 60.62, category: 'Serviços Contratação Diária', sankhya_code: 9001 },
    { name: 'Substitução de Disjuntor Bipolar', price: 68.59, category: 'Serviços Contratação Diária', sankhya_code: 9002 },
    { name: 'Substitução de Disjuntor Tripolar', price: 76.56, category: 'Serviços Contratação Diária', sankhya_code: 9003 },
    { name: 'Instalação de Interruptor Simples ou Pulsador de Serviços', price: 54.66, category: 'Serviços Contratação Diária', sankhya_code: 9004 },
    { name: 'Instalação de Barramento Fixo (exclusive mão de obra)', price: 64.59, category: 'Serviços Contratação Diária', sankhya_code: 9005 },
    { name: 'Instalação de Barramento Fixo (exclusive fiação)', price: 76.56, category: 'Serviços Contratação Diária', sankhya_code: 9006 },
    { name: 'Instalação de Barramento Fixo (inclusive fiação e fixação)', price: 84.53, category: 'Serviços Contratação Diária', sankhya_code: 9007 },
    { name: 'Instalação de Barramento (de até 630 a 1250a)', price: 92.50, category: 'Serviços Contratação Diária', sankhya_code: 9008 },

    // INSTALAÇÕES DE PONTO DE ATENDIMENTO
    { name: 'Instalação de Ponto de Atendimento', price: 78.13, category: 'Instalações', sankhya_code: 9009 },
    { name: 'Instalação de Conjuntos (2, 3, 4, 5 e 6 módulos)', price: 85.13, category: 'Instalações', sankhya_code: 9010 },
    { name: 'Instalação de Interruptor Simples (1 seção)', price: 61.88, category: 'Instalações', sankhya_code: 9011 },
    { name: 'Instalação de Interruptor (2 seção 2 teclas + 1 módulo)', price: 71.88, category: 'Instalações', sankhya_code: 9012 },
    { name: 'Instalação e Montagem (de 5 módulos 3 a 5 teclas + 2 ou 3 tios)', price: 81.88, category: 'Instalações', sankhya_code: 9013 },
    { name: 'Instalação e Montagem (de 6 módulos 3 ou 4 teclas + 2 ou 3 tios)', price: 89.68, category: 'Instalações', sankhya_code: 9014 },

    // INSTALAÇÃO DE VENTILADORES DE TETO, LUMINÁRIAS E SPOTS
    { name: 'Instalação de Ventilador de Teto (com pedestal ou laje com forro)', price: 74.99, category: 'Iluminação e Climatização', sankhya_code: 9015 },
    { name: 'Instalação Simples de Luminária de Forros, Paredes ou Piso', price: 74.99, category: 'Iluminação e Climatização', sankhya_code: 9016 },
    { name: 'Retirada básica ou em parafuso ou arruelinha para piso', price: 39.68, category: 'Iluminação e Climatização', sankhya_code: 9017 },
    { name: 'Retirada e refixação ou arruelinha ou luminária não Simples', price: 64.94, category: 'Iluminação e Climatização', sankhya_code: 9018 },

    // PONTOS DE SERVIÇOS
    { name: 'Instalação de Serviços (todos os itens categoria previstas incluído acessórios)', price: 103.13, category: 'Pontos de Serviços', sankhya_code: 9019 },
    { name: 'Instalação de Aquecedor Elétrico 3000w até 6800w (somente fixação)', price: 186.25, category: 'Pontos de Serviços', sankhya_code: 9020 },
    { name: 'Quadro elétrico monofásico', price: 78.13, category: 'Quadros Elétricos', sankhya_code: 9021 },
    { name: 'Quadro elétrico bifásico', price: 95.00, category: 'Quadros Elétricos', sankhya_code: 9022 },
    { name: 'Quadro elétrico trifásico', price: 112.50, category: 'Quadros Elétricos', sankhya_code: 9023 },

    // INSTALAÇÃO DE SISTEMA SOLAR
    { name: 'Instalação de Sistema Solar (inversor com potência especificada)', price: 187.50, category: 'Sistema Solar', sankhya_code: 9024 },
    { name: 'Instalação de 01 módulo fotovoltaico até 160w', price: 73.13, category: 'Sistema Solar', sankhya_code: 9025 },
    { name: 'Instalação de 01 módulo fotovoltaico de 161w até 320w', price: 78.13, category: 'Sistema Solar', sankhya_code: 9026 },
    { name: 'Instalação de 01 módulo fotovoltaico de 330w até 550w', price: 83.13, category: 'Sistema Solar', sankhya_code: 9027 },
    { name: 'Instalação de 01 módulo fotovoltaico acima de 551w', price: 91.13, category: 'Sistema Solar', sankhya_code: 9028 },

    // CABEAMENTO VEICULAR
    { name: 'Cabeamento veicular', price: 125.00, category: 'Automotivo', sankhya_code: 9029 },

    // AR CONDICIONADO
    { name: 'Instalação de AR Condicionado Split 9000 a 12000 BTUs', price: 156.25, category: 'Ar Condicionado', sankhya_code: 9030 },
    { name: 'Instalação de AR Condicionado Split 18000 BTUs até 24000 BTUs', price: 203.13, category: 'Ar Condicionado', sankhya_code: 9031 },
    { name: 'Instalação de AR Condicionado Split 30000 BTUs até 36000 BTUs', price: 250.00, category: 'Ar Condicionado', sankhya_code: 9032 },
    { name: 'Instalação de AR Condicionado Split 48000 até 60000 BTUs', price: 296.88, category: 'Ar Condicionado', sankhya_code: 9033 },
    { name: 'Instalação de AR Condicionado Split 72000 BTUS em diante', price: 390.63, category: 'Ar Condicionado', sankhya_code: 9034 },
    { name: 'Instalação de AR Condicionado Cassete (embutido no forro)', price: 390.63, category: 'Ar Condicionado', sankhya_code: 9035 },
    { name: 'Instalação de AR Condicionado Cassete até 36000 BTUS', price: 296.88, category: 'Ar Condicionado', sankhya_code: 9036 },
    { name: 'Instalação de AR Condicionado Cassete 48000 BTUS em diante', price: 390.63, category: 'Ar Condicionado', sankhya_code: 9037 },
    { name: 'Instalação de AR Condicionado PISO TETO com até 24000 BTUS', price: 296.88, category: 'Ar Condicionado', sankhya_code: 9038 },
    { name: 'Instalação de AR Condicionado PISO TETO acima de 24000 BTUS', price: 390.63, category: 'Ar Condicionado', sankhya_code: 9039 },

    // INSTALAÇÃO DE REDES, RACKS
    { name: 'Instalação de Redes, Racks', price: 187.50, category: 'Redes e Infraestrutura', sankhya_code: 9040 },

    // SERVIÇOS DE MANUTENÇÃO (INSTALAÇÃO BÁSICA RESIDENCIAL)
    { name: 'Troca simples básicos TOMADA', price: 78.13, category: 'Manutenção Residencial', sankhya_code: 9041 },
    { name: 'Troca simples básicos INTERRUPTOR', price: 78.13, category: 'Manutenção Residencial', sankhya_code: 9042 },
    { name: 'Troca de lâmpadas básicos TUBULAR (fluorescente, reatores)', price: 78.13, category: 'Manutenção Residencial', sankhya_code: 9043 },
    { name: 'Manutenção básica em Quadros elétricos (abertura) aparelho Circuito ou disjuntor)', price: 93.75, category: 'Manutenção Residencial', sankhya_code: 9044 },
    { name: 'Instalação de Tomada Simples', price: 62.81, category: 'Manutenção Residencial', sankhya_code: 9045 },
    { name: 'Instalação de Tomada Dupla', price: 70.78, category: 'Manutenção Residencial', sankhya_code: 9046 },
    { name: 'Instalação de Interruptor Simples ou Campainha', price: 60.00, category: 'Manutenção Residencial', sankhya_code: 9047 },
    { name: 'Instalação de Interruptor 2 Comando', price: 78.13, category: 'Manutenção Residencial', sankhya_code: 9048 },
    { name: 'Instalação de Chuveiro Elétrico (somente fixação sem material)', price: 78.13, category: 'Manutenção Residencial', sankhya_code: 9049 },
    { name: 'Instalação de pontos (TV e Telefones até 3 pontos) somente fixação e cabo RJ11/RJ45', price: 78.13, category: 'Manutenção Residencial', sankhya_code: 9050 },
    { name: 'Instalação de Torneira Elétrica', price: 62.50, category: 'Manutenção Residencial', sankhya_code: 9051 },
    { name: 'Instalação de Campainha Elétrica', price: 62.50, category: 'Manutenção Residencial', sankhya_code: 9052 },
    { name: 'Instalação de Antena Coletiva (somente fixação sem material)', price: 62.50, category: 'Manutenção Residencial', sankhya_code: 9053 },
    { name: 'Instalação de Porteiro eletrônico (sem passar cabo ou produto e fixação)', price: 125.00, category: 'Manutenção Residencial', sankhya_code: 9054 },
    { name: 'Instalação de CFTV c/ 02 Câmeras até 8 Câmeras (sem passagem cabos tudo aéreo)', price: 250.00, category: 'Segurança', sankhya_code: 9055 },
    { name: 'Instalação de Alarme de casa (simples 6mm até 400metros instalado no subterrâneo)', price: 328.13, category: 'Segurança', sankhya_code: 9056 },
    { name: 'Instalação de CFTV c/ 01 Câmera (semanas passagens de cabo)', price: 62.50, category: 'Segurança', sankhya_code: 9057 },
    { name: 'Instalação de Cerca Elétrica (somente instalação)', price: 187.50, category: 'Segurança', sankhya_code: 9058 },
    { name: 'Instalação de Concertina (somente instalação) concertina acima de 120metros até valor ou acrescentar por ml', price: 375.00, category: 'Segurança', sankhya_code: 9059 },
    { name: 'Instalação de Refletor com até 100w', price: 68.75, category: 'Iluminação', sankhya_code: 9060 },
    { name: 'Instalação de Refletor de 150w em diante', price: 90.63, category: 'Iluminação', sankhya_code: 9061 },
    { name: 'Instalação de Sensor de Presença ou Fotocélula', price: 62.50, category: 'Automação', sankhya_code: 9062 },

    // SERVIÇOS DE INSTALAÇÃO PADRÃO
    { name: 'Substituição de Padrão Tipo Simples', price: 187.50, category: 'Padrão de Entrada', sankhya_code: 9063 },
    { name: 'Substituição de Padrão de Entrada Monofásico', price: 375.00, category: 'Padrão de Entrada', sankhya_code: 9064 },
    { name: 'Substituição de Padrão de Entrada Bifásico', price: 468.75, category: 'Padrão de Entrada', sankhya_code: 9065 },
    { name: 'Substituição de Padrão de Entrada Trifásico', price: 625.00, category: 'Padrão de Entrada', sankhya_code: 9066 },

    // AUTOMAÇÃO RESIDENCIAL
    { name: 'Automação Residencial - Instalação básica', price: 625.00, category: 'Automação Residencial', sankhya_code: 9067 },
    { name: 'Troca simples básicos DIMMER', price: 78.13, category: 'Automação Residencial', sankhya_code: 9068 },
    { name: 'Instalação básica (1 é fixar módulo)', price: 78.13, category: 'Automação Residencial', sankhya_code: 9069 },
    { name: 'Instalação média (1 é fixar módulo e comandos)', price: 93.75, category: 'Automação Residencial', sankhya_code: 9070 },
    { name: 'Instalação complexa (Configuração etc terminais e interface Wi-Fi/3G)', price: 145.31, category: 'Automação Residencial', sankhya_code: 9071 },
    { name: 'Instalação e Configuração projetos de Iluminação automatizada', price: 250.00, category: 'Automação Residencial', sankhya_code: 9072 },

    // SERVIÇOS DE ILUMINAÇÃO
    { name: 'Substituição de Reator Simples', price: 62.50, category: 'Iluminação', sankhya_code: 9073 },
    { name: 'Substituição de Reator de 01 lâmpada', price: 78.13, category: 'Iluminação', sankhya_code: 9074 },
    { name: 'Substituição de Reator de 02 lâmpadas', price: 93.75, category: 'Iluminação', sankhya_code: 9075 },
    { name: 'Instalação de Fita LED (metro linear)', price: 45.00, category: 'Iluminação', sankhya_code: 9076 },
    { name: 'Instalação de Lustre', price: 150.00, category: 'Iluminação', sankhya_code: 9077 },
    { name: 'Instalação de Luminária Simples', price: 60.00, category: 'Iluminação', sankhya_code: 9078 },
    { name: 'Instalação de Arandela', price: 70.00, category: 'Iluminação', sankhya_code: 9079 },

    // SERVIÇOS DIVERSOS
    { name: 'Aterramento (Haste)', price: 180.00, category: 'Segurança', sankhya_code: 9080 },
    { name: 'Instalação de Disjuntor Unipolar', price: 40.00, category: 'Quadro de Distribuição', sankhya_code: 9081 },
    { name: 'Instalação de Disjuntor Bipolar', price: 60.00, category: 'Quadro de Distribuição', sankhya_code: 9082 },
    { name: 'Instalação de IDR (Diferencial)', price: 120.00, category: 'Quadro de Distribuição', sankhya_code: 9083 },
    { name: 'Instalação de DPS (Surto)', price: 80.00, category: 'Quadro de Distribuição', sankhya_code: 9084 },
    { name: 'Troca de Fiação (por ponto)', price: 70.00, category: 'Infraestrutura', sankhya_code: 9085 },
    { name: 'Instalação de Interfone', price: 150.00, category: 'Segurança', sankhya_code: 9086 },
    { name: 'Instalação de Câmera Wi-Fi', price: 120.00, category: 'Segurança', sankhya_code: 9087 },
    { name: 'Instalação de Motor de Portão', price: 350.00, category: 'Segurança', sankhya_code: 9088 },
    { name: 'Visita Técnica / Orçamento', price: 80.00, category: 'Serviços Gerais', sankhya_code: 9089 },
];

async function main() {
    console.log('🔧 Populando serviços padrão da Tabela Engehall 2025...');

    for (const service of services) {
        await prisma.product.upsert({
            where: { sankhya_code: service.sankhya_code },
            update: {
                name: service.name,
                price: service.price,
                category: service.category,
                type: 'SERVICE',
                is_available: true,
                popularity_index: 0
            },
            create: {
                name: service.name,
                price: service.price,
                category: service.category,
                description: `Serviço padrão - ${service.category}`,
                image_url: 'https://cdn-icons-png.flaticon.com/512/2910/2910768.png',
                sankhya_code: service.sankhya_code,
                type: 'SERVICE',
                is_available: true,
                unit: 'UN',
                popularity_index: 0
            }
        });
        console.log(`✅ ${service.name}`);
    }

    console.log(`\n🎉 ${services.length} serviços cadastrados com sucesso!`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
