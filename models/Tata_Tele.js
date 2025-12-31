const db = require("../dbconnection");
const Tata_Tele = {
  insertCallHistory: function (event, callback) {
    const {
      uuid,
      call_to_number,
      caller_id_number,
      hangup_cause,
      direction,
      duration,
      answered_agent,
      answered_agent_name,
      answered_agent_number,
      missed_agent,
      recording_url,
      call_status,
      call_id,
      outbound_sec,
      aws_call_recording_identifier,
      reason_key,
    } = event;

    const customer_no_with_prefix =
      event["customer_no_with_prefix "] ||
      event.customer_no_with_prefix ||
      null;

    db.query(
      "CALL save_call_data(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        uuid,
        call_to_number,
        caller_id_number,
        hangup_cause,
        direction,
        parseInt(duration) || 0,
        answered_agent.number,
        answered_agent_name,
        answered_agent_number,
        missed_agent[0]?.number || null,
        recording_url,
        call_status,
        call_id,
        parseInt(outbound_sec) || 0,
        aws_call_recording_identifier,
        customer_no_with_prefix,
        reason_key,
      ],
      callback
    );
  },
  //   Search_Call_History
  Search_Call_History: function (
  startDate,
  endDate,
  direction,
  callerIdNumber,
  agentName,
  studentName,
  callback
) {
  // Normalize and format parameters
  startDate = formatDateForMySQL(startDate);
  endDate = formatDateForMySQL(endDate);
  direction = !direction || direction === 'null' || direction === "undefined" ? null : direction;
  callerIdNumber = !callerIdNumber || callerIdNumber === 'null' || callerIdNumber === "" || callerIdNumber === "undefined" ? null : callerIdNumber;
  agentName = !agentName || agentName === 'null' || agentName === "" || agentName === "undefined" ? null : agentName;
  studentName = !studentName || studentName === 'null' || studentName === "" || studentName === "undefined" ? null : studentName;

  return db.query(
    "CALL Search_Call_History(?, ?, ?, ?, ?, ?)",
    [startDate, endDate, direction, callerIdNumber, agentName, studentName],
    callback
  );
}
};
function formatDateForMySQL(dateStr) {
  if (!dateStr || dateStr === 'null' || dateStr === 'undefined') return null;
  const d = new Date(dateStr);
  return d.toISOString().slice(0, 19).replace('T', ' '); // MySQL DATETIME format
}
module.exports = Tata_Tele;
