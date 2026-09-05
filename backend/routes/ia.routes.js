const { Router } = require('express');

const router = Router();
const MAX_MESSAGE_LENGTH = 1200;

function buildPrompt({ mensaje, historial }) {
  const contexto = Array.isArray(historial)
    ? historial
      .filter((item) => item && typeof item.texto === 'string')
      .slice(-8)
      .map((item) => `${item.rol === 'usuario' ? 'Usuario' : 'Asistente'}: ${item.texto.slice(0, 1200)}`)
      .join('\n')
    : '';

  return `Eres un asistente de entrenamiento para una aplicación deportiva. Responde en español con un tono humano, cercano y directo. Sé útil sin extenderte de más.

El usuario pide: ${mensaje}
${contexto ? `Conversación previa:\n${contexto}` : 'No hay conversación previa.'}

Indica una recomendación segura y realista. Responde normalmente en 3 a 6 párrafos breves o una lista corta. No uses emojis, hashtags, títulos con #, separadores, introducciones largas ni frases de relleno. Si pide comida post entrenamiento, ofrece 2 o 3 opciones generales y una explicación breve, sin presentarlas como prescripción médica. Si pide entrenamiento, incluye solo lo necesario: calentamiento, ejercicios principales con series y repeticiones o tiempo, descansos y una vuelta a la calma. Adapta la propuesta al tiempo y objetivo mencionados en la conversación. No diagnostiques lesiones ni reemplaces a un profesional. Si falta información importante, haz una sola pregunta breve, pero ofrece igualmente una propuesta inicial útil. Continúa la conversación teniendo en cuenta lo que ya se habló.`;
}

router.post('/chat', async (req, res) => {
  const { mensaje, historial } = req.body || {};

  if (typeof mensaje !== 'string' || !mensaje.trim()) {
    return res.status(400).json({ ok: false, mensaje: 'Escribí una consulta.' });
  }

  if (mensaje.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ ok: false, mensaje: 'La consulta es demasiado larga.' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ ok: false, mensaje: 'El asistente no está configurado en el servidor.' });
  }

  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt({ mensaje: mensaje.trim(), historial }) }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1200 },
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini error:', response.status, data?.error?.message || 'unknown error');
      return res.status(502).json({ ok: false, mensaje: 'No se pudo obtener una respuesta del asistente.' });
    }

    const respuesta = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join('\n')
      .trim();

    if (!respuesta) {
      return res.status(502).json({ ok: false, mensaje: 'El asistente no devolvió una respuesta.' });
    }

    return res.json({ ok: true, respuesta });
  } catch (error) {
    console.error('IA error:', error);
    return res.status(502).json({ ok: false, mensaje: 'No se pudo conectar con el asistente.' });
  }
});

module.exports = router;