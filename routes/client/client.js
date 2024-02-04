const express = require('express');
const router = express.Router();
const imgur = require ('imgur-node-api');                 //Importando imgur para subir imagenes
const db = require('../../db/models');          //Importando el manejador de base de datos
const fs = require('fs');                       //Importando fs para borrar archivos
require('dotenv').config();                     //Aplicando la configuración para el uso de variables de entorno
imgur.setClientID(process.env.API);
let logged = false;                             //Una variable para validar si el usuario inició sesión (No recomendado este uso pero es lo más sencillo por ahora)



module.exports = router;
