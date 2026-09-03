# Marcaciones Popsy

App interna para el control de vida útil de insumos abiertos (marcaciones, inspecciones,
estadísticas) más un asistente de voz operativo.

## Estructura

- **`marcaciones-popsy.html`** — la app completa: una sola página, sin dependencias externas
  (aparte de Google Fonts). Ábrela con doble clic o desde cualquier navegador.
- **`popsy-voice-backend/`** — backend/proxy seguro para el Asistente de voz (OpenAI
  Text-to-Speech, `gpt-4o-mini-tts`). Es la única pieza que conoce tu clave de OpenAI; la app
  nunca la ve. Ver [`popsy-voice-backend/README.md`](popsy-voice-backend/README.md) para
  instalarlo y correrlo.

## Uso rápido

1. Abre `marcaciones-popsy.html` — la app funciona completa de inmediato (marcaciones,
   historial, inspección, estadísticas). Sin el backend de voz corriendo, simplemente no habrá
   avisos hablados (se muestra "Voz IA no disponible", sin romper nada).
2. Para activar el Asistente de voz, sigue las instrucciones en
   `popsy-voice-backend/README.md` (instalar dependencias, configurar tu `OPENAI_API_KEY` en
   un `.env` local, `npm start`).

## Notas

- `popsy-voice-backend/.env` (tu clave real) y `popsy-voice-backend/node_modules/` están
  excluidos de este repositorio a propósito — nunca deben subirse a ningún lado.
- Este repo es local por ahora (sin remoto configurado).
