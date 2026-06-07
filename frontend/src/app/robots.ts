import type { MetadataRoute } from 'next';

// Projeto acadêmico/demo: bloqueia indexação por buscadores.
// O app continua acessível normalmente por link direto — só não aparece
// em resultados de busca (Google, Bing, etc.), reduzindo a exposição.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  };
}
