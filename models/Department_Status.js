 var db=require('../dbconnection');
 var fs = require('fs');
 var Department_Status= { 
 Save_Department_Status: function (Department_Status_, callback) {
    console.log(Department_Status_);
    return db.query(
      "CALL Save_Department_Status(" +
        "@Department_Status_Id_ :=?," +
        "@Department_Status_Name_ :=?," +
        "@Status_Order_ :=?," +
        "@Editable_ :=?," +
        "@Color_ :=?," +
        "@Status_Type_Id_ :=?," +
        "@Transfer_Status_ :=?," +
        "@Notification_Status_ :=?," +
        "@Notification_Department_Id_ :=?," +
        "@Notification_Department_Name_ :=?," +
        "@Transfer_Department_Id_ :=?," +
        "@Transfer_Department_Name_ :=?," +
        "@Status_Type_Name_ :=?," +
        "@FollowUp_ :=?," +
        "@Registration_ :=?," +
        "@Display_In_ :=?," +
        "@Class_Id_ :=?," +
        "@Class_Name_ :=?," +
        "@Class_Order_ :=?," +
        "@Registration_Mandatory_ :=?," +
        "@Update_in_Profile_ :=?," +
        "@Duration_ :=?," +
        "@Send_Mail_ :=?," +
        "@Send_Student_Mail_ :=?," +
        "@Send_Staff_Mail_ :=?," +
        "@Student_Email_Template_Id_ :=?," +
        "@Student_Email_Template_Name_ :=?," +
        "@Staff_Email_Template_Id_ :=?," +
        "@Staff_Email_Template_Name_ :=?," +
        "@Selected_Department_:=?," +
        "@Send_BDM_Mail_:=?," +
        "@Send_Branch_Head_Mail_:=?," +
        "@Department_Id_:=?" +
        ")",
      [
        Department_Status_.Department_Status_Id,
        Department_Status_.Department_Status_Name,
        Department_Status_.Status_Order,
        Department_Status_.Editable,
        Department_Status_.Color,
        Department_Status_.Status_Type_Id,
        Department_Status_.Transfer_Status,
        Department_Status_.Notification_Status,
        Department_Status_.Notification_Department_Id,
        Department_Status_.Notification_Department_Name,
        Department_Status_.Transfer_Department_Id,
        Department_Status_.Transfer_Department_Name,
        Department_Status_.Status_Type_Name,
        Department_Status_.FollowUp,
        Department_Status_.Registration,
        Department_Status_.Display_In,
        Department_Status_.Class_Id,
        Department_Status_.Class_Name,
        Department_Status_.Class_Order,
        Department_Status_.Registration_Mandatory,
        Department_Status_.Update_in_Profile,
        Department_Status_.Duration,
        Department_Status_.Send_Mail,
        Department_Status_.Send_Student_Mail,
        Department_Status_.Send_Staff_Mail,
        Department_Status_.Student_Email_Template_Id,
        Department_Status_.Student_Email_Template_Name,
        Department_Status_.Staff_Email_Template_Id,
        Department_Status_.Staff_Email_Template_Name,
        Department_Status_.Selected_Department,
        Department_Status_.Send_BDM_Mail,
        Department_Status_.Send_Branch_Head_Mail,
        Department_Status_.Department_Id,
      ],
      callback
    );
  },
 Delete_Department_Status:function(Department_Status_Id_,callback)
 { 
return db.query("CALL Delete_Department_Status(@Department_Status_Id_ :=?)",[Department_Status_Id_],callback);
 }
 ,
 Get_Department_Status:function(Department_Status_Id_,callback)
 { 
return db.query("CALL Get_Department_Status(@Department_Status_Id_ :=?)",[Department_Status_Id_],callback);
 }
 ,
 Search_Department_Status:function(Department_Status_Name_,callback)
 { 
    if(Department_Status_Name_==='undefined'||Department_Status_Name_===''||Department_Status_Name_===undefined )
    Department_Status_Name_='';
return db.query("CALL Search_Department_Status(@Department_Status_Name_ :=?)",[Department_Status_Name_],callback);
 }
,

Get_Sub_Status:function(Department_Status_Id_,callback)
{ 
return db.query("CALL Get_Sub_Status(@Department_Status_Id_ :=?)",[Department_Status_Id_],callback);
},


Save_Sub_Status:function(Sub_Status_,callback)
{ 
    console.log(Sub_Status_)
    return db.query("CALL Save_Sub_Status("+"@Sub_Status_Id_ :=?,"+"@Sub_Status_Name_ :=?,"+"@Status_Id_ :=?,"+"@FollowUp_ :=?,"+"@Duration_ :=?"+")"
    ,[Sub_Status_.Sub_Status_Id,Sub_Status_.Sub_Status_Name,Sub_Status_.Status_Id,Sub_Status_.FollowUp,Sub_Status_.Duration,],callback);
},


Delete_Sub_Status:function(Sub_Status_Id_,callback)
{ 
  console.log(Sub_Status_Id_)
return db.query("CALL Delete_Sub_Status(@Sub_Status_Id_ :=?)",[Sub_Status_Id_],callback);
},

  Get_Email_Template_List: function (callback) {
    return db.query("CALL Get_Email_Template_List()", callback);
  },
};

  module.exports=Department_Status;

