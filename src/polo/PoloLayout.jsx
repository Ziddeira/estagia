import { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { nomeMes, hojeISO } from '../lib/date.js';
import { pendentesPresenca } from '../lib/calc.js';
import { useStore } from '../store.jsx';

const GRUPOS_NAV = [
  ['Operação', [['/polo', 'Painel', true], ['/polo/escala', 'Escala'], ['/polo/presenca', 'Presença'], ['/polo/alunos', 'Alunos e horas'], ['/polo/campo', 'Campo de estágio']]],
  ['Cadastros', [['/polo/cursos', 'Cursos e regras'], ['/polo/convenios', 'Convênios e vagas'], ['/polo/preceptores', 'Preceptores']]],
  ['Acompanhamento', [['/polo/avaliacoes', 'Avaliações e relatórios'], ['/polo/ocorrencias', 'Ocorrências']]],
  ['Gestão', [['/polo/mec', 'MEC, LGPD e normas'], ['/polo/documentos', 'Documentos da instituição']]]
];

export default function PoloLayout() {
  const { s } = useStore();
  const [aberto, setAberto] = useState(false);
  const pend = pendentesPresenca(s).length;
  return (
    <div className="polo">
      <aside className="side">
        <div>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}><div className="marca">Estag<span>IA</span></div></Link>
          <div className="sub">Gestão de estágios da saúde</div>
        </div>
        <div className="unidade">
          <span className="sub">Unidade</span>
          <strong>Polo [Nome da unidade]</strong>
          <span className="sub" style={{ textTransform: 'capitalize' }}>{nomeMes(hojeISO())}</span>
        </div>
        <button className="btn btn-n so-celular" aria-expanded={aberto} onClick={() => setAberto(!aberto)}>{aberto ? 'Fechar menu' : 'Abrir menu'}</button>
        <nav aria-label="Módulos do polo" className={aberto ? '' : 'fechado'} onClick={() => setAberto(false)}>
          {GRUPOS_NAV.map(([grupo, itens]) => (
            <div key={grupo}>
              <div className="grupo-nav">{grupo}</div>
              {itens.map(([to, label, end]) => (
                <NavLink key={to} to={to} end={!!end} className={({ isActive }) => (isActive ? 'ativo' : '')}>
                  {label}{to === '/polo/presenca' && pend ? ` (${pend})` : ''}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sub apps" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span>Abrir os apps:</span>
          <Link to="/preceptor" style={{ color: 'var(--menta)' }}>App do preceptor</Link>
          <Link to="/aluno" style={{ color: 'var(--menta)' }}>App do aluno</Link>
        </div>
      </aside>
      <main className="conteudo">
        <Outlet />
      </main>
    </div>
  );
}
