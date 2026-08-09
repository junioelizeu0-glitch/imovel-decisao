# ImóvelWise — Sistema de Análise de Venda vs. Aluguel de Imóvel Financiado

Sistema agêntico full-stack para auxílio na tomada de decisão financeira entre **vender um imóvel financiado agora** ou **alugá-lo e usar a renda para amortizar/quitar o financiamento**, com estimativa de valorização por endereço por inteligência de região e design system baseado no protótipo de referência em `inspirações/`.

---

## 🚀 Tecnologias Utilizadas

- **Frontend:** React 18, TypeScript, Tailwind CSS, Recharts (Donut Chart), Lucide Icons, Vite
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, Vitest (testes unitários)
- **Banco de Dados:** SQLite / PostgreSQL (Prisma Client com entidades `users`, `imoveis`, `financiamentos`, `simulacoes_venda`, `simulacoes_aluguel`, `valorizacao_regiao`)

---

## 🧮 Regras Financeiras e Fiscais Implementadas

1. **Cenário "Vender Agora":**
   - Ganho de capital = `Valor Venda - (Valor Compra + Custos Extras de Aquisição)`.
   - **Tabela de Isenções do Imposto de Renda (IRPF):**
     - Isenção total para vendas até R$ 35.000,00.
     - Isenção para único imóvel residencial vendido por até R$ 440.000,00 sem vendas nos últimos 5 anos.
     - Isenção por Reinvestimento em outro imóvel residencial no Brasil em até 180 dias.
     - Isenção e fatores de redução para imóveis comprados até 1969 e entre 1970–1988 (Lei nº 7.713/88).
     - Alíquotas progressivas de 15% a 22,5% sobre o ganho tributável.
   - Cálculo de corretagem (6%) e quitação do saldo devedor.

2. **Cenário "Alugar e Amortizar":**
   - Fluxo de Caixa Mensal Líquido = `Aluguel Bruto - Parcela Atual - Custos Mensais Extras (Cond./IPTU) - IR sobre Aluguel`.
   - Amortização acelerada mês a mês (SAC ou PRICE) aplicando o saldo de caixa positivo para acelerar a quitação.
   - Projeção do imóvel no prazo `M` meses com taxa de valorização anual composta.
   - Comparativo justo no mesmo prazo com o valor líquido da venda investido em CDI/Selic (10.5% a.a. configurável).
   - Alerta para fluxo de caixa mensal negativo.

3. **Busca de Valorização por Endereço:**
   - Estimativa inteligente regional com cache de 30 dias na tabela `valorizacao_regiao`.

---

## 📦 Como Executar o Projeto

### Pró-requisitos
- [Bun](https://bun.sh) ou [Node.js](https://nodejs.org) (v18+)

### 1. Iniciar o Backend
```bash
cd backend
bun install
bun run db:push
bun run dev
```
O servidor backend estará rodando em `http://localhost:3001`.

### 2. Executar os Testes Unitários do Backend
```bash
cd backend
bun test
```

### 3. Iniciar o Frontend
```bash
cd frontend
bun install
bun run dev
```
O frontend estará acessível em `http://localhost:3000`.

---

## 🎨 Design System

Inspirado na identidade visual limpa com paleta Teal/Ocean Blue (`#1F809B`) e Dark Navy (`#0F172A`), cartões arredondados com sombras suaves e visualização gráfica Donut estilo a referência de `inspirações/original-b5c5d5fea4932f28e0710915a996b51e.webp`.
