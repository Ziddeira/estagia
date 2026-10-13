import { useState } from 'react';
import { useStore } from '../store.jsx';
import Phone from './Phone.jsx';
import Checkin from './Checkin.jsx';
import { Chip, Barra } from '../components/ui.jsx';
import { ATIVIDADES, TURNOS } from '../data/seed.js';
import { G, P, local, cenNome, horasAluno, ordenar, turnoHojeDoGrupo } from '../lib/calc.js';
import { hojeISO, fmt, dow } from '../lib/date.js';

const GID = 'enf1', IDX = 0;
const ST_FICHA = { enviada: ['Enviada · aguardando a preceptora', 'at'], ok: ['Confirmada pela preceptora', 'ok'], corrigir: ['Correção pedida', 'erro'] };

export default function AppAluno() {
  const { s, up, toast, registrar } = useStore();
  const [aba, setAba] = useState('hoje');
  const H = hojeISO();
  const t = turnoHojeDoGrupo(s, GID);
  const loc = t ? local(s, t.local) : null;
  const meusTurnos = ordenar(s.turnos).filter((x) => x.grupo === GID);
  const corrigir = Object.entries(s.fichas).find(([k, f]) => k.endsWith(`:${IDX}`) && f.status === 'corrigir' && !k.startsWith(`${t?.id}:`));
  const [fichaKey, setFichaKey] = useState(t ? `${t.id}:${IDX}` : null);
  const ficha = fichaKey ? s.fichas[fichaKey] : null;
  const [sel, setSel] = useState(ficha?.ativ || []);
  const [obs, setObs] = useState(ficha?.obs || '');
  const editavel = !ficha || ficha.status === 'corrigir' || ficha.status === 'rascunho';
  const turnoFicha = fichaKey ? s.turnos.find((x) => x.id === fichaKey.split(':')[0]) : null;

  const abrirFicha = (key) => {
    const f = s.fichas[key];
    setFichaKey(key); setSel(f?.ativ || []); setObs(f?.obs || ''); setAba('ficha');
  };

  const salvarCheckin = (reg) => {
    up((c) => { c.turnos.find((x) => x.id === t.id).checkins[IDX] = reg; });
    if (reg.saida) { registrar(`Beatriz Souza fez check-out em ${loc.nome}`); toast('Check-out registrado. As horas entram depois da confirmação da preceptora.'); }
    else if (reg.manual) { registrar(`Beatriz Souza pediu check-in manual (${reg.dist ?? '?'} m do local)`); toast('Pedido enviado à preceptora com a sua localização e o horário.'); }
    else { registrar(`Beatriz Souza fez check-in a ${reg.dist} m de ${loc.nome}`); toast(`Check-in registrado a ${reg.dist} m do local.`); }
  };

  const enviar = () => {
    if (!sel.length) { toast('Marque pelo menos uma atividade antes de enviar.', 'erro'); return; }
    up((c) => { c.fichas[fichaKey] = { ...(c.fichas[fichaKey] || {}), ativ: sel, obs, status: 'enviada', hora: new Date().toTimeString().slice(0, 5), comentario: '' }; });
    registrar(`Beatriz Souza enviou a ficha de acompanhamento de ${fmt(turnoFicha.data)}`);
    toast('Ficha enviada para a preceptora.');
  };

  const meuCk = t?.checkins?.[IDX] || null;
  const titulos = { hoje: 'Hoje', ficha: 'Ficha de acompanhamento', horas: 'Minhas horas', docs: 'Documentos' };

  return (
    <Phone perfil="Aluno" titulo={titulos[aba]} sub="Beatriz Souza · Enfermagem · G1" aba={aba} setAba={setAba} abas={[['hoje', 'Hoje'], ['ficha', 'Ficha'], ['horas', 'Horas'], ['docs', 'Docs']]}>
      {aba === 'hoje' && (
        <>
          {t ? (
            <>
              <div className="pcard" style={{ gap: 4 }}>
                <span className="rot">Hoje · {dow(H)} {fmt(H)}</span>
                <strong style={{ fontSize: 18 }}>{loc.nome}</strong>
                <span>{cenNome(GID, t.cen)} · {TURNOS[t.turno].hora}</span>
                <span className="apagado" style={{ fontSize: 14 }}>Preceptora: {P[t.prec].nome}</span>
              </div>
              <Checkin local={loc} registro={meuCk} onSalvar={salvarCheckin} quemAprovaManual="a preceptora" liberadoManual={!!meuCk?.manualOk} />
              <button className="pcard" style={{ textAlign: 'left', cursor: 'pointer', color: 'inherit' }} onClick={() => abrirFicha(`${t.id}:${IDX}`)}>
                <strong>Ficha de acompanhamento de hoje</strong>
                <span style={{ fontSize: 14 }} className={s.fichas[`${t.id}:${IDX}`] ? `txt-${ST_FICHA[s.fichas[`${t.id}:${IDX}`].status][1]}` : 'txt-at'}>
                  {s.fichas[`${t.id}:${IDX}`] ? ST_FICHA[s.fichas[`${t.id}:${IDX}`].status][0] : 'Ainda não preenchida: marque o que fez e envie até o fim do turno.'}
                </span>
              </button>
              {t.pres && <div className="alerta-box" style={{ background: 'var(--ok-bg)' }}>A preceptora confirmou a sua presença: {t.pres[IDX] ? `${TURNOS[t.turno].ch}h entraram em ${cenNome(GID, t.cen)}.` : 'você ficou como ausente.'}</div>}
            </>
          ) : (
            <div className="pcard"><strong>Sem estágio hoje</strong><span className="apagado">Veja os próximos turnos na aba Horas.</span></div>
          )}
          {corrigir && (
            <button className="alerta-box" style={{ border: 0, textAlign: 'left', cursor: 'pointer' }} onClick={() => abrirFicha(corrigir[0])}>
              <strong className="txt-at">Correção pedida na ficha de {fmt(s.turnos.find((x) => x.id === corrigir[0].split(':')[0]).data)}</strong>
              <div style={{ fontSize: 14 }}>"{corrigir[1].comentario}" · {P.ana.nome}</div>
              <div style={{ fontSize: 13, color: 'var(--verde)', fontWeight: 700, marginTop: 4 }}>Corrigir agora</div>
            </button>
          )}
        </>
      )}

      {aba === 'ficha' && (
        fichaKey && turnoFicha ? (
          <>
            <div className="pcard" style={{ gap: 4 }}>
              <span className="rot">Ficha de {turnoFicha.data === H ? 'hoje' : fmt(turnoFicha.data)}</span>
              <span style={{ fontSize: 14 }}>{local(s, turnoFicha.local).nome} · {cenNome(GID, turnoFicha.cen)}</span>
              {ficha && <Chip tom={ST_FICHA[ficha.status]?.[1] || 'neutro'}>{ST_FICHA[ficha.status]?.[0] || 'Rascunho'}</Chip>}
              {ficha?.status === 'corrigir' && <span className="txt-erro" style={{ fontSize: 14 }}>"{ficha.comentario}"</span>}
            </div>
            <div className="pcard">
              <strong>O que você fez</strong>
              {ATIVIDADES.enf.map((a, i) => (
                <label key={a} className="check"><input type="checkbox" disabled={!editavel} checked={sel.includes(i)} onChange={() => setSel(sel.includes(i) ? sel.filter((x) => x !== i) : [...sel, i])} />{a}</label>
              ))}
            </div>
            <label className="pcard" style={{ fontWeight: 700 }}>O que aprendeu ou observou
              <textarea rows="4" disabled={!editavel} value={obs} onChange={(e) => setObs(e.target.value)} style={{ border: '1px solid #85918B', borderRadius: 10, padding: 10, fontWeight: 400 }} />
              <span className="txt-at" style={{ fontSize: 13 }}>Não escreva nome, leito ou prontuário de paciente.</span>
            </label>
            {editavel && <button className="btn btn-p btn-grande" onClick={enviar}>{ficha?.status === 'corrigir' ? 'Reenviar corrigida' : 'Enviar para a preceptora'}</button>}
          </>
        ) : <div className="pcard">Sem ficha para hoje.</div>
      )}

      {aba === 'horas' && (
        <>
          <div className="pcard">
            <strong>Horas confirmadas por cenário</strong>
            {horasAluno(s, GID, IDX).map((c) => (
              <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{c.nome}</span><span className="mono" style={{ fontWeight: 600 }}>{c.feito}/{c.meta}h</span></div>
                <Barra pct={c.pct} />
              </div>
            ))}
            <span className="nota">Só entram horas com presença confirmada pela preceptora.</span>
          </div>
          <div className="pcard" style={{ gap: 0 }}>
            <strong style={{ marginBottom: 6 }}>Meus turnos</strong>
            {meusTurnos.map((x) => {
              let st = ['Agendado', 'apagado'];
              if (x.pres) st = x.pres[IDX] ? [`Confirmada · ${TURNOS[x.turno].ch}h`, 'txt-ok'] : ['Ausente', 'txt-erro'];
              else if (x.data === H) st = ['Hoje', 'txt-at'];
              else if (x.data < H) st = ['Aguardando preceptora', 'txt-at'];
              return (
                <div key={x.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '8px 0', borderTop: '1px solid var(--linha-2)', fontSize: 14 }}>
                  <span>{fmt(x.data)} · {local(s, x.local).nome}</span><span className={st[1]} style={{ fontWeight: 600 }}>{st[0]}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {aba === 'docs' && (
        <div className="pcard" style={{ gap: 0 }}>
          <strong style={{ marginBottom: 6 }}>Meus documentos</strong>
          {[['Seguro de acidentes', 'válido até o fim do semestre', 'Em dia', 'ok'], ['Carteira de vacinação', 'hepatite B, dT', 'Em dia', 'ok'], ['Termo de compromisso', 'assinado pelas 3 partes', 'Em dia', 'ok'], ['Relatório semestral', 'próximo em breve', 'Pendente', 'at'], ['Integração do hospital', 'concluída', 'Em dia', 'ok']].map(([n, i, st, tom]) => (
            <div key={n} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', padding: '10px 0', borderTop: '1px solid var(--linha-2)' }}>
              <div><strong style={{ fontSize: 14 }}>{n}</strong><div className="pequeno apagado">{i}</div></div><Chip tom={tom}>{st}</Chip>
            </div>
          ))}
          <button className="btn btn-s btn-grande" style={{ marginTop: 10 }} onClick={() => toast('Na versão real, abre a câmera ou os arquivos do celular. O polo confere antes de aceitar.')}>Enviar documento</button>
        </div>
      )}
    </Phone>
  );
}
