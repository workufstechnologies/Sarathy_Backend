var db = require('../dbconnection');
var fs = require('fs');
const storedProcedure = require('../helpers/stored-procedure');
const { Console } = require('console');
var Brand =
{
  Save_Brand: async function (Brand_) {
    return new Promise(async (rs, rej) => {
      const pool = db.promise();
      let connection;

      try {
        connection = await pool.getConnection();



        const result = await new storedProcedure('Save_Brand', [
          Brand_.Brand_Id,
          Brand_.Brand_Name,
          Brand_.Default_Department_Id,
          Brand_.Default_Department_Name
        ], connection).result();

        rs(result);

      } catch (err) {
        console.error("❌ Error in Save_Brand:", err);
        rej(err);
      } finally {
        if (connection) connection.release();
      }
    });
  }
  ,
  Load_DefaultBrand: function (callback) {
    return db.query("CALL Load_DefaultBrand()", [], callback);
  },

  Delete_Brand: function (Brand_Id_, callback) {
    return db.query("CALL Delete_Brand(@Brand_Id_ :=?)", [Brand_Id_], callback);
  },
  Get_Brand_Department_Edit: function (Brand_Id_, callback) {
    return db.query("CALL Get_Brand_Department_Edit(@Brand_Id_ :=?)", [Brand_Id_], callback);
  },
  Get_Brand: async function (Brand_Id_) {
    const Department = await (new storedProcedure('Get_Brand_Department_Edit', [Brand_Id_])).result();
    return { Department };
  },
  Search_Brand: function (Brand_Name_, Channel_Id_, callback) {
    if (Brand_Name_ === 'undefined' || Brand_Name_ === '' || Brand_Name_ === undefined)
      Brand_Name_ = '';
    if (Channel_Id_ === 'undefined' || Channel_Id_ === '' || Channel_Id_ === undefined)
      Channel_Id_ = '';
    return db.query("CALL Search_Brand(@Brand_Name_ :=?,@Channel_Id_ :=?)", [Brand_Name_, Channel_Id_], callback);
  },
  Search_Brand_Typeahead: function (Brand_Name_, callback) {
    if (Brand_Name_ === 'undefined' || Brand_Name_ === '' || Brand_Name_ === undefined)
      Brand_Name_ = '';
    return db.query("CALL Search_Brand_Typeahead(@Brand_Name_ :=?)", [Brand_Name_], callback);
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
module.exports = Brand;

