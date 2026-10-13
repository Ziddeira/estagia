# EstagIA

Demonstração de um sistema de gestão de estágios da área da saúde para polos e instituições de ensino.
Três visões no mesmo site: **polo** (computador), **preceptor** e **aluno** (celular).

**Todos os dados são fictícios.** Não coloque dados reais de alunos, preceptores ou pacientes nesta versão.

## Como apresentar

1. Abra o site no celular (ou no computador) e escolha **Polo**.
2. Em **Convênios e vagas › Área de check-in**, clique em **Marcar onde estou** no *Hospital Municipal*. O navegador vai pedir permissão de localização.
3. Volte ao início, abra o **App do aluno** e faça o **check-in pela localização**: ele mede a distância real até o ponto marcado.
4. Preencha a **ficha do dia** e envie.
5. Abra o **App do preceptor**: faça o check-in dele, aceite o pedido manual do Rafael, confirme a presença e confira a ficha da Beatriz.
6. Volte ao **Polo**: em **Alunos e horas** as horas da Beatriz subiram; em **MEC, LGPD e normas** aparecem os registros.

Polo, preceptor e aluno compartilham os dados **no mesmo aparelho e navegador**. Para recomeçar, use **Reiniciar demonstração** na tela inicial (os dados também se renovam a cada dia).

Sem GPS ou sem permissão, os cartões de check-in têm a opção **Simular dentro / Simular fora**.

## O que é simulado

- Envio de e-mails, WhatsApp, assinatura digital, exportações e leitura de documentos pela IA.
- Login: cada perfil abre direto com um usuário de exemplo.
- Dados ficam só no navegador (localStorage); não há servidor.

## Rodar no computador

```bash
npm install
npm run dev
```

## Publicação

Cada `push` na branch `main` publica automaticamente no GitHub Pages pelo workflow em `.github/workflows/deploy.yml`.
