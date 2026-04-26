import Link from 'next/link';
import { FaCloud, FaDatabase, FaBookOpen, FaChevronRight } from 'react-icons/fa6';
import { IconType } from 'react-icons';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

type DocEntry = {
  slug: string;
  title: string;
  description: string;
  category: string;
  icon: IconType;
  iconColor: string;
};

const DOCS: DocEntry[] = [
  {
    slug: 'aws/AWS_Configuration',
    title: 'AWS Configuration for Restoration',
    description:
      'Required IAM permissions, minimal IAM policy document, snapshot requirements, and volume device name guidance.',
    category: 'AWS',
    icon: FaCloud,
    iconColor: 'text-orange-400',
  },
  {
    slug: 'developer/Prisma',
    title: 'PostgreSQL & Prisma',
    description:
      'Connecting to the PostgreSQL database, configuring Prisma ORM, and accessing the database inside Docker.',
    category: 'Developer',
    icon: FaDatabase,
    iconColor: 'text-blue-400',
  },
];

/** Group doc entries by category for section rendering. */
function groupByCategory(docs: DocEntry[]): Record<string, DocEntry[]> {
  return docs.reduce<Record<string, DocEntry[]>>((acc, doc) => {
    (acc[doc.category] ??= []).push(doc);
    return acc;
  }, {});
}

/** Count words in a markdown file to show approximate read time. */
function readTimeMinutes(slug: string): number {
  const filePath = path.join(process.cwd(), 'docs', ...slug.split('/')) + '.md';
  if (!existsSync(filePath)) return 0;
  const words = readFileSync(filePath, 'utf-8').split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export default function KnowledgeBasePage() {
  const grouped = groupByCategory(DOCS);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <FaBookOpen className="text-blue-400 text-2xl" />
          <h1 className="text-3xl font-bold text-white">Knowledge Base</h1>
        </div>
        <p className="text-gray-400 text-sm">
          Reference documentation for configuring and operating Revive.
        </p>
      </div>

      {/* Sections */}
      {Object.entries(grouped).map(([category, docs]) => (
        <section key={category}>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
            {category}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {docs.map((doc) => {
              const readTime = readTimeMinutes(doc.slug);
              const Icon = doc.icon;
              return (
                <Link
                  key={doc.slug}
                  href={`/docs/${doc.slug}`}
                  className="group flex items-start gap-4 bg-gray-900 border border-gray-800 rounded-lg p-5 hover:border-gray-600 hover:bg-gray-800/50 transition"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-800 group-hover:bg-blue-600/20 transition flex-shrink-0">
                    <Icon className={`${doc.iconColor} group-hover:text-blue-400 transition`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-white font-semibold text-sm leading-snug">{doc.title}</h3>
                      <FaChevronRight className="text-gray-600 group-hover:text-gray-400 flex-shrink-0 transition" />
                    </div>
                    <p className="text-gray-400 text-sm mt-1 leading-relaxed">{doc.description}</p>
                    {readTime > 0 && (
                      <span className="text-xs text-gray-600 mt-2 block">{readTime} min read</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
