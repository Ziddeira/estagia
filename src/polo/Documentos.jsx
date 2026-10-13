import { useState } from 'react';
import { useStore } from '../store.jsx';
import { Cabecalho, Chip } from '../components/ui.jsx';

const TIPOS = ['PPC dos cursos', 'Regulamento de estágio', 'Modelo de TCE', 'Convênios assinados', 'Planilhas de escala', 'Calendário acadêmico', 'Manuais internos', 'Modelos de mensagem'];

export default function Documentos() {
  const { s, up, toast, registrar } = useStore();
  const D = s.documentos;
  const [filtro, setFiltro] = useState('pendentes');
  const pend = D.sug.filter((x) => x.status === 'pendente').length;
  const apl = D.sug.filter((x) => x.status === 'aplicada').length;
  const abertas = D.perg.filter((q) => !q.resposta).length;
  const vis = filtro === 'pendentes' ? D.sug.filter((x) => x.status === 'pendente') : D.sug;
  const nItens = (nome) => D.sug.filter((x) => x.arq === nome).length + D.perg.filter((q) => q.fonte.startsWith(nome)).length;

  const decidir = (x, st) => {
    up((c) => { c.documentos.sug.find((y) => y.id === x.id).status = st; });
    if (st === 'aplicada') registrar(`Regra aplicada a partir de ${x.arq} (${x.onde})`);
    toast(st === 'aplicada' ? `Aplicado em ${x.destino}. A regra guarda a origem: ${x.arq}, ${x.onde}.` : 'Sugestão ignorada. Ela fica no histórico.');
  };
  const responder = (q, r) => {
    up((c) => { c.documentos.perg.find((y) => y.id === q.id).resposta = r; });
    toast('Resposta registrada. As telas que usam essa regra passam a seguir a sua resposta.');
  };
  const escolher = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    up((c) => { c.documentos.arquivos.push({ nome: f.name, desc: 'Enviado agora', st: 'recebido' }); });
    toast('Arquivo recebido. Nesta demonstração ele não é lido; na versão real, a IA lê e as sugestões aparecem aqui em alguns minutos. Use só arquivos sem dados de alunos.');
    e.target.value = '';
  };
  const exemplo = () => {
    if (D.calendario) return;
    const S = (id, onde, destino, trecho, mudanca) => ({ id, arq: 'Calendário acadêmico 2026.2.pdf', onde, destino, trecho, mudanca, alerta: '', status: 'pendente' });
    up((c) => {
      c.documentos.calendario = true;
      c.documentos.arquivos.push({ nome: 'Calendário acadêmico 2026.2.pdf', desc: 'Datas do semestre', st: 'lido' });
      c.documentos.sug.push(
        S('c1', 'pág. 2', 'Estágio em empresa', 'Semana de avaliações: 23 a 27 de novembro', 'Marca a semana de provas: jornada dos estagiários em empresa cai pela metade e as empresas são avisadas.'),
        S('c2', 'pág. 2', 'Escala', 'Recesso acadêmico: 21/12/2026 a 31/01/2027', 'Bloqueia a escala de estágio no recesso, a não ser que o curso libere.')
      );
    });
    setFiltro('pendentes');
    toast('Calendário lido (simulação): 2 ajustes novos para revisar.');
  };

  return (
    <>
      <Cabecalho titulo="Documentos da instituição" texto="O polo envia PPC, regulamentos, planilhas, manuais e modelos. A IA lê, encontra regras, prazos e modelos, e propõe os ajustes. Nada muda sem aprovação da coordenação." />
      <div className="grid-auto">
        {[['Arquivos lidos', D.arquivos.length, ''], ['Ajustes para revisar', pend, pend ? 'txt-at' : 'txt-ok'], ['Ajustes aplicados', apl, 'txt-ok'], ['Perguntas abertas', abertas, abertas ? 'txt-at' : 'txt-ok']].map(([l, v, c]) => (
          <div className="kpi" key={l}><span className="pequeno apagado">{l}</span><span className={`v ${c}`} style={{ fontSize: 28 }}>{v}</span></div>
        ))}
      </div>
      <div className="linha-flex">
        <section className="card" style={{ flex: '2 1 340px' }}>
          <h2>Enviar arquivos</h2>
          <label className="upload">
            <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0E5A52" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4" /><path d="M7 9l5-5 5 5" /><path d="M4 20h16" /></svg>
            <strong className="txt-ok" style={{ color: 'var(--verde)' }}>Escolher arquivo</strong>
            <span className="pequeno apagado">PDF, Word, Excel, PowerPoint ou imagem</span>
            <input type="file" onChange={escolher} style={{ fontSize: 13, maxWidth: '100%' }} />
          </label>
          <button className="btn btn-s" disabled={D.calendario} onClick={exemplo}>Simular leitura do calendário acadêmico</button>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--apagado)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>O que vale enviar</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{TIPOS.map((t) => <span key={t} className="chip chip-neutro" style={{ fontWeight: 500, borderRadius: 999 }}>{t}</span>)}</div>
          </div>
          <div className="alerta-box" style={{ background: 'var(--fundo)', fontSize: 13 }}>Os arquivos de um polo ficam só com ele e não treinam o sistema de outros clientes. Planilhas com dados de alunos têm CPF e dados de saúde mascarados antes da leitura.</div>
        </section>
        <section className="card" style={{ flex: '3 1 480px' }}>
          <h2>Arquivos lidos</h2>
          {D.arquivos.map((a, i) => (
            <div className="item" key={i} style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: '1 1 260px', minWidth: 0 }}><strong style={{ overflowWrap: 'anywhere' }}>{a.nome}</strong><div className="pequeno apagado">{a.desc}{a.st === 'lido' ? ` · ${nItens(a.nome)} itens encontrados` : ''}</div></div>
              <Chip tom={a.st === 'lido' ? 'ok' : 'neutro'}>{a.st === 'lido' ? 'Lido' : 'Recebido'}</Chip>
            </div>
          ))}
        </section>
      </div>
      <section className="card">
        <div><h2>Perguntas da IA</h2><p className="apagado" style={{ fontSize: 14, marginTop: 4 }}>Quando o documento é ambíguo ou contradiz a lei, o sistema pergunta em vez de adivinhar.</p></div>
        {D.perg.map((q) => (
          <div key={q.id} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 14, borderRadius: 10, background: q.resposta ? 'var(--fundo)' : '#FDF7EC' }}>
            <span className="pequeno apagado">{q.fonte}</span>
            <em style={{ fontSize: 14 }}>"{q.trecho}"</em>
            <strong>{q.pergunta}</strong>
            {q.nota && <span className="txt-at" style={{ fontSize: 14 }}>{q.nota}</span>}
            {q.resposta ? <strong className="txt-ok" style={{ fontSize: 14 }}>Resposta: {q.resposta}</strong>
              : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{q.opcoes.map((o) => <button key={o} className="btn btn-s" onClick={() => responder(q, o)}>{o}</button>)}</div>}
          </div>
        ))}
      </section>
      <section className="card">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
          <div><h2>Ajustes sugeridos</h2><p className="apagado" style={{ fontSize: 14, marginTop: 4 }}>Cada sugestão mostra o trecho e a página de onde veio. A regra aprovada guarda essa origem.</p></div>
          <div className="abas">{[['pendentes', 'Para revisar'], ['todas', 'Todas']].map(([id, l]) => <button key={id} className={filtro === id ? 'sel' : ''} onClick={() => setFiltro(id)}>{l}</button>)}</div>
        </div>
        {vis.length === 0 && <span className="txt-ok" style={{ fontWeight: 600 }}>Nenhum ajuste pendente.</span>}
        {vis.map((x) => (
          <div className="item" key={x.id}>
            <div style={{ flex: '1 1 380px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span className="pequeno apagado">{x.arq} · {x.onde} · vai para {x.destino}</span>
              <em style={{ fontSize: 14 }}>"{x.trecho}"</em>
              <strong>{x.mudanca}</strong>
              {x.alerta && <span className="txt-erro" style={{ fontSize: 14, fontWeight: 600 }}>{x.alerta}</span>}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {x.status === 'pendente' ? (
                <><button className="btn btn-p" onClick={() => decidir(x, 'aplicada')}>Aplicar</button><button className="btn btn-n" onClick={() => decidir(x, 'ignorada')}>Ignorar</button></>
              ) : <Chip tom={x.status === 'aplicada' ? 'ok' : 'neutro'}>{x.status === 'aplicada' ? 'Aplicada' : 'Ignorada'}</Chip>}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
