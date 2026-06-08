import { NextResponse } from 'next/server';
import { chatbotKnowledge } from '../../chatbotKnowledge';

function fallbackAnswer(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes('score') || normalized.includes('puntaje') || normalized.includes('seguridad')) {
    return 'Ruta Segura AI ofrece un Score de Seguridad gratuito para conductores nocturnos. Puedes calcular tu score en la página /score y obtener recomendaciones personalizadas para tus rutas de trabajo.';
  }

  if (normalized.includes('blog') || normalized.includes('artículo') || normalized.includes('consejos')) {
    return 'Nuestro blog cubre temas clave como zonas peligrosas, prevención nocturna, tecnología de seguridad, mantenimiento del vehículo, comunicación familiar y redes de apoyo entre conductores. Pregunta cualquier tema y te responderé con base en nuestro contenido.';
  }

  if (normalized.includes('ruta') || normalized.includes('ruta segura') || normalized.includes('ruta más segura')) {
    return 'Impulsamos recomendaciones de rutas más seguras para conductores nocturnos en Lima, priorizando avenidas principales, zonas iluminadas y áreas con presencia policial o mayor tránsito. Consulta tu Score para obtener sugerencias más personalizadas.';
  }

  if (normalized.includes('zona') || normalized.includes('peligro') || normalized.includes('asalto')) {
    return 'Ruta Segura AI identifica zonas de mayor riesgo en la noche para conductores de taxi y delivery. Trabajamos con datos que permiten evitar paraderos oscuros, calles poco iluminadas y áreas con reportes frecuentes de incidentes.';
  }

  return 'Ruta Segura AI es un asistente para conductores nocturnos en Lima. Pregunta sobre el Score de Seguridad, rutas seguras, prevención nocturna o cómo funciona la plataforma, y te responderé con información relevante.';
}

function findRelevantFromKnowledge(message: string): string | null {
  // Simple keyword matching over paragraphs in `chatbotKnowledge`.
    const query = message.toLowerCase().replace(/[^\n\w\s]/g, '');

  const tokens = query.split(/\s+/).filter(Boolean);

  if (tokens.length === 0) return null;

  const paragraphs = chatbotKnowledge.split('\n\n').map((p) => p.trim()).filter(Boolean);

  let bestScore = 0;
  let bestPara: string | null = null;

  for (const para of paragraphs) {
    const paraLower = para.toLowerCase();
    let score = 0;
    for (const t of tokens) {
      if (t.length < 3) continue; // skip short tokens
      if (paraLower.includes(t)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestPara = para;
    }
  }

  // require at least one match
  if (bestScore > 0 && bestPara) return bestPara;
  return null;
}

function sanitizeAnswer(text: string): string {
  if (!text) return '';
  // remove markdown symbols like **, ##, `, >
  let cleaned = text.replace(/\*\*|__|`|#+|>+/g, '');
  // Replace multiple spaces and line breaks with single space
  cleaned = cleaned.replace(/\s+$/gm, '');
  cleaned = cleaned.replace(/\r?\n+/g, ' ');
  // Remove common Q/A prefixes like 'P:' or 'Q:' and 'R:' or 'A:' from start
  cleaned = cleaned.replace(/(^|\b)(p|q)\s*[:\-]\s*/ig, '');
  // If there's an explicit answer marker like 'R:' keep only after it
  const match = cleaned.match(/\bR\s*[:\-]\s*(.+)/i);
  if (match && match[1]) cleaned = match[1];
  // remove emoji and symbol characters (basic ranges)
  cleaned = cleaned.replace(/[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
  // Trim and normalize spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = String(body.message || '').trim();

    if (!message) {
      return NextResponse.json({ error: 'Mensaje vacío' }, { status: 400 });
    }

    // Try to find a relevant paragraph in the local knowledge base.
    const relevant = findRelevantFromKnowledge(message);
    if (relevant) {
      const answer = sanitizeAnswer(relevant);
      return NextResponse.json({ answer });
    }

    // Otherwise use the simple fallback answers.
    const answer = fallbackAnswer(message);
    return NextResponse.json({ answer });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || 'Error del servidor' }, { status: 500 });
  }
}
