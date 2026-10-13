import { Link } from 'react-router-dom';

export default function Phone({ perfil, titulo, sub, abas, aba, setAba, children }) {
  return (
    <div className="phone-wrap">
      <div className="phone">
        <header className="phone-head">
          <div className="topo">
            <span className="marca" style={{ fontSize: 20 }}>Estag<span>IA</span></span>
            <span style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--sidebar-apagado)' }}>{perfil}</span>
              <Link to="/">Trocar perfil</Link>
            </span>
          </div>
          <strong style={{ fontSize: 18 }}>{titulo}</strong>
          <span style={{ fontSize: 13, color: 'var(--sidebar-apagado)' }}>{sub}</span>
        </header>
        <div className="phone-body">{children}</div>
        <nav className="phone-tabs" aria-label="Seções" style={{ gridTemplateColumns: `repeat(${abas.length}, minmax(0, 1fr))` }}>
          {abas.map(([id, label]) => (
            <button key={id} className={aba === id ? 'sel' : ''} aria-current={aba === id ? 'page' : undefined} onClick={() => setAba(id)}>{label}</button>
          ))}
        </nav>
      </div>
    </div>
  );
}
