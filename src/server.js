`use strict`;

const express = require(`express`);
const app = express();

// módulos de rotas especificas

try{
    const clientesRoutes = require(`./routes/clientes`);
    const equipamentosRoutes = require(`./routes/equipamentos`);
    const ordensServicoRoutes = require(`./routes/ordensServico`);
    const statusOrdemRoutes = require(`./routes/statusOrdem`);
    const usuariosRoutes = require(`./routes/usuarios`);
}catch(error){
    console.error(`Erro ao carregar as modulos das rotas:`, error);
}

//definição de caminhos base para as rotas
try{
    app.use(`/clientes`, clientesRoutes);
    app.use(`/equipamentos`, equipamentosRoutes);
    app.use(`/ordens-servico`, ordensServicoRoutes);
    app.use(`/status-ordem`, statusOrdemRoutes);
    app.use(`/usuarios`, usuariosRoutes);
}catch(error){
    console.error(`Erro ao carregar as bases das rotas:`, error);
}

module.exports = app;