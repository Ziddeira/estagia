import { useState } from 'react';
import { useStore } from '../store.jsx';
import { Cabecalho, Chip, Barra } from '../components/ui.jsx';
import { CURSOS, GRUPOS } from '../data/seed.js';
import { doc, relPendente, horasAluno } from '../lib/calc.js';
import { lerMatriculas, MODELO_CSV } from '../lib/csv.js';

export default function Alunos() {
  const { s, toast, registrar } = useStore();
  const [curso, setCurso] = useState('todos');
  const [imp, setImp] = useState(null);
  const abrirCsv = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImp({ arquivo: f.name, ...lerMatriculas(await f.text()) });
    e.target.value = '';
  };
  const baixarModelo = () => {
    const url = URL.createObjectURL(new Blob(['\uFEFF' + MODELO_CSV], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'modelo-matriculas.csv'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const linhas = [];
  GRUPOS.forEach((g) => {
    if (curso !== 'todos' && g.curso !== curso) return;
    g.alunos.forEach((nome, i) => linhas.push({ g, i, nome }));
  });
  const exportar = () => {
    registrar('Exportação: conferência de horas para o AVA');
    toast('Conferência gerada (simulação): planilha com período, turno e horas por aluno e por cenário, no formato de lançamento do AVA.');
  };
  const nSaude = imp && !imp.erro ? Object.values(imp.porCurso).reduce((a, n) => a + n, 0) : 0;
  return (
    <>
      <Cabecalho titulo="Alunos e horas" texto="Horas confirmadas por cenário, conforme a matriz de cada turma. Aluno com documento irregular sai da escala automaticamente." />
      <section className="card">
        <div><h2>Importar alunos do relatório de matrícula</h2><p className="apagado" style={{ fontSize: 14, marginTop: 4 }}>Baixe o relatório de matrícula em CSV no sistema da instituição, com as situações pré-confirmada (novos), ativa (veteranos) e formando. O EstagIA separa os cursos da saúde. Só precisa de nome, RA, curso, semestre e situação: não envie CPF nem dados de saúde.</p></div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <label className="btn btn-p" style={{ cursor: 'pointer' }}>Escolher arquivo CSV<input type="file" accept=".csv,text/csv" onChange={abrirCsv} style={{ display: 'none' }} /></label>
          <button className="btn btn-n" onClick={baixarModelo}>Baixar modelo de CSV</button>
        </div>
        {imp?.erro && <span className="txt-erro" style={{ fontWeight: 600, fontSize: 14 }}>{imp.arquivo}: {imp.erro}</span>}
        {imp && !imp.erro && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="grid-auto">
              {[['No arquivo', imp.total], ['Novos', imp.grupos.novos], ['Veteranos', imp.grupos.veteranos], ['Formandos', imp.grupos.formandos], ['Da saúde, para importar', nSaude]].map(([t, n]) => (
                <div className="kpi" key={t}><span className="pequeno apagado">{t}</span><span className="v">{n}</span></div>
              ))}
            </div>
            <div className="scroll"><table className="tbl"><thead><tr><th>Nome</th><th>RA</th><th>Curso</th><th>Situação</th><th>Entra?</th></tr></thead>
              <tbody>{imp.alunos.map((a, i) => <tr key={i}><td>{a.nome}</td><td className="mono">{a.ra}</td><td>{a.curso}</td><td>{a.situacao}</td><td><Chip tom={a.saude ? 'ok' : 'neutro'}>{a.saude ? 'Sim, curso da saúde' : 'Não, fora da saúde'}</Chip></td></tr>)}</tbody></table></div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <button className="btn btn-p" disabled={!nSaude} onClick={() => { registrar(`Importação de matrículas: ${nSaude} alunos da saúde (${imp.arquivo})`); toast(`${nSaude} alunos da saúde importados (simulação). Na versão real, eles entram nas turmas e recebem o convite do app.`); setImp(null); }}>Importar {nSaude} alunos da saúde</button>
              <button className="btn btn-n" onClick={() => setImp(null)}>Cancelar</button>
            </div>
          </div>
        )}
      </section>
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
