var moment = require("moment");

// Convert a date to object format, with date and time
// (we will likely need a version that does this, without time)
function toObject(date) {
  var m = moment(date);
  if (date && m.isValid()) {
    // Remove time zone from moment date to get correct time format with HH:mm
    m.zone(0);
    return {
      date: m.format("YYYY-MM-DD"),
      time: m.format("HH:mm"),
      timeZone: 0
    };
  }
}

function toObjectWithoutTime(date) {
  var m = moment(date);
  if (date && m.isValid()) {
    return {
      date: m.format("YYYY-MM-DD")
    };
  }
}

function toDate(obj) {
  if (obj && obj.date) {
    var time = !obj.time ? "00:00": obj.time;
    var m = moment(obj.date + "T" + time + "Z").zone(obj.timeZone+moment().zone());
    if (m.isValid())
      return moment(m.format("YYYY-MM-DDTHH:mm:ssZ")).toDate();
  }
}

function isDateObject(obj){
  if(!obj) return false;
  var result = toDate(obj);
  return !!result;
}

module.exports.toObjectWithoutTime = toObjectWithoutTime;
module.exports.isDateObject = isDateObject;
module.exports.toObject = toObject;
module.exports.toDate = toDate;