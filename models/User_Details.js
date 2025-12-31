var db = require('../dbconnection');
var fs = require('fs');
const storedProcedure = require('../helpers/stored-procedure');
const { Console, log } = require('console');
var User_Details =
{
  // Save_User_Details: async function (User_Details_) {
  //   return new Promise(async (rs, rej) => {
  //     const pool = db.promise();
  //     let connection;
  //     let transactionConnection;

  //     const Application_Group_Value_ = User_Details_.User_Application_Group ? 1 : 0;
  //     const Application_Status_Value_ = User_Details_.User_Application_Status ? 1 : 0;
  //     const All_time_Department_Value_ = User_Details_.All_Time_Departments ? 1 : 0;
  //     const User_Country_Value_ = User_Details_.User_Country ? 1 : 0;
  //     const User_Course_Value_ = User_Details_.User_Course ? 1 : 0;
  //     const Lead_Assigned_ = User_Details_.Lead_Assigned ? 1 : 0;
  //     console.log("User_Details_", User_Details_.Lead_Assigned);
  //     console.log("Lead_Assigned_", Lead_Assigned_s);

  //     try {
  //       // Start transaction connection for WRITE operations
  //       transactionConnection = await pool.getConnection();
  //       await transactionConnection.beginTransaction();
  //       var UserRoleString = '';
  //       let departmentString = '';
  //       var userId = 0;
  //       // Save user basic details
  //       const result1 = await new storedProcedure('Save_User_Details', [
  //         User_Details_.User_Details_Id,
  //         User_Details_.User_Details_Name,
  //         User_Details_.Password,
  //         User_Details_.Working_Status,
  //         User_Details_.User_Type,
  //         User_Details_.Role_Id,
  //         User_Details_.Branch_Id,
  //         User_Details_.Address1,
  //         User_Details_.Address2,
  //         User_Details_.Address3,
  //         User_Details_.Address4,
  //         User_Details_.Pincode,
  //         User_Details_.Mobile,
  //         User_Details_.Email,
  //         0,
  //         User_Details_.Registration_Target,
  //         User_Details_.FollowUp_Target,
  //         User_Details_.Department_Id,
  //         User_Details_.Department_Name,
  //         User_Details_.Backup_User_Id,
  //         User_Details_.Backup_User_Name,
  //         User_Details_.Default_Application_Status_Id,
  //         User_Details_.Default_Application_Status_Name,
  //         User_Details_.User_Menu_Selection_Data,
  //         User_Details_.User_Department_Data,
  //         JSON.stringify(User_Details_.User_Application_Group),
  //         JSON.stringify(User_Details_.User_Application_Status),
  //         User_Details_.Application_View,
  //         Application_Group_Value_,
  //         Application_Status_Value_,
  //         User_Details_.All_Time_Department_View,
  //         All_time_Department_Value_,
  //         JSON.stringify(User_Details_.All_Time_Departments),
  //         User_Country_Value_,
  //         JSON.stringify(User_Details_.User_Country),
  //         User_Course_Value_,
  //         JSON.stringify(User_Details_.User_Course),
  //         Lead_Assigned_,
  //         User_Details_.Location_Id,
  //         User_Details_.Location_Name
  //       ], transactionConnection).result();

  //       if (result1[0].User_Details_Id_ > 0) {
  //         // Use separate connection for read-only data to avoid blocking writes
  //         connection = await pool.getConnection();

  //         userId = result1[0].User_Details_Id_;
  //         const branchId_ = result1[0].Branch_Id_;

  //         const Roles = await new storedProcedure('Search_User_Role', [''], connection).result();
  //         const userRoleIdRes = await new storedProcedure('Get_User_Role_Id', [userId], connection).result();
  //         const roleId = userRoleIdRes[0].Role_Id;

  //         let SelectdRoles = [{ User_Role_Id: roleId }];
  //         UserRoleString = roleId + ",";
  //         let i = 0;

  //         while (i < SelectdRoles.length) {
  //           const currentRoleId = SelectdRoles[i].User_Role_Id;
  //           const children = Roles.filter(r => r.Role_Under_Id === currentRoleId);

  //           for (const role of children) {
  //             if (!SelectdRoles.find(r => r.User_Role_Id === role.User_Role_Id)) {
  //               SelectdRoles.push(role);
  //               UserRoleString += role.User_Role_Id + ",";
  //             }
  //           }
  //           i++;
  //         }

  //         UserRoleString = UserRoleString.replace(/,+$/, ""); // trim trailing comma

  //         // Department Permission Logic
  //         const branchRes = await new storedProcedure('Get_User_Branch', [userId], connection).result();
  //         const currentBranchId = branchRes[0].Branch_Id;

  //         let userDepartments = await new storedProcedure('Get_Department_Permission_Byuser', [userId, branchId_], connection).result();
  //         let user_All_Departments = await new storedProcedure('Get_Department_Permission_Byuser_current_Branch', [userId, branchId_], connection).result();

  //         const allTimeDepartments = await new storedProcedure('Get_AllTime_Dept', [userId], connection).result();
  //         const allBranches = await new storedProcedure('Get_User_Branches', [userId, branchId_], connection).result();

  //         departmentString = `and ((student.Followup_Branch_Id=${currentBranchId} and student.To_User_Id=${userId} and Followup_Department_Id in (`;
  //         let baseDept = userDepartments.filter(d => d.Branch_Id === currentBranchId).map(d => d.Department_Id);
  //         departmentString += [...new Set(baseDept)].join(",") + "))";
  //         console.log("Base Department String:", departmentString);
  //         for (let b of allBranches) {
  //           const branchId = b.Branch_Id;
  //           const deptList = user_All_Departments.filter(d => d.Branch_Id === branchId).map(d => d.Department_Id);

  //           if (deptList.length > 0) {
  //             departmentString += ` or (student.Followup_Branch_Id=${branchId} and student.Followup_Department_Id in (${[...new Set(deptList)].join(",")}))`;
  //           }
  //         }
  //         console.log("Base Department String:", departmentString);
  //         const allTimeIds = allTimeDepartments && allTimeDepartments.length > 0
  //           ? allTimeDepartments.map(d => d.Department_Id).join(",")
  //           : 0;
  //         // const allTimeIds = allTimeDepartments.map(d => d.Department_Id).join(",");
  //         departmentString += ` or (student.User_List like '%*${userId}*%' ) )`;
  //         // departmentString += ` or (student.User_List like '%*${userId}*%' and Followup_Department_Id in (${allTimeIds})) )`;

  //         // Save Role + Department Permissions
  //         // await new storedProcedure('Save_Role_Department', [
  //         //   UserRoleString,
  //         //   departmentString,
  //         //   userId
  //         // ], transactionConnection).result();
  //       }

  //       await transactionConnection.commit();

  //       await new storedProcedure('Save_Role_Department', [
  //         UserRoleString,
  //         departmentString,
  //         userId
  //       ]).result();
  //       // userId: result1[0].User_Details_Id_ 
  //       rs(result1);

  //     } catch (err) {
  //       if (transactionConnection) await transactionConnection.rollback();
  //       console.error("❌ Error in Save_User_Details:", err);
  //       rej(err);
  //     } finally {
  //       if (connection) connection.release();
  //       if (transactionConnection) transactionConnection.release();
  //     }
  //   });
  // },
  Save_User_Details: async function (User_Details_) {
    return new Promise(async (rs, rej) => {
      const pool = db.promise();
      let connection;
      let transactionConnection;

      const Application_Group_Value_ = User_Details_.User_Application_Group ? 1 : 0;
      const Application_Status_Value_ = User_Details_.User_Application_Status ? 1 : 0;
      const All_time_Department_Value_ = User_Details_.All_Time_Departments ? 1 : 0;
      const User_Country_Value_ = User_Details_.User_Country ? 1 : 0;
      const User_Course_Value_ = User_Details_.User_Course ? 1 : 0;
      const Lead_Assigned_ = User_Details_.Lead_Assigned ? 1 : 0;

      console.log("User_Details_", User_Details_.Lead_Assigned);
      console.log("Lead_Assigned_", Lead_Assigned_);

      try {
        // Start transaction connection for WRITE operations
        transactionConnection = await pool.getConnection();
        await transactionConnection.beginTransaction();

        var UserRoleString = '';
        let departmentString = '';
        var userId = 0;

        // Handle empty arrays for Menu and Department when Lead_Assigned is true
        const menuSelectionData = (User_Details_.User_Menu_Selection_Data &&
          User_Details_.User_Menu_Selection_Data.length > 0)
          ? User_Details_.User_Menu_Selection_Data
          : null;

        const departmentData = (User_Details_.User_Department_Data &&
          User_Details_.User_Department_Data.length > 0)
          ? User_Details_.User_Department_Data
          : null;

        // Save user basic details
        const result1 = await new storedProcedure('Save_User_Details', [
          User_Details_.User_Details_Id,
          User_Details_.User_Details_Name,
          User_Details_.Password,
          User_Details_.Working_Status,
          User_Details_.User_Type,
          User_Details_.Role_Id,
          User_Details_.Branch_Id,
          User_Details_.Address1 || '',
          User_Details_.Address2 || '',
          User_Details_.Address3 || '',
          User_Details_.Address4 || '',
          User_Details_.Pincode || '',
          User_Details_.Mobile,
          User_Details_.Email,
          0,
          User_Details_.Registration_Target || 0,
          User_Details_.FollowUp_Target || '',
          User_Details_.Department_Id,
          User_Details_.Department_Name,
          User_Details_.Backup_User_Id || 0,
          User_Details_.Backup_User_Name || '',
          User_Details_.Default_Application_Status_Id || 0,
          User_Details_.Default_Application_Status_Name || '',
          menuSelectionData,
          departmentData,
          JSON.stringify(User_Details_.User_Application_Group || []),
          JSON.stringify(User_Details_.User_Application_Status || []),
          User_Details_.Application_View || false,
          Application_Group_Value_,
          Application_Status_Value_,
          User_Details_.All_Time_Department_View || false,
          All_time_Department_Value_,
          JSON.stringify(User_Details_.All_Time_Departments || []),
          User_Country_Value_,
          JSON.stringify(User_Details_.User_Country || []),
          User_Course_Value_,
          JSON.stringify(User_Details_.User_Course || []),
          Lead_Assigned_,
          User_Details_.Location_Id,
          User_Details_.Location_Name
        ], transactionConnection).result();

        if (result1[0].User_Details_Id_ > 0) {
          // Use separate connection for read-only data to avoid blocking writes
          connection = await pool.getConnection();

          userId = result1[0].User_Details_Id_;
          const branchId_ = result1[0].Branch_Id_;

          const Roles = await new storedProcedure('Search_User_Role', [''], connection).result();
          const userRoleIdRes = await new storedProcedure('Get_User_Role_Id', [userId], connection).result();
          const roleId = userRoleIdRes[0].Role_Id;

          let SelectdRoles = [{ User_Role_Id: roleId }];
          UserRoleString = roleId + ",";
          let i = 0;

          while (i < SelectdRoles.length) {
            const currentRoleId = SelectdRoles[i].User_Role_Id;
            const children = Roles.filter(r => r.Role_Under_Id === currentRoleId);

            for (const role of children) {
              if (!SelectdRoles.find(r => r.User_Role_Id === role.User_Role_Id)) {
                SelectdRoles.push(role);
                UserRoleString += role.User_Role_Id + ",";
              }
            }
            i++;
          }

          UserRoleString = UserRoleString.replace(/,+$/, ""); // trim trailing comma

          // Department Permission Logic - only if not Lead_Assigned
          if (Lead_Assigned_ === 0) {
            const branchRes = await new storedProcedure('Get_User_Branch', [userId], connection).result();
            const currentBranchId = branchRes[0].Branch_Id;

            let userDepartments = await new storedProcedure('Get_Department_Permission_Byuser', [userId, branchId_], connection).result();
            let user_All_Departments = await new storedProcedure('Get_Department_Permission_Byuser_current_Branch', [userId, branchId_], connection).result();

            const allTimeDepartments = await new storedProcedure('Get_AllTime_Dept', [userId], connection).result();
            const allBranches = await new storedProcedure('Get_User_Branches', [userId, branchId_], connection).result();

            departmentString = `and ((student.Followup_Branch_Id=${currentBranchId} and student.To_User_Id=${userId} and Followup_Department_Id in (`;
            let baseDept = userDepartments.filter(d => d.Branch_Id === currentBranchId).map(d => d.Department_Id);
            departmentString += [...new Set(baseDept)].join(",") + "))";

            console.log("Base Department String:", departmentString);

            for (let b of allBranches) {
              const branchId = b.Branch_Id;
              const deptList = user_All_Departments.filter(d => d.Branch_Id === branchId).map(d => d.Department_Id);

              if (deptList.length > 0) {
                departmentString += ` or (student.Followup_Branch_Id=${branchId} and student.Followup_Department_Id in (${[...new Set(deptList)].join(",")}))`;
              }
            }

            console.log("Full Department String:", departmentString);

            const allTimeIds = allTimeDepartments && allTimeDepartments.length > 0
              ? allTimeDepartments.map(d => d.Department_Id).join(",")
              : 0;

            departmentString += ` or (student.User_List like '%*${userId}*%' ) )`;
          } else {
            // If Lead_Assigned is true, create a simple department string that allows the user
            departmentString = `and (student.To_User_Id=${userId} or student.User_List like '%*${userId}*%')`;
          }
        }

        await transactionConnection.commit();

        // Save Role + Department Permissions outside transaction
        await new storedProcedure('Save_Role_Department', [
          UserRoleString,
          departmentString,
          userId
        ]).result();

        rs(result1);

      } catch (err) {
        if (transactionConnection) await transactionConnection.rollback();
        console.error("❌ Error in Save_User_Details:", err);
        rej(err);
      } finally {
        if (connection) connection.release();
        if (transactionConnection) transactionConnection.release();
      }
    });
  },
  Update_User_Department: function (User_Details_Id_, callback) {
    return db.query("CALL update_user_Department(@User_Details_Id_ :=?)", [User_Details_Id_], callback);
  },

  Delete_User_Details: function (User_Details_Id_, callback) {
    return db.query("CALL Delete_User_Details(@User_Details_Id_ :=?)", [User_Details_Id_], callback);
  },
  Search_User_Typeahead: function (User_Details_Name_, callback) {
    if (User_Details_Name_ === 'undefined' || User_Details_Name_ === '' || User_Details_Name_ === undefined)
      User_Details_Name_ = '';
    return db.query("CALL Search_User_Typeahead(@User_Details_Name_ :=?)", [User_Details_Name_], callback);
  },

  Search_User_Typeahead_ByUser: function (Login_Id_, User_Details_Name_, callback) {
    if (User_Details_Name_ === 'undefined' || User_Details_Name_ === '' || User_Details_Name_ === undefined)
      User_Details_Name_ = '';
    return db.query("CALL Search_User_Typeahead_ByUser(@Login_Id_ :=?,@User_Details_Name_ :=?)", [Login_Id_, User_Details_Name_], callback);
  },


  Get_Location_Load_Data: function (Branch_Id_, Department_Id_, callback) {

    return db.query("CALL Get_Location_Load_Data(@Branch_Id_ :=?,@Department_Id_ :=?)", [Branch_Id_, Department_Id_], callback);
  },

  Get_User_Details: function (User_Details_Id_, callback) {
    return db.query("CALL Get_User_Details(@User_Details_Id_ :=?)", [User_Details_Id_], callback);
  },
  Search_User_Details: async function (User_Details_Name_, Branch_Id_, Department_Id_, User_Status_Id_) {
    var Leads = [];
    try {
      if (Branch_Id_ == 'undefined')
        Branch_Id_ = 0;
      if (Department_Id_ == 'undefined')
        Department_Id_ = 0;
      if (User_Status_Id_ == 'undefined')
        User_Status_Id_ = 0;

      //Department_String = Department_String.concat(" )");
      Leads = await (new storedProcedure('Search_User_Details', [User_Details_Name_, Branch_Id_, Department_Id_, User_Status_Id_])).result();
    }
    catch (e) {

    }

    return {
      returnvalue: {
        Leads

      }
    };
  },

  Get_Menu_Permission: function (User_Id_, callback) {
    return db.query("CALL Get_Menu_Permission(@User_Id_ :=?)", [User_Id_], callback);
  },
  User_Employee: function (User_Details_Id_, callback) {
    return db.query("CALL User_Employee(@User_Details_Id_ :=?)", [User_Details_Id_], callback);
  },
  Get_User_Type: function (callback) {
    return db.query("CALL Get_User_Type()", [], callback);
  },

  Search_Backup_User_Typeahead: function (User_Details_Name, callback) {
    //console.log(User_Details_Name)
    if (User_Details_Name === undefined || User_Details_Name === "undefined")
      User_Details_Name = '';
    return db.query("CALL Search_Backup_User_Typeahead(@User_Details_Name_ :=?)", [User_Details_Name], callback);
  },
  Get_Users_Load_Data: async function () {
    const User_Type = await (new storedProcedure('Get_User_Type', [])).result();
    const User_Menu_Selection = await (new storedProcedure('Search_User_Menu_Selection', [])).result();
    const User_Status = await (new storedProcedure('Get_User_Status', [])).result();
    const Branch = await (new storedProcedure('Dropdown_Branch', [])).result();
    const User_Department = await (new storedProcedure('Get_Department_InUser', [])).result();
    const Profile_Department = await (new storedProcedure('Get_Department', [])).result();
    const Application_Groups = await (new storedProcedure('Get_Application_Group', [])).result();
    const Application_Statuses = await (new storedProcedure('Get_Application_Status', [])).result();
    const Profile_Location = await (new storedProcedure('Get_Location', [])).result();
    const Call_Status = await (new storedProcedure('Enable_Call', [])).result();
    return { User_Type, User_Menu_Selection, User_Status, Branch, User_Department, Profile_Department, Application_Groups, Application_Statuses, Profile_Location, Call_Status };
  },
  // Get_User_Details_Edit:function(User_Details_Id_,callback)
  //    { 
  //    return db.query("CALL Get_User_Details_Edit(@User_Details_Id_ :=?)",[User_Details_Id_],callback);
  //    },
  Get_User_Details_Edit: async function (User_Id_) {
    const Menu = await (new storedProcedure('Get_User_Details_Edit', [User_Id_])).result();
    const Department = await (new storedProcedure('Get_User_Department_Edit', [User_Id_])).result();
    const Applic_Group = await (new storedProcedure('Get_Application_Group_Edit', [User_Id_])).result();
    const Applic_Status = await (new storedProcedure('Get_Application_Status_Edit', [User_Id_])).result();
    const All_time_dept = await (new storedProcedure('Get_All_Time_department_Edit', [User_Id_])).result();
    const User_Country = await (new storedProcedure('Get_User_Country_Edit', [User_Id_])).result();
    const User_Course = await (new storedProcedure('Get_User_Course_Edit', [User_Id_])).result();

    return { [0]: { Menu, Department, Applic_Group, Applic_Status, All_time_dept, User_Country, User_Course } };
  },
  Search_User_Role: function (User_Role_Name_, callback) {
    if (User_Role_Name_ === 'undefined' || User_Role_Name_ === '' || User_Role_Name_ === undefined)
      User_Role_Name_ = '';
    return db.query("CALL Search_User_Role(@User_Role_Name_ :=?)", [User_Role_Name_], callback);
  },

  /** Added on 03-12-2024 */


  Load_Course: function (callback) {
    return db.query("CALL Load_Course()", [], callback);
  },

  Load_Country: function (callback) {
    return db.query("CALL Load_Country()", [], callback);
  },

  // Get_Menu_Status:function(Menu_Id_,Login_User_,callback)
  // { 
  //   return db.query("CALL Get_Menu_Status(@Menu_Id_ :=?,@Login_User_:=?)", [Menu_Id_,Login_User_],callback);
  // } 

};

module.exports = User_Details;

