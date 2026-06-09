import { MapContainer, TileLayer, Popup, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './MapComponent.css'

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

export default function MapComponent() {
  // Coordenadas iniciales (ejemplo: América Latina - Argentina)
  const initialPosition = [-34.6037, -58.3816]
  
  // Puntos de ejemplo para marcar en el mapa
  const exampleMarkers = [
    { id: 1, position: [-34.6037, -58.3816], title: 'Buenos Aires, Argentina' },
    { id: 2, position: [-33.8688, -151.2093], title: 'Sydney, Australia' },
    { id: 3, position: [40.7128, -74.0060], title: 'Nueva York, USA' },
  ]

  return (
    <div className="map-container">
      <MapContainer
        center={initialPosition}
        zoom={4}
        scrollWheelZoom={true}
        className="map-content"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {exampleMarkers.map((marker) => (
          <Marker key={marker.id} position={marker.position}>
            <Popup>{marker.title}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
