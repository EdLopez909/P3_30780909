const express = require('express');
const router = express.Router();
const db = require('../../db/models');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

rutaProtegida = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            const tokenAuthorized = await promisify(jwt.verify)(req.cookies.jwt, 'token');
            if (tokenAuthorized) {
                return next();
            }
            req.user = data.id;
        } catch (error) {
            console.log(error);
            return next();
        }
    } else {
        res.redirect("/loginclient");
    }
};



rutaLoginBlock = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            const tokenAuthorized = await promisify(jwt.verify)(req.cookies.jwt, 'token');
            if (tokenAuthorized) {
                res.redirect("/");
            }
        } catch (error) {
            console.log(error);
            res.redirect("/");
        }
    } else {
        return next();
    }
};





router.get('/', (req, res) => {
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

router.post('/filter',(req,res) => {
    const { name } = req.body;
    db.filterProduct(name).then(data => {
        db.getCategories().then(categories => {
            res.render('home/index', { products: data, images: data, categories:categories})
        })
    })
})




router.get('/carrito/:id', (req, res) => {
    const id = req.params.id;
    console.log(id)
    db.getProductID(id)
        .then(data => {
            db.getImagesID(id)
                .then(images => {
                    db.getCategories()
                        .then(categories => {
                            res.render('home/carrito', { product: data, images: images, categories: categories });
                        })
                        .catch(err => {
                            console.log(err);
                            res.render('home/carrito', { product: data, images: images, categories: [] });
                        })
                })
                .catch(err => {
                    console.log(err);
                    res.render('home/carrito', { product: data, images: [], categories: [] });
                })
        })
        .catch(err => {
            console.log(err);
            res.render('home/carrito', { product: [], images: [], categories: [] });
        })

})

router.get('/carrito/buy/:id', rutaProtegida, (req, res) => {
    const id = req.params.id;
    console.log(id)
    db.getProductID(id)
        .then(data => {
            db.getImagesID(id)
                .then(images => {
                    db.getCategories()
                        .then(categories => {
                            res.render('home/purchase', { product: data, images: images, categories: categories });
                        })
                        .catch(err => {
                            console.log(err);
                            res.render('home/purchase', { product: data, images: images, categories: [] });
                        })
                })
                .catch(err => {
                    console.log(err);
                    res.render('home/purchase', { product: data, images: [], categories: [] });
                })
        })
        .catch(err => {
            console.log(err);
            res.render('home/purchase', { product: [], images: [], categories: [] });
        })
})


router.post('/pay/:id', async (req, res) => {
    const { id } = req.params;
    const { tarjeta, cvv, mes, ano, precio, cantidad } = req.body;
    console.log('req.body')
    const total_pagado = precio * cantidad;
    const fecha = new Date();
    const fechaC = fecha.toString();
    const ipPaymentClient = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
    try {
        const response = await fetch('https://fakepayment.onrender.com/payments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UiLCJkYXRlIjoiMjAyNC0wMS0xM1QwNzoyMzozNC42ODNaIiwiaWF0IjoxNzA1MTMwNjE0fQ.iDAk-6xC9ForjFuGCQtSZ0L9J-HicwBsyqwoS8RTJoE`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: total,
                "card-number": tarjeta,
                cvv: cvv,
                "expiration-month": mes,
                "expiration-year": ano,
                "full-name": "APPROVED",
                currency: "USD",
                description: "Transsaction Successfull",
                reference: "payment_id:99"
            })
        });
        const jsonData = await response.json();
        if (jsonData.success == true) {
            const token = await promisify(jwt.verify)(req.cookies.jwt, 'token');
            const cliente_id = token.id;
            db.purchaseProduct(cliente_id,id,cantidad,total_pagado,fechaC,ipPaymentClient)
            .then(() => {
                res.redirect('/')
            })
        }
    } catch (error) {
        console.log(error)
    }
})


router.post('/loginclient', (req, res) => {
    const { email, password } = req.body;
    db.getLogin(email, password)
        .then(data => {
            if (data) {
                const id = data.id;
                const token = jwt.sign({ id: id }, 'token');
                res.cookie("jwt", token);
                res.redirect('/');
            }
            else {
                console.log('Datos incorrectos');
                res.redirect('/loginclient')
            }
        })
})




router.get('/registerclient', (req, res) => {
    res.render('home/registerclient');
})


router.post('/registerclient', async (req, res) => {
    const { user, email, password } = req.body;
    const secretKey = '6LeDoU0pAAAAAIBcBUhaf8sIyoF2RJojZ-blAmTI';
    const gRecaptchaResponse = req.body['g-recaptcha-response'];
    const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${gRecaptchaResponse}`, {
        method: 'POST',
    });
    const captchaGoogle = await response.json();
    if (captchaGoogle.success == true) {
        db.getEmailExists(email)
            .then((data) => {
                if (data) {
                    console.log(data);
                }
                else {
                    db.registerLogin(user, email, password)
                        .then(register => {
                            console.log(`Usuario ${user} agregado`)
                            res.redirect('/loginclient')
                        })
                        .catch(err => {
                            console.log(err);
                        })
                }
            })
    }
})

router.get('/loginclient', (req, res) => {
    res.render('home/loginclient')
})
router.get('/about', (req, res) => {
    res.render('home/about');
});

router.get('/blog', (req, res) => {
    res.render('home/blog');
});

router.get('/blog-single', (req, res) => {
    res.render('home/blog-single');
});

router.get('/contact', (req, res) => {
    res.render('home/contact');
});






router.get('/songs', (req, res) => {
    res.render('home/songs');
});

module.exports = router;
