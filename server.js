/**
 * AGROTRACK - Sistema de Gestión Agrícola Campesina
 * Arquitectura: MVC (Model - View - Controller)
 * Ficha SENA ADSO: 2996897
 * Autor: Alexander Castiblanco Piñeros
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a Base de Datos en la nube (MongoDB Atlas)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/agrotrack';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Conectado exitosamente a MongoDB Atlas (Nube)'))
  .catch((err) => console.error('⚠️ Aviso MongoDB Atlas:', err.message));

// 1. Enrutador de la API (DEBE IR ANTES DE LOS ARCHIVOS ESTÁTICOS)
const apiRoutes = require('./routes/apiRoutes');
app.use('/api', apiRoutes);

// 2. Servir la vista (V en MVC) estática y responsiva
app.use(express.static(path.join(__dirname, 'public')));

// 3. Ruta comodín para SPA (Solo para peticiones GET que no sean /api)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Ruta de API no encontrada' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor escuchando en 0.0.0.0 para multi-dispositivo
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor AgroTrack MVC activo en el puerto ${PORT}`);
  console.log(`📱 En tu PC: http://localhost:${PORT}`);
});