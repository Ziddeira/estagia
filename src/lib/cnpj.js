// CNPJ: limpa, formata, confere os dígitos e consulta a situação na Receita (BrasilAPI).
export const soDigitos = (v) => (v || '').replace(/\D/g, '');

export function formatarCNPJ(v) {
  const d = soDigitos(v).slice(0, 14);
  return d.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2');
}

export function cnpjValido(v) {
  const d = soDigitos(v);
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;
  const calc = (n) => {
    const pesos = n === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const soma = pesos.reduce((a, p, i) => a + Number(d[i]) * p, 0);
    const r = soma % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return calc(12) === Number(d[12]) && calc(13) === Number(d[13]);
}

export const LINK_RECEITA = 'https://solucoes.receita.fazenda.gov.br/Servicos/cnpjreva/Cnpjreva_Solicitacao.asp';

// Consulta pública; se falhar, a tela manda conferir no site da Receita.
export async function consultarCNPJ(v) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const r = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${soDigitos(v)}`, { signal: ctrl.signal });
    if (r.status === 404) return { ok: false, motivo: 'CNPJ não encontrado na Receita Federal.' };
    if (!r.ok) throw new Error('falha');
    const j = await r.json();
    return {
      ok: true,
      ativo: (j.descricao_situacao_cadastral || '').toUpperCase() === 'ATIVA',
      situacao: j.descricao_situacao_cadastral || 'desconhecida',
      razao: j.razao_social || '',
      endereco: [j.descricao_tipo_de_logradouro, j.logradouro, j.numero, j.bairro].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim(),
      municipio: j.municipio || '', uf: j.uf || '', cep: j.cep || ''
    };
  } catch (e) {
    return { ok: false, motivo: 'Não foi possível consultar a Receita agora. Confira a situação no site da Receita antes de salvar.', falhou: true };
  } finally {
    clearTimeout(t);
  }
}
