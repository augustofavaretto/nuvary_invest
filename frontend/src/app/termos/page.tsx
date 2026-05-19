import Link from 'next/link';
import { LegalLayout, LegalSection, LegalBullets } from '@/components/public/LegalLayout';

export const metadata = {
  title: 'Termos de Uso | Nuvary Invest',
  description: 'Termos e condições de uso da plataforma Nuvary Invest.',
};

export default function TermosPage() {
  return (
    <LegalLayout
      eyebrow="DOCUMENTO LEGAL"
      title="Termos de Uso"
      lastUpdate="05 de março de 2026"
      version="1.0"
      backHref="/cadastro"
      backLabel="Voltar ao cadastro"
    >
      <LegalSection title="1. Aceitação dos Termos">
        <p>
          Ao acessar ou utilizar a plataforma <strong>Nuvary Invest</strong> (&quot;Plataforma&quot;),
          você (&quot;Usuário&quot;) concorda integralmente com estes Termos de Uso,
          com a nossa{' '}
          <Link
            href="/privacidade"
            className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
          >
            Política de Privacidade
          </Link>{' '}
          e com toda a legislação aplicável, incluindo a Lei nº 13.709/2018
          (LGPD), a Lei nº 12.965/2014 (Marco Civil da Internet) e as normas da
          Comissão de Valores Mobiliários (CVM).
        </p>
        <p>
          Caso não concorde com qualquer disposição destes Termos, você não
          deverá utilizar a Plataforma. O uso continuado após alterações nos
          Termos constitui aceitação das modificações.
        </p>
      </LegalSection>

      <LegalSection title="2. Descrição do Serviço">
        <p>
          A Nuvary Invest é uma plataforma digital de{' '}
          <strong>
            educação financeira e gestão informacional de carteiras de
            investimentos
          </strong>
          , que oferece as seguintes funcionalidades:
        </p>
        <LegalBullets
          items={[
            'Organização e acompanhamento da carteira de investimentos cadastrada pelo próprio Usuário;',
            'Conteúdo educacional sobre finanças, mercado de capitais e investimentos;',
            'Relatórios demonstrativos com base nos dados inseridos pelo Usuário;',
            'Assistente de inteligência artificial com fins educacionais e informativos;',
            'Indicadores de mercado (taxas Selic, CDI, IPCA, cotações) obtidos de fontes públicas.',
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Natureza Informativa — Não é Consultoria de Valores Mobiliários">
        <p>
          A Nuvary Invest tem natureza estritamente{' '}
          <strong>educacional e informativa</strong>. As recomendações geradas
          pelos algoritmos de inteligência artificial e os conteúdos
          disponibilizados na Plataforma <strong>não constituem</strong>{' '}
          consultoria, análise ou recomendação de valores mobiliários nos termos
          da Resolução CVM nº 19/2021 ou da Resolução CVM nº 20/2021.
        </p>
        <p>
          Toda decisão de investimento é de responsabilidade exclusiva do
          Usuário. A Plataforma não custodia recursos, não intermedia ordens e
          não opera por conta do Usuário. As operações são executadas
          exclusivamente pelas instituições financeiras escolhidas pelo Usuário.
        </p>
      </LegalSection>

      <LegalSection title="4. Cadastro e Conta do Usuário">
        <p>
          Para utilizar funcionalidades autenticadas, o Usuário deverá criar uma
          conta fornecendo informações verdadeiras, completas e atualizadas. O
          Usuário compromete-se a:
        </p>
        <LegalBullets
          items={[
            'Manter a confidencialidade de suas credenciais de acesso;',
            'Não compartilhar sua conta com terceiros;',
            'Notificar imediatamente a Nuvary Invest em caso de uso não autorizado;',
            'Ser maior de 18 anos ou estar devidamente representado/assistido conforme o Código Civil.',
          ]}
        />
        <p>
          A Nuvary Invest poderá suspender ou encerrar contas que apresentem
          indícios de fraude, violação destes Termos ou uso indevido da
          Plataforma.
        </p>
      </LegalSection>

      <LegalSection title="5. Planos, Pagamentos e Cancelamento">
        <p>
          A Plataforma adota modelo <strong>freemium</strong>, com plano gratuito
          e plano Premium pago. O plano Premium é cobrado por assinatura mensal
          recorrente, com valor vigente exibido na página de planos antes da
          contratação.
        </p>
        <LegalBullets
          items={[
            'Não há fidelidade contratual: o cancelamento pode ser feito a qualquer momento pelo painel do Usuário;',
            'Após o cancelamento, o acesso aos recursos Premium permanece ativo até o final do ciclo já pago;',
            'Não há reembolso proporcional para períodos parcialmente utilizados, salvo determinação legal em contrário;',
            'Valores poderão ser reajustados mediante aviso prévio de 30 dias.',
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Uso Aceitável">
        <p>O Usuário compromete-se a não utilizar a Plataforma para:</p>
        <LegalBullets
          items={[
            'Praticar qualquer ato ilícito ou contrário à moral e aos bons costumes;',
            'Tentar acessar áreas restritas, vulnerar mecanismos de segurança ou realizar engenharia reversa;',
            'Coletar dados de outros Usuários sem autorização;',
            'Inserir conteúdo falso, ofensivo, difamatório, discriminatório ou que viole direitos de terceiros;',
            'Distribuir malware, spam ou qualquer software que prejudique o funcionamento da Plataforma.',
          ]}
        />
      </LegalSection>

      <LegalSection title="7. Propriedade Intelectual">
        <p>
          Todos os direitos de propriedade intelectual relativos à Plataforma —
          incluindo marcas, logotipos, layout, código-fonte, algoritmos,
          conteúdo educacional, relatórios e documentação — pertencem à Nuvary
          Invest, sendo protegidos pela Lei nº 9.609/1998 (proteção de
          programas de computador), pela Lei nº 9.610/1998 (direitos autorais)
          e demais normas aplicáveis.
        </p>
        <p>
          É vedado copiar, reproduzir, distribuir, modificar, sublicenciar ou
          revender qualquer parte da Plataforma sem autorização expressa por
          escrito.
        </p>
      </LegalSection>

      <LegalSection title="8. Parcerias com Corretoras e Instituições Financeiras">
        <p>
          A Nuvary Invest poderá manter parcerias comerciais com corretoras,
          bancos e demais instituições financeiras. Eventuais comissionamentos
          recebidos por indicação não influenciam as recomendações personalizadas
          geradas pela inteligência artificial, que são calculadas
          exclusivamente com base no perfil de risco, horizonte e objetivos do
          Usuário.
        </p>
      </LegalSection>

      <LegalSection title="9. Limitação de Responsabilidade">
        <p>
          Na máxima extensão permitida pela legislação aplicável, a Nuvary
          Invest não será responsável por:
        </p>
        <LegalBullets
          items={[
            'Perdas financeiras decorrentes de decisões de investimento tomadas pelo Usuário;',
            'Indisponibilidade temporária da Plataforma por motivos de manutenção, falhas em terceiros (provedores de nuvem, APIs de mercado) ou caso fortuito/força maior;',
            'Imprecisões em dados de mercado fornecidos por fontes externas (B3, Alpaca, NewsAPI, entre outros);',
            'Uso indevido das credenciais do Usuário por terceiros não autorizados.',
          ]}
        />
      </LegalSection>

      <LegalSection title="10. Proteção de Dados Pessoais">
        <p>
          O tratamento de dados pessoais é regido pela nossa{' '}
          <Link
            href="/privacidade"
            className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
          >
            Política de Privacidade
          </Link>
          , elaborada em conformidade com a Lei nº 13.709/2018 (LGPD). Ao
          aceitar estes Termos, o Usuário declara estar ciente e de acordo com
          o tratamento de seus dados conforme descrito naquele documento.
        </p>
      </LegalSection>

      <LegalSection title="11. Alterações dos Termos">
        <p>
          A Nuvary Invest poderá modificar estes Termos a qualquer momento,
          mediante publicação da versão atualizada na Plataforma. Alterações
          relevantes serão comunicadas por email ou por aviso destacado dentro
          do sistema, com antecedência mínima de 15 dias.
        </p>
      </LegalSection>

      <LegalSection title="12. Disposições Gerais">
        <LegalBullets
          items={[
            'A invalidade de qualquer cláusula destes Termos não afetará as demais, que permanecerão em pleno vigor;',
            'A tolerância de eventual descumprimento não implica renúncia aos direitos previstos nestes Termos;',
            'Estes Termos são regidos pela legislação brasileira;',
            'Fica eleito o foro da Comarca de Tapejara/RS para dirimir quaisquer controvérsias, com renúncia a qualquer outro, por mais privilegiado que seja.',
          ]}
        />
      </LegalSection>

      <LegalSection title="13. Contato">
        <p>
          Dúvidas, sugestões ou solicitações relacionadas a estes Termos podem
          ser enviadas para{' '}
          <a
            href="mailto:contato@nuvaryinvest.com.br"
            className="text-cyan-400 hover:text-cyan-300"
          >
            contato@nuvaryinvest.com.br
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
