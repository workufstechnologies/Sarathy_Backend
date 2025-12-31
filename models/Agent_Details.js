 var db=require('../dbconnection');
 var fs = require('fs');
 var Agent_Details=
 { 
// Save_Agent_Details:function(Agent_Details_,callback)
//  { 
//    console.log(Agent_Details_)
// return db.query("CALL Save_Agent_Details("+
// "@Agent_Id_ :=?,"+
// "@Agent_Name_ :=?,"+
// "@Phone_ :=?,"+
// "@Email_ :=?,"+
// "@Address_ :=?,"+
// "@Description_ :=?"+")"

//  ,[Agent_Details_.Agent_Id,
//   Agent_Details_.Agent_Name,
//   Agent_Details_.Phone,
//   Agent_Details_.Email,
//   Agent_Details_.Address,
//   Agent_Details_.Description
// ],callback);
//  }
//  ,
 Delete_Agent_Details:function(Agent_Id_,callback)
 { 
return db.query("CALL Delete_Agent_Details(@Agent_Id_ :=?)",[Agent_Id_],callback);
 }
 ,
 Get_Agent_Details:function(Agent_Id_,callback)
 { 
return db.query("CALL Get_Agent_Details(@Agent_Id_ :=?)",[Agent_Id_],callback);
 }
 ,
 Search_Agent_Details:function(Agent_Name_,callback)
 { 
    if(Agent_Name_==='undefined'||Agent_Name_===''||Agent_Name_===undefined )
    Agent_Name_='';
return db.query("CALL Search_Agent_Details(@Agent_Name_ :=?)",[Agent_Name_],callback);
 },


 /*** Added on 01-11-2024 */

 Save_Agent_Details:function(Agent_Details_,callback)
 { 
   console.log(Agent_Details_)
return db.query("CALL Save_Agent_Details("+
"@Agent_Id_ :=?,"+
"@Agent_Name_ :=?,"+
"@Phone_ :=?,"+
"@Email_ :=?,"+
"@Address_ :=?,"+
"@Description_ :=?,"+
"@User_Name_ :=?,"+
"@Password_ :=?,"+
"@Enquiry_Source_Id_ :=?,"+
"@Under_User_ :=?,"+
"@Branch_Id_ :=?,"+
"@Department_ :=?,"+
"@Agent_Details_Id_:=?,"+
"@Department_name_ :=?,"+
"@To_staff_name_ :=?,"+
"@Login_user_id_ :=?"+
")",[
      Agent_Details_.Agent_Id,
      Agent_Details_.Agent_Name,
      Agent_Details_.Phone,
      Agent_Details_.Email,
      Agent_Details_.Address,
      Agent_Details_.Description,
      Agent_Details_.User_Name,
      Agent_Details_.Password,
      Agent_Details_.Enquiry_Source_Id,
      Agent_Details_.Under_User,
      Agent_Details_.Branch_Id,
      Agent_Details_.Department,
      Agent_Details_.To_User_Id,
      Agent_Details_.Department_Name,
      Agent_Details_.To_User_Name,
      Agent_Details_.Login_user_id,
    ],callback);
    },




  };
  module.exports=Agent_Details;

