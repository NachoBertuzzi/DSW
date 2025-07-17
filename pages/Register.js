import { useState } from 'react';

function Register({ volver }) {
  const [form, setForm] = useState({
    dni: '',
    nombre: '',
    apellido: '',
    usuario: '',
    contraseña: '',
    altura: '',
    peso: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'dni' || name === 'altura' || name === 'peso' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('http://localhost:3000/api/deportistas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    const data = await res.json();

    if (res.ok) {
      alert('Deportista registrado correctamente');
      volver();
    } else {
      alert(data.mensaje || data.error || 'Error al registrarse');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Registro de Deportista</h2>
      <input type="number" name="dni" placeholder="DNI" value={form.dni} onChange={handleChange} required />
      <input type="text" name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
      <input type="text" name="apellido" placeholder="Apellido" value={form.apellido} onChange={handleChange} required />
      <input type="text" name="usuario" placeholder="Usuario" value={form.usuario} onChange={handleChange} required />
      <input type="password" name="contraseña" placeholder="Contraseña" value={form.contraseña} onChange={handleChange} required />
      <input type="number" name="altura" placeholder="Altura (cm)" value={form.altura} onChange={handleChange} required />
      <input type="number" name="peso" placeholder="Peso (kg)" value={form.peso} onChange={handleChange} required />

      <button type="submit">Registrarse</button>
      <br />
      <button type="button" onClick={volver}>Volver</button>
    </form>
  );
}

export default Register;
