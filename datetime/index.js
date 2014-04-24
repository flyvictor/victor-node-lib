var moment = require("moment-timezone");

/**
 * Calculates an arrival time based on dep date, duration and target time zone.
 *
 * @param {String} Departure time zone in IANA code format.
 * @param {String} Departure date & time.
 * @param {Number} Duration of travel in minutes.
 * @param {String} Arrival time zone in IANA code format.
 * @return {Date} FlyVictor date object with arrival date and time info.
 * @api public
 */
function calculateArrival(departureTimeZone, depDateTime, durationInMinutes, arrivalTimeZone) {
  
  var arrival = moment(new Date("1900-01-01T00:00Z"));
  var timeZone = 0;
  var time = "00:00";

  if (departureTimeZone && depDateTime && durationInMinutes && arrivalTimeZone) {
    try {
      var departure = moment.tz(depDateTime, departureTimeZone);
      
      if (departure.format() !== "Invalid date") {
        arrival = departure.tz(arrivalTimeZone);
        arrival.add("m", durationInMinutes);
        timeZone = arrival.zone();
        time = arrival.format("HH:mm");
      }
    } catch (e) {
      console.warn("invalid timezone");
    }
  }

  return {
    date: arrival.format("YYYY-MM-DD"),
    time: time,
    timeZone: timeZone
  };
}

/**
 * Parses a JavaScript date time object to the FlyVictor date object.
 *
 * @param {Date} Date object to be parsed.
 * @return {Object} FlyVictor date object.
 * @api public
 */
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

/**
 * Parses a JavaScript date time object to the FlyVictor JSON format exlcuding 
 *     time & timezone data.
 *
 * @param {Date} Date object to be parsed
 * @return {Object} FlyVictor date object (exluding time info).
 * @api public
 */
function toObjectWithoutTime(date) {
  var m = moment(date);
  if (date && m.isValid()) {
    return {
      date: m.format("YYYY-MM-DD")
    };
  }
}

/**
 * Parses an object to a JavaScript date object.
 *
 * @param {Object} Object to be parsed.
 * @return {Date} JavaScript Date object.
 * @api public
 */
function toDate(obj) {
  if (obj && obj.date) {
    var time = !obj.time ? "00:00": obj.time;
    var m = moment(new Date(obj.date + "T" + time + "Z")).zone(obj.timeZone+moment().zone());
    if (m.isValid())
      return moment(m.format("YYYY-MM-DDTHH:mm:ssZ")).toDate();
  }
}

/**
 * Parses an object to a JavaScript date object.
 *
 * @param {Object} Object to be parsed.
 * @return {Boolean} A value that determines whether the object is a valid date.
 * @api public
 */
function isDateObject(obj){
  if(!obj) return false;
  var result = toDate(obj);
  return !!result;
}

module.exports.calculateArrival = calculateArrival;
module.exports.toObjectWithoutTime = toObjectWithoutTime;
module.exports.isDateObject = isDateObject;
module.exports.toObject = toObject;
module.exports.toDate = toDate;