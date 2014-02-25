var moment = require("moment");

// Convert a date to object format, with date and time
// (we will likely need a version that does this, without time)
function toObject(date) {
  var m = moment(date);
  if (date && m.isValid()) {
    // Remove time zone from moment date to get correct time format with HH:mm
    var zone = m.zone();
    m.zone(0);
    return {
      date: m.format("YYYY-MM-DD"),
      time: m.format("HH:mm"),
      timeZone: zone
    };
  }
}

function toDate(obj) {
  if (obj && obj.date) {
    var m = moment(obj.date+"T"+obj.time+"Z").zone(obj.timeZone+moment().zone());
    if (m.isValid())
      return moment(m.format("YYYY-MM-DDTHH:mm:ssZ")).toDate();
  }
}

module.exports.toObject = toObject;
module.exports.toDate = toDate;