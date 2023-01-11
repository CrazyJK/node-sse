const express = require('express');
const router = express.Router();

/** 
 * GET users listing. 
 */
router.get('/', function (req, res, next) {
  const keys = [];
  global.userMap.forEach((val, key) => keys.push(key));
  res.json(keys);
});

module.exports = router;
