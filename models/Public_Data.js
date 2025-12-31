var db=require('../dbconnection');
// const { SESClient, SendEmailCommand  } = require("@aws-sdk/client-ses");

//import { SESClient, CloneReceiptRuleSetCommand } from "@aws-sdk/client-ses";
//var base64Img = require('base64-img');
var fs = require('fs');
//const AWS = require('aws-sdk');
// const AWS = require("@aws-sdk/client-ses");//require('aws-sdk');
const storedProcedure=require('../helpers/stored-procedure');
const nodemailer = require("nodemailer");
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

var base64str = base64_encode("companylogo.PNG");

// process.env.AWS_SES_REGION='us-east-2';
// process.env.AWS_SECRET_ACCESS_KEY='WyyQ8pRH6y6fpCcrT7XTS7MfeBr8Sa04U/2D9Nwb';
// process.env.AWS_ACCESS_KEY_ID='AKIAX37YDYI4OSIHXSED';
// Amazon SES configuration
// const sesClient = new SESClient({ region: process.env.AWS_SES_REGION });

// const ses = new AWS.SES({
//   apiVersion: "2010-12-01",
//   region: process.env.AWS_SES_REGION,
// });
// const SESConfig = {
//   apiVersion: '2010-12-01',
//   accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
//   region: process.env.AWS_SES_REGION
// };

// let aws = require("@aws-sdk/client-ses");
// configure AWS SDK
// process.env.AWS_ACCESS_KEY_ID = "....";
// process.env.AWS_SECRET_ACCESS_KEY = "....";
// const ses = new aws.SES({
//   apiVersion: "2010-12-01",
//   region: "us-east-1",
// });

// create Nodemailer SES transporter
// let transporter = nodemailer.createTransport({
//   SES: { ses, aws },
// });

function base64_encode(file) {
 
 var bitmap = fs.readFileSync(file);
 return new Buffer.from(bitmap).toString("base64");
}
var Public_Data=
{ 

  Save_Student_Course: async function (Student_Course_Apply_) {
  const pool = db.promise();
  let connection;

  try {
    connection = await pool.getConnection();

    const Course_Apply = Student_Course_Apply_.Course_Apply;

    const result1 = await new storedProcedure(
      'Save_Student_Course',
      [0, Student_Course_Apply_.Student_Id, Course_Apply, Student_Course_Apply_.Login_Id],
      connection
    ).result();

    const result2 = await new storedProcedure('Load_Company', [], connection).result();
    const result3 = await new storedProcedure('Load_User', [Student_Course_Apply_.Login_Id], connection).result();

    // Build course details HTML (`a`) here as in your code
    let a = "<table style='border-collapse: collapse; border-spacing: 0; vertical-align: top; width:100%;'>";
    let b = "";

    for (let i = 0; i < result1.length; i++) {
      const course = result1[i];
      b += `
        <tr style="background:#1d5ea0; color:#eef0f0; font-weight:bold;"><td style="padding:5px;">Course</td><td>${course.Course_Name}</td></tr>
        <tr><td style="padding:5px;">Country</td><td>${course.Country_Name}</td></tr>
        <tr><td style="padding:5px;">University</td><td>${course.University_Name}</td></tr>
        <tr><td style="padding:5px;">Application Fees</td><td>${course.Application_Fees}</td></tr>
        <tr><td style="padding:5px;">Tuition Fees</td><td>${course.Tution_Fees}</td></tr>
        <tr><td style="padding:5px;">Entry Requirements</td><td>${course.Entry_Requirement}</td></tr>
        <tr><td style="padding:5px;">Level</td><td>${course.Level_Detail_Name}</td></tr>
        <tr><td style="padding:5px;">Duration</td><td>${course.Duration_Name}</td></tr>
        <tr><td style="padding:5px;">Intake</td><td>${course.intake_Name}</td></tr>
        <tr><td style="padding:5px;">IELTS</td><td>${course.Ielts_Name}</td></tr>
        <tr><td style="padding:5px;">Course Link</td><td>${course.Notes}</td></tr>
      `;

      if (Student_Course_Apply_.expense_include) {
        b += `<tr><td style="padding:5px;font-weight:bold;">Expense Details</td><td></td></tr>`;
        if (course.Registration_Fees)
          b += `<tr><td>Registration Fees</td><td>${course.Registration_Fees}</td></tr>`;
        if (course.Date_Charges)
          b += `<tr><td>Date Charges</td><td>${course.Date_Charges}</td></tr>`;
        if (course.Bank_Statements)
          b += `<tr><td>Bank Statements</td><td>${course.Bank_Statements}</td></tr>`;
        if (course.Insurance)
          b += `<tr><td>Insurance</td><td>${course.Insurance}</td></tr>`;
        if (course.VFS_Charges)
          b += `<tr><td>VFS Charges</td><td>${course.VFS_Charges}</td></tr>`;
        if (course.Apostille)
          b += `<tr><td>Apostille</td><td>${course.Apostille}</td></tr>`;
        if (course.Other_Charges)
          b += `<tr><td>Other Charges</td><td>${course.Other_Charges}</td></tr>`;
      }

      if (course.Details) {
        b += `<tr><td>Details</td><td>${course.Details.replace(/(?:\r\n|\r|\n)/g, '<br>')}</td></tr>`;
      }
    }

    a += b + "</table>";

    // Email setup
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: 'teena@ufstechnologies.com',
        pass: 'teena1225' // ⚠️ use process.env in production
      }
    });

    const msg = {
      to: result1[0].Email,
      from: 'hr@ufstechnologies.com',
      subject: 'Course details',
      attachments: [
        {
          filename: 'companylogo.PNG',
          type: 'image/PNG',
          content_id: 'myimagecid',
          content: base64str, // ⚠️ ensure this is defined
          disposition: 'inline'
        }
      ],
      html: generateCourseHTML(result1[0], result2[0], result3[0], a)
    };

    const d = await sgMail.send(msg);
    console.log("📨 Email sent:", d);

    connection.release();
    return result1;
  } catch (err) {
    if (connection) connection.release();
    console.error("❌ Save_Student_Course error:", err);
    throw err;
  }
},

  Save_Front_Student: async function (Student_) {
      console.log(Student_.Application_Details_Data)
      console.log(Student_)
      return new Promise(async (rs, rej) => {
       const pool = db.promise();
       let result1;
       var connection = await pool.getConnection();

     
       try {
       const result1 = await new storedProcedure(
     "Save_Front_Student1",
     [
     
      Student_.Unique_Id,
      Student_.Student_Name,
      Student_.Dob,
      Student_.Address1,
      Student_.Telephone,
      Student_.Guardian_telephone,
      Student_.Email,
      Student_.Marital_Status_Id ,
      Student_.Marital_Status_Name,
      Student_.Spouse_Name,
      Student_.No_Of_Kids_And_Age,
      Student_.Date_Of_Marriage,
      Student_.Spouse_Occupation,
      Student_.Spouse_Qualification,
      Student_.Any_Previous_Visa,
      Student_.Ielts,
      Student_.Ielts_Type_Id,
      Student_.Taken_Date,
      Student_.Exam_Check,
      Student_.Listening,
      Student_.Reading,
      Student_.Writing,
      Student_.Speaking,
      Student_.Overall,
      Student_.Description,
      JSON.stringify(Student_.Student_Experience_Data),
      JSON.stringify(Student_.Qualification_Data),
      JSON.stringify(Student_.Application_Details_Data),
      
    
     ],
     connection
       ).result();
       await connection.commit();
       connection.release();
       rs(result1);
       } catch (err) {
     ;
       await connection.rollback();
       rej(err);
       }
      });
      },
    Get_Fornt_Student_Dropdowns:function(callback)
      { 
      return db.query("CALL Get_Fornt_Student_Dropdowns()",[],callback);
      },

      Get_Student_Fill_Check:function(rstring_,callback)
      { 
     return db.query("CALL Get_Student_Fill_Check(@rstring_ :=?)",[rstring_],callback);
      }
      ,
    
Save_Student_Course_ed: async function (Student_Course_Apply_) {
  const pool = db.promise();
  let connection;

  try {
    connection = await pool.getConnection();

    const Course_Apply = Student_Course_Apply_.Course_Apply;

    const result1 = await new storedProcedure(
      'Save_Student_Course',
      [0, Student_Course_Apply_.Student_Id, Course_Apply, Student_Course_Apply_.Login_Id],
      connection
    ).result();

    const result2 = await new storedProcedure('Load_Company', [], connection).result();
    const result3 = await new storedProcedure('Load_User', [Student_Course_Apply_.Login_Id], connection).result();

    sgMail.setApiKey(result3[0].FollowUp_Target);

    let a = "<table style='border-collapse: collapse; border-spacing: 0; vertical-align: top; width:100%;'>";
    let b = "";

    for (let i = 0; i < result1.length; i++) {
      const course = result1[i];

      b += `
        <tr style='background:#1d5ea0;color:#eef0f0; font-weight:bold;'>
          <td style='padding:5px;'>Course</td><td style='padding:5px'>${course.Course_Name}</td>
        </tr>
        <tr><td style='padding:5px'>Country</td><td style='padding:5px'>${course.Country_Name}</td></tr>
        <tr><td style='padding:5px'>University</td><td style='padding:5px'>${course.University_Name}</td></tr>
        <tr><td style='padding:5px'>Application Fees</td><td style='padding:5px'>${course.Application_Fees}</td></tr>
        <tr><td style='padding:5px'>Tuition Fees</td><td style='padding:5px'>${course.Tution_Fees}</td></tr>
        <tr><td style='padding:5px'>Entry Requirements</td><td style='padding:5px'>${course.Entry_Requirement}</td></tr>
        <tr><td style='padding:5px'>Level</td><td style='padding:5px'>${course.Level_Detail_Name}</td></tr>
        <tr><td style='padding:5px'>Duration</td><td style='padding:5px'>${course.Duration_Name}</td></tr>
        <tr><td style='padding:5px'>Intake</td><td style='padding:5px'>${course.intake_Name}</td></tr>
        <tr><td style='padding:5px'>IELTS</td><td style='padding:5px'>${course.Ielts_Name}</td></tr>
        <tr><td style='padding:5px'>Course Link</td><td style='padding:5px'>${course.Notes}</td></tr>
      `;

      if (Student_Course_Apply_.expense_include === true) {
        b += `<tr><td style='padding:5px;font-weight:bold;'>Expense Details</td><td></td></tr>`;
        if (course.Registration_Fees)
          b += `<tr><td>Registration Fees</td><td>${course.Registration_Fees}</td></tr>`;
        if (course.Date_Charges)
          b += `<tr><td>Date Charges</td><td>${course.Date_Charges}</td></tr>`;
        if (course.Bank_Statements)
          b += `<tr><td>Bank Statements</td><td>${course.Bank_Statements}</td></tr>`;
        if (course.Insurance)
          b += `<tr><td>Insurance</td><td>${course.Insurance}</td></tr>`;
        if (course.VFS_Charges)
          b += `<tr><td>VFS Charges</td><td>${course.VFS_Charges}</td></tr>`;
        if (course.Apostille)
          b += `<tr><td>Apostille</td><td>${course.Apostille}</td></tr>`;
        if (course.Other_Charges)
          b += `<tr><td>Other Charges</td><td>${course.Other_Charges}</td></tr>`;
      }

      if (course.Details) {
        b += `<tr><td>Details</td><td>${course.Details.replace(/(?:\r\n|\r|\n)/g, '<br>')}</td></tr>`;
      }
    }

    a += b + "</table>";

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: result3[0].Email,
        pass: '@infedabroad10' // ⚠️ Should be in environment variable
      }
    });

    const msg = {
      to: result1[0].Email,
      from: result3[0].Email,
      subject: 'Course details',
      attachments: [
        {
          filename: 'companylogo.PNG',
          type: 'image/PNG',
          content_id: 'myimagecid',
          content: base64str, // ⚠️ Make sure this is defined
          disposition: 'inline'
        }
      ],
      html: buildEmailHtml(result1[0], result2[0], result3[0], a)
    };

    const sendResult = await sgMail.send(msg);
    console.log("✅ Email sent:", sendResult);

    connection.release();
    rs(result1);
  } catch (err) {
    if (connection) connection.release();
    console.error("❌ Error in Save_Student_Course_ed:", err);
    rej(err);
  }
},
  Post_FB_Lead: function (Lead_, callback) {    
    return db.query(
      "CALL Post_FB_Lead(@Student_Name_ :=?,@Phone_Number_ :=?)",
      [Lead_.Student_Name,Lead_.Phone_Number],
      callback
    );
  }, 
  Save_Student_Coursetest: async function (Student_Course_Apply_) {
   // let testAccount = await nodemailer.createTestAccount();
   
    // create Nodemailer SES transporter
    let transporter = nodemailer.createTransport({
      SES: { ses, AWS },
    });

      // send mail with defined transport object
  let info = await transporter.sendMail({
    from: 'sudheesh@ufstechnologies.com', // sender address
    to: "sudheesh@ufstechnologies.com" ,// list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
  });
  },
  Save_Student_Course33: async function (Student_Course_Apply_) {
    return new Promise(async (rs, rej) => {
      const pool = db.promise();
      var connection = await pool.getConnection();
      var Course_Apply = Student_Course_Apply_.Course_Apply;
      try {
        const result1 = await (new storedProcedure('Save_Student_Course', [0, Student_Course_Apply_.Student_Id,
          Course_Apply,Student_Course_Apply_.Login_Id], connection)).result();

        const result2 = await (new storedProcedure('Load_Company', [], connection)).result();
        const result3 = await (new storedProcedure('Load_User', [Student_Course_Apply_.Login_Id], connection)).result();
       var a = "<table style='border-collapse: collapse;  border-spacing: 0; vertical-align: top;  width:100%; ' >"
        var b = ""
        for (var i = 0; i < result1.length; i++) 
        {
          b = b 
          +"<tr  style = 'background:#1d5ea0;color:#eef0f0; font-weight:bold; width:100%; '><td style='padding:5px; '> Course </td>"

          +"<td style='padding:5px' >" + result1[i].Course_Name + "</td></tr>"
           + "<tr><td style='padding:5px'> Country </td><td style='padding:5px'>" +result1[i].Country_Name + "</td></tr>" 
           + "<tr><td style='padding:5px'> University </td><td style='padding:5px'>"+ result1[i].University_Name + "</td><td>" 
          + "<tr><td style='padding:5px'> Application Fees </td><td style='padding:5px'>"+ result1[i].Application_Fees + "</td><td>"
           + "<tr><td style='padding:5px'> Tuition Fees </td><td style='padding:5px'>"+ result1[i].Tution_Fees + "</td><td>" 
           + "<tr><td style='padding:5px'> Entry Requirements </td><td style='padding:5px'>"+ result1[i].Entry_Requirement + "</td><td>" 
           + "<tr><td style='padding:5px'> Level </td><td style='padding:5px'>"+ result1[i].Level_Detail_Name + "</td><td>"
           + "<tr><td style='padding:5px'> Duration </td><td style='padding:5px'>"+ result1[i].Duration_Name + "</td><td>"
           + "<tr><td style='padding:5px'> Intake </td><td style='padding:5px'>"+ result1[i].intake_Name + "</td><td>" 
           + "<tr><td style='padding:5px'> IELTS </td><td style='padding:5px'>"+ result1[i].Ielts_Name + "</td><td>"
           + "<tr><td style='padding:5px'> Course link </td><td style='padding:5px'>"+ result1[i].Notes + "</td></tr>"
          
           if(Student_Course_Apply_.expense_include==true){
            b=b + "<tr><td style='padding:5px;font-weight:bold;'> Expense Details </td><td style='padding:5px'></td></tr>"
            if(result1[i].Registration_Fees!=undefined)
            b=b + "<tr><td style='padding:5px'> Registration Fees  </td><td style='padding:5px'>"+ result1[i].Registration_Fees + "</td></tr>"
            if(result1[i].Date_Charges!=undefined)
            b=b + "<tr><td style='padding:5px'> Date Charges </td><td style='padding:5px'>"+ result1[i].Date_Charges + "</td></tr>"
            if(result1[i].Bank_Statements!=undefined)
            b=b + "<tr><td style='padding:5px'> Bank Statements</td><td style='padding:5px'>"+ result1[i].Bank_Statements + "</td></tr>"
            if(result1[i].Insurance!=undefined)
            b=b + "<tr><td style='padding:5px'> Insurance </td><td style='padding:5px'>"+ result1[i].Insurance + "</td></tr>"
            if(result1[i].VFS_Charges!=undefined)
            b=b + "<tr><td style='padding:5px'> VFS Charges </td><td style='padding:5px'>"+ result1[i].VFS_Charges + "</td></tr>"
            if(result1[i].Apostille!=undefined)
            b=b + "<tr><td style='padding:5px'> Apostille </td><td style='padding:5px'>"+ result1[i].Apostille + "</td></tr>"
            if(result1[i].Other_Charges!=undefined)
            b=b + "<tr><td style='padding:5px'> Other Charges </td><td style='padding:5px'>"+ result1[i].Other_Charges + "</td></tr>"
           }            
           if(result1[i].Details!=null)           
           b=b+ "<tr><td style='padding:5px'>Details </td><td> "+ result1[i].Details.replace(/(?:\r\n|\r|\n)/g, '<br>') + "</td><td>" 
             + "<tr><td style='padding:5px'>  </td><td style='padding:5px'>"+  "</td></tr>"
             console.log(result1[i].Details )
        }
        a = a + b + "</table>"
        let transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          requireTLS: true,
          auth: 
          {
            user: 'teena@ufstechnologies.com',
            pass: 'teena1225'
          }
        });

      const msg = 
        {
          to: result1[0].Email,
          from: 'hr@ufstechnologies.com', // Change to your verified sender
          subject: 'Course details',
          attachments: [
           {
             filename:     'companylogo.PNG',          
             type:  'image/PNG',
             content_id:   'myimagecid',
             content:      base64str ,
             disposition : "inline"
           }], 
          html: ''
          }
           var html= "<table><tr><td><div class='gmail_quote'>"
  + "<br>" 
  + "<u></u>"
  + "<div style='margin: 0; padding: 0; background-color: #f2f2f2;'> "
    + "<table style='border-collapse: collapse; table-layout: fixed; border-spacing: 0; vertical-align: top; min-width: 320px; margin: 0 auto; background-color: #f2f2f2; width: 100%;' cellspacing='0' cellpadding='0'> "
      + "<tbody> "
        + "<tr style='vertical-align: top;'> "
          + "<td style='word-break: break-word; border-collapse: collapse!important; vertical-align: top;'> "
            + "<div style='padding: 10px 0px 0px; background-color: transparent;'>"
              + "<div style='margin: 0 auto; min-width: 320px; max-width: 550px; word-wrap: break-word; word-break: break-word; background-color: transparent;'>"
                + "<div style='border-collapse: collapse; display: table; width: 100%; background-color: transparent;'>"
                  + "<div style='max-width: 320px; min-width: 550px; display: table-cell; vertical-align: top;'>"
                    + "<div style='width: 100%!important;'>"
                      + "<div style='padding: 0px; border: 0px solid transparent;'>"
                        + "<table id='u_content_image_1' style='font-family: arial,helvetica,sans-serif;' role='presentation' border='0' width='100%' cellspacing='0' cellpadding='0'>"
                          + "<tbody>"
                            + "<tr>"
                              + "<td style='word-break: break-word; padding: 10px; font-family: arial,helvetica,sans-serif;' align='left'>"
                                + "<table border='0' width='100%' cellspacing='0' cellpadding='0'>"
                                  + "<tbody>"
                                    + "<tr>"
                                      + "<td style='padding-right: 0px; padding-left: 0px;' align='left'>"
                                        + "<a href='' rel='noopener' target='_blank' data-saferedirecturl=''>"
                                        +"<img src='cid:myimagecid' alt=''/>  "
                                        + "</a>"
                                      + "</td>"
                                    + "</tr>"
                                  + "</tbody>"
                                + "</table>"
                              + "</td>"
                            + "</tr>"
                          + "</tbody>"
                        + "</table>"
                      + "</div>"
                    + "</div>"
                  + "</div>"
                + "</div>"
              + "</div>"
            + "</div>"
            + "<div style='padding: 0px 0px 10px; background-color: transparent;'>"
              + "<div style='margin: 0 auto; min-width: 320px; max-width: 550px; word-wrap: break-word; word-break: break-word; background-color: transparent;'>"
                + "<div style='border-collapse: collapse; display: table; width: 100%; background-color: transparent;'>"
                  + "<div style='max-width: 320px; min-width: 550px; display: table-cell; vertical-align: top;'>"
                    + "<div style='background-color: #ffffff; width: 100%!important;'>"
                      + "<div style='padding: 25px; border-top: 5px solid #000000; border-left: 0px solid transparent; border-right: 0px solid transparent; border-bottom: 0px solid transparent;'>"
                        + "<table id='u_content_text_3' style='font-family: arial, helvetica, sans-serif; height: 451px; width: 100%;' role='presentation' border='0' width='100%' cellspacing='0' cellpadding='0'>"
                          + "<tbody>"
                            + "<tr style='height: 451px;'>"
                              + "<td style='word-break: break-word; padding: 10px 10px 20px; font-family: arial, helvetica, sans-serif; height: 451px;' align='left'>"
                                + "<div style='color: #000000; line-height: 170%; text-align: left; word-wrap: break-word;'>"
                                  + "<p style='font-size: 14px; line-height: 170%;'>"
                                    + "<span >"
                                      + "<strong>"
                                        + "<span style='font-size: 16px; color: #003399; line-height: 27.2px;'>Hi "+ result1[0].Student_Name +",<br/></span>"
                                          + "</strong>"
                                         + "<span style='font-size: 16px; line-height: 27.2px;'>Greetings from "+ result2[0].companyname+", Thank you for your enquiry with us. Please find the program details below</span>"
                                            + "</span>"
                                            + "</p>"                                        
                                            + "</p>"
                                           + "<p style='color: #003399; font-size: 14px; line-height: 170%;'>"
                                            + "<strong>Course Details</strong>"
                                            + "<hr>"
                                           +a                               
                                           + "<p style='font-size: 11px; line-height: 160%;'>"
                                           + "<span style='font-size: 14px; line-height: 25.6px; color: #072361; font-weight:bold;'> Thanks and regards,<br/></span> "
                                           + "<span style='font-size: 14px; line-height: 25.6px; color: #072361;  '> "
                                           + result3[0].User_Details_Name + "<br/>" +result2[0].Mobile
                                           +" </span> "
                                           + "</p>"
                                            + "</p>"
                                            + "</div>"
                                            + "</td>"
                                            + "</tr>"
                                            + "</tbody>"
                                            + "</table>"                        
                                            + "<br>"
                                            + "</div>"
                                            + "</div>"
                                            + "</div>"
                                            + "</div>"
                                            + "</div>"
                                            + "</div>"
                                            + "<div style='padding: 0px; background-color: transparent;'>"
                                            + "<div style='margin: 0 auto; min-width: 320px; max-width: 550px; word-wrap: break-word; word-break: break-word; background-color: transparent;'>"
                                            + "<div style='border-collapse: collapse; display: table; width: 100%; background-color: transparent;'>"
                                            + "<div style='max-width: 320px; min-width: 600px; display: table-cell; vertical-align: top;'>"
                                            + "<div style='width: 100%!important;'>"
                                            + "<div style='padding: 0px; border: 0px solid transparent;'>"
                                            + "<table style='font-family: 'Cabin',sans-serif;' role='presentation' border='0' width='100%' cellspacing='0' cellpadding='0'>"
                                            + "<tbody>"
                                            + "<tr>"
                                            + "<td style='word-break: break-word; padding: 41px 55px 18px; font-family: 'Cabin',sans-serif;' align='left'>"
                                            + "<div style='color: #003399; line-height: 160%; text-align: center; word-wrap: break-word;'>"
                                            + "<p style='font-size: 14px; line-height: 50%;'>"
                                            + "<span style='font-size: 16px; line-height: 25.6px; color: #000000;'> "
                                           + result2[0].companyname  + "<br/>"  + result2[0].Address1 + "<br/>" +result2[0].Address2 + "<br/>" +result2[0].Address3
                                            
                                            + "</span>"
                                            + "</p>"
                                            + "</div>"
                                            + "</td>"
                                            + "</tr>"
                                            + "</tbody>"
                                            + "</table>"
                                            + "<table style='font-family: 'Cabin',sans-serif;' role='presentation' border='0' width='100%' cellspacing='0' cellpadding='0'>"
                                            + "<tbody>"
                                            + "<tr>"
                                            + "<td style='word-break: break-word; padding: 10px 10px 33px; font-family: 'Cabin',sans-serif;' align='left'>"
                                            + "<div align='center'>"
                                            + "<div style='display: table; max-width: 244px;'>"
                                            + "<table style='border-collapse: collapse; table-layout: fixed; border-spacing: 0; vertical-align: top; margin-right: 17px;' border='0' width='32' cellspacing='0' cellpadding='0' align='left'>"
                                            + "<tbody>"
                                            + "<tr style='vertical-align: top;'>"
                                            + "<td style='word-break: break-word; border-collapse: collapse!important; vertical-align: top;' align='left' valign='middle'>"
                                            + "</td>"
                                            + "</tr>"
                                            + "</tbody>"
                                            + "</table>"
                                            + "<table style='border-collapse: collapse; table-layout: fixed; border-spacing: 0; vertical-align: top; margin-right: 17px;' border='0' width='32' cellspacing='0' cellpadding='0' align='left'>"
                                            + "<tbody>"
                                            + "<tr style='vertical-align: top;'>"
                                            + "<td style='word-break: break-word; border-collapse: collapse!important; vertical-align: top;' align='left' valign='middle'>"
                                            + "</td>"
                                            + "</tr>"
                                            + "</tbody>"
                                            + "</table>"
                                            + "<table style='border-collapse: collapse; table-layout: fixed; border-spacing: 0; vertical-align: top; margin-right: 17px;' border='0' width='32' cellspacing='0' cellpadding='0' align='left'>"
                                            + "<tbody>"
                                            + "<tr style='vertical-align: top;'>"
                                            + "<td style='word-break: break-word; border-collapse: collapse!important; vertical-align: top;' align='left' valign='middle'>"
                                            + "</td>"
                                            + "</tr>"
                                            + "</tbody>"
                                            + "</table>"
                                            + "<table style='border-collapse: collapse; table-layout: fixed; border-spacing: 0; vertical-align: top; margin-right: 17px;' border='0' width='32' cellspacing='0' cellpadding='0' align='left'>"
                                            + "<tbody>"
                                            + "<tr style='vertical-align: top;'>"
                                            + "<td style='word-break: break-word; border-collapse: collapse!important; vertical-align: top;' align='left' valign='middle'>"
                                            + "</td>"
                                            + "</tr>"
                                            + "</tbody>"
                                            + "</table>"
                                            + "<table style='border-collapse: collapse; table-layout: fixed; border-spacing: 0; vertical-align: top; margin-right: 0px;' border='0' width='32' cellspacing='0' cellpadding='0' align='left'>"
                                            + "<tbody>"
                                            + "<tr style='vertical-align: top;'>"
                                            + "<td style='word-break: break-word; border-collapse: collapse!important; vertical-align: top;' align='left' valign='middle'>"
                                            + "</td>"
                                            + "</tr>"
                                            + "</tbody>"
                                            + "</table>"
                                            + "</div>"
                                            + "</div>"
                                            + "</td>"
                                            + "</tr>"
                                            + "</tbody>"
                                            + "</table>"
                                            + "</div>"
                                            + "</div>"
                                            + "</div>"
                                            + "</div>"
                                            + "</div>"
                                            + "</div>"
                                            + "<div style='padding: 0px; background-color: transparent;'>"
                                            + "<div style='margin: 0 auto; min-width: 320px; max-width: 550px; word-wrap: break-word; word-break: break-word; background-color: transparent;'>"
                                            + "<div style='border-collapse: collapse; display: table; width: 100%; background-color: transparent;'>"
                                            + "<div style='max-width: 320px; min-width: 550px; display: table-cell; vertical-align: top;'>"
                                            + "<div style='width: 100%!important;'>"
                                            + "<div style='padding: 0px; border: 0px solid transparent;'>"
                                            + "<table id='u_content_text_2' style='font-family: arial,helvetica,sans-serif;' role='presentation' border='0' width='100%' cellspacing='0' cellpadding='0'>"
                                            + "<tbody>"
                                            + "<tr>"
                                            + "<td style='word-break: break-word; padding: 20px; font-family: arial,helvetica,sans-serif;' align='left'>"
                                            + "<div style='color: #9c9a9a; line-height: 120%; text-align: center; word-wrap: break-word;'>"
                                 
                                            + "</div>"
                                            + "</td>"
                                            + "</tr>"
                                            + "</tbody>"
                                            + "</table>"
                                            + "</div>"
                                            + "</div>"
                                            + "</div>"
                                            + "</div>"
                                            + "</div>"
                                            + "</div>"
                                            + "</td>"
                                            + "</tr>"
                                            + "</tbody>"
                                            + "</table>"
                                            + "</div>"
                                            + "</div></td></tr></table>"
        sgMail
        //var d = await sgMail.send(msg);

        var params = {
          Source: 'sudheesh@ufstechnologies.com',
          Destination: {
            ToAddresses: [
              result1[0].Email
            ]
          },
          ReplyToAddresses: [
            'sudheesh@ufstechnologies.com',
          ],
          Message: {
            Body: {
              Html: {
                Charset: "UTF-8",
                Data: html
              }
            },
            Subject: {
              Charset: 'UTF-8',
              Data: 'Course details'
            },
            attachments: [
              {
                filename:     'companylogo.PNG',          
                // type:  'image/PNG',                       
                path:  _dirname+'/companylogo.PNG',
                cid:   'myimagecid',
                // content:      base64str ,
                // disposition : "inline"
              }], 
          }
        };
        
        const data = await sesClient.send (new SendEmailCommand(params));
        await connection.commit();
        connection.release();
        rs(result1);
      }
        catch (err) {
        
        await connection.rollback();
        rej(err);
      }
    })
  },


savetest()
{

var a="<div class='gmail_quote'>"
  + "<br>" 
  + "<u></u>"
  + "<div style='margin: 0; padding: 0; background-color: #f2f2f2;'> "
    + "<table style='border-collapse: collapse; table-layout: fixed; border-spacing: 0; vertical-align: top; min-width: 320px; margin: 0 auto; background-color: #f2f2f2; width: 100%;' cellspacing='0' cellpadding='0'> "
      + "<tbody> "
        + "<tr style='vertical-align: top;'> "
          + "<td style='word-break: break-word; border-collapse: collapse!important; vertical-align: top;'> "
            + "<div style='padding: 10px 0px 0px; background-color: transparent;'>"
              + "<div style='margin: 0 auto; min-width: 320px; max-width: 550px; word-wrap: break-word; word-break: break-word; background-color: transparent;'>"
                + "<div style='border-collapse: collapse; display: table; width: 100%; background-color: transparent;'>"
                  + "<div style='max-width: 320px; min-width: 550px; display: table-cell; vertical-align: top;'>"
                    + "<div style='width: 100%!important;'>"
                      + "<div style='padding: 0px; border: 0px solid transparent;'>"
                        + "<table id='u_content_image_1' style='font-family: arial,helvetica,sans-serif;' role='presentation' border='0' width='100%' cellspacing='0' cellpadding='0'>"
                          + "<tbody>"
                            + "<tr>"
                              + "<td style='word-break: break-word; padding: 10px; font-family: arial,helvetica,sans-serif;' align='left'>"
                                + "<table border='0' width='100%' cellspacing='0' cellpadding='0'>"
                                  + "<tbody>"
                                    + "<tr>"
                                      + "<td style='padding-right: 0px; padding-left: 0px;' align='left'>"
                                        + "<a href='https://unlayer.com' rel='noopener' target='_blank' data-saferedirecturl='https://www.google.com/url?q=https://unlayer.com&amp;source=gmail&amp;ust=1626172295961000&amp;usg=AFQjCNEr0p4hV7LvBHWvd2OhBcaTpo3Stw'>"
                                          + "<img style='outline: none; text-decoration: none; clear: both; display: block!important; border: none; height: auto; float: none; width: 25%; max-width: 132.5px;' title='Unlayer' src='https://ci5.googleusercontent.com/proxy/FXBvMBOXqAq3ihb8-kOoyYhuqeQ8eX5gdd5ALDYwEXECjZ2uQiNdsEy2nvfkuCTP95dVTf8sqdDaY1T7qU8vcHuUFVTZpbomsGz-ovEiQYl--FC3QemF=s0-d-e1-ft#https://cdn.templates.unlayer.com/assets/1600676683824-dark_logo.png' alt='Unlayer' width='132.5' align='left' border='0'>"
                                        + "</a>"
                                      + "</td>"
                                    + "</tr>"
                                  + "</tbody>"
                                + "</table>"
                              + "</td>"
                            + "</tr>"
                          + "</tbody>"
                        + "</table>"
                      + "</div>"
                    + "</div>"
                  + "</div>"
                + "</div>"
              + "</div>"
            + "</div>"
            + "<div style='padding: 0px 0px 10px; background-color: transparent;'>"
              + "<div style='margin: 0 auto; min-width: 320px; max-width: 550px; word-wrap: break-word; word-break: break-word; background-color: transparent;'>"
                + "<div style='border-collapse: collapse; display: table; width: 100%; background-color: transparent;'>"
                  + "<div style='max-width: 320px; min-width: 550px; display: table-cell; vertical-align: top;'>"
                    + "<div style='background-color: #ffffff; width: 100%!important;'>"
                      + "<div style='padding: 25px; border-top: 5px solid #000000; border-left: 0px solid transparent; border-right: 0px solid transparent; border-bottom: 0px solid transparent;'>"
                        + "<table id='u_content_text_3' style='font-family: arial, helvetica, sans-serif; height: 451px; width: 100%;' role='presentation' border='0' width='100%' cellspacing='0' cellpadding='0'>"
                          + "<tbody>"
                            + "<tr style='height: 451px;'>"
                              + "<td style='word-break: break-word; padding: 10px 10px 20px; font-family: arial, helvetica, sans-serif; height: 451px;' align='left'>"
                                + "<div style='color: #000000; line-height: 170%; text-align: left; word-wrap: break-word;'>"
                                  + "<p style='font-size: 14px; line-height: 170%;'>"
                                    + "<span style='color: #339966;'>"
                                      + "<strong>"
                                        + "<span style='font-size: 16px; line-height: 27.2px;'>Hi Midhula,</span>"
                                          + "</strong>"
                                            + "</span>"
                                            + "</p>"
                                            + "<p style='font-size: 14px; line-height: 10%;'>&nbsp;</p>"
                                            + "<p style='font-size: 14px; line-height: 100%;'>"
                                            + "<span style='font-size: 16px; line-height: 27.2px;'>Thank you for signing up for your free trial with Unlayer! A world of beautiful, mobile-ready emails and landing pages await you.</span>"
                                            + "</p>"
                                  
                                            + "</p>"
                                            + "<p style='font-size: 14px; line-height: 170%;'>&nbsp;</p>"
                                            + "<p style='font-size: 14px; line-height: 170%;'>"
                                            + "Course Details"
                                            + "<hr>"
                                    
                                    
                                            + "<table>"
                                              + "<tr>"
                                                + "<td>test1</td>"
                                                + "<td>ts</td>"
                                              + "</tr>"
                                            + "</table>"
                                  
                                  
                                            + "<span style='font-size: 16px; line-height: 27.2px;'>We tried to make Unlayer the most intuitive, easy and flexible drag-and-drop email builder on the planet. But, if you have questions or need help, you can reach our <a href='https://unlayer.com/contact' rel='noopener' target='_blank' data-saferedirecturl='https://www.google.com/url?q=https://unlayer.com/contact&amp;source=gmail&amp;ust=1626172295961000&amp;usg=AFQjCNH6qXyS_qrM_ZKJMDjya3pGs71wGA'>support team here</a> or by clicking the gray chat icon in the bottom right of your screen.</span>"
                                            + "</p>"
                                            + "</div>"
                                            + "</td>"
                                            + "</tr>"
                                            + "</tbody>"
                                            + "</table>"
                                          
                                            + "<table id='u_content_button_1' style='font-family: arial,helvetica,sans-serif;' role='presentation' border='0' width='100%' cellspacing='0' cellpadding='0'>"
                                            + "<tbody>"
                                            + "<tr>"
                                            + "<td style='word-break: break-word; padding: 10px; font-family: arial,helvetica,sans-serif;' align='left'>"
                                            + "<div align='left'>"
                                            + "<a href='https://dashboard.unlayer.com/projects/27535/design/campaigns/new?utm_source=automation&amp;utm_medium=email&amp;utm_campaign=studio-d0-welcome' style='box-sizing: border-box; display: inline-block; font-family: arial,helvetica,sans-serif; text-decoration: none; text-align: center; color: #ffffff; background-color: #0aab13; border-radius: 30px; width: auto; max-width: 100%; word-break: break-word; word-wrap: break-word;' rel='noopener' target='_blank' data-saferedirecturl='https://www.google.com/url?q=https://dashboard.unlayer.com/projects/27535/design/campaigns/new?utm_source%3Dautomation%26utm_medium%3Demail%26utm_campaign%3Dstudio-d0-welcome&amp;source=gmail&amp;ust=1626172295961000&amp;usg=AFQjCNFPlOHx9CTUObj0RyoCAi1nvmP-wA'>"
                                            + "<span style='display: block; padding: 15px 25px; line-height: 120%;'>"
                                            + "<strong>"
                                            + "<span style='font-size: 20px; line-height: 24px;'>Start Designing</span>"
                                            + "</strong>"
                                            + "</span>"
                                            + "</a>"
                                            + "</div>"
                                            + "</td>"
                                            + "</tr>"
                                            + "</tbody>"
                                            + "</table>"
                        
                        
                                            + "<br>"
                                            + "</div>"
                                            + "</div>"
                                            + "</div>"
                                            + "</div>"
                                            + "</div>"
                                            + "</div>"
                                            + "<div style='padding: 0px; background-color: transparent;'>"
                                            + "<div style='margin: 0 auto; min-width: 320px; max-width: 550px; word-wrap: break-word; word-break: break-word; background-color: transparent;'>"
                                            + "<div style='border-collapse: collapse; display: table; width: 100%; background-color: transparent;'>"
                                            + "<div style='max-width: 320px; min-width: 600px; display: table-cell; vertical-align: top;'>"
                                            + "<div style='width: 100%!important;'>"
                                            + "<div style='padding: 0px; border: 0px solid transparent;'>"
                                            + "<table style='font-family: 'Cabin',sans-serif;' role='presentation' border='0' width='100%' cellspacing='0' cellpadding='0'>"
                                            + "<tbody>"
                                            + "<tr>"
                                            + "<td style='word-break: break-word; padding: 41px 55px 18px; font-family: 'Cabin',sans-serif;' align='left'>"
                                            + "<div style='color: #003399; line-height: 160%; text-align: center; word-wrap: break-word;'>"
                                            + "<p style='font-size: 14px; line-height: 160%;'>"
                                            + "<span style='font-size: 20px; line-height: 32px;'>"
                                            + "<strong>Get in touch</strong>"
                                            + "</span>"
                                            + "</p>"
                                            + "<p style='font-size: 14px; line-height: 160%;'>"
                                            + "<span style='font-size: 16px; line-height: 25.6px; color: #000000;'>+11 111 333 4444</span>"
                                            + "</p>"
                                            + "<p style='font-size: 14px; line-height: 160%;'>"
                                            + "<span style='font-size: 16px; line-height: 25.6px; color: #000000;'>Info@YourCompany.com</span>"
                                            + "</p>"
                                            + "</div>"
                                            + "</td>"
                                            + "</tr>"
                                            + "</tbody>"
                                            + "</table>"
                                            + "<table style='font-family: 'Cabin',sans-serif;' role='presentation' border='0' width='100%' cellspacing='0' cellpadding='0'>"
                                            + "<tbody>"
                                            + "<tr>"
                                            + "<td style='word-break: break-word; padding: 10px 10px 33px; font-family: 'Cabin',sans-serif;' align='left'>"
                                            + "<div align='center'>"
                                            + "<div style='display: table; max-width: 244px;'>"
                                            + "<table style='border-collapse: collapse; table-layout: fixed; border-spacing: 0; vertical-align: top; margin-right: 17px;' border='0' width='32' cellspacing='0' cellpadding='0' align='left'>"
                                            + "<tbody>"
                                            + "<tr style='vertical-align: top;'>"
                                            + "<td style='word-break: break-word; border-collapse: collapse!important; vertical-align: top;' align='left' valign='middle'>"
                                            + "<a href='https://facebook.com/' title='Facebook' rel='noopener' target='_blank' data-saferedirecturl='https://www.google.com/url?q=https://facebook.com/&amp;source=gmail&amp;ust=1626171745829000&amp;usg=AFQjCNFtvJKw3XnCaUSv8RdvoP9vy-0ZvA'>"
                                            + "<img style='outline: none; text-decoration: none; clear: both; display: block!important; border: none; height: auto; float: none; max-width: 32px!important;' title='Facebook' src='https://ci5.googleusercontent.com/proxy/U89pYXD46FMVVngFcy3k2zsTBamg7YOGP0WjBRS5h30tZixftmDCdIicNSggTpHkZCHVupSPYouD-oYpM5cJAV51r88Vyrapbkib6PRQ46EJ9fzlSN_B=s0-d-e1-ft#https://cdn.tools.unlayer.com/social/icons/circle-black/facebook.png' alt='Facebook' width='32'>"
                                            + "</a>"
                                            + "</td>"
                                            + "</tr>"
                                            + "</tbody>"
                                            + "</table>"
                                            + "<table style='border-collapse: collapse; table-layout: fixed; border-spacing: 0; vertical-align: top; margin-right: 17px;' border='0' width='32' cellspacing='0' cellpadding='0' align='left'>"
                                            + "<tbody>"
                                            + "<tr style='vertical-align: top;'>"
                                            + "<td style='word-break: break-word; border-collapse: collapse!important; vertical-align: top;' align='left' valign='middle'>"
                                            + "<a href='https://linkedin.com/' title='LinkedIn' rel='noopener' target='_blank' data-saferedirecturl='https://www.google.com/url?q=https://linkedin.com/&amp;source=gmail&amp;ust=1626171745829000&amp;usg=AFQjCNEacgKW37ivJQFMNB-7eIoITYVZqA'>"
                                            + "<img style='outline: none; text-decoration: none; clear: both; display: block!important; border: none; height: auto; float: none; max-width: 32px!important;' title='LinkedIn' src='https://ci4.googleusercontent.com/proxy/17XFcaMIW-RvcN4x6-5J-qSfHgr94ydQmz0QXjLq_gL5tHQ3ryLcJubcfhf04fxkJN6k7VVTPYfnRG5x6oX3LMjHbjO3Xxoql9YEVpL54NnBs5cr8ff5=s0-d-e1-ft#https://cdn.tools.unlayer.com/social/icons/circle-black/linkedin.png' alt='LinkedIn' width='32'>"
                                            + "</a>"
                                            + "</td>"
                                            + "</tr>"
                                            + "</tbody>"
                                            + "</table>"
                                            + "<table style='border-collapse: collapse; table-layout: fixed; border-spacing: 0; vertical-align: top; margin-right: 17px;' border='0' width='32' cellspacing='0' cellpadding='0' align='left'>"
                                            + "<tbody>"
                                            + "<tr style='vertical-align: top;'>"
                                            + "<td style='word-break: break-word; border-collapse: collapse!important; vertical-align: top;' align='left' valign='middle'>"
                                            + "<a href='https://instagram.com/' title='Instagram' rel='noopener' target='_blank' data-saferedirecturl='https://www.google.com/url?q=https://instagram.com/&amp;source=gmail&amp;ust=1626171745829000&amp;usg=AFQjCNE7A29d6myChbFrKbjmgQNirRj_jA'>"
                                            + "<img style='outline: none; text-decoration: none; clear: both; display: block!important; border: none; height: auto; float: none; max-width: 32px!important;' title='Instagram' src='https://ci4.googleusercontent.com/proxy/UfyJpVcccZD3hgPZqRQbq28YwgzlR1IXn-__CtkVbpJW3yVArZ1lKbPuyuSN6ojoOwPFhaDXaBQQBEtV9ACm8DT4fMnBAjXTdBxzION0sDv2iagjp8MHPA=s0-d-e1-ft#https://cdn.tools.unlayer.com/social/icons/circle-black/instagram.png' alt='Instagram' width='32'>"
                                            + "</a>"
                                            + "</td>"
                                            + "</tr>"
                                            + "</tbody>"
                                            + "</table>"
                                            + "<table style='border-collapse: collapse; table-layout: fixed; border-spacing: 0; vertical-align: top; margin-right: 17px;' border='0' width='32' cellspacing='0' cellpadding='0' align='left'>"
                                            + "<tbody>"
                                            + "<tr style='vertical-align: top;'>"
                                            + "<td style='word-break: break-word; border-collapse: collapse!important; vertical-align: top;' align='left' valign='middle'>"
                                            + "<a href='https://youtube.com/' title='YouTube' rel='noopener' target='_blank' data-saferedirecturl='https://www.google.com/url?q=https://youtube.com/&amp;source=gmail&amp;ust=1626171745829000&amp;usg=AFQjCNFcbGo2qjbXfaJFkTFd8Y4i-7jIYA'>"
                                            + "<img style='outline: none; text-decoration: none; clear: both; display: block!important; border: none; height: auto; float: none; max-width: 32px!important;' title='YouTube' src='https://ci3.googleusercontent.com/proxy/mPcIHyJdZhWWXM2C59iorpToez6bZpBDovq4BAx5RCVLCPcJFZm_vltlHectWxgMDDiZe-4rQOIOhTzYg2PugMnJe836gJx_z04QEKWWnD7Xrf6qOuo=s0-d-e1-ft#https://cdn.tools.unlayer.com/social/icons/circle-black/youtube.png' alt='YouTube' width='32'>"
                                            + "</a>"
                                            + "</td>"
                                            + "</tr>"
                                            + "</tbody>"
                                            + "</table>"
                                            + "<table style='border-collapse: collapse; table-layout: fixed; border-spacing: 0; vertical-align: top; margin-right: 0px;' border='0' width='32' cellspacing='0' cellpadding='0' align='left'>"
                                            + "<tbody>"
                                            + "<tr style='vertical-align: top;'>"
                                            + "<td style='word-break: break-word; border-collapse: collapse!important; vertical-align: top;' align='left' valign='middle'>"
                                            + "<a href='https://email.com/' title='Email' rel='noopener' target='_blank' data-saferedirecturl='https://www.google.com/url?q=https://email.com/&amp;source=gmail&amp;ust=1626171745829000&amp;usg=AFQjCNEHtm9pytuxDKyYHWhGgz4JVmC6FQ'>"
                                            + "<img style='outline: none; text-decoration: none; clear: both; display: block!important; border: none; height: auto; float: none; max-width: 32px!important;' title='Email' src='https://ci3.googleusercontent.com/proxy/aB3qIicdyVC3mIlvvjARxi7uohsatvRqLz6yBk2kUtBgBkjbzM6lCWkW6GZR9WCFe_pdQGMpn6SB558qnJj1meAD2o9CgVRH_SNQM-zb27RopcU7=s0-d-e1-ft#https://cdn.tools.unlayer.com/social/icons/circle-black/email.png' alt='Email' width='32'>"
                                            + "</a>"
                                            + "</td>"
                                            + "</tr>"
                                            + "</tbody>"
                                            + "</table>"
                                            + "</div>"
                                            + "</div>"
                                            + "</td>"
                                            + "</tr>"
                                            + "</tbody>"
                                            + "</table>"
                                            + "</div>"
                                            + "</div>"
                                            + "</div>"
                                            + "</div>"
                                            + "</div>"
                                            + "</div>"
                                            + "<div style='padding: 0px; background-color: transparent;'>"
                                            + "<div style='margin: 0 auto; min-width: 320px; max-width: 550px; word-wrap: break-word; word-break: break-word; background-color: transparent;'>"
                                            + "<div style='border-collapse: collapse; display: table; width: 100%; background-color: transparent;'>"
                                            + "<div style='max-width: 320px; min-width: 550px; display: table-cell; vertical-align: top;'>"
                                            + "<div style='width: 100%!important;'>"
                                            + "<div style='padding: 0px; border: 0px solid transparent;'>"
                                            + "<table id='u_content_text_2' style='font-family: arial,helvetica,sans-serif;' role='presentation' border='0' width='100%' cellspacing='0' cellpadding='0'>"
                                            + "<tbody>"
                                            + "<tr>"
                                            + "<td style='word-break: break-word; padding: 20px; font-family: arial,helvetica,sans-serif;' align='left'>"
                                            + "<div style='color: #9c9a9a; line-height: 120%; text-align: center; word-wrap: break-word;'>"
                                 
                                            + "</div>"
                                            + "</td>"
                                            + "</tr>"
                                            + "</tbody>"
                                            + "</table>"
                                            + "</div>"
                                            + "</div>"
                                            + "</div>"
                                            + "</div>"
                                            + "</div>"
                                            + "</div>"
                                            + "</td>"
                                            + "</tr>"
                                            + "</tbody>"
                                            + "</table>"
                                            + "</div>"
                                            + "</div>"



},

Get_site_Pageload:function(callback)
{ 
return db.query("CALL Get_site_Pageload()",[],callback);
},

Public_Search_Course:function(Level_Detail_Id,Country_Id,Intake_Id,Sub_Section_Id,Course_Name,Branch_Search,Duration_Search,Ielts_,Page_Start,Page_End,Page_Length,University,Subject_1,callback)
{ 
  if (Course_Name===undefined || Course_Name==="undefined" )
  Course_Name='';
  if (Branch_Search===undefined || Branch_Search==="undefined" )
  Branch_Search='';
  if (Duration_Search===undefined || Duration_Search==="undefined" )
  Duration_Search='';
  return db.query("CALL Public_Search_Course(@Level_Detail_Id :=?,@Country_Id :=?,@Intake_Id :=?,@Sub_Section_Id :=?,@Course_Name :=?,@Branch_Search :=?,@Duration_Search :=?,@Ielts_ :=?,@Page_Start :=?,@Page_End :=?,@Page_Length :=?,@University :=?,@Subject_1 :=?)",
  [Level_Detail_Id,Country_Id,Intake_Id,Sub_Section_Id,Course_Name,Branch_Search,Duration_Search,Ielts_,Page_Start,Page_End,Page_Length,University,Subject_1],callback);
} ,

Public_Search_Course_Typeahead:function(Level_Detail_Id,Country_Id,Intake_Id,Sub_Section_Id,Course_Name,Branch_Search,Duration_Search,Ielts_,Page_Start,Page_End,Page_Length,University,Subject_1,callback)
{ 
  if (Course_Name===undefined || Course_Name==="undefined" )
  Course_Name='';
  if (Branch_Search===undefined || Branch_Search==="undefined" )
  Branch_Search='';
  if (Duration_Search===undefined || Duration_Search==="undefined" )
  Duration_Search='';
  return db.query("CALL Public_Search_Course_Typeahead(@Level_Detail_Id :=?,@Country_Id :=?,@Intake_Id :=?,,@Sub_Section_Id :=?,@Course_Name :=?,@Branch_Search :=?,@Duration_Search :=?,@Ielts_ :=?,@Page_Start :=?,@Page_End :=?,@Page_Length :=?,@University :=?,@Subject_1 :=?)",
  [Level_Detail_Id,Country_Id,Intake_Id,Sub_Section_Id,Course_Name,Branch_Search,Duration_Search,Ielts_,Page_Start,Page_End,Page_Length,University,Subject_1],callback);
} ,
 
// Public_Search_Course:function(Level_Detail_Id,Country_Id,Intake_Id,Course_Name,Branch_Search,Duration_Search,Ielts_,Page_Start,Page_End,Page_Length,callback)
// { 
//  if (Course_Name===undefined || Course_Name==="undefined" )
//  Course_Name='';
//  if (Branch_Search===undefined || Branch_Search==="undefined" )
//  Branch_Search='';
//  if (Duration_Search===undefined || Duration_Search==="undefined" )
//  Duration_Search='';
//  return db.query("CALL Public_Search_Course(@Level_Detail_Id :=?,@Country_Id :=?,@Intake_Id :=?,@Course_Name :=?,@Branch_Search :=?,@Duration_Search :=?,@Ielts_ :=?,@Page_Start :=?,@Page_End :=?,@Page_Length :=?)",
//  [Level_Detail_Id,Country_Id,Intake_Id,Course_Name,Branch_Search,Duration_Search,Ielts_,Page_Start,Page_End,Page_Length,],callback);
// } ,

// Public_Search_Course_Typeahead:function(Level_Detail_Id,Country_Id,Intake_Id,Course_Name,Branch_Search,Duration_Search,Ielts_,Page_Start,Page_End,Page_Length,callback)
// { 
//  if (Course_Name===undefined || Course_Name==="undefined" )
//  Course_Name='';
//  if (Branch_Search===undefined || Branch_Search==="undefined" )
//  Branch_Search='';
//  if (Duration_Search===undefined || Duration_Search==="undefined" )
//  Duration_Search='';
//  return db.query("CALL Public_Search_Course_Typeahead(@Level_Detail_Id :=?,@Country_Id :=?,@Intake_Id :=?,@Course_Name :=?,@Branch_Search :=?,@Duration_Search :=?,@Ielts_ :=?,@Page_Start :=?,@Page_End :=?,@Page_Length :=?)",
//  [Level_Detail_Id,Country_Id,Intake_Id,Course_Name,Branch_Search,Duration_Search,Ielts_,Page_Start,Page_End,Page_Length,],callback);
// } ,
Get_More_Information:function(Course_Id_,callback)
{ 
  db.query("CALL Get_More_Information(@Course_Id_ :=?)",[Course_Id_],callback);
},


  Update_Student_Public: function (Student_, callback) {
    return db.query("CALL Update_Student(" + "@Student_Id_ :=?," + "@Agent_Id_ :=?," + "@Student_Name_ :=?," + "@Last_Name_ :=?,"
      + "@Address1_ :=?," + "@Address2_ :=?," + "@Pincode_ :=?," + "@Email_ :=?," + "@Phone_Number_ :=?," +
      "@Promotional_Code_ :=?," + "@Student_Status_Id_ :=?," + "@Password_ :=?" + ")"
      , [Student_.Student_Id, Student_.Agent_Id, Student_.Student_Name, Student_.Last_Name, Student_.Address1, Student_.Address2,
      Student_.Pincode, Student_.Email, Student_.Phone_Number, Student_.Promotional_Code,
      Student_.Student_Status_Id, Student_.Password], callback);
  },
Forgot_Password_Student: async function (Data) {
  const pool = db.promise();
  const Email_ = Data.Email;
  let connection;

  try {
    connection = await pool.getConnection();

    const result1 = await new storedProcedure('Check_Student_Mail', [Email_], connection).result();

    if (result1[0]?.Student_Id >= 0) {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: 'annu@ufstechnologies.com',
          pass: 'annu@ufs2896', // ⚠️ Replace with env var in production
        }
      });

      const mailOptions = {
        from: 'annu@ufstechnologies.com',
        to: Email_,
        subject: 'Forgot Password - Studyvisafinder',
        html:
          `Dear ${result1[0].Student_Name},<br/>
           We have received your forgot password request.<br/><br/>
           <strong>Password:</strong> ${result1[0].Password}<br/><br/>
           Once logged in successfully, please change your password.<br/><br/>
           Best regards,<br/>
           Studyvisafinder Team<br/><br/>
           <i>Note: Replies to this email will not be received. Please do not reply.</i>`
      };

      await transporter.sendMail(mailOptions); // ✅ Now properly awaited

      return { Student_Id: 1 };
    } else {
      return { Student_Id: 0 };
    }

  } catch (err) {
    console.error("❌ Forgot_Password_Student error:", err);
    throw err;
  } finally {
    if (connection) connection.release(); // ✅ Always release
  }
},

Forgot_Password_Agent: async function (Data) {
    const Email_ = Data.Email;

    return new Promise(async (resolve, reject) => {
        const pool = db.promise();
        let connection;

        try {
            connection = await pool.getConnection();
            const result1 = await (new storedProcedure('Check_Agent_Mail', [Email_], connection)).result();

            if (result1.length > 0 && result1[0].Client_Accounts_Id >= 0) {
                const transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: false,
                    requireTLS: true,
                    auth: {
                        user: 'annu@ufstechnologies.com',
                        pass: 'annu@ufs2896' // ⚠️ move this to env var!
                    }
                });

                const mailOptions = {
                    from: 'annu@ufstechnologies.com',
                    to: Email_,
                    subject: 'Forgot Password Studyvisafinder',
                    html: `
                        Dear ${result1[0].Client_Accounts_Name},<br/>
                        We have received your forgot password request. Following is your password to login to Studyvisafinder Console.<br/><br/>
                        <strong>Password:</strong> ${result1[0].Password}<br/><br/>
                        Once logged in successfully, you will need to change the above password.<br/><br/>
                        Best regards,<br/>
                        Studyvisafinder<br/><br/>
                        Replies to this message are undeliverable and will not reach Studyvisafinder.<br/>
                        Please do not reply.
                    `
                };

                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                        console.error("Email sending error:", err);
                        resolve({ Client_Accounts_Id: 0 });
                    } else {
                        resolve({ Client_Accounts_Id: 1 });
                    }
                });

            } else {
                resolve({ Client_Accounts_Id: 0 });
            }

        } catch (err) {
            reject(err);
        } finally {
            if (connection) connection.release();
        }
    });
},

};
 module.exports=Public_Data;
