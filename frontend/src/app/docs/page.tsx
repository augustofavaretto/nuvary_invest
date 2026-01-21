import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function DocsPage() {
  // Lê o arquivo markdown
  const filePath = path.join(process.cwd(), '..', 'docs', 'supabase-integracao.md');
  let content = '';

  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch {
    content = '# Documentacao nao encontrada\n\nO arquivo de documentacao nao foi encontrado.';
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-[#6B7280] hover:text-[#0066CC] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao App</span>
          </Link>
          <h1 className="text-lg font-semibold text-[#0B1F33]">Documentacao</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <article className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-8">
          <div className="prose prose-slate max-w-none
            prose-headings:text-[#0B1F33]
            prose-h1:text-3xl prose-h1:font-bold prose-h1:border-b prose-h1:border-[#E5E7EB] prose-h1:pb-4
            prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-8 prose-h2:border-b prose-h2:border-[#E5E7EB] prose-h2:pb-2
            prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-6
            prose-p:text-[#6B7280] prose-p:leading-relaxed
            prose-a:text-[#0066CC] prose-a:no-underline hover:prose-a:underline
            prose-code:bg-[#F3F4F6] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:text-[#0B1F33]
            prose-pre:bg-[#1E3A5F] prose-pre:text-white prose-pre:rounded-lg prose-pre:overflow-x-auto
            prose-table:border-collapse prose-table:w-full
            prose-th:bg-[#F3F4F6] prose-th:border prose-th:border-[#E5E7EB] prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:text-[#0B1F33]
            prose-td:border prose-td:border-[#E5E7EB] prose-td:px-4 prose-td:py-2 prose-td:text-[#6B7280]
            prose-ul:text-[#6B7280]
            prose-ol:text-[#6B7280]
            prose-li:marker:text-[#0066CC]
            prose-strong:text-[#0B1F33]
            prose-hr:border-[#E5E7EB]
          ">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] bg-white mt-8">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-[#6B7280]">
          Nuvary Invest - Documentacao Tecnica
        </div>
      </footer>
    </div>
  );
}
