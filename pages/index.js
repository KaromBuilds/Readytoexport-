import { useState } from "react";

function Label({ en, es }) {
  return (
    <div style={{ marginTop: 8, marginBottom: 4 }}>
      <label style={{ display: "block", fontSize: 14, fontWeight: 600 }}>{en}</label>
      <span style={{ display: "block", fontSize: 11, color: "#9ca3af" }}>{es}</span>
    </div>
  );
}

function Help({ en, es }) {
  return (
    <div style={{ margin: "0 0 4px" }}>
      <p style={{ fontSize: 12, color: "#888", margin: 0 }}>{en}</p>
      <p style={{ fontSize: 10.5, color: "#b0b5bd", margin: 0 }}>{es}</p>
    </div>
  );
}

export default function Home() {
  const [form, setForm] = useState({
    tipoVela: "Aromatica",
    materiales: "",
    advertenciaIncendio: "",
    clasificacionArancelaria: "",
    empaque: "Caja de carton simple",
    tipoMecha: "",
    paisOrigen: "",
    pesoNeto: "",
  });
  const [errors, setErrors] = useState({});
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);

  function validar() {
    const nuevosErrores = {};
    if (!form.materiales.trim()) {
      nuevosErrores.materiales = "Required / Obligatorio";
    } else if (form.materiales.length > 300) {
      nuevosErrores.materiales = "Max 300 characters / Maximo 300 caracteres";
    }
    if (!form.advertenciaIncendio) nuevosErrores.advertenciaIncendio = "Choose an option / Selecciona una opcion";
    if (!form.clasificacionArancelaria) nuevosErrores.clasificacionArancelaria = "Choose an option / Selecciona una opcion";
    if (!form.tipoMecha) nuevosErrores.tipoMecha = "Choose an option / Selecciona una opcion";
    if (!form.paisOrigen) nuevosErrores.paisOrigen = "Choose an option / Selecciona una opcion";
    if (!form.pesoNeto) nuevosErrores.pesoNeto = "Choose an option / Selecciona una opcion";
    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validar()) return;

    setCargando(true);
    setResultado(null);
    try {
      const res = await fetch("/api/diagnostico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setResultado(data);
    } catch (err) {
      setResultado({ error: err.message });
    } finally {
      setCargando(false);
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: "40px auto", fontFamily: "Arial, sans-serif", padding: "0 16px" }}>
      <h1 style={{ fontSize: 22, marginBottom: 2 }}>Ready to Export?</h1>
      <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 10 }}>¿Listo para exportar?</p>
      <p style={{ color: "#555", marginBottom: 2 }}>
        Find out how ready your candle is to sell in the United States.
      </p>
      <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 24 }}>
        Descubre qué tan lista está tu vela para venderse en Estados Unidos.
      </p>

      <form onSubmit={handleSubmit}>
        <Label en="Candle type" es="Tipo de vela" />
        <select
          value={form.tipoVela}
          onChange={(e) => setForm({ ...form, tipoVela: e.target.value })}
          style={{ width: "100%", padding: 8, marginBottom: 12 }}
        >
          <option value="Aromatica">Scented / Aromática</option>
          <option value="Decorativa">Decorative / Decorativa</option>
          <option value="En contenedor de vidrio">Glass container / En contenedor de vidrio</option>
          <option value="Votiva">Votive / Votiva</option>
          <option value="Otra">Other / Otra</option>
        </select>

        <Label en="Main materials" es="Materiales principales" />
        <input
          type="text"
          maxLength={300}
          placeholder="Ex. soy wax, paraffin, essential oils / cera de soya, parafina, aceites esenciales"
          value={form.materiales}
          onChange={(e) => setForm({ ...form, materiales: e.target.value })}
          style={{ width: "100%", padding: 8, marginBottom: 4 }}
        />
        {errors.materiales && <p style={{ color: "crimson", fontSize: 12, marginTop: 0 }}>{errors.materiales}</p>}

        <Label en="Does your label include a fire-risk warning?" es="¿Tu etiqueta incluye advertencia de riesgo de incendio?" />
        <Help
          en={'A label warning like "do not leave unattended, keep away from children and pets" — required in the US for candles.'}
          es='Un texto que avise "no dejar sin supervisión, mantener lejos de niños y mascotas" — obligatorio en EE.UU.'
        />
        <select
          value={form.advertenciaIncendio}
          onChange={(e) => setForm({ ...form, advertenciaIncendio: e.target.value })}
          style={{ width: "100%", padding: 8, marginBottom: 4 }}
        >
          <option value="">Choose an option / Selecciona una opcion</option>
          <option value="si">Yes / Sí</option>
          <option value="no">No / No</option>
        </select>
        {errors.advertenciaIncendio && (
          <p style={{ color: "crimson", fontSize: 12, marginTop: 0 }}>{errors.advertenciaIncendio}</p>
        )}

        <Label en="Do you have a tariff classification (HTS) assigned?" es="¿Tienes clasificación arancelaria (HTS) asignada?" />
        <Help
          en="A numeric code that tells US customs what kind of product yours is. Usually assigned by a customs broker."
          es="Código numérico que le dice a la aduana de EE.UU. qué tipo de producto es el tuyo. Normalmente lo asigna un agente aduanal."
        />
        <select
          value={form.clasificacionArancelaria}
          onChange={(e) => setForm({ ...form, clasificacionArancelaria: e.target.value })}
          style={{ width: "100%", padding: 8, marginBottom: 4 }}
        >
          <option value="">Choose an option / Selecciona una opcion</option>
          <option value="si">Yes / Sí</option>
          <option value="no">No / No</option>
        </select>
        {errors.clasificacionArancelaria && (
          <p style={{ color: "crimson", fontSize: 12, marginTop: 0 }}>{errors.clasificacionArancelaria}</p>
        )}

        <Label en="What is your wick made of?" es="¿De qué material es la mecha?" />
        <Help
          en="Metal-core wicks (lead or zinc) have been banned in the US since 2003. If unsure, check if the wick is rigid when bent — a wire inside may mean it has metal."
          es="Las mechas con núcleo metálico (plomo o zinc) están prohibidas en EE.UU. desde 2003. Si no sabes, revisa si es rígida al doblarla."
        />
        <select
          value={form.tipoMecha}
          onChange={(e) => setForm({ ...form, tipoMecha: e.target.value })}
          style={{ width: "100%", padding: 8, marginBottom: 4 }}
        >
          <option value="">Choose an option / Selecciona una opcion</option>
          <option value="algodon_madera">Cotton or natural wood, no metal / Algodón o madera, sin metal</option>
          <option value="con_metal">Has a metal/wire core / Tiene núcleo de metal</option>
          <option value="no_se">Not sure / No estoy seguro</option>
        </select>
        {errors.tipoMecha && <p style={{ color: "crimson", fontSize: 12, marginTop: 0 }}>{errors.tipoMecha}</p>}

        <Label en="Does your label mark the country of origin?" es="¿Tu etiqueta marca el país de origen?" />
        <Help
          en='A visible text like "Made in Mexico" — required by US customs on every imported product.'
          es='Un texto visible como "Hecho en México" — lo exige la aduana de EE.UU. en todo producto importado.'
        />
        <select
          value={form.paisOrigen}
          onChange={(e) => setForm({ ...form, paisOrigen: e.target.value })}
          style={{ width: "100%", padding: 8, marginBottom: 4 }}
        >
          <option value="">Choose an option / Selecciona una opcion</option>
          <option value="si">Yes / Sí</option>
          <option value="no">No / No</option>
        </select>
        {errors.paisOrigen && <p style={{ color: "crimson", fontSize: 12, marginTop: 0 }}>{errors.paisOrigen}</p>}

        <Label en="Does your label declare net weight (oz and grams)?" es="¿Tu etiqueta declara el peso neto (onzas y gramos)?" />
        <Help
          en='Ex. "Net Wt. 8 oz (227 g)" — general US labeling requirement (FTC).'
          es='Ej. "Net Wt. 8 oz (227 g)" — requisito de etiquetado en EE.UU. (FTC).'
        />
        <select
          value={form.pesoNeto}
          onChange={(e) => setForm({ ...form, pesoNeto: e.target.value })}
          style={{ width: "100%", padding: 8, marginBottom: 4 }}
        >
          <option value="">Choose an option / Selecciona una opcion</option>
          <option value="si">Yes / Sí</option>
          <option value="no">No / No</option>
        </select>
        {errors.pesoNeto && <p style={{ color: "crimson", fontSize: 12, marginTop: 0 }}>{errors.pesoNeto}</p>}

        <Label en="Current packaging" es="Empaque actual" />
        <select
          value={form.empaque}
          onChange={(e) => setForm({ ...form, empaque: e.target.value })}
          style={{ width: "100%", padding: 8, marginBottom: 16 }}
        >
          <option value="Caja de carton simple">Simple cardboard box / Caja de cartón simple</option>
          <option value="Caja reforzada">Reinforced box / Caja reforzada</option>
          <option value="Sin empaque especial">No special packaging / Sin empaque especial</option>
        </select>

        <button
          type="submit"
          disabled={cargando}
          style={{ width: "100%", padding: 10, background: "#111", color: "#fff", border: "none", borderRadius: 6 }}
        >
          {cargando ? "Generating... / Generando..." : "Generate diagnosis / Generar diagnóstico"}
        </button>
      </form>

      {resultado && resultado.error && (
        <p style={{ color: "crimson", marginTop: 20 }}>{resultado.error}</p>
      )}

      {resultado && !resultado.error && (
        <div style={{ marginTop: 24, border: "1px solid #ddd", borderRadius: 8, padding: 16 }}>
          <p style={{ fontWeight: "bold", marginBottom: 2 }}>{resultado.porcentaje}% ready to export</p>
          <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 12 }}>{resultado.porcentaje}% listo para exportar</p>
          {resultado.pendientes?.map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <span>{p.bloqueante ? "🔴" : "🟡"}</span>
              <p style={{ margin: 0, fontSize: 14 }}>{p.descripcion}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
