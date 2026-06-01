'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Download,
  HeartPulse,
  Loader2,
  MapPin,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  User
} from 'lucide-react';

const conductorOptions = ['Taxi', 'Mototaxi', 'Auto Particular', 'Delivery'];
const zonas = ['Lima Norte', 'Lima Sur', 'Lima Este', 'Callao', 'Lima Centro'];
const horasOpciones = ['Mañana 6am-12pm', 'Tarde 12pm-6pm', 'Noche 6pm-12am', 'Madrugada 12am-6am'];
const diasOpciones = ['Lunes a Viernes', 'Sábados', 'Domingos', 'Festivos'];
const horasDiariasOpciones = ['4-6 horas', '6-8 horas', '8-10 horas', '10-12 horas', '+12 horas'];
const experienciaOpciones = ['Menos de 1 año', '1-3 años', '3-5 años', '5-10 años', '+10 años'];
const celularVisibleOpciones = ['Siempre', 'A veces', 'Nunca'];
const seguroNocheOpciones = ['Sí', 'No', 'Depende'];
const seguroVehiculoOpciones = ['Sí', 'No'];
const appsSeguridadOpciones = ['Google Maps', 'Waze', 'WhatsApp grupos', 'Ninguna'];
const storageKey = 'rutaSeguraAI-progress';

const initialForm = {
  nombre: '',
  edad: '18',
  telefono: '+51 ',
  email: '',
  tipoVehiculo: 'Taxi',
  anoVehiculo: '2024',
  placa: '',
  tieneGPS: 'No',
  zonasTrabajo: [] as string[],
  horariosFrecuentes: [] as string[],
  diasTrabajo: [] as string[],
  horasDiarias: '4-6 horas',
  experiencia: 'Menos de 1 año',
  haSidoAsaltado: 'No',
  vecesAsaltado: '0',
  appsSeguridad: [] as string[],
  contactosEmergencia: 'No',
  celularVisible: 'Nunca',
  nivelSeguridad: 5,
  zonasEvita: [] as string[],
  seguroNoche: 'No',
  seguroVehiculo: 'No'
};

type FormState = typeof initialForm;

type ResultState = {
  score: number;
  nivel: 'Bajo' | 'Medio' | 'Alto';
  color: string;
  comparativa: number;
  recomendaciones: string[];
};

function calculateScore(values: FormState): ResultState {
  let score = 50;

  const edad = Number(values.edad);
  if (edad <= 25) score -= 3;
  else if (edad <= 40) score += 5;
  else score += 3;

  score += values.tieneGPS === 'Sí' ? 10 : -7;
  score += conductorOptions.indexOf(values.tipoVehiculo) * 2;
  score += values.zonasTrabajo.length * 3;
  score -= values.horariosFrecuentes.includes('Madrugada 12am-6am') ? 10 : 0;
  score -= values.diasTrabajo.includes('Festivos') ? 4 : 0;
  score += values.horasDiarias === '+12 horas' ? -4 : values.horasDiarias === '10-12 horas' ? -2 : 0;

  const experienciaScore = {
    'Menos de 1 año': -6,
    '1-3 años': -2,
    '3-5 años': 3,
    '5-10 años': 8,
    '+10 años': 12
  };
  score += experienciaScore[values.experiencia as keyof typeof experienciaScore];

  if (values.haSidoAsaltado === 'Sí') {
    score -= 10;
    score -= Math.min(Number(values.vecesAsaltado) || 1, 3) * 3;
  }

  const appsCount = values.appsSeguridad.includes('Ninguna') ? 0 : values.appsSeguridad.length;
  score += appsCount * 5;
  score += values.contactosEmergencia === 'Sí' ? 5 : -4;
  score -= values.celularVisible === 'Siempre' ? 6 : values.celularVisible === 'A veces' ? 2 : 0;

  score += values.nivelSeguridad * 2;
  score += values.zonasEvita.length * 2;
  score += values.seguroVehiculo === 'Sí' ? 6 : -3;
  score += values.seguroNoche === 'Sí' ? 6 : values.seguroNoche === 'Depende' ? 1 : -5;

  if (values.placa.trim().length === 0) score -= 3;
  if (!values.email.includes('@')) score -= 4;
  if (!values.telefono.match(/^\+51\s\d{3}\s\d{3}\s\d{3}$/)) score -= 5;

  score = Math.max(0, Math.min(100, Math.round(score)));

  const nivel = score >= 80 ? 'Bajo' : score >= 60 ? 'Medio' : 'Alto';
  const color = score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-500' : 'text-rose-500';
  const comparativa = Math.min(96, Math.max(45, Math.round(45 + score * 0.45)));

  const recomendaciones = [] as string[];
  if (values.tieneGPS === 'No') recomendaciones.push('Instala un GPS para rutas más seguras y seguimiento en tiempo real.');
  if (appsCount === 0) recomendaciones.push('Activa apps de seguridad y grupos de WhatsApp para alertas con otros conductores.');
  if (values.contactosEmergencia === 'No') recomendaciones.push('Guarda contactos de emergencia para cada turno nocturno.');
  if (values.celularVisible !== 'Nunca') recomendaciones.push('Reduce el uso visible del celular mientras conduces para evitar distracciones.');
  if (values.haSidoAsaltado === 'Sí') recomendaciones.push('Comparte tus trayectos con alguien de confianza y evita zonas de alto riesgo.');
  if (recomendaciones.length < 3) recomendaciones.push('Revisa la app antes de cada turno para seleccionar rutas con menor exposición.');

  return { score, nivel, color, comparativa, recomendaciones: recomendaciones.slice(0, 3) };
}

function collectErrorMessage(field: string, message: string) {
  return { [field]: message };
}

export default function ScorePage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResultState | null>(null);
  const [saveMessage, setSaveMessage] = useState('');

  const progress = useMemo(() => step * 20, [step]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      try {
        setForm(JSON.parse(saved));
      } catch {
        // ignore corrupted storage
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(storageKey, JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    if (!saveMessage) return;
    const timeout = window.setTimeout(() => setSaveMessage(''), 2800);
    return () => window.clearTimeout(timeout);
  }, [saveMessage]);

  const handleField = (field: keyof FormState, value: string | number | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: keyof FormState, value: string) => {
    setForm((prev) => {
      const current = Array.isArray(prev[field]) ? [...(prev[field] as string[])] : [];
      const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
      return { ...prev, [field]: next } as FormState;
    });
  };

  const validateStep = (currentStep: number) => {
    const nextErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!form.nombre.trim()) Object.assign(nextErrors, collectErrorMessage('nombre', 'Ingresa tu nombre completo.'));
      const edadValue = Number(form.edad);
      if (!edadValue || edadValue < 18 || edadValue > 70) Object.assign(nextErrors, collectErrorMessage('edad', 'La edad debe estar entre 18 y 70.'));
      if (!form.telefono.trim() || !form.telefono.match(/^\+51\s\d{3}\s\d{3}\s\d{3}$/)) Object.assign(nextErrors, collectErrorMessage('telefono', 'Ingresa un WhatsApp válido: +51 999 999 999.'));
      if (!form.email.trim() || !form.email.includes('@')) Object.assign(nextErrors, collectErrorMessage('email', 'Ingresa un correo válido.'));
    }

    if (currentStep === 2) {
      if (!form.placa.trim()) Object.assign(nextErrors, collectErrorMessage('placa', 'Ingresa la placa del vehículo.'));
    }

    if (currentStep === 3) {
      if (form.zonasTrabajo.length === 0) Object.assign(nextErrors, collectErrorMessage('zonasTrabajo', 'Selecciona al menos una zona principal.'));
      if (form.horariosFrecuentes.length === 0) Object.assign(nextErrors, collectErrorMessage('horariosFrecuentes', 'Selecciona al menos un horario.'));
      if (form.diasTrabajo.length === 0) Object.assign(nextErrors, collectErrorMessage('diasTrabajo', 'Selecciona al menos un día de trabajo.'));
    }

    if (currentStep === 4) {
      if (form.haSidoAsaltado === 'Sí' && Number(form.vecesAsaltado) <= 0) Object.assign(nextErrors, collectErrorMessage('vecesAsaltado', 'Indica cuántas veces has sido asaltado.'));
    }

    if (currentStep === 5) {
      if (form.zonasEvita.length === 0) Object.assign(nextErrors, collectErrorMessage('zonasEvita', 'Selecciona al menos una zona que evitas.'));
    }

    return nextErrors;
  };

  const goNext = () => {
    const nextErrors = validateStep(step);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setStep((current) => Math.min(5, current + 1));
  };

  const goBack = () => {
    setErrors({});
    setStep((current) => Math.max(1, current - 1));
  };

  const saveProgress = () => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(storageKey, JSON.stringify(form));
    setSaveMessage('Progreso guardado correctamente.');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateStep(step);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    if (step < 5) {
      setErrors({});
      setStep(step + 1);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setResult(calculateScore(form));
      setIsLoading(false);
    }, 1200);
  };

  const whatsappText = result
    ? `Mi Score de seguridad es ${result.score}/100 (${result.nivel}). Recomendaciones: ${result.recomendaciones.join(' ')}.`
    : 'Estoy completando el test de seguridad de Ruta Segura AI. Revisa tu nivel de exposición en la noche.';

  return (
    <div className="space-y-10 pb-10">
      <section className="space-y-4 rounded-3xl bg-slate-950/95 border border-slate-800 p-8 shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.26em] text-slate-400">Test de Seguridad</p>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl">Test de Seguridad: ¿Qué tan expuesto estás?</h1>
            <p className="max-w-3xl text-slate-300">
              Una evaluación detallada para conductores nocturnos en Lima. Completa los pasos y recibe recomendaciones personalizadas para tu turno.
            </p>
          </div>
          <div className="rounded-3xl bg-slate-900/90 p-5 text-slate-200 shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Progreso</p>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-200">Paso {step} de 5 ({progress}%)</p>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl bg-slate-950/95 border border-slate-800 p-8 shadow-xl">
          <div className="space-y-6">
            {step === 1 && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm">
                  <div className="mb-6 flex items-center gap-3">
                    <User className="h-6 w-6 text-blue-400" />
                    <h2 className="text-xl font-semibold text-white">Paso 1: Datos del Conductor</h2>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-slate-200">
                      Nombre completo
                      <input
                        value={form.nombre}
                        onChange={(event) => handleField('nombre', event.target.value)}
                        className="w-full rounded-2xl border border-slate-300 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-700"
                        placeholder="Carlos Pérez"
                      />
                      {errors.nombre && <span className="text-sm text-rose-500">{errors.nombre}</span>}
                    </label>

                    <label className="space-y-2 text-sm text-slate-200">
                      Edad
                      <input
                        type="number"
                        min={18}
                        max={70}
                        value={form.edad}
                        onChange={(event) => handleField('edad', event.target.value)}
                        className="w-full rounded-2xl border border-slate-300 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-700"
                      />
                      {errors.edad && <span className="text-sm text-rose-500">{errors.edad}</span>}
                    </label>

                    <label className="space-y-2 text-sm text-slate-200">
                      Teléfono / WhatsApp
                      <input
                        type="tel"
                        value={form.telefono}
                        onChange={(event) => handleField('telefono', event.target.value)}
                        placeholder="+51 999 999 999"
                        className="w-full rounded-2xl border border-slate-300 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-700"
                      />
                      {errors.telefono && <span className="text-sm text-rose-500">{errors.telefono}</span>}
                    </label>

                    <label className="space-y-2 text-sm text-slate-200">
                      Email
                      <input
                        type="email"
                        value={form.email}
                        onChange={(event) => handleField('email', event.target.value)}
                        placeholder="carlos@mail.com"
                        className="w-full rounded-2xl border border-slate-300 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-700"
                      />
                      {errors.email && <span className="text-sm text-rose-500">{errors.email}</span>}
                    </label>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-700 p-6 shadow-sm">
                  <div className="mb-6 flex items-center gap-3">
                    <MapPin className="h-6 w-6 text-blue-900" />
                    <h2 className="text-xl font-semibold text-white">Paso 2: Información del Vehículo</h2>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-slate-200">
                      Tipo de vehículo
                      <select
                        value={form.tipoVehiculo}
                        onChange={(event) => handleField('tipoVehiculo', event.target.value)}
                        className="w-full rounded-2xl border border-slate-300 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-700"
                      >
                        {conductorOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-2 text-sm text-slate-200">
                      Año del vehículo
                      <select
                        value={form.anoVehiculo}
                        onChange={(event) => handleField('anoVehiculo', event.target.value)}
                        className="w-full rounded-2xl border border-slate-300 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-700"
                      >
                        {Array.from({ length: 15 }, (_, index) => `${2024 - index}`).map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-2 text-sm text-slate-200">
                      Placa
                      <input
                        value={form.placa}
                        onChange={(event) => handleField('placa', event.target.value.toUpperCase())}
                        placeholder="ABC-123"
                        className="w-full rounded-2xl border border-slate-300 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-700"
                      />
                      {errors.placa && <span className="text-sm text-rose-500">{errors.placa}</span>}
                    </label>

                    <div className="space-y-2 text-sm text-slate-200">
                      <p>¿Tiene GPS instalado?</p>
                      <div className="flex flex-wrap gap-3">
                        {['Sí', 'No'].map((option) => (
                          <label key={option} className="inline-flex items-center gap-3 rounded-2xl border border-slate-300 bg-slate-950 px-4 py-3 text-white hover:border-blue-700">
                            <input
                              type="radio"
                              name="tieneGPS"
                              value={option}
                              checked={form.tieneGPS === option}
                              onChange={(event) => handleField('tieneGPS', event.target.value)}
                              className="h-4 w-4 accent-blue-900"
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-700 p-6 shadow-sm">
                  <div className="mb-6 flex items-center gap-3">
                    <ShieldAlert className="h-6 w-6 text-blue-900" />
                    <h2 className="text-xl font-semibold text-white">Paso 3: Hábitos de Conducción</h2>
                  </div>
                  <div className="grid gap-5">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="space-y-2 text-sm text-slate-200">
                        Zona principal de trabajo
                        <div className="grid gap-3 rounded-3xl border border-slate-700 bg-slate-950 p-4">
                          {zonas.map((zone) => (
                            <label key={zone} className="inline-flex items-center gap-3 text-white">
                              <input
                                type="checkbox"
                                checked={form.zonasTrabajo.includes(zone)}
                                onChange={() => toggleArrayField('zonasTrabajo', zone)}
                                className="h-4 w-4 accent-blue-900"
                              />
                              {zone}
                            </label>
                          ))}
                        </div>
                        {errors.zonasTrabajo && <span className="text-sm text-rose-500">{errors.zonasTrabajo}</span>}
                      </label>

                      <label className="space-y-2 text-sm text-slate-200">
                        Horario más frecuente
                        <div className="grid gap-3 rounded-3xl border border-slate-700 bg-slate-950 p-4">
                          {horasOpciones.map((option) => (
                            <label key={option} className="inline-flex items-center gap-3 text-white">
                              <input
                                type="checkbox"
                                checked={form.horariosFrecuentes.includes(option)}
                                onChange={() => toggleArrayField('horariosFrecuentes', option)}
                                className="h-4 w-4 accent-blue-900"
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                        {errors.horariosFrecuentes && <span className="text-sm text-rose-500">{errors.horariosFrecuentes}</span>}
                      </label>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="space-y-2 text-sm text-slate-200">
                        Días que trabajas
                        <div className="grid gap-3 rounded-3xl border border-slate-700 bg-slate-950 p-4">
                          {diasOpciones.map((option) => (
                            <label key={option} className="inline-flex items-center gap-3 text-white">
                              <input
                                type="checkbox"
                                checked={form.diasTrabajo.includes(option)}
                                onChange={() => toggleArrayField('diasTrabajo', option)}
                                className="h-4 w-4 accent-blue-900"
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                        {errors.diasTrabajo && <span className="text-sm text-rose-500">{errors.diasTrabajo}</span>}
                      </label>

                      <label className="space-y-2 text-sm text-slate-200">
                        Promedio de horas diarias
                        <select
                          value={form.horasDiarias}
                          onChange={(event) => handleField('horasDiarias', event.target.value)}
                          className="w-full rounded-2xl border border-slate-300 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-700"
                        >
                          {horasDiariasOpciones.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-700 p-6 shadow-sm">
                  <div className="mb-6 flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6 text-blue-900" />
                    <h2 className="text-xl font-semibold text-white">Paso 4: Experiencia y Seguridad</h2>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-slate-200">
                      ¿Cuántos años de experiencia tienes?
                      <select
                        value={form.experiencia}
                        onChange={(event) => handleField('experiencia', event.target.value)}
                        className="w-full rounded-2xl border border-slate-300 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-700"
                      >
                        {experienciaOpciones.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </label>

                    <div className="space-y-2 text-sm text-slate-200">
                      <p>¿Has sido asaltado trabajando?</p>
                      <div className="flex flex-wrap gap-3">
                        {['Sí', 'No'].map((option) => (
                          <label key={option} className="inline-flex items-center gap-3 rounded-2xl border border-slate-300 bg-slate-950 px-4 py-3 text-white hover:border-blue-700">
                            <input
                              type="radio"
                              name="haSidoAsaltado"
                              value={option}
                              checked={form.haSidoAsaltado === option}
                              onChange={(event) => handleField('haSidoAsaltado', event.target.value)}
                              className="h-4 w-4 accent-blue-900"
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    </div>

                    {form.haSidoAsaltado === 'Sí' && (
                      <label className="space-y-2 text-sm text-slate-200">
                        ¿Cuántas veces?
                        <input
                          type="number"
                          min={1}
                          value={form.vecesAsaltado}
                          onChange={(event) => handleField('vecesAsaltado', event.target.value)}
                          className="w-full rounded-2xl border border-slate-300 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-700"
                        />
                        {errors.vecesAsaltado && <span className="text-sm text-rose-500">{errors.vecesAsaltado}</span>}
                      </label>
                    )}

                    <label className="space-y-2 text-sm text-slate-200 sm:col-span-2">
                      ¿Usas actualmente apps de seguridad?
                      <div className="grid gap-3 rounded-3xl border border-slate-700 bg-slate-950 p-4 sm:grid-cols-2">
                        {appsSeguridadOpciones.map((option) => (
                          <label key={option} className="inline-flex items-center gap-3 text-white">
                            <input
                              type="checkbox"
                              checked={form.appsSeguridad.includes(option)}
                              onChange={() => {
                                if (option === 'Ninguna') {
                                  setForm((prev) => ({ ...prev, appsSeguridad: prev.appsSeguridad.includes('Ninguna') ? [] : ['Ninguna'] }));
                                } else {
                                  setForm((prev) => {
                                    const hasNone = prev.appsSeguridad.includes('Ninguna');
                                    const current = prev.appsSeguridad.filter((app) => app !== 'Ninguna');
                                    const next = current.includes(option) ? current.filter((app) => app !== option) : [...current, option];
                                    return { ...prev, appsSeguridad: next };
                                  });
                                }
                              }}
                              className="h-4 w-4 accent-blue-900"
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    </label>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2 text-sm text-slate-200">
                        <p>¿Tienes contactos de emergencia?</p>
                        <div className="flex flex-wrap gap-3">
                          {['Sí', 'No'].map((option) => (
                            <label key={option} className="inline-flex items-center gap-3 rounded-2xl border border-slate-300 bg-slate-950 px-4 py-3 text-white hover:border-blue-700">
                              <input
                                type="radio"
                                name="contactosEmergencia"
                                value={option}
                                checked={form.contactosEmergencia === option}
                                onChange={(event) => handleField('contactosEmergencia', event.target.value)}
                                className="h-4 w-4 accent-blue-900"
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-slate-200">
                        <p>¿Conduces con el celular visible?</p>
                        <div className="flex flex-wrap gap-3">
                          {celularVisibleOpciones.map((option) => (
                            <label key={option} className="inline-flex items-center gap-3 rounded-2xl border border-slate-300 bg-slate-950 px-4 py-3 text-white hover:border-blue-700">
                              <input
                                type="radio"
                                name="celularVisible"
                                value={option}
                                checked={form.celularVisible === option}
                                onChange={(event) => handleField('celularVisible', event.target.value)}
                                className="h-4 w-4 accent-blue-900"
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-700 p-6 shadow-sm">
                  <div className="mb-6 flex items-center gap-3">
                    <HeartPulse className="h-6 w-6 text-blue-900" />
                    <h2 className="text-xl font-semibold text-white">Paso 5: Percepción de Riesgo</h2>
                  </div>
                  <div className="grid gap-5">
                    <label className="space-y-2 text-sm text-slate-200">
                      ¿Cómo calificas tu nivel de seguridad actual?
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min={1}
                          max={10}
                          value={form.nivelSeguridad}
                          onChange={(event) => handleField('nivelSeguridad', Number(event.target.value))}
                          className="w-full accent-blue-900"
                        />
                        <span className="min-w-[2rem] text-white">{form.nivelSeguridad}</span>
                      </div>
                    </label>

                    <label className="space-y-2 text-sm text-slate-200">
                      ¿Qué zonas evitas?
                      <div className="grid gap-3 rounded-3xl border border-slate-700 bg-slate-950 p-4">
                        {zonas.map((zone) => (
                          <label key={zone} className="inline-flex items-center gap-3 text-white">
                            <input
                              type="checkbox"
                              checked={form.zonasEvita.includes(zone)}
                              onChange={() => toggleArrayField('zonasEvita', zone)}
                              className="h-4 w-4 accent-blue-900"
                            />
                            {zone}
                          </label>
                        ))}
                      </div>
                      {errors.zonasEvita && <span className="text-sm text-rose-500">{errors.zonasEvita}</span>}
                    </label>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="space-y-2 text-sm text-slate-200">
                        ¿Te sientes seguro trabajando de noche?
                        <select
                          value={form.seguroNoche}
                          onChange={(event) => handleField('seguroNoche', event.target.value)}
                          className="w-full rounded-2xl border border-slate-300 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-700"
                        >
                          {seguroNocheOpciones.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </label>

                      <label className="space-y-2 text-sm text-slate-200">
                        ¿Tienes seguro del vehículo?
                        <div className="flex flex-wrap gap-3">
                          {seguroVehiculoOpciones.map((option) => (
                            <label key={option} className="inline-flex items-center gap-3 rounded-2xl border border-slate-300 bg-slate-950 px-4 py-3 text-white hover:border-blue-700">
                              <input
                                type="radio"
                                name="seguroVehiculo"
                                value={option}
                                checked={form.seguroVehiculo === option}
                                onChange={(event) => handleField('seguroVehiculo', event.target.value)}
                                className="h-4 w-4 accent-blue-900"
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-700 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={saveProgress}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:border-blue-700"
            >
              Guardar progreso
            </button>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {step > 1 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:border-blue-700"
                >
                  Atrás
                </button>
              )}
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                {step < 5 ? 'Siguiente paso' : 'Calcular score'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {saveMessage && <p className="text-sm text-emerald-600">{saveMessage}</p>}
        </form>

        <aside className="space-y-6 rounded-3xl bg-slate-950 p-8 shadow-lg text-slate-200">
          <div className="space-y-4 rounded-3xl bg-slate-900/75 p-6">
            <div className="flex items-center gap-3 text-blue-100">
              <Clock3 className="h-5 w-5" />
              <h2 className="text-lg font-semibold text-white">Guarda y continúa</h2>
            </div>
            <p className="text-sm leading-6 text-slate-300">
              Puedes guardar tu progreso y retomar el test cuando quieras. La información se almacena de forma local en tu teléfono.
            </p>
          </div>

          <div className="space-y-4 rounded-3xl bg-slate-900/75 p-6">
            <div className="flex items-center gap-3 text-blue-100">
              <ShieldOff className="h-5 w-5" />
              <h2 className="text-lg font-semibold text-white">Protección nocturna</h2>
            </div>
            <p className="text-sm leading-6 text-slate-300">
              Responder con detalles reales te da un resultado más útil. Elige las opciones con honestidad para recibir mejores recomendaciones.

            </p>
          </div>

          <div className="space-y-4 rounded-3xl bg-slate-900/75 p-6">
            <div className="flex items-center gap-3 text-blue-100">
              <MapPin className="h-5 w-5" />
              <h2 className="text-lg font-semibold text-white">Conduce con datos</h2>
            </div>
            <p className="text-sm leading-6 text-slate-300">
              Tu score se ajusta según tus zonas, horarios y el uso de aplicaciones. Cada respuesta mejora tu perfil de seguridad nocturna.
            </p>
          </div>
        </aside>
      </div>

      {isLoading && (
        <div className="rounded-3xl bg-slate-950/95 p-8 text-center shadow-xl">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
            <p className="text-lg font-semibold text-white">Calculando tu Score...</p>
            <p className="max-w-2xl text-slate-400">Un momento mientras analizamos tus respuestas y generamos recomendaciones personalizadas.</p>
          </div>
        </div>
      )}

      {result && !isLoading && (
        <section className="rounded-3xl bg-slate-950/95 border border-slate-800 p-8 shadow-xl">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_0.9fr]">
            <div className="rounded-3xl border border-slate-700 bg-slate-900/90 p-8">
              <div className="flex items-center gap-3 text-slate-200">
                <CheckCircle2 className="h-6 w-6 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">Resultado</h2>
              </div>
              <div className="mt-6 space-y-4">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Score de Seguridad</p>
                <div className="flex items-end gap-3">
                  <p className={`text-6xl font-bold ${result.color}`}>{result.score}</p>
                  <span className="text-sm uppercase tracking-[0.3em] text-slate-500">/100</span>
                </div>
                <p className="text-lg font-semibold text-slate-800">Nivel de riesgo: <span className={`font-semibold ${result.color}`}>{result.nivel}</span></p>
                <p className="text-slate-600">
                  Estás más seguro que el <span className="font-semibold text-white">{result.comparativa}%</span> de los conductores según tu perfil actual.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-700 p-8">
              <div className="mb-6 flex items-center gap-3 text-blue-900">
                <ShieldCheck className="h-6 w-6" />
                <h2 className="text-xl font-semibold text-white">Recomendaciones</h2>
              </div>
              <div className="space-y-4">
                {result.recomendaciones.map((item, index) => (
                  <div key={index} className="rounded-3xl bg-slate-950 p-4 text-slate-200 shadow-sm">
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-700 bg-slate-950 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Comparativa</p>
              <p className="mt-3 text-xl font-semibold text-white">Tu perfil es más seguro que {result.comparativa}% de los conductores de la ciudad.</p>
            </div>

            <div className="rounded-3xl border border-slate-700 bg-slate-950 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Protección en tiempo real</p>
              <p className="mt-3 text-slate-600">Descarga nuestra app para recibir alertas, rutas alternativas y soporte cuando más lo necesites.</p>
              <button className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
                <Download className="h-4 w-4" />
                Descarga la App
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-600">Comparte tu resultado con un colega o grupo de WhatsApp.</p>
            </div>
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              Compartir en WhatsApp
            </a>
          </div>
        </section>
      )}
    </div>
  );
}
