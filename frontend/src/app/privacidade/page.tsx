import Link from 'next/link';

export const metadata = {
  title: 'Política de Privacidade | Nuvary Invest',
  description: 'Política de privacidade e proteção de dados da plataforma Nuvary Invest, em conformidade com a LGPD.',
};

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-[#0a0f1a] text-gray-200">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0d1424]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Nuvary Invest" className="h-8 w-auto" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
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
          <p className="text-xs font-semibold uppercase tracking-widest text-[#00B8D9] mb-2">Lei 13.709/2018 — LGPD</p>
          <h1 className="text-3xl font-bold text-white mb-3">Política de Privacidade</h1>
          <p className="text-sm text-gray-400">
            Última atualização: 05 de março de 2026 &nbsp;|&nbsp; Versão 1.0
          </p>
        </div>

        {/* Intro */}
        <div className="bg-[#00B8D9]/10 border border-[#00B8D9]/30 rounded-xl p-5 mb-10">
          <p className="text-sm text-gray-300 leading-relaxed">
            A <strong className="text-white">Nuvary Invest</strong> respeita a sua privacidade e está comprometida com a proteção dos seus dados pessoais.
            Esta Política de Privacidade descreve como coletamos, utilizamos, armazenamos e compartilhamos os seus dados,
            em conformidade com a <strong className="text-white">Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD)</strong> e demais
            normas aplicáveis. Leia com atenção antes de utilizar nossa plataforma.
          </p>
        </div>

        <div className="space-y-10 text-sm leading-relaxed text-gray-300">

          {/* 1 */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3 pb-2 border-b border-white/10">1. Identificação do Controlador</h2>
            <div className="bg-white/5 rounded-lg p-4 space-y-1.5">
              <p><span className="text-gray-400">Controlador:</span> <span className="text-white">Nuvary Invest</span></p>
              <p><span className="text-gray-400">Finalidade:</span> <span className="text-white">Plataforma de educação financeira e gestão informacional de carteiras</span></p>
              <p><span className="text-gray-400">E-mail:</span> <span className="text-[#00B8D9]">contato@nuvaryinvest.com.br</span></p>
              <p><span className="text-gray-400">Encarregado de Dados (DPO):</span> <span className="text-[#00B8D9]">dpo@nuvaryinvest.com.br</span></p>
            </div>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3 pb-2 border-b border-white/10">2. Dados Pessoais Coletados</h2>
            <p>Coletamos os seguintes dados pessoais:</p>

            <div className="mt-4 space-y-4">
              <div>
                <p className="font-semibold text-white text-xs uppercase tracking-wide mb-2">2.1 Dados fornecidos pelo Usuário no cadastro</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Nome completo</li>
                  <li>CPF (Cadastro de Pessoa Física)</li>
                  <li>Data de nascimento</li>
                  <li>Número de telefone</li>
                  <li>Endereço de e-mail</li>
                  <li>Senha (armazenada de forma criptografada — nunca em texto puro)</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-white text-xs uppercase tracking-wide mb-2">2.2 Dados inseridos pelo Usuário na plataforma</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Ativos financeiros e valores da carteira de investimentos</li>
                  <li>Perfil de investidor (questionário de suitability educacional)</li>
                  <li>Histórico de conversas com o assistente de IA</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-white text-xs uppercase tracking-wide mb-2">2.3 Dados coletados automaticamente</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Endereço IP e dados de navegação (logs de acesso)</li>
                  <li>Tipo de dispositivo, sistema operacional e navegador</li>
                  <li>Páginas acessadas e tempo de sessão</li>
                  <li>Cookies de sessão e preferências (veja seção 8)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3 pb-2 border-b border-white/10">3. Finalidades do Tratamento e Base Legal</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-white/10">
                    <th className="text-left p-3 text-white font-semibold border border-white/10">Finalidade</th>
                    <th className="text-left p-3 text-white font-semibold border border-white/10">Base Legal (LGPD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    ['Criação e gestão da conta do Usuário', 'Execução de contrato — Art. 7º, V'],
                    ['Autenticação e segurança de acesso', 'Execução de contrato — Art. 7º, V'],
                    ['Exibição dos dados da carteira e relatórios', 'Execução de contrato — Art. 7º, V'],
                    ['Envio de notificações transacionais (ex: confirmação de e-mail)', 'Execução de contrato — Art. 7º, V'],
                    ['Melhorias na plataforma e personalização da experiência', 'Legítimo interesse — Art. 7º, IX'],
                    ['Comunicações de marketing e novidades (com opt-out disponível)', 'Consentimento — Art. 7º, I'],
                    ['Cumprimento de obrigações legais (ex: solicitações judiciais)', 'Obrigação legal — Art. 7º, II'],
                    ['Prevenção de fraudes e segurança da informação', 'Legítimo interesse — Art. 7º, IX'],
                  ].map(([fin, base]) => (
                    <tr key={fin} className="hover:bg-white/5">
                      <td className="p-3 border border-white/10">{fin}</td>
                      <td className="p-3 border border-white/10 text-[#00B8D9]">{base}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3 pb-2 border-b border-white/10">4. Compartilhamento de Dados</h2>
            <p>
              A Nuvary Invest <strong className="text-white">não vende, aluga ou comercializa</strong> seus dados pessoais.
              O compartilhamento ocorre apenas nas seguintes situações:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li>
                <strong className="text-white">Supabase (Banco de dados e autenticação):</strong> Infraestrutura de armazenamento seguro de dados,
                com servidores localizados nos EUA, regido por contrato de processamento de dados em conformidade com o GDPR/LGPD.
              </li>
              <li>
                <strong className="text-white">OpenAI (Assistente de IA):</strong> Mensagens do chat são enviadas à API da OpenAI para geração de respostas.
                Não são enviados dados de identificação pessoal (nome, CPF, e-mail) junto às mensagens.
              </li>
              <li>
                <strong className="text-white">APIs de dados de mercado (Brapi, Alpha Vantage, BCB, Finnhub):</strong> Utilizadas exclusivamente para busca
                de cotações e indicadores. Nenhum dado pessoal é transmitido.
              </li>
              <li>
                <strong className="text-white">Autoridades competentes:</strong> Quando exigido por lei, regulamentação, processo judicial
                ou solicitação governamental legítima.
              </li>
            </ul>
            <p className="mt-3">
              Todos os subprocessadores estão sujeitos a obrigações contratuais de confidencialidade e proteção de dados.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3 pb-2 border-b border-white/10">5. Retenção de Dados</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-white/10">
                    <th className="text-left p-3 text-white font-semibold border border-white/10">Tipo de Dado</th>
                    <th className="text-left p-3 text-white font-semibold border border-white/10">Prazo de Retenção</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    ['Dados cadastrais (nome, e-mail, CPF)', 'Enquanto a conta estiver ativa + 5 anos após encerramento'],
                    ['Dados da carteira de investimentos', 'Enquanto a conta estiver ativa; excluídos sob solicitação'],
                    ['Histórico de conversas com IA', 'Até exclusão pelo Usuário ou encerramento da conta'],
                    ['Logs de acesso e segurança', '12 meses (conforme Marco Civil da Internet — Lei 12.965/2014)'],
                    ['Dados para obrigação legal', 'Conforme prazo determinado pela legislação aplicável'],
                  ].map(([tipo, prazo]) => (
                    <tr key={tipo} className="hover:bg-white/5">
                      <td className="p-3 border border-white/10">{tipo}</td>
                      <td className="p-3 border border-white/10 text-gray-400">{prazo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3 pb-2 border-b border-white/10">6. Direitos do Titular (Art. 18 da LGPD)</h2>
            <p>
              Nos termos da LGPD, você tem os seguintes direitos em relação aos seus dados pessoais:
            </p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { dir: 'Confirmação e Acesso', desc: 'Confirmar se tratamos seus dados e obter cópia.' },
                { dir: 'Correção', desc: 'Solicitar correção de dados incompletos, inexatos ou desatualizados.' },
                { dir: 'Anonimização / Bloqueio / Eliminação', desc: 'Requerer tratamento desnecessário, excessivo ou ilegal.' },
                { dir: 'Portabilidade', desc: 'Receber seus dados em formato estruturado e interoperável.' },
                { dir: 'Eliminação', desc: 'Solicitar exclusão dos dados tratados com base em consentimento.' },
                { dir: 'Informação sobre compartilhamento', desc: 'Saber com quem seus dados foram compartilhados.' },
                { dir: 'Revogação do consentimento', desc: 'Retirar consentimento a qualquer momento, sem prejuízo.' },
                { dir: 'Oposição', desc: 'Opor-se a tratamento realizado em descumprimento da LGPD.' },
              ].map(item => (
                <div key={item.dir} className="bg-white/5 rounded-lg p-3">
                  <p className="font-semibold text-[#00B8D9] text-xs mb-1">{item.dir}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4">
              Para exercer seus direitos, envie solicitação para <span className="text-[#00B8D9]">dpo@nuvaryinvest.com.br</span>.
              Responderemos em até <strong className="text-white">15 dias úteis</strong>.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3 pb-2 border-b border-white/10">7. Segurança da Informação</h2>
            <p>
              Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados pessoais contra acesso não autorizado,
              perda, alteração ou divulgação indevida, incluindo:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1.5">
              <li>Criptografia de senhas com algoritmos seguros (bcrypt/Supabase Auth);</li>
              <li>Comunicação via HTTPS/TLS em todas as conexões;</li>
              <li>Row Level Security (RLS) no banco de dados — cada Usuário acessa apenas seus próprios dados;</li>
              <li>Tokens de autenticação com prazo de validade e renovação segura;</li>
              <li>Monitoramento de acessos e logs de segurança;</li>
              <li>Controle de acesso por princípio do menor privilégio.</li>
            </ul>
            <p className="mt-3">
              Em caso de incidente de segurança que possa acarretar risco ou dano relevante ao Titular,
              notificaremos a Autoridade Nacional de Proteção de Dados (ANPD) e os Titulares afetados
              em conformidade com o Art. 48 da LGPD.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3 pb-2 border-b border-white/10">8. Cookies e Tecnologias de Rastreamento</h2>
            <p>
              Utilizamos cookies e tecnologias similares para:
            </p>
            <div className="mt-3 space-y-3">
              {[
                { tipo: 'Cookies essenciais', desc: 'Necessários para o funcionamento da autenticação e sessão do Usuário. Não podem ser desativados.', cor: 'text-emerald-400' },
                { tipo: 'Cookies de preferências', desc: 'Armazenam preferências do Usuário (ex: tema claro/escuro). Podem ser desativados nas configurações do navegador.', cor: 'text-blue-400' },
                { tipo: 'Cookies analíticos', desc: 'Utilizados para análise de uso da Plataforma (dados agregados e anonimizados). O Usuário pode optar por não participar.', cor: 'text-amber-400' },
              ].map(c => (
                <div key={c.tipo} className="flex gap-3 bg-white/5 rounded-lg p-3">
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'currentColor' }} />
                  <div>
                    <p className={`font-semibold text-xs ${c.cor}`}>{c.tipo}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3 pb-2 border-b border-white/10">9. Transferência Internacional de Dados</h2>
            <p>
              Alguns de nossos parceiros (Supabase, OpenAI) possuem servidores localizados nos Estados Unidos.
              A transferência de dados é realizada com base em cláusulas contratuais padrão e em conformidade com o Art. 33 da LGPD,
              garantindo nível de proteção equivalente ao exigido pela legislação brasileira.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3 pb-2 border-b border-white/10">10. Menores de Idade</h2>
            <p>
              A Plataforma não é destinada a menores de 18 (dezoito) anos. Não coletamos intencionalmente dados pessoais
              de menores de idade. Caso identifiquemos que dados de um menor foram coletados sem o consentimento dos pais
              ou responsáveis legais, os excluiremos imediatamente.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3 pb-2 border-b border-white/10">11. Dados Sensíveis</h2>
            <p>
              Embora o CPF seja considerado dado pessoal, a Nuvary Invest não coleta dados pessoais sensíveis
              (conforme definição do Art. 5º, II da LGPD) como origem racial ou étnica, convicção religiosa,
              opinião política, saúde, vida sexual ou biometria.
              O CPF é coletado exclusivamente para fins de identificação e segurança do cadastro.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3 pb-2 border-b border-white/10">12. Alterações nesta Política</h2>
            <p>
              Esta Política de Privacidade pode ser atualizada periodicamente para refletir mudanças nas nossas práticas
              ou na legislação aplicável. Notificaremos o Usuário por e-mail e/ou por aviso na Plataforma em caso de
              alterações materiais. A data da última atualização é indicada no início deste documento.
            </p>
          </section>

          {/* 13 */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3 pb-2 border-b border-white/10">13. Contato e Encarregado de Dados (DPO)</h2>
            <p>
              Em conformidade com o Art. 41 da LGPD, indicamos nosso Encarregado de Proteção de Dados (DPO)
              para atender às comunicações dos Titulares e da ANPD:
            </p>
            <div className="mt-3 bg-white/5 rounded-lg p-4 space-y-1.5">
              <p><span className="text-gray-400">DPO:</span> <span className="text-white">Encarregado de Proteção de Dados — Nuvary Invest</span></p>
              <p><span className="text-gray-400">E-mail:</span> <span className="text-[#00B8D9]">dpo@nuvaryinvest.com.br</span></p>
              <p><span className="text-gray-400">Contato geral:</span> <span className="text-[#00B8D9]">contato@nuvaryinvest.com.br</span></p>
              <p className="text-xs text-gray-500 mt-1">Prazo de resposta: até 15 dias úteis</p>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              Você também pode peticionar à Autoridade Nacional de Proteção de Dados (ANPD) pelo portal
              gov.br/anpd, caso entenda que seus direitos não foram atendidos.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">© 2026 Nuvary Invest. Todos os direitos reservados.</p>
          <div className="flex gap-4 text-xs">
            <Link href="/termos" className="text-gray-400 hover:text-white">Termos de Uso</Link>
            <Link href="/privacidade" className="text-[#00B8D9] hover:underline">Política de Privacidade</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
