`use strict`;

const express = require(`express`);
const app = express();

// módulos de rotas especificas
const clientesRoutes = require(`./routes/clientes`);
const equipamentosRoutes = require(`./routes/equipamentos`);
const ordensServicoRoutes = require(`./routes/ordensServico`);
const statusOrdemRoutes = require(`./routes/statusOrdem`);
const usuariosRoutes = require(`./routes/usuarios`);

//definição de caminhos base para as rotas
app.use(`/clientes`, clientesRoutes);
app.use(`/equipamentos`, equipamentosRoutes);
app.use(`/ordens-servico`, ordensServicoRoutes);
app.use(`/status-ordem`, statusOrdemRoutes);
app.use(`/usuarios`, usuariosRoutes);


module.exports = app;