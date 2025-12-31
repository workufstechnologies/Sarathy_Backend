 var express = require('express');
 var router = express.Router();
 var Notes=require('../models/Notes');
 router.post('/Save_Notes/',function(req,res,next)
 { 
 try 
 {
Notes.Save_Notes(req.body, function (err, rows) 
 {
  if (err) 
  {
    console.log(err)
  res.json(err);
  }
  else 
  {
    res.json(rows);
  }
  });
  }
 catch (e) 
 {
  console.log(e)
 }
 finally 
 {
 }
  });
 router.get('/Search_Notes/',function(req,res,next)
 { 
 try 
 {
Notes.Search_Notes(req.query.Title_Name_, function (err, rows) 
 {
  if (err) 
  {
    console.log(err)
  res.json(err);
  }
  else 
  {
    res.json(rows);
  }
  });
  }
 catch (e) 
 {
  console.log(e)
 }
 finally 
 {
 }
  });
 router.get('/Delete_Notes/:Notes_Id_?',function(req,res,next)
 { 
 try 
 {
Notes.Delete_Notes(req.params.Notes_Id_, function (err, rows) 
 {
  if (err) 
  {
  res.json(err);
  }
  else 
  {
    res.json(rows);
  }
  });
  }
 catch (e) 
 {
 }
 finally 
 {
 }
  });


  
  module.exports = router;

