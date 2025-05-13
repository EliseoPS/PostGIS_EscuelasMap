const express = require('express');
const cors = require('cors');
const pool = require('./config_DB');
const app = express();
app.use(cors());

app.get('/puntos', async (req, res) => {
  try {
    const tipo = req.query.tipo;

    let result;
    if (tipo) {
      // Si hay tipo, filtra por categoría
      result = await pool.query(`
        SELECT id, nombre, categoria, alumnos, area, elevacion, ST_AsGeoJSON(ubicación) AS geom 
        FROM escuelas 
        WHERE categoria = $1
      `, [tipo]);
    } else {
      // Si no hay tipo, trae todos
      result = await pool.query(`
        SELECT id, nombre, categoria, alumnos, area, elevacion, ST_AsGeoJSON(ubicación) AS geom 
        FROM escuelas
      `);
    }

    const geojson = {
      type: "FeatureCollection",
      features: result.rows.map(row => ({
        type: "Feature",
        geometry: JSON.parse(row.geom),
        properties: { id: row.id, nombre: row.nombre, categoria: row.categoria, alumnos: row.alumnos ?? 'No especificado', area: row.area ?? 'No especificado', elevacion: row.elevacion ?? 'No especificado' }
      }))
    };

    res.json(geojson);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener puntos");
  }
});


// Ejemplo en Node.js con Express
app.get('/poligonos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nombre, color,
        ST_AsGeoJSON(puntos)::json AS geometry,
        ST_Area(ST_Transform(puntos, 3857))::numeric(10,2) AS area
      FROM poligonos
    `);
    
    const features = result.rows.map(row => ({
      type: "Feature",
      geometry: row.geometry,
      properties: {
        nombre: row.nombre,
        color: row.color,
        area: row.area
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


