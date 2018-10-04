const express = require('express');

//Encriptar contraseña con hash de una sola vía
const bcrypt = require('bcryptjs');

//Filtrar lo que necesito con underscore
const _ = require('underscore');

const Usuario = require('../models/usuario');

//Importacion para usar, con destructuración
const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');

const app = express();

app.get('/usuario', verificaToken, (req, res) => {
    //Uso de todas las propiedades que tiene el usuario
    // return res.json({
    //     //Tengo toda la información de un usuario
    //     usuario: req.usuario,
    //     nombre: req.usuario.nombre,
    //     email: req.usuario.email
    // })

    //Respuesta del servicio
    //Parametros opcionales para que el usuario diga cuantos datos muestra
    let desde = req.query.desde || 0;
    desde = Number(desde);

    //establece el limite que yo quiera o uno por defecto
    let limite = req.query.limite || 5;
    limite = Number(limite);

    Usuario.find({ estado: true }, 'nombre email role estado google img')
        .skip(desde) //salta los primeros 5
        .limit(limite) //solo 5 registro devuelve
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            Usuario.count({ estado: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                });
            });

        });
});

app.post('/usuario', [verificaToken, verificaAdminRole], function(req, res) {

    //Se obtiene la información del POST
    let body = req.body;

    //TRABAJAR CON LAS MODIFICACIONES DEL MODEL
    //Un objeto de tipo usuario con todos sus valores
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        //hashSync( a donde aplica, numero de veces)
        password: bcrypt.hashSync(body.password, 10),
        //img: body.img,
        role: body.role

    });

    //Guardar en la base de datos
    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //usuarioDB.password = null;

        //retorna todo el usuario si no entra al error
        res.json({
            ok: true,
            usuario: usuarioDB
        })
    });
});

app.put('/usuario/:id', [verificaToken, verificaAdminRole], function(req, res) {

    let id = req.params.id;
    //Información del body
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    //Usuario.findById( id, callback ); en Mongoose busque por id y lo actualice
    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

//Borrar
app.delete('/usuario/:id', [verificaToken, verificaAdminRole], function(req, res) {

    let id = req.params.id;
    //Ejercicio 15. Borrar cambiando estado
    let cambiaEstado = {
        estado: false
    };

    //Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }
        //SI se borra obtienes una referencia al usuario
        res.json({
            ok: true,
            usuario: usuarioBorrado,
        });
    });
});

module.exports = app;