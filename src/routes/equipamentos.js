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
    
    PRIMARY KEY (id_equipamento),
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
);*/

//-----------------------------------------------------------------------------------------------------------------------------------

router.


//-----------------------------------------------------------------------------------------------------------------------------------

module.exports = router;