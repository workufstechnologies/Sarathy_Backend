 var express = require('express');
 var router = express.Router();
 var Agent_Details=require('../models/Agent_Details');

 router.post('/Save_Agent_Details/',function(req,res,next)
 { 
 try 
 {
Agent_Details.Save_Agent_Details(req.body, function (err, rows) 
 {
  if (err) 
  {
    
  res.json(err);
  }
  else 
  {
    console.log(rows)
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

  
 router.get('/Search_Agent_Details/:Agent_Name_?',function(req,res,next)
 { 
   
 try 
 {
Agent_Details.Search_Agent_Details(req.params.Agent_Name_, function (err, rows) 
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
 router.get('/Get_Agent_Details/:Agent_Id_?',function(req,res,next)
 { 
 try 
 {
Agent_Details.Get_Agent_Details(req.params.Agent_Id_, function (err, rows) 
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
 router.get('/Delete_Agent_Details/:Agent_Id_?',function(req,res,next)
 { 
 try 
 {
Agent_Details.Delete_Agent_Details(req.params.Agent_Id_, function (err, rows) 
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

  
  // router.get('/Get_Menu_Status/:Menu_Id_?/:Login_User_?',function(req,res,next)
  //   { 
  //   try 
  //   {
     
  //     Agent_Details.Get_Menu_Status(req.params.Menu_Id_,req.params.Login_User_, function (err, rows)
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

