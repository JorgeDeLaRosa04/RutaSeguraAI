import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { blogPosts } from '../blogPosts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
        <div className="h-64 relative">
          <img src={`/images/blog${post.id}_1.png`} alt="Portada" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-night opacity-60" />
          <div className="p-6 flex items-end relative z-10">
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
            <div className="prose prose-invert max-w-none text-white">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
            </div>

            <div className="mt-8 space-y-6">
              {post.id === '1' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <img src="/images/blog1_2.png" alt="Imagen 1" className="w-full h-56 object-cover rounded-lg" />
                  <img src="/images/blog1_3.png" alt="Imagen 2" className="w-full h-56 object-cover rounded-lg" />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  <img src={`/images/blog${post.id}_2.png`} alt="Imagen adicional" className="w-full h-56 object-cover rounded-lg" />
                </div>
              )}

              <div className="pt-4">
                <Link href="/score" className="inline-flex items-center gap-2 px-6 py-3 bg-safe text-black rounded-lg font-semibold hover:bg-emerald-400">
                  Ir al Score de Seguridad
                </Link>
              </div>
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
