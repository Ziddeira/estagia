import { useState } from 'react';
import { useStore } from '../store.jsx';
import { Cabecalho, Chip } from '../components/ui.jsx';
import CalculadoraAVA from '../components/CalculadoraAVA.jsx';
import { GRUPOS, ETAPAS, PRAZO_VALIDACAO } from '../data/seed.js';
import { G, local, doc } from '../lib/calc.js';
import { hojeISO, fmt, diffDias } from '../lib/date.js';

const ACAO = ['Empresa cadastrada', 'Empresa validada', 'Associar aluno', 'Avisar aluno'];

const CAMPOS_FICHA = [
  ['Aluno', 'Nome, CPF, telefone, curso, semestre, RA e nome da disciplina de estágio'],
  ['Local', 'Razão social, CNPJ ativo na Receita Federal, endereço, município, CEP, telefone e tipo (público municipal, estadual ou privado)'],
  ['Responsável', 'Diretor ou responsável legal do local'],
  ['Supervisor de campo', 'Nome, formação e número do registro no conselho de classe']
];

export default function Campo() {
  const { s, up, toast, registrar } = useStore();
  const H = hojeISO();
  const [filtro, setFiltro] = useState('pendentes');

  const linhas = [];
  GRUPOS.forEach((g) => g.alunos.forEach((nome, i) => {
    const key = `${g.id}:${i}`;
    const c = s.campo[key];
    if (c) linhas.push({ key, g, i, nome, c });
  }));
  const vis = filtro === 'pendentes' ? linhas.filter((l) => l.c.etapa < 5) : linhas;
  const conta = (f) => linhas.filter(f).length;

  const avancar = ({ key, nome, c }) => {
    const nova = c.etapa + 1;
    up((x) => {
      const cc = x.campo[key];
      cc.etapa = nova;
      cc.datas[nova] = H;
      if (nova === 1 && !cc.protocolo) cc.protocolo = `CH-${String(Date.now()).slice(-5)}`;
    });
    const loc = local(s, c.local).nome;
    registrar(`${nome}: ${ETAPAS[nova].nome.toLowerCase()} (${loc})`);
    const msgs = {
      1: `Empresa cadastrada no sistema da instituição. A validação leva até ${PRAZO_VALIDACAO} dias: o EstagIA avisa se passar do prazo.`,
      2: `${loc} validado. Agora associe ${nome} à empresa e ao supervisor de campo.`,
      3: `${nome} associado(a). Antes, confira se o nome do local e do responsável são iguais aos da ficha: um erro aqui trava o lançamento das horas.`,
      4: `Aviso enviado a ${nome}:\n\n"Seu estágio em ${loc} foi associado. Já dá para lançar as horas no AVA, em Cadastro de estágio > Editar estágio. No app do EstagIA, a aba Horas calcula as datas e os horários certos."`
    };
    toast(msgs[nova]);
  };

  return (
    <>
      <Cabecalho titulo="Campo de estágio" texto="Do recebimento da ficha até o aluno lançar as horas no AVA. O aluno só consegue lançar depois de associado à empresa pelo polo." />

      <div className="grid-auto">
        {[['Ficha recebida', conta((l) => l.c.etapa === 0), 'falta cadastrar a empresa'],
          ['Em validação', conta((l) => l.c.etapa === 1), `prazo de até ${PRAZO_VALIDACAO} dias`],
          ['Para associar ou avisar', conta((l) => l.c.etapa === 2 || l.c.etapa === 3), 'trabalho do polo'],
          ['Aguardando o aluno lançar', conta((l) => l.c.etapa === 4), 'aluno já foi avisado'],
          ['Horas lançadas', conta((l) => l.c.etapa === 5), 'nada a fazer']].map(([t, n, sub]) => (
          <div className="kpi" key={t}><span className="pequeno apagado">{t}</span><span className="v">{n}</span><span className="pequeno apagado">{sub}</span></div>
        ))}
      </div>

      <section className="card">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
          <h2>Andamento por aluno</h2>
          <div className="abas">
            {[['pendentes', 'Pendentes'], ['todos', 'Todos']].map(([id, l]) => <button key={id} className={filtro === id ? 'sel' : ''} onClick={() => setFiltro(id)}>{l}</button>)}
          </div>
        </div>
        <div className="scroll">
          <table className="tbl" style={{ minWidth: 880 }}>
            <thead><tr><th>Aluno</th><th>Local</th><th>Etapa</th><th>Próximo passo</th><th>Protocolo</th><th>Ação</th></tr></thead>
            <tbody>
              {vis.map((l) => {
                const { key, g, i, nome, c } = l;
                const et = ETAPAS[c.etapa];
                const dias = c.etapa === 1 ? diffDias(c.datas[1], H) : null;
                const atrasado = dias !== null && dias > PRAZO_VALIDACAO;
                const d = doc(g.id, i);
                return (
                  <tr key={key}>
                    <td><strong>{nome}</strong><span className="sub">{G[g.id].nome}</span></td>
                    <td>{local(s, c.local).nome}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                        <Chip tom={atrasado ? 'erro' : et.tom}>{et.nome}</Chip>
                        <div className="etapas" aria-label={`Etapa ${c.etapa + 1} de ${ETAPAS.length}`}>{ETAPAS.map((e) => <i key={e.id} className={e.id <= c.etapa ? 'feita' : ''} />)}</div>
                        <span className="pequeno apagado">desde {fmt(c.datas[c.etapa])}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 14 }}>
                      {et.prox}
                      {atrasado && <span className="sub txt-erro" style={{ fontWeight: 600 }}>{dias} dias em validação: passou do prazo. Cobre pelo protocolo.</span>}
                      {d?.nivel === 'bloq' && <span className="sub txt-erro" style={{ fontWeight: 600 }}>Não pode ir a campo: {d.texto.charAt(0).toLowerCase() + d.texto.slice(1)}.</span>}
                    </td>
                    <td className="mono pequeno">{c.protocolo || '—'}</td>
                    <td>{c.etapa < 4 ? <button className="btn btn-p" style={{ whiteSpace: 'normal', minWidth: 120 }} onClick={() => avancar(l)}>{ACAO[c.etapa]}</button> : <span className="pequeno apagado">{c.etapa === 4 ? 'O aluno marca no app quando lançar' : 'Concluído'}</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!vis.length && <p className="apagado">Nenhum aluno pendente.</p>}
      </section>

      <div className="linha-flex">
        <section className="card">
          <div><h2>Ficha que o aluno entrega</h2><p className="apagado" style={{ fontSize: 14, marginTop: 4 }}>O aluno preenche pelo link. O EstagIA confere o CNPJ na Receita e se a empresa já está cadastrada antes de abrir um cadastro novo.</p></div>
          {CAMPOS_FICHA.map(([t, x]) => <div className="item" key={t}><strong style={{ flex: '1 1 140px' }}>{t}</strong><span style={{ flex: '3 1 260px', fontSize: 14 }}>{x}</span></div>)}
          <button className="btn btn-s" style={{ alignSelf: 'flex-start' }} onClick={() => toast('Link da ficha enviado ao aluno (simulação). Quando ele enviar, a linha aparece aqui como "Ficha recebida".')}>Enviar link da ficha ao aluno</button>
        </section>
        <section className="card">
          <div><h2>Datas para lançar no AVA</h2><p className="apagado" style={{ fontSize: 14, marginTop: 4 }}>A data de fim precisa cobrir toda a carga do estágio. Feriados nacionais não contam. Máximo de 6h por dia e 30h por semana.</p></div>
          <CalculadoraAVA />
        </section>
      </div>
    </>
  );
}
