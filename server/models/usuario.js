//Encargado del modelo de datos

const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido'
};

//Esquema de mongoose
let Schema = mongoose.Schema;

//Definir esquema y definir reglas y controles (campos)
let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El correo es necesario']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    //Ejercicio 14. Completas los campos
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});

//Agrega un mmetodo con this que sirve para no mostrar la contraseña
usuarioSchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;
    return userObject;
}

//Use un plugin para controlar el unique
usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });

//Exportar con un nombre de modelo
module.exports = mongoose.model('Usuario', usuarioSchema);