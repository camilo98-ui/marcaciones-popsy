/* =========================================================================
   popsy-voice-backend — proxy seguro hacia OpenAI Text-to-Speech
   =========================================================================
   Este es el ÚNICO lugar del sistema que conoce OPENAI_API_KEY. El frontend
   (marcaciones-popsy.html / VoiceService) nunca llama a OpenAI directamente:
   le pide audio a este servidor, y este servidor es quien llama a OpenAI.

     FRONTEND → VoiceService → este backend (/api/voice) → OpenAI TTS → audio

   Cómo correrlo:
     1) npm install
     2) copia .env.example a .env y pega tu clave real de OpenAI ahí
     3) npm start
   El backend queda escuchando en http://localhost:8787 (configurable con PORT).
   ========================================================================= */

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// En producción, restringe esto al origin real donde sirvas el HTML (por defecto
// permite cualquier origin, lo cual es razonable para uso local/LAN de esta app).
app.use(cors());
app.use(express.json({ limit: "10kb" }));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const PORT = process.env.PORT || 8787;

// Los avisos de voz deben ser cortos y naturales (5–15s de audio) — no una lectura larga.
const MAX_TEXT_LENGTH = 600;

// Únicamente las voces reales que la app expone en su selector — nunca se inventa una voz
// que el cliente no ofreció, evita pasar valores arbitrarios directo a OpenAI.
const VALID_VOICES = new Set(["marin", "cedar"]);

/* Chequeo de salud: el frontend lo usa para mostrar "conectado / no disponible" en
   Configuración sin gastar una llamada real (pagada) a OpenAI. Nunca revela la clave,
   solo si está configurada o no. */
app.get("/api/voice/health", (req, res) => {
  res.json({ ok: true, configured: Boolean(OPENAI_API_KEY) });
});

app.post("/api/voice", async (req, res) => {
  try {
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: "El backend de voz no tiene configurada OPENAI_API_KEY. Revisa el archivo .env." });
    }

    const { text, voice, speed, instructions } = req.body || {};

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Falta el texto a convertir en voz." });
    }
    if (text.length > MAX_TEXT_LENGTH) {
      return res.status(400).json({ error: `El mensaje es demasiado largo (máximo ${MAX_TEXT_LENGTH} caracteres).` });
    }

    const finalVoice = VALID_VOICES.has(voice) ? voice : "marin";
    const finalSpeed = Math.min(1.3, Math.max(0.7, Number(speed) || 0.95));
    const finalInstructions = typeof instructions === "string" ? instructions.slice(0, 2000) : undefined;

    const upstream = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice: finalVoice,
        input: text.trim(),
        instructions: finalInstructions,
        speed: finalSpeed,
        response_format: "mp3",
      }),
    });

    if (!upstream.ok) {
      // El detalle del error de OpenAI se registra solo en el log del servidor — nunca se
      // reenvía tal cual al navegador (evita filtrar cualquier detalle interno/de la clave).
      let detail = "Error al generar el audio.";
      try {
        const j = await upstream.json();
        detail = (j && j.error && j.error.message) || detail;
      } catch (e) {
        /* respuesta no era JSON, se ignora */
      }
      console.error("[popsy-voice-backend] OpenAI respondió", upstream.status, "-", detail);
      return res.status(502).json({ error: "El servicio de voz no está disponible en este momento." });
    }

    const arrayBuffer = await upstream.arrayBuffer();
    res.set("Content-Type", "audio/mpeg");
    res.set("Cache-Control", "no-store");
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error("[popsy-voice-backend] error inesperado:", err);
    res.status(500).json({ error: "Error inesperado del backend de voz." });
  }
});

app.listen(PORT, () => {
  console.log(`[popsy-voice-backend] escuchando en http://localhost:${PORT}`);
  console.log(`[popsy-voice-backend] OPENAI_API_KEY configurada: ${OPENAI_API_KEY ? "sí" : "NO — configúrala en .env"}`);
});
