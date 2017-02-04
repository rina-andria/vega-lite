"use strict";
var chai_1 = require("chai");
var datetime_1 = require("../src/datetime");
var log = require("../src/log");
describe('datetime', function () {
    describe('dateTimeExpr', function () {
        it('should drop day if day is combined with year/month/date', function () {
            log.runLocalLogger(function (localLogger) {
                var d = {
                    year: 2007,
                    day: 'monday'
                };
                var expr = datetime_1.dateTimeExpr(d, true);
                chai_1.assert.equal(expr, 'datetime(2007, 0, 1, 0, 0, 0, 0)');
                chai_1.assert.equal(localLogger.warns[0], log.message.droppedDay(d));
            });
        });
        it('should normalize numeric quarter correctly', function () {
            var expr = datetime_1.dateTimeExpr({
                quarter: 2
            }, true);
            chai_1.assert.equal(expr, 'datetime(0, 1*3, 1, 0, 0, 0, 0)');
        });
        it('should log warning for quarter > 4', function () {
            log.runLocalLogger(function (localLogger) {
                chai_1.assert.equal(datetime_1.dateTimeExpr({
                    quarter: 5
                }, true), 'datetime(0, 4*3, 1, 0, 0, 0, 0)');
                chai_1.assert.equal(localLogger.warns[0], log.message.invalidTimeUnit('quarter', 5));
            });
        });
        it('should throw error for invalid quarter', function () {
            chai_1.assert.throws(function () {
                datetime_1.dateTimeExpr({ quarter: 'Q' }, true);
            }, Error, log.message.invalidTimeUnit('quarter', 'Q'));
        });
        it('should normalize numeric month correctly', function () {
            var expr = datetime_1.dateTimeExpr({
                month: 1
            }, true);
            chai_1.assert.equal(expr, 'datetime(0, 0, 1, 0, 0, 0, 0)');
        });
        it('should normalize month name correctly', function () {
            chai_1.assert.equal(datetime_1.dateTimeExpr({
                month: 'January'
            }, true), 'datetime(0, 0, 1, 0, 0, 0, 0)');
            chai_1.assert.equal(datetime_1.dateTimeExpr({
                month: 'january'
            }, true), 'datetime(0, 0, 1, 0, 0, 0, 0)');
            chai_1.assert.equal(datetime_1.dateTimeExpr({
                month: 'Jan'
            }, true), 'datetime(0, 0, 1, 0, 0, 0, 0)');
            chai_1.assert.equal(datetime_1.dateTimeExpr({
                month: 'jan'
            }, true), 'datetime(0, 0, 1, 0, 0, 0, 0)');
        });
        it('should throw error for invalid month', function () {
            chai_1.assert.throws(function () {
                datetime_1.dateTimeExpr({ month: 'J' }, true);
            }, Error, log.message.invalidTimeUnit('month', 'J'));
        });
        it('should normalize numeric day (of week) correctly', function () {
            chai_1.assert.equal(datetime_1.dateTimeExpr({
                day: 0
            }, true), 'datetime(2006, 0, 0+1, 0, 0, 0, 0)');
            chai_1.assert.equal(datetime_1.dateTimeExpr({
                day: 7
            }, true), 'datetime(2006, 0, 0+1, 0, 0, 0, 0)');
        });
        it('should normalize day name correctly and use year 2006 to ensure correct', function () {
            chai_1.assert.equal(datetime_1.dateTimeExpr({
                day: 'Sunday'
            }, true), 'datetime(2006, 0, 0+1, 0, 0, 0, 0)');
            chai_1.assert.equal(datetime_1.dateTimeExpr({
                day: 'sunday'
            }, true), 'datetime(2006, 0, 0+1, 0, 0, 0, 0)');
            chai_1.assert.equal(datetime_1.dateTimeExpr({
                day: 'Sun'
            }, true), 'datetime(2006, 0, 0+1, 0, 0, 0, 0)');
            chai_1.assert.equal(datetime_1.dateTimeExpr({
                day: 'sun'
            }, true), 'datetime(2006, 0, 0+1, 0, 0, 0, 0)');
        });
        it('should throw error for invalid day', function () {
            chai_1.assert.throws(function () {
                datetime_1.dateTimeExpr({ day: 'S' }, true);
            }, Error, log.message.invalidTimeUnit('day', 'S'));
        });
        // Note: Other part of coverage handled by timeUnit.fieldExpr's test
    });
    describe('timestamp', function () {
        it('should produce correct timestamp', function () {
            chai_1.assert.equal(datetime_1.timestamp({
                year: 1234,
                month: 'June',
                date: 6,
                hours: 7,
                minutes: 8,
                seconds: 9,
                milliseconds: 123
            }, true), new Date(1234, 5, 6, 7, 8, 9, 123).getTime());
        });
        it('should produce correct timestamp for quarter', function () {
            chai_1.assert.equal(datetime_1.timestamp({
                year: 1234,
                quarter: 3,
            }, true), new Date(1234, 6, 1).getTime());
        });
        it('should produce correct timestamp for day', function () {
            chai_1.assert.equal(datetime_1.timestamp({
                day: 'monday'
            }, true), new Date(2006, 0, 2).getTime());
        });
    });
});
//# sourceMappingURL=datetime.test.js.map