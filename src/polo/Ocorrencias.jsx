import { useState } from 'react';
import { useStore } from '../store.jsx';
import { Cabecalho, Chip } from '../components/ui.jsx';
import { GRUPOS } from '../data/seed.js';
import { hojeISO, fmtAno } from '../lib/date.js';

const TIPOS = {
  bio: { nome: 'Acidente com material biológico', passos: ['Lavar o local com água e sabão (mucosa: soro fisiológico ou água)', 'Avisar o preceptor e o polo', 'Ir ao serviço de referência para avaliar profilaxia: quanto antes, de preferência nas primeiras 2 horas', 'Registrar a notificação no local de estágio', 'Acionar o seguro de acidentes pessoais', 'Acompanhamento conforme orientação médica'] },
  queda: { nome: 'Queda ou lesão', passos: ['Atendimento no local', 'Avisar o preceptor e o polo', 'Acionar o seguro de acidentes pessoais', 'Registrar no local de estágio', 'Acompanhar o retorno do aluno'] },
  rad: { nome: 'Exposição à radiação fora do esperado', passos: ['Afastar o aluno da área controlada', 'Avisar o supervisor de proteção radiológica do local', 'Enviar o dosímetro para leitura extra', 'Avisar o polo e registrar', 'Acompanhar a orientação do serviço'] },
  conduta: { nome: 'Conduta ou ética', passos: ['Registrar o relato do preceptor', 'Ouvir o aluno', 'Encaminhar à coordenação do curso', 'Registrar a decisão'] }
};

export default function Ocorrencias() {
  const { s, up, toast, registrar } = useStore();
  const todos = GRUPOS.flatMap((g) => g.alunos);
  const [f, setF] = useState({ tipo: 'bio', aluno: todos[0], local: s.locais[0].nome });

  const novo = () => {
    up((c) => { c.ocorrencias.push({ cod: `OC-00${c.ocorrencias.length + 1}`, data: hojeISO(), ...f, feitos: TIPOS[f.tipo].passos.map(() => false) }); });
    registrar(`Ocorrência registrada: ${TIPOS[f.tipo].nome} (${f.aluno})`);
    toast('Ocorrência registrada. O polo e a coordenação do curso foram avisados (simulação).');
  };
  const marcar = (cod, i) => up((c) => { const o = c.ocorrencias.find((x) => x.cod === cod); o.feitos[i] = !o.feitos[i]; });

  return (
    <>
      <Cabecalho titulo="Ocorrências" texto="Acidentes e incidentes no campo de estágio, com o passo a passo de atendimento e o registro para o seguro." />
      <div className="linha-flex">
        <section className="card" style={{ flex: '2 1 340px' }}>
          <h2>Registrar ocorrência</h2>
          <label className="campo">Tipo<select value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })}>{Object.entries(TIPOS).map(([id, t]) => <option key={id} value={id}>{t.nome}</option>)}</select></label>
          <label className="campo">Aluno<select value={f.aluno} onChange={(e) => setF({ ...f, aluno: e.target.value })}>{todos.map((a) => <option key={a}>{a}</option>)}</select></label>
          <label className="campo">Local<select value={f.local} onChange={(e) => setF({ ...f, local: e.target.value })}>{s.locais.map((l) => <option key={l.id}>{l.nome}</option>)}</select></label>
          <label className="campo">O que aconteceu<textarea rows="3" /></label>
          <button className="btn btn-g" onClick={novo}>Registrar e avisar o polo</button>
          <p className="nota">Os passos de atendimento são um exemplo. Cada polo valida o protocolo com o serviço de saúde de referência da sua cidade.</p>
        </section>
        <div style={{ flex: '3 1 480px', display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          {s.ocorrencias.slice().reverse().map((o) => {
            const T = TIPOS[o.tipo];
            const fim = o.feitos.every(Boolean);
            return (
              <article className="card" key={o.cod}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 }}>
                  <div>
                    <span className="mono pequeno apagado">{o.cod} · {fmtAno(o.data)}</span>
                    <h2>{T.nome}</h2>
                    <span style={{ fontSize: 14 }}>{o.aluno} · {o.local}</span>
                  </div>
                  <Chip tom={fim ? 'ok' : 'at'}>{fim ? 'Encerrada' : 'Em acompanhamento'}</Chip>
                </div>
                {T.passos.map((p, i) => (
                  <label key={p} className="check" style={{ borderTop: '1px solid var(--linha-2)', fontSize: 14, color: o.feitos[i] ? 'var(--apagado)' : 'var(--tinta)' }}>
                    <input type="checkbox" checked={!!o.feitos[i]} onChange={() => marcar(o.cod, i)} />{p}
                  </label>
                ))}
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
}
