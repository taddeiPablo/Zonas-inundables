const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Variables para almacenar los datos
let comunas = [];
let zonas = [];

// Cargar datos de CSV al iniciar
function loadComunasData() {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, 'files', 'comunas.csv');
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        comunas.push(row);
      })
      .on('end', () => {
        console.log('✓ Datos de comunas cargados');
        resolve();
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

function loadZonasData() {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, 'files', 'zonas.csv');
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        zonas.push(row);
      })
      .on('end', () => {
        console.log('✓ Datos de zonas cargados');
        resolve();
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

// ============================================
// ENDPOINTS - COMUNAS
// ============================================

// GET /api/comunas - Obtener todas las comunas
app.get('/api/comunas', (req, res) => {
  res.json({
    success: true,
    data: comunas,
    total: comunas.length
  });
});

// GET /api/comunas/:id - Obtener una comuna por ID
app.get('/api/comunas/:id', (req, res) => {
  const id = req.params.id;
  const comuna = comunas.find(c => c.COMUNA === id);
  
  if (!comuna) {
    return res.status(404).json({
      success: false,
      message: 'Comuna no encontrada'
    });
  }
  
  res.json({
    success: true,
    data: comuna
  });
});

// GET /api/comunas/barrio/:nombre - Buscar por nombre de barrio
app.get('/api/comunas/barrio/:nombre', (req, res) => {
  const nombre = req.params.nombre.toUpperCase();
  const resultados = comunas.filter(c => 
    c.BARRIOS.includes(nombre)
  );
  
  res.json({
    success: true,
    data: resultados,
    total: resultados.length
  });
});

// GET /api/comunas/area/mayor - Comunas con mayor área
app.get('/api/comunas/area/mayor', (req, res) => {
  const limit = req.query.limit || 5;
  const sorted = [...comunas].sort((a, b) => {
    return parseFloat(b.AREA) - parseFloat(a.AREA);
  }).slice(0, parseInt(limit));
  
  res.json({
    success: true,
    data: sorted,
    total: sorted.length
  });
});

// ============================================
// ENDPOINTS - ZONAS
// ============================================

// GET /api/zonas - Obtener todas las zonas
app.get('/api/zonas', (req, res) => {
  res.json({
    success: true,
    data: zonas,
    total: zonas.length
  });
});

// GET /api/zonas/sector/:sector - Obtener zonas por sector
app.get('/api/zonas/sector/:sector', (req, res) => {
  const sector = req.params.sector.toUpperCase();
  const resultados = zonas.filter(z => 
    z.SECTOR.toUpperCase().includes(sector)
  );
  
  res.json({
    success: true,
    data: resultados,
    total: resultados.length
  });
});

// GET /api/zonas/afectacion/:tipo - Obtener zonas por tipo de afectación
app.get('/api/zonas/afectacion/:tipo', (req, res) => {
  const tipo = req.params.tipo.toUpperCase();
  const resultados = zonas.filter(z => 
    z.AFECTACION.toUpperCase().includes(tipo)
  );
  
  res.json({
    success: true,
    data: resultados,
    total: resultados.length
  });
});

// GET /api/zonas/afectacion - Obtener todas las afectaciones disponibles
app.get('/api/zonas/afectacion', (req, res) => {
  const afectaciones = [...new Set(zonas.map(z => z.AFECTACION))];
  
  res.json({
    success: true,
    data: afectaciones,
    total: afectaciones.length
  });
});

// ============================================
// ENDPOINTS - ESTADÍSTICAS
// ============================================

// GET /api/estadisticas - Obtener estadísticas generales
app.get('/api/estadisticas', (req, res) => {
  const areaTotal = comunas.reduce((sum, c) => sum + parseFloat(c.AREA || 0), 0);
  const perimetroTotal = comunas.reduce((sum, c) => sum + parseFloat(c.PERIMETRO || 0), 0);
  const afectacionesCount = {};
  
  zonas.forEach(z => {
    afectacionesCount[z.AFECTACION] = (afectacionesCount[z.AFECTACION] || 0) + 1;
  });
  
  res.json({
    success: true,
    data: {
      totalComunas: comunas.length,
      totalZonasAfectadas: zonas.length,
      areaTotal: areaTotal.toFixed(2),
      perimetroTotal: perimetroTotal.toFixed(2),
      tiposAfectacion: afectacionesCount
    }
  });
});

// ============================================
// HEALTH CHECK
// ============================================

// GET /health - Verificar si la API está funcionando
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 - Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

async function startServer() {
  try {
    console.log('Cargando datos...');
    await loadComunasData();
    await loadZonasData();
    
    app.listen(PORT, () => {
      console.log(`\n✓ API iniciada en puerto ${PORT}`);
      console.log(`✓ Base URL: http://localhost:${PORT}`);
      console.log(`\n📋 Endpoints disponibles:`);
      console.log(`   GET /health`);
      console.log(`   GET /api/comunas`);
      console.log(`   GET /api/comunas/:id`);
      console.log(`   GET /api/comunas/barrio/:nombre`);
      console.log(`   GET /api/comunas/area/mayor`);
      console.log(`   GET /api/zonas`);
      console.log(`   GET /api/zonas/sector/:sector`);
      console.log(`   GET /api/zonas/afectacion/:tipo`);
      console.log(`   GET /api/zonas/afectacion`);
      console.log(`   GET /api/estadisticas\n`);
    });
  } catch (error) {
    console.error('Error al iniciar la API:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
