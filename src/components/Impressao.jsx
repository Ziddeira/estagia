import { useEffect } from 'react';
import { createPortal } from 'react-dom';

// Documento para imprimir ou salvar em PDF. Na impressão, só ele aparece.
export default function Impressao({ titulo, onFechar, children }) {
  useEffect(() => {
    document.body.classList.add('imprimindo');
    const esc = (e) => { if (e.key === 'Escape') onFechar(); };
    window.addEventListener('keydown', esc);
    return () => { document.body.classList.remove('imprimindo'); window.removeEventListener('keydown', esc); };
  }, [onFechar]);
  return createPortal(
    <div className="impressao-wrap" role="dialog" aria-modal="true" aria-label={titulo}>
      <div className="impressao-barra">
        <strong>{titulo}</strong>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-p" onClick={() => window.print()}>Imprimir ou salvar PDF</button>
          <button className="btn btn-n" onClick={onFechar}>Fechar</button>
        </div>
      </div>
      <div className="folha">{children}</div>
    </div>,
    document.body
  );
}
