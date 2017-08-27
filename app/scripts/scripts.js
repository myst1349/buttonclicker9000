
(function ($) {
  'use strict';


  $(document).ready( function() {
    var counter = 0;
    var button = $('#counter-btn');
    var totalCount = $('#total-count');
    var TIMEOUT = {
      ANIMATION: 1000,
      LOADER: 5000
    };

    var debounce = function(func, wait, immediate) {
      var timeout;
      
      return function() {
        var context = this, args = arguments;
        var later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    };


    button.click(function() {
      var that = $(this);
      that.prop('disabled', true).parent().toggleClass('js-button--fadeout');

      debounce(function() {
        counter++;
        totalCount.text(counter);

        debounce(function() {
          that.prop('disabled', false).parent().toggleClass('js-button--fadeout');
        }, TIMEOUT.LOADER)();

      }, TIMEOUT.ANIMATION)();
    });
    
  });

})(jQuery);