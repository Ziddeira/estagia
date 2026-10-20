import { useState } from 'react';
import { useStore } from '../store.jsx';
import { Cabecalho, Chip } from '../components/ui.jsx';
import { hojeISO, diffDias, fmtAno, addDias, fmt } from '../lib/date.js';
import { formatarCNPJ, cnpjValido, consultarCNPJ, soDigitos, LINK_RECEITA } from '../lib/cnpj.js';
import { PRAZO_VALIDACAO } from '../data/seed.js';
import { obterPosicao } from '../lib/geo.js';

const VAZIO = { cnpj: '', razao: '', tipo: '', endereco: '', municipio: '', cep: '', telefone: '', email: '', meses: '24', resp: '', cargo: '', supNome: '', supForm: '', supReg: '' };
const TIPOS = ['Público municipal', 'Público estadual', 'Público federal', 'Privado', 'Filantrópico'];

export default function Convenios() {
  const { s, up, toast, registrar } = useStore();
  const H = hojeISO();
  const [filtro, setFiltro] = useState('todos');
  const [marcando, setMarcando] = useState(null);
  const [nv, setNv] = useState(VAZIO);
  const [rf, setRf] = useState(null);
  const [consultando, setConsultando] = useState(false);
  const [tentou, setTentou] = useState(false);
  const campo = (k) => ({ value: nv[k], onChange: (e) => setNv({ ...nv, [k]: e.target.value }) });

  const dCnpj = soDigitos(nv.cnpj);
  const dup = dCnpj.length === 14 ? s.locais.find((l) => l.cnpj && soDigitos(l.cnpj) === dCnpj) : null;
  const faltam = [];
  if (!cnpjValido(nv.cnpj)) faltam.push('CNPJ válido');
  if (!nv.razao.trim()) faltam.push('razão social');
  if (!nv.tipo) faltam.push('tipo do local');
  if (!nv.resp.trim()) faltam.push('responsável');
  if (!nv.supNome.trim() || !nv.supForm.trim() || !nv.supReg.trim()) faltam.push('supervisor de campo com formação e registro no conselho');
  if (rf?.ok && !rf.ativo) faltam.push('CNPJ ativo na Receita');
  if (dup) faltam.push('CNPJ que ainda não esteja cadastrado');

  const consultar = async () => {
    setConsultando(true);
    const r = await consultarCNPJ(nv.cnpj);
    setRf(r);
    setConsultando(false);
    if (r.ok) setNv((x) => ({ ...x, razao: x.razao || r.razao, endereco: x.endereco || r.endereco, municipio: x.municipio || (r.municipio ? `${r.municipio}/${r.uf}` : ''), cep: x.cep || r.cep }));
  };

  const salvar = () => {
    setTentou(true);
    if (faltam.length) { toast(`Falta: ${faltam.join(', ')}.`, 'erro'); return; }
    const id = `n${Date.now()}`;
    up((c) => {
      c.locais.push({ id, nome: nv.razao.trim(), cnpj: formatarCNPJ(nv.cnpj), tipo: nv.tipo, fim: addDias(H, Math.round(Number(nv.meses || 12) * 30.4)), vagas: [], contra: 'A definir', lat: null, lng: null, raio: 100, definido: false, situacao: 'validacao', desde: H,
        sup: { nome: nv.supNome.trim(), formacao: nv.supForm.trim(), registro: nv.supReg.trim() } });
    });
    registrar(`Convênio cadastrado: ${nv.razao.trim()} (em validação)`);
    toast(`${nv.razao.trim()} cadastrado. Fica "em validação" pela instituição por até ${PRAZO_VALIDACAO} dias; enquanto isso não entra na escala. O EstagIA avisa se passar do prazo.`);
    setNv(VAZIO); setRf(null); setTentou(false);
  };

  const lista = s.locais.map((l) => {
    const d = diffDias(H, l.fim);
    let st = ['Vigente', 'ok'];
    if (d < 0) st = [`Vencido há ${-d} dias`, 'erro'];
    else if (d <= 60) st = [`Vence em ${d} dias`, 'at'];
    const acima = l.vagas.some((v) => v[2] > v[1]);
    return { ...l, d, st, atencao: d <= 60 || acima || !l.definido || l.situacao === 'validacao' };
  });
  const vis = filtro === 'atencao' ? lista.filter((l) => l.atencao) : lista;

  const marcarAqui = async (l) => {
    setMarcando(l.id);
    try {
      const p = await obterPosicao();
      up((c) => { Object.assign(c.locais.find((x) => x.id === l.id), { lat: p.lat, lng: p.lng, definido: true }); });
      registrar(`Ponto de check-in de ${l.nome} marcado pela localização atual`);
      toast(`Ponto de ${l.nome} marcado onde você está agora (precisão ±${p.precisao} m). Agora o check-in de alunos e preceptores mede a distância até aqui.`);
    } catch (e) {
      toast(e.message, 'erro');
    }
    setMarcando(null);
  };

  return (
    <>
      <Cabecalho titulo="Convênios e vagas" texto="Locais de estágio, vigência, vagas cedidas por curso, contrapartida e a área onde o check-in é aceito." />

      <section className="card">
        <div>
          <h2>Área de check-in de cada local</h2>
          <p className="apagado" style={{ fontSize: 14, marginTop: 4 }}>O check-in de alunos e preceptores só é aceito dentro do raio em volta do ponto marcado. <strong>Na demonstração:</strong> clique em "Marcar onde estou" no Hospital Municipal e depois faça o check-in no app do aluno ou do preceptor.</p>
        </div>
        <div className="scroll">
          <table className="tbl" style={{ minWidth: 820 }}>
            <thead><tr><th>Local</th><th>Ponto cadastrado</th><th>Raio aceito</th><th>Situação</th><th>Ação</th></tr></thead>
            <tbody>
              {s.locais.map((l) => (
                <tr key={l.id}>
                  <td><strong>{l.nome}</strong></td>
                  <td className="mapa-pin">{l.definido ? `${l.lat.toFixed(5)}, ${l.lng.toFixed(5)}` : 'Ponto não marcado'}</td>
                  <td>
                    <select className="solto" aria-label={`Raio de ${l.nome}`} value={l.raio} onChange={(e) => { const r = Number(e.target.value); up((c) => { c.locais.find((x) => x.id === l.id).raio = r; }); toast(`Raio de ${l.nome}: ${r} m.`); }}>
                      {[50, 100, 150, 300, 500].map((r) => <option key={r} value={r}>{r} m</option>)}
                    </select>
                  </td>
                  <td><Chip tom={l.definido ? 'ok' : 'erro'}>{l.definido ? 'Área definida' : 'Falta marcar o ponto'}</Chip></td>
                  <td><button className="btn btn-s" disabled={marcando === l.id} onClick={() => marcarAqui(l)}>{marcando === l.id ? 'Lendo localização…' : 'Marcar onde estou'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="nota">Na versão real, o polo também pode arrastar o marcador num mapa até a entrada do prédio, sem precisar ir ao local.</p>
      </section>

      <section className="card">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
          <h2>Locais conveniados</h2>
          <div className="abas">
            {[['todos', 'Todos'], ['atencao', 'Precisam de atenção']].map(([id, l]) => <button key={id} className={filtro === id ? 'sel' : ''} onClick={() => setFiltro(id)}>{l}</button>)}
          </div>
        </div>
        <div className="scroll">
          <table className="tbl" style={{ minWidth: 1120 }}>
            <thead><tr><th>Local</th><th>Tipo</th><th>Supervisor de campo</th><th>Vigência</th><th>Vagas (usadas/cedidas)</th><th>Contrapartida</th><th>Ação</th></tr></thead>
            <tbody>
              {vis.map((l) => (
                <tr key={l.id}>
                  <td><strong>{l.nome}</strong>{l.cnpj && <span className="sub mono">{l.cnpj}</span>}</td>
                  <td className="pequeno">{l.tipo}</td>
                  <td className="pequeno">{l.sup ? <>{l.sup.nome}<span className="sub">{l.sup.formacao} · {l.sup.registro}</span></> : <span className="txt-erro">Sem supervisor</span>}</td>
                  <td><span className="mono pequeno">até {fmtAno(l.fim)}</span><br />{l.situacao === 'validacao' ? <Chip tom={diffDias(l.desde, H) > PRAZO_VALIDACAO ? 'erro' : 'info'}>{`Em validação desde ${fmt(l.desde)}`}</Chip> : <Chip tom={l.st[1]}>{l.st[0]}</Chip>}</td>
                  <td>{l.vagas.map(([c, n, u]) => <div key={c} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 14 }}><span>{c}</span><span className={`mono ${u > n ? 'txt-erro' : ''}`} style={{ fontWeight: 600 }}>{u}/{n}{u > n ? ' acima' : ''}</span></div>)}</td>
                  <td className="pequeno">{l.contra}</td>
                  <td>{l.d <= 60 && <button className="btn btn-p" onClick={() => toast(`E-mail de renovação para ${l.nome}:\n\nPrezado(a) senhor(a), viemos demonstrar interesse em renovar o convênio com ${l.nome} para estágios dos cursos indicados por esta instituição. Os estagiários terão cobertura de seguro de acidentes pessoais. Segue o link da ficha para atualizar os dados da empresa.`)}>Pedir renovação</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <div><h2>Novo convênio</h2><p className="apagado" style={{ fontSize: 14, marginTop: 4 }}>Os campos da ficha de cadastro do campo de estágio. O EstagIA confere o CNPJ na Receita e se o local já está cadastrado, para não abrir cadastro duplicado.</p></div>
        <h3>Local</h3>
        <div className="form-grid">
          <label className="campo">CNPJ
            <input inputMode="numeric" value={nv.cnpj} onChange={(e) => { setNv({ ...nv, cnpj: formatarCNPJ(e.target.value) }); setRf(null); }} placeholder="00.000.000/0000-00" />
          </label>
          <div className="campo" style={{ justifyContent: 'flex-end' }}>
            <button className="btn btn-s" disabled={!cnpjValido(nv.cnpj) || consultando} onClick={consultar}>{consultando ? 'Consultando…' : 'Consultar na Receita'}</button>
          </div>
          <label className="campo">Razão social<input {...campo('razao')} /></label>
          <label className="campo">Tipo do local
            <select {...campo('tipo')}><option value="">Escolha</option>{TIPOS.map((t) => <option key={t}>{t}</option>)}</select>
          </label>
          <label className="campo">Endereço<input {...campo('endereco')} /></label>
          <label className="campo">Município/UF<input {...campo('municipio')} /></label>
          <label className="campo">CEP<input inputMode="numeric" {...campo('cep')} /></label>
          <label className="campo">Telefone<input inputMode="tel" {...campo('telefone')} /></label>
          <label className="campo">E-mail<input type="email" {...campo('email')} /></label>
          <label className="campo">Vigência (meses)<input type="number" min="1" max="60" {...campo('meses')} /></label>
          <label className="campo">Diretor ou responsável<input {...campo('resp')} /></label>
          <label className="campo">Cargo do responsável<input {...campo('cargo')} /></label>
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {nv.cnpj && soDigitos(nv.cnpj).length === 14 && !cnpjValido(nv.cnpj) && <span className="txt-erro">CNPJ com dígito errado. Confira com o local.</span>}
          {dup && <span className="txt-erro">Esse CNPJ já está cadastrado como {dup.nome}. Use o cadastro existente.</span>}
          {rf?.ok && rf.ativo && <span className="txt-ok">Receita Federal: CNPJ ativo ({rf.razao}).</span>}
          {rf?.ok && !rf.ativo && <span className="txt-erro">Receita Federal: situação {rf.situacao.toLowerCase()}. Sem CNPJ ativo, o local não pode receber estagiários.</span>}
          {rf && !rf.ok && <span className="txt-at">{rf.motivo} <a href={LINK_RECEITA} target="_blank" rel="noopener noreferrer">Abrir o site da Receita</a></span>}
        </div>
        <h3>Supervisor de campo</h3>
        <div className="form-grid">
          <label className="campo">Nome<input {...campo('supNome')} /></label>
          <label className="campo">Formação (graduação)<input {...campo('supForm')} /></label>
          <label className="campo">Registro no conselho<input {...campo('supReg')} placeholder="Ex.: Coren-SC 000000" /></label>
        </div>
        {tentou && faltam.length > 0 && <span className="txt-erro" style={{ fontSize: 14, fontWeight: 600 }}>Falta: {faltam.join(', ')}.</span>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button className="btn btn-p" onClick={salvar}>Salvar convênio</button>
          <button className="btn btn-s" onClick={() => toast('Link da ficha enviado (simulação). O local preenche, o EstagIA confere o CNPJ e o convênio fica "em validação".')}>Enviar link da ficha ao local</button>
        </div>
      </section>
    </>
  );
}
