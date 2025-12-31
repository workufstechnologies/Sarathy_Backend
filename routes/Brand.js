var express = require('express');
var router = express.Router();
var Brand = require('../models/Brand');
router.post('/Save_Brand/', async function (req, res, next) {
  try {
    const resp = await Brand.Save_Brand(req.body);
    return res.send(resp);
  }
  catch (e) {

    return res.send(e);
  }
});
router.get('/Search_Brand/:Brand_Name_?/:Channel_Id_?', function (req, res, next) {
  try {
    Brand.Search_Brand(req.params.Brand_Name_, req.params.Channel_Id_, function (err, rows) {
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
router.get('/Load_DefaultBrand/', function (req, res, next) {
  try {
    Brand.Load_DefaultBrand(function (err, rows) {
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
router.get('/Search_Brand_Typeahead/:Brand_Name_?', function (req, res, next) {
  try {
    Brand.Search_Brand_Typeahead(req.params.Brand_Name_, function (err, rows) {
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
    Brand.Search_campaign_master_Typeahead(req.params.Campaign_Master_Name_, function (err, rows) {
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



router.get("/Get_Brand/:Brand_Id_?", async (req, res, next) => {
  try {
    const result = await Brand.Get_Brand(req.params.Brand_Id_);
    res.json(result);
  } catch (e) {
    res.send(e);
  } finally {
  }
});

router.get('/Get_Brand_Department_Edit/:Brand_Id_?', function (req, res, next) {
  try {
    Brand.Get_Brand_Department_Edit(req.params.Brand_Id_, function (err, rows) {
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
router.get('/Delete_Brand/:Brand_Id_?', function (req, res, next) {
  try {
    Brand.Delete_Brand(req.params.Brand_Id_, function (err, rows) {
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
    Brand.Search_Company(function (err, rows) {
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

