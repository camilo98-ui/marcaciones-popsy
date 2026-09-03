# popsy-voice-backend

Backend/proxy seguro para el **Asistente de voz** de Marcaciones Popsy. Es la única
pieza del sistema que conoce tu clave de OpenAI — el archivo `marcaciones-popsy.html`
(el navegador) nunca la ve.

```
FRONTEND (marcaciones-popsy.html)
        ↓
   VoiceService (dentro del HTML)
        ↓  fetch a http://localhost:8787/api/voice
POPSY-VOICE-BACKEND  (este proyecto — guarda OPENAI_API_KEY)
        ↓
   OpenAI Text-to-Speech (gpt-4o-mini-tts)
        ↓
     audio (mp3)
        ↓
FRONTEND (lo reproduce)
```

## 1. Requisitos

- [Node.js](https://nodejs.org) 18 o superior instalado en tu computador.
- Una clave de API de OpenAI con acceso a `gpt-4o-mini-tts` (la generas en
  https://platform.openai.com/api-keys).

## 2. Instalación

Abre una terminal **en esta carpeta** (`popsy-voice-backend`) y corre:

```bash
npm install
```

## 3. Configura tu clave

Copia `.env.example` a un archivo nuevo llamado `.env` y pega tu clave real ahí:

```
OPENAI_API_KEY=sk-tu-clave-real-aqui
```

**Nunca compartas ni subas el archivo `.env` a ningún lado** (git, chat, correo). Ya
está incluido en `.gitignore` por seguridad.

## 4. Arranca el backend

```bash
npm start
```

Deberías ver:

```
[popsy-voice-backend] escuchando en http://localhost:8787
[popsy-voice-backend] OPENAI_API_KEY configurada: sí
```

Déjalo corriendo mientras usas la app. Con esto abierto, `marcaciones-popsy.html`
(ábrelo normalmente, con doble clic o desde tu navegador) ya puede usar el
Asistente de voz — verifícalo en **Administración → Configuración → 🔊 Asistente de
voz**, donde debería decir "✓ Servicio de voz conectado."

## 5. Si el backend no está corriendo

La app sigue funcionando con total normalidad: los eventos se siguen mostrando de
forma visual (toasts, tarjetas, etc.), simplemente no habrá audio, y se muestra el
aviso "Voz IA no disponible." — nunca se rompe la operación por esto.

## Notas de seguridad

- `OPENAI_API_KEY` vive únicamente en `.env`, leído por `server.js` del lado del
  servidor. Nunca se envía al navegador, ni aparece en el HTML, ni en
  `localStorage`/`sessionStorage` del cliente.
- El endpoint `/api/voice/health` solo informa si la clave está configurada
  (`true`/`false`), nunca su valor.
- Los errores que devuelve OpenAI se registran en la consola de este servidor, pero
  al navegador solo se le devuelve un mensaje genérico ("El servicio de voz no está
  disponible en este momento"), para no filtrar detalles internos.

## Puerto / URL distintos

Por defecto corre en el puerto `8787`. Si necesitas cambiarlo:

1. En `.env`, agrega `PORT=otro-puerto`.
2. En `marcaciones-popsy.html`, antes de abrirlo, define en la consola del navegador
   `localStorage.setItem("popsy_voice_backend_url", "http://localhost:otro-puerto")`
   (o cambia la constante `VOICE_BACKEND_URL` directamente en el HTML).
