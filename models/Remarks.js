 var db=require('../dbconnection');
 var fs = require('fs');
 var Remarks=
 { 
 Save_Remarks:function(Remarks_,callback)
 { 
return db.query("CALL Save_Remarks("+
"@Remarks_Id_ :=?,"+
"@Remarks_Name_ :=?"+")"
 ,[Remarks_.Remarks_Id,
Remarks_.Remarks_Name
],callback);
 }
 ,
 Delete_Remarks:function(Remarks_Id_,callback)
 { 
return db.query("CALL Delete_Remarks(@Remarks_Id_ :=?)",[Remarks_Id_],callback);
 },
 Remarks_Typeahead:function(Remarks_Name,callback)
 { 
    if (Remarks_Name===undefined || Remarks_Name==="undefined" )
    Remarks_Name='';
    return db.query("CALL Remarks_Typeahead(@Remarks_Name :=?)",[Remarks_Name],callback);
 }, 
 Search_Remarks:function(Remarks_Name_,callback)
 { 
 if (Remarks_Name_===undefined || Remarks_Name_==="undefined" )
Remarks_Name_='';
return db.query("CALL Search_Remarks(@Remarks_Name_ :=?)",[Remarks_Name_],callback);
 }

//  Get_Menu_Status:function(Menu_Id_,Login_User_,callback)
//  { 
//    return db.query("CALL Get_Menu_Status(@Menu_Id_ :=?,@Login_User_:=?)", [Menu_Id_,Login_User_],callback);
//  } ,

  };
  module.exports=Remarks;

