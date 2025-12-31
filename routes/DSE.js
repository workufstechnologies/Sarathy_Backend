var express = require('express');
var router = express.Router();
var DSE = require('../models/DSE');

router.post('/Save_DSE/', function (req, res, next) {
  try {
    console.log(req.body);
    DSE.Save_DSE(req.body, function (err, rows) {
      if (err) {
        console.log("err", err);
        res.json(err);
      }
      else {
        console.log(rows);
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

router.get('/Search_DSE/:DSE_Name_?/:Branch_Id_?/:Department_Id_?', function (req, res, next) {
  try {
    DSE.Search_DSE(req.params.DSE_Name_, req.params.Branch_Id_, req.params.Department_Id_, function (err, rows) {
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

router.get('/Load_DefaultDSE/', function (req, res, next) {
  try {
    DSE.Load_DefaultDSE(function (err, rows) {
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

router.get('/Search_DSE_Typeahead/:DSE_Name_?', function (req, res, next) {
  try {
    DSE.Search_DSE_Typeahead(req.params.DSE_Name_, function (err, rows) {
      if (err) {
        console.log(err);
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

router.get('/Search_campaign_master_Typeahead/:Campaign_Master_Name_?', function (req, res, next) {
  try {
    DSE.Search_campaign_master_Typeahead(req.params.Campaign_Master_Name_, function (err, rows) {
      if (err) {
        console.log(err);
        res.json(err);
      }
      else {
        console.log(rows);
        res.json(rows);
      }
    });
  }
  catch (e) {
    console.log(e);
  }
  finally {
  }
});

router.get("/Get_DSE/:DSE_Id_?", async (req, res, next) => {
  try {
    const result = await DSE.Get_DSE(req.params.DSE_Id_);
    res.json(result);
  } catch (e) {
    res.send(e);
  } finally {
  }
});

router.get('/Get_DSE_Department_Edit/:DSE_Id_?', function (req, res, next) {
  try {
    DSE.Get_DSE_Department_Edit(req.params.DSE_Id_, function (err, rows) {
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

router.get('/Delete_DSE/:DSE_Id_?', function (req, res, next) {
  try {
    DSE.Delete_DSE(req.params.DSE_Id_, function (err, rows) {
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

router.get('/Search_Company/', function (req, res, next) {
  try {
    DSE.Search_Company(function (err, rows) {
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