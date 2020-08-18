import { stringify } from "querystring";
import { type } from "os";
import { Console } from "console";

(function () {
  'use strict';
  let ko = require('knockout');
  const DAY         = 86400000;
  const HALFANHOUR  = 1800000;
  //
  const ZERODATEPREFIX = (zerodate =>
    `${zerodate.getFullYear()}-${String(zerodate.getMonth()).padStart(2, '0')}-${String(zerodate.getDate()).padStart(2, '0')}T`
  )(new Date(0));

  interface SmartDate {
    getDate(): string;
    getDate(): Date;
    setDate(value: string): void;
    setDate(value: Date): void;
  }
  const strToTime = (time: string) => {
    const result = new Date(0);
    const splitedTime = time.trim().split(':');
    if (!splitedTime || splitedTime.length < 1 || splitedTime.some(value => !isFinite(+value))) return result;
    result.setHours(...splitedTime.map(value => Number(value)) as [number,number,number,number]);
    return result;
  }

  class HelloViewModel {
    dayNames = [
      { name: 'mon',
        ru: 'Пн'},
      { name: 'tues',
        ru: 'Вт'},
      { name: 'wed',
        ru: 'Ср'},
      { name: 'thurs',
        ru: 'Чт'},
      { name: 'fri',
        ru: 'Пт'},
      { name: 'sat',
        ru: 'Сб'},
      { name: 'sun',
        ru: 'Вс'},
    ];
    week: Map<string,KnockoutObservableArray<boolean>>;
    private begin: KnockoutObservable<string>;
    private end: KnockoutObservable<string>;
    private columns: KnockoutComputed<Array<string>>;
    private period: Date;

    constructor(begin: string = '00:00', end: string = '00:00', period: Date = new Date(HALFANHOUR)) {
      this.begin = ko.observable(begin);
      this.end = ko.observable(end);
      this.period = period;

      this.columns = ko.pureComputed(() => {
        const result: Array<string> = [this.begin()];
        const begin = strToTime(this.begin());
        const end = strToTime(this.end());
        const period: Date = this.period;
        if (end <= begin) end.setTime(end.getTime() + DAY);
        const iterator = ((twoInterval) => {
          twoInterval.setHours(begin.getHours() + 1);
          twoInterval.setTime(twoInterval.getTime() + period.getTime());
          twoInterval.setTime(twoInterval.getTime() - (period.getTime() * Math.floor((twoInterval.getTime() - begin.getTime()) / period.getTime())));
          if (twoInterval <= begin) twoInterval.setTime(twoInterval.getTime() + period.getTime());
          console.log(`${String(twoInterval.getHours()).padStart(2, '0')}:${String(twoInterval.getMinutes()).padStart(2, '0')}`);
          return twoInterval;
        })(new Date(0));
        for (; iterator < end; iterator.setTime(iterator.getTime() + period.getTime()))
          result.push(`${String(iterator.getHours()).padStart(2, '0')}:${String(iterator.getMinutes()).padStart(2, '0')}`);
        result.push(`${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`);
        return result;
      }, this);

      this.week = new Map();
      for (let day of this.dayNames) {

        const daySchedule: Array<boolean> = [];
        this.week.set(day.name, ko.observableArray());
      }
    }
  }

  ko.applyBindings(new HelloViewModel());

})();