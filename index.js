const express = require('express')
const app = express()
const mongoose = require('mongoose')
const morgan = require('morgan')
const bodyPaser = require('body-parser')
const session = require('express-session')
const {url} = require('./config/database')
const User = require('./models/user')
//const User = require('./models/user')
// Settings
app.set('port',process.emit.PORT||8080)
app.use((req, res, next) => {
    //en vez de * se puede definir SÓLO los orígenes que permitimos
    res.header('Access-Control-Allow-Origin', '*');
    //metodos http permitidos para CORS
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();

})
//Middlewares
app.use(morgan("dev"));
app.use(bodyPaser.urlencoded({ extended: false }));
app.use(bodyPaser.json());
app.use(session({
    secret:'revanisabeljz6',
    resave:false,
    saveUninitialized:false
}))

// Routes
//Ruta Para Informacion Del Servidor
app.get('/',(req,res)=>{
    res.send({server:[{
        servername:"Isabel 2",
        Version:"1.0.3"
    }]})
})
//Rutas Para Testeo
app.post('/users/test',(req,res)=>{
    
    var user = new User({
        email: req.body.email,
        username: req.body.username,
        nombre: req.body.nombre
    })
    user.password =  user.hash(req.body.password),
    user.hash(req.body.password)
    res.send({ message: user,msg:"Hola" })

})
app.get('/users/test',(req,res)=>{
    User.find({},(err,user)=>{
        res.send(user)
    })

})
//Metodo que solo se usa para testeo
/*app.delete('/eliminar',(req,res)=>{
    User.remove(err=>{
        if(err) return res.send('Error al eliminar')
        res.status(200).send('eliminado ')
    })
})*/
app.delete('/users/test/:id',(req,res)=>{
    let userID = req.params.id
    User.findById(userID,(err,userStored)=>{
        if(err) return res.status(500).send({message:`Error al eliminar el usuario ${err} `})
        userStored.remove(err=>{
            if(err) return res.status(500).send({message:`Errrore al eliminar al usuario ${err}`})
            res.status(200).send({message:`Èliminado`})
        })
    })
   
})
//Rutas Para Uso De La App
app.post('/singin',(req,res)=>{
    let password = req.body.password
     let us = new User()
    User.findOne({email:req.body.email},(err,user)=>{
        if(err) return res.status(500).send({message:err,status:false})
        if(!user) return res.status(404).send({message:`El ususario no existe`,status:false})
        if (!user.hash(req.body.password)) return res.status(404).send({message: `La contraseña no coincide`,status: false });
        req.user = user
        res.status(200).send({ username: user.username,_id:user._id})

    })
})
app.post('/data/',(req,res)=>{
    let Username = req.body.username;
    let body = { 
        pulso: req.body.pulso,
        respirasion:req.body.respirasion,
        presion:req.body.precion 
    }
    User.update({ 'username': Username },{ $push: { ecg: body } },
      (err, user) => {
        if (err) return res.status(500).send({ message: `Error al insertar datos ${err}` });
          if (user["nModified"]===0) return res.status(500).send({message:`Èrror al guardar los datos`})
        res.status(200).send({ message: `Data insertada correctammente` });
        
      }
    );
    
})
app.get('/data/:username',(req,res)=>{
    let Username = req.params.username
    User.findOne({'username':Username},(err,user)=>{
        if(err) return res.status(500).send({message:`error al consegir los datos del ususario ${err}`})
        if(!user) return res.status(404).send({message:`No se encontro al ususario`})
        res.status(200).send({ecg:user['ecg']})
    }) 
})
app.delete('/data/:id',(req,res)=>{
    let idata=req.params.id
    let Username = req.body.username
    User.update({ 'username': Username},{$pull:{ ecg : {_id:idata}}},(err,user)=>{
        if(err) return  res.status(500).send({message:`Error al eliminar la informacion`})
        if(user["nModified"]===0) return res.status(500).send({message:`Error al eliminar la informacion`})
        res.status(200).send({message:`informacion eliminada`})
    })
})
app.post('/user',(req,res)=>{
    console.log(req.body)
    var user = new User({
        email:req.body.email,
        username:req.body.username,
        nombre:req.body.nombre,
        password: req.body.password,

    })

    console.log(user)
    user.save((err,us)=>{
        if(err) return res.status(500).send({message:{msg:`Error al registrar el ususarios ${err}`,status:false}})
        res.status(200).send({user:us})
    })
})

//Conexion
mongoose.connect(url, (err, res) => {
    if(err) return console.log('Error al conectarse ala base de datos')
    console.log("Conexion exitosa a la base de dayos")

    app.listen(app.get('port'), () => {
        console.log('Server on port', app.get('port'))
    })

})
