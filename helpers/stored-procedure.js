/**
 * Call a stored procedure using Sequelize query method
 * @author Rahul om <rahulom666@gmail.com>
 */

const db = require("../dbconnection");
const util = require("util");
class StoredProcedure {
  constructor(name, params,db1) {
    this.db=db1;
    this.name = name;
    this.params = params;
    this.buildQuery();

  }

  /**
   * Build the Stored procedure query
   */
  buildQuery() {
    this.query = `call ${this.name} (`;
    for (let i = 1; i <= this.params.length; i++) {
      this.query += `?`;
      if (this.params.length != i) {
        this.query += ",";
      }
    }
    this.query += ")";
  }

  /**
   * Excute and get the results
   */
  result() {
    let params = this.params;
    for (const key in params) {
      if (!params[key] && typeof params[key] === "undefined") {
        params[key] = null;
      }
  
      // Use typeof check instead of util.isObject
      if (typeof params[key] === "object" && params[key] !== null && !Array.isArray(params[key])) {
        params[key] = JSON.stringify(params[key]);
      }
  
      if (Array.isArray(params[key])) {
        if (params[key][0] && typeof params[key][0] === "object" && params[key][0] !== null) {
          params[key] = JSON.stringify(params[key]);
        }
      }
    }
  
    return new Promise((res, rej) => {
      const dbCall = this.db1 ? this.db1 : db;
      dbCall.query(this.query, params, (er, s) => {
        if (er) {
          rej(er);
        } else {
          res(s[0]);
        }
      });
    });
  }
  
}
module.exports = StoredProcedure;
