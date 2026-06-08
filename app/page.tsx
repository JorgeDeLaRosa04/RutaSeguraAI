import { ArrowRight, ShieldAlert, ShieldCheck, Sparkles } from 'lucide-react';
import { Chatbot } from './components/Chatbot';

export default function HomePage() {
  return (
    <div id="inicio" className="space-y-16">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-800/80 px-4 py-2 text-sm text-slate-300">
            <Sparkles className="h-4 w-4 text-safe" />
            Seguridad predictiva para conductores nocturnos
          </span>
          <div className="space-y-4">
            <h2 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Viaja inteligente, llega seguro
            </h2>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              El primer ecosistema predictivo que protege a conductores nocturnos usando IA.
              Anticipamos riesgos y recomendamos rutas más seguras para tu turno en Lima.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <a
              href="/score"
              className="inline-flex items-center justify-center rounded-full bg-safe px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-500"
            >
              Calcula tu Score de Seguridad Gratis
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
            <p className="text-sm text-slate-400">
              Sin compromiso. Rápido, claro y pensado para conductores como Carlos.
            </p>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-8 shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-3xl bg-slate-950/80 px-5 py-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Seguridad</p>
                <p className="mt-2 text-3xl font-semibold text-white">+85%</p>
              </div>
              <div className="rounded-2xl bg-safe/10 p-3 text-safe">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </div>
            <p className="text-slate-300">
              Ruta Segura AI te da un panorama nocturno claro: riesgos, alertas y recomendaciones para minimizar el peligro.
            </p>
            <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-950/70 p-4">
                <p className="text-slate-400">Métricas guardadas</p>
                <p className="mt-2 text-xl font-semibold text-white">Estado real</p>
              </div>
              <div className="rounded-3xl bg-slate-950/70 p-4">
                <p className="text-slate-400">Alertas predictivas</p>
                <p className="mt-2 text-xl font-semibold text-white">Notificaciones nocturnas</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.28em] text-slate-400">El problema real</p>
          <h3 className="text-3xl font-semibold text-white sm:text-4xl">Conducir de noche en Lima no debería ser una apuesta.</h3>
          <p className="max-w-3xl text-slate-300">
            Carlos necesita resultados rápidos y confianza. Aquí mostramos los riesgos más comunes y cómo apoyamos cada turno con información clara.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: 'Miedo al asalto',
              description: 'La incertidumbre aumenta en cada viaje cuando no se sabe qué calles evitar.',
              icon: ShieldAlert
            },
            {
              title: 'Pérdida de ingresos',
              description: 'Un incidente puede representar varias horas sin poder trabajar y menos dinero en el bolsillo.',
              icon: ArrowRight
            },
            {
              title: 'Falta de respaldo',
              description: 'Necesitas un aliado digital que te avise antes de que el peligro aparezca.',
              icon: Sparkles
            }
          ].map((item) => (
            <article key={item.title} className="glass-panel rounded-3xl p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-safe">
                <item.icon className="h-6 w-6" />
              </div>
              <h4 className="mt-5 text-xl font-semibold text-white">{item.title}</h4>
              <p className="mt-3 text-slate-300">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-700/70 bg-slate-950/70 p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Prueba social</p>
            <h3 className="mt-3 text-3xl font-semibold text-white">+70% de conductores perciben riesgo en sus turnos nocturnos</h3>
          </div>
          <div className="rounded-3xl bg-night p-5 text-center">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Confiabilidad</p>
            <p className="mt-2 text-3xl font-semibold text-safe">96%</p>
          </div>
        </div>
        <p className="mt-6 max-w-3xl text-slate-300">
          La mayoría de los conductores desean una solución práctica y accesible, no solo una promesa. Ruta Segura AI habla el mismo idioma de tus riesgos y tus rutas.
        </p>
      </section>
      <Chatbot />
    </div>
  );
}
