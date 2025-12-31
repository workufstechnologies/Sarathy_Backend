var express = require("express");
var router = express.Router();
var Email_Template = require("../models/Email_Template");
const cheerio = require("cheerio");
const sgMail = require("@sendgrid/mail");
const db = require("../dbconnection");
sgMail.setApiKey(
  "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"
);

router.get("/Get_All_Email_Template_Fields", async (req, res, next) => {
  try {
    Email_Template.Get_All_Email_Template_Fields((err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows[0]);
    });
  } catch (error) {
    console.error("Error fetching email template fields:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/Get_All_Email_Templates", async (req, res, next) => {
  try {
    const name = req.query.name || "";
    Email_Template.Get_All_Email_Templates(name, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  } catch (error) {
    console.error("Error fetching email templates:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/Save_Email_Template", async (req, res, next) => {
  try {
    const templateData = {
      id: req.body.id || 0,
      name: req.body.name,
      subject: req.body.subject,
      body: req.body.body,
      created_by: req.body.created_by,
      updated_by: req.body.updated_by,
      attachments: req.body.attachments || "",
      brevo_template_id: req.body.brevo_template_id,
      document_id: req.body.document_id || null,
      document_name: req.body.document_name || null,
    };
    console.log("req.body.document_name: ", req.body.document_name);
    console.log("templateData: ", templateData);
    Email_Template.Save_Email_Template(templateData, (err, result) => {
      if (err) {
        console.error("Error saving email template:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({
        success: true,
        message:
          templateData.id === 0
            ? "Email template created successfully"
            : "Email template updated successfully",
        id: result[0][0].id,
      });
    });
  } catch (error) {
    console.error("Error in save email template route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/Delete_Email_Template/:id", async (req, res, next) => {
  try {
    const templateId = req.params.id;

    Email_Template.Delete_Email_Template(templateId, (err, result) => {
      if (err) {
        console.error("Error deleting email template:", err);
        return res.status(500).json({ error: err.message });
      }

      const affectedRows = result[0][0].affected_rows;
      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Email template not found",
        });
      }

      res.json({
        success: true,
        message: "Email template deleted successfully",
      });
    });
  } catch (error) {
    console.error("Error in delete email template route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.post("/Send_Email_Template", async (req, res, next) => {
  try {
    // DEBUGGING: Log the entire request body
    console.log("=== EMAIL TEMPLATE REQUEST DEBUG ===");
    console.log("Full req.body:", JSON.stringify(req.body, null, 2));
    console.log("=====================================");

    const { 
      Template_Id, 
      Template_Body, 
      subject, 
      Student_Id, 
      Application_details_Id1, 
      Send_To_User, 
      User_Id 
    } = req.body;
    
    console.log('subject: ', subject);
    console.log('Application_details_Id1: ', Application_details_Id1);
    console.log('Student_Id: ', Student_Id);
    console.log('Template_Id: ', Template_Id);
    console.log('Send_To_User: ', Send_To_User);
    console.log('User_Id: ', User_Id);

    // Determine recipient based on Send_To_User flag
    const isToUser = Send_To_User && User_Id && User_Id !== 0;
    let recipientData = null;
    
    if (isToUser) {
      // Get user data for recipient
      const [userRows] = await db.promise().query(
        `SELECT User_Details_Id, User_Details_Name, Email, Mobile FROM user_details 
         WHERE User_Details_Id = ? AND DeleteStatus = FALSE`,
        [User_Id]
      );

      if (userRows.length === 0) {
        return res.status(400).json({ error: "User not found" });
      }

      recipientData = userRows[0];
      
      if (!recipientData.Email || !recipientData.Email.includes('@')) {
        return res.status(400).json({ error: 'Invalid user email format' });
      }

      console.log(`Email will be sent to user: ${recipientData.User_Details_Name} (${recipientData.Email})`);
    } else {
      // Get student data for recipient (default behavior)
      const [studentRows] = await db.promise().query(
        `SELECT Student_Id, Student_Name, Email, Phone_Number FROM student 
         WHERE Student_Id = ? AND DeleteStatus = 0`,
        [Student_Id]
      );

      if (studentRows.length === 0) {
        return res.status(400).json({ error: "Student not found" });
      }

      recipientData = studentRows[0];
      
      if (!recipientData.Email || !recipientData.Email.includes('@')) {
        return res.status(400).json({ error: 'Invalid student email format' });
      }

      console.log(`Email will be sent to student: ${recipientData.Student_Name} (${recipientData.Email})`);
    }

    // Enhanced error handling for missing Application_details_Id
    let finalApplicationId = Application_details_Id1;
    
    if (!finalApplicationId && Student_Id) {
      console.log("Application_details_Id is missing, attempting to find it using Student_Id...");
      
      try {
        const [applicationRows] = await db.promise().query(
          `SELECT Application_details_Id, University_Id FROM application_details 
           WHERE Student_Id = ? AND DeleteStatus = 0 
           ORDER BY Application_details_Id DESC LIMIT 1`, 
          [Student_Id]
        );
        
        if (applicationRows.length > 0) {
          finalApplicationId = applicationRows[0].Application_details_Id;
          console.log(`Found Application_details_Id: ${finalApplicationId} for Student_Id: ${Student_Id}`);
        } else {
          return res.status(400).json({
            error: "No application found for this student",
            student_id: Student_Id
          });
        }
      } catch (dbError) {
        console.error("Error fetching Application_details_Id:", dbError);
        return res.status(500).json({
          error: "Database error while fetching application details",
          details: dbError.message
        });
      }
    }

    // Get student data for template replacements (even when sending to user)
    let studentData = null;
    if (Student_Id) {
      const [studentRows] = await db.promise().query(
        `SELECT Student_Id, Student_Name, Email, Phone_Number FROM student 
         WHERE Student_Id = ? AND DeleteStatus = 0`,
        [Student_Id]
      );
      
      if (studentRows.length > 0) {
        studentData = studentRows[0];
      }
    }

    // Brevo configuration
    const axios = require("axios");
    const apiKey = process.env.BREVO_API_KEY || "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";
    const senderEmail = process.env.BREVO_SENDER_EMAIL || "ufsdev123@gmail.com";
    const senderName = process.env.BREVO_SENDER_NAME || "Application System";
    
    // Helper functions
    function escapeRegExp(string) {
      if (!string || typeof string !== 'string') {
        return '';
      }
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function isValidUrl(string) {
      try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch (error) {
        return false;
      }
    }

    // Updated function to handle AWS S3 URLs correctly
    function formatFileUrl(filePath, isAwsKey = false) {
      if (!filePath) return null;
      
      // If it's already a full URL, return as is
      if (isValidUrl(filePath)) {
        return filePath;
      }
      
      // If it's an AWS key (like "Aimbrits/University/27/57g1zwyyg6w_20250522121420309.png")
      if (isAwsKey || filePath.includes('Aimbrits/')) {
        return `https://ufsnabeelphotoalbum.s3.us-east-2.amazonaws.com/${filePath}`;
      }
      
      // For local files
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
      return `${baseUrl}/${cleanPath}`;
    }

    // Initialize attachments array
    let formattedAttachments = [];

    // *** MAIN FEATURE: Get university document based on email template document_id ***
    if (Template_Id && finalApplicationId) {
      try {
        console.log(`Checking email template ${Template_Id} for document_id...`);
        
        // Get the email template's document_id
        const [templateRows] = await db.promise().query(
          `SELECT document_id, document_name FROM email_templates 
           WHERE id = ? AND Delete_Status = 0`,
          [Template_Id]
        );
        
        if (templateRows.length > 0 && templateRows[0].document_id) {
          const templateDocumentId = templateRows[0].document_id;
          const templateDocumentName = templateRows[0].document_name;
          console.log(`Email template has document_id: ${templateDocumentId}, document_name: ${templateDocumentName}`);
          
          // Get the university from the application
          const [appRows] = await db.promise().query(
            `SELECT University_Id FROM application_details 
             WHERE Application_details_Id = ? AND DeleteStatus = 0`,
            [finalApplicationId]
          );
          
          if (appRows.length > 0 && appRows[0].University_Id) {
            const universityId = appRows[0].University_Id;
            console.log(`Application is for University ID: ${universityId}`);
            
            // Get university document that matches the template's document_id
            const [universityDocRows] = await db.promise().query(
              `SELECT 
                 File_Name, 
                 Document_Name, 
                 AWS_Key,
                 Original_File_Name,
                 Documents,
                 University_Name
               FROM university 
               WHERE University_Id = ? AND Document_Id = ? AND DeleteStatus = 0`,
              [universityId, templateDocumentId]
            );
            
            if (universityDocRows.length > 0) {
              const universityDoc = universityDocRows[0];
              console.log(`Found university document matching template document_id:`, universityDoc);
              
              let attachmentUrl = null;
              let attachmentName = templateDocumentName || universityDoc.Document_Name || 'University Document';
              
              // Priority 1: AWS_Key (Most reliable for your setup)
              if (universityDoc.AWS_Key && 
                  universityDoc.AWS_Key !== 'null' && 
                  universityDoc.AWS_Key.trim() !== '') {
                
                attachmentUrl = formatFileUrl(universityDoc.AWS_Key, true);
                console.log(`Using AWS_Key for attachment: ${attachmentUrl}`);
                
                if (universityDoc.Original_File_Name && universityDoc.Original_File_Name !== 'null') {
                  attachmentName = universityDoc.Original_File_Name;
                }
              } 
              // Priority 2: File_Name 
              else if (universityDoc.File_Name && 
                       universityDoc.File_Name !== 'null' && 
                       universityDoc.File_Name.trim() !== '') {
                
                // Check if File_Name is already an AWS key format
                if (universityDoc.File_Name.includes('Aimbrits/University/')) {
                  attachmentUrl = formatFileUrl(universityDoc.File_Name, true);
                  console.log(`File_Name appears to be AWS key: ${attachmentUrl}`);
                } else {
                  // Treat as local file
                  const baseDocumentPath = process.env.DOCUMENT_BASE_PATH || 'uploads/university_documents';
                  const fullFilePath = `${baseDocumentPath}/${universityDoc.File_Name}`;
                  attachmentUrl = formatFileUrl(fullFilePath);
                  console.log(`Using File_Name as local file: ${attachmentUrl}`);
                }
                
                if (universityDoc.Original_File_Name && universityDoc.Original_File_Name !== 'null') {
                  attachmentName = universityDoc.Original_File_Name;
                } else {
                  attachmentName = universityDoc.File_Name;
                }
              } 
              // Priority 3: Documents JSON
              else if (universityDoc.Documents && universityDoc.Documents !== 'null') {
                try {
                  const documents = JSON.parse(universityDoc.Documents);
                  console.log('Checking Documents JSON:', documents);
                  
                  if (Array.isArray(documents) && documents.length > 0) {
                    const firstDoc = documents[0];
                    if (firstDoc && firstDoc !== 'null' && firstDoc.trim() !== '') {
                      
                      // Check if it's an AWS key format
                      if (firstDoc.includes('Aimbrits/University/')) {
                        attachmentUrl = formatFileUrl(firstDoc, true);
                        console.log(`Documents JSON contains AWS key: ${attachmentUrl}`);
                      } else {
                        // Treat as filename and construct AWS path
                        const awsKey = `Aimbrits/University/${universityId}/${firstDoc}`;
                        attachmentUrl = formatFileUrl(awsKey, true);
                        console.log(`Constructed AWS key from Documents JSON: ${attachmentUrl}`);
                      }
                      
                      attachmentName = universityDoc.Original_File_Name || firstDoc;
                    }
                  }
                } catch (parseError) {
                  console.error('Error parsing Documents JSON:', parseError);
                }
              }
              
              // Add the university document as attachment if we found a valid URL
              if (attachmentUrl && isValidUrl(attachmentUrl)) {
                formattedAttachments.push({
                  name: attachmentName,
                  url: attachmentUrl
                });
                console.log(`✅ Added university document from template: ${attachmentName} -> ${attachmentUrl}`);
              } else {
                console.log(`❌ No valid URL found for university document matching template document_id ${templateDocumentId}`);
              }
            } else {
              console.log(`❌ No university document found matching template document_id ${templateDocumentId} for university ${universityId}`);
            }
          } else {
            console.log('❌ No university found for this application');
          }
        } else {
          console.log('ℹ️ Email template has no document_id specified');
        }
      } catch (templateDocError) {
        console.error("Error fetching university document for template:", templateDocError);
      }
    }

    // Get regular template attachments
    if (Template_Id) {
      try {
        const [attachmentRows] = await db.promise().query(
          `SELECT file_name, file_path FROM email_template_attachments 
           WHERE template_id = ? AND delete_status = 0 AND status = 1`,
          [Template_Id]
        );
        
        console.log(`Found ${attachmentRows.length} regular template attachments`);
        
        for (const attachment of attachmentRows) {
          const isValidFileName = attachment.file_name && 
                                attachment.file_name !== 'null' && 
                                attachment.file_name !== '' && 
                                attachment.file_name.trim() !== '';
          
          const isValidFilePath = attachment.file_path && 
                                attachment.file_path !== 'null' && 
                                attachment.file_path !== '' && 
                                attachment.file_path.trim() !== '';
          
          if (isValidFileName && isValidFilePath) {
            const formattedUrl = formatFileUrl(attachment.file_path);
            
            if (formattedUrl && isValidUrl(formattedUrl)) {
              formattedAttachments.push({
                name: attachment.file_name,
                url: formattedUrl
              });
              console.log(`✅ Added template attachment: ${attachment.file_name} -> ${formattedUrl}`);
            }
          }
        }
      } catch (attachmentError) {
        console.error("Error fetching template attachments:", attachmentError);
      }
    }

    console.log(`📎 Total attachments prepared: ${formattedAttachments.length}`);
    formattedAttachments.forEach((att, index) => {
      console.log(`   ${index + 1}. ${att.name} -> ${att.url}`);
    });

    // Process template and send email
    try {
      // Simple template processing
      let processedTemplate = Template_Body;
      
      // Replace placeholders with appropriate data
      if (studentData) {
        processedTemplate = processedTemplate.replace(/\{\{Student_Name\}\}/g, studentData.Student_Name || '');
        processedTemplate = processedTemplate.replace(/\{\{Email\}\}/g, studentData.Email || '');
        processedTemplate = processedTemplate.replace(/\{\{Phone_Number\}\}/g, studentData.Phone_Number || '');
        processedTemplate = processedTemplate.replace(/\{\{Student_Id\}\}/g, studentData.Student_Id || '');
      }
      
      // Replace user placeholders if sending to user
      if (isToUser && recipientData.User_Details_Name) {
        processedTemplate = processedTemplate.replace(/\{\{User_Details_Name\}\}/g, recipientData.User_Details_Name || '');
      } else {
        // If sending to student, remove user placeholders
        processedTemplate = processedTemplate.replace(/\{\{User_Details_Name\}\}/g, '');
      }

      const emailPayload = {
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [
          {
            email: recipientData.Email,
            name: recipientData.Student_Name || recipientData.User_Details_Name || "Recipient",
          },
        ],
        subject: subject || "Email Notification",
        htmlContent: processedTemplate
      };

      // Add valid attachments
      if (formattedAttachments.length > 0) {
        const validAttachments = formattedAttachments.filter(att => {
          const hasValidName = att.name && 
                             att.name !== 'null' && 
                             att.name !== '' && 
                             att.name.trim() !== '';
          
          const hasValidUrl = att.url && 
                            att.url !== 'null' && 
                            att.url !== '' && 
                            att.url.trim() !== '' &&
                            !att.url.includes('/null') &&
                            isValidUrl(att.url);
          
          const isValid = hasValidName && hasValidUrl;
          
          if (!isValid) {
            console.error(`❌ Skipping invalid attachment - name: "${att.name}", url: "${att.url}"`);
          }
          return isValid;
        });

        if (validAttachments.length > 0) {
          emailPayload.attachment = validAttachments;
          console.log(`📎 Including ${validAttachments.length} valid attachments`);
        }
      }

      console.log("📧 Sending email with Brevo API...");

      // Create axios instance with better SSL handling and retry logic
      const axiosConfig = {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
        timeout: 30000, // 30 second timeout
        httpsAgent: new (require('https').Agent)({
          rejectUnauthorized: true,
          secureProtocol: 'TLSv1_2_method', // Force TLS 1.2
          ciphers: [
            'ECDHE-RSA-AES128-GCM-SHA256',
            'ECDHE-RSA-AES256-GCM-SHA384',
            'ECDHE-RSA-AES128-SHA256',
            'ECDHE-RSA-AES256-SHA384'
          ].join(':'),
          honorCipherOrder: true
        }),
        // Add retry configuration
        maxRedirects: 5,
        validateStatus: function (status) {
          return status < 500; // Resolve only if the status code is less than 500
        }
      };

      // Implement retry logic
      let emailResponse;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          console.log(`Attempt ${retryCount + 1} to send email...`);
          
          emailResponse = await axios.post(
            "https://api.brevo.com/v3/smtp/email",
            emailPayload,
            axiosConfig
          );
          
          // If successful, break out of retry loop
          break;
          
        } catch (retryError) {
          retryCount++;
          console.error(`Attempt ${retryCount} failed:`, retryError.message);
          
          // If this was the last retry, throw the error
          if (retryCount >= maxRetries) {
            throw retryError;
          }
          
          // Wait before retrying (exponential backoff)
          const waitTime = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
          console.log(`Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }

      const recipientName = recipientData.Student_Name || recipientData.User_Details_Name;
      console.log(`✅ Email sent successfully to ${recipientName} (${recipientData.Email})!`);

      res.json({
        success: true,
        message: `Email sent successfully to ${recipientName}`,
        messageId: emailResponse.data.messageId,
        attachments_count: emailPayload.attachment ? emailPayload.attachment.length : 0,
        attachments_details: emailPayload.attachment || [],
        recipient_type: isToUser ? 'user' : 'student'
      });

    } catch (sendError) {
      console.error("❌ Brevo API Error:", sendError.response?.data || sendError.message);
      
      return res.status(500).json({
        error: "Failed to send email via Brevo API",
        details: sendError.response?.data || sendError.message
      });
    }

  } catch (error) {
    console.error("❌ Error in send email template route:", error);
    res.status(500).json({ 
      error: "Internal Server Error",
      details: error.message 
    });
  }
});

// router.post("/Send_Email_Template", async (req, res, next) => {
//   try {
//     // DEBUGGING: Log the entire request body
//     console.log("=== EMAIL TEMPLATE REQUEST DEBUG ===");
//     console.log("Full req.body:", JSON.stringify(req.body, null, 2));
//     console.log("=====================================");

//     const { Template_Id, Template_Body, subject, Student_Id, Application_details_Id } = req.body;
    
//     console.log('subject: ', subject);
//     console.log('Application_details_Id: ', Application_details_Id);
//     console.log('Student_Id: ', Student_Id);
//     console.log('Template_Id: ', Template_Id);

//     // Enhanced error handling for missing Application_details_Id
//     let finalApplicationId = Application_details_Id;
    
//     if (!finalApplicationId && Student_Id) {
//       console.log("Application_details_Id is missing, attempting to find it using Student_Id...");
      
//       try {
//         const [applicationRows] = await db.promise().query(
//           `SELECT Application_details_Id, University_Id FROM application_details 
//            WHERE Student_Id = ? AND DeleteStatus = 0 
//            ORDER BY Application_details_Id DESC LIMIT 1`,
//           [Student_Id]
//         );
        
//         if (applicationRows.length > 0) {
//           finalApplicationId = applicationRows[0].Application_details_Id;
//           console.log(`Found Application_details_Id: ${finalApplicationId} for Student_Id: ${Student_Id}`);
//         } else {
//           return res.status(400).json({
//             error: "No application found for this student",
//             student_id: Student_Id
//           });
//         }
//       } catch (dbError) {
//         console.error("Error fetching Application_details_Id:", dbError);
//         return res.status(500).json({
//           error: "Database error while fetching application details",
//           details: dbError.message
//         });
//       }
//     }

//     // Brevo configuration
//     const axios = require("axios");
//     const apiKey = process.env.BREVO_API_KEY || "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";
//     const senderEmail = process.env.BREVO_SENDER_EMAIL || "ufsdev123@gmail.com";
//     const senderName = process.env.BREVO_SENDER_NAME || "Application System";
    
//     // Helper functions
//     function escapeRegExp(string) {
//       if (!string || typeof string !== 'string') {
//         return '';
//       }
//       return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
//     }

//     function isValidUrl(string) {
//       try {
//         const url = new URL(string);
//         return url.protocol === 'http:' || url.protocol === 'https:';
//       } catch (error) {
//         return false;
//       }
//     }

//     // Updated function to handle AWS S3 URLs correctly
//     function formatFileUrl(filePath, isAwsKey = false) {
//       if (!filePath) return null;
      
//       // If it's already a full URL, return as is
//       if (isValidUrl(filePath)) {
//         return filePath;
//       }
      
//       // If it's an AWS key (like "Aimbrits/University/27/57g1zwyyg6w_20250522121420309.png")
//       if (isAwsKey || filePath.includes('Aimbrits/')) {
//         return `https://ufsnabeelphotoalbum.s3.us-east-2.amazonaws.com/${filePath}`;
//       }
      
//       // For local files
//       const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
//       const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
//       return `${baseUrl}/${cleanPath}`;
//     }
    
//     // Get student data first
//     const [studentRows] = await db.promise().query(
//       `SELECT Student_Id, Student_Name, Email, Phone_Number FROM student 
//        WHERE Student_Id = ? AND DeleteStatus = 0`,
//       [Student_Id]
//     );

//     if (studentRows.length === 0) {
//       return res.status(400).json({ error: "Student not found" });
//     }

//     const studentData = studentRows[0];
    
//     if (!studentData.Email || !studentData.Email.includes('@')) {
//       return res.status(400).json({ error: 'Invalid student email format' });
//     }

//     console.log(`Student found: ${studentData.Student_Name} (${studentData.Email})`);

//     // Initialize attachments array
//     let formattedAttachments = [];

//     // *** MAIN FEATURE: Get university document based on email template document_id ***
//     if (Template_Id && finalApplicationId) {
//       try {
//         console.log(`Checking email template ${Template_Id} for document_id...`);
        
//         // Get the email template's document_id
//         const [templateRows] = await db.promise().query(
//           `SELECT document_id FROM email_templates 
//            WHERE id = ? AND Delete_Status = 0`,
//           [Template_Id]
//         );
        
//         if (templateRows.length > 0 && templateRows[0].document_id) {
//           const templateDocumentId = templateRows[0].document_id;
//           const templateDocumentName = templateRows[0].document_name;
//           console.log(`Email template has document_id: ${templateDocumentId}, document_name: ${templateDocumentName}`);
          
//           // Get the university from the application
//           const [appRows] = await db.promise().query(
//             `SELECT University_Id FROM application_details 
//              WHERE Application_details_Id = ? AND DeleteStatus = 0`,
//             [finalApplicationId]
//           );
          
//           if (appRows.length > 0 && appRows[0].University_Id) {
//             const universityId = appRows[0].University_Id;
//             console.log(`Application is for University ID: ${universityId}`);
            
//             // Get university document that matches the template's document_id
//             const [universityDocRows] = await db.promise().query(
//               `SELECT 
//                  File_Name, 
//                  Document_Name, 
          
                
                
//                  University_Name
//                FROM university 
//                WHERE University_Id = ? AND Document_Id = ? AND DeleteStatus = 0`,
//               [universityId, templateDocumentId]
//             );
            
//             if (universityDocRows.length > 0) {
//               const universityDoc = universityDocRows[0];
//               console.log(`Found university document matching template document_id:`, universityDoc);
              
//               let attachmentUrl = null;
//               let attachmentName = templateDocumentName || universityDoc.Document_Name || 'University Document';
              
//               // Priority 1: AWS_Key (Most reliable for your setup)
//               if (universityDoc.AWS_Key && 
//                   universityDoc.AWS_Key !== 'null' && 
//                   universityDoc.AWS_Key.trim() !== '') {
                
//                 attachmentUrl = formatFileUrl(universityDoc.AWS_Key, true);
//                 console.log(`Using AWS_Key for attachment: ${attachmentUrl}`);
                
//                 if (universityDoc.Original_File_Name && universityDoc.Original_File_Name !== 'null') {
//                   attachmentName = universityDoc.Original_File_Name;
//                 }
//               } 
//               // Priority 2: File_Name 
//               else if (universityDoc.File_Name && 
//                        universityDoc.File_Name !== 'null' && 
//                        universityDoc.File_Name.trim() !== '') {
                
//                 // Check if File_Name is already an AWS key format
//                 if (universityDoc.File_Name.includes('Aimbrits/University/')) {
//                   attachmentUrl = formatFileUrl(universityDoc.File_Name, true);
//                   console.log(`File_Name appears to be AWS key: ${attachmentUrl}`);
//                 } else {
//                   // Treat as local file
//                   const baseDocumentPath = process.env.DOCUMENT_BASE_PATH || 'uploads/university_documents';
//                   const fullFilePath = `${baseDocumentPath}/${universityDoc.File_Name}`;
//                   attachmentUrl = formatFileUrl(fullFilePath);
//                   console.log(`Using File_Name as local file: ${attachmentUrl}`);
//                 }
                
//                 if (universityDoc.Original_File_Name && universityDoc.Original_File_Name !== 'null') {
//                   attachmentName = universityDoc.Original_File_Name;
//                 } else {
//                   attachmentName = universityDoc.File_Name;
//                 }
//               } 
//               // Priority 3: Documents JSON
//               else if (universityDoc.Documents && universityDoc.Documents !== 'null') {
//                 try {
//                   const documents = JSON.parse(universityDoc.Documents);
//                   console.log('Checking Documents JSON:', documents);
                  
//                   if (Array.isArray(documents) && documents.length > 0) {
//                     const firstDoc = documents[0];
//                     if (firstDoc && firstDoc !== 'null' && firstDoc.trim() !== '') {
                      
//                       // Check if it's an AWS key format
//                       if (firstDoc.includes('Aimbrits/University/')) {
//                         attachmentUrl = formatFileUrl(firstDoc, true);
//                         console.log(`Documents JSON contains AWS key: ${attachmentUrl}`);
//                       } else {
//                         // Treat as filename and construct AWS path
//                         const awsKey = `Aimbrits/University/${universityId}/${firstDoc}`;
//                         attachmentUrl = formatFileUrl(awsKey, true);
//                         console.log(`Constructed AWS key from Documents JSON: ${attachmentUrl}`);
//                       }
                      
//                       attachmentName = universityDoc.Original_File_Name || firstDoc;
//                     }
//                   }
//                 } catch (parseError) {
//                   console.error('Error parsing Documents JSON:', parseError);
//                 }
//               }
              
//               // Add the university document as attachment if we found a valid URL
//               if (attachmentUrl && isValidUrl(attachmentUrl)) {
//                 formattedAttachments.push({
//                   name: attachmentName,
//                   url: attachmentUrl
//                 });
//                 console.log(`✅ Added university document from template: ${attachmentName} -> ${attachmentUrl}`);
//               } else {
//                 console.log(`❌ No valid URL found for university document matching template document_id ${templateDocumentId}`);
//               }
//             } else {
//               console.log(`❌ No university document found matching template document_id ${templateDocumentId} for university ${universityId}`);
//             }
//           } else {
//             console.log('❌ No university found for this application');
//           }
//         } else {
//           console.log('ℹ️ Email template has no document_id specified');
//         }
//       } catch (templateDocError) {
//         console.error("Error fetching university document for template:", templateDocError);
//       }
//     }

//     // Get regular template attachments
//     if (Template_Id) {
//       try {
//         const [attachmentRows] = await db.promise().query(
//           `SELECT file_name, file_path FROM email_template_attachments 
//            WHERE template_id = ? AND delete_status = 0 AND status = 1`,
//           [Template_Id]
//         );
        
//         console.log(`Found ${attachmentRows.length} regular template attachments`);
        
//         for (const attachment of attachmentRows) {
//           const isValidFileName = attachment.file_name && 
//                                 attachment.file_name !== 'null' && 
//                                 attachment.file_name !== '' && 
//                                 attachment.file_name.trim() !== '';
          
//           const isValidFilePath = attachment.file_path && 
//                                 attachment.file_path !== 'null' && 
//                                 attachment.file_path !== '' && 
//                                 attachment.file_path.trim() !== '';
          
//           if (isValidFileName && isValidFilePath) {
//             const formattedUrl = formatFileUrl(attachment.file_path);
            
//             if (formattedUrl && isValidUrl(formattedUrl)) {
//               formattedAttachments.push({
//                 name: attachment.file_name,
//                 url: formattedUrl
//               });
//               console.log(`✅ Added template attachment: ${attachment.file_name} -> ${formattedUrl}`);
//             }
//           }
//         }
//       } catch (attachmentError) {
//         console.error("Error fetching template attachments:", attachmentError);
//       }
//     }

//     console.log(`📎 Total attachments prepared: ${formattedAttachments.length}`);
//     formattedAttachments.forEach((att, index) => {
//       console.log(`   ${index + 1}. ${att.name} -> ${att.url}`);
//     });

//     // Process template and send email
//     try {
//       // Simple template processing (you can expand this based on your needs)
//       let processedTemplate = Template_Body;
      
//       // Replace basic student placeholders
//       processedTemplate = processedTemplate.replace(/\{\{Student_Name\}\}/g, studentData.Student_Name || '');
//       processedTemplate = processedTemplate.replace(/\{\{Email\}\}/g, studentData.Email || '');
//       processedTemplate = processedTemplate.replace(/\{\{Phone_Number\}\}/g, studentData.Phone_Number || '');
//       processedTemplate = processedTemplate.replace(/\{\{Student_Id\}\}/g, studentData.Student_Id || '');

//       const emailPayload = {
//         sender: {
//           name: senderName,
//           email: senderEmail,
//         },
//         to: [
//           {
//             email: studentData.Email,
//             name: studentData.Student_Name || "Student",
//           },
//         ],
//         subject: subject || "Email Notification",
//         htmlContent: processedTemplate
//       };

//       // Add valid attachments
//       if (formattedAttachments.length > 0) {
//         const validAttachments = formattedAttachments.filter(att => {
//           const hasValidName = att.name && 
//                              att.name !== 'null' && 
//                              att.name !== '' && 
//                              att.name.trim() !== '';
          
//           const hasValidUrl = att.url && 
//                             att.url !== 'null' && 
//                             att.url !== '' && 
//                             att.url.trim() !== '' &&
//                             !att.url.includes('/null') &&
//                             isValidUrl(att.url);
          
//           const isValid = hasValidName && hasValidUrl;
          
//           if (!isValid) {
//             console.error(`❌ Skipping invalid attachment - name: "${att.name}", url: "${att.url}"`);
//           }
//           return isValid;
//         });

//         if (validAttachments.length > 0) {
//           emailPayload.attachment = validAttachments;
//           console.log(`📎 Including ${validAttachments.length} valid attachments`);
//         }
//       }

//       console.log("📧 Sending email with Brevo API...");

//       const emailResponse = await axios.post(
//         "https://api.brevo.com/v3/smtp/email",
//         emailPayload,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             "api-key": apiKey,
//           },
//         }
//       );

//       console.log(`✅ Email sent successfully to ${studentData.Student_Name} (${studentData.Email})!`);

//       res.json({
//         success: true,
//         message: `Email sent successfully to ${studentData.Student_Name}`,
//         messageId: emailResponse.data.messageId,
//         attachments_count: emailPayload.attachment ? emailPayload.attachment.length : 0,
//         attachments_details: emailPayload.attachment || []
//       });

//     } catch (sendError) {
//       console.error("❌ Brevo API Error:", sendError.response?.data || sendError.message);
      
//       return res.status(500).json({
//         error: "Failed to send email via Brevo API",
//         details: sendError.response?.data || sendError.message
//       });
//     }

//   } catch (error) {
//     console.error("❌ Error in send email template route:", error);
//     res.status(500).json({ 
//       error: "Internal Server Error",
//       details: error.message 
//     });
//   }
// });

//   try {
//     const { Template_Id, Template_Body, subject, Student_Id, Application_details_Id } = req.body;
//     console.log("Template_Body:", Template_Body);
    
//     // Brevo configuration
//     const axios = require("axios");
//     const apiKey = process.env.BREVO_API_KEY || "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";
//     const senderEmail = process.env.BREVO_SENDER_EMAIL || "ufsdev123@gmail.com";
//     const senderName = process.env.BREVO_SENDER_NAME || "Application System";
    
//     // Helper function to escape special regex characters
//     function escapeRegExp(string) {
//       if (!string || typeof string !== 'string') {
//         return '';
//       }
//       return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
//     }

//     // Helper function to validate URL
//     function isValidUrl(string) {
//       try {
//         const url = new URL(string);
//         return url.protocol === 'http:' || url.protocol === 'https:';
//       } catch (error) {
//         return false;
//       }
//     }

//     // Helper function to format file path to full URL
//     function formatFileUrl(filePath) {
//       if (!filePath) return null;
      
//       // If it's already a full URL, return as is
//       if (isValidUrl(filePath)) {
//         return filePath;
//       }
      
//       // If it's a relative path, convert to full URL
//       const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      
//       // Remove leading slash if present to avoid double slashes
//       const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
      
//       return `${baseUrl}/${cleanPath}`;
//     }
    
//     // Load template fields configuration
//     Email_Template.Get_All_Email_Template_Fields((err, fields) => {
//       if (err) {
//         console.error("Error fetching template fields:", err);
//         return res.status(500).json({ error: err.message });
//       }

//       const $ = cheerio.load(Template_Body);
//       const tableQueries = new Map();

//       // Process template fields with data-field-id attributes
//       $(".template-field").each((i, elem) => {
//         const fieldId = $(elem).attr("data-field-id");
//         const field = fields[0].find((f) => f.id.toString() === fieldId);

//         if (field) {
//           if (!tableQueries.has(field.table_name)) {
//             let queryConfig;
//             switch (field.table_name) {
//               case "student":
//                 queryConfig = {
//                   table: "student",
//                   columns: [],
//                   whereClause: "WHERE Student_Id = ? AND DeleteStatus = 0",
//                   paramId: Student_Id,
//                 };
//                 break;
//               case "application_details":
//                 queryConfig = {
//                   table: "application_details",
//                   columns: [],
//                   whereClause: "WHERE Application_details_Id = ? AND DeleteStatus = 0",
//                   paramId: Application_details_Id,
//                 };
//                 break;
//               case "university":
//                 queryConfig = {
//                   table: "university",
//                   columns: [],
//                   whereClause: "WHERE University_Id = ? AND DeleteStatus = 0",
//                   paramId: req.body.University_Id,
//                 };
//                 break;
//               default:
//                 queryConfig = {
//                   table: field.table_name,
//                   columns: [],
//                   whereClause: `WHERE ${field.table_name}_Id = ?`,
//                   paramId: req.body[`${field.table_name}_Id`],
//                 };
//             }
//             tableQueries.set(field.table_name, queryConfig);
//           }
//           tableQueries.get(field.table_name).columns.push(field.column_name);
//         }
//       });

//       // Auto-detect needed tables based on placeholders in template
//       const placeholderPattern = /\{\{([^}]+)\}\}/g;
//       const placeholders = [];
//       let match;
//       while ((match = placeholderPattern.exec(Template_Body)) !== null) {
//         placeholders.push(match[1]);
//       }

//       console.log("Found placeholders:", placeholders);

//       // Check which tables we need based on common field patterns
//       if (placeholders.some(p => ['Student_Name', 'Email', 'Phone_Number', 'Student_Id'].includes(p))) {
//         if (!tableQueries.has('student')) {
//           tableQueries.set('student', {
//             table: "student",
//             columns: ['Student_Id', 'Student_Name', 'Email', 'Phone_Number'],
//             whereClause: "WHERE Student_Id = ? AND DeleteStatus = 0",
//             paramId: Student_Id,
//           });
//         }
//       }

//       if (placeholders.some(p => ['Application_details_Id', 'University_Id', 'Course_Id', 'Country_Id', 'intake_Id'].includes(p)) && Application_details_Id) {
//         if (!tableQueries.has('application_details')) {
//           tableQueries.set('application_details', {
//             table: "application_details",
//             columns: ['Application_details_Id', 'University_Id', 'Course_Id', 'Country_Id', 'intake_Id'],
//             whereClause: "WHERE Application_details_Id = ? AND DeleteStatus = 0",
//             paramId: Application_details_Id,
//           });
//         }
//       }

//       // If we have application details, we might need related data
//       if (tableQueries.has('application_details')) {
//         if (placeholders.some(p => ['University_Name', 'University_Id'].includes(p))) {
//           if (!tableQueries.has('university')) {
//             tableQueries.set('university', {
//               table: "university",
//               columns: ['University_Id', 'University_Name'],
//               whereClause: "WHERE University_Id = ?",
//               paramId: null,
//             });
//           }
//         }

//         if (placeholders.some(p => ['Course_Name', 'Course_Id'].includes(p))) {
//           if (!tableQueries.has('course')) {
//             tableQueries.set('course', {
//               table: "course",
//               columns: ['Course_Id', 'Course_Name'],
//               whereClause: "WHERE Course_Id = ?",
//               paramId: null,
//             });
//           }
//         }

//         if (placeholders.some(p => ['Country_Name', 'Country_Id'].includes(p))) {
//           if (!tableQueries.has('country')) {
//             tableQueries.set('country', {
//               table: "country",
//               columns: ['Country_Id', 'Country_Name'],
//               whereClause: "WHERE Country_Id = ?",
//               paramId: null,
//             });
//           }
//         }

//         if (placeholders.some(p => ['intake_Name', 'intake_Id'].includes(p))) {
//           if (!tableQueries.has('intake')) {
//             tableQueries.set('intake', {
//               table: "intake",
//               columns: ['intake_Id', 'intake_Name'],
//               whereClause: "WHERE intake_Id = ?",
//               paramId: null,
//             });
//           }
//         }
//       }
      
//       console.log("tableQueries", tableQueries);

//       // Execute queries for each table and collect data
//       const executeQueries = async () => {
//         const results = [];
        
//         // First, execute queries that have paramId set
//         const initialQueries = Array.from(tableQueries.values())
//           .filter(tableInfo => tableInfo.paramId !== null)
//           .map((tableInfo) => {
//             return new Promise((resolve, reject) => {
//               Email_Template.Get_Template_Data(
//                 {
//                   ...tableInfo,
//                   params: [tableInfo.paramId],
//                 },
//                 (err, result) => {
//                   console.log(`Data from ${tableInfo.table}:`, result);
//                   if (err) {
//                     reject(err);
//                     return;
//                   }
//                   resolve({
//                     table: tableInfo.table,
//                     data: result[0] || {},
//                   });
//                 }
//               );
//             });
//           });

//         const initialResults = await Promise.all(initialQueries);
//         results.push(...initialResults);

//         // Get application_details data if available
//         const applicationData = initialResults.find(r => r.table === 'application_details')?.data;
        
//         // Now execute related queries using IDs from application_details
//         if (applicationData) {
//           const relatedQueries = [];
          
//           if (tableQueries.has('university') && applicationData.University_Id) {
//             const universityQuery = new Promise((resolve, reject) => {
//               Email_Template.Get_Template_Data(
//                 {
//                   table: "university",
//                   columns: ['University_Id', 'University_Name'],
//                   whereClause: "WHERE University_Id = ?",
//                   params: [applicationData.University_Id],
//                 },
//                 (err, result) => {
//                   console.log("University data:", result);
//                   if (err) {
//                     reject(err);
//                     return;
//                   }
//                   resolve({
//                     table: 'university',
//                     data: result[0] || {},
//                   });
//                 }
//               );
//             });
//             relatedQueries.push(universityQuery);
//           }

//           if (tableQueries.has('course') && applicationData.Course_Id) {
//             const courseQuery = new Promise((resolve, reject) => {
//               Email_Template.Get_Template_Data(
//                 {
//                   table: "course",
//                   columns: ['Course_Id', 'Course_Name'],
//                   whereClause: "WHERE Course_Id = ?",
//                   params: [applicationData.Course_Id],
//                 },
//                 (err, result) => {
//                   console.log("Course data:", result);
//                   if (err) {
//                     reject(err);
//                     return;
//                   }
//                   resolve({
//                     table: 'course',
//                     data: result[0] || {},
//                   });
//                 }
//               );
//             });
//             relatedQueries.push(courseQuery);
//           }

//           if (tableQueries.has('country') && applicationData.Country_Id) {
//             const countryQuery = new Promise((resolve, reject) => {
//               Email_Template.Get_Template_Data(
//                 {
//                   table: "country",
//                   columns: ['Country_Id', 'Country_Name'],
//                   whereClause: "WHERE Country_Id = ?",
//                   params: [applicationData.Country_Id],
//                 },
//                 (err, result) => {
//                   console.log("Country data:", result);
//                   if (err) {
//                     reject(err);
//                     return;
//                   }
//                   resolve({
//                     table: 'country',
//                     data: result[0] || {},
//                   });
//                 }
//               );
//             });
//             relatedQueries.push(countryQuery);
//           }

//           if (tableQueries.has('intake') && applicationData.intake_Id) {
//             const intakeQuery = new Promise((resolve, reject) => {
//               Email_Template.Get_Template_Data(
//                 {
//                   table: "intake",
//                   columns: ['intake_Id', 'intake_Name'],
//                   whereClause: "WHERE intake_Id = ?",
//                   params: [applicationData.intake_Id],
//                 },
//                 (err, result) => {
//                   console.log("Intake data:", result);
//                   if (err) {
//                     reject(err);
//                     return;
//                   }
//                   resolve({
//                     table: 'intake',
//                     data: result[0] || {},
//                   });
//                 }
//               );
//             });
//             relatedQueries.push(intakeQuery);
//           }

//           if (relatedQueries.length > 0) {
//             const relatedResults = await Promise.all(relatedQueries);
//             results.push(...relatedResults);
//           }
//         }

//         return results;
//       };

//       executeQueries()
//         .then(async (results) => {
//           const dataMap = results.reduce((acc, result) => {
//             acc[result.table] = result.data;
//             return acc;
//           }, {});

//           // Replace template field placeholders (for elements with data-field-id)
//           $(".template-field").each((i, elem) => {
//             const fieldId = $(elem).attr("data-field-id");
//             const field = fields[0].find((f) => f.id.toString() === fieldId);

//             if (field && dataMap[field.table_name]) {
//               const value = dataMap[field.table_name][field.column_name] || "";

//               $(elem)
//                 .contents()
//                 .filter(function () {
//                   return this.nodeType === 3;
//                 })
//                 .each(function () {
//                   this.nodeValue = this.nodeValue.replace(/\{\{\d+\}\}/g, value);
//                 });
//             }
//           });

//           $(".template-field").each(function () {
//             $(this).removeAttr("data-column data-field-id");
//           });

//           let processedTemplate = $.html();

//           console.log("Data available for replacement:", dataMap);
          
//           // Create comprehensive replacement array from all available data
//           const directReplacements = [];
          
//           if (dataMap.student) {
//             Object.keys(dataMap.student).forEach(key => {
//               directReplacements.push({
//                 placeholder: `{{${key}}}`,
//                 value: dataMap.student[key] || ''
//               });
//             });
//           }

//           if (dataMap.application_details) {
//             Object.keys(dataMap.application_details).forEach(key => {
//               directReplacements.push({
//                 placeholder: `{{${key}}}`,
//                 value: dataMap.application_details[key] || ''
//               });
//             });
//           }

//           if (dataMap.university) {
//             Object.keys(dataMap.university).forEach(key => {
//               directReplacements.push({
//                 placeholder: `{{${key}}}`,
//                 value: dataMap.university[key] || ''
//               });
//             });
//           }

//           if (dataMap.course) {
//             Object.keys(dataMap.course).forEach(key => {
//               directReplacements.push({
//                 placeholder: `{{${key}}}`,
//                 value: dataMap.course[key] || ''
//               });
//             });
//           }

//           if (dataMap.country) {
//             Object.keys(dataMap.country).forEach(key => {
//               directReplacements.push({
//                 placeholder: `{{${key}}}`,
//                 value: dataMap.country[key] || ''
//               });
//             });
//           }

//           if (dataMap.intake) {
//             Object.keys(dataMap.intake).forEach(key => {
//               directReplacements.push({
//                 placeholder: `{{${key}}}`,
//                 value: dataMap.intake[key] || ''
//               });
//             });
//           }

//           // Apply all direct replacements
//           directReplacements.forEach(replacement => {
//             if (processedTemplate.includes(replacement.placeholder)) {
//               console.log(`Replacing '${replacement.placeholder}' with '${replacement.value}'`);
//               const regex = new RegExp(escapeRegExp(replacement.placeholder), 'g');
//               processedTemplate = processedTemplate.replace(regex, replacement.value || '');
//             }
//           });

//           console.log("Processed Template:", processedTemplate);

//           // Get student email
//           const studentData = dataMap.student || {};
//           if (!studentData.Email) {
//             return res.status(400).json({ error: "Student email not found" });
//           }

//           if (!studentData.Email.includes('@')) {
//             return res.status(400).json({ error: 'Invalid student email format' });
//           }

//           console.log(`Student found: ${studentData.Student_Name} (${studentData.Email})`);

//           // Get template attachments if Template_Id is provided
//           let formattedAttachments = [];
//           if (Template_Id) {
//             try {
//               const [attachmentRows] = await db.promise().query(
//                 `SELECT file_name, file_path FROM email_template_attachments 
//                  WHERE template_id = ? AND delete_status = 0 AND status = 1`,
//                 [Template_Id]
//               );
              
//               console.log(`Found ${attachmentRows.length} template attachments`);
//               console.log('Template attachment details:', attachmentRows);
              
//               for (const attachment of attachmentRows) {
//                 // Check for valid file_name and file_path (not null, not 'null', not empty)
//                 const isValidFileName = attachment.file_name && 
//                                       attachment.file_name !== 'null' && 
//                                       attachment.file_name !== '' && 
//                                       attachment.file_name.trim() !== '';
                
//                 const isValidFilePath = attachment.file_path && 
//                                       attachment.file_path !== 'null' && 
//                                       attachment.file_path !== '' && 
//                                       attachment.file_path.trim() !== '';
                
//                 if (isValidFileName && isValidFilePath) {
//                   const formattedUrl = formatFileUrl(attachment.file_path);
                  
//                   if (formattedUrl && isValidUrl(formattedUrl)) {
//                     formattedAttachments.push({
//                       name: attachment.file_name,
//                       url: formattedUrl
//                     });
//                     console.log(`Added template attachment: ${attachment.file_name} -> ${formattedUrl}`);
//                   } else {
//                     console.error(`Invalid template attachment URL: ${attachment.file_path} -> ${formattedUrl}`);
//                   }
//                 } else {
//                   console.log(`Skipping invalid template attachment - file_name: "${attachment.file_name}", file_path: "${attachment.file_path}"`);
//                 }
//               }
//             } catch (attachmentError) {
//               console.error("Error fetching template attachments:", attachmentError);
//             }
//           }

//           // Get university documents if application has university
//           if (Application_details_Id) {
//             try {
//               // Get university ID and other details from application
//               const [appRows] = await db.promise().query(
//                 `SELECT University_Id, Course_Id, Country_Id, intake_Id FROM application_details 
//                  WHERE Application_details_Id = ? AND DeleteStatus = 0`,
//                 [Application_details_Id]
//               );
              
//               if (appRows.length > 0 && appRows[0].University_Id) {
//                 const universityId = appRows[0].University_Id;
                
//                 console.log(`Getting documents for University ID: ${universityId}`);
                
//                 const [universityRows] = await db.promise().query(
//                   `SELECT Documents, Document_Name, University_Name FROM university 
//                    WHERE University_Id = ?`,
//                   [universityId]
//                 );
                
//                 if (universityRows.length > 0) {
//                   console.log(`University found: ${universityRows[0].University_Name}`);
//                   console.log('Raw Documents field:', universityRows[0].Documents);
//                   console.log('Document_Name field:', universityRows[0].Document_Name);
                  
//                   if (universityRows[0].Documents) {
//                     try {
//                       const documents = JSON.parse(universityRows[0].Documents);
//                       console.log('Parsed documents:', documents);
                      
//                       if (Array.isArray(documents)) {
//                         // Handle array of filenames (like your example: ["4ea08e30-36de-11f0-aa75-cb8d94168b08.png"])
//                         documents.forEach((filename, index) => {
//                           console.log(`Processing document ${index}: ${filename}`);
                          
//                           // Validate filename
//                           const isValidFileName = filename && 
//                                                 filename !== 'null' && 
//                                                 filename !== '' && 
//                                                 filename.trim() !== '';
                          
//                           if (isValidFileName) {
//                             // Construct the full file path - adjust this base path according to your server setup
//                             const baseDocumentPath = process.env.DOCUMENT_BASE_PATH || 'uploads/university_documents';
//                             const fullFilePath = `${baseDocumentPath}/${filename}`;
//                             const formattedUrl = formatFileUrl(fullFilePath);
                            
//                             if (formattedUrl && isValidUrl(formattedUrl)) {
//                               // Use Document_Name if available, otherwise use filename
//                               const documentName = universityRows[0].Document_Name || filename;
                              
//                               formattedAttachments.push({
//                                 name: documentName,
//                                 url: formattedUrl
//                               });
//                               console.log(`Added university document: ${documentName} -> ${formattedUrl}`);
//                             } else {
//                               console.error(`Invalid university document URL: ${fullFilePath} -> ${formattedUrl}`);
//                             }
//                           } else {
//                             console.log(`Skipping invalid university document filename: "${filename}"`);
//                           }
//                         });
//                       } else if (typeof documents === 'object' && documents !== null) {
//                         // Handle object format (in case your documents are stored as objects)
//                         console.log('Documents is an object, processing as key-value pairs');
//                         Object.entries(documents).forEach(([key, value], index) => {
//                           console.log(`Processing document ${index}: ${key} -> ${value}`);
                          
//                           const isValidValue = value && 
//                                              value !== 'null' && 
//                                              value !== '' && 
//                                              value.trim() !== '';
                          
//                           if (isValidValue) {
//                             const baseDocumentPath = process.env.DOCUMENT_BASE_PATH || 'uploads/university_documents';
//                             const fullFilePath = `${baseDocumentPath}/${value}`;
//                             const formattedUrl = formatFileUrl(fullFilePath);
                            
//                             if (formattedUrl && isValidUrl(formattedUrl)) {
//                               const documentName = key !== 'null' && key !== '' ? key : (universityRows[0].Document_Name || value);
                              
//                               formattedAttachments.push({
//                                 name: documentName,
//                                 url: formattedUrl
//                               });
//                               console.log(`Added university document: ${documentName} -> ${formattedUrl}`);
//                             } else {
//                               console.error(`Invalid university document URL: ${fullFilePath} -> ${formattedUrl}`);
//                             }
//                           }
//                         });
//                       } else {
//                         console.error('Documents is not in expected format (array or object):', documents);
//                       }
//                     } catch (parseError) {
//                       console.error('Error parsing Documents JSON:', parseError);
//                       console.error('Raw Documents content:', universityRows[0].Documents);
//                     }
//                   } else {
//                     console.log('No documents found for this university');
//                   }
//                 } else {
//                   console.log('University not found');
//                 }
//               } else {
//                 console.log('No university associated with this application');
//               }
//             } catch (universityDocError) {
//               console.error("Error fetching university documents:", universityDocError);
//             }
//           }

//           console.log(`Total attachments prepared: ${formattedAttachments.length}`);
//           formattedAttachments.forEach((att, index) => {
//             console.log(`Attachment ${index + 1}: ${att.name} -> ${att.url}`);
//           });

//           try {
//             const emailPayload = {
//               sender: {
//                 name: senderName,
//                 email: senderEmail,
//               },
//               to: [
//                 {
//                   email: studentData.Email,
//                   name: studentData.Student_Name || "Student",
//                 },
//               ],
//               subject: subject || "Email Notification",
//               htmlContent: processedTemplate
//             };

//             // Only add attachments if we have valid ones
//             if (formattedAttachments.length > 0) {
//               // Validate all attachments before adding
//               const validAttachments = formattedAttachments.filter(att => {
//                 const hasValidName = att.name && 
//                                    att.name !== 'null' && 
//                                    att.name !== '' && 
//                                    att.name.trim() !== '';
                
//                 const hasValidUrl = att.url && 
//                                   att.url !== 'null' && 
//                                   att.url !== '' && 
//                                   att.url.trim() !== '' &&
//                                   !att.url.includes('/null') &&
//                                   isValidUrl(att.url);
                
//                 const isValid = hasValidName && hasValidUrl;
                
//                 if (!isValid) {
//                   console.error(`Skipping invalid attachment - name: "${att.name}", url: "${att.url}"`);
//                 }
//                 return isValid;
//               });

//               if (validAttachments.length > 0) {
//                 emailPayload.attachment = validAttachments;
//                 console.log(`Including ${validAttachments.length} valid attachments`);
//                 validAttachments.forEach((att, index) => {
//                   console.log(`Valid attachment ${index + 1}: ${att.name} -> ${att.url}`);
//                 });
//               } else {
//                 console.log('No valid attachments found, sending email without attachments');
//               }
//             } else {
//               console.log('No attachments to include');
//             }

//             console.log("Sending email with Brevo API:", {
//               to: emailPayload.to[0].email,
//               from: emailPayload.sender.email,
//               subject: emailPayload.subject,
//               attachments: emailPayload.attachment ? emailPayload.attachment.length : 0
//             });

//             // Log the full payload for debugging (except HTML content)
//             console.log("Email payload:", {
//               ...emailPayload,
//               htmlContent: `[${emailPayload.htmlContent.length} characters]`
//             });

//             const emailResponse = await axios.post(
//               "https://api.brevo.com/v3/smtp/email",
//               emailPayload,
//               {
//                 headers: {
//                   "Content-Type": "application/json",
//                   "api-key": apiKey,
//                 },
//               }
//             );

//             console.log(`Email sent successfully to ${studentData.Student_Name} (${studentData.Email})!`);
//             console.log('Brevo Response:', emailResponse.data);

//             res.json({
//               success: true,
//               message: `Email sent successfully to ${studentData.Student_Name}`,
//               messageId: emailResponse.data.messageId,
//               processed_template: processedTemplate,
//               attachments_count: emailPayload.attachment ? emailPayload.attachment.length : 0,
//               attachments_details: emailPayload.attachment || []
//             });

//           } catch (sendError) {
//             console.error("Brevo API Error Details:", {
//               message: sendError.message,
//               response: sendError.response ? {
//                 status: sendError.response.status,
//                 data: sendError.response.data,
//               } : "No response details",
//             });

//             if (sendError.response) {
//               return res.status(500).json({
//                 error: "Failed to send email via Brevo API",
//                 details: sendError.response.data || sendError.message,
//                 status: sendError.response.status
//               });
//             } else if (sendError.request) {
//               return res.status(500).json({
//                 error: "No response from Brevo API",
//                 details: "The request was made but no response was received"
//               });
//             } else {
//               return res.status(500).json({
//                 error: "Error setting up email request",
//                 details: sendError.message
//               });
//             }
//           }
//         })
//         .catch((error) => {
//           console.error("Error processing template:", error);
//           res.status(500).json({ 
//             error: "Error processing template",
//             details: error.message 
//           });
//         });
//     });
//   } catch (error) {
//     console.error("Error in send email template route:", error);
//     res.status(500).json({ 
//       error: "Internal Server Error",
//       details: error.message 
//     });
//   }
// });
router.post('/send_email_to_user', async (req, res, next) => {
    try {
        const { userId, studentId, templateId, customBody } = req.body;
        console.log('templateId: ', templateId);
        console.log('studentId: ', studentId);
        console.log('userId: ', userId);
        
        if (!userId || !templateId) {
            return res.status(400).json({ error: 'User ID and Template ID are required' });
        }
        
        console.log(`Preparing to send email to user ${userId} using template ${templateId}`);
        
        // Step 1: Get the user data
        const [userRows] = await db.promise().query(
            `SELECT User_Details_Id, User_Details_Name, Email, Mobile
             FROM user_details 
             WHERE User_Details_Id = ? AND DeleteStatus = FALSE`,
            [userId]
        );
        
        if (!userRows || userRows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const userData = userRows[0];
        
        if (!userData.Email) {
            return res.status(400).json({ error: 'User has no email address' });
        }
        
        console.log(`User found: ${userData.User_Details_Name} (${userData.Email})`);
        
        // IMPORTANT: Make sure the email address is valid
        if (!userData.Email.includes('@')) {
            return res.status(400).json({ error: 'Invalid user email format' });
        }
        
        // Step 2: Get the student data (for template replacements)
        let studentData = null;
        let applicationData = null;
        
        if (studentId) {
            const [studentRows] = await db.promise().query(
                `SELECT Student_Id, Student_Name, Email, Phone_Number
                 FROM student 
                 WHERE Student_Id = ? AND DeleteStatus = FALSE`,
                [studentId]
            );
            
            if (studentRows && studentRows.length > 0) {
                studentData = studentRows[0];
                
                // Get application details for this student (most recent)
                const [applicationRows] = await db.promise().query(
                    `SELECT * FROM application_details 
                     WHERE Student_Id = ? AND DeleteStatus = FALSE
                     ORDER BY Date_Of_Applying DESC LIMIT 1`,
                    [studentId]
                );
                
                applicationData = applicationRows.length > 0 ? applicationRows[0] : null;
            }
        }
        
        // Step 3: Get the template
        const [templateRows] = await db.promise().query(
            `SELECT id, name, subject, body FROM email_templates 
             WHERE id = ? AND Delete_Status = 0 AND status = 1`,
            [templateId]
        );
        
        if (!templateRows || templateRows.length === 0) {
            return res.status(404).json({ error: 'Template not found' });
        }
        
        const template = templateRows[0];
        console.log(`Template found: ${template.name}`);
        
        // If custom body is provided, use it instead of the template body
        if (customBody) {
            console.log('Using custom body instead of template body');
            template.body = customBody;
        }
        
        // Step 4: Get template attachments
        const [attachmentRows] = await db.promise().query(
            `SELECT file_name, file_path FROM email_template_attachments 
             WHERE template_id = ? AND delete_status = 0 AND status = 1`,
            [template.id]
        );
        
        console.log(`Found ${attachmentRows.length} attachments`);
        
        // Step 5: Create data object for replacements
        const dataObject = {
          
            user: {
                User_Details_Id: userData.User_Details_Id,
                User_Details_Name: userData.User_Details_Name || 'User',
                Email: userData.Email || '',
                Mobile: userData.Mobile || ''
            },
            student: studentData ? {
                Student_Id: studentData.Student_Id,
                Student_Name: studentData.Student_Name || 'Student',
                Email: studentData.Email || '',
                Phone_Number: studentData.Phone_Number || ''
            } : {},
            application_details: applicationData || {},
            status: {
                AIMS_Id: applicationData ? applicationData.AIMS_Id : '',
                Application_Status_Name: applicationData ? applicationData.Application_Status_Name : '',
                From_User_Name: applicationData ? applicationData.From_User_Name : '',
                Remark: applicationData ? applicationData.Remark : ''
            }
        };
        console.log('dataObject: ', dataObject);
        // Step 6: Process the template to replace placeholders
        let processedBody = template.body || '';
        if (!processedBody || processedBody.trim() === '') {
            // Default body if empty
            processedBody = `<p>Hello ${dataObject.user.User_Details_Name},</p><p>This is a notification from the system.</p>`;
        }
        
        let processedSubject = template.subject || '';
        if (!processedSubject || processedSubject.trim() === '') {
            // Default subject if empty
            processedSubject = 'Application Update';
        }
         
        // Direct replacements for common fields (including user fields)
        const directReplacements = [
            // User fields
            { placeholder: '{{User_Details_Name}}', value: dataObject.user.User_Details_Name },
            { placeholder: '{{User_Email}}', value: dataObject.user.Email },
            { placeholder: '{{User_Mobile}}', value: dataObject.user.Mobile },
            // Student fields
            { placeholder: '{{Student_Name}}', value: dataObject.student.Student_Name || '' },
            { placeholder: '{{Email}}', value: dataObject.student.Email || '' },
            { placeholder: '{{Phone_Number}}', value: dataObject.student.Phone_Number || '' },
            { placeholder: '{{Application_Status_Name}}', value: dataObject.status.Application_Status_Name || '' },
            { placeholder: '{{Remark}}', value: dataObject.status.Remark || '' },
                // User fields (will be empty for student emails unless you populate userData)
    { placeholder: '{{User_Details_Name}}', value: dataObject.user.User_Details_Name || '' }
        ];
        
        // Helper function to escape special regex characters
        function escapeRegExp(string) {
            if (!string || typeof string !== 'string') {
                return '';
            }
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
        
        // Apply all direct replacements
        directReplacements.forEach(replacement => {
            const regex = new RegExp(escapeRegExp(replacement.placeholder), 'g');
            
            if (processedBody.includes(replacement.placeholder)) {
                console.log(`Replacing '${replacement.placeholder}' with '${replacement.value}'`);
                processedBody = processedBody.replace(regex, replacement.value || '');
            }
            
            if (processedSubject.includes(replacement.placeholder)) {
                processedSubject = processedSubject.replace(regex, replacement.value || '');
            }
        });
        
        // Step 7: Send the email using Brevo
        console.log('Sending email via Brevo API...');
        const axios = require("axios");
        const apiKey =
            process.env.BREVO_API_KEY ||
            "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";
        const senderEmail =
            process.env.BREVO_SENDER_EMAIL || "ufsdev123@gmail.com";
        const senderName = process.env.BREVO_SENDER_NAME || "Application System";
        
        // Format attachments for Brevo API
        const formattedAttachments = [];
        if (attachmentRows && attachmentRows.length > 0) {
            for (const attachment of attachmentRows) {
                if (attachment.file_path && attachment.file_name) {
                    formattedAttachments.push({
                        name: attachment.file_name,
                        url: attachment.file_path
                    });
                }
            }
        }
        
        // Log everything before sending
        console.log('Email sending details:');
        console.log('- From:', senderEmail);
        console.log('- To:', userData.Email);
        console.log('- Subject:', processedSubject);
        console.log('- Body length:', processedBody.length);
        console.log('- Attachments:', formattedAttachments.length);
        
        // Prepare email payload
        const emailPayload = {
            sender: {
                name: senderName,
                email: senderEmail,
            },
            to: [
                {
                    email: userData.Email,
                    name: userData.User_Details_Name,
                },
            ],
            subject: processedSubject,
            htmlContent: processedBody
        };
        
        // Add attachments if any
        if (formattedAttachments.length > 0) {
            emailPayload.attachment = formattedAttachments;
        }
        
        try {
            // Log the request payload (but not the full HTML content)
            console.log('About to send email with payload:', {
                ...emailPayload,
                htmlContent: `[${emailPayload.htmlContent.length} characters]`
            });
            
            // Send the email
            const emailResponse = await axios.post(
                "https://api.brevo.com/v3/smtp/email",
                emailPayload,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "api-key": apiKey,
                    },
                }
            );
            
            console.log(`Email sent successfully to ${userData.User_Details_Name} (${userData.Email})!`);
            console.log('Response:', emailResponse.data);
            
            // Return success response
            res.json({
                success: true,
                message: `Email sent successfully to ${userData.User_Details_Name}`,
                messageId: emailResponse.data.messageId
            });
        } catch (sendError) {
            // More detailed error logging for Axios errors
            console.error("Error sending email via Brevo API:", sendError.message);
            
            if (sendError.response) {
                console.error("Response status:", sendError.response.status);
                console.error("Response data:", sendError.response.data);
                console.error("Response headers:", sendError.response.headers);
                
                return res.status(500).json({ 
                    error: "Failed to send email via Brevo API", 
                    details: sendError.response.data || sendError.message,
                    status: sendError.response.status
                });
            } else if (sendError.request) {
                console.error("No response received:", sendError.request);
                
                return res.status(500).json({ 
                    error: "No response from Brevo API", 
                    details: "The request was made but no response was received"
                });
            } else {
                console.error("Error setting up request:", sendError.message);
                
                return res.status(500).json({ 
                    error: "Error setting up email request", 
                    details: sendError.message
                });
            }
        }
    } catch (error) {
        console.error("Error processing email request:", error);
        res.status(500).json({ 
            error: "Failed to process email request", 
            details: error.message 
        });
    }
});
// Fixed Email Sending with Better Error Handling and Debugging
router.post('/send_email_to_student', async (req, res, next) => {
    try {
        const { studentId, templateId, customBody } = req.body;
        
        if (!studentId || !templateId) {
            return res.status(400).json({ error: 'Student ID and Template ID are required' });
        }
        
        console.log(`Preparing to send email to student ${studentId} using template ${templateId}`);
        
        // Step 1: Get the student data
        const [studentRows] = await db.promise().query(
            `SELECT Student_Id, Student_Name, Email, Phone_Number
             FROM student 
             WHERE Student_Id = ? AND DeleteStatus = FALSE`,
            [studentId]
        );
        
        if (!studentRows || studentRows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        const studentData = studentRows[0];
        
        if (!studentData.Email) {
            return res.status(400).json({ error: 'Student has no email address' });
        }
        
        console.log(`Student found: ${studentData.Student_Name} (${studentData.Email})`);
        
        // IMPORTANT: Make sure the email address is valid
        if (!studentData.Email.includes('@')) {
            return res.status(400).json({ error: 'Invalid student email format' });
        }
        
        // Step 2: Get the template
        const [templateRows] = await db.promise().query(
            `SELECT id, name, subject, body FROM email_templates 
             WHERE id = ? AND Delete_Status = 0 AND status = 1`,
            [templateId]
        );
        
        if (!templateRows || templateRows.length === 0) {
            return res.status(404).json({ error: 'Template not found' });
        }
        
        const template = templateRows[0];
        console.log(`Template found: ${template.name}`);
        
        // If custom body is provided, use it instead of the template body
        if (customBody) {
            console.log('Using custom body instead of template body');
            template.body = customBody;
        }
        
        // Step 3: Get template attachments with better validation
        const [attachmentRows] = await db.promise().query(
            `SELECT file_name, file_path FROM email_template_attachments 
             WHERE template_id = ? 
             AND delete_status = 0 
             AND status = 1 
             AND file_name IS NOT NULL 
             AND file_path IS NOT NULL 
             AND file_name != '' 
             AND file_path != '' 
             AND file_name != 'null' 
             AND file_path != 'null'
             AND TRIM(file_name) != ''
             AND TRIM(file_path) != ''`,
            [template.id]
        );
        
        console.log(`Found ${attachmentRows.length} clean template attachments`);
        
        // Step 4: Get application details for this student (most recent)
        const [applicationRows] = await db.promise().query(
            `SELECT * FROM application_details 
             WHERE Student_Id = ? AND DeleteStatus = FALSE
             ORDER BY Date_Of_Applying DESC LIMIT 1`,
            [studentId]
        );
        
        const applicationData = applicationRows.length > 0 ? applicationRows[0] : null;
      
        // Step 5: Create data object for replacements
        const dataObject = {
            student: {
                Student_Id: studentData.Student_Id,
                Student_Name: studentData.Student_Name || 'Student',
                Email: studentData.Email || '',
                Phone_Number: studentData.Phone_Number || ''
            },
            application_details: applicationData || {},
            status: {
                AIMS_Id: applicationData ? applicationData.AIMS_Id : '',
                Application_Status_Name: applicationData ? applicationData.Application_Status_Name : '',
                From_User_Name: applicationData ? applicationData.From_User_Name : '',
                Remark: applicationData ? applicationData.Remark : ''
            }
        };
        
        // Step 6: Process the template to replace placeholders
        let processedBody = template.body || '';
        if (!processedBody || processedBody.trim() === '') {
            // Default body if empty
            processedBody = `<p>Hello ${dataObject.student.Student_Name},</p><p>This is a notification from the system.</p>`;
        }
        
        let processedSubject = template.subject || '';
        if (!processedSubject || processedSubject.trim() === '') {
            // Default subject if empty
            processedSubject = 'Application Update';
        }
         
        // Direct replacements for common fields
        const directReplacements = [
            { placeholder: '{{Student_Name}}', value: dataObject.student.Student_Name },
            { placeholder: '{{Email}}', value: dataObject.student.Email },
            { placeholder: '{{Phone_Number}}', value: dataObject.student.Phone_Number },
            { placeholder: '{{Application_Status_Name}}', value: dataObject.status.Application_Status_Name || '' },
            { placeholder: '{{Remark}}', value: dataObject.status.Remark || '' },
            // User fields (will be empty for student emails)
            { placeholder: '{{User_Details_Name}}', value: dataObject.status.From_User_Name || '' }
        ];
        
        // Helper function to escape special regex characters
        function escapeRegExp(string) {
            if (!string || typeof string !== 'string') {
                return '';
            }
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
        
        // Helper function to validate URLs
        function isValidUrl(string) {
            try {
                const url = new URL(string);
                return url.protocol === 'http:' || url.protocol === 'https:';
            } catch (error) {
                return false;
            }
        }
        
        // Apply all direct replacements
        directReplacements.forEach(replacement => {
            const regex = new RegExp(escapeRegExp(replacement.placeholder), 'g');
            
            if (processedBody.includes(replacement.placeholder)) {
                console.log(`Replacing '${replacement.placeholder}' with '${replacement.value}'`);
                processedBody = processedBody.replace(regex, replacement.value || '');
            }
            
            if (processedSubject.includes(replacement.placeholder)) {
                processedSubject = processedSubject.replace(regex, replacement.value || '');
            }
        });
        
        // Step 7: Format attachments for Brevo API with proper validation
        const formattedAttachments = [];
        if (attachmentRows && attachmentRows.length > 0) {
            for (const attachment of attachmentRows) {
                // Additional validation to ensure URL is valid
                if (isValidUrl(attachment.file_path)) {
                    formattedAttachments.push({
                        name: attachment.file_name,
                        url: attachment.file_path
                    });
                    console.log(`✅ Added valid attachment: ${attachment.file_name} -> ${attachment.file_path}`);
                } else {
                    console.log(`❌ Skipping attachment with invalid URL: ${attachment.file_name} -> ${attachment.file_path}`);
                }
            }
        }
        
        console.log(`📎 Total valid attachments: ${formattedAttachments.length}`);
        
        // Step 8: Send the email using Brevo with retry mechanism
        console.log('Sending email via Brevo API...');
        const axios = require("axios");
        const https = require('https');
        const apiKey =
            process.env.BREVO_API_KEY ||
            "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";
        const senderEmail =
            process.env.BREVO_SENDER_EMAIL || "ufsdev123@gmail.com";
        const senderName = process.env.BREVO_SENDER_NAME || "Application System";
        
        // Log everything before sending
        console.log('Email sending details:');
        console.log('- From:', senderEmail);
        console.log('- To:', studentData.Email);
        console.log('- Subject:', processedSubject);
        console.log('- Body length:', processedBody.length);
        console.log('- Valid attachments:', formattedAttachments.length);
        
        // Log each attachment for debugging
        formattedAttachments.forEach((att, index) => {
            console.log(`  Attachment ${index + 1}: ${att.name} -> ${att.url}`);
        });
        
        // Prepare email payload
        const emailPayload = {
            sender: {
                name: senderName,
                email: senderEmail,
            },
            to: [
                {
                    email: studentData.Email,
                    name: studentData.Student_Name,
                },
            ],
            subject: processedSubject,
            htmlContent: processedBody
        };
        
        // Add attachments only if there are valid ones
        if (formattedAttachments.length > 0) {
            emailPayload.attachment = formattedAttachments;
            console.log(`📎 Including ${formattedAttachments.length} valid attachments in email`);
        } else {
            console.log('📎 No valid attachments to include');
        }
        
        // Retry function for sending emails
        async function sendEmailWithRetry(payload, maxRetries = 3) {
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    console.log(`📧 Email attempt ${attempt}/${maxRetries}`);
                    
                    // Log the request payload (but not the full HTML content) with safe attachment info
                    console.log('About to send email with payload:', {
                        ...payload,
                        htmlContent: `[${payload.htmlContent.length} characters]`,
                        attachment: payload.attachment ? payload.attachment.map(att => ({
                            name: att.name,
                            url: att.url ? (isValidUrl(att.url) ? 'valid_url' : 'invalid_url') : 'no_url'
                        })) : 'no_attachments'
                    });
                    
                    const response = await axios.post(
                        "https://api.brevo.com/v3/smtp/email",
                        payload,
                        {
                            headers: {
                                "Content-Type": "application/json",
                                "api-key": apiKey,
                            },
                            timeout: 30000,
                            httpsAgent: new https.Agent({
                                rejectUnauthorized: true,
                                secureProtocol: 'TLSv1_2_method'
                            })
                        }
                    );
                    
                    console.log(`✅ Email sent successfully on attempt ${attempt}`);
                    return response;
                    
                } catch (error) {
                    console.error(`❌ Attempt ${attempt} failed:`, error.message);
                    
                    if (error.response) {
                        console.error("Response status:", error.response.status);
                        console.error("Response data:", error.response.data);
                    }
                    
                    if (attempt === maxRetries) {
                        throw error;
                    }
                    
                    // Wait before retrying with exponential backoff
                    const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
                    console.log(`⏳ Waiting ${waitTime}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                }
            }
        }
        
        try {
            const emailResponse = await sendEmailWithRetry(emailPayload);
            
            console.log(`Email sent successfully to ${studentData.Student_Name} (${studentData.Email})!`);
            console.log('Response:', emailResponse.data);
            
            // Return success response
            res.json({
                success: true,
                message: `Email sent successfully to ${studentData.Student_Name}`,
                messageId: emailResponse.data.messageId,
                attachments_sent: formattedAttachments.length
            });
            
        } catch (sendError) {
            // More detailed error logging for Axios errors
            console.error("Error sending email via Brevo API:", sendError.message);
            
            if (sendError.response) {
                console.error("Response status:", sendError.response.status);
                console.error("Response data:", sendError.response.data);
                
                return res.status(500).json({ 
                    error: "Failed to send email via Brevo API", 
                    details: sendError.response.data || sendError.message,
                    status: sendError.response.status
                });
            } else if (sendError.request) {
                console.error("No response received:", sendError.request);
                
                return res.status(500).json({ 
                    error: "No response from Brevo API", 
                    details: "The request was made but no response was received"
                });
            } else {
                console.error("Error setting up request:", sendError.message);
                
                return res.status(500).json({ 
                    error: "Error setting up email request", 
                    details: sendError.message
                });
            }
        }
        
    } catch (error) {
        console.error("Error processing email request:", error);
        res.status(500).json({ 
            error: "Failed to process email request", 
            details: error.message 
        });
    }
});


module.exports = router;
