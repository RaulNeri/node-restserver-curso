const express = require('express');

//Encriptar contraseña con hash de una sola vía
const bcrypt = require('bcryptjs');
//Agregar librería JSONWebToken
const jwt = require('jsonwebtoken');

const Usuario = require('../models/usuario');

const app = express();

app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        //Si se genera algún error
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //Evaluar si existe el usuario
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o contraseña incorrectos'
                }
            });
        }

        //Identifica si la contraseña  hace Match con la que se tiene en la BD
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (contraseña) incorrectos'
                }
            });
        }

        //y genera el token payload
        let token = jwt.sign({
            //Payload
            usuario: usuarioDB,
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        //Se obtiene la respuesta
        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });

    });

});

module.exports = app;