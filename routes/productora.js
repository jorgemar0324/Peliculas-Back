const {Router} = require('express');
const Productora = require('../models/Productora');
const {validationResult, check} = require('express-validator');

const router = Router();

// Crear una nueva productora
router.post('/',
    [   
        check('nombre', 'El nombre es obligatorio').not().isEmpty(),
        check('estado', 'El estado es obligatorio').not().isEmpty().isIn(['activo', 'inactivo']),
        check('descripcion', 'La descripcion es obligatoria').not().isEmpty(),
        check('slogan', 'El slogan es obligatorio').not().isEmpty() 
    ],
    async (req, res) => {   
        const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }       
            try {
            const {nombre, estado, descripcion, slogan} = req.body;  
            let productora = new Productora({nombre, estado, descripcion, slogan});
            await productora.save();
            res.status(201).json(productora);
         }  
            catch (error) {
                console.error(error);
                res.status(500).json({message: 'Error al crear la productora'});
            }   
    }
);  
 
// Obtener todas las productoras
router.get('/', async (req, res) => {
    try {  
          const productoras = await Productora.find();
            res.json(productoras);
    }       
    catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error al obtener las productoras'});
    }           
});

// Obtener productora por id
router.get('/:id', async (req, res) => {
    try {
        const {id} = req.params;    
        const productora = await Productora.findById(id);
        if (!productora) {
            return res.status(404).json({message: 'Productora no encontrada'});
        }
        res.json(productora);
    }   
    catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error al obtener la productora'});
    }
}); 


// Editar una productora por id 
router.put('/:id',
    [
        check('nombre', 'El nombre es obligatorio').not().isEmpty(),    
        check('estado', 'El estado es obligatorio').not().isEmpty().isIn(['activo', 'inactivo']),
        check('descripcion', 'La descripcion es obligatoria').not().isEmpty(),
        check('slogan', 'El slogan es obligatorio').not().isEmpty()
    ],  
    async (req, res) => {
        const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }
            try {
            const {id} = req.params;
            const {nombre, estado, descripcion, slogan} = req.body;
            let productora = await Productora.findByIdAndUpdate(
                req.params.id,
                {nombre, estado, descripcion,slogan, fechaActualizacion: Date.now()},
                {new: true}
            );  
            if (!productora) {
                return res.status(404).json({message: 'Productora no encontrada'});
            }
            
            res.json(productora);
        }   
            catch (error) {
                console.error(error);
                res.status(500).json({message: 'Error al actualizar la productora'});
            }
    }
);

// Eliminar una productora por id
router.delete('/:id', async (req, res) => {
    try {
        const {id} = req.params;
        let productora = await Productora.findById(id);
        if (!productora) {
            return res.status(404).json({message: 'Productora no encontrada'});
        }
        await Productora.findByIdAndDelete(id);   
        res.json({message: 'Productora eliminada'});
    }
    catch (error) {

        console.error(error);
        res.status(500).json({message: 'Error al eliminar la productora'});
    }
}); 



module.exports = router;
