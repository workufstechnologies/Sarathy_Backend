var db = require('../dbconnection');
var fs = require('fs');
const storedProcedure = require('../helpers/stored-procedure');
const { Console } = require('console');
var DSE =
{

  Save_DSE: function (DSE_, callback) {
     console.log(DSE_);

    return db.query("CALL Save_DSE(" +
      "@DSE_Id_ :=?," +
      "@DSE_Name_ :=?," +
      "@Department_Id_ :=?," +
      "@Department_Name_ :=?," +
      "@Branch_Id_ :=?," +
      "@Branch_Name_ :=?" +
      ")"
      , [DSE_.DSE_Id,        // 1
      DSE_.DSE_Name,      // 2
      DSE_.Department_Id,      // 3
      DSE_.Department_Name,    // 4
      DSE_.Branch_Id,          // 5
      DSE_.Branch_Name
      ], callback);
  }
  ,

  Load_DefaultDSE: function (callback) {
    return db.query("CALL Load_DefaultDSE()", [], callback);
  },

  Delete_DSE: function (DSE_Id_, callback) {
    return db.query("CALL Delete_DSE(@DSE_Id_ :=?)", [DSE_Id_], callback);
  },

  Get_DSE_Department_Edit: function (DSE_Id_, callback) {
    return db.query("CALL Get_DSE_Department_Edit(@DSE_Id_ :=?)", [DSE_Id_], callback);
  },

  Get_DSE: async function (DSE_Id_) {
    const Department = await (new storedProcedure('Get_DSE_Department_Edit', [DSE_Id_])).result();
    return { Department };
  },

  Search_DSE: function (DSE_Name_, Branch_Id_, Department_Id_, callback) {
    if (DSE_Name_ === 'undefined' || DSE_Name_ === '' || DSE_Name_ === undefined)
      DSE_Name_ = '';
    return db.query("CALL Search_DSE(@DSE_Name_ :=?,@Branch_Id_ :=?,@Department_Id_ :=?)", [DSE_Name_, Branch_Id_, Department_Id_], callback);
  },

  Delete_Location: function (Location_Id_, callback) {
    return db.query("CALL Delete_Location(@Location_Id_ :=?)", [Location_Id_], callback);
  },

  Search_DSE_Typeahead: function (DSE_Name_, callback) {
    if (DSE_Name_ === 'undefined' || DSE_Name_ === '' || DSE_Name_ === undefined)
      DSE_Name_ = '';
    return db.query("CALL Search_DSE_Typeahead(@DSE_Name_ :=?)", [DSE_Name_], callback);
  },

  Search_campaign_master_Typeahead: function (Campaign_Master_Name_, callback) {
    if (Campaign_Master_Name_ === 'undefined' || Campaign_Master_Name_ === '' || Campaign_Master_Name_ === undefined)
      Campaign_Master_Name_ = '';
    return db.query("CALL Search_campaign_master_Typeahead(@Campaign_Master_Name_ :=?)", [Campaign_Master_Name_], callback);
  },

  Search_Company: function (callback) {
    return db.query("CALL Search_Company()", [], callback);
  }
};
module.exports = DSE;