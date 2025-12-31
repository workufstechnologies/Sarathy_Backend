var db = require("../dbconnection");
var fs = require("fs");
var Document = {
  Save_Document: function (Document_, callback) {
    return db.query(
      "CALL Save_Document(" +
        "@Document_Id_ :=?," +
        "@Document_Name_ :=?" +
        ")",
      [Document_.Document_Id, Document_.Document_Name],
      callback
    );
  },
  Delete_Document: function (Document_Id_, callback) {
    return db.query(
      "CALL Delete_Document(@Document_Id_ :=?)",
      [Document_Id_],
      callback
    );
  },
  Get_Document: function (Document_Id_, callback) {
    return db.query(
      "CALL Get_Document(@Document_Id_ :=?)",
      [Document_Id_],
      callback
    );
  },
  Search_Document: function (Student_Id_, callback) {
    //  if (Document_Name_===undefined || Document_Name_==="undefined" )
    // Document_Name_='';
    return db.query(
      "CALL Search_Document(@Student_Id_ :=?)",
      [Student_Id_],
      callback
    );
  },

  Get_All_DocumentNames: function (callback) {
    //  if (Document_Name_===undefined || Document_Name_==="undefined" )
    // Document_Name_='';
    return db.query("CALL Get_All_DocumentNames()", [], callback);
  },
};
module.exports = Document;
