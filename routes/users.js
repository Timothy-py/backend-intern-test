var express = require('express');
var router = express.Router();

// import controller
const userController = require('../controllers/userController');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post("/signup", userController.signup);

module.exports = router;
