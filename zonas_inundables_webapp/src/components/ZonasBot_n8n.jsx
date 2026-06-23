import { useState, useEffect, useRef } from "react";

// ⚠️ Reemplazá esta URL con tu webhook real de n8n
const N8N_WEBHOOK = "https://taddeipablodev.app.n8n.cloud/webhook/zonasbot";

const MENU = [
  { label: "🌊 Zonas inundables",         key: "zonas" },
  { label: "🏥 Hospitales",               key: "hospitales" },
  { label: "💊 Farmacias",                key: "farmacias" },
  { label: "🚒 Cuarteles de bomberos",    key: "cuarteles" },
  { label: "👮 Comisarías Federal",       key: "comisarias-federal" },
  { label: "👮 Comisarías Metropolitana", key: "comisarias-metropolitana" },
  { label: "🗺️  Info de la comuna",       key: "comunas" },
];

// Mapeo de key → mensaje legible para el usuario
const LABEL_MAP = {
  zonas:                    "zonas inundables",
  hospitales:               "hospitales",
  farmacias:                "farmacias",
  cuarteles:                "cuarteles de bomberos",
  "comisarias-federal":     "comisarías federal",
  "comisarias-metropolitana": "comisarías metropolitana",
  comunas:                  "info de la comuna",
};

export default function ZonasBot({ onData }) {
  // onData(key, data, barrio) → el padre pinta el mapa con estos datos

  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState("");
  const [phase, setPhase]         = useState("greeting");
  const [barrio, setBarrio]       = useState("");
  const [optLocked, setOptLocked] = useState(false);
  const bottomRef                 = useRef(null);
  const inputRef                  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    addBot("👋 ¡Hola! Soy ZonasBot. Te ayudo a encontrar información sobre zonas inundables, servicios de emergencia y más.");
    setTimeout(() => {
      addBot("¿Sobre qué barrio querés consultar?");
      setPhase("ask_barrio");
      inputRef.current?.focus();
    }, 600);
  }, []);

  function addBot(text, extra = {}) {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), from: "bot", text, ...extra }]);
  }
  function addUser(text) {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), from: "user", text }]);
  }
  function removeLoading() {
    setMessages(prev => prev.filter(m => !m.loading));
  }

  function showMenu(b) {
    setOptLocked(false);
    addBot(`¿Qué información necesitás sobre ${b}?`, {
      options: MENU,
      onSelect: (item) => handleMenuSelect(item, b),
    });
    setPhase("menu");
  }

  async function handleMenuSelect(item, currentBarrio) {
    setOptLocked(true);
    addUser(item.label);

    // Mensaje de carga
    setMessages(prev => [
      ...prev,
      { id: "loading", from: "bot", text: "Consultando información...", loading: true },
    ]);
    setPhase("loading");

    try {
      // ── Llamada al webhook de n8n ──────────────────────────────────────────
      const res = await fetch(N8N_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensaje: LABEL_MAP[item.key] ?? item.label,
          barrio:  currentBarrio,
        }),
      });

      if (!res.ok) throw new Error(`n8n respondió con status ${res.status}`);

      const result = await res.json();
      // n8n devuelve: { key, barrio, data }

      removeLoading();

      const data  = result.data;
      const count = Array.isArray(data)
        ? data.length
        : data?.features?.length ?? "—";

      addBot(
        `✅ Encontré ${count} resultado${count !== 1 ? "s" : ""} para ${currentBarrio}. Los datos ya están disponibles en el mapa.`
      );

      // Notificar al componente padre para que pinte el mapa
      onData?.(result.key ?? item.key, data, currentBarrio);

    } catch (err) {
      removeLoading();
      console.error("ZonasBot error:", err);
      addBot("⚠️ No pude obtener los datos en este momento. Verificá el nombre del barrio e intentá de nuevo.");
    }

    // Preguntar si continuar
    setTimeout(() => {
      setOptLocked(false);
      addBot("¿Querés consultar algo más?", {
        options: [
          { label: "Sí, otra consulta del mismo barrio", key: "same" },
          { label: "Cambiar de barrio",                  key: "change" },
        ],
        onSelect: (opt) => {
          setOptLocked(true);
          addUser(opt.label);
          if (opt.key === "same") {
            showMenu(currentBarrio);
          } else {
            setPhase("ask_barrio");
            addBot("Perfecto, ¿cuál es el nuevo barrio?");
            inputRef.current?.focus();
          }
        },
      });
      setPhase("continue");
    }, 400);
  }

  function handleSend() {
    const val = input.trim();
    if (!val) return;
    setInput("");

    if (phase === "ask_barrio" || phase === "greeting") {
      addUser(val);
      setBarrio(val);
      setTimeout(() => showMenu(val), 300);
    }
  }

  const inputActive = phase === "ask_barrio" || phase === "greeting";

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.avatar}>🗺️</div>
        <div>
          <p style={styles.headerName}>ZonasBot</p>
          <p style={styles.headerSub}>Info sobre tu barrio · vía n8n</p>
        </div>
      </div>

      <div style={styles.messages}>
        {messages.map((msg) => (
          <div key={msg.id}>
            <div
              style={{
                ...styles.bubble,
                ...(msg.from === "user" ? styles.bubbleUser : styles.bubbleBot),
                ...(msg.loading ? styles.bubbleLoading : {}),
              }}
            >
              {msg.text}
            </div>
            {msg.options && (
              <div style={styles.optionsWrap}>
                {msg.options.map((opt) => (
                  <button
                    key={opt.key}
                    style={styles.optBtn}
                    disabled={optLocked}
                    onClick={() => {
                      if (optLocked) return;
                      setOptLocked(true);
                      msg.onSelect(opt);
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={styles.inputArea}>
        <input
          ref={inputRef}
          style={styles.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder={inputActive ? "Escribí el barrio..." : "Usá los botones de arriba"}
          disabled={!inputActive}
        />
        <button
          style={{ ...styles.sendBtn, opacity: inputActive ? 1 : 0.4 }}
          onClick={handleSend}
          disabled={!inputActive}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex", flexDirection: "column",
    width: "360px", height: "520px",
    border: "1px solid #e2e8f0", borderRadius: "16px",
    overflow: "hidden", fontFamily: "system-ui, sans-serif",
    background: "#fff",
  },
  header: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "12px 16px", borderBottom: "1px solid #e2e8f0",
    background: "#f8fffe",
  },
  avatar: {
    width: "36px", height: "36px", borderRadius: "50%",
    background: "#E1F5EE", display: "flex",
    alignItems: "center", justifyContent: "center", fontSize: "18px",
  },
  headerName: { margin: 0, fontSize: "14px", fontWeight: 500 },
  headerSub:  { margin: 0, fontSize: "12px", color: "#64748b" },
  messages: {
    flex: 1, overflowY: "auto", padding: "14px",
    display: "flex", flexDirection: "column", gap: "8px",
  },
  bubble: {
    maxWidth: "80%", padding: "9px 13px",
    borderRadius: "14px", fontSize: "14px", lineHeight: 1.5,
  },
  bubbleBot:     { background: "#f1f5f9", color: "#1e293b", alignSelf: "flex-start", borderBottomLeftRadius: "4px" },
  bubbleUser:    { background: "#1D9E75", color: "#fff", alignSelf: "flex-end", borderBottomRightRadius: "4px" },
  bubbleLoading: { color: "#94a3b8", fontStyle: "italic" },
  optionsWrap:   { display: "flex", flexDirection: "column", gap: "5px", marginTop: "6px", paddingLeft: "2px" },
  optBtn: {
    background: "#fff", border: "1px solid #e2e8f0",
    borderRadius: "8px", padding: "7px 12px",
    fontSize: "13px", textAlign: "left", cursor: "pointer",
    color: "#1e293b", transition: "background 0.15s",
  },
  inputArea: { display: "flex", gap: "8px", padding: "12px", borderTop: "1px solid #e2e8f0" },
  input: {
    flex: 1, padding: "8px 12px", fontSize: "14px",
    border: "1px solid #e2e8f0", borderRadius: "8px", outline: "none",
  },
  sendBtn: {
    padding: "8px 14px", fontSize: "13px",
    background: "#1D9E75", color: "#fff",
    border: "none", borderRadius: "8px", cursor: "pointer",
  },
};
