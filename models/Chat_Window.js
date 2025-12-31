var db = require("../dbconnection");
var fs = require("fs");
var Chat_Window = {
  Save_Chat: function (Msg_Data, callback) {
    let Data_value_ = 0;
    let user_value_ = 0;
    let taggedId = [];

    const Chats_ = Msg_Data.Msg || "";
    const tagged_users = Msg_Data.tagged || "";

    if (Chats_) Data_value_ = 1;

    if (tagged_users) {
      user_value_ = 1;
      try {
        const taggedObj =
          typeof tagged_users === "string"
            ? JSON.parse(tagged_users)
            : tagged_users;
        if (taggedObj.User_Id) {
          taggedId = taggedObj.User_Id.split(",").map((id) => id.trim());
        }
      } catch (err) {
        console.error("Error parsing tagged_users in Save_Chat:", err.message);
      }
    }

    return db.query(
      "CALL Save_Chat(?, ?, ?, ?, ?)",
      [
        Chats_,
        Data_value_,
        tagged_users,
        user_value_,
        JSON.stringify(taggedId),
      ],
      callback
    );
  },

  Delete_Chat_Window: function (Chat_Window_Id_, callback) {
    return db.query("CALL Delete_Chat_Window(?)", [Chat_Window_Id_], callback);
  },

  Get_Chat_Window: function (Chat_Window_Id_, callback) {
    return db.query("CALL Get_Chat_Window(?)", [Chat_Window_Id_], callback);
  },

  Load_ChatUser_Details: function (Value_, Login_User_, callback) {
    const safeValue =
      Value_ === "undefined" || Value_ === undefined || Value_ === null
        ? ""
        : Value_;
    return db.query(
      "CALL Load_ChatUser_Details(?, ?)",
      [safeValue, Login_User_],
      callback
    );
  },

  Get_Chats: function (Channel_Id_, Login_User_, callback) {
    return db.query(
      "CALL Get_Chats(?, ?)",
      [Channel_Id_, Login_User_],
      callback
    );
  },
  Save_Comments: async function (Msg_Data, callback) {
  console.log("Incoming comment data:", Msg_Data);

  const pool = db.promise();
  let connection;

  let Data_value_ = 0,
      user_value_ = 0,
      taggedIds = [],
      Chats_ = Msg_Data.Msg,
      tagged_users = Msg_Data.tagged;

  if (!Chats_) {
    const err = new Error("Message content is required");
    console.error(err.message);
    if (callback) return callback(err, null);
    throw err;
  } else {
    Data_value_ = 1;
  }

  if (tagged_users) {
    user_value_ = 1;
    try {
      const taggedObj = typeof tagged_users === "string" ? JSON.parse(tagged_users) : tagged_users;
      if (taggedObj.User_Id) {
        taggedIds = taggedObj.User_Id.split(",").map((id) => id.trim());
      }
    } catch (err) {
      console.error("Error parsing tagged users:", err);
    }
  }

  let chatsObj = typeof Chats_ === "string" ? JSON.parse(Chats_) : Chats_;
  const studentId = chatsObj.Student_Id;
  const applicationDetailsId = chatsObj.Application_Details_Id;
  const fromUserId = chatsObj.From_User;
  const fromUserName = chatsObj.From_User_Name;

  let spResults;
  try {
    connection = await pool.getConnection();

    // 🔥 No need for external transaction if stored proc is atomic
    spResults = await connection.query("CALL Save_Comments(?, ?, ?, ?, ?)", [
      Chats_,
      Data_value_,
      tagged_users,
      user_value_,
      JSON.stringify(taggedIds),
    ]);

    console.log("✅ Comment saved successfully.");

    if (callback) callback(null, spResults[0]);
  } catch (err) {
    console.error("❌ Error in Save_Comments:", err);
    if (callback) callback(err, null);
    else throw err;
  } finally {
    if (connection) connection.release();
  }

  // ✉️ Post-commit email logic
  if (user_value_ > 0 && taggedIds.length > 0 && studentId) {
    try {
      const [prefixRows] = await pool.query(`SELECT Prefix FROM application_settings LIMIT 1`);
      const prefix = prefixRows.length > 0 ? prefixRows[0].Prefix : "";
      const aimsId = prefix + studentId;

      const [studentRows] = await pool.query(
        `SELECT Student_Name, Email AS Email_ID, Phone_Number 
         FROM student 
         WHERE Student_Id = ? AND DeleteStatus = FALSE`,
        [studentId]
      );
      const studentData = studentRows[0] || { Student_Name: "N/A", Email_ID: "N/A", Phone_Number: "N/A" };
      studentData.AIMS_Id = aimsId;

      const [fromUserRows] = await pool.query(
        `SELECT User_Details_Name, Email FROM user_details
         WHERE User_Details_Id = ? AND DeleteStatus = FALSE`,
        [fromUserId]
      );
      const fromUserData = fromUserRows[0] || { User_Details_Name: fromUserName || "N/A", Email: "N/A" };

      const axios = require("axios");
      const apiKey = process.env.BREVO_API_KEY || "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";
      const senderEmail = process.env.BREVO_SENDER_EMAIL || "ufsdev123@gmail.com";
      const senderName = process.env.BREVO_SENDER_NAME || "Application System";
      const now = new Date();
      const formattedDate = now.toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const message = chatsObj.message;

      for (const userId of taggedIds) {
        const [userRows] = await pool.query(
          `SELECT User_Details_Name, Email FROM user_details
           WHERE User_Details_Id = ? AND DeleteStatus = FALSE`,
          [userId]
        );
        if (userRows.length === 0) continue;
        const userData = userRows[0];

        const htmlContent = `
          <html><body>
            <p>Dear ${userData.User_Details_Name},</p>
            <p>You were tagged in a comment by <strong>${fromUserData.User_Details_Name}</strong> on ${formattedDate}:</p>
            <div style="border: 1px solid #ccc; padding: 15px; background: #f9f9f9;">
              <p><strong>Student Name:</strong> ${studentData.Student_Name}</p>
              <p><strong>AIMS ID:</strong> ${studentData.AIMS_Id}</p>
              <p><strong>Comment:</strong> ${message}</p>
              <p><strong>From:</strong> ${fromUserData.User_Details_Name}</p>
            </div>
            <p>Please login to the system to respond.</p>
          </body></html>`;

        const textContent = `
          Dear ${userData.User_Details_Name},
          You were tagged in a comment by ${fromUserData.User_Details_Name} on ${formattedDate}:
          - Student Name: ${studentData.Student_Name}
          - AIMS ID: ${studentData.AIMS_Id}
          - Comment: ${message}
          - From: ${fromUserData.User_Details_Name}
          Please login to the system to respond.
        `;

        try {
          await axios.post(
            "https://api.brevo.com/v3/smtp/email",
            {
              sender: { name: senderName, email: senderEmail },
              to: [{ email: userData.Email, name: userData.User_Details_Name }],
              subject: `You were tagged in a comment by ${fromUserData.User_Details_Name}`,
              htmlContent,
              textContent,
            },
            {
              headers: {
                "Content-Type": "application/json",
                "api-key": apiKey,
              },
            }
          );

          console.log(`📧 Email sent to ${userData.User_Details_Name}`);
        } catch (emailErr) {
          console.error(`🚫 Email failed for ${userData.User_Details_Name}:`, emailErr.message);
        }
      }
    } catch (postEmailErr) {
      console.error("❌ Post-email error:", postEmailErr);
    }
  }
}
,

  Save_Comments_Email: async function (Msg_Data_Mail, callback) {
    const Msg_Data = Msg_Data_Mail;
    const pool = db.promise();

    let studentId,
      applicationDetailsId,
      fromUserId,
      fromUserName,
      taggedIds = [];

    try {
      const Chats_ = Msg_Data.Msg;
      const tagged_users = Msg_Data.tagged;

      if (!Chats_) throw new Error("Invalid Msg content.");

      const chatsObj = typeof Chats_ === "string" ? JSON.parse(Chats_) : Chats_;
      studentId = chatsObj.Student_Id;
      applicationDetailsId = chatsObj.Application_Details_Id;
      fromUserId = chatsObj.From_User;
      fromUserName = chatsObj.From_User_Name;

      if (!studentId || !fromUserId)
        throw new Error("Missing critical user info.");

      // Parse tagged users
      if (tagged_users) {
        const taggedObj =
          typeof tagged_users === "string"
            ? JSON.parse(tagged_users)
            : tagged_users;
        if (taggedObj.User_Id) {
          taggedIds = taggedObj.User_Id.split(",").map((id) => id.trim());
        }
      }

      // Exit early if nothing to notify
      if (taggedIds.length === 0) {
        if (callback) return callback(null, "No tagged users to notify.");
        return "No tagged users to notify.";
      }

      // 🔄 Fetch required data (single connection scope)
      const connection = await pool.getConnection();

      try {
        const [[{ Prefix } = { Prefix: "" }] = []] = await connection.query(
          `SELECT Prefix FROM application_settings LIMIT 1`
        );

        const aimsId = Prefix + studentId;

        const [
          [
            studentData = {
              Student_Name: "N/A",
              Email_ID: "N/A",
              Phone_Number: "N/A",
            },
          ] = [],
        ] = await connection.query(
          `SELECT Student_Name, Email AS Email_ID, Phone_Number
         FROM student WHERE Student_Id = ? AND DeleteStatus = FALSE`,
          [studentId]
        );
        studentData.AIMS_Id = aimsId;

        const [
          [
            fromUserData = {
              User_Details_Name: fromUserName || "N/A",
              Email: "N/A",
            },
          ] = [],
        ] = await connection.query(
          `SELECT User_Details_Name, Email
         FROM user_details WHERE User_Details_Id = ? AND DeleteStatus = FALSE`,
          [fromUserId]
        );

        connection.release();

        const now = new Date();
        const formattedDate = now.toLocaleString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        const subject = `You were tagged in a comment by ${fromUserData.User_Details_Name}`;
        const message =
          typeof Chats_ === "string"
            ? JSON.parse(Chats_).message
            : Chats_.message;

        const axios = require("axios");
        const apiKey = process.env.BREVO_API_KEY || "your-api-key";
        const senderEmail =
          process.env.BREVO_SENDER_EMAIL || "ufsdev123@gmail.com";
        const senderName =
          process.env.BREVO_SENDER_NAME || "Application System";

        for (const userId of taggedIds) {
          const [[userData] = []] = await pool.query(
            `SELECT User_Details_Name, Email FROM user_details
           WHERE User_Details_Id = ? AND DeleteStatus = FALSE`,
            [userId]
          );

          if (!userData) {
            console.warn(`User ${userId} not found, skipping.`);
            continue;
          }

          const htmlContent = `
          <html>
            <body style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
              <p>Dear ${userData.User_Details_Name},</p>
              <p>You were tagged in a comment by <strong>${fromUserData.User_Details_Name}</strong> on ${formattedDate}:</p>
              <div style="border: 1px solid #ccc; padding: 15px; margin-top: 10px; background-color: #f9f9f9;">
                <p><strong>Student Name:</strong> ${studentData.Student_Name}</p>
                <p><strong>AIMS ID:</strong> ${studentData.AIMS_Id}</p>
                <p><strong>Comment:</strong> ${message}</p>
                <p><strong>From:</strong> ${fromUserData.User_Details_Name}</p>
              </div>
              <p style="margin-top: 20px;">Please login to the system to respond to the comment.</p>
            </body>
          </html>
        `;

          const textContent = `
Comment Notification

Dear ${userData.User_Details_Name},

You were tagged in a comment by ${fromUserData.User_Details_Name} on ${formattedDate}:

- Student Name: ${studentData.Student_Name}
- AIMS ID: ${studentData.AIMS_Id}
- Comment: ${message}
- From: ${fromUserData.User_Details_Name}

Please login to the system to respond.
        `;

          try {
            const emailResponse = await axios.post(
              "https://api.brevo.com/v3/smtp/email",
              {
                sender: { name: senderName, email: senderEmail },
                to: [
                  { email: userData.Email, name: userData.User_Details_Name },
                ],
                subject,
                htmlContent,
                textContent,
              },
              {
                headers: {
                  "Content-Type": "application/json",
                  "api-key": apiKey,
                },
              }
            );
            console.log(`Email sent to ${userData.Email}:`, emailResponse.data);
          } catch (emailErr) {
            console.error(
              `Failed to email ${userData.Email}:`,
              emailErr.message
            );
          }
        }

        if (callback) return callback(null, "Emails sent.");
        return "Emails sent.";
      } catch (queryErr) {
        if (connection) connection.release();
        console.error("Query error:", queryErr);
        if (callback) return callback(queryErr, null);
        throw queryErr;
      }
    } catch (err) {
      console.error("Error in Save_Comments_Email:", err);
      if (callback) return callback(err, null);
      throw err;
    }
  },

  Load_Exist_Channels(Selected_User_, Login_User_, callback) {
    return db.query(
      "CALL Load_Exist_Channels(?, ?)",
      [Selected_User_, Login_User_],
      callback
    );
  },

  Load_old_messages(Channel_Id_Temp_, callback) {
    return db.query("CALL Load_old_messages(?)", [Channel_Id_Temp_], callback);
  },

  Group_Save(Group_, callback) {
    const Users_ = Group_.Group_Users || [];
    const Group_Name = Group_.Group_Name || "";
    const From_User = Group_.From_User || 0;
    const From_UserName = Group_.From_UserName || "";
    const Channel_Type = Group_.Channel_Type || "";

    return db.query(
      "CALL Group_Save(?, ?, ?, ?, ?)",
      [
        JSON.stringify(Users_),
        Group_Name,
        From_User,
        From_UserName,
        Channel_Type,
      ],
      callback
    );
  },

  Load_Channels(Login_User_Id_, callback) {
    return db.query("CALL Load_Channels(?)", [Login_User_Id_], callback);
  },

  Reset_CurrentChannel_Count(Channel_Id_Temp_, Login_User_, callback) {
    return db.query(
      "CALL Reset_CurrentChannel_Count(?, ?)",
      [Channel_Id_Temp_, Login_User_],
      callback
    );
  },

  Delete_Channel(Channel_Id_, callback) {
    return db.query("CALL Delete_Channel(?)", [Channel_Id_], callback);
  },

  Edit_Group(Channel_Id_, Edited_Name_, callback) {
    return db.query(
      "CALL Edit_Group(?, ?)",
      [Channel_Id_, Edited_Name_],
      callback
    );
  },
};
module.exports = Chat_Window;
