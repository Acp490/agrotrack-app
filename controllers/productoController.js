const Producto = require('../models/Producto');

exports.obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.find().sort({ fechaPublicacion: -1 });
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

exports.crearProducto = async (req, res) => {
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
};