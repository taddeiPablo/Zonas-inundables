import MapComponent from './components/MapComponent'
import ZonasBot from './components/ZonasBot_n8n'
import { useMapData } from './hooks/useMapData'
import './App.css'

function App() {
  const { mapData, handleBotData, clearMap } = useMapData()

  return (
    <div className="app">
      <header className="app-header">
        <h1>Zonas inundables y servicios de emergencia en Buenos Aires</h1>
        <p>Sistema de visualización de áreas propensas a inundaciones</p>
      </header>
      <main className="app-main">
        <MapComponent mapData={mapData} onClear={clearMap} />
        <ZonasBot onData={handleBotData} />
      </main>
      <footer className="app-footer">
        <p>&copy; 2024 Zonas Inundables. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}

export default App
