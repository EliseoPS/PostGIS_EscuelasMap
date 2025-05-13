const express = require('express');
const cors = require('cors');
const pool = require('./config_DB');
const app = express();
app.use(cors());

app.get('/puntos', async (req, res) => {
  const tipo = req.query.tipo; 
  const result = await pool.query(`
    SELECT id, 
    nombre, 
    ST_AsGeoJSON(ubicación) AS geom 
    FROM escuelas 
    WHERE categoria = $1
  `, [tipo]);
  
  const geojson = {
    type: "FeatureCollection",
    features: result.rows.map(row => ({
      type: "Feature",
      geometry: JSON.parse(row.geom),
      properties: { id: row.id, nombre: row.nombre }
    }))
  };
  res.json(geojson);
});


// Ejemplo en Node.js con Express
app.get('/poligonos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nombre, color,
        ST_AsGeoJSON(puntos)::json AS geometry
      FROM poligonos
    `);
    
    const features = result.rows.map(row => ({
      type: "Feature",
      geometry: row.geometry,
      properties: {
        nombre: row.nombre,
        color: row.color
      }
    }));

    res.json({
      type: "FeatureCollection",
      features
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener los polígonos");
  }
});

app.listen(3000, () => console.log('Servidor en http://localhost:3000'));


