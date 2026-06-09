import MapComponent from './MapComponent'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Zonas Inundables - Visor de Mapas</h1>
        <p>Sistema de visualización de áreas propensas a inundaciones</p>
      </header>
      <main className="app-main">
        <MapComponent />
      </main>
      <footer className="app-footer">
        <p>&copy; 2024 Zonas Inundables. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}

export default App
