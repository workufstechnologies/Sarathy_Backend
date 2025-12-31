var db = require('../dbconnection');
var fs = require('fs');
var Country =
{
   Save_Country: function (Country_, callback) {
      return db.query("CALL Save_Country(" +
         "@Country_Id_ :=?," +
         "@Country_Name_ :=?," +
         "@Brand_Id_ :=?," +
         "@Brand_Name_ :=?)"
         , [Country_.Country_Id,
         Country_.Country_Name,
         Country_.Brand_Id,
         Country_.Brand_Name
         ], callback);
   }
   ,
   Delete_Country: function (Country_Id_, callback) {
      return db.query("CALL Delete_Country(@Country_Id_ :=?)", [Country_Id_], callback);
   }
   ,
   Get_Country: function (Country_Id_, callback) {
      return db.query("CALL Get_Country(@Country_Id_ :=?)", [Country_Id_], callback);
   }
   ,


   Load_Model: function (callback) {
      return db.query("CALL Load_Model()", [], callback);
   },


   Search_Country_Typeahead: function (Country_Name, callback) {
      if (Country_Name === undefined || Country_Name === "undefined")
         Country_Name = '';
      return db.query("CALL Search_Country_Typeahead(@Country_Name :=?)", [Country_Name], callback);
   },


   Search_Application_StatusforChangeStatus_Typeahead: function (Status_Name, Login_User, callback) {
      if (Status_Name === undefined || Status_Name === "undefined")
         Status_Name = '';
      return db.query("CALL Search_Application_StatusforChangeStatus_Typeahead(@Status_Name :=?," + "@Login_User :=?)", [Status_Name, Login_User], callback);
   },



   Search_Country: function (Country_Name_, Brand_Id_, callback) {
      if (Country_Name_ === undefined || Country_Name_ === "undefined")
         Country_Name_ = '';
      if (Brand_Id_ === undefined || Brand_Id_ === "undefined")
         Brand_Id_ = '';
      return db.query("CALL Search_Country(@Country_Name_ :=?,@Brand_Id_ :=?)", [Country_Name_, Brand_Id_], callback);
   }
};
module.exports = Country;

