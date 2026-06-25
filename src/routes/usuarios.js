`use strict`;

const express = require(`express`);

const {pool} = require(`../config/db`);

const router = express.Router();

const bcrypt = require(`bcrypt`);

//-----------------------------------------------------------------------------------------------------------------------------------

router.post(`/`, async (req, res) => {
    const {usuario, email, senha, tipo_usuario} = req.body;

    if(usuario.trim() === `` || usuario.length > 250 || usuario.length < 3){
        return res.status(400).json({error: `O campo 'usuario' é obrigatório e deve conter entre 3 e 250 caracteres.`});
    }

    if(email.trim() === `` || email.length > 250 || email.length < 10 || !email.includes(`@`) || !email.includes(`.`)) {
        return res.status(400).json({error: `O campo 'email' é obrigatório e deve conter entre 10 e 250 caracteres, com '@' e '.'.`});
    }

    try {
        const [userResult] = await pool.execute(`SELECT * FROM usuarios WHERE usuario = ?`, [usuario]);
        if(userResult.length > 0) {
            return res.status(400).json({error: `Usuário já existe. Tente outro nome de usuário.`});
        }
    } catch (error) {
        console.error(`Erro ao verificar usuário:`, error);
        return res.status(500).json({error: `Erro interno do servidor.`});
    }

    try{
        const [emailResult] = await pool.execute(`SELECT * FROM usuarios WHERE email = ?`, [email]);
        if(emailResult.length > 0) {
            return res.status(400).json({error: `Email já cadastrado. Tente outro email.`});
        }
    } catch (error) {
        console.error(`Erro ao verificar email:`, error);
        return res.status(500).json({error: `Erro interno do servidor.`});
    }

    const saltRounds = 10;
    let senhaHash;

    if (tipo_usuario === `CLIENTE`) {
        const senhaPadrao = `cliente123`;
        senhaHash = await bcrypt.hash(senhaPadrao, saltRounds);
    } else {
        try{
            if(senha.length < 8) {
                return res.status(400).json({error: `A senha deve conter pelo menos 8 caracteres.`});
            }
        } catch (error){
            console.error(`Erro ao validar senha:`, error);
            return res.status(500).json({error: `Erro interno do servidor.`});
        }
        senhaHash = await bcrypt.hash(senha, saltRounds);
    }

    try{
        if(tipo_usuario !== `ADMIN` && tipo_usuario !== `TECNICO` && tipo_usuario !== `CLIENTE`) {
            return res.status(400).json({error: `Tipo de usuário inválido. Deve ser ADMIN, TECNICO ou CLIENTE.`});
        }
    } catch (error) {
        console.error(`Erro ao validar tipo de usuário:`, error);
        return res.status(500).json({error: `Erro interno do servidor.`});
    }

    try {
        await pool.execute(`INSERT INTO usuarios (usuario, email, senha, tipo_usuario) VALUES (?, ?, ?, ?)`, [usuario, email, senhaHash, tipo_usuario]);
        res.status(201).json({message: `Usuário criado com sucesso.`});

    } catch (error) {
        console.error(`Erro ao criar usuário:`, error);
        res.status(500).json({error: `Erro interno do servidor.`});
    } 

});

//-----------------------------------------------------------------------------------------------------------------------------------

router.get(`/`, async (req, res) => {
    try {
        const [result] = await pool.execute(`SELECT * FROM usuarios`);
        
        if (result.length === 0) {
            return res.status(404).json({message: `Nenhum usuário encontrado.`});
        }

        res.json(result);

    } catch (error) {
        console.error(`Erro ao buscar usuários:`, error);
        res.status(500).json({error: `Erro interno do servidor.`});
    }
});

router.get(`/:user`, async (req, res) => {
    const {user} = req.params;
    try {
        const [result] = await pool.execute(`SELECT * FROM usuarios WHERE usuario = ?`, [user]);
        
        if (result.length === 0) {
            return res.status(404).json({message: `Usuário ${user} não encontrado.`});
        }

        res.json(result);

    } catch (error) {
        console.error(`Erro ao buscar usuário ${user}:`, error);
        res.status(500).json({error: `Erro interno do servidor.`});
    }
});

//-----------------------------------------------------------------------------------------------------------------------------------

router.put(`/atualizar/usuario/:user`, async (req, res) => {
    const {user} = req.params;
    const {usuario, email, senha} = req.body;

    const putItens = [];
    const putValues = [];

    try{
        const [userResult] = await pool.execute(`SELECT * FROM usuarios WHERE usuario = ?`, [user]);
        if(userResult.length === 0) {
            return res.status(404).json({message: `Usuário ${user} não encontrado. Não será possível atualizar.`});
        }
    } catch (error) {
        console.error(`Erro ao atualizar usuário ${user}:`, error);
        res.status(500).json({error: `Erro interno do servidor.`});
    }

    try{
        const [usuarioResult] = await pool.execute(`SELECT * FROM usuarios WHERE usuario = ?`, [usuario]);
        if(usuarioResult.length > 0) {
            return res.status(400).json({error: `Usuário já existe. Tente outro nome de usuário.`});
        }

        putItens.push(`usuario`);
        putValues.push(usuario);

    } catch (error) {
        console.error(`Erro ao atualizar usuário ${user} para ${usuario}:`, error);
        res.status(500).json({error: `Erro interno do servidor.`});
    }

    try{
        const [emailResult] = await pool.execute(`SELECT * FROM usuarios WHERE email = ?`, [email]);
        if(emailResult.length > 0) {
            return res.status(400).json({error: `Email já cadastrado. Tente outro email.`});
        }

        putItens.push(`email`);
        putValues.push(email);

    } catch (error) {
        console.error(`Erro ao atualizar email do usuário ${user}:`, error);
        res.status(500).json({error: `Erro interno do servidor.`});
    }

    try{
        if(senha.length < 8) {
            return res.status(400).json({error: `A nova senha deve conter pelo menos 8 caracteres.`});
        }

        putItens.push(`senha`);
        
        const saltRounds = 10;
        const senhaHash = await bcrypt.hash(senha, saltRounds);

        putValues.push(senhaHash);

    } catch (error){
        console.error(`Erro ao validar nova senha senha:`, error);
        return res.status(500).json({error: `Erro interno do servidor.`});
    }

    if(putItens.length === 0) {
        return res.status(400).json({ error: `Nenhum campo para atualizar informado.` });
    }

    putValues.push(user);

    const sqlQuery = `UPDATE usuarios SET ${putItens.join(', ')} WHERE usuario = ?`;

    try{
        await pool.execute(sqlQuery, putValues);
        res.json({message: `Usuário ${user} atualizado com sucesso.`});
    } catch (error) {
        console.error(`Erro ao atualizar usuário ${user}:`, error);
        res.status(500).json({error: `Erro interno do servidor.`});
    }
});
//-----------------------------------------------------------------------------------------------------------------------------------

// INATIVAR

router.delete(`/inativar/usuario/:user`, async (req, res) => {
    const {user} = req.params;

    try{
        const[result] = await pool.execute(`SELECT * FROM usuarios WHERE usuario = ?`, [user]);
        if(result.length === 0) {
            return res.status(404).json({message: `Usuário ${user} não encontrado.`});
        }
    } catch (error) {
        console.error(`Erro ao inativar usuário ${user}:`, error);
        res.status(500).json({error: `Erro interno do servidor.`});
    }

    try {
        await pool.execute(`UPDATE usuarios SET status_usuario = 'INATIVO' WHERE usuario = ?`, [user]);
        res.json({message: `Usuário ${user} inativado com sucesso.`});
    } catch (error) {
        console.error(`Erro ao inativar usuário ${user}:`, error);
        res.status(500).json({error: `Erro interno do servidor.`});
    }
});

//-----------------------------------------------------------------------------------------------------------------------------------

// REATIVAR

router.put(`/reativar/usuario/:user`, async (req, res) =>{
    const {user} = req.params;

        try{
        const[result] = await pool.execute(`SELECT * FROM usuarios WHERE usuario = ?`, [user]);
        if(result.length === 0) {
            return res.status(404).json({message: `Usuário ${user} não encontrado.`});
        }
    } catch (error) {
        console.error(`Erro ao reativar usuário ${user}:`, error);
        res.status(500).json({error: `Erro interno do servidor.`});
    }

    try {
        const [result] = await pool.execute(`SELECT status_usuario FROM usuarios WHERE usuario = ?`, [user]);
        if (result[0].status_usuario === 'ATIVO') {
            return res.status(400).json({ message: `Usuário ${user} já está ativo.` });
        }

        await pool.execute(`UPDATE usuarios SET status_usuario = 'ATIVO' WHERE usuario = ?`, [user]);
        res.json({message: `Usuário ${user} reativado com sucesso.`});
    } catch (error) {
        console.error(`Erro ao reativar usuário ${user}:`, error);
        res.status(500).json({error: `Erro interno do servidor.`});
    }
});


module.exports = router;
