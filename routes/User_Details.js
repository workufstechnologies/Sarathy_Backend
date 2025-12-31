    var express = require('express');
    var router = express.Router();
    var User_Details=require('../models/User_Details');
router.use(express.json({ limit: '50mb' }));
router.use(express.urlencoded({ limit: '50mb', extended: true }));
router.post('/Save_User_Details/',async function(req,res,next)
      { 
      try 
      {
           const requestSize = JSON.stringify(req.body).length;
        console.log('Request size (bytes):', requestSize);
        console.log('Request size (MB):', (requestSize / 1024 / 1024).toFixed(2));
      const resp=await User_Details.Save_User_Details(req.body);
      return res.send(resp);
      }
      catch(e){
        
      return res.send(e);
      
      }
      });
      router.get('/Search_User_Details', async function (req, res, next) {
        var result = '';
        try {
          result = await User_Details.Search_User_Details(req.query.User_Details_Name_,req.query.Branch_Id_,req.query.Department_Id_,req.query.User_Status_Id_, function (err, rows) 
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
      
          res.json(result);
        }
        catch (e) {
      
        }
        finally {
      
        }
      });
    router.get('/Search_User_Typeahead/:User_Details_Name_?',function(req,res,next)
    { 
    try 
    {
        User_Details.Search_User_Typeahead(req.params.User_Details_Name_, function (err, rows) 
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
    router.post('/Update_User_Department/:User_Details_Id', function(req, res, next) {
    try {
        User_Details.Update_User_Department(req.params.User_Details_Id, function (err, rows) {
            if (err) {
                res.json(err);
            } else {
                res.json(rows);
            }
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
    router.get('/Search_User_Typeahead_ByUser/:Login_Id_?/:User_Details_Name_?',function(req,res,next)
    { 
    try 
    {
        User_Details.Search_User_Typeahead_ByUser(req.params.Login_Id_,req.params.User_Details_Name_, function (err, rows) 
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


    router.get('/Get_Location_Load_Data/:Branch_Id_?/:Department_Id_?',function(req,res,next)
    { 
    try 
    {
        User_Details.Get_Location_Load_Data(req.params.Branch_Id_,req.params.Department_Id_, function (err, rows) 
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


 router.get('/Search_User_Role/:User_Role_Name_?',function(req,res,next)
 { 
 try 
 {
    User_Details.Search_User_Role(req.params.User_Role_Name_, function (err, rows) 
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
router.get('/Get_User_Details/:User_Details_Id_?',function(req,res,next)
    { 
    try 
    {
    User_Details.Get_User_Details(req.params.User_Details_Id_, function (err, rows) 
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
router.get('/Delete_User_Details/:User_Details_Id_?',function(req,res,next)
    { 
    try 
    {
    User_Details.Delete_User_Details(req.params.User_Details_Id_, function (err, rows) 
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
router.get('/Get_Menu_Permission/:User_Id_?',function(req,res,next)
    { 
    try 
    {
    User_Details.Get_Menu_Permission(req.params.User_Id_, function (err, rows) 
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
 router.get('/User_Employee/:User_Details_Id_?',function(req,res,next)
    { 
    try 
    {
    User_Details.User_Employee(req.params.User_Details_Id_, function (err, rows) 
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
    // router.get('/Get_User_Details_Edit/:User_Details_Id_?',function(req,res,next)
    // { 
    // try 
    // {
    // User_Details.Get_User_Details_Edit(req.params.User_Details_Id_, function (err, rows) 
    // {
    // if (err) 
    // {
    // res.json(err);
    // }
    // else 
    // {
    // res.json(rows);
    // }
    // });
    // }
    // catch (e) 
    // {
    // }
    // finally 
    // {
    // }
    // });
    router.get("/Get_User_Details_Edit/:User_Details_Id_?",async (req, res, next) =>
       {
       try 
       {   
       const result = await User_Details.Get_User_Details_Edit(req.params.User_Details_Id_);
       res.json(result);  
       } 
       catch (e) 
       {
       res.send(e);
       } 
       finally 
       {
       }
       });
    router.get("/Get_Users_Load_Data",async (req, res, next) =>
        {
        try
        {
        const result = await User_Details.Get_Users_Load_Data();
        res.json(result);
        } 
        catch (e) 
        {
                      //
        res.send(e);
        } 
        finally 
        {
        }
        });


    router.get('/Search_Backup_User_Typeahead/',function(req,res,next)
    { 
    try 
    {
      User_Details.Search_Backup_User_Typeahead(req.query.User_Details_Name, function (err, rows)
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


    router.get('/Load_Course/',function(req,res,next)
    { 
    try 
    {
      User_Details.Load_Course(function (err, rows) 
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

    /** Added on 03-12-2024 */

    router.get('/Load_Country/',function(req,res,next)
    { 
    try 
    {
      User_Details.Load_Country(function (err, rows) 
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
        // { 
        // try 
        // {
        //   User_Details.Get_Menu_Status(req.params.Menu_Id_,req.params.Login_User_, function (err, rows)
        // {
        // if (err) 
        // {
        // res.json(err);
        // }
        // else 
        // {
        // res.json(rows);
        // }
        // });
        // }
        // catch (e) 
        // {
        // }
        // finally 
        // {
        // }
        // });

    module.exports = router;

