import { type } from "os";

(function () {
  'use strict';
  let ko = require('knockout');
  const DAY         = 86400000;
  const HALFANHOUR  = 1800000;

  type WeekSchedule = Map<string, DaySchedule>;
  class DaySchedule extends Array<Interval>{
    constructor(array?: Array<Interval>) {
      if (array) super(...array)
      else super();

      this.FixDaySchedule = function () {
        if (this.length <= 0) return;
        this.sort((a, b) => { return a.begin.getTime() - b.begin.getTime(); });
        const temp: DaySchedule = this.filter((value, index, array: DaySchedule) => {
          if ((array.length - 1 > index) && (array[index + 1].IsCross(array[index]))) {
            array[index + 1] = array[index + 1].Concat(array[index]);
            return false;
          } else
            return true;
        });
        if ((temp.length > 2) && (temp[0].IsCross(temp[temp.length - 1])))
          temp[0] = temp[0].Concat(temp.pop());
        this.splice(0, this.length, ...temp);
      };

      if (this.length > 1) this.FixDaySchedule();
    };
    FixDaySchedule: ()=>void;
  };
  class Interval{
    begin: Date;
    end: Date;
    constructor(begin: Date, end: Date) {
      let tempBegin = new Date();
      let tempEnd = new Date();
      tempBegin.setHours(begin.getHours(), begin.getMinutes(), begin.getSeconds(), begin.getMilliseconds());
      tempEnd.setHours(end.getHours(), end.getMinutes(), end.getSeconds(), end.getMilliseconds());
      if (tempBegin >= tempEnd) tempEnd = new Date(tempEnd.getTime() + DAY);

      this.begin = tempBegin;
      this.end = tempEnd;
    };
    IsCross(interval: Interval): Boolean {
      return ((this.begin <= interval.begin) && (interval.begin <= this.end)) ||
        ((this.begin <= interval.end) && (interval.end <= this.end)) ||
        ((interval.begin <= this.begin) && (this.end <= interval.end));
    };
    Concat(interval: Interval): Interval{
      let tempBegin = this.begin;
      let tempEnd = this.end;
      if (interval.begin < tempBegin) tempBegin = interval.begin;
      if (interval.end > tempEnd) tempEnd = interval.end;
      return new Interval(tempBegin, tempEnd);
    }
  };
  class Schedule{
    week: WeekSchedule;
    constructor(
      _mon   = new DaySchedule(),
      _tues  = new DaySchedule(),
      _wed   = new DaySchedule(),
      _thurs = new DaySchedule(),
      _fri   = new DaySchedule(),
      _sat   = new DaySchedule(),
      _sun   = new DaySchedule(),
    ) {
      const week: WeekSchedule = new Map([
        ['mon', _mon],
        ['tues', _tues],
        ['wed', _wed],
        ['thurs', _thurs],
        ['fri', _fri],
        ['sat', _sat],
        ['sun', _sun],
      ]);
      week.forEach((day: DaySchedule, key: string, map: WeekSchedule) => {
        day.FixDaySchedule();
        map.set(key, day);
      });
      this.week = week;
    }
    AddInterval(dayName: string, interval: Interval) {
      const day = this.week.get(dayName);
      day.push(interval);
      day.FixDaySchedule();
      this.week.set(dayName, day);
    }
    Clear() {
      this.week.forEach((_,key: string, map: WeekSchedule) => {
        map.set(key, new DaySchedule());
      })
    }
    Fiil() {
      this.week.forEach((_, key: string, map: WeekSchedule) => {
        const tempinterval = new Interval(new Date(), new Date());
        tempinterval.end.setHours(24);
        map.set(key, new DaySchedule([tempinterval]));
      })
    }
  };
  class MyVievModel{
    data: Schedule;
    model: Map<string, Array<{ time:number, name: string}>>;
    viewInterval: Interval;
    period: Date;
    countPeriods: number;
    viewBegin: Date;
    viewEnd: Date;
    countCel: number;
    inDayTicks: {from: Date, to: Date, period: Date, [Symbol.iterator](): Generator<Date,Date,void>};
    constructor(
      viewInterval: Interval = new Interval(new Date(), new Date(DAY)),
      period: Date = new Date(HALFANHOUR),
    ) {
      this.viewInterval = new Interval(viewInterval.begin, viewInterval.end);
      this.period = new Date();
      this.period.setHours(period.getHours(), period.getMinutes(), period.getSeconds(), period.getMilliseconds());

      this.inDayTicks = (function (from: Date, to: Date, period: Date) {
        let twoStepIteration = new Date();
        twoStepIteration.setHours(from.getHours());
        if (twoStepIteration.getTime() < from.getTime()) twoStepIteration.setHours(twoStepIteration.getHours() + 1);
        twoStepIteration.setTime(twoStepIteration.getTime() + ((twoStepIteration.getTime() - from.getTime()) % period.getTime()));
        if (twoStepIteration.getTime() <= from.getTime()) twoStepIteration.setTime(twoStepIteration.getTime() + period.getTime());
        return {
          from: from,
          to: to,
          period: period,
          *[Symbol.iterator](): Generator<Date,Date,void> {
            yield this.from;
            for (let value = new Date(twoStepIteration.getTime()); value < this.to; value.setTime(value.getTime() + this.period.getTime())) {
              yield value;
            }
            return this.to;
          }
        };
      })(new Date(this.viewInterval.begin.getTime()), new Date(this.viewInterval.end.getTime()), new Date(this.period.getTime()));

      this.countCel = Math.ceil(DAY / this.period.getTime());

      const tempArr = []; {
        for (let i = new Date(); i.getTime() < DAY; i.setTime(i.getTime() + this.period.getTime())) {
          tempArr.push({
            time: i.getTime(),
            name: `${i.getHours()}:${i.getMinutes()}`,
          });
        };
        tempArr.push({
          time: DAY,
          name: (() => {
            const temp = new Date(DAY);
            return `${temp.getHours()}:${temp.getMinutes()}`
          })(),
        });
      }

      this.data = new Schedule();
      for (let key of this.data.week.keys()){
        const arr = [];
        tempArr.forEach((value) => {
          arr.push({
            time: value.time,
            name: value.name,
          });
        });
        this.model.set(key, arr);
      };
    };
  }

  let viewModel = function () {
    const tempModel = new MyVievModel();
    const initArr = [];
    tempModel.model.get('mon').forEach((value) => {
      initArr.push({
        time: value.time,
        name: value.name,
      })
    });
    this.items = ko.observableArray(initArr);
    this.begin = ko.observable("12:43");
    this.end = ko.observable("32:54");
  }
  ko.applyBindings(new viewModel());

})();