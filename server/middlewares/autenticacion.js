const jwt = require('jsonwebtoken');


//=============================
// Verificar Token
//=============================

//Revisar el token
let verificaToken = (req, res, next) => {
    let token = req.get('token'); //Nombre que se le da

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        //Si sucede algún error
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }

        //Cualquier petición pueda tener acceso, el decoded es el payload
        req.usuario = decoded.usuario;
        next();
    });

};

//=============================
// Verifica AdminRole
//=============================
let verificaAdminRole = (req, res, next) => {
    let usuario = req.usuario;

    //Verifica si es un usuario con el rol "ADMIN_ROLE"
    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.json({
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        });
    }
};

module.exports = {
    verificaToken,
    verificaAdminRole
}