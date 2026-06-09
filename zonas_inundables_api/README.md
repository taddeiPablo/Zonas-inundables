# API Zonas Inundables

Una API REST simple para gestionar datos sobre zonas inundables y comunas en Buenos Aires.

## Requisitos

- Node.js >= 20.0.0
- npm

## Instalación

```bash
npm install
```

## Uso

### Iniciar la API

```bash
npm run dev
```

O en producción:

```bash
npm run build
npm start
```

La API estará disponible en `http://localhost:3000`

## Endpoints

### Health Check

```
GET /health
```

Verifica que la API está funcionando.

### Comunas

#### Obtener todas las comunas

```
GET /api/comunas
```

**Respuesta:**
```json
{
  "success": true,
  "data": [...],
  "total": 15
}
```

#### Obtener una comuna por ID

```
GET /api/comunas/:id
```

Ejemplo: `GET /api/comunas/2`

#### Buscar comunas por barrio

```
GET /api/comunas/barrio/:nombre
```

Ejemplo: `GET /api/comunas/barrio/RECOLETA`

#### Obtener comunas con mayor área

```
GET /api/comunas/area/mayor?limit=5
```

Parámetros:
- `limit` (opcional): Número de resultados (default: 5)

### Zonas Afectadas

#### Obtener todas las zonas

```
GET /api/zonas
```

#### Obtener zonas por sector

```
GET /api/zonas/sector/:sector
```

Ejemplo: `GET /api/zonas/sector/Belgrano`

#### Obtener zonas por tipo de afectación

```
GET /api/zonas/afectacion/:tipo
```

Ejemplo: `GET /api/zonas/afectacion/Mayor%20anegamiento`

#### Obtener tipos de afectación disponibles

```
GET /api/zonas/afectacion
```

### Estadísticas

#### Obtener estadísticas generales

```
GET /api/estadisticas
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "totalComunas": 15,
    "totalZonasAfectadas": 45,
    "areaTotal": "9999999.99",
    "perimetroTotal": "999999.99",
    "tiposAfectacion": {
      "Mayor anegamiento": 20,
      "Mediano anegamiento": 25
    }
  }
}
```

## Estructura de Datos

### Comunas

Campo | Tipo | Descripción
------|------|-------------
BARRIOS | string | Nombre del barrio
PERIMETRO | number | Perímetro en metros
AREA | number | Área en metros cuadrados
COMUNA | number | ID de la comuna
LONGITUDE | number | Longitud geográfica
LATITUDE | number | Latitud geográfica
GEOJSON | string | Coordenadas GeoJSON

### Zonas

Campo | Tipo | Descripción
------|------|-------------
SECTOR | string | Nombre del sector
AFECTACION | string | Tipo de afectación
GEOMETRY | string | Geometría de la zona

## Desarrollo

La API está desarrollada con:

- **Express.js**: Framework web
- **csv-parser**: Lectura de archivos CSV
- **Node.js**: Runtime de JavaScript

## Estructura del Proyecto

```
zonas_inundables_api/
├── app.js              # Aplicación principal
├── package.json        # Dependencias
├── files/
│   ├── comunas.csv     # Datos de comunas
│   └── zonas.csv       # Datos de zonas inundables
└── README.md           # Documentación
```

## Variables de Entorno

- `PORT` (opcional): Puerto en el que escuchar (default: 3000)
- `NODE_ENV` (opcional): Ambiente (development/production)

## Ejemplo de Uso

### Con curl

```bash
# Obtener todas las comunas
curl http://localhost:3000/api/comunas

# Obtener una comuna específica
curl http://localhost:3000/api/comunas/2

# Buscar por barrio
curl http://localhost:3000/api/comunas/barrio/RECOLETA

# Obtener estadísticas
curl http://localhost:3000/api/estadisticas

# Obtener zonas por afectación
curl http://localhost:3000/api/zonas/afectacion/Mayor%20anegamiento
```

### Con JavaScript/Fetch

```javascript
// Obtener todas las comunas
fetch('http://localhost:3000/api/comunas')
  .then(res => res.json())
  .then(data => console.log(data));

// Obtener estadísticas
fetch('http://localhost:3000/api/estadisticas')
  .then(res => res.json())
  .then(data => console.log(data.data.tiposAfectacion));
```

## Licencia

ISC
