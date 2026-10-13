import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { Cabecalho, Chip } from '../components/ui.jsx';
import { G, P, bloqueado, doc, pendentesPresenca, cenNome, local, ordenar } from '../lib/calc.js';
import { TURNOS } from '../data/seed.js';
import { hojeISO, fmt, dow } from '../lib/date.js';
import { textoDistancia } from '../lib/geo.js';

const FICHA_ST = { enviada: ['Para conferir', 'at'], ok: ['Confirmada', 'ok'], corrigir: ['Correção pedida', 'erro'] };

export default function Presenca() {
  const { s, up, toast, registrar } = useStore();
  const H = hojeISO();
  const [params] = useSearchParams();
  const pend = pendentesPresenca(s);
  const confirmados = ordenar(s.turnos).filter((t) => t.pres).reverse().slice(0, 5);
  const [selId, setSelId] = useState(params.get('turno') || pend[0]?.id || null);
  const sel = s.turnos.find((t) => t.id === selId) || pend[0] || null;
  const [rascunho, setRascunho] = useState({});

  const mapa = (t) => {
    if (rascunho[t.id]) return rascunho[t.id];
    const m = {};
    G[t.grupo].alunos.forEach((_, i) => { m[i] = !bloqueado(t.grupo, i) && !!t.checkins?.[i]?.dentro; });
    return m;
  };

  const confirmar = (t) => {
    const m = mapa(t);
    const n = Object.values(m).filter(Boolean).length;
    up((c) => { c.turnos.find((x) => x.id === t.id).pres = m; });
    registrar(`Polo confirmou presença de ${G[t.grupo].nome} em ${fmt(t.data)} (${n} presentes)`);
    toast(`Presença confirmada pelo polo: ${n} de ${G[t.grupo].alunos.length}. As horas entraram em ${cenNome(t.grupo, t.cen)}.`);
  };

  return (
    <>
      <Cabecalho titulo="Presença" texto="Check-in por geolocalização de alunos e preceptor, dentro da área cadastrada para cada local. O preceptor confirma pelo app; o polo acompanha e resolve exceções." />
      <div className="linha-flex">
        <section className="card" style={{ flex: '1 1 280px' }}>
          <h2>Sem presença confirmada</h2>
          {pend.length === 0 && <span className="txt-ok" style={{ fontWeight: 600 }}>Nenhum turno pendente.</span>}
          {pend.map((t) => (
            <button key={t.id} onClick={() => setSelId(t.id)} className="btn btn-n" style={{ justifyContent: 'flex-start', textAlign: 'left', flexDirection: 'column', alignItems: 'flex-start', padding: '10px 14px', whiteSpace: 'normal', borderColor: sel?.id === t.id ? 'var(--verde)' : undefined, background: sel?.id === t.id ? 'var(--verde-claro)' : undefined }}>
              <span style={{ fontWeight: 700, color: 'var(--tinta)' }}>{t.data === H ? 'Hoje' : `${fmt(t.data)} ${dow(t.data)}`} · {TURNOS[t.turno].label}</span>
              <span className="apagado" style={{ fontWeight: 400 }}>{G[t.grupo].nome} · {local(s, t.local).nome}</span>
            </button>
          ))}
          {confirmados.length > 0 && <h3 style={{ marginTop: 8 }}>Confirmados recentemente</h3>}
          {confirmados.map((t) => (
            <button key={t.id} onClick={() => setSelId(t.id)} className="btn-link" style={{ textAlign: 'left' }}>{fmt(t.data)} · {G[t.grupo].nome}</button>
          ))}
        </section>

        {sel && (
          <section className="card" style={{ flex: '3 1 520px' }}>
            <div>
              <h2>{G[sel.grupo].nome} · {sel.data === H ? 'hoje' : fmt(sel.data)}</h2>
              <p className="apagado" style={{ fontSize: 14 }}>{local(s, sel.local).nome} · {cenNome(sel.grupo, sel.cen)} · {TURNOS[sel.turno].label} {TURNOS[sel.turno].hora}</p>
            </div>
            <div className="alerta-box" style={{ background: sel.precCheckin ? 'var(--ok-bg)' : '#FDF7EC' }}>
              <strong>Preceptor: {P[sel.prec].nome}. </strong>
              {sel.precCheckin
                ? `Check-in às ${sel.precCheckin.hora}, ${textoDistancia(sel.precCheckin.dist)} do local${sel.precCheckin.manual ? ' (liberação manual)' : ''}.`
                : 'Ainda não fez check-in. Sem o check-in dele, a presença dos alunos não pode ser confirmada pelo app.'}
            </div>
            <div className="scroll">
              <table className="tbl" style={{ minWidth: 640 }}>
                <thead><tr><th>Aluno</th><th>Check-in</th><th>Ficha do dia</th><th>Presença</th></tr></thead>
                <tbody>
                  {G[sel.grupo].alunos.map((nome, i) => {
                    const ck = sel.checkins?.[i];
                    const bl = bloqueado(sel.grupo, i);
                    const ficha = s.fichas[`${sel.id}:${i}`];
                    const m = sel.pres || mapa(sel);
                    const presente = !!m[i];
                    return (
                      <tr key={i}>
                        <td><strong>{nome}</strong></td>
                        <td>
                          {bl ? <span className="txt-erro pequeno">Não convocado: {doc(sel.grupo, i).texto}</span>
                            : ck ? <span className={`pequeno ${ck.dentro ? '' : 'txt-at'}`}>{ck.hora} · {textoDistancia(ck.dist)} do local{ck.manual ? ' · pedido manual' : ''}{ck.saida ? ` · saída ${ck.saida}` : ''}</span>
                              : <span className="pequeno txt-at">Sem check-in</span>}
                        </td>
                        <td>{ficha ? <Chip tom={FICHA_ST[ficha.status]?.[1] || 'neutro'}>{FICHA_ST[ficha.status]?.[0] || 'Rascunho'}</Chip> : <span className="pequeno apagado">—</span>}</td>
                        <td>
                          {sel.pres ? <Chip tom={presente ? 'ok' : 'neutro'}>{presente ? 'Presente' : 'Ausente'}</Chip>
                            : !bl && (
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button className={`btn ${presente ? 'btn-p' : 'btn-n'}`} onClick={() => setRascunho({ ...rascunho, [sel.id]: { ...m, [i]: true } })}>Presente</button>
                                <button className={`btn ${!presente ? 'btn-g' : 'btn-n'}`} onClick={() => setRascunho({ ...rascunho, [sel.id]: { ...m, [i]: false } })}>Ausente</button>
                              </div>
                            )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {!sel.pres && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="apagado" style={{ fontSize: 14 }}>
                  {sel.data === H ? 'O preceptor confirma pelo app ao fim do turno. O polo só confirma em exceção.' : 'Turno passado sem confirmação do preceptor: o polo pode confirmar como exceção, e fica registrado.'}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {sel.data === H && <Link className="btn btn-s" to="/preceptor">Abrir app do preceptor</Link>}
                  <button className="btn btn-p" onClick={() => confirmar(sel)}>Confirmar pelo polo</button>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
}
