import Link from 'next/link';

export const metadata = {
  title: 'Termos de Uso | Nuvary Invest',
  description: 'Termos e condições de uso da plataforma Nuvary Invest.',
};

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1a] text-gray-200">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0d1424]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-white text-lg">Nuvary Invest</span>
          </Link>
          <Link href="/cadastro" className="text-sm text-[#00B8D9] hover:underline">
            Voltar ao cadastro
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Título */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#00B8D9] mb-2">Documento legal</p>
          <h1 className="text-3xl font-bold text-white mb-3">Termos de Uso</h1>
          <p className="text-sm text-gray-400">
            Última atualização: 05 de março de 2026 &nbsp;|&nbsp; Versão 1.0
          </p>
        </div>

        <div className="space-y-10 text-sm leading-relaxed text-gray-300">

          {/* 1 */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3 pb-2 border-b border-white/10">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar ou utilizar a plataforma <strong className="text-white">Nuvary Invest</strong> ("Plataforma"), você ("Usuário") concorda
              integralmente com estes Termos de Uso, com a nossa{' '}
              <Link href="/privacidade" className="text-[#00B8D9] hover:underline">Política de Privacidade</Link>{' '}
              e com toda a legislação aplicável, incluindo a Lei nº 13.709/2018 (LGPD) e as normas da
              Comissão de Valores Mobiliários (CVM).
            </p>
            <p className="mt-3">
              Caso não concorde com qualquer disposição destes Termos, você não deverá utilizar a Plataforma.
              O uso continuado da Plataforma após alterações nos Termos constitui aceitação das modificações.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3 pb-2 border-b border-white/10">2. Descrição do Serviço</h2>
            <p>
              A Nuvary Invest é uma plataforma digital de <strong className="text-white">educação financeira e gestão informacional de carteiras de investimentos</strong>,
              que oferece as seguintes funcionalidades:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1.5 text-gray-300">
              <li>Organização e acompanhamento da carteira de investimentos cadastrada pelo próprio Usuário;</li>
              <li>Conteúdo educacional sobre finanças, mercado de capitais e investimentos;</li>
              <li>Relatórios demonstrativos com base nos dados inseridos pelo Usuário;</li>
              <li>Assistente de inteligência artificial com fins educacionais e informativos;</li>
              <li>Indicadores de mercado (taxas Selic, CDI, IPCA, cotações) obtidos de fontes públicas.</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3 pb-2 border-b border-white/10">3. Natureza Informativa — Não é Consultoria de Valores Mobiliários</h2>
            <div className="bg-amber-900/20 border border-amber-700/40 rounded-lg p-4 mb-4">
              <p className="text-amber-300 font-semibold text-xs uppercase tracking-wide mb-1">Aviso Importante</p>
              <p className="text-amber-200/90">
                A Nuvary Invest <strong>não é uma instituição financeira, corretora de valores, gestora de recursos ou consultora de investimentos
                autorizada pela CVM</strong>. Todo o conteúdo disponibilizado tem caráter exclusivamente educacional e informativo.
              </p>
            </div>
            <p>
              As informações, análises, relatórios, simulações e sugestões disponibilizadas pela Plataforma:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1.5">
              <li><strong className="text-white">Não constituem</strong> oferta, solicitação ou recomendação de compra ou venda de ativos financeiros;</li>
              <li><strong className="text-white">Não substituem</strong> a orientação de um profissional habilitado pela CVM (analista, consultor ou assessor de investimentos);</li>
              <li><strong className="text-white">Não garantem</strong> rentabilidade futura — rentabilidade passada não é garantia de resultado futuro;</li>
              <li><strong className="text-white">Não levam em conta</strong> a situação financeira individual, objetivos específicos ou perfil de risco do Usuário para fins regulatórios.</li>
            </ul>
            <p className="mt-3">
              O Usuário é o único responsável pelas decisões de investimento tomadas com base nas informações da Plataforma.
              Investimentos em renda variável envolvem riscos, inclusive de perda do capital investido.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3 pb-2 border-b border-white/10">4. Cadastro e Conta do Usuário</h2>
            <p>
              Para acessar os recursos da Plataforma, o Usuário deve criar uma conta fornecendo informações verdadeiras, precisas e atualizadas.
              O Usuário é responsável por:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1.5">
              <li>Manter a confidencialidade de suas credenciais de acesso (e-mail e senha);</li>
              <li>Todas as atividades realizadas em sua conta;</li>
              <li>Notificar imediatamente a Nuvary Invest em caso de acesso não autorizado à sua conta;</li>
              <li>Não compartilhar sua conta com terceiros;</li>
              <li>Ser maior de 18 (dezoito) anos ou emancipado para utilizar a Plataforma.</li>
            </ul>
            <p className="mt-3">
              Reservamo-nos o direito de suspender ou encerrar contas que violem estes Termos, contenham informações falsas
              ou cuja atividade seja considerada fraudulenta ou prejudicial à Plataforma ou a outros Usuários.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3 pb-2 border-b border-white/10">5. Uso Aceitável</h2>
            <p>O Usuário compromete-se a utilizar a Plataforma exclusivamente para fins lícitos. É expressamente proibido:</p>
            <ul className="list-disc list-inside mt-3 space-y-1.5">
              <li>Utilizar a Plataforma para atividades ilegais, fraudulentas ou que violem direitos de terceiros;</li>
              <li>Tentar acessar áreas restritas, dados de outros usuários ou sistemas da Plataforma sem autorização;</li>
              <li>Realizar engenharia reversa, descompilar ou tentar extrair o código-fonte da Plataforma;</li>
              <li>Utilizar robôs, scrapers ou outros meios automatizados para coletar dados da Plataforma;</li>
              <li>Publicar ou transmitir conteúdo difamatório, ofensivo, obsceno ou que viole direitos de propriedade intelectual;</li>
              <li>Reproduzir ou distribuir conteúdo da Plataforma sem autorização expressa e por escrito.</li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3 pb-2 border-b border-white/10">6. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo da Plataforma — incluindo, mas não se limitando a textos, gráficos, logotipos, ícones, imagens,
              clipes de áudio, downloads digitais, compilações de dados e software — é de propriedade exclusiva da Nuvary Invest
              ou de seus licenciadores e está protegido pela Lei nº 9.610/1998 (Lei de Direitos Autorais) e demais legislação aplicável.
            </p>
            <p className="mt-3">
              É concedida ao Usuário uma licença limitada, não exclusiva e intransferível para acessar e utilizar a Plataforma
              para uso pessoal e não comercial. Nenhum direito ou licença sobre propriedade intelectual é transferido ao Usuário.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3 pb-2 border-b border-white/10">7. Limitação de Responsabilidade</h2>
            <p>
              Na máxima extensão permitida pela legislação aplicável, a Nuvary Invest não será responsável por:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1.5">
              <li>Perdas financeiras decorrentes de decisões de investimento baseadas nas informações da Plataforma;</li>
              <li>Imprecisões, erros ou desatualizações nos dados de mercado exibidos (obtidos de APIs de terceiros);</li>
              <li>Interrupções, falhas técnicas ou indisponibilidade temporária da Plataforma;</li>
              <li>Acessos não autorizados decorrentes de negligência do próprio Usuário na guarda de suas credenciais;</li>
              <li>Danos indiretos, incidentais, especiais ou consequenciais de qualquer natureza.</li>
            </ul>
            <p className="mt-3">
              O Usuário reconhece que utiliza a Plataforma por sua conta e risco.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3 pb-2 border-b border-white/10">8. Disponibilidade e Modificações</h2>
            <p>
              A Nuvary Invest se reserva o direito de, a qualquer momento e sem aviso prévio:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1.5">
              <li>Modificar, suspender ou descontinuar qualquer parte da Plataforma;</li>
              <li>Alterar os presentes Termos de Uso, sendo que as alterações entrarão em vigor após publicação na Plataforma;</li>
              <li>Estabelecer limites de uso ou restringir o acesso a determinadas funcionalidades.</li>
            </ul>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3 pb-2 border-b border-white/10">9. Proteção de Dados (LGPD)</h2>
            <p>
              O tratamento dos dados pessoais do Usuário é realizado em conformidade com a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados — LGPD).
              Todas as informações sobre coleta, uso, armazenamento e direitos do Titular estão detalhadas em nossa{' '}
              <Link href="/privacidade" className="text-[#00B8D9] hover:underline">Política de Privacidade</Link>,
              que integra estes Termos de Uso.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3 pb-2 border-b border-white/10">10. Rescisão</h2>
            <p>
              O Usuário pode encerrar sua conta a qualquer momento mediante solicitação pelo e-mail de contato.
              A Nuvary Invest pode encerrar ou suspender o acesso do Usuário sem aviso prévio em caso de violação destes Termos.
            </p>
            <p className="mt-3">
              Após o encerramento, os dados do Usuário serão tratados conforme o disposto na Política de Privacidade.
              As disposições que, por sua natureza, devam permanecer em vigor após o encerramento, continuarão válidas.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3 pb-2 border-b border-white/10">11. Lei Aplicável e Foro</h2>
            <p>
              Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil.
              Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer controvérsias
              decorrentes deste instrumento, com renúncia expressa a qualquer outro foro,
              por mais privilegiado que seja.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3 pb-2 border-b border-white/10">12. Contato</h2>
            <p>
              Dúvidas, sugestões ou solicitações relacionadas a estes Termos de Uso devem ser enviadas para:
            </p>
            <div className="mt-3 bg-white/5 rounded-lg p-4 space-y-1">
              <p><span className="text-gray-400">Empresa:</span> <span className="text-white">Nuvary Invest</span></p>
              <p><span className="text-gray-400">E-mail:</span> <span className="text-[#00B8D9]">contato@nuvaryinvest.com.br</span></p>
              <p><span className="text-gray-400">Encarregado de Dados (DPO):</span> <span className="text-white">dpo@nuvaryinvest.com.br</span></p>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">© 2026 Nuvary Invest. Todos os direitos reservados.</p>
          <div className="flex gap-4 text-xs">
            <Link href="/termos" className="text-[#00B8D9] hover:underline">Termos de Uso</Link>
            <Link href="/privacidade" className="text-gray-400 hover:text-white">Política de Privacidade</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
