const express = require('express');
const router = express.Router();

/**
 * GET home page.
 * 접속 테스트 및 현재 접속자 목록 보기
 */
router.get('/', function (req, res, next) {
  res.render('index');
});

module.exports = router;
