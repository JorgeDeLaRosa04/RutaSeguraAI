import { ArrowRight, Sparkles } from 'lucide-react';
import { blogPosts } from './blogPosts';
import Link from 'next/link';

export default function BlogPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <p className="text-sm uppercase tracking-[0.26em] text-slate-400">Blog de Seguridad Vial</p>
        <h1 className="text-4xl font-semibold text-white sm:text-5xl">Historias y consejos para tus turnos nocturnos</h1>
        <p className="max-w-3xl text-slate-300">
          Información diseñada para conductores de taxi y delivery que manejan en la noche. Más confianza, menos miedo.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <article key={post.id} className="glass-panel overflow-hidden rounded-3xl">
            <div className="h-48 w-full relative">
              <img src={`/images/blog${post.id}_1.png`} alt="Portada" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-night opacity-60" />
              <div className="p-6 relative z-10 flex items-start">
                <div className="inline-flex items-center gap-3 rounded-3xl bg-slate-950/80 px-4 py-3 text-slate-200">
                  <Sparkles className="h-5 w-5 text-safe" />
                  <span>Seguridad</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-6">
              <h2 className="text-2xl font-semibold text-white">{post.title}</h2>
              <p className="text-slate-300">{post.summary}</p>
              <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-safe transition hover:text-emerald-400">
                Leer más
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
