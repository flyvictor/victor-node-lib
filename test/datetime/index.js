var chai = require("chai"),
    datetime = require("../../datetime"),
    moment = require("moment");

var should = chai.should();

describe("Date/time logic", function() {

  it("should return undefined when converting a null date to an object", function() {
    should.not.exist(datetime.toObject());
  });

  it("should return undefined when converting an invalid date to an object", function() {
    should.not.exist(datetime.toObject(moment("blah").toDate()));
  });

  it("should return a correct object when convert a valid date with time to an object", function() {
    var date = datetime.toObject(moment("2014-02-10T06:21Z").toDate());
    date.date.should.equal("2014-02-10");
    date.time.should.equal("06:21");
    date.timeZone.should.equal(0);
  });

  it("should return a correct object with timezone offset when converting a date to an object", function() {
    var m = moment("2014-02-10T06:21Z");
    m.zone(120);
    
    var date = datetime.toObject(m);

    date.date.should.equal("2014-02-10");
    date.time.should.equal("06:21");
    date.timeZone.should.equal(0);
  });

  it("should return a null date when attempting to convert null into a javascript date", function() {
    should.not.exist(datetime.toDate(null));
  });

  it("should return a null date when attempting to convert an object with no date into a javascript date", function() {
    should.not.exist(datetime.toDate({}));
  });

  it("should return a null date when attempting to convert an object with an invalid date into a javascript date", function() {
    should.not.exist(datetime.toDate({date: "oops"}));
  });

  it("should convert a date time object into a javascript Date", function() {
    var date = datetime.toDate({
      date: "2014-02-10",
      time: "06:21",
      timeZone: 0
    });
    date.should.eql(moment("2014-02-10T06:21Z").toDate());
  });

  it("should convert a date object without time into a javascript Date", function() {
    var date = datetime.toDate({
      date: "2014-02-10"
    });
    date.should.eql(moment("2014-02-10T00:00Z").toDate());
  });

  describe("toObjectWithoutTime", function(){
    it("should convert to date format without time", function(){
      var date = datetime.toObjectWithoutTime("2014-02-10T06:21Z");
      date.date.should.equal("2014-02-10");
      should.not.exist(date.time);
      should.not.exist(date.timeZone);
    });

    it("should return undefined if passed wrong date",  function(){
      var date = datetime.toObjectWithoutTime("2014-22-10T06:21Z");
      should.not.exist(date);
    });

    it("should return undefined if passed null",  function(){
      var date = datetime.toObjectWithoutTime(null);
      should.not.exist(date);
    });
  });

  describe("isDateObject", function(){
    it("should recognize a date object", function(){
      var date = {date: "2014-02-10", time: "00:00"};
      datetime.isDateObject(date).should.equal(true);
    });

    it("should recognize a date object without time", function(){
      var date = {date: "2014-02-10"};
      datetime.isDateObject(date).should.equal(true);
    });
    it("should return false for undefined", function(){
      var date;
      datetime.isDateObject(date).should.equal(false);
    });
    it("should return false for null", function(){
      var date = null;
      datetime.isDateObject(date).should.equal(false);
    });
    it("should return false for a wrong date", function(){
      var date = {date: "2014-22-10"};
      datetime.isDateObject(date).should.equal(false);
    });

    it("should return false for a wrong time", function(){
      var date = {date: "2014-01-10", time: "25:00"};
      datetime.isDateObject(date).should.equal(false);
    });
  });

  describe("date conversion", function () {
    
    it("should return expected arrival time", function () {
      var depDateTime = moment("2014-02-10T14:00Z").toDate();
      var durationInMinutes = 60;
      var arrivalTimeZone = "Europe/Paris";

      var arrival = datetime.calculateArrival(depDateTime, durationInMinutes, arrivalTimeZone);

      arrival.date.should.equal("2014-02-10");
      arrival.time.should.equal("15:00");
      arrival.timeZone.should.equal(0);
    });

  });

});