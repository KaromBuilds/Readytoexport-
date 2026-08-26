import reglas from "../../data/reglas.json";

function sanitizar(texto) {
  if (typeof texto !== "string") return "";
  return texto.replace(/<[^>]*>/g, "").slice(0, 300);
}

function diagnosticoLocal(datos) {
  const pendientes = [];
  let cumplidos = 0;
  const totalReglas = 3;

  if (datos.advertenciaIncendio === "no") {
    pendientes.push({ descripcion: reglas.advertencia_riesgo_incendio.descripcion, bloqueante: true });
  } else {
    cumplidos++;
  }

  if (datos.clasificacionArancelaria === "no") {
    pendientes.push({ descripcion: reglas.clasificacion_arancelaria.descripcion, bloqueante: true });
  } else {
    cumplidos++;
  }

  if (datos.empaque === "Sin empaque especial") {
    pendientes.push({ descripcion: reglas.empaque_internacional.descripcion, bloqueante: false });
  } else {
    cumplidos++;
  }

  pendientes.sort((a, b) => (b.bloqueante ? 1 : 0) - (a.bloqueante ? 1 : 0));

  return {
    porcentaje: Math.round((cumplidos / totalReglas) * 100),
    pendientes,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo no permitido" });
  }

  const { tipoVela, materiales, advertenciaIncendio, clasificacionArancelaria, empaque } = req.body || {};

  if (!materiales || !advertenciaIncendio || !clasificacionArancelaria) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  const materialesLimpios = sanitizar(materiales);
  const datosFormulario = { tipoVela, materiales: materialesLimpios, advertenciaIncendio, clasificacionArancelaria, empaque };

  const prompt = `Eres un asistente que evalua si un producto (vela artesanal) esta listo para exportarse a Estados Unidos.

Datos del producto:
- Tipo de vela: ${tipoVela}
- Materiales: ${materialesLimpios}
- Tiene advertencia de riesgo de incendio en etiqueta: ${advertenciaIncendio}
- Tiene clasificacion arancelaria (HTS): ${clasificacionArancelaria}
- Empaque actual: ${empaque}

Reglas de compliance a evaluar:
${JSON.stringify(reglas, null, 2)}

Responde SOLO con un objeto JSON valido, sin texto adicional ni backticks, con esta forma exacta:
{
  "porcentaje": numero entre 0 y 100,
  "pendientes": [
    { "descripcion": "texto en español explicando que falta o que ya se cumple", "bloqueante": true o false }
  ]
}
Ordena "pendientes" con los bloqueantes primero.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await response.json();

    if (!response.ok || data?.error) {
      console.error("Gemini API error, usando fallback local:", JSON.stringify(data));
      return res.status(200).json(diagnosticoLocal(datosFormulario));
    }

    const textoRespuesta = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!textoRespuesta) {
      console.error("Respuesta sin texto, usando fallback local");
      return res.status(200).json(diagnosticoLocal(datosFormulario));
    }
    const limpio = textoRespuesta.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(limpio);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error("Error inesperado, usando fallback local:", err);
    return res.status(200).json(diagnosticoLocal(datosFormulario));
  }
}
