var db=require('../dbconnection');
 // const storedProcedure=require('../helpers/stored-procedure');
var fs = require('fs');
const StoredProcedure = require('../helpers/stored-procedure');
var Company= 
{ 
  Save_Company:function(Company_,callback)
{ 
 var Company_value_=1;
return db.query("CALL Save_Company("+"@Company_ :=?,"+"@Company_value_ :=?)" ,[JSON.stringify(Company_),Company_value_],callback); 
}
,
Get_Company: async function () 
{
// const Company_Data=await (new storedProcedure('Get_Company',  [])).result();
const Company_Data=await (new StoredProcedure('Get_Company',  [])).result();
return {Company_Data};    

},

Get_Branchdetails:function(Branch_Id,callback)
{ 
return db.query("CALL Get_Branchdetails(@Branch_Id :=?)",[Branch_Id],callback);
}
,
Save_Application_Settings: async function (Application_Settings_) {
  return new Promise(async (rs, rej) => {
    const pool = db.promise();
    let connection;

    try {
      connection = await pool.getConnection();

      const result1 = await (
        new StoredProcedure(
          'Save_Application_Settings',
          [
            Application_Settings_.Application_Settings_Id,
            Application_Settings_.Settings_Value,
            Application_Settings_.Department_Id,
            Application_Settings_.Register_Transfer_Status,
            Application_Settings_.Registration_By,
            Application_Settings_.Branch,
            Application_Settings_.Department,
            Application_Settings_.Tostaff,
            Application_Settings_.Receipt_Notification_User,
            Application_Settings_.Round_Robin,
            Application_Settings_.Prefix
          ],
          connection
        )
      ).result();

      rs(result1);
    } catch (err) {
      console.error("❌ Error in Save_Application_Settings:", err.message);
      rej(err);
    } finally {
      if (connection) connection.release(); // Always release the connection
    }
  });
}
,
  Get_Application_Settings: async function () 
  {
  const Settings_Data=await (new StoredProcedure('Get_Application_Settings',  [])).result();
  return {Settings_Data};    
  },

 };
 module.exports=Company;

