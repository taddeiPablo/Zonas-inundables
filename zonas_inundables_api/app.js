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
let farmacias = [];
let hospitales = [];
let comisariasFederales = [];
let comisariasMetropolitanas = [];
let cuarteles = [];

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

function loadFarmaciasData() {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, 'files', 'farmacias.csv');
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        farmacias.push(row);
      })
      .on('end', () => {
        console.log('✓ Datos de farmacias cargados');
        resolve();
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

function loadHospitalesData() {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, 'files', 'hospitales.csv');
    fs.createReadStream(filePath)
      .pipe(csv({ separator: ';' }))
      .on('data', (row) => {
        hospitales.push(row);
      })
      .on('end', () => {
        console.log('✓ Datos de hospitales cargados');
        resolve();
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

function loadComisariasFederalesData() {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, 'files', 'comisarias-policia-federal.csv');
    fs.createReadStream(filePath)
      .pipe(csv({ separator: ';' }))
      .on('data', (row) => {
        comisariasFederales.push(row);
      })
      .on('end', () => {
        console.log('✓ Datos de comisarías federales cargados');
        resolve();
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

function loadComisariasMetropolitanasData() {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, 'files', 'comisarias-policia-metropolitana.csv');
    fs.createReadStream(filePath)
      .pipe(csv({ separator: ';' }))
      .on('data', (row) => {
        comisariasMetropolitanas.push(row);
      })
      .on('end', () => {
        console.log('✓ Datos de comisarías metropolitanas cargados');
        resolve();
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

function loadCuartelesData() {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, 'files', 'cuarteles-destacamentos-bomberos-policia-federal.csv');
    fs.createReadStream(filePath)
      .pipe(csv({ separator: ';' }))
      .on('data', (row) => {
        cuarteles.push(row);
      })
      .on('end', () => {
        console.log('✓ Datos de cuarteles cargados');
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
// ENDPOINTS - FARMACIAS
// ============================================

// GET /api/farmacias - Obtener todas las farmacias
app.get('/api/farmacias', (req, res) => {
  res.json({
    success: true,
    data: farmacias,
    total: farmacias.length
  });
});

// GET /api/farmacias/:id - Obtener una farmacia por ID
app.get('/api/farmacias/:id', (req, res) => {
  const id = req.params.id;
  const farmacia = farmacias.find(f => f.Id === id);
  
  if (!farmacia) {
    return res.status(404).json({
      success: false,
      message: 'Farmacia no encontrada'
    });
  }
  
  res.json({
    success: true,
    data: farmacia
  });
});

// GET /api/farmacias/barrio/:barrio - Obtener farmacias por barrio
app.get('/api/farmacias/barrio/:barrio', (req, res) => {
  const barrio = req.params.barrio.toUpperCase();
  const resultados = farmacias.filter(f => 
    f.Barrio.toUpperCase().includes(barrio)
  );
  
  res.json({
    success: true,
    data: resultados,
    total: resultados.length
  });
});

// GET /api/farmacias/comuna/:comuna - Obtener farmacias por comuna
app.get('/api/farmacias/comuna/:comuna', (req, res) => {
  const comuna = req.params.comuna.toUpperCase();
  const resultados = farmacias.filter(f => 
    f.Comuna.toString().includes(comuna)
  );
  
  res.json({
    success: true,
    data: resultados,
    total: resultados.length
  });
});

// ============================================
// ENDPOINTS - HOSPITALES
// ============================================

// GET /api/hospitales - Obtener todos los hospitales
app.get('/api/hospitales', (req, res) => {
  res.json({
    success: true,
    data: hospitales,
    total: hospitales.length
  });
});

// GET /api/hospitales/:id - Obtener un hospital por ID
app.get('/api/hospitales/:id', (req, res) => {
  const id = req.params.id;
  const hospital = hospitales.find(h => h.id === id);
  
  if (!hospital) {
    return res.status(404).json({
      success: false,
      message: 'Hospital no encontrado'
    });
  }
  
  res.json({
    success: true,
    data: hospital
  });
});

// GET /api/hospitales/tipo/:tipo - Obtener hospitales por tipo
app.get('/api/hospitales/tipo/:tipo', (req, res) => {
  const tipo = req.params.tipo.toUpperCase();
  const resultados = hospitales.filter(h => 
    h.tipo.toUpperCase().includes(tipo)
  );
  
  res.json({
    success: true,
    data: resultados,
    total: resultados.length
  });
});

// GET /api/hospitales/especialidad/:especialidad - Obtener hospitales por especialidad
app.get('/api/hospitales/especialidad/:especialidad', (req, res) => {
  const especialidad = req.params.especialidad.toUpperCase();
  const resultados = hospitales.filter(h => 
    h.tipo_espec && h.tipo_espec.toUpperCase().includes(especialidad)
  );
  
  res.json({
    success: true,
    data: resultados,
    total: resultados.length
  });
});

// ============================================
// ENDPOINTS - COMISARÍAS POLICÍA FEDERAL
// ============================================

// GET /api/comisarias-federal - Obtener todas las comisarías federales
app.get('/api/comisarias-federal', (req, res) => {
  res.json({
    success: true,
    data: comisariasFederales,
    total: comisariasFederales.length
  });
});

// GET /api/comisarias-federal/:id - Obtener una comisaría federal por ID
app.get('/api/comisarias-federal/:id', (req, res) => {
  const id = req.params.id;
  const comisaria = comisariasFederales.find(c => c.id === id);
  
  if (!comisaria) {
    return res.status(404).json({
      success: false,
      message: 'Comisaría federal no encontrada'
    });
  }
  
  res.json({
    success: true,
    data: comisaria
  });
});

// GET /api/comisarias-federal/barrio/:barrio - Obtener comisarías federales por barrio
app.get('/api/comisarias-federal/barrio/:barrio', (req, res) => {
  const barrio = req.params.barrio.toUpperCase();
  const resultados = comisariasFederales.filter(c => 
    c.barrio.toUpperCase().includes(barrio)
  );
  
  res.json({
    success: true,
    data: resultados,
    total: resultados.length
  });
});

// GET /api/comisarias-federal/comuna/:comuna - Obtener comisarías federales por comuna
app.get('/api/comisarias-federal/comuna/:comuna', (req, res) => {
  const comuna = req.params.comuna.toUpperCase();
  const resultados = comisariasFederales.filter(c => 
    c.comuna.toString().includes(comuna)
  );
  
  res.json({
    success: true,
    data: resultados,
    total: resultados.length
  });
});

// ============================================
// ENDPOINTS - COMISARÍAS POLICÍA METROPOLITANA
// ============================================

// GET /api/comisarias-metropolitana - Obtener todas las comisarías metropolitanas
app.get('/api/comisarias-metropolitana', (req, res) => {
  res.json({
    success: true,
    data: comisariasMetropolitanas,
    total: comisariasMetropolitanas.length
  });
});

// GET /api/comisarias-metropolitana/:id - Obtener una comisaría metropolitana por ID
app.get('/api/comisarias-metropolitana/:id', (req, res) => {
  const id = req.params.id;
  const comisaria = comisariasMetropolitanas.find(c => c.id === id);
  
  if (!comisaria) {
    return res.status(404).json({
      success: false,
      message: 'Comisaría metropolitana no encontrada'
    });
  }
  
  res.json({
    success: true,
    data: comisaria
  });
});

// GET /api/comisarias-metropolitana/barrio/:barrio - Obtener comisarías metropolitanas por barrio
app.get('/api/comisarias-metropolitana/barrio/:barrio', (req, res) => {
  const barrio = req.params.barrio.toUpperCase();
  const resultados = comisariasMetropolitanas.filter(c => 
    c.barrio.toUpperCase().includes(barrio)
  );
  
  res.json({
    success: true,
    data: resultados,
    total: resultados.length
  });
});

// ============================================
// ENDPOINTS - CUARTELES Y DESTACAMENTOS
// ============================================

// GET /api/cuarteles - Obtener todos los cuarteles/destacamentos
app.get('/api/cuarteles', (req, res) => {
  res.json({
    success: true,
    data: cuarteles,
    total: cuarteles.length
  });
});

// GET /api/cuarteles/:id - Obtener un cuartel/destacamento por ID
app.get('/api/cuarteles/:id', (req, res) => {
  const id = req.params.id;
  const cuartel = cuarteles.find(c => c.id === id);
  
  if (!cuartel) {
    return res.status(404).json({
      success: false,
      message: 'Cuartel/Destacamento no encontrado'
    });
  }
  
  res.json({
    success: true,
    data: cuartel
  });
});

// GET /api/cuarteles/tipo/:tipo - Obtener cuarteles por tipo
app.get('/api/cuarteles/tipo/:tipo', (req, res) => {
  const tipo = req.params.tipo.toUpperCase();
  const resultados = cuarteles.filter(c => 
    c.tipo.toUpperCase().includes(tipo)
  );
  
  res.json({
    success: true,
    data: resultados,
    total: resultados.length
  });
});

// GET /api/cuarteles/gestion/:gestion - Obtener cuarteles por gestión
app.get('/api/cuarteles/gestion/:gestion', (req, res) => {
  const gestion = req.params.gestion.toUpperCase();
  const resultados = cuarteles.filter(c => 
    c.gestion.toUpperCase().includes(gestion)
  );
  
  res.json({
    success: true,
    data: resultados,
    total: resultados.length
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
    await loadFarmaciasData();
    await loadHospitalesData();
    await loadComisariasFederalesData();
    await loadComisariasMetropolitanasData();
    await loadCuartelesData();
    
    app.listen(PORT, () => {
      console.log(`\n✓ API iniciada en puerto ${PORT}`);
      console.log(`✓ Base URL: http://localhost:${PORT}`);
      console.log(`\n📋 Endpoints disponibles:`);
      console.log(`\n   Health:`);
      console.log(`   GET /health`);
      console.log(`\n   Comunas:`);
      console.log(`   GET /api/comunas`);
      console.log(`   GET /api/comunas/:id`);
      console.log(`   GET /api/comunas/barrio/:nombre`);
      console.log(`   GET /api/comunas/area/mayor`);
      console.log(`\n   Zonas:`);
      console.log(`   GET /api/zonas`);
      console.log(`   GET /api/zonas/sector/:sector`);
      console.log(`   GET /api/zonas/afectacion/:tipo`);
      console.log(`   GET /api/zonas/afectacion`);
      console.log(`\n   Farmacias:`);
      console.log(`   GET /api/farmacias`);
      console.log(`   GET /api/farmacias/:id`);
      console.log(`   GET /api/farmacias/barrio/:barrio`);
      console.log(`   GET /api/farmacias/comuna/:comuna`);
      console.log(`\n   Hospitales:`);
      console.log(`   GET /api/hospitales`);
      console.log(`   GET /api/hospitales/:id`);
      console.log(`   GET /api/hospitales/tipo/:tipo`);
      console.log(`   GET /api/hospitales/especialidad/:especialidad`);
      console.log(`\n   Comisarías Policía Federal:`);
      console.log(`   GET /api/comisarias-federal`);
      console.log(`   GET /api/comisarias-federal/:id`);
      console.log(`   GET /api/comisarias-federal/barrio/:barrio`);
      console.log(`   GET /api/comisarias-federal/comuna/:comuna`);
      console.log(`\n   Comisarías Policía Metropolitana:`);
      console.log(`   GET /api/comisarias-metropolitana`);
      console.log(`   GET /api/comisarias-metropolitana/:id`);
      console.log(`   GET /api/comisarias-metropolitana/barrio/:barrio`);
      console.log(`\n   Cuarteles y Destacamentos:`);
      console.log(`   GET /api/cuarteles`);
      console.log(`   GET /api/cuarteles/:id`);
      console.log(`   GET /api/cuarteles/tipo/:tipo`);
      console.log(`   GET /api/cuarteles/gestion/:gestion`);
      console.log(`\n   Estadísticas:`);
      console.log(`   GET /api/estadisticas\n`);
    });
  } catch (error) {
    console.error('Error al iniciar la API:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
