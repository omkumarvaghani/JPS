var express = require('express');
var router = express.Router();
var Uni = require("../model/univercity") 
var Faculty = require("../model/faculty") 
var Course = require("../model/course") 


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
