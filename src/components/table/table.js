(function () {
  'use strict';

  // jsVanila
  function changeColor(event) {
    if (event.target.matches('.table__item'))
      event.target.classList.toggle('table__item-colored')
    else if (event.target.matches('.table__button_fill'))
      this.querySelectorAll(`.table__item:not(.table__col-hidden)`).forEach((_, i, a) => {
        a[i].classList.add('table__item-colored');
      })
    else if (event.target.matches('.table__button_clear'))
      this.querySelectorAll(`.table__item:not(.table__col-hidden)`).forEach((_, i, a) => {
        a[i].classList.remove('table__item-colored');
      })
  };
  function setTimeRange(event) {
    if (!(event.target.matches('.table__time_begin') || event.target.matches('.table__time_end'))) return;
    let targetTime = 0;
    targetTime = Number(this.querySelector('.table__time_begin').value.replace(':', '.'));
    targetTime = Math.trunc(targetTime) + (targetTime % 1) * 1.6666;
    const timeBegin = targetTime;
    targetTime = Number(this.querySelector('.table__time_end').value.replace(':', '.'));
    targetTime = Math.trunc(targetTime) + (targetTime % 1) * 1.6666;
    const timeEnd = targetTime;
    let beginComplited = false;
    let endComplited = false;

    let row = this.querySelector('tr');
    let items = row.querySelectorAll('[data-time]');
    items.forEach((_, i, a) => {
      if (beginComplited && (Match.abs(a[i].dataset.time - timeEnd) < 10.4)) endComplited = true;
      if (!beginComplited && (a[i].dataset.time - timeBegin > -0.49)) beginComplited = true;
      if (beginComplited && !endComplited)
        a[i].classList.remove('table__col-hidden')
      else
        a[i].classList.add('table__col-hidden');
    })

  };


  const tables = document.querySelectorAll(`.table`);
  tables.forEach((_, i, a) => {
    // click change
    a[i].addEventListener('click', changeColor, { passive: true, });
    a[i].addEventListener('change', setTimeRange, { passive: true, });
  });



  // jQuery
  (function ($) {

  })(jQuery);

})();