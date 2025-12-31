var express = require("express");
var router = express.Router();
var Course = require("../models/Course");
router.post("/Save_Course/", function (req, res, next) {
  try {
    Course.Save_Course(req.body, function (err, rows) {
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

router.post("/Save_Course_Import/", function (req, res) {
  try {
    Course.Save_Course_Import(req.body, function (err, rows) {
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

router.get("/Search_Courses_Typeahead_tempp/", function (req, res, next) {
  try {
    console.log("req.query.University_Id: ", req.query.University_Id);
    console.log("req.query.Course_Name: ", req.query.Course_Name);
    Course.Search_Courses_Typeahead_tempp(
      req.query.Course_Name,
      req.query.University_Id,

      function (err, rows) {
        if (err) {
          console.log(err);
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

router.get(
  "/Search_Course_Import/:From_Date_?/:To_Date_?/:Is_Date_Check_?/",
  function (req, res, next) {
    try {
      Course.Search_Course_Import(
        req.query.From_Date_,
        req.query.To_Date_,
        req.query.Is_Date_Check_,
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

router.get("/Search_Course/", function (req, res, next) {
  try {
    Course.Search_Course(
      req.query.Course_Name_,
      req.query.Level_Id_,
      req.query.Country_Id_,
      req.query.Internship_Id_,
      req.query.Duration_Id_,
      req.query.University_Id_,
      req.query.Subject_Id_,
      req.query.Sub_Section_Id_,
      req.query.search_Itnake_Id_,
      req.query.Pointer_Start_,
      req.query.Pointer_Stop_,
      req.query.Page_Length_,
      function (err, rows) {
        if (err) {
          res.json(err);
        } else {
          //
          res.json(rows);
        }
      }
    );
  } catch (e) {
  } finally {
  }
});

router.get("/Get_Course/:Course_Id_?", function (req, res, next) {
  try {
    Course.Get_Course(req.params.Course_Id_, function (err, rows) {
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

router.get("/Get_Course_Import/:Import_Master_Id_?", function (req, res, next) {
  try {
    Course.Get_Course_Import(
      req.params.Import_Master_Id_,
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

router.get("/Delete_Course/:Course_Id_?", function (req, res, next) {
  try {
    Course.Delete_Course(req.params.Course_Id_, function (err, rows) {
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
  "/Search_Course_Typeahead/:Country_Id_?/:Subject_Id_?/:Sub_Section_Id_?/:Level_Id_?/:Course_Name_?/:Duration_Id_?/:Ielts_Minimum_Score_?/:Intake_Id_?/:Internship_Id_?/",
  function (req, res, next) {
    try {
      Course.Search_Course_Typeahead(
        req.query.Country_Id_,
        req.query.Subject_Id_,
        req.query.Sub_Section_Id_,
        req.query.Level_Id_,
        req.query.Course_Name_,
        req.query.Duration_Id_,
        req.query.Ielts_Minimum_Score_,
        req.query.Intake_Id_,
        req.query.Internship_Id_,
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

//  router.get('/Get_Menu_Status/:Menu_Id_?/:Login_User_?',function(req,res,next)
//  {
//  try
//  {
//   Course.Get_Menu_Status(req.params.Menu_Id_,req.params.Login_User_, function (err, rows)
//  {
//  if (err)
//  {
//  res.json(err);
//  }
//  else
//  {
//  res.json(rows);
//  }
//  });
//  }
//  catch (e)
//  {

//  }
//  finally
//  {
//  }
//  });

router.get("/Search_Courses_Typeahead/", function (req, res, next) {
  try {
    Course.Search_Courses_Typeahead(
      req.query.Course_Name,
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

router.get("/Search_Courses_Typeahead_By_User/", function (req, res, next) {
  try {
    Course.Search_Courses_Typeahead_By_User(
      req.query.Course_Name,
      req.query.Login_User,
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

router.get("/Search_Courses_Fees_Typeahead/", function (req, res, next) {
  try {
    Course.Search_Courses_Fees_Typeahead(
      req.query.Course_Name,
      req.query.Student_Id,
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

module.exports = router;
