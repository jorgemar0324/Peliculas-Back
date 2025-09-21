const {Schema, model} = require('mongoose');

const TipoSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        unique: true,
        trim: true,
        minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
        maxlength: [50, 'El nombre debe tener como maximo 50 caracteres'],
    },
    descripcion: {
        type: String,
        required : true,
        trim: true,
        minlength: [10, 'La descripcion debe tener al menos 10 caracteres'],
        maxlength: [200, 'La descripcion debe tener como maximo 200 caracteres'],  
    }, 
    fechaCreacion: {
        type: Date,
        default: Date.now,
    },
    fechaActualizacion: {
        type: Date,
        default: Date.now,
    },  
    });


module.exports = model('Tipo', TipoSchema);
  