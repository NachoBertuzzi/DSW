const {
  setEntrenadorDeportista,
  listDeportistasDeCoach,
} = require('../services/asignaciones.service');

exports.putEntrenadorDeportista = async (req, res) => {
  try {
    const depDni = req.params.dni;
    const { entrenadorDni } = req.body || {};
    if (entrenadorDni !== null && entrenadorDni !== undefined && typeof entrenadorDni !== 'string') {
      return res.status(400).json({ mensaje: 'entrenadorDni debe ser string o null' });
    }
    const result = setEntrenadorDeportista(depDni, entrenadorDni ?? null);
    return res.json({ data: result });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ mensaje: 'Error asignando entrenador' });
  }
};

exports.getDeportistasDeEntrenador = async (req, res) => {
  try {
    const coachDni = req.params.dni;
    const dnis = listDeportistasDeCoach(coachDni);
    // si necesitás más datos de deportistas, después lo cruzamos con tu base
    return res.json({ data: dnis.map(dni => ({ dni })) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ mensaje: 'Error listando deportistas del entrenador' });
  }
};
