// Estado da demonstração: fica salvo no navegador (localStorage).
// Polo, preceptor e aluno compartilham o mesmo estado quando abertos no mesmo aparelho.
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { criarEstado } from './data/seed.js';
import { hojeISO, horaAgora, fmt } from './lib/date.js';

const CHAVE = 'estagia-demo-v1';
const Ctx = createContext(null);

function carregar() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (bruto) {
      const s = JSON.parse(bruto);
      // Recria os dados quando o dia muda, para o turno de "hoje" continuar sendo hoje
      if (s && s.versao === 1 && s.criadoEm === hojeISO()) return s;
    }
  } catch (e) { /* navegador sem armazenamento: segue com dados novos */ }
  return criarEstado();
}

export function StoreProvider({ children }) {
  const [s, setS] = useState(carregar);
  const [aviso, setAviso] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(CHAVE, JSON.stringify(s)); } catch (e) { /* ignora */ }
  }, [s]);

  const up = useCallback((mutar) => {
    setS((atual) => {
      const copia = structuredClone(atual);
      mutar(copia);
      return copia;
    });
  }, []);

  const toast = useCallback((texto, tom = 'ok') => {
    setAviso({ texto, tom, id: Date.now() });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAviso(null), 6000);
  }, []);

  const registrar = useCallback((txt) => {
    up((c) => { c.log.unshift({ quando: `${fmt(hojeISO())} ${horaAgora()}`, txt }); c.log = c.log.slice(0, 30); });
  }, [up]);

  const reiniciar = useCallback(() => {
    const novo = criarEstado();
    setS(novo);
    toast('Demonstração reiniciada com os dados originais.');
  }, [toast]);

  return (
    <Ctx.Provider value={{ s, up, toast, aviso, fecharAviso: () => setAviso(null), registrar, reiniciar }}>
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  return useContext(Ctx);
}
