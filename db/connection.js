const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/database.sqlite', ()=>{
    db.run('CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, code INTEGER NOT NULL, name TEXT, model TEXT, description TEXT, price REAL NOT NULL, count INTEGER NOT NULL, category_id INTEGER, image_id INTEGER, FOREIGN KEY(category_id) REFERENCES categories(id), FOREIGN KEY(image_id) REFERENCES images(id))');
    db.run('CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)');
    db.run('CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT, description TEXT, product_id INTEGER, outstanding BOOLEAN NOT NULL, FOREIGN KEY(product_id) REFERENCES products(id))');
    db.run('CREATE TABLE IF NOT EXISTS clients (id INTEGER PRIMARY KEY AUTOINCREMENT,name VARCHAR(255) NOT NULL,email VARCHAR(255) NOT NULL,password VARCHAR(255) NOT NULL);');
    db.run('CREATE TABLE IF NOT EXISTS ventas (client_id INTEGER NOT NULL,producto_id INTEGER NOT NULL,cantidad INTEGER NOT NULL,total_pagado DECIMAL(10,2),fecha INTEGER NOT NULL,ip_client VARCHAR(200),FOREIGN KEY (client_id) REFERENCES clientes(id),FOREIGN KEY (producto_id) REFERENCES products(id))');
    db.run('CREATE TABLE IF NOT EXISTS calificacion (producto_id INTEGER NOT NULL,user_id INTEGER NOT NULL,puntos INTEGER NOT NULL)');

});


module.exports = db;