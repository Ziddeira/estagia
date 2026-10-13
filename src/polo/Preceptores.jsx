import { useState } from 'react';
import { useStore } from '../store.jsx';
import { Cabecalho, Chip } from '../components/ui.jsx';
import { PRECEPTORES } from '../data/seed.js';
import { P, horasPrecMes } from '../lib/calc.js';
import { hojeISO, addDias, fmt, mesAno, nomeMes } from '../lib/date.js';

const ST = {
  aceita: ['Aceita', 'ok'], aguardando: ['Aguardando resposta', 'neutro'], curta: ['Fora da regra: menos de 3 dias', 'erro'],
  silencio: ['Sem resposta: recusa presumida', 'erro'], recusada: ['Recusada', 'erro'], reenviada: ['Nova convocação enviada', 'info']
};

const ETAPAS = [
  ['Abrir chamado', 'Polo', 'início', -18], ['Vaga publicada', 'Sistema de vagas', 'até 1 dia após o chamado', -17],
  ['Contato com o candidato', 'Recrutamento', '2 dias após a publicação', -15], ['Inscrição pelo link', 'Candidato', 'até 1 dia após o contato', -14],
  ['Carta proposta', 'Recrutamento', '1 dia após o link', -13], ['Aceite da proposta', 'Candidato', 'até 1 dia', -12],
  ['Exame admissional', 'Candidato', '12 dias úteis', 0], ['Conta no banco', 'Candidato', '2 dias úteis após o aceite', 2],
  ['Documentos na plataforma', 'Candidato', '4 dias após o aceite', 6], ['Envio do ASO', 'Candidato', 'até 1 dia após o exame', 8],
  ['Validação dos documentos', 'Recrutamento', '1 a 2 dias úteis', 10], ['Admissão na folha', 'Admissão', '3 dias úteis', 13],
  ['Acessos (rede e e-mail)', 'TI', 'até 1 dia após a admissão', 13], ['Mensagem de boas-vindas', 'Pré-onboarding', '2 dias úteis antes', 15]
];

const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Preceptores() {
  const { s, up, toast } = useStore();
  const H = hojeISO();
  const mes = mesAno(H);
  const [valor, setValor] = useState(30);
  const [terco, setTerco] = useState(true);
  let totH = 0, totG = 0;
  const pag = PRECEPTORES.map((p) => {
    const h = horasPrecMes(s.turnos, p.id, mes);
    const base = h * (Number(valor) || 0), dsr = base / 6, fer = (base / 12) * (terco ? 4 / 3 : 1), dec = base / 12, tot = base + dsr + fer + dec;
    totH += h; totG += tot;
    return { p, h, base, dsr, fer, dec, tot };
  });

  return (
    <>
      <Cabecalho titulo="Preceptores" texto="Convocação pelo contrato intermitente, pagamento do mês, contratação e registro no conselho." />

      <section className="card">
        <div><h2>Convocações (CLT, art. 452-A)</h2><p className="apagado" style={{ fontSize: 14, marginTop: 4 }}>Regra mínima: convocar com 3 dias corridos de antecedência. O preceptor tem 1 dia útil para responder; sem resposta, conta como recusa.</p></div>
        <div className="scroll">
          <table className="tbl" style={{ minWidth: 960 }}>
            <thead><tr><th>Preceptor</th><th>Turno</th><th>Enviada</th><th>Antecedência</th><th>Responder até</th><th>Situação</th><th>Ação</th></tr></thead>
            <tbody>
              {s.convocacoes.map((c) => (
                <tr key={c.id}>
                  <td><strong>{P[c.prec].nome}</strong></td>
                  <td className="pequeno">{c.turno.replace(/^(\d{4})-(\d{2})-(\d{2})/, (_, y, m, d) => `${d}/${m}`)}</td>
                  <td className="mono pequeno">{fmt(c.enviada)}</td>
                  <td className={c.antec < 3 ? 'txt-erro' : ''} style={{ fontWeight: 600 }}>{c.antec} dias</td>
                  <td className="mono pequeno">{fmt(c.prazo)}</td>
                  <td><Chip tom={ST[c.st][1]}>{ST[c.st][0]}</Chip></td>
                  <td>{(c.st === 'silencio' || c.st === 'curta' || c.st === 'recusada') && (
                    <button className="btn btn-p" onClick={() => { up((x) => { x.convocacoes.find((y) => y.id === c.id).st = 'reenviada'; }); toast(`Nova convocação para ${P[c.prec].nome}. Se o turno estiver a menos de 3 dias, o sistema sugere outra data ou outro preceptor.`); }}>Convocar de novo</button>
                  )}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 360px' }}>
            <h2 style={{ textTransform: 'none' }}>Pagamento de {nomeMes(H)}</h2>
            <p className="apagado" style={{ fontSize: 14, marginTop: 4 }}>Horas convocadas × valor-hora, mais DSR (1/6), férias proporcionais e 13º proporcional. O check-in serve como prova de presença; o pagamento segue as horas convocadas.</p>
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <label className="campo">Valor-hora (exemplo)<input type="number" min="0" step="0.5" value={valor} onChange={(e) => setValor(e.target.value)} style={{ width: 140 }} /></label>
            <label className="check"><input type="checkbox" checked={terco} onChange={() => setTerco(!terco)} />Incluir 1/3 de férias</label>
          </div>
        </div>
        <div className="alerta-box txt-at">O modelo original do polo não soma o 1/3 sobre as férias. A CLT manda pagar férias proporcionais com acréscimo de 1/3 no intermitente (art. 452-A, §6º). Confirme com o DP.</div>
        <div className="scroll">
          <table className="tbl" style={{ minWidth: 860 }}>
            <thead><tr><th>Preceptor</th><th>Horas</th><th>Horas × valor</th><th>DSR</th><th>Férias</th><th>13º</th><th>Total</th></tr></thead>
            <tbody>
              {pag.map((x) => (
                <tr key={x.p.id} className="mono">
                  <td style={{ fontFamily: 'inherit' }}><strong>{x.p.nome}</strong></td>
                  <td>{x.h}h</td><td>{brl(x.base)}</td><td>{brl(x.dsr)}</td><td>{brl(x.fer)}</td><td>{brl(x.dec)}</td><td><strong>{brl(x.tot)}</strong></td>
                </tr>
              ))}
              <tr><td><strong>Total do polo</strong></td><td className="mono"><strong>{totH}h</strong></td><td colSpan="4"></td><td className="mono"><strong>{brl(totG)}</strong></td></tr>
            </tbody>
          </table>
        </div>
        <button className="btn btn-s" style={{ alignSelf: 'flex-start' }} onClick={() => toast('Planilha da folha gerada (simulação), no formato do cronograma de convocação.')}>Gerar planilha para a folha</button>
      </section>

      <div className="linha-flex">
        <section className="card" style={{ flex: '3 1 520px' }}>
          <div><h2>Contratação em andamento: Bruna Melo (Nutrição)</h2><p className="apagado" style={{ fontSize: 14, marginTop: 4 }}>O fluxo e os prazos da planilha do polo. Cada faculdade configura as próprias etapas.</p></div>
          <div>
            {ETAPAS.map(([nome, quem, prazo, off]) => {
              const dia = addDias(H, off);
              const feito = off < 0, agora = off === 0;
              return (
                <div key={nome} style={{ display: 'grid', gridTemplateColumns: '20px 1.4fr 1fr 1.3fr 64px', gap: 10, alignItems: 'center', padding: '8px 0', borderTop: '1px solid var(--linha-2)' }}>
                  <span aria-hidden="true" style={{ width: 14, height: 14, borderRadius: '50%', background: feito ? 'var(--verde)' : '#fff', border: `2px solid ${feito ? 'var(--verde)' : agora ? '#B8621B' : '#C9D2CD'}` }} />
                  <strong style={{ fontSize: 14 }}>{nome}</strong>
                  <span className="pequeno apagado">{quem}</span>
                  <span className="pequeno apagado">{prazo}</span>
                  <span className={`mono pequeno ${agora ? 'txt-at' : feito ? 'txt-ok' : 'apagado'}`} style={{ fontWeight: 600 }}>{agora ? 'hoje' : fmt(dia)}</span>
                </div>
              );
            })}
          </div>
        </section>
        <section className="card" style={{ flex: '2 1 300px' }}>
          <h2>Registro no conselho</h2>
          {PRECEPTORES.map((p) => (
            <div className="item" key={p.id} style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <div><strong>{p.nome}</strong><div className="pequeno apagado">{p.reg}</div></div>
              {p.id === 'diego' ? <Chip tom="at">Certidão vence em 18 dias</Chip> : <Chip tom="ok">Regular</Chip>}
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
