var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  const keys = [];
  global.usersStreams.forEach((val, key) => keys.push(key));
  res.json(keys);
});

module.exports = router;
