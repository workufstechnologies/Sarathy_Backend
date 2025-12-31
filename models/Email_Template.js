var db=require('../dbconnection');
var fs = require('fs');
var Email_Template=
{ 

      Get_All_Email_Template_Fields:function(callback)
      { 
      return db.query("CALL Get_All_Email_Template_Fields()",[],callback);
      },
      Get_All_Email_Templates: function(name, callback) { 
          return db.query("CALL Get_All_Email_Templates(?)", [name], callback);
      },
     Save_Email_Template: function(template_data, callback) {
        console.log('template_data: ', template_data);
    return db.query(
        "CALL Save_Email_Template(?,?,?,?,?,?,?,?,?,?)", 
        [
            template_data.id,
            template_data.name,
            template_data.subject,
            template_data.body,
            template_data.created_by,
            template_data.updated_by,
            JSON.stringify(template_data.attachments),
            template_data.brevo_template_id || null, 
            template_data.document_id || null,
            template_data.document_name || null
        ],
        callback
    );
},

    Delete_Email_Template: function(id, callback) {
        return db.query("CALL Delete_Email_Template(?)", [id], callback);
    },
    Get_Template_Data: function(queryConfig, callback) {
        console.log(queryConfig)
        const columns = queryConfig.columns.join(', ');
        const query = `SELECT ${columns} FROM ${queryConfig.table} ${queryConfig.whereClause}`;
        return db.query(query, queryConfig.params, callback);
    },
    Get_User_Mail: function(studentId, callback) {
        return db.query(
            "SELECT Email FROM student WHERE Student_Id = ? AND DeleteStatus = 0",
            [studentId],
            callback
        );
    },
};
module.exports=Email_Template;