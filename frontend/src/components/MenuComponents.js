import React from 'react';

export function Card({ title, desc, onClick, className = '' }) {
  return (
    <button
      type="button"
      className={`menu-card ${className}`.trim()}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(event);
      }}
    >
      <div className="card-title">{title}</div>
      <div className="card-desc">{desc}</div>
    </button>
  );
}

export function Back({ onClick, children = '\u2190 Volver' }) {
  return (
    <button type="button" className="btn link" onClick={onClick}>
      {children}
    </button>
  );
}
