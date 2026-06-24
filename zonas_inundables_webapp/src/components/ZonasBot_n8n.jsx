import { useState, useEffect, useRef } from "react";

const N8N_WEBHOOK = "https://taddeipablodev.app.n8n.cloud/webhook-test/zonasbot";

const MENU = [
  { label: "🌊 Zonas inundables",         key: "zonas" },
  { label: "🏥 Hospitales",               key: "hospitales" },
  { label: "💊 Farmacias",                key: "farmacias" },
  { label: "🚒 Cuarteles de bomberos",    key: "cuarteles" },
  { label: "👮 Comisarías Federal",       key: "comisarias-federal" },
  { label: "👮 Comisarías Metropolitana", key: "comisarias-metropolitana" },
  { label: "🗺️  Info de la comuna",       key: "comunas" },
];

const LABEL_MAP = {
  zonas:                     "zonas inundables",
  hospitales:                "hospitales",
  farmacias:                 "farmacias",
  cuarteles:                 "cuarteles de bomberos",
  "comisarias-federal":      "comisarías federal",
  "comisarias-metropolitana":"comisarías metropolitana",
  comunas:                   "info de la comuna",
};

export default function ZonasBot({ onData }) {
  const [open, setOpen]           = useState(false)
  const [messages, setMessages]   = useState([])
  const [input, setInput]         = useState("")
  const [phase, setPhase]         = useState("greeting")
  const [barrio, setBarrio]       = useState("")
  const [optLocked, setOptLocked] = useState(false)
  const bottomRef                 = useRef(null)
  const inputRef                  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Saludo inicial solo la primera vez que se abre
  useEffect(() => {
    if (open && messages.length === 0) {
      addBot("👋 ¡Hola! Soy ZonasBot. Te ayudo a encontrar información sobre zonas inundables y servicios de emergencia.")
      setTimeout(() => {
        addBot("¿Sobre qué barrio querés consultar?")
        setPhase("ask_barrio")
        inputRef.current?.focus()
      }, 600)
    }
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  function addBot(text, extra = {}) {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), from: "bot", text, ...extra }])
  }
  function addUser(text) {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), from: "user", text }])
  }
  function removeLoading() {
    setMessages(prev => prev.filter(m => !m.loading))
  }

  function showMenu(b) {
    setOptLocked(false)
    addBot(`¿Qué información necesitás sobre ${b}?`, {
      options: MENU,
      onSelect: (item) => handleMenuSelect(item, b),
    })
    setPhase("menu")
  }

  async function handleMenuSelect(item, currentBarrio) {
    setOptLocked(true)
    addUser(item.label)
    setMessages(prev => [...prev, { id: "loading", from: "bot", text: "Consultando información...", loading: true }])
    setPhase("loading")

    try {
      const res = await fetch(N8N_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensaje: LABEL_MAP[item.key] ?? item.label,
          barrio: currentBarrio,
        }),
      })
      if (!res.ok) throw new Error(`n8n respondió con status ${res.status}`)
      const result = await res.json()
      removeLoading()

      const data  = result.data
      const count = Array.isArray(data)
        ? data.length
        : data?.features?.length ?? "—"

      addBot(`✅ Encontré ${count} resultado${count !== 1 ? "s" : ""} para ${currentBarrio}. Los datos están disponibles en el mapa.`)
      onData?.(result.key ?? item.key, data, currentBarrio)

    } catch (err) {
      removeLoading()
      addBot("⚠️ No pude obtener los datos. Verificá el nombre del barrio e intentá de nuevo.")
    }

    setTimeout(() => {
      setOptLocked(false)
      addBot("¿Querés consultar algo más?", {
        options: [
          { label: "Sí, otra consulta del mismo barrio", key: "same" },
          { label: "Cambiar de barrio",                  key: "change" },
        ],
        onSelect: (opt) => {
          setOptLocked(true)
          addUser(opt.label)
          if (opt.key === "same") {
            showMenu(currentBarrio)
          } else {
            setPhase("ask_barrio")
            addBot("Perfecto, ¿cuál es el nuevo barrio?")
            inputRef.current?.focus()
          }
        },
      })
      setPhase("continue")
    }, 400)
  }

  function handleSend() {
    const val = input.trim()
    if (!val) return
    setInput("")
    if (phase === "ask_barrio" || phase === "greeting") {
      addUser(val)
      setBarrio(val)
      setTimeout(() => showMenu(val), 300)
    }
  }

  const inputActive = phase === "ask_barrio" || phase === "greeting"

  return (
    <div style={styles.wrapper}>

      {/* ── Panel del chat ── */}
      {open && (
        <div style={styles.chatPanel}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.avatar}>🗺️</div>
            <div style={{ flex: 1 }}>
              <p style={styles.headerName}>ZonasBot</p>
              <p style={styles.headerSub}>Info sobre tu barrio · vía n8n</p>
            </div>
            <button style={styles.closeBtn} onClick={() => setOpen(false)} title="Cerrar">✕</button>
          </div>

          {/* Mensajes */}
          <div style={styles.messages}>
            {messages.map((msg) => (
              <div key={msg.id}>
                <div style={{
                  ...styles.bubble,
                  ...(msg.from === "user" ? styles.bubbleUser : styles.bubbleBot),
                  ...(msg.loading ? styles.bubbleLoading : {}),
                }}>
                  {msg.text}
                </div>
                {msg.options && (
                  <div style={styles.optionsWrap}>
                    {msg.options.map((opt) => (
                      <button
                        key={opt.key}
                        style={{ ...styles.optBtn, opacity: optLocked ? 0.5 : 1 }}
                        disabled={optLocked}
                        onClick={() => {
                          if (optLocked) return
                          setOptLocked(true)
                          msg.onSelect(opt)
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

          {/* Input */}
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
              ➤
            </button>
          </div>
        </div>
      )}

      {/* ── Burbuja flotante ── */}
      <button
        style={{ ...styles.bubble_btn, ...(open ? styles.bubble_btn_open : {}) }}
        onClick={() => setOpen(prev => !prev)}
        title={open ? "Cerrar ZonasBot" : "Abrir ZonasBot"}
      >
        {open ? "✕" : "🗺️"}
        {!open && messages.length === 0 && (
          <span style={styles.pulse} />
        )}
      </button>

    </div>
  )
}

const styles = {
  wrapper: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 2000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '12px',
    pointerEvents: 'none', // el wrapper no bloquea clics al mapa
  },
  chatPanel: {
    pointerEvents: 'all',
    display: 'flex',
    flexDirection: 'column',
    width: '360px',
    height: '500px',
    background: '#fff',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
    border: '1px solid #e2e8f0',
    animation: 'slideUp 0.2s ease',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 14px',
    borderBottom: '1px solid #e2e8f0',
    background: '#f8fffe',
  },
  avatar: {
    width: '34px', height: '34px', borderRadius: '50%',
    background: '#E1F5EE', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: '17px',
  },
  headerName: { margin: 0, fontSize: '14px', fontWeight: 600 },
  headerSub:  { margin: 0, fontSize: '11px', color: '#64748b' },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: '15px', color: '#94a3b8', padding: '4px',
    borderRadius: '6px', lineHeight: 1,
  },
  messages: {
    flex: 1, overflowY: 'auto', padding: '12px',
    display: 'flex', flexDirection: 'column', gap: '8px',
  },
  bubble: {
    maxWidth: '82%', padding: '9px 13px',
    borderRadius: '14px', fontSize: '13px', lineHeight: 1.5,
  },
  bubbleBot:     { background: '#f1f5f9', color: '#1e293b', alignSelf: 'flex-start', borderBottomLeftRadius: '4px' },
  bubbleUser:    { background: '#1D9E75', color: '#fff',    alignSelf: 'flex-end',   borderBottomRightRadius: '4px' },
  bubbleLoading: { color: '#94a3b8', fontStyle: 'italic' },
  optionsWrap:   { display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '6px', paddingLeft: '2px' },
  optBtn: {
    background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px',
    padding: '7px 12px', fontSize: '12px', textAlign: 'left',
    cursor: 'pointer', color: '#1e293b', transition: 'background 0.15s',
  },
  inputArea: {
    display: 'flex', gap: '8px', padding: '10px 12px',
    borderTop: '1px solid #e2e8f0',
  },
  input: {
    flex: 1, padding: '8px 12px', fontSize: '13px',
    border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none',
  },
  sendBtn: {
    padding: '8px 14px', fontSize: '16px',
    background: '#1D9E75', color: '#fff',
    border: 'none', borderRadius: '8px', cursor: 'pointer',
  },
  bubble_btn: {
    pointerEvents: 'all',
    width: '56px', height: '56px', borderRadius: '50%',
    background: '#1D9E75', color: '#fff',
    border: 'none', cursor: 'pointer',
    fontSize: '24px', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(29,158,117,0.5)',
    transition: 'transform 0.2s, background 0.2s',
    position: 'relative',
  },
  bubble_btn_open: {
    background: '#0f6e56',
    fontSize: '18px',
  },
  pulse: {
    position: 'absolute', top: '4px', right: '4px',
    width: '12px', height: '12px', borderRadius: '50%',
    background: '#f97316',
    boxShadow: '0 0 0 0 rgba(249,115,22,0.5)',
    animation: 'pulse 1.5s infinite',
  },
}
