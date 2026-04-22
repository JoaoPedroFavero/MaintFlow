`use strict`;


const express = require(`express`);

const {pool} = require(`../config/db`);

const router = express.Router();

const bcrypt = require(`bcrypt`);

const { validator } = require('cpf-cnpj-validator');

const Joi = require('@hapi/joi').extend(validator);

const schema = Joi.object({
  cpf: Joi.document().cpf().required(),
  cnpj: Joi.document().cnpj().required()
})

/*	id_cliente INT NOT NULL AUTO_INCREMENT,
    cnpj_cliente CHAR(14) UNIQUE,
    cpf_cliente CHAR(11) UNIQUE,
    razao_social VARCHAR(250) UNIQUE,
    nome_cliente VARCHAR(250) NOT NULL,
    cep CHAR(8) NOT NULL,
    endereco VARCHAR(250),
    cidade VARCHAR(250),
    uf CHAR(2),
    tipo_cliente ENUM ('PF', 'PJ') NOT NULL,
    id_usuario INT NOT NULL,
    
    PRIMARY KEY (id_cliente),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    
    CHECK (
	  (tipo_cliente = 'PF' AND cpf_cliente IS NOT NULL AND cnpj_cliente IS NULL) OR
	  (tipo_cliente = 'PJ' AND cnpj_cliente IS NOT NULL AND cpf_cliente IS NULL)
	) 
*/

//-----------------------------------------------------------------------------------------------------------------------------------
router.post(`/`, async (req, res) => {
    const {nome_cliente, email, senha, tipo_cliente, cnpj_cliente, cpf_cliente, razao_social, cep} = req.body;
    let endereco, cidade, uf;

    const connection = await pool.getConnection();

    try{
        await connection.beginTransaction();
        let id_usuario;

        //Cria usuario a partir do cadastro do cliente
        if(nome_cliente.trim() === '' || nome_cliente.length > 250 || nome_cliente.length < 3){
            throw new Error(`O campo 'nome_cliente' é obrigatório e deve conter entre 3 e 250 caracteres.`);
        }
        
        if(email.trim() === '' || email.length > 250 || email.length < 10 || !email.includes('@') || !email.includes('.')) {
            throw new Error(`O campo 'email' é obrigatório e deve conter entre 10 e 250 caracteres, com '@' e '.'.`);
        }
        
        const [emailResult] = await connection.execute(`SELECT * FROM usuarios WHERE email = ?`, [email]);
        if(emailResult.length > 0) {
            throw new Error(`Email já cadastrado. Tente outro email.`);
        }

        if(senha.length < 8) {
            throw new Error(`A senha deve conter pelo menos 8 caracteres.`);
        }
    
        const saltRounds = 10;
        const senhaHash = await bcrypt.hash(senha, saltRounds);

        const [userResult] = await connection.execute(`INSERT INTO usuarios (usuario, email, senha, tipo_usuario) VALUES (?, ?, ?, ?)`, [nome_cliente, email, senhaHash, 'CLIENTE']);
        id_usuario = userResult.insertId;
     

        //Cria cliente
        if(tipo_cliente !== 'PF' && tipo_cliente !== 'PJ') {
            throw new Error(`Tipo de cliente inválido. Deve ser PF ou PJ.`);
        }

        if(tipo_cliente === 'PF') {
            cpfValidation = await schema.validateAsync({ cpf: cpf_cliente })
            if(cpf_cliente.trim() === '' || cpf_cliente.length !== 11 || !cpfValidation) {
                throw new Error(`O campo 'cpf_cliente' é obrigatório para clientes do tipo PF e deve conter exatamente 11 caracteres.`);
            }
        
        } else if(tipo_cliente === 'PJ') {
            cnpjValidation = await schema.validateAsync({ cnpj: cnpj_cliente })
            if(cnpj_cliente.trim() === '' || cnpj_cliente.length !== 14 || !cnpjValidation) {
                throw new Error(`O campo 'cnpj_cliente' é obrigatório para clientes do tipo PJ e deve conter exatamente 14 caracteres.`);
            }

            if(razao_social.trim() === '' || razao_social.length > 250 || razao_social.length < 3){
                throw new Error(`O campo 'razao_social' é obrigatório para clientes do tipo PJ e deve conter entre 3 e 250 caracteres.`);
            }

            const [razaoResult] = await connection.execute(`SELECT * FROM clientes WHERE razao_social = ?`, [razao_social]);
            if(razaoResult.length > 0) {
                throw new Error(`Razão social já cadastrada. Tente outra razão social.`);
            }
        }

        let validCep = cep.replace(/\D/g, '');
        if(validCep.trim() === '' || validCep.length !== 8){
            throw new Error(`O campo 'cep' é obrigatório e deve conter exatamente 8 caracteres numéricos.`);
        }

        if (validCep.length === 8) {
            const response = await fetch(`https://viacep.com.br/ws/${validCep}/json/`);
            const data = await response.json();

            if(!data.erro) {
                endereco = data.logradouro;
                cidade = data.localidade;
                uf = data.uf;
            }
            else{
                throw new Error('CEP não encontrado');
            }
        }
        await connection.execute(`INSERT INTO clientes (cnpj_cliente, cpf_cliente, razao_social, nome_cliente, cep, endereco, cidade, uf, tipo_cliente, id_usuario) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [cnpj_cliente || null, cpf_cliente || null, razao_social || null, nome_cliente, validCep, endereco, cidade, uf, tipo_cliente, id_usuario]);
        await connection.commit();
        res.status(201).json({message: `Cliente criado com sucesso.`});

    }catch (error) {
        await connection.rollback();
        console.error(`Erro ao criar cliente:`, error);
        res.status(500).json({error: `Erro ao criar cliente: ${error.message}`});
    } finally {
        connection.release();
    }
    
});

//-----------------------------------------------------------------------------------------------------------------------------------

router.get(`/`, async (req, res) => {
    try{
        const [result] = await pool.execute(`SELECT * FROM clientes`);
        if(result.length === 0) {
            return res.status(404).json({message: `Nenhum cliente encontrado.`});
        }
        res.json(result);
    } catch (error) {
        console.error(`Erro ao buscar clientes:`, error);
        res.status(500).json({error: `Erro interno do servidor.`});
    }
});

router.get(`/nomeCliente/:nome`, async (req, res) => {
    const {nome} = req.params;

    nome = nome.trim();

    try{
        const [result] = await pool.execute(`SELECT * FROM clientes WHERE nome_cliente LIKE ?`, [`%${nome}%`]);
        if(result.length === 0) {
            return res.status(404).json({message: `Nenhum cliente encontrado.`});
        }
        res.json(result);
    } catch (error) {
        console.error(`Erro ao buscar clientes pelo nome:`, error);
        res.status(500).json({error: `Erro interno do servidor.`});
    }
});

router.get(`/cpfCliente/:cpf`, async (req, res) => {
    const {cpf} = req.params;

    cpf = cpf.trim();

    try{
        const [result] = await pool.execute(`SELECT * FROM clientes WHERE cpf_cliente = ?`, [cpf]);
        if(result.length === 0) {
            return res.status(404).json({message: `Nenhum cliente encontrado.`});
        }
        res.json(result);
    } catch (error) {
        console.error(`Erro ao buscar clientes pelo CPF:`, error);
        res.status(500).json({error: `Erro interno do servidor.`});
    }
});

router.get(`/cnpjCliente/:cnpj`, async (req, res) => {
    const {cnpj} = req.params;

    cnpj = cnpj.trim();

    try{
        const [result] = await pool.execute(`SELECT * FROM clientes WHERE cnpj_cliente = ?`, [cnpj]);
        if(result.length === 0) {
            return res.status(404).json({message: `Nenhum cliente encontrado.`});
        }
        res.json(result);
    } catch (error) {
        console.error(`Erro ao buscar clientes pelo CNPJ:`, error);
        res.status(500).json({error: `Erro interno do servidor.`});
    }
});

//-----------------------------------------------------------------------------------------------------------------------------------

router.delete(`/inativar/:id`, async (req, res) => {
    const {id} = req.params;

    try{
        const[result] = await pool.execute(`SELECT * FROM usuarios WHERE usuario = ?`, [id]);
        if(result.length === 0) {
            return res.status(404).json({message: `Usuário ${id} não encontrado.`});
        }
    } catch (error) {
        console.error(`Erro ao inativar usuário ${id}:`, error);
        res.status(500).json({error: `Erro interno do servidor.`});
    }

    try {
        await pool.execute(`UPDATE usuarios SET status_usuario = 'INATIVO' WHERE usuario = ?`, [id]);
        res.json({message: `Usuário ${id} inativado com sucesso.`});
    } catch (error) {
        console.error(`Erro ao inativar usuário ${id}:`, error);
        res.status(500).json({error: `Erro interno do servidor.`});
    }
});

//-----------------------------------------------------------------------------------------------------------------------------------


module.exports = router;