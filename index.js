let express = require('express')
require('dotenv').config()
let mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
let geocodingClient = mbxGeocoding({ accessToken: process.env.accessToken })
let ejsLayouts = require('express-ejs-layouts')
let methodOverride = require('method-override')
let db = require('./models')

let app = express()

//middleware
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(methodOverride('_method'))
app.use(ejsLayouts)

//controllers
app.use('/api', require('./controllers/api'))

 // render city-search view
app.get('/', (req, res) => {
    res.render('citySearch')
})



// use forward geocoding to search for cities
//render the search results page
app.post('/search', (req, res) => {
    //TODO:
    // set query to use city/state info
    let city = req.body.city
    let state = req.body.state
    let query = `${city}, ${state}`

    geocodingClient.forwardGeocode({ query })
    .send()
    .then(response => {
            // TODO: send ALL city listings, not just the first
            // AND update the searchResults.ejs to match
        let match = response.body.features[0]
        console.log(match)
        let lat = match.center[1]
        let long = match.center[0]
        let splitPlace_name = match.place_name.split(',')
        let city = splitPlace_name[0]
        let state = splitPlace_name[1]

        res.render('searchResults', {
            lat,
            long,
            city,
            state
        })
    })
    .catch(err => {
        if(err) console.group(err)
        res.send("An error happened while navigating to favorites page")
    })
})

//add the selecetd city to our favorites
app.post('/favorites', (req, res) => {
    db.place.create(req.body)
    .then(() => {
        res.redirect('/favorites')
    })
    .catch(err => {
        if(err) console.group(err)
        res.send("An error happened while creating a favorite")
    })
})

// pull all fave cities and pass them into view
app.get('/favorites', (req, res) => {
    db.place.findAll()
    .then(places =>{
        res.render('favorites/index', {
            places
        })
    })
    .catch(err => {
        if(err) console.group(err)
        res.send("An error happened while accessing the favorites page")
    })
})

//delete a city and redirect to faves
app.delete('/favorites/:id', (req, res) => {
    db.place.destroy({
        where: { id: req.params.id }
    })
    .then(() => {
        res.redirect('/favorites')
    })
    .catch(err => {
        if(err) console.group(err)
        res.send("An error happened while deleting a favorite")
    })
})


// app.get('/api/favorites', (req, res) => {
//     res.json({
//         key1: "joebob",
//         key2: "example"
//     })
// })

app.listen(3006, ()=> {
console.log("listening on Port 3006")
})

