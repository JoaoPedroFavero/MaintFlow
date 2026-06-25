`use strict`;

const express = require(`express`);

const {pool} = require(`../config/db`);

const router = express.Router();

/*
CREATE TABLE condicao_pagamento (
	id_condicao_pagamento INT AUTO_INCREMENT NOT NULL UNIQUE,
    condicao_pagamento VARCHAR(255) NOT NULL,
    
    PRIMARY KEY (id_condicao_pagamento)
);
*/

//-----------------------------------------------------------------------------------------------------------------------------------

router.post(`/`, async (req, res) => {
   const {condicao_pagamento} = req.body;
   
   try{
       if(condicao_pagamento.trim() === ``){
           return res.status(400).json({error: `O campo 'Condição Pagamento' é obrigatório.`});
       }
       
       // Inserir condição de pagamento no banco de dados
       const [result] = await pool.execute(`INSERT INTO condicao_pagamento (condicao_pagamento) VALUES (?)`, [condicao_pagamento]);
       
       return res.status(201).json({ message: `Condição de pagamento criada com sucesso.`, id_condicao_pagamento: result.insertId });

   }catch(error){
       console.error(`Erro ao criar condição de pagamento:`, error);
       return res.status(500).json({error: `Erro ao criar condição de pagamento. Erro interno do servidor.`});
   }
});

//-----------------------------------------------------------------------------------------------------------------------------------

router.get(`/`, async (req, res) => {
   try{
       const [result] = await pool.execute(`SELECT * FROM condicao_pagamento`);
       if(result.length === 0){
           return res.status(404).json({error: `Nenhuma condição de pagamento cadastrada até o momento.`});
       }

       return res.status(200).json(result);
   }catch(error){
       console.error(`Erro ao buscar condições de pagamento:`, error);
       return res.status(500).json({error: `Erro ao buscar condições de pagamento. Erro interno do servidor.`});
   }
});

router.get(`/id/:id`, async (req, res) => {
    const {id} = req.params;

    try{
        const [result] = await pool.execute(`SELECT * FROM condicao_pagamento WHERE id_condicao_pagamento = ?`, [id]);
        if(result.length === 0){
            return res.status(404).json({error: `Condição de pagamento não encontrada.`});
        }

        return res.status(200).json(result);

    }catch(error){
        console.error(`Erro ao buscar condição de pagamento pelo ID:`, error);
        return res.status(500).json({error: `Erro ao buscar condição de pagamento pelo ID. Erro interno do servidor.`});
    }
});

router.get(`/condicao/:nomeCondicao`, async (req, res) => {
    const {nomeCondicao} = req.params;

    try{
        const [result] = await pool.execute(`SELECT * FROM condicao_pagamento WHERE condicao_pagamento LIKE ?`, [`%${nomeCondicao}%`]);

        if(result.length === 0){
            return res.status(404).json({error: `Nenhuma condição de pagamento encontrada com as especificações informadas: ${nomeCondicao}.`});
        }

        return res.status(200).json(result);

    }catch(error){
        console.error(`Erro ao buscar condições de pagamento pela descricao:`, error);
        return res.status(500).json({error: `Erro ao buscar condições de pagamento pela descricao. Erro interno do servidor.`});
    }
});

//-----------------------------------------------------------------------------------------------------------------------------------

router.delete(`/deletar-condicao-pagamento/id/:id`, async (req, res) => {
    const {id} = req.params;

    try{
        const [result] = await pool.execute(`SELECT * FROM condicao_pagamento WHERE id_condicao_pagamento = ?`, [id]);

        if(result.length === 0){
            return res.status(404).json({error: `Não foi possível deletar condição de pagamento. O ID informado não existe.`});
        }

        await pool.execute(`DELETE FROM condicao_pagamento WHERE id_condicao_pagamento = ?`, [id]);
        return res.status(200).json({message: `Condição de pagamento deletada com sucesso.`});

    }catch(error){
        console.error(`Erro ao deletar condição de pagamento pelo ID:`, error);
        return res.status(500).json({error: `Erro ao deletar condição de pagamento pelo ID. Erro interno do servidor.`});
    }
});

router.delete(`/deletar-condicao-pagamento/descricao/:descricao`, async (req, res) => {
    const {descricao} = req.params;

    try{
        const [result] = await pool.execute(`SELECT * FROM condicao_pagamento WHERE condicao_pagamento = ?`, [descricao]);

        if(result.length === 0){
            return res.status(404).json({error: `Não foi possível deletar condição de pagamento. A descrição informada não existe.`});
        }

        await pool.execute(`DELETE FROM condicao_pagamento WHERE condicao_pagamento = ?`, [descricao]);
        return res.status(200).json({message: `Condição de pagamento deletada com sucesso.`});

    }catch(error){
        console.error(`Erro ao deletar condição de pagamento pela descrição:`, error);
        return res.status(500).json({error: `Erro ao deletar condição de pagamento pela descrição. Erro interno do servidor.`});
    }
});

//-----------------------------------------------------------------------------------------------------------------------------------


module.exports = router;