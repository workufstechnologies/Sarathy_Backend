var express = require('express');
var router = express.Router();
var Location = require('../models/Location');
router.post('/Save_Location/', function (req, res, next) {
  try {
    Location.Save_Location(req.body, function (err, rows) {
      if (err) {
        console.log("err", err);

        res.json(err);

      }
      else {
        res.json(rows);
      }
    });
  }
  catch (e) {
    console.log("e", e);


  }
  finally {
  }
});

router.get('/Search_Location/:Location_Name_?/:Branch_Id_?/:Department_Id_?', function (req, res, next) {
  try {
    Location.Search_Location(req.params.Location_Name_, req.params.Branch_Id_, req.params.Department_Id_, function (err, rows) {
      if (err) {
        res.json(err);
      }
      else {
        res.json(rows);
      }
    });
  }
  catch (e) {
  }
  finally {
  }
});


router.get('/Load_Branch/', function (req, res, next) {
  try {
    Location.Load_Branch(function (err, rows) {
      if (err) {
        res.json(err);
      }
      else {
        res.json(rows);
      }
    });
  }
  catch (e) {
  }
  finally {
  }
});

router.get('/Load_Department/', function (req, res, next) {
  try {
    Location.Load_Department(function (err, rows) {
      if (err) {
        res.json(err);
      }
      else {
        res.json(rows);
      }
    });
  }
  catch (e) {
  }
  finally {
  }
});


router.get('/Delete_Location/:Location_Id_?', function (req, res, next) {
  try {
    Location.Delete_Location(req.params.Location_Id_, function (err, rows) {
      if (err) {
        res.json(err);
      }
      else {
        res.json(rows);
      }
    });
  }
  catch (e) {
  }
  finally {
  }
});

module.exports = router;

