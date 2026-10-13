// Datas como texto 'AAAA-MM-DD' para comparar e guardar sem fuso.
export function hojeISO() {
  return toISO(new Date());
}

export function toISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export function fromISO(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDias(iso, n) {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export function diffDias(a, b) {
  return Math.round((fromISO(b) - fromISO(a)) / 86400000);
}

const DOW = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function fmt(iso) {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

export function fmtAno(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function dow(iso) {
  return DOW[fromISO(iso).getDay()];
}

export function mesAno(iso) {
  return iso.slice(0, 7);
}

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

export function nomeMes(iso) {
  const d = fromISO(iso);
  return `${MESES[d.getMonth()]}/${d.getFullYear()}`;
}

export function horaAgora() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// Feriados nacionais (sem pontos facultativos)
export const FERIADOS = {
  '2026-01-01': 'Confraternização Universal', '2026-04-03': 'Sexta-feira Santa', '2026-04-21': 'Tiradentes',
  '2026-05-01': 'Dia do Trabalho', '2026-09-07': 'Independência', '2026-10-12': 'Nossa Senhora Aparecida',
  '2026-11-02': 'Finados', '2026-11-15': 'Proclamação da República', '2026-11-20': 'Consciência Negra',
  '2026-12-25': 'Natal', '2027-01-01': 'Confraternização Universal', '2027-03-26': 'Sexta-feira Santa',
  '2027-04-21': 'Tiradentes', '2027-05-01': 'Dia do Trabalho', '2027-09-07': 'Independência',
  '2027-10-12': 'Nossa Senhora Aparecida', '2027-11-02': 'Finados', '2027-11-15': 'Proclamação da República',
  '2027-11-20': 'Consciência Negra', '2027-12-25': 'Natal'
};
