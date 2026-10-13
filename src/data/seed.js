// Dados fictícios da demonstração. As datas são calculadas a partir de hoje,
// então a demonstração sempre tem um turno "hoje", turnos passados e futuros.
import { hojeISO, addDias } from '../lib/date.js';

export const TURNOS = {
  mat: { label: 'Matutino', hora: '07:30–13:30', ch: 6 },
  vesp: { label: 'Vespertino', hora: '13:30–19:30', ch: 6 }
};

export const LIMITE_MENSAL = 55;

export const CURSOS = {
  enf: { nome: 'Enfermagem', conselho: 'Coren', limite: 10, fonte: 'teto da Lei 11.788; confirmar regra do Coren', matriz: 'DCN 2001 · divisão do PPC', cen: [{ id: 'hosp', nome: 'Hospitalar', meta: 480 }, { id: 'ap', nome: 'Atenção primária', meta: 320 }] },
  fis: { nome: 'Fisioterapia', conselho: 'Crefito', limite: 10, fonte: 'teto da Lei 11.788; confirmar regra do Crefito', matriz: 'DCN 2002 · divisão do PPC', cen: [{ id: 'hosp', nome: 'Hospitalar', meta: 300 }, { id: 'amb', nome: 'Ambulatorial', meta: 300 }, { id: 'ap', nome: 'Atenção primária', meta: 200 }] },
  nut: { nome: 'Nutrição', conselho: 'CRN', limite: 10, fonte: 'teto da Lei 11.788; confirmar regra do CRN', matriz: 'DCN 2025 · divisão do PPC', cen: [{ id: 'cli', nome: 'Clínica', meta: 240 }, { id: 'col', nome: 'Alimentação coletiva', meta: 240 }, { id: 'sc', nome: 'Saúde coletiva', meta: 240 }, { id: 'elet', nome: 'Eletiva', meta: 240 }] },
  bio: { nome: 'Biomedicina', conselho: 'CRBM', limite: 8, fonte: 'Res. CFBM 277/2017', matriz: 'DCN 2003 · divisão do PPC', cen: [{ id: 'ac', nome: 'Análises clínicas', meta: 480 }, { id: 'elet', nome: 'Eletiva', meta: 160 }] },
  rad: { nome: 'Radiologia', conselho: 'CRTR', limite: 10, fonte: 'teto da Lei 11.788; confirmar regra do Conter', matriz: 'CST · divisão do PPC', cen: [{ id: 'conv', nome: 'Convencional', meta: 200 }, { id: 'tc', nome: 'Tomografia', meta: 100 }, { id: 'mamo', nome: 'Mamografia', meta: 50 }, { id: 'rm', nome: 'Ressonância', meta: 50 }] }
};

export const GRUPOS = [
  { id: 'enf1', curso: 'enf', nome: 'Enfermagem · G1', turma: '2022.2', base: { hosp: 300, ap: 240 }, alunos: ['Beatriz Souza', 'Lucas Ferreira', 'Mariana Costa', 'Rafael Lima', 'Camila Rocha', 'Thiago Alves'] },
  { id: 'enf2', curso: 'enf', nome: 'Enfermagem · G2', turma: '2022.2', base: { hosp: 330, ap: 150 }, alunos: ['Larissa Martins', 'Pedro Henrique Dias', 'Fernanda Gomes', 'Gabriel Nunes', 'Aline Barbosa'] },
  { id: 'fis1', curso: 'fis', nome: 'Fisioterapia · G1', turma: '2022.2', base: { hosp: 180, amb: 150, ap: 120 }, alunos: ['Vitória Santos', 'João Pedro Ramos', 'Isabela Moreira', 'Matheus Carvalho'] },
  { id: 'nut1', curso: 'nut', nome: 'Nutrição · G1', turma: '2023.1', base: { cli: 120, col: 180, sc: 60, elet: 0 }, alunos: ['Sofia Ramos', 'Enzo Batista', 'Clara Mendonça', 'Davi Rezende'] },
  { id: 'bio1', curso: 'bio', nome: 'Biomedicina · G1', turma: '2023.1', base: { ac: 240, elet: 60 }, alunos: ['Henrique Prado', 'Lara Fonseca', 'Miguel Antunes', 'Yasmin Freitas', 'Caio Moura', 'Bianca Leal', 'Otávio Reis', 'Melissa Cunha', 'Rodrigo Paiva'] },
  { id: 'rad1', curso: 'rad', nome: 'Radiologia · G1', turma: '2025.1', base: { conv: 120, tc: 24, mamo: 0, rm: 0 }, alunos: ['Kauã Silva', 'Lívia Duarte', 'Natália Prates', 'Samuel Costa'] }
];

export const PRECEPTORES = [
  { id: 'ana', nome: 'Ana Ribeiro', curso: 'enf', reg: 'Coren-SC [nº]' },
  { id: 'carlos', nome: 'Carlos Mendes', curso: 'enf', reg: 'Coren-SC [nº]' },
  { id: 'juliana', nome: 'Juliana Prado', curso: 'fis', reg: 'Crefito [nº]' },
  { id: 'renata', nome: 'Renata Lopes', curso: 'nut', reg: 'CRN [nº]' },
  { id: 'diego', nome: 'Diego Fontes', curso: 'bio', reg: 'CRBM [nº]' },
  { id: 'paula', nome: 'Paula Vieira', curso: 'rad', reg: 'CRTR [nº]' }
];

export const ATIVIDADES = {
  enf: ['Aferição de sinais vitais', 'Administração de medicação (supervisionada)', 'Curativo', 'Admissão de paciente', 'Evolução de enfermagem', 'Educação em saúde', 'Passagem de plantão'],
  fis: ['Avaliação fisioterapêutica', 'Cinesioterapia', 'Fisioterapia respiratória', 'Orientação ao paciente'],
  nut: ['Avaliação nutricional', 'Prescrição dietética (supervisionada)', 'Controle de qualidade na produção', 'Educação alimentar'],
  bio: ['Coleta de amostras', 'Hematologia', 'Bioquímica', 'Microbiologia', 'Controle de qualidade'],
  rad: ['Posicionamento do paciente', 'Operação do equipamento (supervisionada)', 'Proteção radiológica', 'Processamento de imagem']
};

// Documento irregular: 'bloq' tira o aluno da escala; 'aviso' só alerta
export const DOCS = {
  'enf1:4': { nivel: 'bloq', texto: 'Seguro vencido' },
  'enf2:4': { nivel: 'bloq', texto: 'Vacina hepatite B incompleta' },
  'nut1:0': { nivel: 'bloq', texto: 'TCE sem assinatura do local' },
  'rad1:0': { nivel: 'bloq', texto: 'Menor de 18 anos (área controlada)' },
  'rad1:1': { nivel: 'bloq', texto: 'Dosímetro não entregue' },
  'bio1:0': { nivel: 'aviso', texto: 'Seguro vence em 7 dias' }
};

export const RELPEND = ['enf1:1', 'enf2:2', 'fis1:3', 'bio1:5', 'bio1:6', 'rad1:2'];

// Ponto inicial fictício (região de Palhoça/SC). Na demonstração, o polo marca o ponto real em Convênios.
const P0 = { lat: -27.6455, lng: -48.6697 };

export function criarEstado() {
  const H = hojeISO();
  const d = (n) => addDias(H, n);
  const G = {};
  GRUPOS.forEach((g) => { G[g.id] = g; });
  const bloq = (gid, i) => DOCS[`${gid}:${i}`]?.nivel === 'bloq';
  const pres = (gid, aus = []) => {
    const m = {};
    G[gid].alunos.forEach((_, i) => { m[i] = !bloq(gid, i) && !aus.includes(i); });
    return m;
  };
  let n = 0;
  const t = (prec, grupo, local, cen, dia, turno, p) => ({ id: `t${++n}`, prec, grupo, local, cen, data: d(dia), turno, pres: p || null, precCheckin: p ? { hora: '07:15', dist: 35, dentro: true } : null, checkins: {} });

  const turnos = [
    t('ana', 'enf1', 'hm', 'hosp', -11, 'mat', pres('enf1')),
    t('ana', 'enf1', 'hm', 'hosp', -9, 'mat', pres('enf1')),
    t('ana', 'enf1', 'hm', 'hosp', -4, 'mat', pres('enf1', [1])),
    t('ana', 'enf1', 'hm', 'hosp', -2, 'mat'),
    t('ana', 'enf1', 'hm', 'hosp', 0, 'mat'),
    t('ana', 'enf1', 'ubs', 'ap', 2, 'mat'),
    t('ana', 'enf1', 'ubs', 'ap', 7, 'mat'),
    t('ana', 'enf1', 'hm', 'hosp', 9, 'mat'),
    t('carlos', 'enf2', 'ubs', 'ap', -10, 'vesp', pres('enf2')),
    t('carlos', 'enf2', 'ubs', 'ap', -3, 'vesp'),
    t('carlos', 'enf2', 'ubs', 'ap', 4, 'mat'),
    t('carlos', 'enf2', 'hm', 'hosp', 4, 'mat'),
    t('carlos', 'enf2', 'ubs', 'ap', 11, 'vesp'),
    t('juliana', 'fis1', 'cr', 'amb', -6, 'mat', pres('fis1', [2])),
    t('juliana', 'fis1', 'hm', 'hosp', 1, 'mat'),
    t('juliana', 'fis1', 'cr', 'amb', 8, 'mat'),
    t('juliana', 'fis1', 'ubs', 'ap', 15, 'mat'),
    t('renata', 'nut1', 'hm', 'cli', -7, 'mat', pres('nut1')),
    t('renata', 'nut1', 'rp', 'col', 2, 'mat'),
    t('renata', 'nut1', 'ubs', 'sc', 9, 'mat'),
    t('diego', 'bio1', 'lab', 'ac', -5, 'mat', pres('bio1')),
    t('diego', 'bio1', 'lab', 'ac', 2, 'mat'),
    t('diego', 'bio1', 'lab', 'ac', 16, 'mat'),
    t('paula', 'rad1', 'hm', 'conv', -6, 'vesp', pres('rad1')),
    t('paula', 'rad1', 'ci', 'tc', 3, 'vesp'),
    t('paula', 'rad1', 'hm', 'conv', 17, 'vesp')
  ];

  // Turno de hoje: alguns colegas da Beatriz já fizeram check-in
  const hoje = turnos.find((x) => x.data === H && x.prec === 'ana');
  hoje.checkins = {
    1: { hora: '07:28', dist: 35, dentro: true },
    2: { hora: '07:31', dist: 60, dentro: true },
    3: { hora: '07:40', dist: 2300, dentro: false, manual: true },
    5: { hora: '07:26', dist: 18, dentro: true }
  };
  const passado = turnos[2]; // turno de -4 dias

  const fichas = {
    [`${hoje.id}:1`]: { ativ: [2, 1], obs: 'Fiz curativo simples com supervisão.', status: 'enviada', hora: '13:25' },
    [`${hoje.id}:2`]: { ativ: [3, 0], obs: 'Participei da admissão de um paciente idoso.', status: 'enviada', hora: '13:18' },
    [`${passado.id}:0`]: { ativ: [2, 0], obs: 'Fiz curativo e aferi sinais vitais.', status: 'corrigir', hora: '13:20', comentario: 'O curativo foi só observado, não realizado. Ajuste a atividade.' }
  };

  return {
    versao: 1,
    criadoEm: H,
    turnos,
    fichas,
    locais: [
      { id: 'hm', nome: 'Hospital Municipal', tipo: 'Público · contrato ensino-saúde (COAPES)', fim: d(170), vagas: [['Enfermagem', 12, 11], ['Fisioterapia', 4, 4], ['Nutrição', 4, 4], ['Radiologia', 4, 4]], contra: 'Capacitação da equipe: 40h por semestre', lat: P0.lat, lng: P0.lng, raio: 150, definido: true },
      { id: 'ubs', nome: 'UBS Centro', tipo: 'Público · COAPES', fim: d(170), vagas: [['Enfermagem', 10, 11], ['Fisioterapia', 4, 4], ['Nutrição', 4, 4]], contra: 'Apoio em campanhas de vacinação', lat: P0.lat + 0.006, lng: P0.lng + 0.004, raio: 100, definido: true },
      { id: 'cr', nome: 'Clínica de Reabilitação', tipo: 'Privado', fim: d(63), vagas: [['Fisioterapia', 6, 4]], contra: 'Sem contrapartida', lat: P0.lat - 0.004, lng: P0.lng + 0.008, raio: 50, definido: true },
      { id: 'lab', nome: 'Laboratório Vida (fictício)', tipo: 'Privado', fim: d(24), vagas: [['Biomedicina', 8, 9]], contra: 'Sem contrapartida', lat: P0.lat + 0.01, lng: P0.lng - 0.003, raio: 50, definido: true },
      { id: 'ci', nome: 'Centro de Imagem Sul (fictício)', tipo: 'Privado', fim: d(-12), vagas: [['Radiologia', 4, 4]], contra: 'Sem contrapartida', lat: null, lng: null, raio: 100, definido: false },
      { id: 'rp', nome: 'Restaurante Popular (fictício)', tipo: 'Público municipal', fim: d(260), vagas: [['Nutrição', 4, 4]], contra: 'Oficinas de educação alimentar', lat: P0.lat - 0.008, lng: P0.lng - 0.006, raio: 100, definido: true }
    ],
    convocacoes: [
      { id: 'c1', prec: 'ana', turno: 'Hoje · Hospital Municipal · matutino', enviada: d(-7), antec: 7, prazo: d(-6), st: 'aceita' },
      { id: 'c2', prec: 'ana', turno: `${d(2)} · UBS Centro · matutino`, enviada: d(-1), antec: 3, prazo: d(0), st: 'aguardando' },
      { id: 'c3', prec: 'juliana', turno: `${d(1)} · Hospital Municipal · matutino`, enviada: d(-1), antec: 2, prazo: d(0), st: 'curta' },
      { id: 'c4', prec: 'diego', turno: `${d(2)} · Laboratório Vida · matutino`, enviada: d(-5), antec: 7, prazo: d(-4), st: 'silencio' },
      { id: 'c5', prec: 'paula', turno: `${d(3)} · Centro de Imagem Sul · vespertino`, enviada: d(-2), antec: 5, prazo: d(1), st: 'aguardando' }
    ],
    lancamentos: [
      { id: 'l1', aluno: 'Letícia Araújo', curso: 'Administração', empresa: 'Contábil Silva (fictícia)', sup: 'Renata Silva', periodo: `${d(-8)} a ${d(-4)}`, horas: 30, dias: 5, status: 'pendente' },
      { id: 'l2', aluno: 'Bruno Teixeira', curso: 'Pedagogia', empresa: 'Escola Pequeno Saber (fictícia)', sup: 'Márcia Lopes', periodo: `${d(-8)} a ${d(-4)}`, horas: 20, dias: 5, status: 'pendente' },
      { id: 'l3', aluno: 'Amanda Pires', curso: 'Direito', empresa: 'Mota Advocacia (fictícia)', sup: 'Paulo Mota', periodo: `${d(-8)} a ${d(-4)}`, horas: 32, dias: 5, status: 'pendente' }
    ],
    ocorrencias: [
      { cod: 'OC-001', data: d(-4), tipo: 'bio', aluno: 'Lucas Ferreira', local: 'Hospital Municipal', feitos: [true, true, true, true, true, false] }
    ],
    avaliacoes: {},
    relCobrados: false,
    docsAlunoEnviados: [],
    documentos: criarDocumentos(),
    log: [
      { quando: `${d(-1)} 18:42`, txt: 'Coordenação abriu a carteira de vacinação de Aline Barbosa' },
      { quando: `${d(-1)} 09:31`, txt: 'Exportação: conferência de horas para o AVA' },
      { quando: `${d(-2)} 08:02`, txt: 'Hospital Municipal consultou a lista de alunos liberados' }
    ]
  };
}

function criarDocumentos() {
  const S = (id, arq, onde, destino, trecho, mudanca, alerta = '') => ({ id, arq, onde, destino, trecho, mudanca, alerta, status: 'pendente' });
  return {
    calendario: false,
    arquivos: [
      { nome: 'Modelos.pdf', desc: 'Modelos de mensagem e cálculo de pagamento', st: 'lido' },
      { nome: 'Ficha para cadastro de dados de convênio.docx', desc: 'Formulário de convênio', st: 'lido' },
      { nome: 'Organização de estágio.pdf', desc: 'Planilhas de escala e de prazos de contratação', st: 'lido' },
      { nome: 'Manual do candidato 2024.pdf', desc: 'Admissão e convocação do preceptor', st: 'lido' },
      { nome: 'Como cadastrar as horas de estágio.pptx', desc: 'Lançamento de horas no AVA', st: 'lido' },
      { nome: 'PPC Enfermagem 2023.pdf (exemplo)', desc: 'Projeto pedagógico do curso', st: 'lido' }
    ],
    sug: [
      S('s1', 'Modelos.pdf', 'pág. 1', 'Convênios', 'Viemos através deste, demonstrar interesse em firmar convênio com sua instituição…', 'Vira o modelo do e-mail de pedido e de renovação de convênio.'),
      S('s2', 'Modelos.pdf', 'pág. 1', 'Preceptores', 'jornada diária x número de dias trabalhados no mês x valor do salário hora + 1/6 de DSR, acrescido de 1/12 avos de férias e 1/12 avos de 13º', 'Configura o cálculo do pagamento do preceptor.', 'Não inclui o 1/3 de férias exigido no contrato intermitente (CLT, art. 452-A, §6º). Ao aplicar, o sistema já soma o 1/3.'),
      S('s3', 'Modelos.pdf', 'págs. 1 e 2', 'Preceptores', 'Segue abaixo alguns dados que necessitamos… COREN, CPF, endereço', 'Vira um formulário por link para o preceptor selecionado. CPF e endereço deixam de circular pelo WhatsApp.'),
      S('s4', 'Modelos.pdf', 'pág. 2', 'Preceptores', 'Foto, PIS, CPF e RG, reservista, título, comprovante de residência, ASO…', 'Vira o checklist de documentos de admissão do preceptor.'),
      S('s5', 'Ficha para cadastro de dados de convênio.docx', 'pág. 1', 'Convênios', 'Razão social, CNPJ, endereço, telefone, e-mail, tempo de vigência, responsável, cargo', 'Monta o formulário de novo convênio com esses 13 campos.'),
      S('s6', 'Organização de estágio.pdf', 'pág. 3', 'Preceptores', 'Abrir chamado → vaga → contato → proposta → aceite → exame → banco → documentos → ASO → validação → admissão', 'Cria o fluxo de contratação com responsável e prazo por etapa, e alerta de atraso.'),
      S('s7', 'Organização de estágio.pdf', 'pág. 2', 'Escala', 'LOCAL · PRECEPTOR · SEMANA · DATA · HORÁRIO · CH · ALUNO 1 … ALUNO 6', 'Limita a 6 alunos por grupo nos cursos com preceptor. Quando o conselho é mais rígido, vale o conselho.'),
      S('s8', 'Manual do candidato 2024.pdf', 'pág. 16', 'Escala', 'O monitor só poderá iniciar as atividades no campo de estágio após o aceite da convocação.', 'Turno sem aceite do preceptor fica bloqueado para registro de presença.'),
      S('s9', 'Como cadastrar as horas de estágio.pptx', 'slide 6', 'Escala', 'Na coluna MATUTINO: INÍCIO 07:30, FIM 13:30', 'Turno matutino de 07:30 a 13:30.'),
      S('s10', 'Como cadastrar as horas de estágio.pptx', 'slides 2 a 8', 'Alunos e horas', 'Data inicial, data final e horários por turno, lançados em EDITAR ESTÁGIO', 'A conferência para o AVA passa a sair nesse formato: período e turno por aluno, pronto para copiar.'),
      S('s11', 'PPC Enfermagem 2023.pdf (exemplo)', 'pág. 42', 'Cursos e regras', 'Estágio Curricular Supervisionado: 500 horas em ambiente hospitalar e 300 horas na atenção básica', 'Atualiza a matriz das turmas de Enfermagem de 480h + 320h (exemplo) para 500h + 300h (PPC).')
    ],
    perg: [
      { id: 'q1', fonte: 'Organização de estágio.pdf · pág. 2', trecho: 'TOTAL DE HORAS MENSAIS = 55 h', pergunta: 'Esse limite de 55h no mês é por preceptor ou por grupo de alunos?', nota: '', opcoes: ['Por preceptor', 'Por grupo de alunos'], resposta: '' },
      { id: 'q2', fonte: 'Manual do candidato 2024.pdf · pág. 16', trecho: 'O aceite da convocação possui o prazo de 48 horas', pergunta: 'Qual prazo de resposta o sistema deve cobrar do preceptor?', nota: 'A CLT dá 1 dia útil e considera o silêncio como recusa (art. 452-A, §2º). O manual dá 48 horas. Confirme com o DP.', opcoes: ['1 dia útil (CLT)', '48 horas (manual)'], resposta: '' },
      { id: 'q3', fonte: 'Organização de estágio.pdf · pág. 2', trecho: 'ALUNO 1 … ALUNO 6', pergunta: 'O limite de 6 alunos por grupo vale para todos os cursos da saúde?', nota: '', opcoes: ['Todos os cursos', 'Só Enfermagem'], resposta: '' }
    ]
  };
}
