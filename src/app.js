`use strict`;

const express = require(`express`);
const app = express();

const {testConnection} = require(`./config/db`);
const serverRoutes = require(`./server`);

try{
    app.use(express.json());
    app.get(`/`, (req, res) => res.send({status: `sucess`, message: `rota principal funcionando!`}));

    app.use(`/`, serverRoutes);

    async function dbValidation(){
        const result = await testConnection();
        console.log(result.message);
    }

    dbValidation();

    app.use((err, req, res, next) => {
        console.log(err);
        res.status(err.status || 500).json({error: err.message || `Erro interno do servidor`});
    });

}catch(error){
    return{sucess: false, message: `Erro ao iniciar. App.js falhou: ${error.message}`};
}

module.exports = app;
