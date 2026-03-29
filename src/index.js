`use strict`;

require(`dotenv`).config();

const app = require(`./app`);

//inicio do servidor
const PORT = process.env.PORT || 3000;
try{
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });

}catch(error){
    return{sucess: false, message: `Erro ao iniciar Server: ${error.message}`}
}


