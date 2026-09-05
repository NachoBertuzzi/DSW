import React, { useState } from 'react';
import { API_URL } from '../services/api';
import coachAvatar from '../assets/CoreIA.png';
import './CoachChat.css';

function CoachChat() {
  const [abierto, setAbierto] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensajes, setMensajes] = useState([
    { rol: 'asistente', texto: 'Hola. Soy tu asistente deportivo. ¿En qué te puedo ayudar hoy?' },
  ]);

  const enviar = async (event) => {
    event.preventDefault();
    const consulta = mensaje.trim();
    if (!consulta || cargando) return;

    setMensajes((actuales) => [...actuales, { rol: 'usuario', texto: consulta }]);
    setMensaje('');
    setCargando(true);

    try {
      const response = await fetch(`${API_URL}/ia/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensaje: consulta,
          historial: mensajes.slice(-8).map(({ rol, texto }) => ({ rol, texto })),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.mensaje || 'No se pudo consultar al asistente.');
      setMensajes((actuales) => [...actuales, { rol: 'asistente', texto: data.respuesta }]);
    } catch (error) {
      setMensajes((actuales) => [...actuales, { rol: 'error', texto: error.message }]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="coach-chat">
      {abierto && (
        <section className="coach-chat-panel" aria-label="Asistente deportivo">
          <header className="coach-chat-header">
            <img className="coach-chat-avatar" src={coachAvatar} alt="Asistente deportivo" />
            <div>
              <strong>Asistente deportivo</strong>
              <small>Recomendaciones para tu entrenamiento</small>
            </div>
            <button type="button" className="coach-chat-close" onClick={() => setAbierto(false)} aria-label="Cerrar asistente">x</button>
          </header>

          <div className="coach-chat-messages" aria-live="polite">
            {mensajes.map((item, index) => (
              <div key={`${item.rol}-${index}`} className={`coach-chat-message ${item.rol}`}>
                {item.texto}
              </div>
            ))}
            {cargando && <div className="coach-chat-message asistente">Pensando...</div>}
          </div>

          <form className="coach-chat-form" onSubmit={enviar}>
            <div className="coach-chat-compose">
              <textarea
                value={mensaje}
                onChange={(event) => setMensaje(event.target.value)}
                placeholder="Escribí tu consulta..."
                maxLength={1200}
                rows={2}
                aria-label="Consulta para el asistente"
              />
              <button type="submit" className="btn btn-primary" disabled={cargando || !mensaje.trim()} aria-label="Enviar consulta">Enviar</button>
            </div>
            <small className="coach-chat-disclaimer">Orientacion general. Ante dolor, enfermedad o dudas nutricionales, consulta a un profesional.</small>
          </form>
        </section>
      )}

      <button type="button" className="coach-chat-launcher" onClick={() => setAbierto((actual) => !actual)} aria-label={abierto ? 'Cerrar asistente' : 'Abrir asistente'}>
        {abierto ? 'x' : <img src={coachAvatar} alt="Abrir asistente deportivo" />}
      </button>
    </div>
  );
}

export default CoachChat;
