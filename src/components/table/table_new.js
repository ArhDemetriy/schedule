(function () {
  'use strict';
  let ko = require('knockout');

  class interval{
    constructor(begin, end) {
      this.begin= begin;
      this.end= end;
    };
    IsCross(interval) {
      const correctInput = (interval && interval.hasOwnProperty && interval.hasOwnProperty('begin') && interval.hasOwnProperty('end') && isFinite(interval.begin) && isFinite(interval.end));
      if (!correctInput) return false;
      let result = false;
    };
  };

  class schedule{
    constructor(
      mon   = [],
      tues  = [],
      wed   = [],
      thurs = [],
      fri   = [],
      sat   = [],
      sun   = [],
    ) {
      const week = new Map([
        [mon],
        [tues],
        [wed],
        [thurs],
        [fri],
        [sat],
        [sun],
      ]);
      week.forEach((day, key, map) => {
        if (day.length <= 0) return;
        map[key] = day.filter((value, index, array) => {
          if (!(value && value.hasOwnProperty && value.hasOwnProperty('begin') && value.hasOwnProperty('end') && isFinite(value.begin) && isFinite(value.end)))
            return false
          else if ((array.length - 1 > index) && (array[index + 1].begin <= array[index].end)){
            array[index + 1].begin = array[index].begin;
            return false;
          }else
            return true;
        })
      });
      this.week = week;
    }

    AddInterval(day, begin, end) {
      if (!(this.week.has(day) && isFinite(begin) && isFinite(end))) return;
      const i = this.week[day].find((item) => { return ((item.begin >= begin) || (item.end >= end)) });
      if (i < 0) {
        if (this.week[day][0].begin <= end)
          this.week[day][0].begin = begin
      }

    }

  }

  let myVievModel = {
    days:{}

  }



})();