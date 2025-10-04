const {Router} = require('express');
const Genero = require('../models/Genero');
const {validationResult, check} = require('express-validator');
const Media = require('../models/Media');

const router = Router();

// Crear un nuevo genero
router.post('/',
    [
        check('nombre', 'El nombre es obligatorio').not().isEmpty(),
        check('estado', 'El estado es obligatorio').not().isEmpty().isIn(['activo', 'inactivo']),
        check('descripcion', 'La descripcion es obligatoria').not().isEmpty() 
    ],
    async (req, res) => {
        const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }
            try {
            const {nombre, estado, descripcion} = req.body;  
            let genero = new Genero({nombre, estado, descripcion});
            await genero.save();
            res.status(201).json(genero);
         }  
            catch (error) {
                console.error(error);
                res.status(500).json({message: 'Error al crear el genero'});
            }
    }
);  

// Obtener todos los generos
router.get('/', async (req, res) => {
    try {   
        const generos = await Genero.find();    
        res.json(generos);
    }       
    catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error al obtener los generos'});
    }
});

// Obtener productora por id
router.get('/:id', async (req, res) => {
    try {
        const generos = await Genero.findById(req.params.id);
        if (!generos) {
            return res.status(404).json({message: 'Genero no encontrado'});
        }
        res.json(generos);
    }       
    catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error al obtener el genero'});
    }  
    }); 

// Actualizar un genero por ID
router.put('/:id',
    [   
        check('nombre', 'El nombre es obligatorio').not().isEmpty(),
        check('estado', 'El estado es obligatorio').not().isEmpty().isIn(['activo', 'inactivo']),
        check('descripcion', 'La descripcion es obligatoria').not().isEmpty()

    
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        try {

            const {nombre, estado, descripcion} = req.body;
            const genero = await Genero.findByIdAndUpdate(
                req.params.id,
                {nombre, estado, descripcion, fechaActualizacion: Date.now()},
                {new: true}
            );  
            if (!genero) {
                return res.status(404).json({message: 'Genero no encontrado'});
            }
            res.json(genero);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({message: 'Error al actualizar el genero'});
        }   
    }

);

// Eliminar un genero por ID
/*router.delete('/:id', async (req, res) => {
    try {
        const {id} = req.params;
        let genero = await Genero.findById(id);
        if (!genero) {
            return res.status(404).json({message: 'Genero no encontrado'});
        }
        await Genero.findByIdAndDelete(id);
        res.json({message: 'Genero eliminado'});
    }   
    catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error al eliminar el genero'});
    }
}); */

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el género está siendo usado en algún Media
    const mediaConEsteGenero = await Media.findOne({ genero: id });
    
    if (mediaConEsteGenero) {
      return res.status(400).json({ 
        success: false,
        message: 'No se puede eliminar el género porque está siendo usado en uno o más medios',
        //mediaAsociado: mediaConEsteGenero.titulo 
      });
    }

    // Si no está siendo usado, proceder con la eliminación
    const generoEliminado = await Genero.findByIdAndDelete(id);
    
    if (!generoEliminado) {
      return res.status(404).json({ success: false, message: 'Género no encontrado' });
    }

    res.json({ 
      success: true, 
      message: 'Género eliminado correctamente',
      data: generoEliminado 
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


module.exports = router;
