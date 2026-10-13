import { useStore } from '../store.jsx';

export function Chip({ tom = 'neutro', children }) {
  return <span className={`chip chip-${tom}`}>{children}</span>;
}

export function Barra({ pct, cor }) {
  return (
    <div className="barra" aria-hidden="true">
      <div style={{ width: `${Math.min(100, pct)}%`, background: cor }} />
    </div>
  );
}

export function Cabecalho({ titulo, texto, children }) {
  return (
    <header className="cab">
      <div>
        <h1>{titulo}</h1>
        {texto && <p>{texto}</p>}
      </div>
      {children || <span className="selo-demo">Demonstração com dados fictícios</span>}
    </header>
  );
}

export function Toast() {
  const { aviso, fecharAviso } = useStore();
  if (!aviso) return null;
  return (
    <div role="status" className={`toast ${aviso.tom === 'erro' ? 'erro' : ''}`} key={aviso.id}>
      <span style={{ whiteSpace: 'pre-line' }}>{aviso.texto}</span>
      <button onClick={fecharAviso} aria-label="Fechar aviso">Fechar</button>
    </div>
  );
}

export const TOM_STATUS = {
  ok: 'ok', at: 'at', erro: 'erro', info: 'info', neutro: 'neutro'
};
