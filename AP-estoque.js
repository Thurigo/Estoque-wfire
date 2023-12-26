

const { deepStrictEqual } = require('assert');
const express = require('express');
const app = express()
app.use(express.json());
const port = 3001


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


//---------------------------CADASTRAR-----------------

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
        const insertQuery = 'INSERT INTO aps (serial, modelo, quantidade, estado, valor, descricao) VALUES ($1, $2, $3, $4, $5, $6)';
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




//---------------------PESQUISAR-----------------------

app.get('/pesquisar', async (req, res) => {
    const {
        serial,
        modelo,
        quantidade,
        estado,
        valor,
        descricao
    } = req.query;

    const filtro = [];
    const values = [];

    let index = 1; 

    if (serial) {
        filtro.push(`serial = $${index}`);
        values.push(serial);
        index++;
    }
    if (modelo) {
        filtro.push(`modelo = $${index}`);
        values.push(modelo);
        index++;
    }
    if (quantidade) {
        filtro.push(`quantidade = $${index}`);
        values.push(quantidade);
        index++;
    }
    if (estado) {
        filtro.push(`estado = $${index}`);
        values.push(estado);
        index++;
    }
    if (valor) {
        filtro.push(`valor = $${index}`);
        values.push(valor);
        index++;
    }
    if (descricao) {
        filtro.push(`descricao = $${index}`);
        values.push(descricao);
        index++;
    }

    const query = `SELECT * FROM aps WHERE ${filtro.join(' AND ')}`;

    const client = await pool.connect();

    try {
        const result = await client.query(query, values);
        console.log('Pesquisafeita')
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao processar a solicitação');
    } finally {
        client.release();
    }
});






//-------------------Atualizar
app.put('/atualizar/:id', async (req, res) => {
    const itemId = req.params.id;

    const {
        serial,
        modelo,
        quantidade,
        estado,
        valor,
        descricao
    } = req.query;

    let updateFields = [];
    let values = [];
    let index = 1;

    if (serial) {
        updateFields.push(`serial = $${index}`);
        values.push(serial);
        index++;
    }
    if (modelo) {
        updateFields.push(`modelo = $${index}`);
        values.push(modelo);
        index++;
    }
    if (quantidade) {
        updateFields.push(`quantidade = $${index}`);
        values.push(quantidade);
        index++;
    }
    if (estado) {
        updateFields.push(`estado = $${index}`);
        values.push(estado);
        index++;
    }
    if (valor) {
        updateFields.push(`valor = $${index}`);
        values.push(valor);
        index++;
    }
    if (descricao) {
        updateFields.push(`descricao = $${index}`);
        values.push(descricao);
        index++;
    }

    if (updateFields.length === 0) {
        return res.status(400).send('Nenhum campo fornecido para atualização');
    }

    const updateQuery = `UPDATE aps SET ${updateFields.join(', ')} WHERE id = $${index}`;
    values.push(itemId);

    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        await client.query(updateQuery, values);
        await client.query('COMMIT');
        res.status(200).send('Atualização bem-sucedida');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('Erro ao processar a solicitação de atualização');
    } finally {
        client.release();
    }
});














app.listen(port, () => {
    console.log(`Ouvindo a porta`)
})
