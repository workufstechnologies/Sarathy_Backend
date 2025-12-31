var express = require('express');
var router = express.Router();
var Enquiry_For = require('../models/Enquiry_For');
router.post('/Save_Enquiry_For/', function (req, res, next) {
  try {
    Enquiry_For.Save_Enquiry_For(req.body, function (err, rows) {
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
router.get('/Search_Enquiry_For/', function (req, res, next) {
  try {
    Enquiry_For.Search_Enquiry_For(req.query.Enquirfor_Name, function (err, rows) {
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

router.get('/Search_Supplier_Name/', function (req, res, next) {
  try {
    Enquiry_For.Search_Supplier_Name(req.query.Supplier_Name, function (err, rows) {
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
router.get('/Get_Enquiry_For/:Enquiry_For_Id_?', function (req, res, next) {
  try {
    Enquiry_For.Get_Enquiry_For(req.params.Enquiry_For_Id_, function (err, rows) {
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
router.get('/Delete_Enquiry_For/:Enquiry_For_Id_?', function (req, res, next) {
  try {
    Enquiry_For.Delete_Enquiry_For(req.params.Enquiry_For_Id_, function (err, rows) {
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


// router.get('/Get_Menu_Status/:Menu_Id_?/:Login_User_?',function(req,res,next)
//   { 
//   try 
//   {
//     Enquiry_For.Get_Menu_Status(req.params.Menu_Id_,req.params.Login_User_, function (err, rows)
//   {
//   if (err) 
//   {
;
//   res.json(err);
//   }
//   else 
//   {
//   res.json(rows);
//   }
//   });
//   }
//   catch (e) 
//   {

//   }
//   finally 
//   {
//   }
//   });

module.exports = router;

