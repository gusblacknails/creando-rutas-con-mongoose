const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

mongoose.Promise = Promise

const app = express()

const urlDB = 'mongodb://localhost:27017/test'
const PORT = 3000

const Restaurant = require('./models/Restaurant')

mongoose.connect(urlDB)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//middleware, se pone al principio ya que todo pasará através de él
app.use((req, res, next) => {

    const { show, hide, page = 1, limit = 20 } = req.query
    let projection = {}

    if (show) {
        const fieldsToShow = show.split(',')
        fieldsToShow.forEach(field => projection[field] = 1)
    }

    if (hide) {
        const fieldsToShow = hide.split(',')
        fieldsToShow.forEach(field => projection[field] = 0)
    }

    //para que al siguiente le llegue la info del req tendremos que hacer lo siguiente
    req.projection = projection
    req.limit = +limit
    req.skip = limit * (page - 1)

    next()

})


// /restaurants?show=name,cuisine&hide=_id
app.get('/restaurants', (req, res) => {

    const { show } = req.query
    const { hide } = req.query
    const { projection } = req
    //const { show,hide } = req.query (también se podría hacer así)

    //si no estuvieramos utilizando middleware tendriamos que añadir las líneas de debajo
    //  let projection = {}
    // if (show) { // "_id,name,cuisine"
    //    const fieldsToShow = show.split(',') // ["_id","name","cuisine"]
    //    fieldsToShow.forEach( field => projection[field] = 1 )
    //  }
    //  if (hide) {
    //    const fieldsToShow = hide.split(',')
    //    fieldsToShow.forEach( field => projection[field] = 0 )
    //  }


    //utilizamos el modelo Restaurant
    Restaurant
        .find(null, projection)
        .limit(20)
        .then(restaurants => {
            res.json(restaurants)
        })

})

// /restaurants/borough/:borough
app.get('/restaurants/borough/:borough', (req, res) => {

    // en este caso utilizamos re.params ya que :borough es la query que añadimos al navegador
    const { borough } = req.params


    Restaurant
        .find({ borough })
        .limit(1)
        .then(restaurants => {
            res.json(restaurants)
        })

})

// // /restaurants?limit=5
// app.get('/restaurants', (req,res) => {

//   const { limit } = req.query
//   console.log(limit)

//   Restaurant
//     .find()
//     .limit(+limit)
//     .then( restaurants => {
//       res.json(restaurants)
//     })

// })

// /restaurants?limit=5&page=2


// app.get('/restaurants', (req,res) => {

//   const { limit } = req.query
//   const { page } = req.query
//   const skip = limit *(page-1)
//   console.log(limit)

//   Restaurant
//     .findById()
//     .limit(limit)
//     .skip(skip)
//     .then( restaurants => {
//       res.json(restaurants)
//     })

// })

// /restaurants/:id

app.get('/restaurants/:id', (req, res) => {

    const { id } = req.params
    console.log(id)
    Restaurant
        .findById(id)
        .then(restaurants => {
            res.json(restaurants)
        })

})







// app.post('/restaurants', (req,res) => {
//   const { name } = req.body
//   const restaurant = new Restaurant({ name })

//   restaurant.save()
//     .then( msg => console.log(msg) )
//     .catch( err => console.log(err) )
// })

app.listen(PORT)
console.log(`Listening on PORT ${PORT}`);
