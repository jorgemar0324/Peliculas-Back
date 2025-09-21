const {Schema, model} = require('mongoose');


const MediaSchema = new Schema({
    serial: {
        type: String,
        required: true,
        unique: true
    },
    titulo: {
        type: String,
        required: true,        
    },
    sinopsis: {
        type: String,
        required: true,        
    },
    url : {
        type: String,
        required: true, 
        trim: true,
    }, 
    urlImagen : {
        type: String,
    },
    fechaCreacion: {
        type: Date,
        default: Date.now,
    },
    fechaActualizacion: {
        type: Date,
        default: Date.now,
    },  
    año: {
        type: Number,
        required: true,
        min: [1900, 'El año debe ser mayor o igual a 1900'],
        max: [2100, 'El año debe ser menor o igual a 2100'],
    },
    genero : {
        type: Schema.Types.ObjectId,
        ref: 'Genero',   
        required: true
    },
    director : {
        type: Schema.Types.ObjectId,
        ref: 'Director',    
        required: true
    },
    productora : {
        type: Schema.Types.ObjectId,
        ref: 'Productora',
        required: true
    },
    tipo : {
        type: Schema.Types.ObjectId,
        ref: 'Tipo',
        required: true
    },
    


});

module.exports = model('Media', MediaSchema);