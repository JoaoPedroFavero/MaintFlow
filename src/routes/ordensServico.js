`use strict`;

const express = require(`express`);

const {pool} = require(`../config/db`);

const router = express.Router();

module.exports = router;

/*
ordens_servico (
	id_ordem INT AUTO_INCREMENT NOT NULL,
    data_abertura DATE NOT NULL,
    nf_remessa VARCHAR(250),
    defeito TEXT NOT NULL,
    relatorio_tecnico TEXT,
    id_equipamento INT NOT NULL,
    id_cliente INT NOT NULL,
    id_tecnico INT NOT NULL,
    id_status_ordem INT NOT NULL,
    id_condicao_pagamento INT NOT NULL,
    
    PRIMARY KEY (id_ordem),
    FOREIGN KEY (id_equipamento) REFERENCES equipamentos(id_equipamento),
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    FOREIGN KEY (id_tecnico) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_status_ordem) REFERENCES status_ordem (id_status_ordem),
    FOREIGN KEY (id_condicao_pagamento) REFERENCES condicao_pagamento (id_condicao_pagamento)
);
*/

//-----------------------------------------------------------------------------------------------------------------------------------

router.post(`/`, async (req, res) => {
    const {data_abertura, condicao_pagamento, nf_remessa, defeito, relatorio_tecnico, id_equipamento, id_cliente, id_tecnico, id_status_ordem} = req.body;
    
    try{
        
    }catch(error){
        console.error(`Erro ao criar ordem de serviço:`, error);
        return res.status(500).json({error: `Erro ao criar ordem de serviço.`});
    }
});