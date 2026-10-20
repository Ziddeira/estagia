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
7. No **App do aluno**, aba **Horas**, a Beatriz vê as datas certas para lançar no AVA e marca **Já lancei no AVA**. Em **Campo de estágio**, o polo vê a etapa mudar.

### Regras que a escala confere

- Até 6h por dia e 30h por semana por aluno (Lei 11.788/2008, art. 10).
- Sábado e domingo bloqueados quando o AVA da instituição não aceita (regra em **Cursos e regras**). Feriado nacional não conta.
- Local recém-cadastrado fica **em validação** e só entra na escala depois de validado.

Polo, preceptor e aluno compartilham os dados **no mesmo aparelho e navegador**. Para recomeçar, use **Reiniciar demonstração** na tela inicial (os dados também se renovam a cada dia).

Sem GPS ou sem permissão, os cartões de check-in têm a opção **Simular dentro / Simular fora**.

## O que é simulado

- Envio de e-mails, WhatsApp, assinatura digital, exportações e leitura de documentos pela IA.
- Login: cada perfil abre direto com um usuário de exemplo.
- A consulta do CNPJ usa a BrasilAPI (dados públicos da Receita). Se ela não responder, a tela manda conferir no site da Receita.
- Dados ficam só no navegador (localStorage); não há servidor.

## Rodar no computador

```bash
npm install
npm run dev
```

## Publicação

Cada `push` na branch `main` publica automaticamente no GitHub Pages pelo workflow em `.github/workflows/deploy.yml`.
