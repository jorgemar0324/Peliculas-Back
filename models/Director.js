const {Schema, model} = require('mongoose');

const DirectorSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        unique: true,
        trim: true,
        minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
        maxlength: [50, 'El nombre debe tener como maximo 50 caracteres'],
    },
    
    estado: {
        type: String,
        required : true,
        enum : { values : ['activo', 'inactivo'], 
                 message : 'El estado deber ser activo o inactivo'
                }, 
        default : 'activo',
    }, 
    fechaCreacion: {
        type: Date,
        default: Date.now,
    },
    fechaActualizacion: {
        type: Date,
        default: Date.now,
    },  
   }, { 
    collection: 'directors'
});



module.exports = model('Director', DirectorSchema);
  