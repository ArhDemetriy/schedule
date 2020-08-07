import { type } from "os";

(function () {
  'use strict';
  let ko = require('knockout');

  type DaySchedule = Array<Interval>;
  type WeekSchedule = Map<string, DaySchedule>;

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
      _mon  : DaySchedule = [],
      _tues : DaySchedule = [],
      _wed  : DaySchedule = [],
      _thurs: DaySchedule = [],
      _fri  : DaySchedule = [],
      _sat  : DaySchedule = [],
      _sun  : DaySchedule = [],
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
        if (day.length <= 0) return;
        day.sort((a, b) => { return a.begin.getTime() - b.begin.getTime(); });
        day = day.filter((value, index, array: DaySchedule) => {
          if ((array.length - 1 > index) && (array[index + 1].IsCross(array[index]))) {
            array[index + 1] = array[index + 1].Concat(array[index]);
            return false;
          } else
            return true;
        });
        if ((day.length > 2) && (day[0].IsCross(day[day.length - 1])))
          day[0] = day[0].Concat(day.pop());
        map.set(key, day);
      });
      this.week = week;
    }
    AddInterval(dayName: string, interval: Interval) {
      const day = this.week.get(dayName);
      const targetPos = day.findIndex((value) => { return value.begin > interval.begin; });
      if

      day.push(interval);
    }
    Clear() {
      this.week.forEach((_,key: string, map: WeekSchedule) => {
        map.set(key, []);
      })
    }
    Fiil() {
      this.week.forEach((_, key: string, map: WeekSchedule) => {
        const tempinterval = new Interval(new Date(), new Date());
        tempinterval.end.setHours(24, 0, 0, -1);
        map.set(key,[tempinterval]);
      })
    }

  }

  let myVievModel = {
    days:{}

  }



})();