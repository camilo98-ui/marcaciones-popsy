/* =========================================================================
   netlify/functions/data.js — almacenamiento compartido de Marcaciones Popsy
   =========================================================================
   Reemplaza el "window.claude" que la app usaba originalmente (solo disponible
   dentro del visor de Claude) por Netlify Blobs, que sí funciona en cualquier
   sitio publicado en Netlify: así una marcación creada en un dispositivo la ve
   cualquier otro que abra la misma tienda.

   GET  /.netlify/functions/data?path=data/mitienda.json  → devuelve el JSON guardado
   PUT  /.netlify/functions/data?path=data/mitienda.json  → guarda el JSON del body

   "path" es el mismo identificador que ya usaba la app (data/_config.json,
   data/_tiendas.json, data/<slug-de-tienda>.json) — aquí se usa directo como
   clave del blob, validado estrictamente para no aceptar nada fuera de ese
   patrón (nunca rutas de archivo reales, nunca datos fuera de este formato).
   ========================================================================= */

const { connectLambda, getStore } = require("@netlify/blobs");

const STORE_NAME = "popsy-data";
// Solo "data/<algo>.json" con slugs seguros — igual de estricto que slugify() en el frontend.
const VALID_PATH = /^data\/[a-zA-Z0-9_-]+\.json$/;
const MAX_BODY_BYTES = 2 * 1024 * 1024; // 2MB — de sobra para el historial de una tienda

exports.handler = async (event) => {
  // Esta function usa la firma clásica de Lambda (exports.handler), donde Netlify Blobs
  // NO autoconfigura el entorno solo — hay que conectarlo explícitamente con el evento
  // recibido antes de pedir cualquier store. Sin esto, getStore() falla con
  // "MissingBlobsEnvironmentError" aunque el sitio sí tenga Blobs disponible.
  connectLambda(event);

  const path = event.queryStringParameters && event.queryStringParameters.path;

  if (!path || !VALID_PATH.test(path)) {
    return json(400, { error: "Ruta inválida." });
  }

  const store = getStore(STORE_NAME);

  try {
    if (event.httpMethod === "GET") {
      const value = await store.get(path);
      if (value == null) return json(404, { error: "No encontrado." });
      return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: value };
    }

    if (event.httpMethod === "PUT") {
      const body = event.body || "";
      if (Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) {
        return json(413, { error: "Los datos superan el límite permitido." });
      }
      try {
        JSON.parse(body); // valida que sea JSON antes de guardarlo — nunca se guarda basura
      } catch (e) {
        return json(400, { error: "El cuerpo debe ser JSON válido." });
      }
      await store.set(path, body);
      return json(200, { ok: true });
    }

    return json(405, { error: "Método no soportado." });
  } catch (err) {
    console.error("[popsy data function] error inesperado:", err);
    return json(500, { error: "Error inesperado guardando/leyendo los datos." });
  }
};

function json(statusCode, obj) {
  return { statusCode, headers: { "Content-Type": "application/json" }, body: JSON.stringify(obj) };
}
