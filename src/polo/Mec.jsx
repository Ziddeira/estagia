import { useState } from 'react';
import { useStore } from '../store.jsx';
import Impressao from '../components/Impressao.jsx';
import { Cabecalho, Chip } from '../components/ui.jsx';
import { RELPEND, CURSOS, GRUPOS } from '../data/seed.js';
import { hojeISO, fmtAno, addDias } from '../lib/date.js';

const DESTINO = { enf: 'Coren-SC', fis: 'Crefito da região', nut: 'CRN da região', bio: 'CRBM da região', rad: 'CRTR da região' };

const PERFIS = [
  ['Coordenação do polo', 'Tudo do polo, inclusive documentos de saúde. Cada abertura de documento fica registrada.'],
  ['Preceptor', 'Só os seus grupos: escala, presença, fichas e avaliação. Vê se o aluno está liberado, mas não abre a carteira de vacinação.'],
  ['Aluno', 'Só os próprios dados, horas, documentos e fichas.'],
  ['Local de estágio', 'Escala, presença e lista de alunos liberados. Nenhum dado de saúde.'],
  ['Faculdade (sede)', 'Indicadores consolidados por polo, sem dados pessoais.']
];

const NORMAS = [
  ['Lei 11.788/2008 (Lei do Estágio)', true, 'TCE, relatórios a cada 6 meses, jornada, 2 anos, recesso, 10 estagiários por supervisor, seguro.'],
  ['Decreto 12.456/2025 (EaD)', true, 'Cursos da saúde presenciais; check-in por geolocalização como prova de atividade presencial.'],
  ['DCN Enfermagem: Res. CNE/CES 1/2026', true, 'Matriz nova (1.200h, metade em atenção primária) para turmas novas.'],
  ['DCN Nutrição: Res. CNE/CES 2/2025', true, 'Matriz por área de estágio.'],
  ['Res. CFBM 277/2017', true, 'Bloqueia grupo de Biomedicina com mais de 8 alunos por supervisor.'],
  ['CLT, art. 452-A (intermitente)', true, 'Convocação com 3 dias corridos e resposta em 1 dia útil; 1/3 de férias no pagamento.'],
  ['LGPD (Lei 13.709/2018)', true, 'Perfis de acesso, registro de acessos, localização só no check-in e no check-out, prazo de retenção.'],
  ['PL 6350/2025', false, 'Acompanhar: pode mudar regras de remuneração do estágio.'],
  ['PL 301/2025 (estagiária gestante)', false, 'Acompanhar: pode criar direitos novos para a estagiária gestante.']
];

export default function Mec() {
  const { s, toast, registrar } = useStore();
  const H = hojeISO();
  const [lc, setLc] = useState({ curso: 'enf', conclusao: addDias(H, -30), colacao: addDias(H, -10) });
  const [verLista, setVerLista] = useState(false);
  const formandos = GRUPOS.filter((g) => g.curso === lc.curso).flatMap((g) => g.alunos);
  const pastaItens = [
    ['Regulamento de estágio por curso', '5 de 6', 'Farmácia ainda não configurado', false],
    ['Convênios vigentes', `${s.locais.filter((l) => l.fim >= s.criadoEm).length} de ${s.locais.length}`, 'convênio vencido aparece aqui', false],
    ['Termos de compromisso assinados', '31 de 32', '1 aguardando assinatura do local', false],
    ['Relatórios semestrais', s.relCobrados ? 'cobrados' : `${32 - RELPEND.length} de 32`, s.relCobrados ? 'alunos já foram cobrados' : `${RELPEND.length} pendentes`, s.relCobrados],
    ['Horas por aluno × matriz do curso', '32 de 32', 'por cenário, com origem de cada hora', true],
    ['Registro de presença com check-in', `${s.turnos.filter((t) => t.pres).length} turnos`, 'data, hora e distância até o local cadastrado', true],
    ['Preceptores com registro no conselho', '6 de 6', '1 certidão perto de vencer', true]
  ];
  return (
    <>
      <Cabecalho titulo="MEC, LGPD e normas" texto="Evidências prontas para avaliação, proteção dos dados dos alunos e acompanhamento das regras que mudam." />
      <section className="card">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
          <div><h2>Pasta para avaliação do MEC</h2><p className="apagado" style={{ fontSize: 14, marginTop: 4 }}>Tudo o que o avaliador costuma pedir sobre estágio, por curso, num arquivo só.</p></div>
          <button className="btn btn-p" onClick={() => { registrar('Pasta de avaliação do MEC gerada'); toast('Pasta gerada (simulação): PDF por curso com regulamento, convênios, termos, relatórios, horas e presenças, e planilhas de apoio.'); }}>Gerar pasta</button>
        </div>
        {pastaItens.map(([i, q, o, ok]) => (
          <div className="item" key={i} style={{ display: 'grid', gridTemplateColumns: '1.6fr 120px 1fr', alignItems: 'center' }}>
            <strong>{i}</strong><span className={`mono ${ok ? 'txt-ok' : 'txt-at'}`} style={{ fontWeight: 600 }}>{q}</span><span className={`pequeno ${ok ? 'txt-ok' : 'txt-at'}`}>{o}</span>
          </div>
        ))}
      </section>
      <div className="linha-flex">
        <section className="card" style={{ flex: '3 1 520px' }}>
          <div><h2>LGPD: quem vê o quê</h2><p className="apagado" style={{ fontSize: 14, marginTop: 4 }}>Vacinação, exame admissional e localização são dados sensíveis ou pessoais. Cada perfil vê só o necessário.</p></div>
          <div className="scroll"><table className="tbl"><thead><tr><th>Perfil</th><th>Acesso</th></tr></thead><tbody>{PERFIS.map(([p, a]) => <tr key={p}><td><strong>{p}</strong></td><td style={{ fontSize: 14 }}>{a}</td></tr>)}</tbody></table></div>
          <div className="alerta-box" style={{ background: 'var(--fundo)' }}>Prazo para apagar dados de saúde depois da conclusão do curso: [definir com o jurídico]. Cada polo assina um contrato de tratamento de dados com a EstagIA.</div>
        </section>
        <section className="card" style={{ flex: '2 1 340px' }}>
          <h2>Registro de acessos e ações</h2>
          {s.log.slice(0, 10).map((l, i) => (
            <div className="item" key={i} style={{ flexDirection: 'column', gap: 2 }}>
              <span className="mono pequeno apagado">{l.quando.replace(/^(\d{4})-(\d{2})-(\d{2})/, (_, y, m, d) => `${d}/${m}`)}</span>
              <span style={{ fontSize: 14 }}>{l.txt}</span>
            </div>
          ))}
        </section>
      </div>
      <section className="card">
        <div><h2>Lista de concluintes para o conselho</h2><p className="apagado" style={{ fontSize: 14, marginTop: 4 }}>Depois da colação de grau, a instituição informa ao conselho de classe quem concluiu o curso. O EstagIA monta a carta com a lista da turma.</p></div>
        <div className="form-grid">
          <label className="campo">Curso
            <select value={lc.curso} onChange={(e) => setLc({ ...lc, curso: e.target.value })}>
              {Object.entries(CURSOS).map(([id, c]) => <option key={id} value={id}>{c.nome}</option>)}
            </select>
          </label>
          <label className="campo">Data de conclusão<input type="date" value={lc.conclusao} onChange={(e) => setLc({ ...lc, conclusao: e.target.value })} /></label>
          <label className="campo">Data da colação de grau<input type="date" value={lc.colacao} onChange={(e) => setLc({ ...lc, colacao: e.target.value })} /></label>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <button className="btn btn-p" disabled={!lc.conclusao || !lc.colacao} onClick={() => { setVerLista(true); registrar(`Lista de concluintes de ${CURSOS[lc.curso].nome} gerada para o ${DESTINO[lc.curso]}`); }}>Gerar lista para o {DESTINO[lc.curso]}</button>
          <span className="pequeno apagado">{formandos.length} concluintes na demonstração. Na versão real, entram os alunos com situação "formando" que colaram grau.</span>
        </div>
      </section>

      {verLista && (
        <Impressao titulo={`Lista de concluintes · ${CURSOS[lc.curso].nome}`} onFechar={() => setVerLista(false)}>
          <h2>Lista de colação de grau · {CURSOS[lc.curso].nome}</h2>
          <p style={{ textAlign: 'right' }}>[Cidade], {fmtAno(H)}.</p>
          <p>Ao {DESTINO[lc.curso]}</p>
          <p>A [Instituição de ensino, com o campus ou polo] informa a relação de alunos que concluíram o curso de {CURSOS[lc.curso].nome} em {fmtAno(lc.conclusao)} e colaram grau em {fmtAno(lc.colacao)}.</p>
          <table>
            <thead><tr><th>Nome completo</th><th style={{ width: '32%' }}>CPF</th></tr></thead>
            <tbody>{formandos.map((n) => <tr key={n}><td>{n}</td><td>[CPF do aluno]</td></tr>)}</tbody>
          </table>
          <p>Atenciosamente,</p>
          <div className="linha-assinatura">[Nome do responsável]<br />[Cargo na instituição de ensino]</div>
        </Impressao>
      )}

      <section className="card">
        <div><h2>Normas acompanhadas</h2><p className="apagado" style={{ fontSize: 14, marginTop: 4 }}>O que já vale e o que está em tramitação. Quando uma regra muda, o sistema avisa o que precisa ser ajustado.</p></div>
        <div className="scroll"><table className="tbl" style={{ minWidth: 780 }}><thead><tr><th>Norma</th><th>Situação</th><th>O que o sistema faz com ela</th></tr></thead>
          <tbody>{NORMAS.map(([n, v, u]) => <tr key={n}><td><strong>{n}</strong></td><td><Chip tom={v ? 'ok' : 'info'}>{v ? 'Em vigor' : 'Em tramitação'}</Chip></td><td style={{ fontSize: 14 }}>{u}</td></tr>)}</tbody></table></div>
      </section>
    </>
  );
}
