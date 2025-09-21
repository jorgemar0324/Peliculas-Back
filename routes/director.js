const {Router} = require('express');
const Director = require('../models/Director');
const {validationResult, check} = require('express-validator');

const router = Router();

// Crear un nuevo director
router.post('/',
    [
        check('nombre', 'El nombre es obligatorio').not().isEmpty(),
        check('estado', 'El estado es obligatorio').not().isEmpty().isIn(['activo', 'inactivo'])
    ],
    async (req, res) => {
        const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }
         try {
            const {nombre, estado, fechaCreacion, fechaActualizacion} = req.body;
            let director = new Director({nombre, estado,fechaCreacion,fechaActualizacion});
            await director.save();
            res.status(201).json(director);
         }
            catch (error) {
                console.error(error);
                res.status(500).json({message: 'Error al crear el director'});
            }
    }
);

// Obtener todos los directores
router.get('/', async (req, res) => {
    try {   
        const directores = await Director.find();
        res.json(directores);
    }   
    catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error al obtener los directores'});
    }
});

// Obtener un director por ID

router.get('/:id', async (req, res) => {
    try {
        const director = await Director.findById(req.params.id);
        if (!director) {
            return res.status(404).json({message: 'Director no encontrado'});
        }
        res.json(director);
    }       
    catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error al obtener el director'});
    }   
}); 
// Actualizar un director por ID
router.put('/:id',
    [
        check('nombre', 'El nombre es obligatorio').not().isEmpty(),
        check('estado', 'El estado es obligatorio').isIn(['activo', 'inactivo'])
    ],  
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        try {

            const {nombre, estado} = req.body;
            const director = await Director.findByIdAndUpdate(
                req.params.id,
                {nombre, estado, fechaActualizacion: Date.now()},
                {new: true}
            );  
            if (!director) {
                return res.status(404).json({message: 'Director no encontrado'});
            }
            res.json(director);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({message: 'Error al actualizar el director'});
        }   
    }
);  
 
// Eliminar un director por ID
router.delete('/:id', async (req, res) => {
    try {
        const director = await Director.findByIdAndDelete(req.params.id);
        if (!director) {
            return res.status(404).json({message: 'Director no encontrado'});
        }   
        res.json({message: 'Director eliminado'});
    }   
    catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error al eliminar el director'});
    }   
   }
);

module.exports = router; 