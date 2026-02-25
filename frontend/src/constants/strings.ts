/**
 * strings.ts — Fonte única de verdade para todas as strings de UI em pt-BR.
 *
 * Organização por domínio:
 *   STRINGS.errors   → mensagens de erro genéricas
 *   STRINGS.auth     → autenticação (login / cadastro)
 *   STRINGS.nav      → navegação / sidebar
 *   STRINGS.dashboard → widgets do dashboard
 *   STRINGS.chat     → interface de chat
 *   STRINGS.perfil   → questionário e perfil de investidor
 *   STRINGS.carteira → portfólio / ativos
 *   STRINGS.ui       → elementos genéricos de interface
 *
 * Uso:
 *   import { STRINGS } from '@/constants/strings';
 *   <p>{STRINGS.errors.usuarioNaoAutenticado}</p>
 *   <p>{STRINGS.chat.diasAtras(3)}</p>
 */

export const STRINGS = {
  // ─── Erros genéricos ──────────────────────────────────────────────────────
  errors: {
    usuarioNaoAutenticado: 'Usuário não autenticado',
    naoFoiPossivel: 'Não foi possível',
    tenteNovamente: 'Tente novamente.',
    erroServidor: 'Erro na comunicação com o servidor',
    naoConseguiProcessar: 'Desculpe, não consegui processar sua mensagem.',
    erroCarregarQuestionario: 'Erro ao carregar questionário. Tente novamente.',
    servidorOffline: 'Erro ao carregar questionário. Verifique se o servidor está rodando.',
  },

  // ─── Autenticação ──────────────────────────────────────────────────────────
  auth: {
    entrar: 'Entrar',
    entrando: 'Entrando...',
    criarConta: 'Criar conta',
    criandoConta: 'Criando conta...',
    esqueceuSenha: 'Esqueci minha senha',
    jaTemConta: 'Já tem conta?',
    naoTemConta: 'Não tem conta?',
    entrarComGoogle: 'Entrar com Google',
    continuarComGoogle: 'Continuar com Google',
    conectando: 'Conectando...',
    contaCriadaSucesso: 'Conta criada com sucesso! Faça login para continuar.',
    verificarEmail: 'Verifique seu email',
    confirmarEmail: 'Enviamos um link de confirmação para:',
    abrirEmail: 'Abrir meu email',
    jaConfirmei: 'Já confirmei, fazer login',
    naoRecebi: 'Não recebeu o email? Verifique sua pasta de spam ou lixo eletrônico.',
    redirecionandoJaAutenticado: 'Redireciona se já autenticado',
  },

  // ─── Navegação / Sidebar ───────────────────────────────────────────────────
  nav: {
    dashboard: 'Dashboard',
    carteira: 'Carteira',
    chatIA: 'Chat IA',
    extratos: 'Extratos',
    relatorios: 'Relatórios',
    trilhas: 'Trilhas',
    perfil: 'Perfil',
    configuracoes: 'Configurações',
    sair: 'Sair',
    questionario: 'Questionário',
    usuario: 'Usuário',
    navegacao: 'navegação',
    menuUsuario: 'Menu do usuário',
    botaoChat: 'Botão Chat',
    naoAutenticados: 'não autenticados',
  },

  // ─── Dashboard ─────────────────────────────────────────────────────────────
  dashboard: {
    acoesRapidas: 'Ações Rápidas',
    noticiasFinanceiras: 'Notícias Financeiras',
    acoesPopulares: 'Ações Populares',
    sugestoesIA: 'Sugestões da IA',
    mercadoEmTempoReal: 'Mercado em Tempo Real',
    naoFoiPossivelCarregarDados: 'Não foi possível carregar dados do mercado.',
    naoFoiPossivelCarregarAcoes: 'Não foi possível carregar lista de ações.',
    naoFoiPossivelCarregarNoticias: 'Não foi possível carregar notícias.',
    naoFoiPossivelGerarSugestoes: 'Não foi possível gerar sugestões no momento.',
    naoFoiPossivelGerarSugestoesTarde: 'Não foi possível gerar sugestões no momento. Tente novamente mais tarde.',
    semSugestoesDisponiveis: 'Faça o questionário de perfil para receber sugestões personalizadas.',
    naoConstituiRecomendacao: 'Não constitui recomendação de investimento',
  },

  // ─── Chat ──────────────────────────────────────────────────────────────────
  chat: {
    novaConversa: 'Nova conversa',
    buscarConversas: 'Buscar conversas...',
    nenhumaConversaEncontrada: 'Nenhuma conversa encontrada',
    nenhumaConversaAinda: 'Nenhuma conversa ainda',
    iniciaNova: 'Inicie uma nova conversa',
    limparHistorico: 'Limpar todo histórico',
    limparTudoConfirm: 'Limpar todo o histórico?',
    acaoIraExcluirTudo: 'Esta ação irá excluir permanentemente todas as suas conversas. Esta ação não pode ser desfeita.',
    deletarConversa: 'Deletar conversa?',
    seraExcluida: 'Esta conversa será excluída permanentemente.',
    escolhaOpcao: 'Escolha uma opção ou digite sua pergunta:',
    fazerQuestionario: 'Fazer questionário',
    querRespostasPersonalizadas: 'Quer respostas personalizadas?',
    descobrirPerfil: 'Descubra seu perfil de investidor',
    respostasIADisclaimer: 'As respostas são geradas por IA e não constituem recomendação de investimento',
    digitarMensagem: 'Digite sua mensagem...',
    hoje: 'Hoje',
    ontem: 'Ontem',
    maisAntigas: 'Mais antigas',
    diasAtras: (n: number) => `${n} dias atrás`,
    semanasAtras: (n: number) => `${n} semana${n > 1 ? 's' : ''} atrás`,
    ultimosDias: (n: number) => `Últimos ${n} dias`,
    erroSalvarMensagem: 'Erro ao salvar mensagem do usuário:',
    contextoUsuario: (
      nome: string,
      tipo: string,
      pontuacao: number,
      rf: number,
      rv: number,
      fii: number,
      intl: number
    ) =>
      `[Contexto: O usuário tem perfil ${nome} (${tipo}), com pontuação ${pontuacao}. Alocação recomendada: Renda Fixa ${rf}%, Renda Variável ${rv}%, FIIs ${fii}%, Internacional ${intl}%.]`,
    boasVindasComPerfil: (nome: string) =>
      `Olá! Sou o assistente virtual da Nuvary Invest. Vi que seu perfil é **${nome}**. Como posso ajudá-lo hoje com seus investimentos?`,
    boasVindasSemPerfil:
      'Olá! Sou o assistente virtual da Nuvary Invest. Estou aqui para ajudá-lo com dúvidas sobre investimentos, análises de mercado e educação financeira. Como posso ajudá-lo hoje?',
  },

  // ─── Questionário / Perfil de Investidor ──────────────────────────────────
  perfil: {
    questionario: 'Questionário',
    questionarioDePerfil: 'Questionário de Perfil de Investidor',
    comecarQuestionario: 'Começar Questionário',
    refazerQuestionario: 'Refazer Questionário',
    fazerQuestionario: 'Faça o questionário',
    analiseCategoria: 'Análise por Categoria',
    alocacaoRecomendada: 'Alocação Recomendada',
    suasCaracteristicas: 'Suas Características',
    toleranciaRisco: 'Tolerância a Risco',
    sePerfilE: 'Seu perfil é',
    nivelConhecimento: 'Nível de Conhecimento',
    ultimaAtualizacao: 'Última atualização',
    nivelBasico: 'Básico',
    nivelIntermediario: 'Intermediário',
    nivelAvancado: 'Avançado',
    perfilConservador: 'Conservador',
    perfilModerado: 'Moderado',
    perfilArrojado: 'Arrojado',
    perfilAgressivo: 'Agressivo',
    // Labels de alocação
    rendaFixa: 'Renda Fixa',
    rendaVariavel: 'Renda Variável',
    fiis: 'FIIs',
    internacional: 'Internacional',
    acoes: 'Ações',
    equilibrioRiscoRetorno: 'Equilíbrio entre risco e retorno',
    segurancaCapital: 'Segurança do capital',
  },

  // ─── Carteira / Portfólio ──────────────────────────────────────────────────
  carteira: {
    visaoGeral: 'Visão geral dos seus investimentos',
    ate: 'até',
    adicionarAtivo: 'Adicionar Ativo',
    precoMedio: 'Preço Médio (R$)',
    precoNaoDisponivel: 'Preço não disponível via API',
    precoObtidoVia: 'Preço obtido via',
    tickerCodigo: 'Ticker / Código',
    codigo: 'Código',
    logistica: 'Logística',
    imobiliaria: 'Imobiliária',
    recebiveis: 'Recebíveis',
    preDefinidos: 'pré-definidos',
    tickerObrigatorio: 'Ticker é obrigatório',
    nomeObrigatorio: 'Nome é obrigatório',
    precoDeveSerMaior: 'Preço deve ser maior que zero',
    // Renda Fixa / Tesouro Direto
    taxaContratada: 'Taxa Contratada (%)',
    taxaDeveSerMaior: 'Taxa deve ser maior que zero',
    valorInvestido: 'Valor Investido (R$)',
    valorTotalAplicado: 'Valor Total Aplicado',
    taxaObtidaVia: 'Taxa obtida via',
    taxaNaoDisponivel: 'Informe a taxa contratada manualmente.',
    selicReferencia: (taxa: number) => `Referência: Selic/CDI atual ${taxa.toFixed(2)}% a.a. (Brapi)`,
  },

  // ─── Trilhas educacionais ──────────────────────────────────────────────────
  trilhas: {
    pratica: 'prática',
    nivel: 'nível',
    videos: 'Vídeos',
    video: 'vídeo',
  },

  // ─── UI genérico ───────────────────────────────────────────────────────────
  ui: {
    cancelar: 'Cancelar',
    confirmar: 'Confirmar',
    salvar: 'Salvar',
    deletar: 'Deletar',
    limpando: 'Limpando...',
    deletando: 'Deletando...',
    carregando: 'Carregando...',
    voltar: 'Voltar',
    anterior: 'Anterior',
    proximo: 'Próximo',
    verResultado: 'Ver Resultado',
    ok: 'OK',
    sim: 'Sim',
    nao: 'Não',
    periodo: 'Por Período',
    umSoLugar: 'um só lugar',
    naoEditavel: 'Não editável',
    minimo8Caracteres: 'Mínimo 8 caracteres',
    umaLetraMaiuscula: 'Uma letra maiúscula',
    umaLetraMinuscula: 'Uma letra minúscula',
    umNumero: 'Um número',
    botaoSubmit: 'Botão Submit',
    botaoGoogle: 'Botão Google',
    iconeEmail: 'Ícone de email',
    titulo: 'Título',
    instrucoes: 'Instruções',
  },
} as const;

/** Tipo inferido de STRINGS para uso com TypeScript strict */
export type StringsType = typeof STRINGS;
