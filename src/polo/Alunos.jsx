import { useState } from 'react';
import { useStore } from '../store.jsx';
import { Cabecalho, Chip, Barra } from '../components/ui.jsx';
import { CURSOS, GRUPOS } from '../data/seed.js';
import { doc, relPendente, horasAluno } from '../lib/calc.js';

export default function Alunos() {
  const { s, toast, registrar } = useStore();
  const [curso, setCurso] = useState('todos');
  const linhas = [];
  GRUPOS.forEach((g) => {
    if (curso !== 'todos' && g.curso !== curso) return;
    g.alunos.forEach((nome, i) => linhas.push({ g, i, nome }));
  });
  const exportar = () => {
    registrar('Exportação: conferência de horas para o AVA');
    toast('Conferência gerada (simulação): planilha com período, turno e horas por aluno e por cenário, no formato de lançamento do AVA.');
  };
  return (
    <>
      <Cabecalho titulo="Alunos e horas" texto="Horas confirmadas por cenário, conforme a matriz de cada turma. Aluno com documento irregular sai da escala automaticamente." />
      <section className="card">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <label className="campo">Curso
            <select value={curso} onChange={(e) => setCurso(e.target.value)}>
              <option value="todos">Todos os cursos</option>
              {Object.entries(CURSOS).map(([id, c]) => <option key={id} value={id}>{c.nome}</option>)}
            </select>
          </label>
          <button className="btn btn-s" onClick={exportar}>Gerar conferência para o AVA</button>
        </div>
        <div className="scroll">
          <table className="tbl" style={{ minWidth: 1000 }}>
            <thead><tr><th>Aluno</th><th>Curso · matriz</th><th>Horas por cenário</th><th>Documentos</th><th>Relatório semestral</th></tr></thead>
            <tbody>
              {linhas.map(({ g, i, nome }) => {
                const d = doc(g.id, i);
                const rel = relPendente(g.id, i) && !s.relCobrados;
                return (
                  <tr key={`${g.id}${i}`}>
                    <td><strong>{nome}</strong><span className="sub">{g.nome} · turma {g.turma}</span></td>
                    <td>{CURSOS[g.curso].nome}<span className="sub">{CURSOS[g.curso].matriz}</span></td>
                    <td style={{ minWidth: 320 }}>
                      {horasAluno(s, g.id, i).map((c) => (
                        <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 86px', gap: 8, alignItems: 'center', padding: '2px 0' }}>
                          <span className="pequeno">{c.nome}</span>
                          <Barra pct={c.pct} />
                          <span className="mono pequeno" style={{ textAlign: 'right' }}>{c.feito}/{c.meta}h</span>
                        </div>
                      ))}
                    </td>
                    <td>{d ? <Chip tom={d.nivel === 'bloq' ? 'erro' : 'at'}>{d.texto}</Chip> : <Chip tom="ok">Em dia</Chip>}</td>
                    <td>{relPendente(g.id, i) ? <Chip tom={rel ? 'at' : 'info'}>{rel ? 'Pendente' : 'Cobrado'}</Chip> : <Chip tom="ok">Entregue</Chip>}</td>
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
