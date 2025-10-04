const { Router } = require('express');
const Tipo = require('../models/Tipo');
const { validationResult, check } = require('express-validator');
const Media = require('../models/Media');

const router = Router();

// Crear un nuevo tipo
router.post('/',
    [
        check('nombre', 'El nombre es obligatorio').not().isEmpty(),
        check('descripcion', 'La descripcion es obligatoria').not().isEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { nombre, descripcion } = req.body;
            let tipo = new Tipo({ nombre, descripcion });
            await tipo.save();
            res.status(201).json(tipo);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al crear el tipo' });
        }
    });
// Obtener todos los tipos
router.get('/', async (req, res) => {
    try {
        const tipos = await Tipo.find();
        res.json(tipos);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los tipos' });
    }
});

// Obtener tipo por id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const tipo = await Tipo.findById(id);
        if (!tipo) {
            return res.status(404).json({ message: 'Tipo no encontrado' });
        }
        res.json(tipo);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el tipo' });
    }
});

// Actualizar tipo por id
router.put('/:id',
    [
        check('nombre', 'El nombre es obligatorio').not().isEmpty(),
        check('descripcion', 'La descripcion es obligatoria').not().isEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { id } = req.params;
            const { nombre, descripcion } = req.body;
            const tipo = await Tipo.findByIdAndUpdate(
                req.params.id,
                { nombre, descripcion, fechaActualizacion: Date.now() },
                { new: true }
            );
            if (!tipo) {
                return res.status(404).json({ message: 'Tipo no encontrado' });
            }

            res.json(tipo);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al actualizar el tipo' });
        }
    });


router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el género está siendo usado en algún Media
    const mediaConEsteTipo = await Media.findOne({ tipo: id });
    
    if (mediaConEsteTipo) {
      return res.status(400).json({ 
        success: false,
        message: 'No se puede eliminar el tipo porque está siendo usado en uno o más medios',
        //mediaAsociado: mediaConEsteGenero.titulo 
      });
    }

    // Si no está siendo usado, proceder con la eliminación
    const tipoEliminado = await Tipo.findByIdAndDelete(id);
    
    if (!tipoEliminado) {
      return res.status(404).json({ success: false, message: 'Tipo no encontrado' });
    }

    res.json({ 
      success: true, 
      message: 'Tipo eliminado correctamente',
      data: tipoEliminado 
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});




module.exports = router;    
