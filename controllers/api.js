let router = require('express').Router()
require('dotenv').config()
let mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
let geocodingClient = mbxGeocoding({ accessToken: process.env.accessToken })
let db = require('../models')



//show all faves in api/favorites
router.get('/favorites', (req, res) => {
    db.place.findAll()
    .then(places => {
        res.json(places)
    })
    .catch(err => {
        console.log(err)
        res.json({ err: err.message})
    })
})

router.get('/favorites/:id', (req, res) => {
    db.place.findOne({
        where: {id: req.params.id }
})
.then(places => {
    res.json(places)
})
.catch(err => {
    console.log(err)
    res.json({ err: err.message})
})
})

router.post('favorites', (req, res) => {
    db.place.create(req.body)
    .then(() => {
        res.redirect('/favorites')
    })
    .catch(err => {
        if(err) console.group(err)
        res.json({ err: err.message})
    })
})
router.put('/favorites/:id', (req, res) => {
        db.place.findOne({
            where: {
                id: req.params.id
            }
        })
        .then(places => {
            if (places) {
                places.update(req.params.id)
                res.redirect("/favorites");
            } 
        })
    
})
router.delete('/favorites', (req, res) => {
    db.place.destroy({
        where: { id: req.params.id }
    })
    .then(() => {
        res.redirect('/favorites')
    })
    .catch(err => {
        if(err) console.group(err)
        res.json({ err: err.message})
    })
})




module.exports = router