import {
  LegalLayout,
  LegalSection,
  LegalCallout,
  LegalBullets,
} from '@/components/public/LegalLayout';

export const metadata = {
  title: 'Política de Privacidade | Nuvary Invest',
  description:
    'Política de privacidade e proteção de dados da plataforma Nuvary Invest, em conformidade com a LGPD.',
};

export default function PrivacidadePage() {
  return (
    <LegalLayout
      eyebrow="LEI 13.709/2018 — LGPD"
      title="Política de Privacidade"
      lastUpdate="05 de março de 2026"
      version="1.0"
      backHref="/cadastro"
      backLabel="Voltar ao cadastro"
      intro={
        <LegalCallout>
          A <strong>Nuvary Invest</strong> respeita a sua privacidade e está
          comprometida com a proteção dos seus dados pessoais. Esta Política de
          Privacidade descreve como coletamos, utilizamos, armazenamos e
          compartilhamos os seus dados, em conformidade com a{' '}
          <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD)</strong>{' '}
          e demais normas aplicáveis. Leia com atenção antes de utilizar nossa
          plataforma.
        </LegalCallout>
      }
    >
      <LegalSection title="1. Identificação do Controlador">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 sm:p-6 space-y-2">
          <div>
            <span className="text-slate-400">Controlador:</span>{' '}
            <strong>Nuvary Invest</strong>
          </div>
          <div>
            <span className="text-slate-400">Finalidade:</span> Plataforma de
            educação financeira e gestão informacional de carteiras
          </div>
          <div>
            <span className="text-slate-400">E-mail:</span>{' '}
            <a
              href="mailto:investnet123@gmail.com"
              className="text-cyan-400 hover:text-cyan-300"
            >
              investnet123@gmail.com
            </a>
          </div>
          <div>
            <span className="text-slate-400">Encarregado de Dados (DPO):</span>{' '}
            <a
              href="mailto:investnet123@gmail.com"
              className="text-cyan-400 hover:text-cyan-300"
            >
              investnet123@gmail.com
            </a>
          </div>
        </div>
      </LegalSection>

      <LegalSection title="2. Dados Pessoais Coletados">
        <p>Coletamos os seguintes dados pessoais:</p>

        <div className="mt-3">
          <p className="text-sm font-semibold text-slate-200 mb-2">
            2.1 DADOS FORNECIDOS PELO USUÁRIO NO CADASTRO
          </p>
          <LegalBullets
            items={[
              'Nome completo;',
              'CPF;',
              'Data de nascimento;',
              'Telefone;',
              'Endereço de email;',
              'Senha (armazenada de forma criptografada).',
            ]}
          />
        </div>

        <div className="mt-4">
          <p className="text-sm font-semibold text-slate-200 mb-2">
            2.2 DADOS FORNECIDOS DURANTE O USO DA PLATAFORMA
          </p>
          <LegalBullets
            items={[
              'Respostas ao questionário de perfil de investidor;',
              'Informações de carteira inseridas voluntariamente pelo Usuário;',
              'Interações com o chatbot e trilhas educacionais;',
              'Preferências de notificação e configurações.',
            ]}
          />
        </div>

        <div className="mt-4">
          <p className="text-sm font-semibold text-slate-200 mb-2">
            2.3 DADOS COLETADOS AUTOMATICAMENTE
          </p>
          <LegalBullets
            items={[
              'Endereço IP, tipo e versão do navegador, sistema operacional;',
              'Páginas acessadas, tempo de permanência e padrões de navegação;',
              'Cookies e tecnologias similares (consulte a seção 8).',
            ]}
          />
        </div>
      </LegalSection>

      <LegalSection title="3. Finalidades do Tratamento">
        <p>Utilizamos seus dados para as seguintes finalidades:</p>
        <LegalBullets
          items={[
            'Permitir o acesso, autenticação e uso da Plataforma;',
            'Personalizar recomendações de carteira com base no perfil de risco;',
            'Disponibilizar conteúdo educacional adequado ao seu nível de conhecimento;',
            'Enviar comunicações operacionais, transacionais e, mediante consentimento, comunicações de marketing;',
            'Cumprir obrigações legais e regulatórias;',
            'Prevenir fraudes, garantir a segurança da Plataforma e dos Usuários;',
            'Melhorar nossos serviços por meio de análises estatísticas anonimizadas.',
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Bases Legais para o Tratamento (art. 7º LGPD)">
        <p>O tratamento de seus dados é fundamentado nas seguintes hipóteses:</p>
        <LegalBullets
          items={[
            'Execução de contrato (art. 7º, V): para prestação dos serviços contratados;',
            'Cumprimento de obrigação legal ou regulatória (art. 7º, II);',
            'Consentimento (art. 7º, I): para comunicações de marketing e cookies não essenciais;',
            'Legítimo interesse (art. 7º, IX): para prevenção a fraudes e melhoria do serviço, sempre observados seus direitos e liberdades fundamentais.',
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Compartilhamento de Dados">
        <p>
          A Nuvary Invest <strong>não vende</strong> seus dados pessoais.
          Compartilhamos apenas o estritamente necessário e nas seguintes
          hipóteses:
        </p>
        <LegalBullets
          items={[
            'Provedores de infraestrutura em nuvem (AWS), responsáveis pela hospedagem e armazenamento;',
            'Gateways de pagamento, para processamento de assinaturas;',
            'Provedores de inteligência artificial (ex.: OpenAI), exclusivamente para gerar respostas e recomendações — sem armazenamento permanente do conteúdo;',
            'Autoridades públicas, quando exigido por ordem judicial ou determinação legal;',
            'Parceiros estratégicos, somente mediante consentimento prévio e expresso do Usuário.',
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Transferência Internacional de Dados">
        <p>
          Em razão da arquitetura em nuvem e do uso de provedores
          internacionais, seus dados poderão ser armazenados ou processados em
          servidores localizados fora do Brasil. Nesses casos, garantimos que
          os destinatários adotem nível de proteção de dados adequado ao
          previsto na LGPD, mediante cláusulas contratuais específicas e demais
          salvaguardas legais.
        </p>
      </LegalSection>

      <LegalSection title="7. Armazenamento e Retenção">
        <p>
          Seus dados são armazenados em infraestrutura segura, com criptografia
          em trânsito (TLS) e em repouso. O período de retenção varia conforme
          a finalidade:
        </p>
        <LegalBullets
          items={[
            'Dados cadastrais: enquanto a conta estiver ativa;',
            'Dados financeiros inseridos voluntariamente: enquanto a conta estiver ativa, com exclusão em até 30 dias após o encerramento, salvo obrigação legal de retenção;',
            'Logs de acesso: 6 (seis) meses, conforme art. 15 do Marco Civil da Internet;',
            'Dados anonimizados para fins estatísticos: por tempo indeterminado, sem possibilidade de reidentificação.',
          ]}
        />
      </LegalSection>

      <LegalSection title="8. Cookies e Tecnologias de Rastreamento">
        <p>
          Utilizamos cookies essenciais para o funcionamento da Plataforma e,
          mediante seu consentimento, cookies analíticos e de marketing. Você
          pode gerenciar suas preferências a qualquer momento nas configurações
          do navegador ou no painel de preferências da Plataforma.
        </p>
      </LegalSection>

      <LegalSection title="9. Direitos do Titular dos Dados (art. 18 LGPD)">
        <p>Você tem o direito de, a qualquer momento:</p>
        <LegalBullets
          items={[
            'Confirmar a existência de tratamento de seus dados;',
            'Acessar seus dados pessoais;',
            'Corrigir dados incompletos, inexatos ou desatualizados;',
            'Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos;',
            'Solicitar a portabilidade de seus dados a outro fornecedor;',
            'Solicitar a eliminação dos dados tratados com base no consentimento;',
            'Obter informação sobre as entidades públicas e privadas com as quais a Nuvary Invest realizou uso compartilhado de dados;',
            'Revogar o consentimento, a qualquer momento, sem prejuízo da licitude do tratamento realizado anteriormente.',
          ]}
        />
        <p>
          Para exercer qualquer desses direitos, entre em contato com nosso DPO
          em{' '}
          <a
            href="mailto:investnet123@gmail.com"
            className="text-cyan-400 hover:text-cyan-300"
          >
            investnet123@gmail.com
          </a>
          . Responderemos em até 15 dias úteis.
        </p>
      </LegalSection>

      <LegalSection title="10. Segurança da Informação">
        <p>
          Adotamos medidas técnicas e administrativas adequadas para proteger
          seus dados contra acessos não autorizados, perda, alteração,
          comunicação ou difusão indevida, incluindo:
        </p>
        <LegalBullets
          items={[
            'Criptografia de senhas com algoritmos modernos (bcrypt/argon2);',
            'Comunicação cliente-servidor via HTTPS/TLS;',
            'Controles de acesso baseados em papéis e princípio do menor privilégio;',
            'Monitoramento contínuo e registros de auditoria;',
            'Plano de resposta a incidentes de segurança.',
          ]}
        />
        <p>
          Em caso de incidente de segurança que envolva risco ou dano relevante,
          notificaremos a Autoridade Nacional de Proteção de Dados (ANPD) e os
          titulares afetados, conforme exigido pelo art. 48 da LGPD.
        </p>
      </LegalSection>

      <LegalSection title="11. Crianças e Adolescentes">
        <p>
          A Plataforma é destinada a maiores de 18 anos. Não coletamos
          intencionalmente dados de menores. Caso identifique cadastro
          inadequado, entre em contato para remoção imediata.
        </p>
      </LegalSection>

      <LegalSection title="12. Atualizações desta Política">
        <p>
          Esta Política poderá ser atualizada periodicamente. A versão vigente
          estará sempre disponível na Plataforma, com indicação da data da
          última atualização. Alterações substanciais serão comunicadas por
          email ou aviso destacado no sistema.
        </p>
      </LegalSection>

      <LegalSection title="13. Contato com o Encarregado (DPO)">
        <p>
          Para questões relacionadas a esta Política, ao tratamento dos seus
          dados ou ao exercício de seus direitos:
        </p>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 sm:p-6 space-y-1">
          <div>
            E-mail:{' '}
            <a
              href="mailto:investnet123@gmail.com"
              className="text-cyan-400 hover:text-cyan-300"
            >
              investnet123@gmail.com
            </a>
          </div>
          <div className="text-slate-400 text-sm">
            Em caso de não resolução, o titular poderá apresentar reclamação
            diretamente à Autoridade Nacional de Proteção de Dados (ANPD).
          </div>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
