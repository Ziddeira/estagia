// Regras e cálculos usados pelas telas.
import { CURSOS, GRUPOS, PRECEPTORES, TURNOS, DOCS, RELPEND, LIMITE_MENSAL } from '../data/seed.js';
import { hojeISO, addDias, mesAno, FERIADOS, fmt } from './date.js';

export const G = Object.fromEntries(GRUPOS.map((g) => [g.id, g]));
export const P = Object.fromEntries(PRECEPTORES.map((p) => [p.id, p]));

export const doc = (gid, i) => DOCS[`${gid}:${i}`] || null;
export const bloqueado = (gid, i) => doc(gid, i)?.nivel === 'bloq';
export const relPendente = (gid, i) => RELPEND.includes(`${gid}:${i}`);

export function local(s, id) {
  return s.locais.find((l) => l.id === id);
}

export function cenNome(gid, cid) {
  return CURSOS[G[gid].curso].cen.find((c) => c.id === cid)?.nome || cid;
}

export function ordenar(turnos) {
  return turnos.slice().sort((a, b) => (a.data + a.turno).localeCompare(b.data + b.turno));
}

export function chaves(turnos) {
  const kP = {}, kG = {};
  turnos.forEach((t) => {
    const a = `${t.prec}|${t.data}|${t.turno}`;
    const b = `${t.grupo}|${t.data}|${t.turno}`;
    kP[a] = (kP[a] || 0) + 1;
    kG[b] = (kG[b] || 0) + 1;
  });
  return { kP, kG };
}

export function emConflito(t, k) {
  return k.kP[`${t.prec}|${t.data}|${t.turno}`] > 1 || k.kG[`${t.grupo}|${t.data}|${t.turno}`] > 1;
}

export function horasPrecMes(turnos, prec, mes) {
  return turnos.filter((t) => t.prec === prec && mesAno(t.data) === mes).reduce((a, t) => a + TURNOS[t.turno].ch, 0);
}

export function pendentesPresenca(s) {
  const H = hojeISO();
  return ordenar(s.turnos).filter((t) => t.data <= H && !t.pres);
}

export function turnoHojeDe(s, prec) {
  const H = hojeISO();
  return s.turnos.find((t) => t.prec === prec && t.data === H) || null;
}

export function turnoHojeDoGrupo(s, gid) {
  const H = hojeISO();
  return s.turnos.find((t) => t.grupo === gid && t.data === H) || null;
}

// Horas confirmadas de um aluno, por cenário
export function horasAluno(s, gid, i) {
  const g = G[gid];
  const cur = CURSOS[g.curso];
  const conf = {};
  s.turnos.forEach((t) => {
    if (t.grupo === gid && t.pres && t.pres[i]) conf[t.cen] = (conf[t.cen] || 0) + TURNOS[t.turno].ch;
  });
  return cur.cen.map((c) => {
    const feito = Math.max(0, (g.base[c.id] || 0) - (i % 3) * 6) + (conf[c.id] || 0);
    return { id: c.id, nome: c.nome, feito, meta: c.meta, pct: Math.min(100, Math.round((feito / c.meta) * 100)) };
  });
}

// Validação de um turno novo
export function validarTurno(s, f) {
  const H = hojeISO();
  const erros = [], avisos = [];
  const g = G[f.grupo];
  const cur = CURSOS[g.curso];
  const ch = TURNOS[f.turno].ch;
  const k = chaves(s.turnos);
  const minimo = addDias(H, 3);
  const loc = local(s, f.local);
  if (!f.data) erros.push('Escolha a data.');
  else if (f.data < minimo) erros.push(`A CLT exige convocar o preceptor intermitente com 3 dias corridos de antecedência (art. 452-A). Primeira data possível: ${fmt(minimo)}.`);
  if (FERIADOS[f.data]) erros.push(`Essa data é feriado nacional (${FERIADOS[f.data]}).`);
  if (k.kP[`${f.prec}|${f.data}|${f.turno}`]) erros.push(`${P[f.prec].nome} já tem turno nesse dia e horário.`);
  if (k.kG[`${f.grupo}|${f.data}|${f.turno}`]) erros.push(`O ${g.nome} já está escalado nesse dia e horário.`);
  const total = f.data ? horasPrecMes(s.turnos, f.prec, mesAno(f.data)) + ch : 0;
  if (total > LIMITE_MENSAL) erros.push(`${P[f.prec].nome} passaria para ${total}h no mês, acima do limite de ${LIMITE_MENSAL}h.`);
  if (g.alunos.length > cur.limite) erros.push(`${g.nome} tem ${g.alunos.length} alunos e o limite por supervisor é ${cur.limite} (${cur.fonte}). Divida o grupo antes de escalar.`);
  if (loc && !loc.definido) erros.push(`${loc.nome} ainda não tem área de check-in. Marque o ponto em Convênios e vagas.`);
  if (loc && loc.fim < (f.data || H)) erros.push(`O convênio com ${loc.nome} estará vencido nessa data.`);
  const nBl = g.alunos.filter((_, i) => bloqueado(g.id, i)).length;
  if (nBl) avisos.push(`${nBl} ${nBl === 1 ? 'aluno fica' : 'alunos ficam'} fora deste turno até regularizar documento.`);
  return { erros, avisos, total };
}

export function alertas(s) {
  const H = hojeISO();
  const lista = [];
  const ord = ordenar(s.turnos);
  const k = chaves(s.turnos);
  const vistos = {};
  ord.forEach((t) => {
    const a = `${t.prec}|${t.data}|${t.turno}`;
    if (k.kP[a] > 1 && !vistos[a] && t.data >= H) {
      vistos[a] = 1;
      lista.push({ tom: 'erro', tag: 'Bloqueio', titulo: `${P[t.prec].nome} está em dois lugares ao mesmo tempo`, texto: `${fmt(t.data)} (${TURNOS[t.turno].label}): dois turnos no mesmo horário, com o mesmo grupo.`, acao: 'Abrir escala', ir: '/polo/escala' });
    }
  });
  GRUPOS.forEach((g) => {
    const cur = CURSOS[g.curso];
    if (g.alunos.length > cur.limite) lista.push({ tom: 'erro', tag: 'Bloqueio', titulo: `${g.nome} acima do limite do conselho`, texto: `${g.alunos.length} alunos para 1 supervisor; o limite é ${cur.limite} (${cur.fonte}).`, acao: 'Ver regras do curso', ir: '/polo/cursos' });
  });
  s.locais.forEach((l) => {
    const temTurno = s.turnos.some((t) => t.local === l.id && t.data >= H);
    if (l.fim < H && temTurno) lista.push({ tom: 'erro', tag: 'Bloqueio', titulo: 'Convênio vencido com turno marcado', texto: `${l.nome}: convênio vencido e há turno marcado.`, acao: 'Abrir convênios', ir: '/polo/convenios' });
    if (!l.definido && temTurno) lista.push({ tom: 'erro', tag: 'Bloqueio', titulo: 'Local sem área de check-in', texto: `${l.nome} não tem o ponto marcado no mapa. Ninguém consegue fazer check-in lá.`, acao: 'Marcar ponto', ir: '/polo/convenios' });
  });
  const nBloq = GRUPOS.reduce((a, g) => a + g.alunos.filter((_, i) => bloqueado(g.id, i)).length, 0);
  if (nBloq) lista.push({ tom: 'erro', tag: 'Bloqueio', titulo: `${nBloq} alunos bloqueados por documento`, texto: 'Seguro vencido, vacina incompleta, TCE sem assinatura, dosímetro e idade mínima em Radiologia.', acao: 'Ver alunos', ir: '/polo/alunos' });
  const mes = mesAno(H);
  PRECEPTORES.forEach((p) => {
    const h = horasPrecMes(s.turnos, p.id, mes);
    if (h > LIMITE_MENSAL) lista.push({ tom: 'erro', tag: 'Bloqueio', titulo: `${p.nome} passou do limite mensal`, texto: `${h}h escaladas para ${LIMITE_MENSAL}h.`, acao: 'Abrir escala', ir: '/polo/escala' });
    else if (h >= LIMITE_MENSAL * 0.85) lista.push({ tom: 'at', tag: 'Atenção', titulo: `${p.nome} está perto do limite`, texto: `${h}h de ${LIMITE_MENSAL}h neste mês.`, acao: 'Abrir escala', ir: '/polo/escala' });
  });
  const pend = pendentesPresenca(s);
  if (pend.length) lista.push({ tom: 'at', tag: 'Atenção', titulo: `${pend.length} ${pend.length === 1 ? 'turno sem' : 'turnos sem'} presença confirmada`, texto: 'Sem a confirmação do preceptor, as horas não entram para os alunos.', acao: 'Ver presença', ir: '/polo/presenca' });
  const silencio = s.convocacoes.filter((c) => c.st === 'silencio');
  silencio.forEach((c) => lista.push({ tom: 'at', tag: 'Atenção', titulo: 'Convocação sem resposta conta como recusa', texto: `${P[c.prec].nome} não respondeu no prazo de 1 dia útil (CLT, art. 452-A). É preciso convocar de novo.`, acao: 'Ver convocações', ir: '/polo/preceptores' }));
  Object.entries(DOCS).filter(([, d]) => d.nivel === 'aviso').forEach(([key, d]) => {
    const [gid, i] = key.split(':');
    lista.push({ tom: 'at', tag: 'Atenção', titulo: 'Documento perto de vencer', texto: `${G[gid].alunos[i]}: ${d.texto}.`, acao: 'Ver alunos', ir: '/polo/alunos' });
  });
  if (!s.relCobrados) lista.push({ tom: 'at', tag: 'Atenção', titulo: `${RELPEND.length} relatórios semestrais pendentes`, texto: 'A Lei 11.788 exige relatório a cada 6 meses no máximo.', acao: 'Cobrar alunos', ir: '/polo/avaliacoes' });
  const fichasPend = Object.values(s.fichas).filter((f) => f.status === 'enviada').length;
  if (fichasPend) lista.push({ tom: 'at', tag: 'Atenção', titulo: `${fichasPend} fichas de acompanhamento aguardando o preceptor`, texto: 'Fichas enviadas pelos alunos que ainda não foram conferidas.', acao: 'Ver presença', ir: '/polo/presenca' });
  return lista;
}
