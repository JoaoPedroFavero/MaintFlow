`use strict`;

const express = require(`express`);

const {pool} = require(`../config/db`);

const router = express.Router();

module.exports = router;

/*
CREATE TABLE ordens_servico (
	id_ordem INT AUTO_INCREMENT NOT NULL,
    data_abertura DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_condicao_pagamento INT NOT NULL,
    nf_remessa VARCHAR(250),
    defeito TEXT NOT NULL,
    relatorio_tecnico TEXT,
    id_equipamento INT NOT NULL,
    id_cliente INT NOT NULL,
    id_tecnico INT NOT NULL,
    id_status_ordem INT NOT NULL,
    
    PRIMARY KEY (id_ordem),
    FOREIGN KEY (id_equipamento) REFERENCES equipamentos(id_equipamento),
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    FOREIGN KEY (id_tecnico) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_status_ordem) REFERENCES status_ordem (id_status_ordem),
    FOREIGN KEY (id_condicao_pagamento) REFERENCES condicao_pagamento (id_condicao)
);
*/

//-----------------------------------------------------------------------------------------------------------------------------------

router.post(`/`, async (req, res) => {
    const {id_cliente, id_equipamento, id_tecnico, nf_remessa, id_condicao_pagamento, defeito, relatorio_tecnico, id_status_ordem} = req.body;

    try{
        //CLIENTE
        if(id_cliente === undefined || id_cliente === null || String(id_cliente).trim() === ''){
            return res.status(400).json({error: `ID do cliente é obrigatório.`});
        }

        const [resultCliente] = await pool.execute(`SELECT * FROM clientes WHERE id_cliente = ?`, [id_cliente]);
        if (resultCliente.length === 0) {
            return res.status(404).json({error: `Cliente não encontrado.`});
        }


        //EQUIPAMENTO
        if(id_equipamento === undefined || id_equipamento === null || String(id_equipamento).trim() === '') {
            return res.status(400).json({error: `ID do equipamento é obrigatório.`});
        }
        
        const [resultEquipamento] = await pool.execute(`SELECT * FROM equipamentos WHERE id_equipamento = ?`, [id_equipamento]);
        if (resultEquipamento.length === 0) {
            return res.status(404).json({error: `Equipamento não encontrado.`});
        }

        //TECNICO
        if(id_tecnico === undefined || id_tecnico === null || String(id_tecnico).trim() === '') {
            return res.status(400).json({error: `ID do técnico é obrigatório.`});
        }
        
        const [resultTecnico] = await pool.execute(`SELECT * FROM usuarios WHERE id_usuario = ?`, [id_tecnico]);
        if (resultTecnico.length === 0) {
            return res.status(404).json({error: `Técnico não encontrado.`});
        }


        //NF REMESSA
        if(nf_remessa && nf_remessa.trim() !== ``){
            if (!/^[0-9]+$/.test(nf_remessa)) {
                return res.status(400).json({ error: `O campo 'NF Remessa' deve conter apenas números.` });
            }

            const [resultNfRemessa] = await pool.execute(`SELECT * FROM ordens_servico WHERE nf_remessa = ?`, [nf_remessa]);
            if (resultNfRemessa.length > 0) {
                return res.status(400).json({error: `Já existe uma ordem de serviço com a mesma NF/Remessa.`});
            }

        }

        //CONDIÇÃO DE PAGAMENTO
        if(id_condicao_pagamento === undefined || id_condicao_pagamento === null || String(id_condicao_pagamento).trim() === '') {
            return res.status(400).json({error: `ID da condição de pagamento é obrigatório.`});
        }

        const [resultCondicaoPagamento] = await pool.execute(`SELECT * FROM condicao_pagamento WHERE id_condicao_pagamento = ?`, [id_condicao_pagamento]);
        if (resultCondicaoPagamento.length === 0) {
            return res.status(404).json({error: `Condição de pagamento não encontrada.`});
        }


        //DEFEITO
        if(defeito.trim() == ``){
            return res.status(400).json({error: `Defeito é obrigatório.`});
        }

        //STATUS ORDEM
        if(id_status_ordem === undefined || id_status_ordem === null || String(id_status_ordem).trim() === '') {
            return res.status(400).json({error: `ID do status da ordem é obrigatório.`});
        }

        const [resultStatusOrdem] = await pool.execute(`SELECT * FROM status_ordem WHERE id_status_ordem = ?`, [id_status_ordem]);
        if (resultStatusOrdem.length === 0) {
            return res.status(404).json({error: `Status da ordem não encontrado.`});
        }

        const[aberturaOrdem] = await pool.execute(`INSERT INTO ordens_servico (id_cliente, id_equipamento, id_tecnico, nf_remessa, id_condicao_pagamento, defeito, relatorio_tecnico, id_status_ordem) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [id_cliente, id_equipamento, id_tecnico, nf_remessa, id_condicao_pagamento, defeito, relatorio_tecnico, id_status_ordem]);

        res.status(201).json({
            message: `Ordem de serviço criada com sucesso.`,
            ordem: aberturaOrdem
        });
        
        
    }catch(error){
        console.error(`Erro ao criar ordem de serviço:`, error);
        return res.status(500).json({error: `Erro ao criar ordem de serviço.`});
    }
});