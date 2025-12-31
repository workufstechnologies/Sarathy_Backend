var http = require("http");
var server = http.Server(app);
var apppath = "/";
//var apppath = '/';
var socketIO = require("socket.io");
var db = require('./dbconnection');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const port = process.env.PORT || 2225;
//require('dotenv').config();
const cron = require("node-cron");
const fetch = require('node-fetch');
const fs = require('fs');
process.env.SENDGRID_API_KEY =
  "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";
var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var multer = require("multer");
var multerupload = multer({ dest: "fileprint/" });
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var cors = require("cors");
const jwt = require("./helpers/jwt");
var routes = require("./routes/index");
const errorHandler = require("./helpers/error-handler");
var storedProcedure = require('./helpers/stored-procedure');

const nodemailer = require('nodemailer');
const helmet = require("helmet");

var Login = require("./routes/Login");
var User_Details = require("./routes/User_Details");
var Country = require("./routes/Country");
var Course = require("./routes/Course");
var Course_Intake = require("./routes/Course_Intake");
var Document = require("./routes/Document");
var Duration = require("./routes/Duration");
var Intake = require("./routes/Intake");
var Internship = require("./routes/Internship");
var Level_Detail = require("./routes/Level_Detail");
var Student = require("./routes/Student");
var Student_Document = require("./routes/Student_Document");
var Student_Message = require("./routes/Student_Message");
var Student_Status = require("./routes/Student_Status");
var Subject = require("./routes/Subject");
var Remarks = require("./routes/Remarks");
var University = require("./routes/University");
var Public_Data = require("./routes/Public_Data");
var Account_Group = require("./routes/Account_Group");
var Client_Accounts = require("./routes/Client_Accounts");
var Agent = require("./routes/Agent");
var Department = require("./routes/Department");
var Department_Status = require("./routes/Department_Status");
var Branch = require("./routes/Branch");
var Brand = require("./routes/Brand");
var DSE = require("./routes/DSE");
var Enquiry_Source = require("./routes/Enquiry_Source");
var Fees = require("./routes/Fees");
var User_Role = require("./routes/User_Role");
var Company = require("./routes/Company");
var Sub_Section = require("./routes/Sub_Section");
var Check_List = require("./routes/Check_List");
var Agent_Details = require("./routes/Agent_Details");
var Task = require("./routes/Task");
var Application_Status = require("./routes/Application_Status");
var Application_Group = require("./routes/Application_Group");
var Accounts = require("./routes/Accounts");
var Class = require("./routes/Class");
var Notes = require("./routes/Notes");
var Chat_Window = require("./routes/Chat_Window");
var Email_Template = require('./routes/Email_Template');
var campaign = require('./routes/campaign');
const Tata_Tele = require("./routes/Tata_Tele.js");
const CallDetails = require("./routes/call_Details.js");
var Enquiry_For = require("./routes/Enquiry_For.js");
var Location = require("./routes/Location.js");

var app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(cors());
app.use(logger("dev"));
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));
app.use(apppath, routes);
app.use(apppath + "Login", Login);
app.use(apppath + "Public_Data", Public_Data);
app.use(apppath + "Account_Group", Account_Group);
app.use(apppath + "Client_Accounts", Client_Accounts);
app.use(apppath + "Agent", Agent);
app.use(apppath + "campaign", campaign);
app.use("/Tata_Tele", Tata_Tele);
app.use("/Call_Details", CallDetails);
var io = socketIO(server);

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", "http:", "https:", "data:", "blob:", "'unsafe-inline'"],
      connectSrc: ["'self'", "wss://24studyabroadnotificationapi.trackbox.live"],
    },
  })
);

io.on("connection", (socket) => {
  console.log("user connected");

  socket.on("new-message", async (message) => {
    var connection;
    try {
      io.emit("new-message", message);
      const pool = db.promise();
      connection = await pool.getConnection();
      console.log("new-message socket values", message);
      const branchId = message.Branch;
      const data = message;
      if (branchId > 0) {
        const [deptStaffRows] = await connection.query(
          `SELECT * FROM user_details
        WHERE Branch_Id = ? AND DeleteStatus = FALSE AND Department_Id = 427
        ORDER BY User_Details_Id DESC LIMIT 1`,
          [branchId]
        );

        const deptStaffData =
          deptStaffRows.length > 0 ? deptStaffRows[0] : null;
        console.log("deptStaffData111", deptStaffData);

        if (deptStaffData) {
          const deptStaffId = deptStaffData.User_Details_Id;
          const From_User = data.To_User;
          const From_User_Name = data.To_User_Name || "System";
          const To_User = deptStaffData.User_Details_Id;
          const To_User_Name_ = deptStaffData.User_Details_Name;
          const Status_Id = data.Status_Id;
          const Student_Id = data.Student_Id;
          const Remark = data.Remark || "";
          const Student_Name = data.Student_Name;
          const Notification_Type_Name_ = "Student Assigned";
          const Entry_Type = 3;

          // 1?? Get next Notification_Id
          const [notificationIdResult] = await connection.query(
            `SELECT COALESCE(MAX(Notification_Id), 0) + 1 AS NextId FROM Notification`
          );
          const Notification_Id_ = notificationIdResult[0].NextId;

          // 2?? Insert new Notification
          await connection.query(
            `INSERT INTO Notification (
                Notification_Id,
                From_User,
                From_User_Name,
                To_User,
                To_User_Name,
                Status_Id,
                View_Status,
                Remark,
                Entry_Date,
                Student_Id,
                Student_Name,
                DeleteStatus,
                Description,
                Entry_Type
              )
              VALUES (?, ?, ?, ?, ?, ?, 1, ?, NOW(), ?, ?, FALSE, ?, ?)`,
            [
              Notification_Id_, // 1. Notification_Id
              From_User, // 2. From_User
              From_User_Name, // 3. From_User_Name
              To_User, // 4. To_User
              To_User_Name_, // 5. To_User_Name
              Status_Id, // 6. Status_Id
              Remark, // 7. Remark (after View_Status = 1)
              Student_Id, // 8. Student_Id
              Student_Name, // 9. Student_Name
              Notification_Type_Name_, // 10. Description
              Entry_Type, // 11. Entry_Type
            ]
          );

          // 3?? Get updated Notification_Count
          const [countResult] = await connection.query(
            `SELECT COALESCE(MAX(Notification_Count), 0) + 1 AS Count FROM User_Details WHERE User_Details_Id = ?`,
            [To_User]
          );
          const Notification_Count_ = countResult[0].Count;

          // 4?? Update User_Details with new count
          await connection.query(
            `UPDATE User_Details SET Notification_Count = ? WHERE User_Details_Id = ?`,
            [Notification_Count_, To_User]
          );

          // 5?? Emit real-time notification
          const message = {
            Student_Name: Student_Name,
            To_User: To_User,
            Student_Id: Student_Id,
          };

          io.emit("new-message", message); // Emit to all � use .to(To_User) if socket rooms used
        }
      }

      try {
        const [bdmuser] = await connection.query(
          `SELECT * FROM user_details
              WHERE DeleteStatus = FALSE AND Department_Id = 434
              order by User_Details_Id desc limit 1`
        );
        console.log("bdmuser", bdmuser);
        const bdmData = bdmuser.length > 0 ? bdmuser[0] : null;
        const From_User = data.To_User;
        const To_User = bdmData.User_Details_Id;
        const Student_Id = data.Student_Id;
        const Student_Name = data.Student_Name;
        const From_User_Name = data.To_User_Name || "System";
        const To_User_Name_ = bdmData.User_Details_Name;
        const Status_Id = data.Status_Id;
        const Remark = data.Remark || "";
        const Notification_Type_Name_ = "Student Assigned";
        const Entry_Type = 3;

        // 1?? Get next Notification_Id
        const [notificationIdResult] = await connection.query(
          `SELECT COALESCE(MAX(Notification_Id), 0) + 1 AS NextId FROM Notification`
        );
        const Notification_Id_ = notificationIdResult[0].NextId;
        console.log("Notification_Id_", Notification_Id_);

        // 2?? Insert new Notification
        await connection.query(
          `INSERT INTO Notification (
                Notification_Id,
                From_User,
                From_User_Name,
                To_User,
                To_User_Name,
                Status_Id,
                View_Status,
                Remark,
                Entry_Date,
                Student_Id,
                Student_Name,
                DeleteStatus,
                Description,
                Entry_Type
              )
              VALUES (?, ?, ?, ?, ?, ?, 1, ?, NOW(), ?, ?, FALSE, ?, ?)`,
          [
            Notification_Id_, // 1. Notification_Id
            From_User, // 2. From_User
            From_User_Name, // 3. From_User_Name
            To_User, // 4. To_User
            To_User_Name_, // 5. To_User_Name
            Status_Id, // 6. Status_Id
            Remark, // 7. Remark (after View_Status = 1)
            Student_Id, // 8. Student_Id
            Student_Name, // 9. Student_Name
            Notification_Type_Name_, // 10. Description
            Entry_Type, // 11. Entry_Type
          ]
        );

        // 3?? Get updated Notification_Count
        const [countResult] = await connection.query(
          `SELECT COALESCE(MAX(Notification_Count), 0) + 1 AS Count FROM User_Details WHERE User_Details_Id = ?`,
          [To_User]
        );
        const Notification_Count_ = countResult[0].Count;

        // 4?? Update User_Details with new count
        await connection.query(
          `UPDATE User_Details SET Notification_Count = ? WHERE User_Details_Id = ?`,
          [Notification_Count_, To_User]
        );
        const bdmmessage = {
          Student_Name: Student_Name,
          To_User: To_User,
          Student_Id: Student_Id,
        };

        io.emit("new-message", bdmmessage);
      } catch (err) {
        console.log("Error in fetching BDM user:", err);

        console.error("Error in fetching BDM user:", err);
      }
    } catch (err) {
      console.error("Error in new-message socket:", err);
    } finally {
      if (connection) connection.release();
    }
  });
});

app.listen(port, () => {
  console.log(`started on port: ${port}`);
});


app.post("/Post_GoogleSheet_Campaign_Lead/", async function (req, res) {
  var connection;
  try {
    const lead = req.body.data;
    const pool = db.promise();
    connection = await pool.getConnection();
    console.log("Sheet Name:", req.body.name);

    const payload = {
      // Existing fields
      Student_Name_: lead["full_name"]
        ? lead["full_name"].toString().trim()
        : "",
      Phone_Number_: lead["phone\r\n"]
        ? lead["phone\r\n"].toString().trim()
        : lead["phone"]
          ? lead["phone"].toString().trim()
          : "",
      Destinatnion_: lead["your_preferred_study_destination"]
        ? lead["your_preferred_study_destination"].toString().trim()
        : "",
      preferred_course_: lead["preferred_course"]
        ? lead["preferred_course"].toString().trim()
        : "",
      email_: lead["email"]
        ? lead["email"].toString().trim()
        : "",
      followupdate_: lead["created_time"]
        ? lead["created_time"].toString().trim()
        : "",

      location_: lead["city"] ? lead["city"].toString().trim() : "",
      have_ielts: lead["do_you_have_ielts?"]
        ? lead["do_you_have_ielts?"].toString().trim()
        : null,
      need_scholarship_help: lead[
        "do_you_require_assistance_with_scholarship_or_funding_opportunities?"
      ]
        ? lead[
          "do_you_require_assistance_with_scholarship_or_funding_opportunities?"
        ]
          .toString()
          .trim()
        : null,
      preferred_degree: lead["which_degree_do_you_want_to_pursue?"]
        ? lead["which_degree_do_you_want_to_pursue?"].toString().trim()
        : null,

      ad_id: lead["ad_id"] ? lead["ad_id"].toString().trim() : null,
      ad_name: lead["ad_name"] ? lead["ad_name"].toString().trim() : null,
      adset_id: lead["adset_id"] ? lead["adset_id"].toString().trim() : null,
      adset_name: lead["adset_name"]
        ? lead["adset_name"].toString().trim()
        : null,
      campaign_id: lead["campaign_id"]
        ? lead["campaign_id"].toString().trim()
        : null,
      campaign_name: lead["campaign_name"]
        ? lead["campaign_name"].toString().trim()
        : null,
      form_id: lead["form_id"] ? lead["form_id"].toString().trim() : null,
      form_name: lead["form_name"] ? lead["form_name"].toString().trim() : null,
      is_organic: lead["is_organic"]
        ? lead["is_organic"].toString().toLowerCase() === "true"
          ? 1
          : 0
        : 0,
      platform: lead["platform"] ? lead["platform"].toString().trim() : null,
    };
    console.log("Lead Data:", payload);

    let lt = await new storedProcedure(
      "Post_GoogleSheet_Campaign_Lead",
      [
        payload.Student_Name_,
        payload.Phone_Number_,
        payload.Destinatnion_,
        payload.preferred_course_,
        payload.email_,
        payload.followupdate_,
        payload.location_,
        payload.have_ielts,
        payload.need_scholarship_help,
        payload.preferred_degree,
        payload.ad_id,
        payload.ad_name,
        payload.adset_id,
        payload.adset_name,
        payload.campaign_id,
        payload.campaign_name,
        payload.form_id,
        payload.form_name,
        payload.is_organic,
        payload.platform,
        payload.interested_in_scholarship,
      ],
      connection
    ).result();

    console.log("lt: ", lt);
    res.json({ success: true });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false });
  } finally {
    if (connection) connection.release();
  }
});

app.post("/Post_Webpage_GoogleSheet_Lead/", async function (req, res) {
  var connection;
  try {
    const lead = req.body.data;
    const pool = db.promise();
    connection = await pool.getConnection();
    console.log("Sheet Name:", req.body.name);

    const payload = {
      // Existing fields
      followupdate_: lead["Timestamp?"]
        ? lead["Timestamp?"].toString().trim()
        : null,
      Student_Name_: lead["Name"]
        ? lead["Name"].toString().trim()
        : "",
      Phone_Number_: lead["Mobile Number\r\n"]
        ? lead["Mobile Number\r\n"].toString().trim()
        : lead["Mobile Number"]
          ? lead["Mobile Number"].toString().trim()
          : "",
      Email_: lead["Email"] ? lead["Email"].toString().trim() : "",
      Destination_: lead["Your preferred study destination?"]
        ? lead["Your preferred study destination?"].toString().trim()
        : null,
      campaign_id_: lead["campaign_id"]
        ? lead["campaign_id"].toString().trim()
        : "1234567890",
      campaign_name_: lead["campaign_name"]
        ? lead["campaign_name"].toString().trim()
        : "Website"
    };
    console.log("Lead Data:", payload);
    let lt = await new storedProcedure(
      "Post_Webpage_GoogleSheet_Lead",
      [
        payload.Student_Name_,
        payload.Phone_Number_,
        payload.Destination_,
        payload.Email_,
        payload.followupdate_,
        payload.campaign_id_,
        payload.campaign_name_
      ],
      connection
    ).result();

    console.log("lt: ", lt);
    res.json({ success: true });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false });
  } finally {
    if (connection) connection.release();
  }
});

app.use(jwt());

//app.use(SESClient)
app.use(apppath + "User_Details", User_Details);
app.use(apppath + "Country", Country);
app.use(apppath + "Course", Course);
app.use(apppath + "Course_Intake", Course_Intake);
app.use(apppath + "Document", Document);
app.use(apppath + "Duration", Duration);
app.use(apppath + "Intake", Intake);
app.use(apppath + "Internship", Internship);
app.use(apppath + "Level_Detail", Level_Detail);
app.use(apppath + "Student", Student);
app.use(apppath + "Student_Document", Student_Document);
app.use(apppath + "Student_Message", Student_Message);
app.use(apppath + "Student_Status", Student_Status);
app.use(apppath + "Subject", Subject);
app.use(apppath + "Remarks", Remarks);
app.use(apppath + "Enquiry_Source", Enquiry_Source);
app.use(apppath + "University", University);
app.use(apppath + "Department", Department);
app.use(apppath + "Department_Status", Department_Status);
app.use(apppath + "Branch", Branch);
app.use(apppath + "Brand", Brand);
app.use(apppath + "DSE", DSE);
app.use(apppath + "Fees", Fees);
app.use(apppath + "User_Role", User_Role);
app.use(apppath + "Company", Company);
app.use(apppath + "Sub_Section", Sub_Section);
app.use(apppath + "Check_List", Check_List);
app.use(apppath + "Agent_Details", Agent_Details);
app.use(apppath + "Task", Task);
app.use(apppath + "Application_Status", Application_Status);
app.use(apppath + "Application_Group", Application_Group);
app.use(apppath + "Accounts", Accounts);
app.use(apppath + "Class", Class);
app.use(apppath + "Notes", Notes);
app.use(apppath + "Chat_Window", Chat_Window);
app.use(apppath + "Email_Template", Email_Template);
app.use(apppath + 'Enquiry_For',Enquiry_For);
app.use(apppath + "Location",Location);

app.use(function (req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

var Get_Automatic_Mails = function (callback) {
  return db.query("CALL Get_Automatic_Mails()", [], callback);
};

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = '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';

const { CronJob } = require('cron');
const sendVisaEmailQuery = () => {
  return new Promise((resolve, reject) => {
    db.query("CALL Send_Visa_Email()", [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};
let isRunning = false;
const sendVisaMailJob = new CronJob('0 10 * * *', async () => {
  if (isRunning) return;
  isRunning = true;

  try {
    const rows = await sendVisaEmailQuery();
    const students = rows[0];

    if (!students || students.length === 0) {
      console.log("No students to email.");
      return;
    }

    await Promise.all(
      students.map(async (student) => {
        const emailHtml = `
            <table style='width:100%; border-collapse: collapse;'>
              <tr><td>Hello,</td></tr>
              <tr><td style='padding:5px'>This is a reminder regarding visa approval follow-up for the following student:</td></tr>
              <tr><td style='padding:10px'><strong>Name:</strong> ${student.Student_Name}</td></tr>
              <tr><td style='padding:10px'><strong>Phone:</strong> ${student.Phone_Number}</td></tr>
              <tr><td style='padding:10px'><strong>Email:</strong> ${student.User_Email}</td></tr>
              <tr><td style='padding:10px'>Please check and update the visa status in Trackbox.</td></tr>
              <tr><td style='padding:10px'><a href='https://aimbritzapi.trackbox.live/#/Student'>Go to Trackbox</a></td></tr>
              <tr><td>Do not reply to this email.</td></tr>
            </table>
          `;

        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

        sendSmtpEmail.subject = "Visa Follow-Up Required";
        sendSmtpEmail.htmlContent = emailHtml;
        sendSmtpEmail.sender = {
          email: "ufsdev123@gmail.com",
          name: "UFS Technologies",
        };
        sendSmtpEmail.to = [
          {
            email: student.User_Email,
            name: student.Student_Name,
          },
        ];

        try {
          await apiInstance.sendTransacEmail(sendSmtpEmail);
          console.log("? Email sent to", student.User_Email);
        } catch (err) {
          console.error("? Failed to send:", err.message || err);
        }
      })
    );
  } catch (error) {
    console.error("Cron job execution error:", error);
  } finally {
    isRunning = false;
  }
},
  null,
  true,
  'Asia/Kolkata'
);
sendVisaMailJob.start();

console.log("Visa reminder cron job started. Will run daily at 10:00 AM.");

app.get("Edabraod/", (req, res) => {
  res.send("Hello World!");
});

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
module.exports = app;