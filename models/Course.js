var db = require("../dbconnection");
var fs = require("fs");
const { Console } = require("console");
var Course = {
  Save_Course: function (Course_, callback) {
    return db.query(
      "CALL Save_Course(" +
        "@Course_Id_ :=?," +
        "@Course_Name_ :=?," +
        "@Subject_Id_ :=?," +
        "@Sub_Section_Id_ :=?," +
        "@Duration_Id_ :=?," +
        "@Level_Id_ :=?," +
        "@Ielts_Minimum_Score_ :=?," +
        "@Internship_Id_ :=?," +
        "@Notes_ :=?," +
        "@Details_ :=?," +
        "@Application_Fees_ :=?," +
        "@Tution_Fees_ :=?," +
        "@Entry_Requirement_ :=?," +
        "@Living_Expense_ :=?," +
        "@Work_Experience_ :=?," +
        "@Registration_Fees_ :=?," +
        "@Date_Charges_ :=?," +
        "@Bank_Statements_ :=?," +
        "@Insurance_ :=?," +
        "@VFS_Charges_ :=?," +
        "@Apostille_ :=?," +
        "@Other_Charges_ :=?," +
        "@IELTS_Name_ :=?," +
        "@Intake_Name_ :=?," +
        "@University_Id_ :=?," +
        "@Country_Id_ :=?," +
        "@Tag_ :=?," +
        "@Intake_Data_ :=?" +
        ")",
      [
        Course_.Course_Id,
        Course_.Course_Name,
        Course_.Subject_Id,
        Course_.Sub_Section_Id,
        Course_.Duration_Id,
        Course_.Level_Id,
        Course_.Ielts_Minimum_Score,
        Course_.Internship_Id,
        Course_.Notes,
        Course_.Details,
        Course_.Application_Fees,
        Course_.Tution_Fees,
        Course_.Entry_Requirement,
        Course_.Living_Expense,
        Course_.Work_Experience,
        Course_.Registration_Fees,
        Course_.Date_Charges,
        Course_.Bank_Statements,
        Course_.Insurance,
        Course_.VFS_Charges,
        Course_.Apostille,
        Course_.Other_Charges,
        Course_.IELTS_Name,
        Course_.Intake_Name,
        Course_.University_Id,
        Course_.Country_Id,
        Course_.Tag,
        JSON.stringify(Course_.Intake_Data),
      ],
      callback
    );
  },
  Delete_Course: function (Course_Id_, callback) {
    return db.query(
      "CALL Delete_Course(@Course_Id_ :=?)",
      [Course_Id_],
      callback
    );
  },

  Get_Course: function (Course_Id_, callback) {
    return db.query("CALL Get_Course(@Course_Id_ :=?)", [Course_Id_], callback);
  },

  Get_Course_Import: function (Import_Master_Id_, callback) {
    return db.query(
      "CALL Get_Course_Import(@Import_Master_Id_ :=?)",
      [Import_Master_Id_],
      callback
    );
  },

  Save_Course_Import: function (Course_Details, callback) {
    return db.query(
      "CALL Save_Course_Import(" + "@Course_Details :=?" + ")",
      [JSON.stringify(Course_Details.Course_Import_Details)],
      callback
    );
  },

  Search_Course_Import: function (
    From_Date_,
    To_Date_,
    Is_Date_Check_,
    callback
  ) {
    return db.query(
      "CALL Search_Course_Import(@From_Date_ :=?,@To_Date_ :=?,@Is_Date_Check_ :=?)",
      [From_Date_, To_Date_, Is_Date_Check_],
      callback
    );
  },

  Search_Courses_Typeahead_tempp: function (
    Course_Name,
    University_Id,
    callback
  ) {
    if (Course_Name === undefined || Course_Name === "undefined")
      Course_Name = "";
    return db.query(
      "CALL Search_Courses_Typeahead_tempp(@Course_Name :=?,@University_Id :=?)",
      [Course_Name, University_Id],
      callback
    );
  },
  //  Search_Course:function(Course_Name_,callback)
  //  {
  //  if (Course_Name_===undefined || Course_Name_==="undefined" )
  // Course_Name_='';
  // return db.query("CALL Search_Course(@Course_Name_ :=?)",[Course_Name_],callback);
  //  },

  Search_Course: function (
    Course_Name_,
    Level_Id_,
    Country_Id_,
    Internship_Id_,
    Duration_Id_,
    University_Id_,
    Subject_Id_,
    Sub_Section_Id_,
    search_Itnake_Id_,
    Pointer_Start_,
    Pointer_Stop_,
    Page_Length_,
    callback
  ) {
    if (Course_Name_ === undefined || Course_Name_ === "undefined")
      Course_Name_ = "";

    if (Level_Id_ === undefined || Level_Id_ === "undefined") Level_Id_ = 0;

    if (Country_Id_ === undefined || Country_Id_ === "undefined")
      Country_Id_ = 0;

    if (Internship_Id_ === undefined || Internship_Id_ === "undefined")
      Internship_Id_ = 0;

    if (Duration_Id_ === undefined || Duration_Id_ === "undefined")
      Duration_Id_ = 0;

    if (University_Id_ === undefined || University_Id_ === "undefined")
      University_Id_ = 0;

    if (Subject_Id_ === undefined || Subject_Id_ === "undefined")
      Subject_Id_ = 0;

    if (Sub_Section_Id_ === undefined || Sub_Section_Id_ === "undefined")
      Sub_Section_Id_ = 0;

    if (Pointer_Start_ === undefined || Pointer_Start_ === "undefined")
      Pointer_Start_ = 0;

    if (Pointer_Stop_ === undefined || Pointer_Stop_ === "undefined")
      Pointer_Stop_ = 0;

    if (search_Itnake_Id_ === undefined || search_Itnake_Id_ === "undefined")
      search_Itnake_Id_ = 0;
    

    return db.query(
      "CALL Search_Course(@Course_Name_ :=?,@Level_Id_ :=?,@Country_Id_ :=?,@Internship_Id_ :=?,@Duration_Id_ :=?,@University_Id_ :=?,@Subject_Id_ :=?,"+
      "@Sub_Section_Id_ :=?,@search_Itnake_Id_ :=?,@Pointer_Start_ :=?,@Pointer_Stop_ :=?,@Page_Length_ :=?)",
      [
        Course_Name_,
        Level_Id_,
        Country_Id_,
        Internship_Id_,
        Duration_Id_,
        University_Id_,
        Subject_Id_,
        Sub_Section_Id_,
        search_Itnake_Id_,
        Pointer_Start_,
        Pointer_Stop_,
        Page_Length_,
      ],
      callback
    );
  },

  Search_Course_Typeahead: function (
    Country_Id_,
    Subject_Id_,
    Sub_Section_Id_,
    Level_Id_,
    Course_Name_,
    Duration_Id_,
    Ielts_Minimum_Score_,
    Intake_Id_,
    Internship_Id_,
    callback
  ) {
    if (
      Delivery_Point_Name_ === undefined ||
      Delivery_Point_Name_ === "undefined"
    )
      Delivery_Point_Name_ = "";

    return db.query(
      "CALL Search_Course_Typeahead(@Country_Id_ :=?,@Subject_Id_ :=?,@Sub_Section_Id_ :=?,@Level_Id_ :=?,@Course_Name_ :=?,@Duration_Id_ :=?,@Ielts_Minimum_Score_ :=?,@Intake_Id_ :=?,@Internship_Id_ :=?)",
      [
        Country_Id_,
        Subject_Id_,
        Sub_Section_Id_,
        Level_Id_,
        Course_Name_,
        Duration_Id_,
        Ielts_Minimum_Score_,
        Intake_Id_,
        Internship_Id_,
      ],
      callback
    );
  },

  //  Get_Menu_Status:function(Menu_Id_,Login_User_,callback)
  //  {
  //    return db.query("CALL Get_Menu_Status(@Menu_Id_ :=?,@Login_User_:=?)", [Menu_Id_,Login_User_],callback);
  //  }

  Search_Courses_Typeahead: function (Course_Name, callback) {
    if (Course_Name === undefined || Course_Name === "undefined") {
      Course_Name = "";
    } else {
      Course_Name = Course_Name.trim();
    }
    console.log(Course_Name);

    return db.query(
      "CALL Search_Courses_Typeahead(@Course_Name :=?)",
      [Course_Name],
      callback
    );
  },

  Search_Courses_Typeahead_By_User: function (
    Course_Name,
    Login_User,
    callback
  ) {
    if (Course_Name === undefined || Course_Name === "undefined") {
      Course_Name = "";
    } else {
      Course_Name = Course_Name.trim();
    }
    console.log(Course_Name);

    return db.query(
      "CALL Search_Courses_Typeahead_By_User(@Course_Name :=?,@Login_User :=?)",
      [Course_Name, Login_User],
      callback
    );
  },

  Search_Courses_Fees_Typeahead: function (Course_Name, Student_Id, callback) {
    if (Course_Name === undefined || Course_Name === "undefined")
      Course_Name = "";
    return db.query(
      "CALL Search_Courses_Fees_Typeahead(@Course_Name :=?,@Student_Id :=?)",
      [Course_Name, Student_Id],
      callback
    );
  },
};
module.exports = Course;
