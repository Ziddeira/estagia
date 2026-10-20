// Lê o CSV do relatório de matrícula e resume por situação e por curso da saúde.
import { CURSOS } from '../data/seed.js';

const semAcento = (t) => (t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

function dividir(linha, sep) {
  const out = []; let atual = ''; let aspas = false;
  for (const ch of linha) {
    if (ch === '"') aspas = !aspas;
    else if (ch === sep && !aspas) { out.push(atual); atual = ''; }
    else atual += ch;
  }
  out.push(atual);
  return out.map((x) => x.trim());
}

export function lerMatriculas(texto) {
  const linhas = texto.replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim());
  if (linhas.length < 2) return { erro: 'O arquivo está vazio ou só tem o cabeçalho.' };
  const sep = (linhas[0].match(/;/g) || []).length >= (linhas[0].match(/,/g) || []).length ? ';' : ',';
  const cab = dividir(linhas[0], sep).map(semAcento);
  const col = (...nomes) => cab.findIndex((c) => nomes.some((n) => c.includes(n)));
  const iNome = col('nome', 'aluno'), iRa = col('ra', 'matricula'), iCurso = col('curso'), iSit = col('situacao', 'status');
  if (iNome < 0 || iCurso < 0 || iSit < 0) return { erro: 'Não encontrei as colunas de nome, curso e situação no cabeçalho.' };
  const saude = Object.values(CURSOS).map((c) => semAcento(c.nome));
  const grupos = { novos: 0, veteranos: 0, formandos: 0, outros: 0 };
  const porCurso = {};
  const alunos = [];
  linhas.slice(1).forEach((l) => {
    const v = dividir(l, sep);
    const sit = semAcento(v[iSit]);
    const g = sit.includes('pre') ? 'novos' : sit.includes('formando') ? 'formandos' : sit.includes('ativa') ? 'veteranos' : 'outros';
    grupos[g]++;
    const curso = v[iCurso] || '';
    const ehSaude = saude.some((s) => semAcento(curso).includes(s));
    if (ehSaude && g !== 'outros') porCurso[curso] = (porCurso[curso] || 0) + 1;
    if (alunos.length < 6) alunos.push({ nome: v[iNome], ra: iRa >= 0 ? v[iRa] : '', curso, situacao: v[iSit], saude: ehSaude });
  });
  return { total: linhas.length - 1, grupos, porCurso, alunos };
}

export const MODELO_CSV = [
  'Nome;RA;Curso;Semestre;Situação',
  'Aluno Exemplo Um;0000001;Enfermagem;7;Matrícula ativa',
  'Aluno Exemplo Dois;0000002;Fisioterapia;9;Formando',
  'Aluno Exemplo Três;0000003;Nutrição;1;Matrícula pré-confirmada',
  'Aluno Exemplo Quatro;0000004;Administração;3;Matrícula ativa'
].join('\n');
