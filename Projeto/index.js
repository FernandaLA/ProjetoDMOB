// @author: Fernanda Lopes de Assis //
const express = require('express');
const app = express();
const path = require('path');
__dirname = path.resolve();

//conexão com o banco
const mysql = require('mysql');
var sha1 = require('sha1');

const connection = mysql.createConnection({
    host: 'remotemysql.com',
    user: 'yQHPKK27a1',
    password: 'hrU97vbrRs',
    database: 'yQHPKK27a1',
    port: '3306'
});
//FIM

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

//Reconhecendo arquivos html
app.engine('html', require('ejs').renderFile);
//FIM

//Reconhecendo css importado dentro do html
app.use(express.static(path.join(__dirname+"/")));
//FIM

/* Pagina inicial */
//Requisição para carregar a tela inicial
app.get('/', (req, res) => {
    res.render(__dirname + '/views/home.html');
});
//FIM

/* Pagina da galeria */
//Requisição para carregar a tela da galeria
app.get('/galeria', (req, res) => {
    res.render(__dirname + '/views/galeria.html');
});
//FIM

/* Pagina do Fale Conosco */
//Requisição para carregar a tela do fale conosco
app.get('/faleConosco', (req, res) => {
    res.render(__dirname + '/views/faleConosco.html');
});
//FIM

/* Página da Agenda */
//Requisição para carregar a tela de agenda e a listagem
app.get('/agenda', (req, resposta) => {
    connection.query("SELECT id, DATE_FORMAT(data, '%d/%m/%Y') AS data, horario, local FROM `agenda` ORDER BY data, horario", function (err, rows, fields) {
        if (err) {
            console.log('error', err.message, err.stack);
        } else {
            resposta.render(__dirname + '/views/agenda/agenda.html', { eventos: rows });
        }
    });
});
//FIM

//Requisição para carregar a tela de cadastro de eventos
app.get('/cadastrar', (req, resposta) => {
    resposta.render(__dirname + '/views/agenda/cadastrar.html', { msg: "Cadastro de novos eventos" });
});
//FIM

//Requisição para cadastrar um novo evento no banco
app.post('/cadastrar', function (request, res) {
    var data = request.body.data;
    var horario = request.body.horario;
    var local = request.body.local;
    const evento = {
        'data': data,
        'horario': horario,
        'local': local
    };
    connection.query('INSERT INTO agenda SET ?'
        , evento, (err, resp) => {
            if (err) {
                console.log('error'
                    , err.message, err.stack)
            }
            else
                console.log('ID do ultimo inserido:'
                    , resp.insertId);
        });
    res.render(__dirname + '/views/agenda/cadastrar.html'
        , { msg: "Cadastrado realizado com Sucesso!" });
});
//FIM

//Requisição para carregar os dados de um evento cadastrado
app.get('/editar/:id', (req, resposta) => {
    var id = req.params.id;
    connection.query("SELECT id, DATE_FORMAT(data, '%Y-%m-%d') as data, horario, local FROM `agenda` Where id = ?"
        , [id], function (err, rows, fields) {
            if (err) {
                console.log('error'
                    , err.message, err.stack)
            }
            else {
                console.log(rows[0]);
                resposta.render(__dirname + '/views/agenda/editar.html'
                    , { evento: rows[0] });
            }
        });
});
//FIM

//Requisição para alterar os dados de um evento cadastrado
app.post('/editar', function (request, res) {
    var data = request.body.data;
    var horario = request.body.horario;
    var local = request.body.local;
    var id = request.body.id;
    connection.query(
        'UPDATE agenda SET local = ?, data = ?, horario = ? Where id = ?'
        , [local, data, horario, id],
        (err, result) => {
            if (err) throw err;
            console.log(`Atualizado ${result.changedRows} row(s)`);
        });
        res.redirect('/agenda');
});
//FIM

//Requisição para apagar um evento cadastrado
app.get('/deletar/:id', (req, res) => {
    var id = req.params.id;
    connection.query('DELETE FROM `agenda` Where id = ?'
        , [id], function (err, result) {
            console.log("Registro Deletado!!");
            console.log(result);
        });
    res.redirect('/agenda');
});
//FIM

app.listen(process.env.port || 4000);

console.log('Running at Port 4000');