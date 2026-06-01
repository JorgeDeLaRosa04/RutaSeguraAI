import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { blogPosts } from '../blogPosts';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  return {
    title: post?.title || 'Blog Post',
    description: post?.summary || '',
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="space-y-8">
        <Link href="/blog" className="inline-flex items-center gap-2 text-safe transition hover:text-emerald-400">
          <ArrowLeft className="h-4 w-4" />
          Volver al blog
        </Link>
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-white">Artículo no encontrado</h1>
          <p className="mt-4 text-slate-300">Lo sentimos, no pudimos encontrar el artículo que buscabas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Link href="/blog" className="inline-flex items-center gap-2 text-safe transition hover:text-emerald-400">
        <ArrowLeft className="h-4 w-4" />
        Volver al blog
      </Link>

      <article className="glass-panel rounded-3xl overflow-hidden">
        <div className="h-64 bg-gradient-to-br from-slate-900 via-slate-800 to-night p-6 flex items-end">
          <div>
            <div className="inline-flex items-center gap-3 rounded-3xl bg-slate-950/80 px-4 py-3 text-slate-200 mb-4">
              <span className="text-safe">🔒</span>
              <span>Seguridad</span>
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-12 space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold text-white sm:text-5xl">{post.title}</h1>
            <p className="text-lg text-slate-300">{post.summary}</p>
          </div>

          <div className="border-t border-slate-700 pt-8">
            <div className="prose prose-invert max-w-none">
              {post.content.split('\n\n').map((paragraph, index) => {
                if (paragraph.startsWith('**') && paragraph.endsWith(':**')) {
                  return (
                    <h2 key={index} className="text-2xl font-semibold text-white mt-6 mb-4">
                      {paragraph.replace(/\*\*/g, '')}
                    </h2>
                  );
                }
                if (paragraph.startsWith('-')) {
                  return (
                    <ul key={index} className="list-disc list-inside space-y-2 text-slate-300 mb-4">
                      {paragraph.split('\n').map((item, i) => (
                        <li key={i} className="ml-2">{item.replace('- ', '')}</li>
                      ))}
                    </ul>
                  );
                }
                if (paragraph.match(/^\d+\./)) {
                  return (
                    <ol key={index} className="list-decimal list-inside space-y-2 text-slate-300 mb-4">
                      {paragraph.split('\n').map((item, i) => (
                        <li key={i} className="ml-2">{item.replace(/^\d+\.\s?/, '')}</li>
                      ))}
                    </ol>
                  );
                }
                return (
                  <p key={index} className="text-slate-300 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8">
            <Link href="/blog" className="inline-flex items-center gap-2 px-6 py-3 bg-safe/20 text-safe rounded-lg transition hover:bg-safe/30">
              <ArrowLeft className="h-4 w-4" />
              Volver a todos los artículos
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
