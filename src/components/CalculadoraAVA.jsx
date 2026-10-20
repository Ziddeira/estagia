import { useState } from 'react';
import { useStore } from '../store.jsx';
import { TURNOS } from '../data/seed.js';
import { periodoAVA, proximoDiaUtil } from '../lib/calc.js';
import { hojeISO, addDias, fmtAno, DIAS_SEMANA } from '../lib/date.js';

// Monta o que o aluno digita em "Editar estágio" no AVA: data de início, data de fim
// e a planilha de horários por dia da semana. A data de fim cobre a carga horária
// sem contar feriados nacionais e, se a regra pedir, sem sábado e domingo.
export default function CalculadoraAVA({ chInicial = 150, planilhaInicial = { 1: 'mat', 3: 'mat', 5: 'mat' }, compacto = false }) {
  const { s, toast } = useStore();
  const fds = s.regras.fds;
  const [ch, setCh] = useState(chInicial);
  const [inicio, setInicio] = useState(proximoDiaUtil(addDias(hojeISO(), 3)));
  const [planilha, setPlanilha] = useState(planilhaInicial);
  const r = periodoAVA({ inicio, ch: Number(ch), planilha, fds });
  const dias = fds ? [1, 2, 3, 4, 5, 6, 0] : [1, 2, 3, 4, 5];

  const texto = () => {
    const linhas = dias.filter((d) => planilha[d]).map((d) => {
      const t = TURNOS[planilha[d]];
      const [a, b] = t.hora.split('–');
      return `${DIAS_SEMANA[d]}: ${t.label} · início ${a} · fim ${b}`;
    });
    return `Data início: ${fmtAno(r.inicio)}\nData fim: ${fmtAno(r.fim)}\n${linhas.join('\n')}`;
  };
  const copiar = async () => {
    try { await navigator.clipboard.writeText(texto()); toast('Copiado. Cole no AVA, em Cadastro de estágio > Editar estágio.'); }
    catch (e) { toast(texto()); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className={compacto ? 'duas' : 'form-grid'}>
        <label className="campo">Carga a cumprir (h)
          <input type="number" min="1" max="2000" value={ch} onChange={(e) => setCh(e.target.value)} />
        </label>
        <label className="campo">Começa em
          <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
        </label>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--tinta-2)' }}>Horário em cada dia da semana</span>
        {dias.map((d) => (
          <label key={d} style={{ display: 'grid', gridTemplateColumns: '84px 1fr', gap: 10, alignItems: 'center', fontSize: 14 }}>
            <span>{DIAS_SEMANA[d]}</span>
            <select className="solto" value={planilha[d] || ''} onChange={(e) => setPlanilha({ ...planilha, [d]: e.target.value || null })} aria-label={`Horário de ${DIAS_SEMANA[d]}`}>
              <option value="">Sem estágio</option>
              {Object.entries(TURNOS).map(([id, t]) => <option key={id} value={id}>{t.label} ({t.hora})</option>)}
            </select>
          </label>
        ))}
        {!fds && <span className="nota">Sábado e domingo ficam de fora: o AVA desta instituição não aceita.</span>}
      </div>

      {r.erros.length ? (
        <div className="alerta-box">{r.erros.map((e) => <div key={e} className="txt-erro" style={{ fontWeight: 600 }}>{e}</div>)}</div>
      ) : (
        <div className="alerta-box" style={{ background: 'var(--verde-claro)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 18px' }}>
            <span>Data início <strong className="mono">{fmtAno(r.inicio)}</strong></span>
            <span>Data fim <strong className="mono">{fmtAno(r.fim)}</strong></span>
          </div>
          <span style={{ fontSize: 14 }}>{r.dias} dias de estágio, {r.porSemana}h por semana{r.sobra > 0 ? `; o último dia passa ${r.sobra}h da carga` : ''}.</span>
          {r.pulados.length > 0 && <span style={{ fontSize: 14 }}>Feriados no período, que não contam: {r.pulados.map((p) => `${fmtAno(p.data).slice(0, 5)} (${p.nome})`).join(', ')}.</span>}
          <button className="btn btn-s" style={{ alignSelf: 'flex-start' }} onClick={copiar}>Copiar para o AVA</button>
        </div>
      )}
    </div>
  );
}
