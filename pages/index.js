
import { useState } from "react";

export default function Home() {
  const [form, setForm] = useState({
    tipoVela: "Aromatica",
    materiales: "",
    advertenciaIncendio: "",
    clasificacionArancelaria: "",
    empaque: "Caja de carton simple",
  });
  const [errors, setErrors] = useState({});
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);

  function validar() {
    const nuevosErrores = {};
    if (!form.materiales.trim()) {
      nuevosErrores.materiales = "Este campo es obligatorio.";
    } else if (form.materiales.length > 300) {
      nuevosErrores.materiales = "Maximo 300 caracteres.";
    }
    if (!form.advertenciaIncendio) {
      nuevosErrores.advertenciaIncendio = "Selecciona una opcion.";
    }
    if (!form.clasificacionArancelaria) {
      nuevosErrores.clasificacionArancelaria = "Selecciona una opcion.";
    }
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
      if (!res.ok) throw new Error(data.error || "Error al generar el diagnostico");
      setResultado(data);
    } catch (err) {
      setResultado({ error: err.message });
    } finally {
      setCargando(false);
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: "40px auto", fontFamily: "Arial, sans-serif", padding: "0 16px" }}>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>¿Listo para exportar?</h1>
      <p style={{ color: "#555", marginBottom: 24 }}>
        Descubre qué tan lista está tu vela para venderse en Estados Unidos.
      </p>

      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Tipo de vela</label>
        <select
          value={form.tipoVela}
          onChange={(e) => setForm({ ...form, tipoVela: e.target.value })}
          style={{ width: "100%", padding: 8, marginBottom: 12 }}
        >
          <option>Aromatica</option>
          <option>Decorativa</option>
          <option>En contenedor de vidrio</option>
          <option>Votiva</option>
          <option>Otra</option>
        </select>

        <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Materiales principales</label>
        <input
          type="text"
          maxLength={300}
          placeholder="Ej. cera de soya, parafina, aceites esenciales"
          value={form.materiales}
          onChange={(e) => setForm({ ...form, materiales: e.target.value })}
          style={{ width: "100%", padding: 8, marginBottom: 4 }}
        />
        {errors.materiales && <p style={{ color: "crimson", fontSize: 12, marginTop: 0 }}>{errors.materiales}</p>}

        <label style={{ display: "block", fontSize: 13, marginBottom: 4, marginTop: 8 }}>
          ¿Tu etiqueta incluye advertencia de riesgo de incendio?
        </label>
        <p style={{ fontSize: 12, color: "#888", margin: "0 0 4px" }}>
          Un texto en la etiqueta que avise "no dejar sin supervisión, mantener lejos de niños y mascotas" — obligatorio en EE.UU. para velas.
        </p>
        <select
          value={form.advertenciaIncendio}
          onChange={(e) => setForm({ ...form, advertenciaIncendio: e.target.value })}
          style={{ width: "100%", padding: 8, marginBottom: 4 }}
        >
          <option value="">Selecciona una opcion</option>
          <option value="si">Si</option>
          <option value="no">No</option>
        </select>
        {errors.advertenciaIncendio && (
          <p style={{ color: "crimson", fontSize: 12, marginTop: 0 }}>{errors.advertenciaIncendio}</p>
        )}

        <label style={{ display: "block", fontSize: 13, marginBottom: 4, marginTop: 8 }}>
          ¿Tienes clasificacion arancelaria (HTS) asignada?
        </label>
        <p style={{ fontSize: 12, color: "#888", margin: "0 0 4px" }}>
          Es un codigo numerico que le dice a la aduana de EE.UU. qué tipo de producto es el tuyo. Normalmente lo asigna un agente aduanal.
        </p>
        <select
          value={form.clasificacionArancelaria}
          onChange={(e) => setForm({ ...form, clasificacionArancelaria: e.target.value })}
          style={{ width: "100%", padding: 8, marginBottom: 4 }}
        >
          <option value="">Selecciona una opcion</option>
          <option value="si">Si</option>
          <option value="no">No</option>
        </select>
        {errors.clasificacionArancelaria && (
          <p style={{ color: "crimson", fontSize: 12, marginTop: 0 }}>{errors.clasificacionArancelaria}</p>
        )}

        <label style={{ display: "block", fontSize: 13, marginBottom: 4, marginTop: 8 }}>Empaque actual</label>
        <select
          value={form.empaque}
          onChange={(e) => setForm({ ...form, empaque: e.target.value })}
          style={{ width: "100%", padding: 8, marginBottom: 16 }}
        >
          <option>Caja de carton simple</option>
          <option>Caja reforzada</option>
          <option>Sin empaque especial</option>
        </select>

        <button
          type="submit"
          disabled={cargando}
          style={{ width: "100%", padding: 10, background: "#111", color: "#fff", border: "none", borderRadius: 6 }}
        >
          {cargando ? "Generando..." : "Generar diagnostico"}
        </button>
      </form>

      {resultado && resultado.error && (
        <p style={{ color: "crimson", marginTop: 20 }}>{resultado.error}</p>
      )}

      {resultado && !resultado.error && (
        <div style={{ marginTop: 24, border: "1px solid #ddd", borderRadius: 8, padding: 16 }}>
          <p style={{ fontWeight: "bold", marginBottom: 12 }}>{resultado.porcentaje}% listo para exportar</p>
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
