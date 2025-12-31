 var db=require('../dbconnection');
 var fs = require('fs');
 var Notes=
 { 
 Save_Notes:function(Notes_,callback)
 { 
    console.log(Notes_)
return db.query("CALL Save_Notes("+
"@Notes_Id_ :=?,"+
"@Title_ :=?,"+
"@Description_ :=?)"
 ,[Notes_.Notes_Id,
Notes_.Title,
Notes_.Description
],callback);
 }
 ,
 Delete_Notes:function(Notes_Id_,callback)
 { 
return db.query("CALL Delete_Notes(@Notes_Id_ :=?)",[Notes_Id_],callback);
 }
  ,
 Search_Notes:function(Title_Name_,callback)
 { 
 if (Title_Name_===undefined || Title_Name_==="undefined" )
    Title_Name_='';
return db.query("CALL Search_Notes(@Title_Name_ :=?)",[Title_Name_],callback);
 },

  };
  module.exports=Notes;

