 var db=require('../dbconnection');
 var fs = require('fs');
 var Fees=
 { 
    Save_Fees:function(Fees_,callback)
 { 
return db.query("CALL Save_Fees("+
"@Fees_Id_ :=?,"+
"@Fees_Name_ :=?"+")"
 ,[Fees_.Fees_Id,
    Fees_.Fees_Name
],callback);
 }
 ,

 Save_Commmission: function(Commmission_, callback) { 
  return db.query("CALL Save_Commmission(" +
      "@Commission_Id_ :=?," +
      "@Commission_Name_ :=?" +
  ")", 
  [
      Commmission_.Commission_Id, 
      Commmission_.Commission_Name
  ], callback);
}
,
 Delete_Fees:function(Fees_Id_,callback)
 { 
return db.query("CALL Delete_Fees(@Fees_Id_ :=?)",[Fees_Id_],callback);
 }
 ,

 Delete_Commission_page:function(Commission_Id_,callback)
 { 
return db.query("CALL Delete_Commission_page(@Commission_Id_ :=?)",[Commission_Id_],callback);
 }
 ,
 Get_Fees:function(Fees_Id_,callback)
 { 
return db.query("CALL Get_Fees(@Fees_Id_ :=?)",[Fees_Id_],callback);
 }
 ,

 Search_Fees_Typeahead:function(Fees_Id_,Fees_Name_,callback)
{ 
  if(Fees_Name_==='undefined'||Fees_Name_===''||Fees_Name_===undefined )
  Fees_Name_='';
return db.query("CALL Search_Fees_Typeahead(@Fees_Id_ :=?,@Fees_Name_ :=?)",
[Fees_Id_,Fees_Name_],callback);
}
,
 Search_Fees_Data:function(Fees_Name_,callback)
 { 
 if (Fees_Name_===undefined || Fees_Name_==="undefined" )
 Fees_Name_='';
return db.query("CALL Search_Fees_Data(@Fees_Name_:=?)",[Fees_Name_],callback);
 },

//  Get_Menu_Status:function(Menu_Id_,Login_User_,callback)
//  { 
//    return db.query("CALL Get_Menu_Status(@Menu_Id_ :=?,@Login_User_:=?)", [Menu_Id_,Login_User_],callback);
//  } ,

Search_Fees:function(Fees_Name_,callback)
{ 
if (Fees_Name_===undefined || Fees_Name_==="undefined" )
Fees_Name_='';
return db.query("CALL Search_Fees(@Fees_Name_ :=?)",[Fees_Name_],callback);
},


Search_Commmission:function(Commission_Name_,callback)
{ 
if (Commission_Name_===undefined || Commission_Name_==="undefined" )
Commission_Name_='';
return db.query("CALL Search_Commmission(@Commission_Name_ :=?)",[Commission_Name_],callback);
}
  };
  module.exports=Fees;

