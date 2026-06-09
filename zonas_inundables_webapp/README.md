# Zonas Inundables - Mapa Interactivo

Una aplicación web moderna construida con React y Leaflet para visualizar y gestionar información sobre zonas inundables.

## Descripción

Este proyecto es un visor de mapas interactivo desarrollado con:
- **React 18** - Librería frontend moderna
- **Vite** - Herramienta de build rápida y moderna
- **Leaflet** - Biblioteca de mapas de código abierto
- **React-Leaflet** - Componentes React para Leaflet

## Características

✅ Mapa interactivo y responsive
✅ Zoom y navegación intuitiva
✅ Marcadores de ejemplo
✅ Popups informativos
✅ Interfaz moderna y profesional
✅ Totalmente funcional y listo para expansión

## Instalación

```bash
# Instalar dependencias
npm install
```

## Uso

### Modo Desarrollo

```bash
npm run dev
```

La aplicación se abrirá automáticamente en `http://localhost:5173`

### Build para Producción

```bash
npm run build
```

Los archivos compilados se generarán en la carpeta `dist/`

### Preview de Producción

```bash
npm run preview
```

## Estructura del Proyecto

```
zonas_inundables_webapp/
├── src/
│   ├── App.jsx              # Componente principal
│   ├── App.css              # Estilos de la aplicación
│   ├── MapComponent.jsx     # Componente del mapa
│   ├── MapComponent.css     # Estilos del mapa
│   ├── main.jsx             # Punto de entrada
│   └── index.css            # Estilos globales
├── public/
├── index.html               # HTML principal
├── vite.config.js           # Configuración de Vite
├── package.json             # Dependencias del proyecto
└── README.md                # Este archivo
```

## Próximos Pasos

Una vez que el chatbot esté completado, se integrará con esta aplicación para:
- Proporcionar consultas inteligentes sobre zonas inundables
- Análisis de datos geoespaciales
- Recomendaciones personalizadas

## Tecnologías Utilizadas

| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| React | 18.2.0 | Framework frontend |
| Vite | 5.0.0 | Build tool |
| Leaflet | 1.9.4 | Mapas interactivos |
| React-Leaflet | 4.2.1 | Integración React-Leaflet |

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o un pull request.

## Licencia

Este proyecto está bajo la licencia MIT.

---

**Nota**: Esta es la versión inicial del proyecto. La integración con API y el chatbot se implementarán en fases posteriores.
