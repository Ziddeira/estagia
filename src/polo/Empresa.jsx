import { useStore } from '../store.jsx';
import { Cabecalho, Chip } from '../components/ui.jsx';
import { fmt } from '../lib/date.js';

const CONTRATOS = [
  ['Letícia Araújo', 'Administração', 'Contábil Silva (fictícia)', '01/03/25 a 28/02/27', 30, [['at', 'Recesso de 30 dias a programar (1 ano completo)'], ['ok', 'Bolsa e auxílio-transporte em dia']]],
  ['Bruno Teixeira', 'Pedagogia', 'Escola Pequeno Saber (fictícia)', '01/11/24 a 31/12/26', 20, [['erro', 'Passa de 2 anos na mesma empresa'], ['ok', 'Bolsa e auxílio-transporte em dia']]],
  ['Amanda Pires', 'Direito', 'Mota Advocacia (fictícia)', '01/08/26 a 31/07/27', 30, [['erro', 'Sem auxílio-transporte: obrigatório no estágio não obrigatório'], ['ok', 'Prazo e jornada dentro da lei']]],
  ['Rafael Monteiro', 'Ciências Contábeis', 'Grupo Litoral (fictício)', '02/02/26 a 01/02/27', 40, [['at', '40h/semana só vale se o PPC prevê alternância entre teoria e prática'], ['ok', 'Bolsa e auxílio-transporte em dia']]]
];

const ST = { pendente: ['Pendente', 'at'], aprovado: ['Validado', 'ok'], recusado: ['Devolvido', 'erro'] };

export default function Empresa() {
  const { s, up, toast } = useStore();
  const mudar = (l, st) => {
    up((c) => { c.lancamentos.find((x) => x.id === l.id).status = st; });
    toast(st === 'aprovado' ? `${l.horas}h de ${l.aluno} validadas.` : `Lançamento devolvido para ${l.aluno} corrigir.`);
  };
  const periodo = (p) => p.replace(/(\d{4})-(\d{2})-(\d{2})/g, (_, y, m, d) => fmt(`${y}-${m}-${d}`));
  return (
    <>
      <Cabecalho titulo="Estágio em empresa" texto="Estágios não obrigatórios dos demais cursos do polo. O sistema confere o contrato contra a Lei 11.788 e valida as horas lançadas." />
      <section className="card">
        <div><h2>Contratos de estágio</h2><p className="apagado" style={{ fontSize: 14, marginTop: 4 }}>Confere: até 2 anos na mesma empresa, bolsa e auxílio-transporte, recesso de 30 dias por ano, jornada de até 6h/dia e 30h/semana (40h só com alternância prevista no PPC).</p></div>
        <div className="scroll">
          <table className="tbl" style={{ minWidth: 960 }}>
            <thead><tr><th>Aluno</th><th>Empresa</th><th>Período</th><th>Jornada</th><th>Conferência</th></tr></thead>
            <tbody>
              {CONTRATOS.map(([a, c, e, p, j, checks]) => (
                <tr key={a}>
                  <td><strong>{a}</strong><span className="sub">{c}</span></td>
                  <td className="pequeno">{e}</td>
                  <td className="mono pequeno">{p}</td>
                  <td className="mono">{j}h/sem</td>
                  <td><div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>{checks.map(([t, x]) => <Chip key={x} tom={t}>{x}</Chip>)}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="card">
        <h2>Semana de provas</h2>
        <p style={{ fontSize: 14 }}>Nas avaliações previstas no calendário acadêmico, a jornada do estagiário cai pelo menos pela metade (Lei 11.788, art. 10, §2º). O sistema avisa cada empresa com antecedência: 30h viram no máximo 15h nessa semana.</p>
        <button className="btn btn-s" style={{ alignSelf: 'flex-start' }} onClick={() => toast('Aviso da semana de provas enviado às 4 empresas, com a jornada máxima de cada aluno (simulação).')}>Avisar as 4 empresas</button>
      </section>
      <section className="card">
        <div><h2>Horas para validar</h2><p className="apagado" style={{ fontSize: 14, marginTop: 4 }}>O aluno lança, o supervisor da empresa confirma e o polo valida.</p></div>
        <div className="scroll">
          <table className="tbl" style={{ minWidth: 900 }}>
            <thead><tr><th>Aluno</th><th>Empresa · supervisor</th><th>Período</th><th>Horas</th><th>Conferência</th><th>Status</th><th>Ação</th></tr></thead>
            <tbody>
              {s.lancamentos.map((l) => {
                const acima = l.horas > 30 ? 'Acima de 30h na semana' : l.horas / l.dias > 6 ? 'Acima de 6h por dia' : null;
                return (
                  <tr key={l.id}>
                    <td><strong>{l.aluno}</strong><span className="sub">{l.curso}</span></td>
                    <td>{l.empresa}<span className="sub">Sup.: {l.sup}</span></td>
                    <td className="pequeno">{periodo(l.periodo)}</td>
                    <td className="mono"><strong>{l.horas}h</strong></td>
                    <td className={acima ? 'txt-erro' : 'txt-ok'} style={{ fontWeight: 600, fontSize: 14 }}>{acima || 'Dentro dos limites'}</td>
                    <td><Chip tom={ST[l.status][1]}>{ST[l.status][0]}</Chip></td>
                    <td>{l.status === 'pendente' && <div style={{ display: 'flex', gap: 8 }}><button className="btn btn-p" onClick={() => mudar(l, 'aprovado')}>Validar</button><button className="btn btn-n" onClick={() => mudar(l, 'recusado')}>Devolver</button></div>}</td>
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
