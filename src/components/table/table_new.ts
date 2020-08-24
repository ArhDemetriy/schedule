import { stringify } from "querystring";
import { type } from "os";
import { Console } from "console";
import { isArray } from "util";

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
  type DayNames = 'mon' | 'tues' | 'wed' | 'thurs' | 'fri' | 'sat' | 'sun';
  interface iSchedule{
    getCountIntervals(): number;
    getDaySchedule(day: DayNames): Array<boolean>;
    test(): any;
  }
  interface iMutableSchedule{
    setBegin(time: Date): void;
    setEnd(time: Date): void;
    setPeriod(time: Date): void;
  }
  interface iMutableWorkIntervalsOnSchedule extends iSchedule{
    toggleWorkInterval(day: DayNames, posInterval: number): void;
    setStateWorkInterval(day: DayNames, posInterval: number, state: boolean): void;
    onAllWorkInterval(): void;
    offAllWorkInterval(): void;
  }
  class Schedule implements iSchedule{
    protected readonly dayNames: Array<DayNames> = ['mon', 'tues', 'wed', 'thurs', 'fri', 'sat', 'sun'];
    protected countIntervals: number;
    protected schedule: Map<DayNames, Array<boolean>>;
    protected iterator: {
      from: Date,
      to: Date,
      period: Date,
      [Symbol.iterator]: () => { next(): { done: boolean, value: Date } },
    };
    test() {
      return [...this.iterator]
    }

    constructor(begin: Date, end: Date, period: Date,) {
      const _begin = new Date(begin.getTime());
      const _end = new Date(end.getTime());
      const _period = new Date(period.getTime());
      if (_end <= _begin) _end.setTime(_end.getTime() + DAY);
      this.iterator = this.WorkIntervalIterator(_begin, _end, _period);
      const workIntervals = [...this.iterator];
      this.countIntervals = workIntervals.length;
      this.schedule = new Map();

      for (let dayName of this.dayNames) {
        this.schedule.set(dayName, Array(this.countIntervals).fill(true));
      }
    }
    protected WorkIntervalIterator(from: Date, to: Date, period: Date,) {
      // const twoStepIteration = new Date(0);
      // twoStepIteration.setHours(from.getHours() + 1);
      // twoStepIteration.setTime(twoStepIteration.getTime() + period.getTime());
      // twoStepIteration.setTime(twoStepIteration.getTime() - (period.getTime() * Math.floor((twoStepIteration.getTime() - from.getTime()) / period.getTime())));
      // if (twoStepIteration <= from) twoStepIteration.setTime(twoStepIteration.getTime() + period.getTime());
      const temp = {
        from: new Date(from.getTime()),
        to: new Date(to.getTime()),
        period: new Date(period.getTime()),
        [Symbol.iterator]: function () {
          const twoStepIteration = new Date(0);
          twoStepIteration.setHours(this.from.getHours() + 1);
          twoStepIteration.setTime(twoStepIteration.getTime() + this.period.getTime());
          twoStepIteration.setTime(twoStepIteration.getTime() - (this.period.getTime() * Math.floor((twoStepIteration.getTime() - this.from.getTime()) / this.period.getTime())));
          if (twoStepIteration <= this.from) twoStepIteration.setTime(twoStepIteration.getTime() + this.period.getTime());

          return {
            from: new Date(this.from.getTime()),
            to: new Date(this.to.getTime()),
            period: new Date(this.period.getTime()),
            _current: new Date(twoStepIteration.getTime()),
            _fierstStep: true,
            next(): { done: boolean; value: Date } {
              if (this._fierstStep) {
                this._fierstStep = !this._fierstStep;
                return { done: false, value: new Date(this.from.getTime())}
              } else if (this._current < this.to) {
                const value = new Date(this._current.getTime());
                this._current.setTime(this._current.getTime() + this.period.getTime());
                return { done: false, value };
              } else if (this._current >= this.to && this._current.getTime() < (this.to.getTime() + this.period.getTime())) {
                this._current.setTime(this._current.getTime() + this.period.getTime());
                return { done: false, value: new Date(this.to.getTime())}
              } else {
                return { done: true, value:this.to};
              }
            },
          };
        },
        // *[Symbol.iterator](): Generator<Date,Date,void> {
        //   yield new Date(this.from.getTime());
        //   for (let value = new Date(twoStepIteration.getTime()); value < this.to; value.setTime(value.getTime() + this.period.getTime())) {
        //     yield new Date(value.getTime());
        //   }
        //   return new Date(this.to.getTime());
        // }
      };
      return temp;
    }
    getCountIntervals() {
      return this.countIntervals;
    }
    getDaySchedule(day: DayNames) {
      let arr = this.schedule.get(day);
      if (isArray(arr))
        return arr.concat()
      else
        return [];
    }
  }

  class HelloViewModel {
    DayNames = [
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
    private schedule: iSchedule;

    private createIterator(
      begin: Date,
      end: Date,
      period: Date,
    ) {
      (function (from: Date, to: Date, period: Date) {
        let twoStepIteration = new Date(0);
        twoStepIteration.setHours(from.getHours() + 1);
        twoStepIteration.setTime(twoStepIteration.getTime() + period.getTime());
        twoStepIteration.setTime(twoStepIteration.getTime() - (period.getTime() * Math.floor((twoStepIteration.getTime() - from.getTime()) / period.getTime())));
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
      })(new Date(begin.getTime()), new Date(end.getTime()), new Date(period.getTime()));

    }
    private createSchedule(
      begin: Date,
      end: Date,
      period: Date,
    ) {


    }

    constructor(begin: string = '00:00', end: string = '00:00', period: Date = new Date(HALFANHOUR)) {

      this.begin = ko.observable(begin);
      this.end = ko.observable(end);
      this.period = period;

      this.schedule = new Schedule(new Date(0), new Date(DAY / 2), period);

      console.log(`${this.schedule.test()}`);

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
          return twoInterval;
        })(new Date(0));
        for (; iterator < end; iterator.setTime(iterator.getTime() + period.getTime()))
          result.push(`${String(iterator.getHours()).padStart(2, '0')}:${String(iterator.getMinutes()).padStart(2, '0')}`);
        result.push(`${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`);
        return result;
      }, this);

      this.week = new Map();
      for (let day of this.DayNames) {

        const daySchedule: Array<boolean> = [];
        this.week.set(day.name, ko.observableArray());
      }
    }
  }

  ko.applyBindings(new HelloViewModel());

})();