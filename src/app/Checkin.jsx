import { useState } from 'react';
import { checkinNoLocal, textoDistancia } from '../lib/geo.js';
import { horaAgora } from '../lib/date.js';

// Cartão de check-in por geolocalização, usado pelo aluno e pelo preceptor.
// registro: { hora, dist, dentro, precisao, manual, saida } ou null
export default function Checkin({ local, registro, onSalvar, quemAprovaManual, liberadoManual, onSimularAprovacao }) {
  const [lendo, setLendo] = useState(false);
  const [erro, setErro] = useState('');
  const [ultimaFora, setUltimaFora] = useState(null);

  const tentar = async () => {
    setErro('');
    setLendo(true);
    try {
      const r = await checkinNoLocal(local);
      if (r.dentro) {
        onSalvar({ hora: horaAgora(), dist: r.dist, precisao: r.precisao, dentro: true });
        setUltimaFora(null);
      } else {
        setUltimaFora(r);
      }
    } catch (e) {
      setErro(e.message);
    }
    setLendo(false);
  };

  const simular = (dentro) => {
    setErro('');
    if (dentro) { onSalvar({ hora: horaAgora(), dist: 42, precisao: 12, dentro: true, simulado: true }); setUltimaFora(null); }
    else setUltimaFora({ dist: 2300, precisao: 15, simulado: true });
  };

  const pedirManual = () => {
    onSalvar({ hora: horaAgora(), dist: ultimaFora?.dist ?? null, precisao: ultimaFora?.precisao ?? null, dentro: false, manual: true });
    setUltimaFora(null);
  };

  if (!local.definido) {
    return (
      <div className="pcard">
        <strong>Check-in</strong>
        <span className="txt-erro" style={{ fontSize: 14 }}>{local.nome} ainda não tem área de check-in cadastrada pelo polo. Avise a coordenação.</span>
      </div>
    );
  }

  return (
    <div className="pcard">
      <strong>Check-in</strong>
      {!registro && !ultimaFora && <span className="apagado" style={{ fontSize: 14 }}>Você ainda não fez check-in. Ele só vale dentro de {local.raio} m do ponto cadastrado para {local.nome}.</span>}

      {registro && registro.dentro && (
        <span className="txt-ok" style={{ fontSize: 14 }}>
          Check-in às {registro.hora} · {textoDistancia(registro.dist)} de {local.nome} (área aceita: {local.raio} m{registro.precisao ? `, precisão ±${registro.precisao} m` : ''}){registro.simulado ? ' · simulado' : ''}.
          {registro.saida ? ` Check-out às ${registro.saida}.` : ''}
        </span>
      )}
      {registro && registro.manual && (
        <span className="txt-at" style={{ fontSize: 14 }}>
          Pedido de check-in manual às {registro.hora}{registro.dist != null ? ` (${textoDistancia(registro.dist)} do local)` : ''}. {liberadoManual ? 'Liberado.' : `Aguardando ${quemAprovaManual}.`}
          {registro.saida ? ` Check-out às ${registro.saida}.` : ''}
        </span>
      )}
      {ultimaFora && (
        <span className="txt-erro" style={{ fontSize: 14 }}>
          Você está a {textoDistancia(ultimaFora.dist)} de {local.nome}{ultimaFora.precisao ? ` (precisão ±${ultimaFora.precisao} m)` : ''}. O check-in só vale dentro de {local.raio} m do endereço cadastrado pelo polo.
        </span>
      )}
      {erro && <span className="txt-erro" style={{ fontSize: 14 }}>{erro}</span>}

      {!registro && !ultimaFora && (
        <button className="btn btn-p btn-grande" disabled={lendo} onClick={tentar}>{lendo ? 'Lendo a sua localização…' : 'Fazer check-in pela localização'}</button>
      )}
      {ultimaFora && (
        <div className="duas">
          <button className="btn btn-p btn-grande" disabled={lendo} onClick={tentar}>{lendo ? 'Lendo…' : 'Tentar de novo'}</button>
          <button className="btn btn-s btn-grande" onClick={pedirManual}>Pedir liberação</button>
        </div>
      )}
      {registro && registro.manual && !liberadoManual && onSimularAprovacao && (
        <button className="btn btn-n" onClick={onSimularAprovacao}>Simular aprovação ({quemAprovaManual})</button>
      )}
      {registro && !registro.saida && (registro.dentro || liberadoManual) && (
        <button className="btn btn-s btn-grande" onClick={() => onSalvar({ ...registro, saida: horaAgora() })}>Fazer check-out</button>
      )}

      {!registro && (erro || ultimaFora == null) && (
        <details style={{ fontSize: 13 }}>
          <summary className="apagado" style={{ cursor: 'pointer' }}>Sem GPS agora? Simular para a demonstração</summary>
          <div className="duas" style={{ marginTop: 8 }}>
            <button className="btn btn-n" onClick={() => simular(true)}>Simular dentro</button>
            <button className="btn btn-n" onClick={() => simular(false)}>Simular fora</button>
          </div>
        </details>
      )}
      <span className="nota">A localização é lida só no check-in e no check-out. Sem internet, o registro fica no celular e é enviado depois (versão real).</span>
    </div>
  );
}
