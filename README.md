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

#### `/equipamentos`
- Estrutura definida para gerenciamento de equipamentos
- Tipos: MAQUINA, FERRAMENTA, TOCHA
- Em desenvolvimento

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

## Banco de Dados

O projeto utiliza MySQL como banco de dados. O modelo entidade-relacionamento está disponível no arquivo `MER MaintFlowDB.mwb`.

## Segurança

- Senhas hasheadas com bcrypt (saltRounds: 10)
- Validação de CPF/CNPJ com biblioteca especializada
- Validação de entrada de dados com Joi
- Soft delete para usuários (inativação em vez de exclusão)

## Desenvolvimento

Para desenvolvimento com auto-reload:
```bash
npm start
```

O projeto usa nodemon para reiniciar automaticamente quando há alterações nos arquivos.

## Status do Projeto

- ✅ Usuários - Implementado
- ✅ Clientes - Implementado
- 🚧 Equipamentos - Em desenvolvimento
- 🚧 Ordens de Serviço - Em desenvolvimento
- 🚧 Status de Ordem - Em desenvolvimento
