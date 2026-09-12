import React from 'react';

function Back({ onClick, children = '\u2190 Volver' }) {
  return (
    <button type="button" className="btn link" onClick={onClick}>
      {children}
    </button>
  );
}

export default Back;