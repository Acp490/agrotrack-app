const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  telefono: { type: String, default: '3101234567' },
  municipio: { type: String, default: 'Viotá' },
  departamento: { type: String, default: 'Cundinamarca' },
  fechaRegistro: { type: Date, default: Date.now }
});

// Cifrar la contraseña automáticamente antes de guardar en MongoDB Atlas
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Método para comparar contraseña ingresada con el hash guardado
UserSchema.methods.comparePassword = async function (candidata) {
  try {
    return await bcrypt.compare(candidata, this.password);
  } catch (err) {
    return false;
  }
};

module.exports = mongoose.model('User', UserSchema);