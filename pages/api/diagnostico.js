import reglas from "../../data/reglas.json";

function sanitizar(texto) {
  if (typeof texto !== "string") return "";
  return texto.replace(/<[^>]*>/g, "").slice(0, 300);
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
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await response.json();
    const textoRespuesta = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const limpio = textoRespuesta.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(limpio);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "No se pudo generar el diagnostico. Intenta de nuevo." });
  }
}    { "descripcion": "texto en español explicando que falta o que ya se cumple", "bloqueante": true o false }
  ]
}
Ordena "pendientes" con los bloqueantes primero.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await response.json();
    const textoRespuesta = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const limpio = textoRespuesta.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(limpio);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "No se pudo generar el diagnostico. Intenta de nuevo." });
  }
}
