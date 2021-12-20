const express = require('express');
var bodyParser = require("body-parser");



const app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))
var cors = require('cors') ;
app.use(cors()) ;


const port = 3002;
//const host = '192.168.1.42'; 
const host = '51.254.206.78';
// use Router
app.use(require('./router'));

app.listen(port, host,  () => {
  console.log(`Example app listening at http://${host}:${port}`);
});