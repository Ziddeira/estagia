import { useState } from 'react';
import { useStore } from '../store.jsx';
import { Cabecalho, Chip } from '../components/ui.jsx';

const f = (rotulo, valor, fonte) => ({ rotulo, valor, fonte });
const m = (nome, horas, origem) => ({ nome, horas, origem });

const CURSOS_INFO = [
  { id: 'enf', nome: 'Enfermagem', configurado: true,
    norma: 'Nova DCN: Resolução CNE/CES nº 1, de 15/05/2026 · turmas antigas: Resolução CNE/CES nº 3/2001',
    fatos: [f('Carga do curso', '4.000h mínimo', 'DCN 2026'), f('Estágio supervisionado', '30% ≈ 1.200h', 'DCN 2026 (era 20% na DCN 2001)'), f('Conselho', 'Coren', 'registro do preceptor e do supervisor'), f('Alunos por supervisor', 'confirmar', 'sistema usa 10 (teto da Lei 11.788) até confirmar com o Coren-SC')],
    cenarios: [m('Atenção primária', '600h', 'DCN 2026 (metade do estágio)'), m('Hospitalar / média complexidade', '600h', 'DCN 2026 (metade do estágio)')],
    turmas: [['Turmas em estágio hoje (2022.2 e 2023.1)', 'DCN 2001: estágio de no mínimo 20%. A divisão entre hospital e atenção primária segue o PPC (exemplo: 480h + 320h).'], ['Ingressantes depois da adequação do PPC', 'DCN 2026: 1.200h, metade em atenção primária e metade em hospital ou média complexidade.']],
    docs: ['Seguro de acidentes pessoais vigente', 'Termo de Compromisso (TCE) assinado pelas 3 partes', 'Carteira de vacinação (hepatite B, dT e as exigidas pelo local)', 'Integração ou crachá do hospital, quando exigido'],
    obs: ['Curso só pode ser oferecido no formato presencial (Decreto 12.456/2025).', 'Turmas antigas e novas convivem durante a transição: cada turma fica presa à sua matriz.'] },
  { id: 'fis', nome: 'Fisioterapia', configurado: true, norma: 'DCN: Resolução CNE/CES nº 4/2002',
    fatos: [f('Carga do curso', '4.000h', 'Resolução CNE/CES nº 4/2009'), f('Estágio supervisionado', '≥ 20% ≈ 800h', 'DCN 2002'), f('Conselho', 'Crefito', 'registro do supervisor'), f('Alunos por supervisor', 'confirmar', 'sistema usa 10 até confirmar com o Crefito')],
    cenarios: [m('Hospitalar', '300h', 'PPC (exemplo)'), m('Ambulatorial', '300h', 'PPC (exemplo)'), m('Atenção primária', '200h', 'PPC (exemplo)')],
    turmas: [['Todas as turmas', 'DCN 2002. A divisão por cenário vem do PPC.']],
    docs: ['Seguro de acidentes pessoais vigente', 'TCE assinado', 'Carteira de vacinação'], obs: ['Verificar se há nova DCN de Fisioterapia em discussão no CNE.'] },
  { id: 'nut', nome: 'Nutrição', configurado: true, norma: 'DCN: Resolução CNE/CES nº 2, de 15/08/2025',
    fatos: [f('Carga do curso', '3.200h', 'Res. CNE/CES nº 4/2009 (confirmar se a DCN 2025 mudou)'), f('Estágio supervisionado', '≥ 20%', 'DCN 2025'), f('Conselho', 'CRN', 'supervisor nutricionista'), f('Alunos por supervisor', 'confirmar', 'sistema usa 10 até confirmar com o CRN')],
    cenarios: [m('Clínica', '240h', 'área obrigatória (confirmar na DCN 2025)'), m('Alimentação coletiva', '240h', 'área obrigatória (confirmar na DCN 2025)'), m('Saúde coletiva', '240h', 'área obrigatória (confirmar na DCN 2025)'), m('Eletiva', '240h', 'PPC (exemplo)')],
    turmas: [['Todas as turmas', 'DCN 2025, divisão do PPC.']],
    docs: ['Seguro de acidentes pessoais vigente', 'TCE assinado', 'Carteira de vacinação', 'Exigências do local para manipulação de alimentos'], obs: ['DCN nova (2025): conferir o PPC de cada faculdade antes de configurar.'] },
  { id: 'bio', nome: 'Biomedicina', configurado: true, norma: 'DCN: Resolução CNE/CES nº 2/2003 · supervisão: Resolução CFBM nº 277/2017',
    fatos: [f('Carga do curso', '3.200h', 'Resolução CNE/CES nº 4/2009'), f('Estágio supervisionado', '20% ≈ 640h', 'DCN 2003 (confirmar)'), f('Conselho', 'CRBM', 'supervisor regular no conselho'), f('Alunos por supervisor', 'até 8', 'Res. CFBM 277/2017; passar disso é infração ética')],
    cenarios: [m('Análises clínicas', '480h', 'PPC (exemplo); habilitação: Res. CFBM 78/2002'), m('Eletiva (imagem, estética, etc.)', '160h', 'PPC (exemplo)')],
    turmas: [['Todas as turmas', 'DCN 2003, com carga mínima por habilitação definida pelo CFBM.']],
    docs: ['Seguro de acidentes pessoais vigente', 'TCE assinado', 'Carteira de vacinação'],
    obs: ['O supervisor do estágio curricular deve ser vinculado à faculdade e fazer visitas presenciais ao local.', 'O local precisa estar regular no conselho e com controle de qualidade. O CFBM cita a RDC 302/2005; confirmar a norma da Anvisa vigente.'] },
  { id: 'rad', nome: 'Radiologia', configurado: true, norma: 'Curso superior de tecnologia (Catálogo Nacional dos CST) · registro: Resolução Conter nº 14/2017',
    fatos: [f('Carga do curso', '2.400h', 'catálogo dos CST (confirmar)'), f('Estágio supervisionado', 'conforme PPC', 'não há DCN própria'), f('Conselho', 'CRTR (Conter)', 'supervisor registrado'), f('Alunos por supervisor', 'confirmar', 'sistema usa 10 até confirmar com o Conter')],
    cenarios: [m('Radiologia convencional', '200h', 'PPC (exemplo)'), m('Tomografia', '100h', 'PPC (exemplo)'), m('Mamografia', '50h', 'PPC (exemplo)'), m('Ressonância', '50h', 'PPC (exemplo)')],
    turmas: [['Todas as turmas', 'Matriz do PPC.']],
    docs: ['Seguro de acidentes pessoais vigente', 'TCE assinado', 'Dosímetro individual entregue e com leitura em dia', 'Idade mínima para área controlada (confirmar regra da CNEN e do Conter)'],
    obs: ['Para o registro no CRTR, o egresso apresenta relatório de estágio assinado pelo preceptor (Res. Conter 14/2017): o sistema guarda esse relatório.'] },
  { id: 'far', nome: 'Farmácia', configurado: false, norma: 'Ainda não configurado' }
];

export default function Cursos() {
  const { toast } = useStore();
  const [sel, setSel] = useState('enf');
  const c = CURSOS_INFO.find((x) => x.id === sel);
  return (
    <>
      <Cabecalho titulo="Cursos e regras" texto="Cada curso carrega a sua diretriz, a matriz de horas por cenário, o conselho e os documentos exigidos. A escala e as horas usam essas regras.">
        <span className="selo-demo">Itens "confirmar" precisam de validação</span>
      </Cabecalho>
      <div className="linha-flex">
        <div role="tablist" aria-label="Cursos" style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {CURSOS_INFO.map((x) => (
            <button key={x.id} role="tab" aria-selected={x.id === sel} onClick={() => setSel(x.id)} className="btn btn-n" style={{ justifyContent: 'space-between', background: x.id === sel ? 'var(--verde-claro)' : '#fff', borderColor: x.id === sel ? 'var(--verde)' : undefined, color: 'var(--tinta)' }}>
              <strong>{x.nome}</strong><Chip tom={x.configurado ? 'ok' : 'at'}>{x.configurado ? 'Configurado' : 'A configurar'}</Chip>
            </button>
          ))}
        </div>
        <section className="card" style={{ flex: '4 1 560px', gap: 20 }}>
          <div><h2 style={{ fontSize: 24 }}>{c.nome}</h2><p className="apagado">{c.norma}</p></div>
          {!c.configurado ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
              <p>Para entrar na escala, o curso precisa da diretriz vigente, da matriz por cenário, do conselho e dos documentos exigidos. O polo preenche uma vez, ou envia o PPC em Documentos da instituição para a IA sugerir.</p>
              <button className="btn btn-p" onClick={() => toast('Na versão real, abre um passo a passo: diretriz, matriz por cenário, conselho, limite por supervisor e documentos.')}>Configurar curso</button>
            </div>
          ) : (
            <>
              <div className="grid-auto" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                {c.fatos.map((x) => (
                  <div key={x.rotulo} style={{ background: 'var(--fundo)', borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--apagado)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{x.rotulo}</span>
                    <strong>{x.valor}</strong>
                    <span className="pequeno apagado">{x.fonte}</span>
                  </div>
                ))}
              </div>
              <div>
                <h3>Matriz de horas por cenário</h3>
                <div className="scroll"><table className="tbl"><thead><tr><th>Cenário</th><th>Horas</th><th>De onde vem</th></tr></thead>
                  <tbody>{c.cenarios.map((x) => <tr key={x.nome}><td><strong>{x.nome}</strong></td><td className="mono">{x.horas}</td><td className="apagado">{x.origem}</td></tr>)}</tbody></table></div>
              </div>
              <div>
                <h3>Qual regra vale para cada turma</h3>
                {c.turmas.map(([t, r]) => <div className="item" key={t}><strong style={{ flex: '1 1 220px' }}>{t}</strong><span style={{ flex: '2 1 320px', fontSize: 14 }}>{r}</span></div>)}
              </div>
              <div className="linha-flex">
                <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <h3>Documentos que liberam o aluno</h3>
                  {c.docs.map((d) => <span key={d} style={{ fontSize: 14 }}>• {d}</span>)}
                </div>
                <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <h3>Observações</h3>
                  {c.obs.map((o) => <span key={o} style={{ fontSize: 14, background: 'var(--fundo)', padding: '10px 12px', borderRadius: 8 }}>{o}</span>)}
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}
