var db = require('../dbconnection');
var fs = require('fs');
const storedProcedure = require('../helpers/stored-procedure');
const { Console } = require('console');
var Branch =
{
  Save_Branch: async function (Branch_) {
    return new Promise(async (rs, rej) => {
      const pool = db.promise();
      let connection;

      try {
        connection = await pool.getConnection();

        const Department_ = Branch_.Department_Data;

        const result = await new storedProcedure('Save_Branch', [
          Branch_.Branch_Id,
          Branch_.Branch_Name,
          Branch_.Address,
          Branch_.Location,
          Branch_.District,
          Branch_.State,
          Branch_.Country,
          Branch_.PinCode,
          Branch_.Phone_Number,
          Branch_.Email,
          Branch_.Branch_Code,
          Branch_.Company,
          Branch_.Default_Department_Id,
          Branch_.Default_Department_Name,
          Branch_.Default_User_Id,
          Branch_.Default_User_Name,
          Department_
        ], connection).result();

        rs(result);

      } catch (err) {
        console.error("❌ Error in Save_Branch:", err);
        rej(err);
      } finally {
        if (connection) connection.release();
      }
    });
  }
  ,
  Delete_Branch: function (Branch_Id_, callback) {
    return db.query("CALL Delete_Branch(@Branch_Id_ :=?)", [Branch_Id_], callback);
  },
  Get_Branch_Department_Edit: function (Branch_Id_, callback) {
    return db.query("CALL Get_Branch_Department_Edit(@Branch_Id_ :=?)", [Branch_Id_], callback);
  },
  Get_Branch: async function (Branch_Id_) {
    const Department = await (new storedProcedure('Get_Branch_Department_Edit', [Branch_Id_])).result();
    return { Department };
  },
  Search_Branch: function (Branch_Name_, callback) {
    if (Branch_Name_ === 'undefined' || Branch_Name_ === '' || Branch_Name_ === undefined)
      Branch_Name_ = '';
    return db.query("CALL Search_Branch(@Branch_Name_ :=?)", [Branch_Name_], callback);
  },
  Search_Branch_Typeahead: function (Branch_Name_, callback) {
    if (Branch_Name_ === 'undefined' || Branch_Name_ === '' || Branch_Name_ === undefined)
      Branch_Name_ = '';
    return db.query("CALL Search_Branch_Typeahead(@Branch_Name_ :=?)", [Branch_Name_], callback);
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
module.exports = Branch;

