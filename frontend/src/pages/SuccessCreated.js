import React, { useEffect, useState } from 'react';

export default function SuccessCreated({ autoCloseMs = 4500 }) {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('justCreated');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data && typeof data === 'object') {
        setInfo(data);
        // limpiar para que no se repita
        localStorage.removeItem('justCreated');
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!info || !autoCloseMs) return;
    const t = setTimeout(() => setInfo(null), autoCloseMs);
    return () => clearTimeout(t);
  }, [info, autoCloseMs]);

  if (!info) return null;

  const tipoBonito =
    info.tipo === 'entrenador' ? 'Entrenador'
    : info.tipo === 'deportista' ? 'Deportista'
    : 'Usuario';

  return (
    <div style={styles.overlay} role="dialog" aria-modal="true">
      <div style={styles.card}>
        <div style={styles.iconWrap}><span style={styles.check}>✓</span></div>
        <h3 style={{ margin: '8px 0 4px' }}>{tipoBonito} creado exitosamente</h3>
        <p style={{ margin: 0, opacity: 0.85 }}>
          {info?.nombre ? <><strong>{info.nombre}</strong><br/></> : null}
          {info?.email || info?.usuario || ''}
        </p>
        <div style={{ height: 12 }} />
        <button onClick={() => setInfo(null)} style={styles.btnPrimary}>Continuar</button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, padding: 16,
  },
  card: {
    width: '100%', maxWidth: 420, background: '#fff', borderRadius: 16,
    padding: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.2)', textAlign: 'center',
  },
  iconWrap: {
    width: 64, height: 64, borderRadius: '50%', margin: '0 auto 8px',
    background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  check: { fontSize: 34, color: '#2e7d32', lineHeight: 1 },
  btnPrimary: {
    padding: '8px 14px', borderRadius: 10, border: '1px solid #1e88e5',
    background: '#1e88e5', color: '#fff', cursor: 'pointer',
  },
};
