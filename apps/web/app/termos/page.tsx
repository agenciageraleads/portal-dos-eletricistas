import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermosPage() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Termos de Uso e Política de Privacidade</h1>
        <Link href="/">
          <Button variant="outline">Voltar para Home</Button>
        </Link>
      </div>

      <div className="prose dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Aceitação dos Termos</h2>
          <p>
            Ao acessar e utilizar o Portal do Eletricista, você concorda em cumprir e sujeitar-se aos seguintes termos e condições de uso.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Coleta de Dados (LGPD)</h2>
          <p>
            Em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018), informamos que coletamos os seguintes dados pessoais para a prestação de nossos serviços:
          </p>
          <ul className="list-disc pl-5 mt-2">
            <li>Nome completo</li>
            <li>CPF ou CNPJ (para emissão de orçamentos e identificação profissional)</li>
            <li>Endereço de e-mail (para login e comunicação)</li>
            <li>Telefone / WhatsApp (para contato comercial)</li>
          </ul>
          <p className="mt-2">
            Seus dados são utilizados exclusivamente para o funcionamento da plataforma, geração de orçamentos e conexão com clientes. Não vendemos suas informações para terceiros.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Responsabilidades do Usuário</h2>
          <p>
            Você é responsável pela veracidade das informações fornecidas e pela guarda segura de sua senha de acesso. O Portal do Eletricista não se responsabiliza por orçamentos gerados com dados incorretos ou uso indevido de sua conta.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Alterações nos Termos</h2>
          <p>
            Reservamo-nos o direito de alterar estes termos a qualquer momento. O uso contínuo do serviço após as alterações constitui aceitação dos novos termos.
          </p>
        </section>

        <div className="pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  );
}
