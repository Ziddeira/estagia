import { useState } from 'react';
import { useStore } from '../store.jsx';
import Phone from './Phone.jsx';
import Checkin from './Checkin.jsx';
import { Chip } from '../components/ui.jsx';
import { ATIVIDADES, TURNOS } from '../data/seed.js';
import { G, P, bloqueado, doc, local, cenNome, turnoHojeDe } from '../lib/calc.js';
import { hojeISO, fmt, dow } from '../lib/date.js';
import { textoDistancia } from '../lib/geo.js';

const PREC = 'ana';
const ST_FICHA = { enviada: ['Para conferir', 'at'], ok: ['Confirmada', 'ok'], corrigir: ['Correção pedida', 'erro'] };

export default function AppPreceptor() {
  const { s, up, toast, registrar } = useStore();
  const [aba, setAba] = useState('hoje');
  const [rascunho, setRascunho] = useState(null);
  const [aberta, setAberta] = useState(null);
  const [comentario, setComentario] = useState('');
  const H = hojeISO();
  const t = turnoHojeDe(s, PREC);
  const loc = t ? local(s, t.local) : null;
  const g = t ? G[t.grupo] : null;
  const ck = t?.precCheckin || null;
  const liberado = !!ck && (ck.dentro || ck.manualOk);

  const salvarCheckin = (reg) => {
    up((c) => { c.turnos.find((x) => x.id === t.id).precCheckin = reg; });
    if (reg.saida) { registrar(`${P[PREC].nome} fez check-out em ${loc.nome}`); toast('Check-out registrado.'); }
    else if (reg.manual) { registrar(`${P[PREC].nome} pediu check-in manual ao polo`); toast('Pedido enviado ao polo. Até o polo liberar, a presença dos alunos fica bloqueada.'); }
    else { registrar(`${P[PREC].nome} fez check-in a ${reg.dist} m de ${loc.nome}`); toast(`Check-in registrado a ${reg.dist} m do local.`); }
  };
  const aprovarManual = () => { up((c) => { c.turnos.find((x) => x.id === t.id).precCheckin.manualOk = true; }); toast('Polo liberou o check-in manual (simulação).'); };

  const mapaBase = () => {
    const m = {};
    g.alunos.forEach((_, i) => { const c = t.checkins?.[i]; m[i] = !bloqueado(t.grupo, i) && !!c && (c.dentro || c.manualOk); });
    return m;
  };
  const mapa = t?.pres || rascunho || (t ? mapaBase() : {});
  const marcar = (i, v) => setRascunho({ ...mapa, [i]: v });
  const aprovarAluno = (i) => {
    up((c) => { c.turnos.find((x) => x.id === t.id).checkins[i].manualOk = true; });
    setRascunho({ ...mapa, [i]: true });
    toast(`Check-in manual de ${g.alunos[i]} aceito. Fica registrado com a distância informada.`);
  };
  const confirmar = () => {
    const n = Object.values(mapa).filter(Boolean).length;
    up((c) => { c.turnos.find((x) => x.id === t.id).pres = mapa; });
    setRascunho(null);
    registrar(`${P[PREC].nome} confirmou a presença de ${g.nome} (${n} presentes)`);
    toast(`Presença confirmada: ${n} de ${g.alunos.length}. As horas já aparecem para o polo e para os alunos.`);
  };

  const fichas = t ? g.alunos.map((nome, i) => ({ nome, i, key: `${t.id}:${i}`, f: s.fichas[`${t.id}:${i}`] })).filter((x) => !bloqueado(t.grupo, x.i)) : [];
  const pendFichas = fichas.filter((x) => x.f?.status === 'enviada').length;
  const minhasConv = s.convocacoes.filter((c) => c.prec === PREC);
  const pendConv = minhasConv.filter((c) => c.st === 'aguardando').length;

  const decidirFicha = (x, st) => {
    if (st === 'corrigir' && !comentario.trim()) { toast('Escreva o que o aluno precisa corrigir.', 'erro'); return; }
    up((c) => { c.fichas[x.key] = { ...c.fichas[x.key], status: st, comentario }; });
    registrar(`${P[PREC].nome} ${st === 'ok' ? 'confirmou' : 'pediu correção na'} ficha de ${x.nome}`);
    toast(st === 'ok' ? `Ficha de ${x.nome} confirmada.` : `${x.nome} recebe o pedido de correção no app.`);
    setAberta(null); setComentario('');
  };
  const responderConv = (c, st) => {
    up((x) => { x.convocacoes.find((y) => y.id === c.id).st = st; });
    toast(st === 'aceita' ? 'Convocação aceita. O turno aparece na sua agenda.' : 'Convocação recusada. O polo foi avisado.');
  };

  const titulos = { hoje: 'Turno de hoje', fichas: 'Fichas dos alunos', conv: 'Convocações' };
  const fichaAberta = fichas.find((x) => x.key === aberta);

  return (
    <Phone perfil="Preceptor" titulo={titulos[aba]} sub={`${P[PREC].nome} · ${P[PREC].reg}`} aba={aba} setAba={(a) => { setAba(a); setAberta(null); }}
      abas={[['hoje', 'Hoje'], ['fichas', `Fichas${pendFichas ? ` (${pendFichas})` : ''}`], ['conv', `Convocações${pendConv ? ` (${pendConv})` : ''}`]]}>
      {aba === 'hoje' && (t ? (
        <>
          <div className="pcard" style={{ gap: 4 }}>
            <span className="rot">Hoje · {dow(H)} {fmt(H)}</span>
            <strong style={{ fontSize: 18 }}>{g.nome}</strong>
            <span>{loc.nome} · {cenNome(t.grupo, t.cen)} · {TURNOS[t.turno].hora}</span>
          </div>
          <Checkin local={loc} registro={ck} onSalvar={salvarCheckin} quemAprovaManual="o polo" liberadoManual={!!ck?.manualOk} onSimularAprovacao={aprovarManual} />
          <div className="pcard" style={{ gap: 0 }}>
            <strong style={{ marginBottom: 6 }}>Presença dos alunos</strong>
            {!liberado && !t.pres && <span className="txt-at" style={{ fontSize: 14, fontWeight: 600, paddingBottom: 8 }}>Faça o seu check-in para confirmar a presença dos alunos.</span>}
            {g.alunos.map((nome, i) => {
              const bl = bloqueado(t.grupo, i);
              const c = t.checkins?.[i];
              const presente = !!mapa[i];
              let info = 'Sem check-in';
              let cor = 'txt-at';
              if (bl) { info = `Não convocada: ${doc(t.grupo, i).texto}`; cor = 'txt-erro'; }
              else if (c?.manual) { info = `Pedido manual às ${c.hora}${c.dist != null ? ` · ${textoDistancia(c.dist)} do local` : ''}${c.manualOk ? ' · aceito' : ''}`; cor = c.manualOk ? '' : 'txt-at'; }
              else if (c) { info = `Check-in ${c.hora} · ${textoDistancia(c.dist)} do local${c.saida ? ` · saída ${c.saida}` : ''}`; cor = 'apagado'; }
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 0', borderTop: '1px solid var(--linha-2)' }}>
                  <div><strong>{nome}</strong><div className={`pequeno ${cor}`}>{info}</div></div>
                  {!bl && t.pres && <Chip tom={presente ? 'ok' : 'neutro'}>{presente ? 'Presente' : 'Ausente'}</Chip>}
                  {!bl && !t.pres && liberado && (
                    c?.manual && !c.manualOk
                      ? <div className="duas"><button className="btn btn-p" onClick={() => aprovarAluno(i)}>Aceitar pedido</button><button className="btn btn-n" onClick={() => marcar(i, false)}>Recusar</button></div>
                      : <div className="duas">
                          <button className={`btn ${presente ? 'btn-p' : 'btn-n'}`} aria-pressed={presente} onClick={() => marcar(i, true)}>Presente</button>
                          <button className={`btn ${!presente ? 'btn-g' : 'btn-n'}`} aria-pressed={!presente} onClick={() => marcar(i, false)}>Ausente</button>
                        </div>
                  )}
                </div>
              );
            })}
            {!t.pres && liberado && <button className="btn btn-p btn-grande" style={{ marginTop: 8 }} onClick={confirmar}>Confirmar presença do turno</button>}
            {t.pres && <span className="txt-ok" style={{ fontSize: 14, fontWeight: 600, paddingTop: 8 }}>Presença confirmada. As horas já entraram.</span>}
          </div>
        </>
      ) : <div className="pcard"><strong>Sem turno hoje</strong></div>)}

      {aba === 'fichas' && t && (
        fichaAberta ? (
          <div className="pcard">
            <button className="btn-link" style={{ alignSelf: 'flex-start' }} onClick={() => setAberta(null)}>← Todas as fichas</button>
            <strong style={{ fontSize: 18 }}>{fichaAberta.nome}</strong>
            <span className="pequeno apagado">Enviada às {fichaAberta.f.hora}{t.checkins?.[fichaAberta.i] ? ` · check-in ${t.checkins[fichaAberta.i].hora}` : ''}</span>
            <strong>Atividades informadas</strong>
            {fichaAberta.f.ativ.map((a) => <span key={a} style={{ padding: '6px 0', borderTop: '1px solid var(--linha-2)' }}>{ATIVIDADES.enf[a]}</span>)}
            <strong>Observação do aluno</strong>
            <span style={{ fontSize: 14, background: 'var(--fundo)', padding: 10, borderRadius: 8 }}>{fichaAberta.f.obs || 'Sem observação.'}</span>
            {fichaAberta.f.status === 'enviada' ? (
              <>
                <label className="campo">Comentário (obrigatório para pedir correção)<textarea rows="2" value={comentario} onChange={(e) => setComentario(e.target.value)} /></label>
                <div className="duas">
                  <button className="btn btn-p btn-grande" onClick={() => decidirFicha(fichaAberta, 'ok')}>Confirmar</button>
                  <button className="btn btn-e btn-grande" onClick={() => decidirFicha(fichaAberta, 'corrigir')}>Pedir correção</button>
                </div>
              </>
            ) : <Chip tom={ST_FICHA[fichaAberta.f.status][1]}>{ST_FICHA[fichaAberta.f.status][0]}</Chip>}
          </div>
        ) : (
          <>
            <div className="pcard" style={{ gap: 0 }}>
              <strong style={{ marginBottom: 6 }}>Fichas de hoje</strong>
              {fichas.map((x) => (
                <button key={x.key} disabled={!x.f} onClick={() => setAberta(x.key)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, border: 0, borderTop: '1px solid var(--linha-2)', background: 'none', padding: '12px 0', minHeight: 52, cursor: x.f ? 'pointer' : 'default', textAlign: 'left' }}>
                  <strong style={{ fontWeight: 600 }}>{x.nome}</strong>
                  {x.f ? <Chip tom={ST_FICHA[x.f.status]?.[1] || 'neutro'}>{ST_FICHA[x.f.status]?.[0]}</Chip> : <Chip tom="neutro">Não enviada</Chip>}
                </button>
              ))}
            </div>
            <div className="alerta-box">Confira as fichas nos últimos minutos do turno. Fora do horário convocado, esse tempo vira trabalho a pagar.</div>
            <div className="alerta-box" style={{ background: 'var(--fundo)' }}>A avaliação com nota é só sua e abre no fim do rodízio. A ficha diária não vale nota.</div>
          </>
        )
      )}

      {aba === 'conv' && (
        <>
          {minhasConv.map((c) => (
            <div className="pcard" key={c.id} style={{ gap: 6 }}>
              <strong>{c.turno.replace(/^(\d{4})-(\d{2})-(\d{2})/, (_, y, m, d) => `${d}/${m}`)}</strong>
              <span className="pequeno apagado">Recebida em {fmt(c.enviada)} · {c.antec} dias de antecedência</span>
              {c.st === 'aguardando' ? (
                <>
                  <span className="txt-at" style={{ fontSize: 13, fontWeight: 600 }}>Responder até {fmt(c.prazo)}</span>
                  <div className="duas"><button className="btn btn-p btn-grande" onClick={() => responderConv(c, 'aceita')}>Aceitar</button><button className="btn btn-n btn-grande" onClick={() => responderConv(c, 'recusada')}>Recusar</button></div>
                </>
              ) : <Chip tom={c.st === 'aceita' ? 'ok' : 'erro'}>{c.st === 'aceita' ? 'Aceita' : 'Recusada'}</Chip>}
            </div>
          ))}
          <span className="nota">Pela CLT, sem resposta em 1 dia útil a convocação conta como recusa.</span>
        </>
      )}
    </Phone>
  );
}
