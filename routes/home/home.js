const express = require('express');
const router = express.Router();
const db = require('../../db/models');

router.get('/', (req, res)=> {
  db.getProducts()
    .then(data => {
        db.getImages()
        .then(images => {
            db.getCategories()
            .then(categories => {
                res.render('home/index', { products: data, images: images, categories: categories });
            })
            .catch(err => {
                console.log(err);
                res.render('home/index', { products: data, images: images, categories: [] });
            })
        })
        .catch(err => {
            console.log(err);
            res.render('home/index', { products: data, images: [], categories: [] });
        })
    })
    .catch(err => {
        console.log(err);        
        res.render('home/index', { products: [], images: [], categories: [] });
    })
});

router.get('/about', (req, res)=> {
  res.render('home/about');
});

router.get('/blog', (req, res)=> {
  res.render('home/blog');
});

router.get('/blog-single', (req, res)=> {
  res.render('home/blog-single');
});

router.get('/contact', (req, res)=> {
  res.render('home/contact');
});

router.get('/songs', (req, res)=> {
  res.render('home/songs');
});

module.exports = router;
