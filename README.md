# MaintFlow API

API REST para gerenciamento de manutenção, desenvolvida em Node.js com Express e MySQL.

## Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express** - Framework web para Node.js
- **MySQL** - Banco de dados relacional
- **bcrypt** - Hash de senhas para segurança
- **Joi** - Validação de dados
- **cpf-cnpj-validator** - Validação de CPF e CNPJ
- **dotenv** - Gerenciamento de variáveis de ambiente
- **nodemon** - Auto-reload durante desenvolvimento

## Funcionalidades

### Rotas Disponíveis

#### `/clientes`
- **POST** `/` - Cadastro de clientes (PF ou PJ)
  - Valida CPF/CNPJ usando Joi
  - Integração com ViaCEP para preenchimento automático de endereço
  - Cria automaticamente usuário do tipo CLIENTE
  - Suporta Pessoa Física (PF) e Pessoa Jurídica (PJ)
- **GET** `/` - Lista todos os clientes
- **GET** `/nomeCliente/:nome` - Busca cliente por nome
- **GET** `/cpfCliente/:cpf` - Busca cliente por CPF
- **GET** `/cnpjCliente/:cnpj` - Busca cliente por CNPJ
- **DELETE** `/inativar/clienteId/:id` - Inativa cliente por ID
- **DELETE** `/inativar/clienteCNPJ/:cnpj` - Inativa cliente por CNPJ
- **DELETE** `/inativar/clienteCPF/:cpf` - Inativa cliente por CPF
- **PUT** `/reativar/clienteId/:id` - Reativa cliente por ID
- **PUT** `/reativar/clienteCNPJ/:cnpj` - Reativa cliente por CNPJ
- **PUT** `/reativar/clienteCPF/:cpf` - Reativa cliente por CPF
- **PUT** `/atualizar/clienteId/:id` - Atualiza dados do cliente
  - Atualiza sincronamente cliente e usuário associado (email, senha)
  - Usa transação para garantir atomicidade das operações

#### `/usuarios`
- **POST** `/` - Criação de usuários
  - Tipos: ADMIN, TECNICO, CLIENTE
  - CLIENTE usa senha padrão (`cliente123`)
  - ADMIN e TECNICO exigem senha personalizada (mínimo 8 caracteres)
  - Validação de email e nome de usuário únicos
- **GET** `/` - Lista todos os usuários
- **GET** `/:user` - Busca usuário por nome
- **PUT** `/atualizar/:user` - Atualiza dados do usuário
- **DELETE** `/inativar/:user` - Inativa usuário (soft delete)
- **PUT** `/reativar/:user` - Reativa usuário previamente inativado
  - Verifica se o usuário já está ativo antes de reativar

#### `/equipamentos`
- **POST** `/` - Cadastro de equipamentos
  - Tipos: MAQUINA, FERRAMENTA, TOCHA
  - Gera automaticamente número de série se não fornecido
  - Formato do serial: prefixo (M/F/T) + nome cliente (5 chars) + número sequencial
  - Exemplo: MJOAOPE1, FJOAOPE1, TJOAOPE1
- **GET** `/` - Lista todos os equipamentos
- **GET** `/id_equipamento/:id` - Busca equipamento por ID
- **GET** `/identificador_equipamento/:identificador` - Busca equipamento por identificador (busca parcial)
- **GET** `/tipo_equipamento/:tipo` - Busca equipamentos por tipo
- **GET** `/marca_equipamento/:marca` - Busca equipamentos por marca (busca parcial)
- **GET** `/modelo_equipamento/:modelo` - Busca equipamentos por modelo (busca parcial)
- **GET** `/equipamento_cliente_id/:id` - Busca equipamentos por ID do cliente
- **GET** `/equipamento_cliente_CNPJ_CPF/:cnpj_cpf` - Busca equipamentos por CPF ou CNPJ do cliente
- **DELETE** `/inativar/id_equipamento/:id` - Inativa equipamento por ID (soft delete)
- **DELETE** `/inativar/identificador_equipamento/:identificador` - Inativa equipamento por identificador (soft delete)

#### `/condicao-pagamento`
- **POST** `/` - Criação de condição de pagamento
- **GET** `/` - Lista todas as condições de pagamento
- **GET** `/id/:id` - Busca condição de pagamento por ID
- **GET** `/condicao/:nomeCondicao` - Busca condição de pagamento por nome (busca parcial)
- **DELETE** `/deletar-condicao-pagamento/id/:id` - Deleta condição de pagamento por ID
- **DELETE** `/deletar-condicao-pagamento/descricao/:descricao` - Deleta condição de pagamento por descrição

#### `/ordens-servico`
- Em desenvolvimento

#### `/status-ordem`
- Em desenvolvimento

## Estrutura do Projeto

```
MaintFlow/
├── src/
│   ├── app.js           # Configuração principal do Express
│   ├── index.js         # Ponto de entrada da aplicação
│   ├── server.js        # Definição das rotas
│   ├── config/
│   │   └── db.js        # Configuração do banco de dados
│   └── routes/
│       ├── clientes.js          # Rotas de clientes
│       ├── equipamentos.js      # Rotas de equipamentos
│       ├── ordensServico.js     # Rotas de ordens de serviço
│       ├── statusOrdem.js       # Rotas de status de ordem
│       ├── condicaoPagamento.js # Rotas de condição de pagamento
│       └── usuarios.js          # Rotas de usuários
├── .env                  # Variáveis de ambiente
├── .envexemple           # Exemplo de variáveis de ambiente
├── package.json          # Dependências do projeto
└── README.md             # Documentação
```

## Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente no arquivo `.env` baseado no `.envexemple`

4. Inicie o servidor:
```bash
npm start
```

O servidor rodará na porta definida em `PORT` (padrão: 3000)

## Variáveis de Ambiente

Configure as seguintes variáveis no arquivo `.env`:
- `PORT` - Porta do servidor (padrão: 3000)
- `DB_HOST` - Host do banco de dados MySQL
- `DB_USER` - Usuário do banco de dados
- `DB_PASSWORD` - Senha do banco de dados
- `DB_NAME` - Nome do banco de dados

## Validações

### Clientes
- Nome: 3-250 caracteres
- Email: 10-250 caracteres, deve conter '@' e '.'
- Senha: mínimo 8 caracteres
- CPF: 11 caracteres numéricos (para PF)
- CNPJ: 14 caracteres numéricos (para PJ)
- Razão Social: 3-250 caracteres (para PJ)
- CEP: 8 caracteres numéricos

### Usuários
- Nome de usuário: 3-250 caracteres
- Email: 10-250 caracteres, deve conter '@' e '.'
- Senha: mínimo 8 caracteres (exceto CLIENTE que usa senha padrão)

## Segurança

- Senhas hasheadas com bcrypt (saltRounds: 10)
- Validação de CPF/CNPJ com biblioteca especializada
- Validação de entrada de dados com Joi
- Soft delete para usuários (inativação em vez de exclusão)
- Transações para garantir atomicidade em operações críticas

## Melhorias Recentes

- **Atualização sincronizada**: PUT de clientes atualiza tanto cliente quanto usuário associado em uma única transação
- **Verificação de status**: Rota de reativação verifica se usuário já está ativo antes de tentar reativar
- **Organização do código**: Adição de comentários de seção para melhor legibilidade (INATIVAR, REATIVAR, ATUALIZAR)
- **Geração automática de serial**: Equipamentos geram número de série sequencial por tipo e cliente
  - Formato: prefixo (M/F/T) + nome cliente (5 chars) + número sequencial
  - Exemplo: MJOAOPE1, FJOAOPE1, TJOAOPE1
- **Rotas de busca de equipamentos**: Implementadas rotas GET para buscar por ID, tipo, marca, modelo, cliente (ID e CPF/CNPJ)
- **Soft delete para equipamentos**: Implementada inativação de equipamentos em vez de exclusão permanente


## Desenvolvimento

Para desenvolvimento com auto-reload:
```bash
npm start
```

O projeto usa nodemon para reiniciar automaticamente quando há alterações nos arquivos.

## Status do Projeto

- ✅ Usuários - Implementado
- ✅ Clientes - Implementado
- ✅ Equipamentos - Implementado
- ✅ Condição de Pagamento - Implementado
- 🚧 Ordens de Serviço - Em desenvolvimento
- 🚧 Status de Ordem - Em desenvolvimento
