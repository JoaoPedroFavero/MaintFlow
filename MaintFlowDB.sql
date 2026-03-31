CREATE DATABASE MaintFlowDB;
USE MaintFlowDB;

CREATE TABLE usuarios (
	id_usuario INT NOT NULL AUTO_INCREMENT,
    usuario VARCHAR(250) NOT NULL UNIQUE,
    email VARCHAR(250) NOT NULL UNIQUE,
    senha VARCHAR(250) NOT NULL,
    tipo_usuario ENUM('ADMIN', 'TECNICO', 'CLIENTE') NOT NULL,
    status_usuario ENUM('ATIVO', 'INATIVO') DEFAULT 'ATIVO' NOT NULL,
    
    PRIMARY KEY (id_usuario)
);

CREATE TABLE clientes (
	id_cliente INT NOT NULL AUTO_INCREMENT,
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
);

CREATE TABLE equipamentos (
	id_equipamento INT AUTO_INCREMENT,
    tipo_equipamento ENUM('MAQUINA', 'FERRAMENTA', 'TOCHA') NOT NULL,
    marca_equipamento VARCHAR(250) NOT NULL,
    modelo_equipamento VARCHAR(250) NOT NULL,
    identificador_equipamento VARCHAR(250) NOT NULL UNIQUE,
    id_cliente INT NOT NULL,
    
    PRIMARY KEY (id_equipamento),
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
);

CREATE TABLE status_ordem (
	id_status_ordem INT AUTO_INCREMENT NOT NULL,
    nome_status VARCHAR(250) NOT NULL UNIQUE,
    
    PRIMARY KEY (id_status_ordem)
);

CREATE TABLE ordens_servico (
	id_ordem INT AUTO_INCREMENT NOT NULL,
    data_abertura DATE NOT NULL,
    condicao_pagamento VARCHAR(250) NOT NULL,
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
    FOREIGN KEY (id_status_ordem) REFERENCES status_ordem (id_status_ordem)
);

ALTER TABLE usuarios MODIFY COLUMN senha VARCHAR(250) NOT NULL;