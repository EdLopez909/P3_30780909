const express = require('express');
const router = express.Router();

router.get('/', (req, res)=> {
  res.render('login');
});

router.post('/', (req, res) =>{                                    //Recibiendo los datos enviados desde el login por POST
  console.log("LOGIN")
    const {email, password} = req.body;                                      //Capturando el email y el password
    console.log(req.body)
    if(email == process.env.__ADMIN && password == process.env.__PASS){       //Validando
        logged = true;                                          //Si todo bien, es true y redirecciona a la página del admin
        console.log("1")
        res.redirect('/admin')
    }
    else if(email == "a@a.com" && password == "1234"){
        logged = true;
        console.log("2")                                          //Si todo bien, es true y redirecciona a la página del admin
        res.redirect('/')
    }else{
        logged = false;                                         //Si no, redirecciona pero en false
        console.log("3")
        res.redirect('/login')
    }
    console.log("4")
});

module.exports = router;
