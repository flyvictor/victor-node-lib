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

  /*
  it("should return a correct object when convert a valid date with time to an object", function() {
    var date = datetime.toObject(moment("2014-02-10T06:21Z").toDate());
    date.date.should.equal("2014-02-10");
    date.time.should.equal("06:21");
    date.timeZone.should.equal(moment().zone());
  });

  it("should return a correct object with timezone offset when converting a date to an object", function() {
    var m = moment("2014-02-10T06:21Z");
    m.zone(120);
    
    var date = datetime.toObject(m);

    date.date.should.equal("2014-02-10");
    date.time.should.equal("06:21");
    date.timeZone.should.equal(120);
  });
  */

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
});