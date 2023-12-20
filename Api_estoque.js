

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




app.post('/cadastrar', async (req, res) => {
    const {
        serial,
        modelo,
        quantidade,
        estado,
        valor,
        descricao
    } = req.body;

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






app.get('/pesquisar', async (req, res) => {
    const {
        serial,
        modelo,
        quantidade,
        estado,
        valor,
        descricao
    } = req.query;

    const filters = [];
    const values = [];

    let index = 1; 

    if (serial) {
        filters.push(`serial = $${index}`);
        values.push(serial);
        index++;
    }
    if (modelo) {
        filters.push(`modelo = $${index}`);
        values.push(modelo);
        index++;
    }
    if (quantidade) {
        filters.push(`quantidade = $${index}`);
        values.push(quantidade);
        index++;
    }
    if (estado) {
        filters.push(`estado = $${index}`);
        values.push(estado);
        index++;
    }
    if (valor) {
        filters.push(`valor = $${index}`);
        values.push(valor);
        index++;
    }
    if (descricao) {
        filters.push(`descricao = $${index}`);
        values.push(descricao);
        index++;
    }

    // Montar a consulta final
    const query = `SELECT * FROM roteadores WHERE ${filters.join(' AND ')}`;

    const client = await pool.connect();

    try {
        const result = await client.query(query, values);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao processar a solicitação');
    } finally {
        client.release();
    }
});
















app.listen(port, () => {
    console.log(`Ouvindo a porta`)
})
