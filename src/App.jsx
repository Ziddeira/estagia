import { Navigate, Route, Routes } from 'react-router-dom';
import Entrada from './Entrada.jsx';
import PoloLayout from './polo/PoloLayout.jsx';
import Painel from './polo/Painel.jsx';
import Escala from './polo/Escala.jsx';
import Presenca from './polo/Presenca.jsx';
import Alunos from './polo/Alunos.jsx';
import Cursos from './polo/Cursos.jsx';
import Convenios from './polo/Convenios.jsx';
import Preceptores from './polo/Preceptores.jsx';
import Avaliacoes from './polo/Avaliacoes.jsx';
import Ocorrencias from './polo/Ocorrencias.jsx';
import Empresa from './polo/Empresa.jsx';
import Mec from './polo/Mec.jsx';
import Documentos from './polo/Documentos.jsx';
import AppAluno from './app/AppAluno.jsx';
import AppPreceptor from './app/AppPreceptor.jsx';
import { Toast } from './components/ui.jsx';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Entrada />} />
        <Route path="/polo" element={<PoloLayout />}>
          <Route index element={<Painel />} />
          <Route path="escala" element={<Escala />} />
          <Route path="presenca" element={<Presenca />} />
          <Route path="alunos" element={<Alunos />} />
          <Route path="cursos" element={<Cursos />} />
          <Route path="convenios" element={<Convenios />} />
          <Route path="preceptores" element={<Preceptores />} />
          <Route path="avaliacoes" element={<Avaliacoes />} />
          <Route path="ocorrencias" element={<Ocorrencias />} />
          <Route path="empresa" element={<Empresa />} />
          <Route path="mec" element={<Mec />} />
          <Route path="documentos" element={<Documentos />} />
        </Route>
        <Route path="/aluno" element={<AppAluno />} />
        <Route path="/preceptor" element={<AppPreceptor />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast />
    </>
  );
}
