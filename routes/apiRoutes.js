const express = require('express');
const router = express.Router();

// Importar los modelos existentes
const User = require('../models/User');
const Parcela = require('../models/Parcela');
const Producto = require('../models/Producto');

// ==========================================
// 1. CONTROLADOR DE AUTENTICACIÓN
// ==========================================
router.post('/auth/register', async (req, res) => {
  try {
    const { nombre, email, password, municipio, telefono } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios' });
    }

    const emailLimpio = email.toLowerCase().trim();
    
    // Verificar si ya existe el correo
    const existe = await User.findOne({ email: emailLimpio });
    if (existe) {
      return res.status(400).json({ error: 'Este correo ya se encuentra registrado. Inicia sesión.' });
    }

    const nuevoUsuario = new User({
      nombre: nombre.trim(),
      email: emailLimpio,
      password: password,
      municipio: municipio ? municipio.trim() : 'Viotá',
      telefono: telefono || '3101234567'
    });

    const guardado = await nuevoUsuario.save();
    console.log(`✅ Nuevo productor registrado en MongoDB: ${guardado.nombre} (${guardado.email})`);

    return res.status(201).json({
      message: 'Cuenta creada con éxito en MongoDB Atlas',
      user: {
        id: guardado._id,
        nombre: guardado.nombre,
        email: guardado.email,
        municipio: guardado.municipio
      }
    });
  } catch (err) {
    console.error('⚠️ Error al registrar en MongoDB:', err);
    return res.status(500).json({ error: 'Error del servidor al registrar: ' + (err.message || 'Intente de nuevo') });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Ingresa correo y contraseña' });
    }

    const emailLimpio = email.toLowerCase().trim();

    // 1. Acceso de demostración directo para sustentación SENA
    if (emailLimpio === 'camilo@agrotrack.co' && password === '123456') {
      return res.json({
        message: '¡Bienvenido(a), Camilo Rodríguez!',
        user: {
          id: 'demo-camilo-001',
          nombre: 'Camilo Rodríguez',
          email: 'camilo@agrotrack.co',
          municipio: 'Facatativá'
        }
      });
    }

    // 2. Consulta en MongoDB Atlas
    const usuario = await User.findOne({ email: emailLimpio });
    if (!usuario) {
      return res.status(401).json({ error: 'Usuario o correo no registrado' });
    }

    const esValida = await usuario.comparePassword(password);
    if (!esValida) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    res.json({
      message: `¡Bienvenido(a), ${usuario.nombre}!`,
      user: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        municipio: usuario.municipio
      }
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error al procesar el inicio de sesión' });
  }
});

// ==========================================
// 2. CONTROLADOR DE PARCELAS (CRUD)
// ==========================================
router.get('/parcelas', async (req, res) => {
  try {
    const { usuarioId } = req.query;
    const filtro = usuarioId ? { usuarioId } : {};
    let parcelas = await Parcela.find(filtro).sort({ fechaCreacion: -1 });

    // Si el usuario no tiene parcelas aún, mostrar las parcelas base
    if (parcelas.length === 0 && usuarioId) {
      parcelas = await Parcela.find({ usuarioId: null }).limit(3);
    }

    res.json(parcelas);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener parcelas' });
  }
});

router.post('/parcelas', async (req, res) => {
  try {
    const { nombre, cultivo, hectareas, ubicacion, usuarioId } = req.body;

    let icono = '🌱';
    let diasCosecha = 30;
    if (cultivo && cultivo.includes('Fresa')) { icono = '🍓'; diasCosecha = 5; }
    if (cultivo && cultivo.includes('Tomate')) { icono = '🍅'; diasCosecha = 24; }
    if (cultivo && cultivo.includes('Papa')) { icono = '🥔'; diasCosecha = 12; }
    if (cultivo && cultivo.includes('Café')) { icono = '☕'; diasCosecha = 45; }

    const nueva = new Parcela({
      usuarioId: usuarioId || null,
      nombre,
      cultivo,
      icono,
      hectareas: Number(hectareas) || 1,
      ubicacion,
      progreso: Math.floor(Math.random() * 25) + 15,
      diasCosecha
    });

    const guardada = await nueva.save();
    res.status(201).json(guardada);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear la parcela' });
  }
});

router.post('/parcelas/labor', async (req, res) => {
  try {
    const { parcelaId, labor, detalle } = req.body;
    const parcela = await Parcela.findById(parcelaId);
    if (!parcela) return res.status(404).json({ error: 'Parcela no encontrada' });

    parcela.actividades.unshift({ labor, detalle, fecha: new Date() });
    await parcela.save();
    res.json(parcela);
  } catch (err) {
    res.status(400).json({ error: 'Error al registrar la labor' });
  }
});

// ==========================================
// 3. CONTROLADOR DE PRODUCTOS (MARKETPLACE)
// ==========================================
router.get('/productos', async (req, res) => {
  try {
    const productos = await Producto.find().sort({ fechaPublicacion: -1 });
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

router.post('/productos', async (req, res) => {
  try {
    const { titulo, categoria, precio, cantidad, productor, celular, ubicacion } = req.body;

    let icono = '📦';
    if (categoria === 'Fresa') icono = '🍓';
    if (categoria === 'Tomate') icono = '🍅';
    if (categoria === 'Papa') icono = '🥔';
    if (categoria === 'Café') icono = '☕';

    const nuevo = new Producto({
      titulo,
      categoria,
      icono,
      precio,
      cantidad,
      productor: productor || 'Agricultor AgroTrack',
      celular,
      ubicacion
    });

    const guardado = await nuevo.save();
    res.status(201).json(guardado);
  } catch (err) {
    res.status(400).json({ error: 'Error al publicar el producto' });
  }
});

// ==========================================
// 4. DATOS SEMILLA (SEED)
// ==========================================
router.get('/seed', async (req, res) => {
  try {
    const totalParcelas = await Parcela.countDocuments();
    if (totalParcelas === 0) {
      await Parcela.create([
        {
          nombre: "Parcela Fresa",
          cultivo: "Fresa Albión",
          icono: "🍓",
          hectareas: 0.5,
          ubicacion: "Facatativá, Cundinamarca",
          progreso: 72,
          diasCosecha: 5
        },
        {
          nombre: "Parcela Tomate",
          cultivo: "Tomate Chonto",
          icono: "🍅",
          hectareas: 1.0,
          ubicacion: "Fusagasugá, Cundinamarca",
          progreso: 45,
          diasCosecha: 24
        }
      ]);
    }

    const totalProductos = await Producto.countDocuments();
    if (totalProductos === 0) {
      await Producto.create([
        {
          titulo: "Canastilla Fresa Albión",
          categoria: "Fresa",
          icono: "🍓",
          precio: "$42.000 COP",
          cantidad: "30 canastillas",
          productor: "Camilo Rodríguez",
          celular: "3109876543",
          ubicacion: "Facatativá"
        },
        {
          titulo: "Tomate Chonto Maduro",
          categoria: "Tomate",
          icono: "🍅",
          precio: "$38.000 COP",
          cantidad: "45 canastillas",
          productor: "Jaime Morales",
          celular: "3145554433",
          ubicacion: "Fusagasugá"
        }
      ]);
    }

    res.json({ message: "Datos semilla cargados con éxito en MongoDB Atlas" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SIEMPRE EXPORTAR EL ROUTER
module.exports = router;