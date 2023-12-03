/****/
//Manejador de rutas para el administración, es independiente de las otras rutas que se vayan a crear
const express = require('express');             //Importando express
const router = express.Router();                //Usando el método router
const imgur = require ('imgur-node-api');                 //Importando imgur para subir imagenes
const db = require('../../db/models');          //Importando el manejador de base de datos
const fs = require('fs');                       //Importando fs para borrar archivos
require('dotenv').config();                     //Aplicando la configuración para el uso de variables de entorno
imgur.setClientID(process.env.API);
let logged = false;                             //Una variable para validar si el usuario inició sesión (No recomendado este uso pero es lo más sencillo por ahora)

////GET

router.get('/', (req, res) => {                 //Obteniendo la ruta principal para el administrador
    /*if(!logged){                                //Inició?
        res.render('admin/login');              //Si no, ir a logearse
    }else{     */                                 //De lo contrario

        db.getProducts()                        //Ir a la página en dónde se mostrará una tabla con los productos almacenados en db
        .then(data => {       
            db.getImages()
            .then(images => {
                res.render('admin/index.admin.ejs', { products: data, images: images });              ///Pasando los productos y las imagenes al index.ejs del admin
            })
            .catch(err => {
                res.render('admin/index.admin.ejs', { products: data, images: []});              ///Pasando los productos al index.ejs del admin sin iagenes
            }) 
        })
        .catch(err => {
            res.render('admin/index.admin.ejs', { products: [], images: []});                //Si hubo error, cargar la página pero sin datos
        });
    /*}*/
});

router.get('/add', (req, res) => {
    db.getCategories()
    .then(data => {
        res.render('admin/add', { categories: data });
    })
    .catch(err => {
        console.log(err);
        res.render('admin/add', { categories: [] });
    })
})

router.get('/new-category', (req, res) => {
    db.getCategories()
    .then(data => {
        res.render('admin/new-categorys', { categories: data });
    })
    .catch(err => {
        console.log(err);
        res.render('admin/new-categorys', { categories: [] });
    })
})

router.get('/edit/:id', (req, res) => {
    const id = req.params.id;
    console.log(id)
    db.getProductID(id)
    .then(data => {
        db.getImagesID(id)
        .then(images => {
            db.getCategories()
            .then(categories => {
                res.render('admin/edit', { product: data, images: images, categories: categories });
            })
            .catch(err => {
                console.log(err);
                res.render('admin/edit', { product: data, images: images, categories: [] });
            })
        })
        .catch(err => {
            console.log(err);
            res.render('admin/edit', { product: data, images: [], categories: [] });
        })
    })
    .catch(err => {
        console.log(err);        
        res.render('admin/edit', { product: [], images: [], categories: [] });
    })
});


router.get('/delete/:id', (req, res)=>{    //Recibiendo los datos enviados desde el delete por POST
    const id = req.params.id;           //Capturando el id
    console.log('XDDDDDDDDD');
   db.getProductID(id)
   .then(data => {
      db.deleteImage(data.image_id)
      .then(()=>{
           db.deleteProduct(id)                //Borrando el producto
            .then(()=>{
                res.redirect('/admin')
            })
            .catch(err => {
                console.log(err);
                res.redirect('/admin')
            });
      })
      .catch(err => {
          console.log(err);
          res.redirect('/admin')
      })
   })
});

router.get('/delete-image/:id', (req, res)=>{    //Recibiendo los datos enviados desde el delete por POST
    const id = req.params.id;           //Capturando el id de la imagen
    db.deleteImageProduct(id)
    .then(()=>{
        db.deleteImage(id)                //Borrando la imagen
        .then(()=>{
            res.redirect('/admin')
        })
        .catch(err => {
            console.log(err);
            res.redirect('/admin')
        });
    })
    .catch(err => {
        console.log(err);
        res.redirect('/admin')
    })
    
});

////POST

router.post('/login', (req, res) =>{                                    //Recibiendo los datos enviados desde el login por POST
  console.log("ADMIN")
    const {email, password} = req.body;                                      //Capturando el email y el password
    if(email == process.env.__ADMIN && password == process.env.__PASS){       //Validando
        logged = true;                                          //Si todo bien, es true y redirecciona a la página del admin
        res.redirect('/admin')
    }else{
        logged = false;                                         //Si no, redirecciona pero en false
        res.redirect('/admin')
    }
});

router.post('/add', (req, res)=>{                                               //Recibiendo los datos enviados desde el add por POST
    const {code, name, model, description, price, count, category_id, image} = req.body;   //Capturando los datos
    if(!req.files){
        return res.status(400).redirect('/admin');
    }

    let Image = req.files.image;
    let uploadPath = __dirname + '/' + Image.name;
    Image.mv(uploadPath, (err) => {
        if (err) {
            return res.status(500).send(err);
        }
        imgur.upload(uploadPath, (err, _res) => {
            console.log('File uploaded!');
            console.log(_res.data.link);
            db.insertImage(_res.data.link, null, false)
            .then(()=>{
                res.redirect('/admin')
            })
            .catch(err => {
                console.log(err);
                res.redirect('/admin')
            });
        });
        fs.unlinkSync(uploadPath);
    });
    db.insertProduct(code, name, model, description, price, count, category_id, image) //Insertando los datos
        .then((id)=>{
            res.redirect('/admin')
        })
        .catch(err => {             
            console.log(err);
            res.redirect('/admin')
        });
});

router.post('/edit', (req, res)=>{            //Recibiendo los datos enviados desde el update por POST
    const id = req.body.id;
    const {code, name, model, description, price, count, category_id} = req.body;
    console.log(id, code, name, model, description, price, count, category_id)
    db.updateProduct(code, name, model, description, price, count, category_id, id)
    .then(()=>{
        res.redirect('/admin')
    })
    .catch(err => {
        console.log(err);
        res.redirect('/admin')
    });
});

router.get('/logout', (req, res)=>{    //Recibiendo los datos enviados desde el logout por POST
    logged = false;                     //Si todo bien, es true y redirecciona a la página del admin
    res.redirect('/')
})


module.exports = router;
