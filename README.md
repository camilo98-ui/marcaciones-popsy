# Marcaciones Popsy

App interna para el control de vida útil de insumos abiertos (marcaciones, inspecciones,
estadísticas) más un asistente de voz operativo.

## Estructura

- **`marcaciones-popsy.html`** (= `index.html`) — la app completa: una sola página, sin
  dependencias externas (aparte de Google Fonts). Abre igual con doble clic o publicada en
  cualquier hosting.
- **`netlify/functions/data.js`** — backend de datos compartidos entre dispositivos: guarda y
  lee las marcaciones/tiendas de cada tienda en **Netlify Blobs**, para que abrir la misma
  tienda desde cualquier dispositivo muestre lo mismo. Sin esto, cada dispositivo guardaba
  solo localmente (era el problema original).
- **`popsy-voice-backend/`** — backend/proxy seguro, aparte, para el Asistente de voz (OpenAI
  Text-to-Speech). Es la única pieza que conoce tu clave de OpenAI; la app nunca la ve. Este
  backend corre **localmente en tu computador** (no en Netlify) — ver su propio
  [`README.md`](popsy-voice-backend/README.md).

## Publicar en Netlify (con datos compartidos funcionando)

Este repo ya trae todo listo para que Netlify sirva tanto el HTML como la Function de datos.
Dos formas de publicarlo:

### Opción A — Netlify CLI (más simple, sin GitHub)

```bash
npm install -g netlify-cli
netlify login
netlify init          # o "netlify link" si ya tienes un sitio creado en Netlify
netlify deploy --prod
```

### Opción B — conectar este repo a Netlify por Git

1. Sube este repo a GitHub (o GitLab/Bitbucket).
2. En Netlify: **Add new site → Import an existing project** → selecciona el repo.
3. Build settings: déjalo vacío / usa los valores de `netlify.toml` (ya están correctos:
   `publish = "."`, `functions = "netlify/functions"`).
4. Deploy.

En ambos casos, Netlify detecta `netlify.toml`, instala `@netlify/blobs` (está en
`package.json`) y publica la function automáticamente en
`https://tu-sitio.netlify.app/.netlify/functions/data`. No necesitas crear ni configurar la
base de datos — Netlify Blobs queda disponible automáticamente para el sitio, sin cuentas ni
pasos extra.

## Cómo verificar que los datos ya se comparten

1. Publica el sitio (arriba).
2. Ábrelo en un dispositivo, entra a una tienda y crea una marcación.
3. Ábrelo en **otro** dispositivo/navegador y entra a la **misma** tienda.
4. Deberías ver la marcación que creaste en el paso 2.
5. En Administración (pie de la barra lateral) el indicador de sincronización debería decir
   "Sincronizado en la nube" — si dice "Modo local", revisa que la Function se haya publicado
   correctamente (pestaña *Functions* en el panel de Netlify del sitio).

## Notas

- `popsy-voice-backend/.env` (tu clave real de OpenAI) y `popsy-voice-backend/node_modules/`
  están excluidos de este repositorio a propósito — nunca deben subirse a ningún lado.
- `node_modules/` en la raíz (de `@netlify/blobs`) tampoco se sube — Netlify lo instala solo
  al desplegar.
