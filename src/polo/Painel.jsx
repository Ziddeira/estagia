import { Link } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { Cabecalho, Chip } from '../components/ui.jsx';
import { alertas, ordenar, pendentesPresenca, G, P, cenNome, local, bloqueado } from '../lib/calc.js';
import { GRUPOS, RELPEND, TURNOS } from '../data/seed.js';
import { hojeISO, fmt, dow } from '../lib/date.js';

export default function Painel() {
  const { s } = useStore();
  const H = hojeISO();
  const total = GRUPOS.reduce((a, g) => a + g.alunos.length, 0);
  const nBloq = GRUPOS.reduce((a, g) => a + g.alunos.filter((_, i) => bloqueado(g.id, i)).length, 0);
  const pend = pendentesPresenca(s).length;
  const lista = alertas(s);
  const proximos = ordenar(s.turnos).filter((t) => t.data >= H).slice(0, 6);
  const kpis = [
    ['Alunos em campo', total, '5 cursos · 6 grupos', ''],
    ['Bloqueados por documento', nBloq, 'fora da escala até regularizar', nBloq ? 'txt-erro' : 'txt-ok'],
    ['Presenças a confirmar', pend, 'turnos de hoje e anteriores', pend ? 'txt-at' : 'txt-ok'],
    ['Relatórios semestrais', s.relCobrados ? 0 : RELPEND.length, s.relCobrados ? 'cobrados hoje' : 'pendentes', s.relCobrados ? 'txt-ok' : 'txt-at']
  ];
  return (
    <>
      <Cabecalho titulo="Painel do polo" texto="O que está acontecendo nos estágios e o que precisa de ação hoje." />
      <div className="grid-auto">
        {kpis.map(([l, v, n, c]) => (
          <div className="kpi" key={l}>
            <span className="pequeno apagado">{l}</span>
            <span className={`v ${c}`}>{v}</span>
            <span className="pequeno apagado">{n}</span>
          </div>
        ))}
      </div>
      <div className="linha-flex">
        <section className="card" style={{ flex: '3 1 460px' }}>
          <h2>O que precisa da sua atenção</h2>
          <div>
            {lista.map((a, i) => (
              <div className="item" key={i}>
                <Chip tom={a.tom}>{a.tag}</Chip>
                <div style={{ flex: '1 1 260px' }}>
                  <div style={{ fontWeight: 600 }}>{a.titulo}</div>
                  <div className="apagado" style={{ fontSize: 14 }}>{a.texto}</div>
                </div>
                <Link className="btn btn-n" to={a.ir}>{a.acao}</Link>
              </div>
            ))}
          </div>
        </section>
        <section className="card" style={{ flex: '2 1 300px' }}>
          <h2>Próximos turnos</h2>
          <div>
            {proximos.map((t) => (
              <div className="item" key={t.id} style={{ alignItems: 'center' }}>
                <div style={{ flex: '0 0 58px', textAlign: 'center', background: 'var(--verde-claro)', color: 'var(--verde)', borderRadius: 8, padding: '6px 0' }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{t.data === H ? 'Hoje' : dow(t.data)}</div>
                  <div className="mono" style={{ fontWeight: 600 }}>{fmt(t.data)}</div>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{local(s, t.local).nome}</div>
                  <div className="apagado" style={{ fontSize: 14 }}>{cenNome(t.grupo, t.cen)} · {G[t.grupo].nome} · {P[t.prec].nome} · {TURNOS[t.turno].hora}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
