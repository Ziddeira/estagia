import { useState } from 'react';
import { useStore } from '../store.jsx';
import { Cabecalho, Chip } from '../components/ui.jsx';
import { hojeISO, diffDias, fmtAno } from '../lib/date.js';
import { obterPosicao } from '../lib/geo.js';

const CAMPOS = ['Razão social', 'CNPJ', 'Rua (avenida etc.)', 'Número', 'Bairro', 'Cidade', 'Estado', 'CEP', 'Telefone', 'E-mail', 'Tempo de vigência', 'Responsável pela empresa', 'Cargo'];

export default function Convenios() {
  const { s, up, toast, registrar } = useStore();
  const H = hojeISO();
  const [filtro, setFiltro] = useState('todos');
  const [marcando, setMarcando] = useState(null);

  const lista = s.locais.map((l) => {
    const d = diffDias(H, l.fim);
    let st = ['Vigente', 'ok'];
    if (d < 0) st = [`Vencido há ${-d} dias`, 'erro'];
    else if (d <= 60) st = [`Vence em ${d} dias`, 'at'];
    const acima = l.vagas.some((v) => v[2] > v[1]);
    return { ...l, d, st, atencao: d <= 60 || acima || !l.definido };
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
          <table className="tbl" style={{ minWidth: 980 }}>
            <thead><tr><th>Local</th><th>Tipo</th><th>Vigência</th><th>Vagas (usadas/cedidas)</th><th>Contrapartida</th><th>Ação</th></tr></thead>
            <tbody>
              {vis.map((l) => (
                <tr key={l.id}>
                  <td><strong>{l.nome}</strong></td>
                  <td className="pequeno">{l.tipo}</td>
                  <td><span className="mono pequeno">até {fmtAno(l.fim)}</span><br /><Chip tom={l.st[1]}>{l.st[0]}</Chip></td>
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
        <div><h2>Novo convênio</h2><p className="apagado" style={{ fontSize: 14, marginTop: 4 }}>Os mesmos campos da ficha de cadastro do polo. Pode preencher aqui ou mandar um link para o local preencher.</p></div>
        <div className="form-grid">{CAMPOS.map((c) => <label className="campo" key={c}>{c}<input type="text" /></label>)}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button className="btn btn-p" onClick={() => toast('Link da ficha enviado (simulação). O local preenche, o convênio fica "aguardando assinatura" e o sistema avisa quando assinar.')}>Enviar link da ficha ao local</button>
          <button className="btn btn-s" onClick={() => toast('Convênio salvo (simulação). O termo é gerado com os dados da ficha e vai para assinatura digital.')}>Salvar e gerar termo</button>
        </div>
      </section>
    </>
  );
}
