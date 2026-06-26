`use strict`;

const express = require(`express`);

const {pool} = require(`../config/db`);

const router = express.Router();

/*
CREATE TABLE status_ordem (
	id_status_ordem INT AUTO_INCREMENT NOT NULL,
    nome_status VARCHAR(250) NOT NULL UNIQUE,
    
    PRIMARY KEY (id_status_ordem)
);
*/

//-----------------------------------------------------------------------------------------------------------------------------------

router.post(`/`, async (req, res) => {
    const {nome_status} = req.body;
    
    try{
        if(nome_status.trim() === ``){
            return res.status(400).json({error: `O campo 'Nome Status' é obrigatório.`});
        }

        await pool.execute(`INSERT INTO status_ordem (nome_status) VALUES (?)`, [nome_status]);
        return res.status(201).json({message: `Status de ordem criado com sucesso.`});
        
    }catch(error){
        console.error(`Erro ao criar status de ordem:`, error);
        return res.status(500).json({error: `Erro ao criar status de ordem.`});
    }
});

//-----------------------------------------------------------------------------------------------------------------------------------

router.get(`/`, async (req, res) => {
    try{
        const [result] = await pool.execute(`SELECT * FROM status_ordem`);

        if(result.length === 0){
            return res.status(404).json({error: `Nenhum status de ordem encontrado.`});
        }

        return res.status(200).json(result);

    }catch(error){
        console.error(`Erro ao listar status de ordem:`, error);
        return res.status(500).json({error: `Erro ao listar status de ordem.`});
    }
});

router.get(`/:id`, async (req, res) => {
    const {id} = req.params;
    
    try{
        const [result] = await pool.execute(`SELECT * FROM status_ordem WHERE id_status_ordem = ?`, [id]);
        
        if(result.length === 0){
            return res.status(404).json({error: `Nenhum status de ordem com id ${id} encontrado.`});
        }

        return res.status(200).json(result);

    }catch(error){
        console.error(`Erro ao listar status de ordem:`, error);
        return res.status(500).json({error: `Erro ao listar status de ordem.`});
    }
});

router.get(`/nome-status/:nome`, async (req, res) => {
    const {nome} = req.params;
    
    try{
        const [result] = await pool.execute(`SELECT * FROM status_ordem WHERE nome_status = ?`, [nome]);
        
        if(result.length === 0){
            return res.status(404).json({error: `Nenhum status de ordem com nome ${nome} encontrado.`});
        }

        return res.status(200).json(result);

    }catch(error){
        console.error(`Erro ao listar status de ordem:`, error);
        return res.status(500).json({error: `Erro ao listar status de ordem.`});
    }
});

//-----------------------------------------------------------------------------------------------------------------------------------

router.delete(`/deletar-status-id/:id`, async (req, res) => {
    const {id} = req.params;
    
    try{
        const [result] = await pool.execute(`SELECT * FROM status_ordem WHERE id_status_ordem = ?`, [id]);
        
        if(result.length === 0){
            return res.status(404).json({error: `Nenhum status de ordem com id ${id} encontrado.`});
        }

        await pool.execute(`DELETE FROM status_ordem WHERE id_status_ordem = ?`, [id]);

        return res.status(200).json({message: `Status de ordem deletado com sucesso.`});

    }catch(error){
        console.error(`Erro ao deletar status de ordem:`, error);
        return res.status(500).json({error: `Erro ao deletar status de ordem.`});
    }
});

router.delete(`/deletar-status-nome/:nome`, async (req, res) => {
    const {nome} = req.params;
    
    try{
        const [result] = await pool.execute(`SELECT * FROM status_ordem WHERE nome_status = ?`, [nome]);
        
        if(result.length === 0){
            return res.status(404).json({error: `Nenhum status de ordem com nome ${nome} encontrado.`});
        }

        await pool.execute(`DELETE FROM status_ordem WHERE nome_status = ?`, [nome]);
        
        return res.status(200).json({message: `Status de ordem deletado com sucesso.`});

    }catch(error){
        console.error(`Erro ao deletar status de ordem:`, error);
        return res.status(500).json({error: `Erro ao deletar status de ordem.`});
    }
});

//-----------------------------------------------------------------------------------------------------------------------------------

router.put(`/atualizar-status-id/:id`, async (req, res) => {
    const {id} = req.params;
    const {nome_status} = req.body;
    
    try{
        const [result] = await pool.execute(`SELECT * FROM status_ordem WHERE id_status_ordem = ?`, [id]);
        
        if(result.length === 0){
            return res.status(404).json({error: `Nenhum status de ordem com id ${id} encontrado.`});
        }

        if(nome_status == result[0].nome_status){
            return res.status(400).json({error: `Nome do status é o mesmo de antes. Alteração inválida.`});
        }

        if(!nome_status || nome_status.trim() === ''){
            return res.status(400).json({error: `Nenhum nome foi escolhido para atualizar. Preencha o campo corretamente para efetuar a atualização.`});
        }

        await pool.execute(`UPDATE status_ordem SET nome_status = ? WHERE id_status_ordem = ?`, [nome_status, id]);
        
        return res.status(200).json({message: `Status de ordem atualizado com sucesso. Antes ${result[0].nome_status}, atualizado para ${nome_status}.`});

    }catch(error){
        console.error(`Erro ao atualizar status de ordem:`, error);
        return res.status(500).json({error: `Erro ao atualizar status de ordem.`});
    }
});

router.put(`/atualizar-status-nome/:nome`, async (req, res) => {
    const {nome} = req.params;
    const {nome_status} = req.body;
    
    try{
        const [result] = await pool.execute(`SELECT * FROM status_ordem WHERE nome_status = ?`, [nome]);
        
        if(result.length === 0){
            return res.status(404).json({error: `Nenhum status de ordem com nome ${nome} encontrado.`});
        }

        if(nome_status == result[0].nome_status){
            return res.status(400).json({error: `Nome do status é o mesmo de antes. Alteração inválida.`});
        }

        if(!nome_status || nome_status.trim() === ''){
            return res.status(400).json({error: `Nenhum nome foi escolhido para atualizar. Preencha o campo corretamente para efetuar a atualização.`});
        }

        await pool.execute(`UPDATE status_ordem SET nome_status = ? WHERE nome_status = ?`, [nome_status, nome]);
        
        return res.status(200).json({message: `Status de ordem atualizado com sucesso. Antes ${result[0].nome_status}, atualizado para ${nome_status}.`});

    }catch(error){
        console.error(`Erro ao atualizar status de ordem:`, error);
        return res.status(500).json({error: `Erro ao atualizar status de ordem.`});
    }
});

module.exports = router;

