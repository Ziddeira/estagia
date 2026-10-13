import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { Cabecalho, Chip, Barra } from '../components/ui.jsx';
import { CURSOS, GRUPOS, PRECEPTORES, TURNOS, LIMITE_MENSAL } from '../data/seed.js';
import { G, P, chaves, emConflito, horasPrecMes, ordenar, validarTurno, cenNome, local } from '../lib/calc.js';
import { hojeISO, addDias, fmt, dow, mesAno, nomeMes } from '../lib/date.js';

export default function Escala() {
  const { s, up, toast, registrar } = useStore();
  const H = hojeISO();
  const mes = mesAno(H);
  const [f, setF] = useState({ grupo: 'enf1', prec: 'ana', local: 'hm', cen: 'hosp', data: addDias(H, 12), turno: 'mat' });
  const k = chaves(s.turnos);
  const val = validarTurno(s, f);
  const ok = val.erros.length === 0;
  const g = G[f.grupo];
  const cur = CURSOS[g.curso];

  const mudarGrupo = (id) => {
    const ng = G[id];
    setF({ ...f, grupo: id, prec: PRECEPTORES.find((p) => p.curso === ng.curso).id, cen: CURSOS[ng.curso].cen[0].id });
  };

  const adicionar = () => {
    if (!ok) return;
    up((c) => { c.turnos.push({ id: `n${Date.now()}`, ...f, pres: null, precCheckin: null, checkins: {} }); });
    registrar(`Turno criado: ${g.nome} em ${fmt(f.data)}, convocação enviada a ${P[f.prec].nome}`);
    toast(`Turno de ${fmt(f.data)} adicionado. ${P[f.prec].nome} recebe a convocação e tem 1 dia útil para responder.`);
  };

  const remover = (t) => {
    up((c) => { c.turnos = c.turnos.filter((x) => x.id !== t.id); });
    toast(`Turno de ${fmt(t.data)} removido. O preceptor recebe o cancelamento.`);
  };

  const linhas = ordenar(s.turnos);

  return (
    <>
      <Cabecalho titulo="Escala" texto="Quem vai, onde, quando e com quais alunos. O sistema confere as regras antes de salvar." />

      <div className="grid-auto">
        {PRECEPTORES.map((p) => {
          const h = horasPrecMes(s.turnos, p.id, mes);
          const acima = h > LIMITE_MENSAL, perto = !acima && h >= LIMITE_MENSAL * 0.85;
          const cor = acima ? 'var(--erro-fg)' : perto ? '#B8621B' : 'var(--verde)';
          return (
            <div className="card" key={p.id} style={{ gap: 8, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <strong>{p.nome}</strong><span className="pequeno apagado">{CURSOS[p.curso].nome}</span>
              </div>
              <div><span className="mono" style={{ fontSize: 24, fontWeight: 600 }}>{h}h</span> <span className="apagado pequeno">de {LIMITE_MENSAL}h em {nomeMes(H)}</span></div>
              <Barra pct={(h / LIMITE_MENSAL) * 100} cor={cor} />
              <span className={`pequeno ${acima ? 'txt-erro' : perto ? 'txt-at' : 'txt-ok'}`} style={{ fontWeight: 600 }}>
                {acima ? `Passou ${h - LIMITE_MENSAL}h do limite` : `Restam ${LIMITE_MENSAL - h}h no mês`}
              </span>
            </div>
          );
        })}
      </div>

      <section className="card">
        <h2>Novo turno</h2>
        <p className="apagado" style={{ fontSize: 14 }}>Confere: 3 dias de antecedência para convocar (CLT), feriado, conflito de horário, limite de horas do preceptor, limite de alunos do conselho, convênio vigente, área de check-in e documentos dos alunos.</p>
        <div className="form-grid">
          <label className="campo">Grupo de alunos
            <select value={f.grupo} onChange={(e) => mudarGrupo(e.target.value)}>
              {GRUPOS.map((x) => <option key={x.id} value={x.id}>{x.nome} ({x.alunos.length})</option>)}
            </select>
          </label>
          <label className="campo">Preceptor do curso
            <select value={f.prec} onChange={(e) => setF({ ...f, prec: e.target.value })}>
              {PRECEPTORES.filter((p) => p.curso === g.curso).map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </label>
          <label className="campo">Local
            <select value={f.local} onChange={(e) => setF({ ...f, local: e.target.value })}>
              {s.locais.map((l) => <option key={l.id} value={l.id}>{l.nome}</option>)}
            </select>
          </label>
          <label className="campo">Cenário (conta na matriz)
            <select value={f.cen} onChange={(e) => setF({ ...f, cen: e.target.value })}>
              {cur.cen.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </label>
          <label className="campo">Data
            <input type="date" value={f.data} onChange={(e) => setF({ ...f, data: e.target.value })} />
          </label>
          <label className="campo">Turno
            <select value={f.turno} onChange={(e) => setF({ ...f, turno: e.target.value })}>
              {Object.entries(TURNOS).map(([id, t]) => <option key={id} value={id}>{t.label} ({t.hora})</option>)}
            </select>
          </label>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 360px', fontSize: 14, fontWeight: 600 }}>
            {val.erros.map((e) => <span key={e} className="txt-erro">{e}</span>)}
            {val.avisos.map((e) => <span key={e} className="txt-at">{e}</span>)}
            {ok && <span className="txt-ok">Tudo certo. {P[f.prec].nome} ficará com {val.total}h de {LIMITE_MENSAL}h no mês.</span>}
          </div>
          <button className="btn btn-p" disabled={!ok} onClick={adicionar}>Adicionar e convocar</button>
        </div>
      </section>

      <section className="card">
        <h2>Turnos</h2>
        <div className="scroll">
          <table className="tbl" style={{ minWidth: 1000 }}>
            <thead><tr><th>Data</th><th>Turno</th><th>Local · cenário</th><th>Preceptor</th><th>Grupo</th><th>CH</th><th>Status</th><th>Ação</th></tr></thead>
            <tbody>
              {linhas.map((t) => {
                const conf = emConflito(t, k);
                const gg = G[t.grupo];
                let st = ['Agendado', 'neutro'];
                if (t.pres) st = [`Presença: ${Object.values(t.pres).filter(Boolean).length} de ${gg.alunos.length}`, 'ok'];
                else if (t.data === H) st = ['Acontecendo hoje', 'info'];
                else if (t.data < H) st = ['Aguardando presença', 'at'];
                return (
                  <tr key={t.id} className={conf ? 'conflito' : ''}>
                    <td><span className="mono" style={{ fontWeight: 600 }}>{fmt(t.data)}</span> <span className="apagado pequeno">{t.data === H ? 'hoje' : dow(t.data)}</span></td>
                    <td><strong>{TURNOS[t.turno].label}</strong><span className="sub">{TURNOS[t.turno].hora}</span></td>
                    <td>{local(s, t.local).nome}<span className="sub">{cenNome(t.grupo, t.cen)}</span></td>
                    <td>{P[t.prec].nome}</td>
                    <td>{gg.nome}<span className="sub">{gg.alunos.length} alunos</span></td>
                    <td className="mono">{TURNOS[t.turno].ch}h</td>
                    <td><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}><Chip tom={st[1]}>{st[0]}</Chip>{conf && <Chip tom="erro">Conflito</Chip>}</div></td>
                    <td>
                      {t.data <= H && !t.pres && <Link className="btn btn-p" to={`/polo/presenca?turno=${t.id}`}>Ver presença</Link>}
                      {t.data > H && <button className="btn btn-n" onClick={() => remover(t)}>Remover</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
