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
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const textoRespuesta = data?.content?.find((c) => c.type === "text")?.text || "";
    const limpio = textoRespuesta.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(limpio);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "No se pudo generar el diagnostico. Intenta de nuevo." });
  }
}
