import { type } from "os";

(function () {
  'use strict';
  let ko = require('knockout');

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
    _ONEDAY = new Date(86400000);
    begin: Date;
    end: Date;
    constructor(begin: Date, end: Date) {
      let tempBegin = new Date();
      let tempEnd = new Date();
      tempBegin.setHours(begin.getHours(), begin.getMinutes(), begin.getSeconds(), begin.getMilliseconds());
      tempEnd.setHours(end.getHours(), end.getMinutes(), end.getSeconds(), end.getMilliseconds());
      if (tempBegin >= tempEnd) tempEnd = new Date(tempEnd.getTime() + this._ONEDAY.getTime());

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
  class schedule{
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
  }

  let myVievModel = {
    days:{}

  }



})();