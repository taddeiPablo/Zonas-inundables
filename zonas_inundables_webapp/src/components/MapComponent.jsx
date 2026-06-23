import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Popup, Marker, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './MapComponent.css'

// Fix iconos default de Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// ─── Colores por tipo de afectación (zonas inundables) ───────────────────────
const AFECTACION_STYLES = {
  'Mayor anegamiento':  { color: '#dc2626', fillColor: '#dc2626', fillOpacity: 0.45, weight: 2 },
  'Mediano anegamiento':{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.35, weight: 2 },
  'Menor anegamiento':  { color: '#facc15', fillColor: '#facc15', fillOpacity: 0.30, weight: 2 },
}
const DEFAULT_ZONE_STYLE = { color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.3, weight: 2 }

// ─── Colores por key para GeoJSON genérico ───────────────────────────────────
const LAYER_COLORS = {
  comunas: { color: '#0ea5e9', fillColor: '#0ea5e9', fillOpacity: 0.15, weight: 2 },
}

// ─── Emojis por key ──────────────────────────────────────────────────────────
const EMOJIS = {
  hospitales:                 '🏥',
  farmacias:                  '💊',
  cuarteles:                  '🚒',
  'comisarias-federal':       '👮',
  'comisarias-metropolitana': '👮',
  comunas:                    '🗺️',
}

// ─── Ícono emoji div ─────────────────────────────────────────────────────────
function createEmojiIcon(emoji) {
  return L.divIcon({
    html: `<div style="font-size:22px;line-height:1;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.5))">${emoji}</div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  })
}

// ─── Parsear geometría KML-like de zonas inundables ──────────────────────────
function parseKMLCoords(coordStr) {
  return coordStr
    .split('|||')
    .map(pair => {
      const [lng, lat] = pair.trim().split(',').map(Number)
      return isNaN(lat) || isNaN(lng) ? null : [lat, lng]
    })
    .filter(Boolean)
}

function kmlGeometryToGeoJSON(geometryStr, afectacion) {
  try {
    // Extraer outer boundary
    const outerMatch = geometryStr.match(/<outerBoundaryIs>[\s\S]*?<coordinates>([\s\S]*?)<\/coordinates>/)
    if (!outerMatch) return null
    const outerCoords = parseKMLCoords(outerMatch[1])
    if (outerCoords.length < 3) return null

    // Extraer inner boundaries (huecos)
    const innerMatches = [...geometryStr.matchAll(/<innerBoundaryIs>[\s\S]*?<coordinates>([\s\S]*?)<\/coordinates>/g)]
    const innerRings = innerMatches.map(m => parseKMLCoords(m[1]).map(([lat, lng]) => [lng, lat]))

    const outerRing = outerCoords.map(([lat, lng]) => [lng, lat])

    return {
      type: 'Feature',
      properties: { afectacion },
      geometry: {
        type: 'Polygon',
        coordinates: [outerRing, ...innerRings],
      },
    }
  } catch {
    return null
  }
}

function buildZonasGeoJSON(items) {
  const features = items
    .map(item => kmlGeometryToGeoJSON(item.GEOMETRY, item.AFECTACION))
    .filter(Boolean)
  return { type: 'FeatureCollection', features }
}

// ─── Parsear GEOJSON string de comunas/comisarías ────────────────────────────
function parseGeoJSONField(item) {
  try {
    return typeof item.GEOJSON === 'string'
      ? JSON.parse(item.GEOJSON)
      : typeof item.geojson === 'string'
      ? JSON.parse(item.geojson)
      : null
  } catch { return null }
}

// ─── Extraer coordenadas de un item para markers ─────────────────────────────
function extractLatLng(item) {
  const lat = parseFloat(item.Latitud ?? item.latitude ?? item.lat ?? item.LATITUDE ?? '')
  const lng = parseFloat(item.Longitud ?? item.longitude ?? item.lon ?? item.LONGITUDE ?? '')
  if (!isNaN(lat) && !isNaN(lng)) return [lat, lng]

  // fallback: geojson point
  const gj = parseGeoJSONField(item)
  if (gj?.type === 'Point') return [gj.coordinates[1], gj.coordinates[0]]
  return null
}

// ─── Extraer array de items de la respuesta ──────────────────────────────────
function extractItems(payload) {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.data)) return payload.data
  if (payload.data && !Array.isArray(payload.data)) return [payload.data]
  return []
}

// ─── Filtrar cuarteles/hospitales/comisarías metropolitana por barrio ────────
function filterByBarrio(items, barrio, keyField) {
  if (!barrio || !keyField) return items
  const b = barrio.toLowerCase().trim()
  return items.filter(item => {
    const val = (item[keyField] ?? '').toLowerCase()
    return val.includes(b)
  })
}

// ─── Construir texto del popup según el endpoint ─────────────────────────────
function buildPopupContent(item, key) {
  const fields = []

  // Nombre del establecimiento
  const nombre =
    item.nombre_est || item.nombre || item.dcia || item.Objeto || item.name || ''
  if (nombre) fields.push(`<strong>${nombre}</strong>`)

  // Dirección
  const dir =
    item.Direc_norm || item.direccion || item.domicilio || item.direcc || item.Calle || ''
  if (dir) fields.push(`📍 ${dir}`)

  // Altura/número
  if (item.altura && !dir.includes(item.altura)) fields.push(`Nº ${item.altura}`)

  // Teléfono
  const tel = item.Telefono || item.telefono || item.tel || ''
  if (tel) fields.push(`📞 ${tel}`)

  // Info extra según endpoint
  if (key === 'hospitales') {
    if (item.tipo_espec) fields.push(`🏷️ ${item.tipo_espec}`)
    if (item.guardia)    fields.push(`🚨 Guardia: ${item.guardia}`)
  }
  if (key === 'cuarteles') {
    if (item.tipo)    fields.push(`🏷️ ${item.tipo}`)
    if (item.gestion) fields.push(`Gestión: ${item.gestion}`)
  }
  if (key === 'comisarias-federal' || key === 'comisarias-metropolitana') {
    if (item.barrio)    fields.push(`Barrio: ${item.barrio}`)
    if (item.circunscri) fields.push(`Circunscripción: ${item.circunscri}`)
    if (item.observac)  fields.push(item.observac)
  }
  if (key === 'comunas') {
    if (item.COMUNA)    fields.push(`Comuna: ${item.COMUNA}`)
    if (item.BARRIOS)   fields.push(`Barrio: ${item.BARRIOS}`)
  }

  return fields.join('<br/>')
}

// ─── FlyTo automático ────────────────────────────────────────────────────────
function FlyToBounds({ bounds }) {
  const map = useMap()
  useEffect(() => {
    if (!bounds) return
    try { map.flyToBounds(bounds, { padding: [50, 50], duration: 1.2 }) } catch {}
  }, [bounds, map])
  return null
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function MapComponent({ mapData, onClear }) {
  const initialPosition = [-34.6037, -58.3816]
  const key    = mapData?.key
  const barrio = mapData?.barrio
  const items  = extractItems(mapData?.payload)
  const emoji  = EMOJIS[key] ?? '📍'

  // ── Preparar datos según endpoint ──────────────────────────────────────────

  // 1. ZONAS INUNDABLES — KML → GeoJSON con color por afectación
  let zonasGeoJSON = null
  if (key === 'zonas' && items.length > 0) {
    zonasGeoJSON = buildZonasGeoJSON(items)
  }

  // 2. COMUNAS — geojson string en campo GEOJSON
  let comunasGeoJSON = null
  if (key === 'comunas' && items.length > 0) {
    const features = items.map(item => {
      const gj = parseGeoJSONField(item)
      if (!gj) return null
      return { type: 'Feature', properties: { ...item }, geometry: gj }
    }).filter(Boolean)
    if (features.length > 0) comunasGeoJSON = { type: 'FeatureCollection', features }
  }

  // 3. CUARTELES — traer todos, filtrar por barrio en el campo "dcia"
  let cuartelesItems = []
  if (key === 'cuarteles') {
    cuartelesItems = filterByBarrio(items, barrio, 'dcia')
    // Si no hay coincidencia exacta mostramos todos con aviso
  }
  const cuartelesSinFiltro = key === 'cuarteles' && cuartelesItems.length === 0

  // 4. HOSPITALES — traer todos, filtrar por proximidad geográfica
  //    No tienen campo barrio → mostramos todos con un aviso en el badge
  let hospitalesItems = []
  if (key === 'hospitales') {
    hospitalesItems = items // mostramos todos, el flyTo los encuadra
  }

  // 5. COMISARÍAS METROPOLITANA — filtrar por campo "barrio"
  let comMetItems = []
  if (key === 'comisarias-metropolitana') {
    comMetItems = filterByBarrio(items, barrio, 'barrio')
  }

  // 6. COMISARÍAS FEDERAL y FARMACIAS — ya vienen filtradas por barrio
  let markersItems = []
  if (key === 'farmacias')           markersItems = items
  if (key === 'comisarias-federal')  markersItems = items
  if (key === 'comisarias-metropolitana') markersItems = comMetItems
  if (key === 'cuarteles')           markersItems = cuartelesSinFiltro ? items : cuartelesItems
  if (key === 'hospitales')          markersItems = hospitalesItems

  // ── Calcular bounds para flyTo ─────────────────────────────────────────────
  let bounds = null
  try {
    if (zonasGeoJSON?.features?.length > 0) {
      bounds = L.geoJSON(zonasGeoJSON).getBounds()
    } else if (comunasGeoJSON?.features?.length > 0) {
      bounds = L.geoJSON(comunasGeoJSON).getBounds()
    } else if (markersItems.length > 0) {
      const coords = markersItems.map(extractLatLng).filter(Boolean)
      if (coords.length > 0) bounds = L.latLngBounds(coords)
    }
  } catch {}

  // ── Badge superior ─────────────────────────────────────────────────────────
  const badgeLabel = key
    ? `${emoji} ${key}${barrio ? ` · ${barrio}` : ''}${cuartelesSinFiltro ? ' · mostrando todos' : ''}${key === 'hospitales' ? ' · todos en CABA' : ''}`
    : null

  return (
    <div className="map-container" style={{ position: 'relative' }}>

      {badgeLabel && (
        <div style={styles.badge}>
          <span>{badgeLabel}</span>
          <button style={styles.clearBtn} onClick={onClear} title="Limpiar mapa">✕</button>
        </div>
      )}

      <MapContainer
        center={initialPosition}
        zoom={13}
        scrollWheelZoom={true}
        className="map-content"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {bounds && <FlyToBounds bounds={bounds} />}

        {/* ── ZONAS INUNDABLES — color por afectación ── */}
        {zonasGeoJSON && (
          <GeoJSON
            key={`zonas-${barrio}`}
            data={zonasGeoJSON}
            style={feature => AFECTACION_STYLES[feature.properties.afectacion] ?? DEFAULT_ZONE_STYLE}
            onEachFeature={(feature, layer) => {
              const af = feature.properties.afectacion ?? 'Zona inundable'
              layer.bindPopup(`
                <strong>🌊 Zona inundable</strong><br/>
                <span style="color:${AFECTACION_STYLES[af]?.color ?? '#3b82f6'}">● ${af}</span>
              `)
            }}
          />
        )}

        {/* ── COMUNAS — GeoJSON con popup ── */}
        {comunasGeoJSON && (
          <GeoJSON
            key={`comunas-${barrio}`}
            data={comunasGeoJSON}
            style={LAYER_COLORS.comunas}
            onEachFeature={(feature, layer) => {
              const p = feature.properties
              layer.bindPopup(`
                <strong>🗺️ ${p.BARRIOS ?? barrio}</strong><br/>
                Comuna: ${p.COMUNA ?? '—'}<br/>
                Área: ${p.AREA ? (parseFloat(p.AREA) / 1_000_000).toFixed(2) + ' km²' : '—'}
              `)
            }}
          />
        )}

        {/* ── MARKERS — farmacias, hospitales, comisarías, cuarteles ── */}
        {markersItems.map((item, i) => {
          const pos = extractLatLng(item)
          if (!pos) return null
          return (
            <Marker
              key={`${key}-${item.id ?? item.Id ?? i}`}
              position={pos}
              icon={createEmojiIcon(emoji)}
            >
              <Popup maxWidth={260}>
                <div
                  style={{ fontSize: '13px', lineHeight: '1.6' }}
                  dangerouslySetInnerHTML={{ __html: buildPopupContent(item, key) }}
                />
              </Popup>
            </Marker>
          )
        })}

      </MapContainer>

      {/* ── Leyenda zonas inundables ── */}
      {key === 'zonas' && (
        <div style={styles.legend}>
          <p style={styles.legendTitle}>Nivel de anegamiento</p>
          {Object.entries(AFECTACION_STYLES).map(([label, s]) => (
            <div key={label} style={styles.legendItem}>
              <span style={{ ...styles.legendDot, background: s.color }} />
              {label}
            </div>
          ))}
        </div>
      )}

      {/* ── Aviso cuarteles sin coincidencia ── */}
      {key === 'cuarteles' && cuartelesSinFiltro && (
        <div style={styles.notice}>
          ⚠️ No encontramos cuarteles específicos para <strong>{barrio}</strong>. Mostrando todos los de CABA.
        </div>
      )}

    </div>
  )
}

const styles = {
  badge: {
    position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)',
    zIndex: 1000, background: '#fff', border: '1px solid #e2e8f0',
    borderRadius: '99px', padding: '6px 16px', fontSize: '13px',
    display: 'flex', alignItems: 'center', gap: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)', whiteSpace: 'nowrap',
  },
  clearBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: '13px', color: '#94a3b8', padding: 0, lineHeight: 1,
  },
  legend: {
    position: 'absolute', bottom: '32px', left: '12px', zIndex: 1000,
    background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
    padding: '10px 14px', fontSize: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  legendTitle: { margin: '0 0 6px', fontWeight: 600, fontSize: '12px' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' },
  legendDot: { width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block' },
  notice: {
    position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
    zIndex: 1000, background: '#fef9c3', border: '1px solid #fde047',
    borderRadius: '8px', padding: '8px 14px', fontSize: '13px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)', whiteSpace: 'nowrap',
  },
}
