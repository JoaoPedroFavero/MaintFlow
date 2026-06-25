`use strict`;

const express = require(`express`);

const {pool} = require(`../config/db`);

const router = express.Router();

/*CREATE TABLE equipamentos (
	id_equipamento INT AUTO_INCREMENT,
    tipo_equipamento ENUM('MAQUINA', 'FERRAMENTA', 'TOCHA') NOT NULL,
    marca_equipamento VARCHAR(250) NOT NULL,
    modelo_equipamento VARCHAR(250) NOT NULL,
    identificador_equipamento VARCHAR(250) NOT NULL UNIQUE,
    id_cliente INT NOT NULL,
    status_equipamento ENUM('ATIVO', 'INATIVO') DEFAULT 'ATIVO' NOT NULL,
    
    PRIMARY KEY (id_equipamento),
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
);*/

//-----------------------------------------------------------------------------------------------------------------------------------

router.post(`/`, async (req, res) => {
    const {tipo_equipamento, marca_equipamento, modelo_equipamento, identificador_equipamento, id_cliente} = req.body;

    try{
        if(tipo_equipamento.trim() === `` || tipo_equipamento != `MAQUINA` && tipo_equipamento != `FERRAMENTA` && tipo_equipamento != `TOCHA`){
            return res.status(400).json({error: `O campo 'Tipo Equipamento' é obrigatório e deve ser 'MAQUINA', 'FERRAMENTA' ou 'TOCHA'.`});
        }

        if(marca_equipamento.trim() === `` || marca_equipamento.length < 3 || marca_equipamento.length > 250){
            return res.status(400).json({error: `O campo 'Marca Equipamento' é obrigatório e deve conter entre 3 e 250 caracteres.`});
        }

        if(modelo_equipamento.trim() === `` || modelo_equipamento.length < 3 || modelo_equipamento.length > 250){
            return res.status(400).json({error: `O campo 'Modelo Equipamento' é obrigatório e deve conter entre 3 e 250 caracteres.`});
        }

        const [cliente] = await pool.execute(`SELECT * FROM clientes WHERE id_cliente = ?`, [id_cliente]);
        if(cliente.length === 0){
            return res.status(404).json({error: `Cliente com ID ${id_cliente} não encontrado.`});
        }

        let defaultSerial;
        if(identificador_equipamento.trim() === ``){
            const nomeClienteFormatado = cliente[0].nome_cliente.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 5);

            const [lastSerial] = await pool.execute(
                `SELECT identificador_equipamento 
                 FROM equipamentos 
                 WHERE tipo_equipamento = ? AND id_cliente = ? 
                 ORDER BY id_equipamento DESC 
                 LIMIT 1`,
                [tipo_equipamento, id_cliente]
            );

            let serialNumber = 1;
            if(lastSerial.length > 0){
                const lastSerialStr = lastSerial[0].identificador_equipamento;
                const match = lastSerialStr.match(/\d+$/); //busca dígitos no final da string (/d - digito, + - um ou mais, $ - fim da string)
                if(match){
                    serialNumber = parseInt(match[0]) + 1;
                }
            }

            const prefixos = { MAQUINA: 'M', FERRAMENTA: 'F', TOCHA: 'T' };
            const prefixo = prefixos[tipo_equipamento];

            if (!prefixo) {
                return res.status(400).json({ error: `Tipo de equipamento inválido.` });
            }

            defaultSerial = prefixo + nomeClienteFormatado + serialNumber;
            
        } else {
            defaultSerial = identificador_equipamento;
        }

        await pool.execute(
            `INSERT INTO equipamentos (tipo_equipamento, marca_equipamento, modelo_equipamento, identificador_equipamento, id_cliente) VALUES (?, ?, ?, ?, ?)`,
            [tipo_equipamento, marca_equipamento, modelo_equipamento, defaultSerial, id_cliente]
        );

        res.status(201).json({message: `Equipamento cadastrado com sucesso.`, equipamento: defaultSerial});

    }catch(error){
        console.error(`Erro ao cadastrar equipamento:`, error);
        return res.status(500).json({error: `Erro ao cadastrar equipamento. Tente novamente mais tarde.`});
    }
});
//-----------------------------------------------------------------------------------------------------------------------------------

router.get(`/`, async (req, res) => {
    try {
        const [result] = await pool.execute(`SELECT * FROM equipamentos`);

        if (result.length === 0) {
            return res.status(404).json({message: `Nenhum equipamento encontrado.`});
        }

        res.status(200).json(result);

    } catch (error) {
        console.error(`Erro ao buscar equipamentos:`, error);
        return res.status(500).json({error: `Erro interno do servidor.`});
    }
});

router.get(`/id_equipamento/:id`, async (req, res) => {
    const {id} = req.params;
    try {
        const [result] = await pool.execute(`SELECT * FROM equipamentos WHERE id_equipamento = ?`, [id]);

        if (result.length === 0) {
            return res.status(404).json({message: `Nenhum equipamento com ID ${id} encontrado.`});
        }

        res.status(200).json(result);

    } catch (error) {
        console.error(`Erro ao buscar equipamentos:`, error);
        return res.status(500).json({error: `Erro interno do servidor.`});
    }
});

router.get(`/identificador_equipamento/:identificador`, async (req, res) => {
    const {identificador} = req.params;
    try {
        const [result] = await pool.execute(`SELECT * FROM equipamentos WHERE identificador_equipamento LIKE ?`, [`%${identificador}%`]);

        if (result.length === 0) {
            return res.status(404).json({message: `Nenhum equipamento com identificador ${identificador} encontrado.`});
        }

        res.status(200).json(result);

    } catch (error) {
        console.error(`Erro ao buscar equipamentos:`, error);
        return res.status(500).json({error: `Erro interno do servidor.`});
    }
});

router.get(`/tipo_equipamento/:tipo`, async (req, res) => {
    const {tipo} = req.params;
    try {
        const [result] = await pool.execute(`SELECT * FROM equipamentos WHERE tipo_equipamento = ?`, [tipo]);

        if (result.length === 0) {
            return res.status(404).json({message: `Nenhum equipamento do tipo ${tipo} encontrado.`});
        }

        res.status(200).json(result);

    } catch (error) {
        console.error(`Erro ao buscar equipamentos:`, error);
        return res.status(500).json({error: `Erro interno do servidor.`});
    }
});

router.get(`/marca_equipamento/:marca`, async (req, res) => {
    const {marca} = req.params;
    try {
        const [result] = await pool.execute(`SELECT * FROM equipamentos WHERE marca_equipamento LIKE ?`, [`%${marca}%`]);

        if (result.length === 0) {
            return res.status(404).json({message: `Nenhum equipamento da marca ${marca} encontrado.`});
        }

        res.status(200).json(result);

    } catch (error) {
        console.error(`Erro ao buscar equipamentos:`, error);
        return res.status(500).json({error: `Erro interno do servidor.`});
    }
});

router.get(`/modelo_equipamento/:modelo`, async (req, res) => {
    const {modelo} = req.params;
    try {
        const [result] = await pool.execute(`SELECT * FROM equipamentos WHERE modelo_equipamento LIKE ?`, [`%${modelo}%`]);

        if (result.length === 0) {
            return res.status(404).json({message: `Nenhum equipamento do modelo ${modelo} encontrado.`});
        }

        res.status(200).json(result);

    } catch (error) {
        console.error(`Erro ao buscar equipamentos:`, error);
        return res.status(500).json({error: `Erro interno do servidor.`});
    }
});

router.get(`/equipamento_cliente_id/:id`, async (req, res) => {
    const {id} = req.params;
    try {
        const [result] = await pool.execute(`SELECT * FROM equipamentos WHERE id_cliente = ?`, [id]);

        if (result.length === 0) {
            return res.status(404).json({message: `Nenhum equipamento do cliente com ID ${id} encontrado.`});
        }

        res.status(200).json(result);

    } catch (error) {
        console.error(`Erro ao buscar equipamentos:`, error);
        return res.status(500).json({error: `Erro interno do servidor.`});
    }
});

router.get(`/equipamento_cliente_CNPJ_CPF/:cnpj_cpf`, async (req, res) => {
    const {cnpj_cpf} = req.params;
    let clean_cnpj_cpf = cnpj_cpf.replace(/\D/g, '');
    let clientId;
    let clientDoc;

    try{
        if(clean_cnpj_cpf.length !== 11 && clean_cnpj_cpf.length !== 14) {
            return res.status(400).json({message: `CNPJ/CPF inválido.`});
        }

        if(clean_cnpj_cpf.length === 11) {
            const[resultCPF] = await pool.execute(`SELECT id_cliente FROM clientes WHERE cpf_cliente = ?`, [clean_cnpj_cpf]);
            if (resultCPF.length === 0) {
                return res.status(404).json({message: `Nenhum cliente com CPF ${clean_cnpj_cpf} encontrado.`});
            }
            clientId = resultCPF[0].id_cliente;
            clientDoc = "CPF";
        }

        if(clean_cnpj_cpf.length === 14) {
            const[resultCNPJ] = await pool.execute(`SELECT id_cliente FROM clientes WHERE cnpj_cliente = ?`, [clean_cnpj_cpf]);
            if (resultCNPJ.length === 0) {
                return res.status(404).json({message: `Nenhum cliente com CNPJ ${clean_cnpj_cpf} encontrado.`});
            }
            clientId = resultCNPJ[0].id_cliente;
            clientDoc = "CNPJ";
        }
    } catch (error) {
        console.error(`Erro ao buscar cliente:`, error);
        return res.status(500).json({error: `Erro interno do servidor.`});
    }


    try {
        const [result] = await pool.execute(`SELECT * FROM equipamentos WHERE id_cliente = ?`, [clientId]);

        if (result.length === 0) {
            return res.status(404).json({message: `Nenhum equipamento do cliente com ${clientDoc} ${clean_cnpj_cpf} encontrado.`});
        }

        res.status(200).json(result);

    } catch (error) {
        console.error(`Erro ao buscar equipamentos:`, error);
        return res.status(500).json({error: `Erro interno do servidor.`});
    }
});

//-----------------------------------------------------------------------------------------------------------------------------------

router.delete(`/inativar/id_equipamento/:id`, async (req, res) => {
    const {id} = req.params;
    
    try {
        const[result] = await pool.execute(`SELECT * FROM equipamentos WHERE id_equipamento = ?`, [id]);
        
        if (result.length === 0) {
            return res.status(404).json({message: `Equipamento com ID ${id} não encontrado.`});
        }
        
    } catch (error) {
        console.error(`Erro ao buscar id do equipamento:`, error);
        return res.status(500).json({error: `Erro interno do servidor.`});
    }

    try {
        await pool.execute(`UPDATE equipamentos SET status_equipamento = 'INATIVO' WHERE id_equipamento = ?`, [id]);
        res.json({message: `Equipamento com ID ${id} inativado com sucesso.`});

    } catch (error) {
        console.error(`Erro ao inativar equipamento com ID ${id}:`, error);
        res.status(500).json({error: `Erro interno do servidor.`});
    }
});

router.delete(`/inativar/identificador_equipamento/:identificador`, async (req, res) => {
    const {identificador} = req.params;
    
    try {
        const[result] = await pool.execute(`SELECT * FROM equipamentos WHERE identificador_equipamento = ?`, [identificador]);
        
        if (result.length === 0) {
            return res.status(404).json({message: `Equipamento com identificador ${identificador} não encontrado.`});
        }
        
    } catch (error) {
        console.error(`Erro ao buscar identificador do equipamento:`, error);
        return res.status(500).json({error: `Erro interno do servidor.`});
    }

    try {
        await pool.execute(`UPDATE equipamentos SET status_equipamento = 'INATIVO' WHERE identificador_equipamento = ?`, [identificador]);
        res.json({message: `Equipamento com identificador ${identificador} inativado com sucesso.`});
        
    } catch (error) {
        console.error(`Erro ao inativar equipamento com identificador ${identificador}:`, error);
        res.status(500).json({error: `Erro interno do servidor.`});
    }
});

module.exports = router;