var express = require("express");
var router = express.Router();
var Department_Status = require("../models/Department_Status");
router.post("/Save_Department_Status/", function (req, res, next) {
  console.log("Save_Department_Status: ", req.body);

  try {
    Department_Status.Save_Department_Status(req.body, function (err, rows) {
      if (err) {
        res.json(err);
      } else {
        res.json(rows);
      }
    });
  } catch (e) {
  } finally {
  }
});

router.get(
  "/Search_Department_Status/:Department_Status_Name_?",
  function (req, res, next) {
    console.log(
      "Department_Status_Name_: ",
      req.params.Department_Status_Name_
    );

    try {
      console.log(
        "Department_Status_Name_: ",
        req.params.Department_Status_Name_
      );
      Department_Status.Search_Department_Status(
        req.params.Department_Status_Name_,
        function (err, rows) {
          if (err) {
            res.json(err);
          } else {
            res.json(rows);
          }
        }
      );
    } catch (e) {
    } finally {
    }
  }
);
router.get(
  "/Get_Department_Status/:Department_Status_Id_?",
  function (req, res, next) {
    try {
      Department_Status.Get_Department_Status(
        req.params.Department_Status_Id_,
        function (err, rows) {
          if (err) {
            res.json(err);
          } else {
            res.json(rows);
          }
        }
      );
    } catch (e) {
    } finally {
    }
  }
);
router.get(
  "/Delete_Department_Status/:Department_Status_Id_?",
  function (req, res, next) {
    try {
      Department_Status.Delete_Department_Status(
        req.params.Department_Status_Id_,
        function (err, rows) {
          if (err) {
            res.json(err);
          } else {
            res.json(rows);
          }
        }
      );
    } catch (e) {
    } finally {
    }
  }
);

// router.get('/Get_Menu_Status/:Menu_Id_?/:Login_User_?',function(req,res,next)
//   {
//   try
//   {

//     Department_Status.Get_Menu_Status(req.params.Menu_Id_,req.params.Login_User_, function (err, rows)
//   {
//   if (err)
//   {
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

router.get(
  "/Get_Sub_Status/:Department_Status_Id_?",
  function (req, res, next) {
    try {
      Department_Status.Get_Sub_Status(
        req.params.Department_Status_Id_,
        function (err, rows) {
          if (err) {
            res.json(err);
          } else {
            res.json(rows);
          }
        }
      );
    } catch (e) {
    } finally {
    }
  }
);

router.post("/Save_Sub_Status/", function (req, res, next) {
  try {
    Department_Status.Save_Sub_Status(req.body, function (err, rows) {
      if (err) {
        res.json(err);
      } else {
        console.log(rows);
        res.json(rows);
      }
    });
  } catch (e) {
  } finally {
  }
});

router.get("/Delete_Sub_Status/:Sub_Status_Id_?", function (req, res, next) {
  try {
    Department_Status.Delete_Sub_Status(
      req.params.Sub_Status_Id_,
      function (err, rows) {
        if (err) {
          res.json(err);
        } else {
          res.json(rows);
        }
      }
    );
  } catch (e) {
  } finally {
  }
});

router.get("/Get_Email_Template_List", function (req, res, next) {
  try {
    Department_Status.Get_Email_Template_List(function (err, rows) {
      if (err) {
        res.json(err);
      } else {
        res.json(rows);
      }
    });
  } catch (e) {
  } finally {
  }
});

module.exports = router;
