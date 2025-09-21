const express = require('express');
const router = express.Router();
const Media = require('../models/Media');
const { validationResult, check } = require('express-validator');

// Crear un nuevo media
router.post('/',
    [
        // Validación para serial
        check('serial', 'El serial es obligatorio').not().isEmpty(),
        check('serial', 'El serial debe tener entre 3 y 50 caracteres').isLength({ min: 3, max: 50 }),
        
        // Validación para título
        check('titulo', 'El título es obligatorio').not().isEmpty(),
        check('titulo', 'El título debe tener entre 2 y 100 caracteres').isLength({ min: 2, max: 100 }),
        
        // Validación para sinopsis
        check('sinopsis', 'La sinopsis es obligatoria').not().isEmpty(),
        check('sinopsis', 'La sinopsis debe tener entre 10 y 500 caracteres').isLength({ min: 10, max: 500 }),
        
        // Validación para URL
        check('url', 'La URL es obligatoria').not().isEmpty(),
        check('url', 'La URL debe tener un formato válido').isURL(),        
        
        // Validación para año
        check('año', 'El año es obligatorio').not().isEmpty(),
        check('año', 'El año debe ser un número entre 1900 y el año actual')
            .isInt({ min: 1900, max: new Date().getFullYear() }),
        
        
        // Validación para referencias (ObjectId)
        check('genero', 'El género es obligatorio y debe ser un ID válido').not().isEmpty().isMongoId(),
        check('director', 'El director es obligatorio y debe ser un ID válido').not().isEmpty().isMongoId(),
        check('productora', 'La productora es obligatoria y debe ser un ID válido').not().isEmpty().isMongoId(),
        check('tipo', 'El tipo es obligatorio y debe ser un ID válido').not().isEmpty().isMongoId()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const {
                serial, titulo, sinopsis, url, urlImagen, año,
                genero, director, productora, tipo
            } = req.body;

            // Verificar si el serial ya existe
            const mediaExistente = await Media.findOne({ serial });
            if (mediaExistente) {
                return res.status(400).json({ 
                    message: 'El serial ya existe en la base de datos' 
                });
            }

            let media = new Media({
                serial, 
                titulo, 
                sinopsis, 
                url, 
                urlImagen, 
                año: parseInt(año),                
                genero, 
                director, 
                productora, 
                tipo
            });

            await media.save();
            
            // Populate para devolver datos completos
            const mediaPopulated = await Media.findById(media._id)
                .populate('genero', 'nombre descripcion')
                .populate('director', 'nombre')
                .populate('productora', 'nombre slogan')
                .populate('tipo', 'nombre descripcion');

            res.status(201).json({
                message: 'Media creado exitosamente',
                data: mediaPopulated
            });
        } catch (error) {
            console.error('Error al crear media:', error);
            res.status(500).json({ 
                message: 'Error al crear el media', 
                error: error.message 
            });
        }
    }
);

// Obtener todos los medias con populate
router.get('/', async (req, res) => {
    try {
        const { genero, director, tipo, page = 1, limit = 10 } = req.query;
        
        // Construir filtro
        const filter = {};        
        if (genero) filter.genero = genero;
        if (director) filter.director = director;
        if (tipo) filter.tipo = tipo;

        const medias = await Media.find(filter)
            .populate('genero', 'nombre descripcion')
            .populate('director', 'nombre')
            .populate('productora', 'nombre slogan')
            .populate('tipo', 'nombre descripcion')
            .sort({ fechaCreacion: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Media.countDocuments(filter);

        res.json({
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            limit: parseInt(limit),
            data: medias
        });
    } catch (error) {
        console.error('Error al obtener medias:', error);
        res.status(500).json({ 
            message: 'Error al obtener los medias', 
            error: error.message 
        });
    }
});

// Obtener un media por ID
router.get('/:id', async (req, res) => {
    try {
        const media = await Media.findById(req.params.id)
            .populate('genero', 'nombre descripcion estado')
            .populate('director', 'nombre estado')
            .populate('productora', 'nombre slogan descripcion estado')
            .populate('tipo', 'nombre descripcion estado');
        
        if (!media) {
            return res.status(404).json({ message: 'Media no encontrado' });
        }
        
        res.json({
            message: 'Media encontrado',
            data: media
        });
    } catch (error) {
        console.error('Error al obtener media:', error);
        res.status(500).json({ 
            message: 'Error al obtener el media', 
            error: error.message 
        });
    }
});

// Obtener medias por género
router.get('/genero/:generoId', async (req, res) => {
    try {
        const { generoId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        
        const medias = await Media.find({ 
            genero: generoId, 
            estado: 'activo' 
        })
        .populate('genero', 'nombre')
        .populate('director', 'nombre')
        .populate('tipo', 'nombre')
        .sort({ titulo: 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

        const total = await Media.countDocuments({ 
            genero: generoId, 
            estado: 'activo' 
        });

        res.json({
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: medias
        });
    } catch (error) {
        console.error('Error al obtener medias por género:', error);
        res.status(500).json({ 
            message: 'Error al obtener medias por género', 
            error: error.message 
        });
    }
});


// Actualizar un media por ID
router.put('/:id',
    [
        // Validaciones opcionales para actualización
        check('serial', 'El serial debe tener entre 3 y 50 caracteres').optional().isLength({ min: 3, max: 50 }),
        check('titulo', 'El título debe tener entre 2 y 100 caracteres').optional().isLength({ min: 2, max: 100 }),
        check('sinopsis', 'La sinopsis debe tener entre 10 y 500 caracteres').optional().isLength({ min: 10, max: 500 }),
        check('url', 'La URL debe tener un formato válido').optional().isURL(),
        check('urlImagen', 'La URL de imagen debe tener un formato válido').optional().isURL(),
        check('año', 'El año debe ser un número entre 1900 y el año actual').optional().isInt({ min: 1900, max: new Date().getFullYear() }),
        check('estado', 'El estado debe ser activo o inactivo').optional().isIn(['activo', 'inactivo']),
        check('genero', 'El género debe ser un ID válido').optional().isMongoId(),
        check('director', 'El director debe ser un ID válido').optional().isMongoId(),
        check('productora', 'La productora debe ser un ID válido').optional().isMongoId(),
        check('tipo', 'El tipo debe ser un ID válido').optional().isMongoId()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            // Verificar si el media existe
            const mediaExistente = await Media.findById(req.params.id);
            if (!mediaExistente) {
                return res.status(404).json({ message: 'Media no encontrado' });
            }

            // Verificar si el nuevo serial ya existe (si se está actualizando)
            if (req.body.serial && req.body.serial !== mediaExistente.serial) {
                const serialExistente = await Media.findOne({ 
                    serial: req.body.serial, 
                    _id: { $ne: req.params.id } 
                });
                if (serialExistente) {
                    return res.status(400).json({ 
                        message: 'El serial ya existe en otro media' 
                    });
                }
            }

            const mediaActualizado = await Media.findByIdAndUpdate(
                req.params.id,
                { 
                    ...req.body, 
                    fechaActualizacion: Date.now(),
                    ...(req.body.año && { año: parseInt(req.body.año) })
                },
                { 
                    new: true, 
                    runValidators: true 
                }
            )
            .populate('genero', 'nombre descripcion')
            .populate('director', 'nombre')
            .populate('productora', 'nombre slogan')
            .populate('tipo', 'nombre descripcion');

            res.json({
                message: 'Media actualizado exitosamente',
                data: mediaActualizado
            });
        } catch (error) {
            console.error('Error al actualizar media:', error);
            res.status(500).json({ 
                message: 'Error al actualizar el media', 
                error: error.message 
            });
        }
    }
);

// Eliminar un media por id
router.delete('/:id', async (req, res) => {
    try {
        const media = await Media.findById(req.params.id);  
        if (!media) {
            return res.status(404).json({ message: 'Media no encontrado' });
        }
        await Media.findByIdAndDelete(req.params.id);
        res.json({ message: 'Media eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar media:', error);
        res.status(500).json({
            message: 'Error al eliminar el media',
            error: error.message
        });
    }
});




module.exports = router;