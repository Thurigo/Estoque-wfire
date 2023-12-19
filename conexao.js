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
(async () => {
    const client = await pool.connect();
    try {
        const { rows } = await pool.query('SELECT current_user');
        const currentUser = rows[0]['current_user'];
        console.log(currentUser);

        try {
            const insertQuery = 'INSERT INTO roteadores (serial, modelo, quantidade, estado, valor, descricao) VALUES ($1, $2, $3, $4, $5, $6)';
            const values = ['92490A4AB9F9','951', '7', 'novo', '300','rb da antiga unimed'];
            await pool.query(insertQuery, values);
            console.log('Dados adicionados com sucesso!');
        } catch (err) {
            console.error('Erro ao adicionar dados:', err);
        } finally {
            client.release();
        }

    } catch (err) {
        console.error(err);
    } finally {
        // Certifique-se de liberar o cliente apenas se não tiver sido liberado antes
        if (client) {
            client.release();
        }
    }
})();







