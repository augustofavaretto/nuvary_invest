export const errorHandler = (err, req, res, next) => {
  console.error('Erro:', err.message);

  if (err.response?.status === 429) {
    return res.status(429).json({
      error: 'Limite de requisições da API excedido',
      message: 'Tente novamente em alguns minutos',
    });
  }

  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      error: 'Serviço indisponível',
      message: 'Não foi possível conectar à API Alpha Vantage',
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
