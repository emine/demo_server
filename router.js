/**
 * Created by ej on 2/23/18.
 */
var express = require('express')
    , router = express.Router();
const multer = require('multer');    
    
var service = require('./service.js');
var validator = require("email-validator");

var upload = multer({ dest: 'public/images/' })
// const util = require("util") ; 


// routes
// temporay
router.get('/', (req, res) => {
  res.send('Hello World!')
})

// register 
router.post('/register', async (req, res) => {
    try {
        let data = await service.register(req.body) ;
        console.log(data) ;
        res.json(data);
    } catch(err) {
        console.log(err) ;
        res.json({'success': false, 'error' : err.message});
    }    
})

// register 
router.post('/login', async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    console.log(req.body) ;
    try {
        const data = await service.login(req.body) ;
        console.log(data) ;
        res.json(data);
    } catch (err) {    
        console.log(err) ;
        res.json({'success': false, 'error' : err.message});
    }
})

router.post('/unregister', async (req, res) => {
    try {
        await service.unregister(req.body) ;
        res.json({'success': true});
    } catch(err) {
        console.log(err) ;
        res.json({'success': false, 'error' : err.message});
    }
})    

// get events 
router.post('/events', async (req, res) => {
    console.log('id ' + req.body.id) ;
    try {
        const data = await service.events(req.body.id) ;
        console.log(data) ;
        res.json(data);
    } catch (err) {    
        console.log(err) ;
        res.json({'success': false, 'error' : err.message});
    }
})

// get friend events 
router.post('/friend_events', async (req, res) => {
    console.log('Yo: id ' + req.body.id) ;
    try {
        const data = await service.friend_events(req.body.id) ;
        console.log('cp 2') ;
        console.log(data) ;
        res.json(data);
    } catch (err) {    
        console.log('cp 1') ;
        console.log(err) ;
        res.json({'success': false, 'error' : err.message});
    }
})

// get pictures
router.post('/pictures', async (req, res) => {
    try {
        const data = await service.pictures(req.body.id) ;
        console.log(data) ;
        res.json(data);
    } catch (err) {    
        console.log(err) ;
        res.json({'success': false, 'error' : err.message});
    }
})




router.post('/upload', upload.single('photo'), async (req, res) => {
    try {
        // req.file is the `photo` file
        // req.body will hold the text fields, if there were any
        console.log(req.file) ;
        console.log(req.body) ;
        console.log(req.protocol + '://' + req.get('host') ) ;
        //var url = req.protocol + '://' + req.get('host') + '/images/' + req.file.filename ; 
        await service.addPicture(req.body.id, req.file.filename) ;
        console.log(data) ;
        res.json(data);
    } catch (err) {    
        console.log(err) ;
        res.json({'success': false, 'error' : err.message});
    }
  
})

router.post('/addEvent', async (req, res) => {
    try {
        const data = await service.addEvent(req.body.id_user, req.body.name) ;
        console.log(data) ;
        res.json(data);
    } catch (err) {    
        console.log(err) ;
        res.json({'success': false, 'error' : err.message});
    }
  
})


router.post('/friends', async (req, res) => {
    try {
        const data = await service.friends(req.body.id) ;
        console.log(data) ;
        res.json(data);
    } catch (err) {    
        console.log(err) ;
        res.json({'success': false, 'error' : err.message});
    }
})


router.post('/updateFriend', async (req, res) => {
    try {
        const data = await service.updateFriend(req.body.reference_user, req.body.id, req.body.isFriend) ;
        console.log(data) ;
        res.json(data);
    } catch (err) {    
        console.log(err) ;
        res.json({'success': false, 'error' : err.message});
    }
})


// delete event (when empty)
router.post('/deleteEvent', async (req, res) => {
    console.log('deleteEvent invoked') ;
    try {
        await service.deleteEvent(req.body.id) ;
        console.log({'success': true}) ;
        res.json({'success': true});
    } catch (err) {    
        console.log(err) ;
        res.json({'success': false, 'error' : err.message});
    }
})



module.exports = router ;