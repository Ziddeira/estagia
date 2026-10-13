import { Link } from 'react-router-dom';
import { useStore } from './store.jsx';

export default function Entrada() {
  const { reiniciar } = useStore();
  return (
    <main className="entrada">
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="marca">Estag<span>IA</span></div>
        <p style={{ color: 'var(--sidebar-apagado)', maxWidth: 560 }}>
          Gestão de estágios da área da saúde: escala, presença por geolocalização, horas por cenário, documentos e a fiscalização em dia.
        </p>
      </div>
      <div className="perfis">
        <Link className="perfil" to="/polo">
          <span className="chip chip-info" style={{ alignSelf: 'flex-start' }}>Computador</span>
          <strong>Polo</strong>
          <span className="apagado">Coordenação: escala, presença, convênios, preceptores, documentos e MEC.</span>
        </Link>
        <Link className="perfil" to="/preceptor">
          <span className="chip chip-ok" style={{ alignSelf: 'flex-start' }}>Celular</span>
          <strong>Preceptor</strong>
          <span className="apagado">Ana Ribeiro · Enfermagem. Check-in, presença dos alunos, fichas e convocações.</span>
        </Link>
        <Link className="perfil" to="/aluno">
          <span className="chip chip-ok" style={{ alignSelf: 'flex-start' }}>Celular</span>
          <strong>Aluno</strong>
          <span className="apagado">Beatriz Souza · Enfermagem G1. Check-in, ficha do dia, horas e documentos.</span>
        </Link>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, maxWidth: 620, textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--sidebar-apagado)' }}>
          Demonstração com dados fictícios. Polo, preceptor e aluno compartilham os dados neste aparelho: o que o aluno faz aparece para o preceptor e para o polo.
        </p>
        <button className="btn btn-n" onClick={reiniciar}>Reiniciar demonstração</button>
      </div>
    </main>
  );
}
