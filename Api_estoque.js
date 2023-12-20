

const { deepStrictEqual } = require('assert');
const express = require('express');
const app = express() 
app.use(express.json());
const port = 3000 


const path = require('path');
require('dotenv').config({
    override: true,
    path: path.join(__dirname, 'development.env')
});


const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT
});




app.post('/cadastrar', async (req, res)=> {
    const {
        serial,
        modelo,
        quantidade,
        estado,
        valor,
        descricao
    } =  req.body;
    
    console.log('Dados recebidos:', { serial, modelo, quantidade, estado, valor, descricao });


    const client = await pool.connect();


    try {
        const insertQuery = 'INSERT INTO roteadores (serial, modelo, quantidade, estado, valor, descricao) VALUES ($1, $2, $3, $4, $5, $6)';
        const values = [serial, modelo, quantidade, estado, valor, descricao];
        await pool.query(insertQuery, values);
        console.log('Dados adicionados com sucesso!');
        res.status('200').send('Deu Certo')
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao processar a solicitação');
    } finally {
        if (client) {
            client.release();
        }
    }
})






app.listen(port, () => {
    console.log(`Ouvindo a porta`)
})
