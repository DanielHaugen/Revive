import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { FaChevronLeft } from 'react-icons/fa6';

type Props = {
  params: { slug: string[] };
};

export default function DocPage({ params }: Props) {
  const filePath =
    path.join(process.cwd(), 'docs', ...params.slug) + '.md';

  if (!existsSync(filePath)) {
    notFound();
  }

  const content = readFileSync(filePath, 'utf-8');

  return (
    <div className="max-w-4xl">
      {/* Back link */}
      <Link
        href="/docs"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition mb-6"
      >
        <FaChevronLeft className="text-xs" />
        Knowledge Base
      </Link>

      {/* Rendered markdown */}
      <article className="
        prose prose-invert max-w-none
        prose-headings:text-white
        prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-4
        prose-h2:text-lg prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-3
        prose-h3:text-base prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-2
        prose-p:text-gray-300 prose-p:leading-relaxed
        prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
        prose-strong:text-white
        prose-code:text-blue-300 prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
        prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700 prose-pre:rounded-lg prose-pre:text-sm
        prose-table:text-sm
        prose-thead:border-gray-700
        prose-th:text-gray-300 prose-th:font-semibold prose-th:py-2 prose-th:px-4
        prose-td:text-gray-300 prose-td:py-2 prose-td:px-4 prose-td:border-gray-800
        prose-tr:border-gray-800
        prose-blockquote:border-l-blue-500 prose-blockquote:text-gray-400 prose-blockquote:bg-blue-950/30 prose-blockquote:rounded-r
        prose-li:text-gray-300
        prose-hr:border-gray-800
      ">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {content}
        </ReactMarkdown>
      </article>
    </div>
  );
}
