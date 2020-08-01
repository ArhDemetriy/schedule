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
    let turn = true;
    if (event.target.matches('.table__time_begin'))
      turn = true
    else if (event.target.matches('.table__time_end'))
      turn = false
    else
      return;

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