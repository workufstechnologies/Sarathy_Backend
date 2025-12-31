var express = require("express");
var router = express.Router();

var University = require("../models/University");
const upload = require("../helpers/multer-helper");

router.post("/Save_University", (req, res) => {
  const universityData = {
    University_Id: req.body.University_Id,
    University_Name: req.body.University_Name,
    Country_Id: req.body.Country_Id,
    Country_Name: req.body.Country_Name,
    Initial_Deposit: req.body.Initial_Deposit,
    Campus_Location: req.body.Campus_Location,
    Living_Expense: req.body.Living_Expense,
    Description: req.body.Description,
    Part_Time_Availability: req.body.Part_Time_Availability,
  };

  console.log("Received University Data:", universityData);

  University.Save_University(universityData, (err, rows) => {
    if (err) {
      res.status(500).json(err);
    } else {
      res.json(rows);
    }
  });
});

router.get("/Search_University_Typeahead_Country/", function (req, res, next) {
  try {
    console.log(",req.query.Country_Id: ", req.query.Country_Id);
    University.Search_University_Typeahead_Country(
      req.query.University_Name,
      req.query.Country_Id,

      function (err, rows) {
        if (err) {
          console.log(err);
          res.json(err);
        } else {
          console.log(rows);
          res.json(rows);
        }
      }
    );
  } catch (e) {
    console.log(e);
  } finally {
  }
});

router.get("/Search_University_Typeahead/", function (req, res, next) {
  try {
    University.Search_University_Typeahead(
      req.query.University_Name,
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

router.get("/Search_University/", function (req, res, next) {
  try {
    University.Search_University(
      req.query.University_Name,
      req.query.Country_Id,
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
router.get("/Get_University/:University_Id_?", function (req, res, next) {
  try {
    University.Get_University(req.params.University_Id_, function (err, rows) {
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
router.get("/Delete_University/:University_Id_?", function (req, res, next) {
  try {
    University.Delete_University(
      req.params.University_Id_,
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
router.get("/University_Typeahead/", function (req, res, next) {
  try {
    University.University_Typeahead(
      req.query.University_Name,
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

router.get("/Get_University_Documents/", function (req, res, next) {
  try {
    University.Get_University_Documents(
      req.query.University_Id,
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



// router.post(
//   "/Save_University_Documents",
//   upload.array("Documents"), // Middleware to handle file uploads
//   (req, res, next) => {
//     console.log("Datas came from the client side", req.body);
//     try {
//       const files = req.files;

//       // Prepare the document data
//       const documentData = {
//         University_Id: req.body.University_Id,
//         Document_Name: req.body.Document_Name,
//         Documents: JSON.stringify(files.map((file) => file.filename)), // Convert uploaded files to JSON
//       };

//       console.log("These are the datas", documentData);

//       // Call the model method
//       University.Save_University_Documents(documentData, (err, rows) => {
//         if (err) {
//           res.json(err);
//         } else {
//           res.json(rows);
//         }
//       });
//     } catch (err) {
//       res
//         .status(500)
//         .json({ error: "An error occurred while saving document data." });
//     }
//   }
// );
// Fixed Router to properly extract FormData values
router.post(
  "/Save_University_Document",
  upload.array("myFile"), // middleware for file upload
  (req, res, next) => {
    try {
      console.log(req.body);

      const file = req.files;
      var Image;
      var Photo_ = [];

      if (!file) {
        // No files uploaded
      } else {
        for (var i = 0; i < req.body.Document_File_Array; i++) {
          if (i == req.body.DocumentFile) Image = file[i].filename;
        }
      }

      var Docs = {
        University_Document_Id: req.body.University_Document_Id,
        University_Id: req.body.University_Id,
        Image: Image,
        File_Name: req.body.File_Name,
        Description: req.body.Description,
        Document_Id: req.body.Document_Id,
        Document_Name: req.body.Document_Name,
      };

      console.log("University Document Data:", Docs);
      var jsondata1 = JSON.stringify(Docs);
      var Docs_Data = {
        Docs_D: jsondata1,
      };

      University.Save_University_Document(Docs_Data, function (err, rows) {
        if (err) {
          console.log("Error saving university document:", err);
          return res.status(500).json({ 
            success: false, 
            message: "Error saving university document",
            error: err.message 
          });
        } else {
          return res.json(rows);
        }
      });
    } catch (err) {
      console.error("Exception in Save_University_Document:", err);
      const error = new Error("Please upload a file");
      error.httpStatusCode = 400;
      return next(error);
    }
  }
);
// router.post('/Save_University', upload.array('myFile'), (req, res, next) => {
//   try {
//     const file = req.files
//     var Photo_=[];
//     if (!file) {
//       const error = new Error('Please upload a file')
//       error.httpStatusCode = 400
//     }
//     else
//     {
//       for(var i=0;i<file.length;i++)
//       {
//         Photo_.push({File_name:file[i].filename})
//       }
//     }
//     var Image_Detail=''
// if(Photo_.length>0)
// {
//   Image_Detail=Photo_[0].File_name;
// }
//     {
//       var Photo_json = JSON.stringify(Photo_)
//       var University_ =
//       {
//         "University_Id":req.body.University_Id,
//         "University_Name":req.body.University_Name,
//         "About":req.body.About,
//         "About1":req.body.About1,
//         "About2":req.body.About2,
//         "Location":req.body.Location,
//         "Address":req.body.Address,
//         "Founded_In":req.body.Founded_In,
//         "Institution_Type":req.body.Institution_Type,
//         "Cost_Of_Living":req.body.Cost_Of_Living,
//         "Tution_Fee":req.body.Tution_Fee,
//         "Application_Fee":req.body.Application_Fee,
//         "Type_Of_Accomodation":req.body.Type_Of_Accomodation,
//         "Contact_Number":req.body.Contact_Number,
//         "Email":req.body.Email,
//         "Web":req.body.Web,
//         "Fb":req.body.Fb,
//         "Linkedin":req.body.Linkedin,
//         "Twitter":req.body.Twitter,
//         "Googlemap":req.body.Googlemap,
//         "Status":req.body.Status,
//         "University_Id":req.body.University_Id,
//         "Sub_Heading1":req.body.Sub_Heading1,
//         "Sub_Heading2":req.body.Sub_Heading2,
//         "Sub_Heading3":req.body.Sub_Heading3,
//         "School_Rank":req.body.School_Rank,
//         "Video_Link":req.body.Video_Link,
//         "Sub_Heading_Colored":req.body.Sub_Heading_Colored,
//       "Banner_Image":Image_Detail
//    };

//    University.Save_University(University_, function (err, rows) {
//         if (err) {
//           return 1;
//         }
//         else {
//           return res.json(rows);
//         }
//       });
//     }
//   }
//   catch (err) {
//     const error = new Error('Please upload a file')
//     error.httpStatusCode = 400
//     return next(error)
//   }
// });
// router.post('/Save_University_Photos', upload.array('myFile'), (req, res, next) => {
//   try {
//     const file = req.files
//     var Photo_=[];
//     if (!file) {
//       const error = new Error('Please upload a file')
//       error.httpStatusCode = 400
//     }
//     else
//     {
//       for(var i=0;i<file.length;i++)
//       {
//         Photo_.push({File_name:file[i].filename})
//       }

//     }

//     {
//       var Photo_json = JSON.stringify(Photo_)
//       var University_ =
//       {
//         "University_Id":req.body.University_Id,
//       "Photo":Photo_json
//    };
//    University.Save_University_Photos(University_, function (err, rows) {
//         if (err) {
//           return 1;
//         }
//         else {
//           return res.json(rows);
//         }
//       });
//     }
//   }
//   catch (err) {
//     const error = new Error('Please upload a file')
//     error.httpStatusCode = 400
//     return next(error)
//   }
// });
// router.get('/University_Typeahead/',function(req,res,next)
//   {
//   try
//   {
//   University.University_Typeahead(req.query.University_Name,function (err, rows)
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
//   router.get('/University_Typeahead_with_Level_University/',function(req,res,next)
//   {
//   try
//   {
//   University.University_Typeahead_with_Level_University(req.query.University_Id,req.query.Level_Detail_Id,req.query.University_Name,function (err, rows)
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

// router.get('/Load_Status/',function(req,res,next)
//   {
//   try
//   {
//   University.Load_Status(function (err, rows)
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
// router.get('/Load_University/',function(req,res,next)
//   {
//   try
//   {
//   University.Load_University(function (err, rows)
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
// router.get('/Search_University/',function(req,res,next)
//   {
//   try
//   {
//   University.Search_University(req.query.University_Name, req.query.University_,req.query.Status_,function (err, rows)
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
// router.get('/Get_University_Photos/:University_Id_?',function(req,res,next)
//   {
//   try
//   {
//   University.Get_University_Photos(req.params.University_Id_, function (err, rows)
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
// router.get('/Delete_University/:University_Id_?',function(req,res,next)
//   {
//   try
//   {
//   University.Delete_University(req.params.University_Id_, function (err, rows)
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
//   router.get('/Search_University_Typeahead/',function(req,res,next)
//   {
//   try
//   {

//    University.Search_University_Typeahead(req.query.University_Name,function (err, rows)
//   {
//   if (err)
//   {
//
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
