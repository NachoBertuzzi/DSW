import { FallbackCoach } from './services/api';

describe('FallbackCoach', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('desvincula al deportista tanto del entrenador como del lado del deportista', () => {
    const coachDni = '201';
    const depDni = '123';

    localStorage.setItem(`coach:${coachDni}:deportistas`, JSON.stringify([
      { id: 'a1', dni: depDni, nombre: 'Ana', notas: [] },
    ]));
    localStorage.setItem(`athlete:${depDni}:coach`, JSON.stringify({ dni: coachDni, nombre: 'Sofía' }));

    FallbackCoach.desvincularDeportista(coachDni, depDni);

    expect(JSON.parse(localStorage.getItem(`coach:${coachDni}:deportistas`) || '[]')).toEqual([]);
    expect(localStorage.getItem(`athlete:${depDni}:coach`)).toBeNull();
  });
});
