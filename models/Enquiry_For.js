var db = require('../dbconnection');
var fs = require('fs');
var Enquiry_For =
{
   Save_Enquiry_For: function (Enquiry_For_, callback) {
      console.log("Enquiry_For_", Enquiry_For_, Enquiry_For_.Enquiryfor_Id, Enquiry_For_.Enquirfor_Name);
      console.log(Enquiry_For_.Enquirfor_Name, 'Enquiry_For_Name_');

      return db.query("CALL Save_Enquiry_For(" +
         "@Enquiry_For_Id_ :=?," +
         "@Enquiry_For_Name_ :=?" + ")"
         , [Enquiry_For_.Enquiryfor_Id,
         Enquiry_For_.Enquirfor_Name
         ], callback);
   }
   ,
   Delete_Enquiry_For: function (Enquiry_For_Id_, callback) {
      return db.query("CALL Delete_Enquiry_FOr(@Enquiry_FOr_Id_ :=?)", [Enquiry_For_Id_], callback);
   }
   ,
   Get_Enquiry_For: function (Enquiry_For_Id_, callback) {
      return db.query("CALL Get_Enquiry_For(@Enquiry_For_Id_ :=?)", [Enquiry_For_Id_], callback);
   }
   ,
   Search_Enquiry_For: function (Enquirfor_Name_, callback) {
      if (Enquirfor_Name_ === undefined || Enquirfor_Name_ === "undefined")
         Enquirfor_Name_ = '';
      return db.query("CALL Search_Enquiry_For(@Enquirfor_Name_ :=?)", [Enquirfor_Name_], callback);
   },
   Search_Supplier_Name: function (Supplier_Name_, callback) {
      if (Supplier_Name_ === undefined || Supplier_Name_ === "undefined")
         Supplier_Name_ = '';
      return db.query("CALL Search_Supplier_Name(@Supplier_Name_ :=?)", [Supplier_Name_], callback);
   }

   //  Get_Menu_Status:function(Menu_Id_,Login_User_,callback)
   //  { 
   //    return db.query("CALL Get_Menu_Status(@Menu_Id_ :=?,@Login_User_:=?)", [Menu_Id_,Login_User_],callback);
   //  } 


};
module.exports = Enquiry_For;

