const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'db', 'asignaciones.json');

function readStore() {
  try {
    const raw = fs.readFileSync(FILE, 'utf8');
    const data = JSON.parse(raw);
    return data && typeof data === 'object' ? data : { porDeportista: {}, porEntrenador: {} };
  } catch {
    return { porDeportista: {}, porEntrenador: {} };
  }
}

function writeStore(data) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8');
}

function setEntrenadorDeportista(depDni, coachDniOrNull) {
  const data = readStore();

  const dep = String(depDni);
  const oldCoach = data.porDeportista[dep] || null;

  // sacar del entrenador anterior
  if (oldCoach && data.porEntrenador[oldCoach]) {
    data.porEntrenador[oldCoach] = data.porEntrenador[oldCoach].filter(d => String(d) !== dep);
    if (data.porEntrenador[oldCoach].length === 0) delete data.porEntrenador[oldCoach];
  }

  if (coachDniOrNull) {
    const coach = String(coachDniOrNull);
    data.porDeportista[dep] = coach;
    if (!data.porEntrenador[coach]) data.porEntrenador[coach] = [];
    if (!data.porEntrenador[coach].includes(dep)) data.porEntrenador[coach].push(dep);
  } else {
    delete data.porDeportista[dep];
  }

  writeStore(data);
  return { deportistaDni: dep, entrenadorDni: coachDniOrNull ? String(coachDniOrNull) : null };
}

function listDeportistasDeCoach(coachDni) {
  const data = readStore();
  return data.porEntrenador[String(coachDni)] || [];
}

module.exports = {
  setEntrenadorDeportista,
  listDeportistasDeCoach,
};
