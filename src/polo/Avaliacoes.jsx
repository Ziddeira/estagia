import { useState } from 'react';
import { useStore } from '../store.jsx';
import { Cabecalho, Chip, Barra } from '../components/ui.jsx';
import { G } from '../lib/calc.js';
import { RELPEND } from '../data/seed.js';

const CRIT = ['Assiduidade e pontualidade', 'Postura ética e sigilo', 'Habilidade técnica', 'Comunicação com equipe e paciente', 'Biossegurança e uso de EPI'];
const LOCAIS = [['Hospital Municipal', 4.4, 'Equipe acolhedora e muita prática', 23], ['UBS Centro', 4.1, 'Bom para aprender visita domiciliar', 15], ['Clínica de Reabilitação', 4.6, 'Preceptora explica tudo com calma', 4], ['Laboratório Vida (fictício)', 3.2, 'Grupo grande demais para a bancada', 9], ['Centro de Imagem Sul (fictício)', 3.8, 'Pouco tempo no equipamento', 4]];
const TERMOS = [['Beatriz Souza', 'Enfermagem'], ['Mariana Costa', 'Enfermagem'], ['Rafael Lima', 'Enfermagem'], ['Thiago Alves', 'Enfermagem'], ['Vitória Santos', 'Fisioterapia']];

export default function Avaliacoes() {
  const { s, up, toast } = useStore();
  const alunos = G.enf1.alunos.filter((_, i) => i !== 4);
  const [aluno, setAluno] = useState(alunos[0]);
  const notas = s.avaliacoes[aluno] || {};
  const vals = Object.values(notas);
  const media = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1).replace('.', ',') : '—';
  const faltam = CRIT.length - vals.length;
  const dar = (ci, v) => up((c) => { c.avaliacoes[aluno] = { ...(c.avaliacoes[aluno] || {}), [ci]: v }; });

  return (
    <>
      <Cabecalho titulo="Avaliações e relatórios" texto="O preceptor avalia o aluno, o aluno avalia o local, e o sistema cobra os relatórios da Lei 11.788 e gera o termo de realização." />
      <div className="linha-flex">
        <section className="card" style={{ flex: '3 1 520px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, alignItems: 'flex-end' }}>
            <div><h2>Avaliação do aluno no fim do rodízio</h2><p className="apagado" style={{ fontSize: 14, marginTop: 4 }}>Só o preceptor dá nota. A ficha diária de acompanhamento não vale nota.</p></div>
            <label className="campo">Aluno<select value={aluno} onChange={(e) => setAluno(e.target.value)}>{alunos.map((a) => <option key={a}>{a}</option>)}</select></label>
          </div>
          {CRIT.map((nome, ci) => (
            <div className="item" key={nome} style={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <strong style={{ flex: '1 1 220px' }}>{nome}</strong>
              <div role="group" aria-label={nome} style={{ display: 'flex', gap: 6 }}>
                {[1, 2, 3, 4, 5].map((v) => <button key={v} aria-pressed={notas[ci] === v} onClick={() => dar(ci, v)} className={`btn ${notas[ci] === v ? 'btn-p' : 'btn-n'}`} style={{ width: 44, padding: 0 }}>{v}</button>)}
              </div>
            </div>
          ))}
          <label className="campo">Parecer do preceptor<textarea rows="3" /></label>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
            <span>Média: <strong className="mono">{media}</strong> <span className="apagado pequeno">{faltam ? `· faltam ${faltam} critérios` : '· ficha completa'}</span></span>
            <button className="btn btn-p" onClick={() => toast(faltam ? 'Preencha todos os critérios antes de assinar.' : `Avaliação de ${aluno} assinada e enviada ao polo (simulação).`, faltam ? 'erro' : 'ok')}>Assinar e enviar</button>
          </div>
        </section>
        <section className="card" style={{ flex: '2 1 340px' }}>
          <h2>Como os alunos avaliam os locais</h2>
          {LOCAIS.map(([l, n, c, q]) => (
            <div className="item" key={l} style={{ flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}><strong>{l}</strong><span className="mono">{String(n).replace('.', ',')}/5</span></div>
              <div style={{ width: '100%' }}><Barra pct={(n / 5) * 100} cor={n < 3.5 ? '#B8621B' : undefined} /></div>
              <span className="pequeno apagado">"{c}" · {q} respostas</span>
            </div>
          ))}
        </section>
      </div>
      <div className="linha-flex">
        <section className="card" style={{ flex: '3 1 480px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
            <div><h2>Relatórios semestrais</h2><p className="apagado" style={{ fontSize: 14, marginTop: 4 }}>A Lei 11.788 exige relatório a cada 6 meses no máximo.</p></div>
            <button className="btn btn-s" disabled={s.relCobrados} onClick={() => { up((c) => { c.relCobrados = true; }); toast(`${RELPEND.length} alunos cobrados por WhatsApp com o link do relatório (simulação).`); }}>Cobrar todos por WhatsApp</button>
          </div>
          {RELPEND.map((k) => { const [gid, i] = k.split(':'); return (
            <div className="item" key={k} style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <div><strong>{G[gid].alunos[i]}</strong><div className="pequeno apagado">{G[gid].nome}</div></div>
              <Chip tom={s.relCobrados ? 'info' : 'at'}>{s.relCobrados ? 'Cobrado hoje' : 'Pendente'}</Chip>
            </div>
          ); })}
        </section>
        <section className="card" style={{ flex: '2 1 340px' }}>
          <div><h2>Termos de realização</h2><p className="apagado" style={{ fontSize: 14, marginTop: 4 }}>Alunos que concluem o estágio no semestre. O termo traz período, horas por cenário, atividades e avaliação.</p></div>
          {TERMOS.map(([n, c]) => <div className="item" key={n} style={{ justifyContent: 'space-between' }}><span>{n}</span><span className="apagado">{c}</span></div>)}
          <button className="btn btn-p" style={{ alignSelf: 'flex-start' }} onClick={() => toast('5 termos de realização gerados e enviados para assinatura do local, da faculdade e do aluno (simulação).')}>Gerar termos para assinatura</button>
        </section>
      </div>
    </>
  );
}
