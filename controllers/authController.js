const User = require('../models/User');

// Registro de Agricultor desde cualquier dispositivo
exports.register = async (req, res) => {
  try {
    const { nombre, email, password, telefono, municipio } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios' });
    }

    const emailNormalizado = email.toLowerCase().trim();
    const usuarioExistente = await User.findOne({ email: emailNormalizado });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'Este correo ya se encuentra registrado. Intenta iniciar sesión.' });
    }

    const nuevoUsuario = new User({
      nombre,
      email: emailNormalizado,
      password,
      telefono: telefono || '3101234567',
      municipio: municipio || 'Facatativá'
    });

    const guardado = await nuevoUsuario.save();
    return res.status(201).json({
      message: 'Cuenta creada exitosamente en MongoDB Atlas',
      user: {
        id: guardado._id,
        nombre: guardado.nombre,
        email: guardado.email,
        municipio: guardado.municipio
      }
    });
  } catch (err) {
    console.error('Error al registrar:', err);
    return res.status(500).json({ error: 'Error en el servidor al registrar cuenta' });
  }
};

// Inicio de Sesión
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Ingrese correo y contraseña' });
    }

    const emailNormalizado = email.toLowerCase().trim();
    const usuario = await User.findOne({ email: emailNormalizado });
    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado con este correo' });
    }

    const esValida = await usuario.comparePassword(password);
    if (!esValida) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    return res.json({
      message: `¡Bienvenido(a), ${usuario.nombre}!`,
      user: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        municipio: usuario.municipio
      }
    });
  } catch (err) {
    console.error('Error al iniciar sesión:', err);
    return res.status(500).json({ error: 'Error al procesar el inicio de sesión' });
  }
};