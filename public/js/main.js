//FROM TEMPLATE
$(function() {
    'use strict';
    $('.js-menu-toggle').click(function(e) {
        var $this = $(this);
        if ( $('body').hasClass('show-sidebar') ) {
            $('body').removeClass('show-sidebar');
            $this.removeClass('active');
        } else {
            $('body').addClass('show-sidebar');	
            $this.addClass('active');
        }
        e.preventDefault();
    });

    // click outisde offcanvas
    $(document).mouseup(function(e) {
        var container = $(".sidebar");
        if (!container.is(e.target) && container.has(e.target).length === 0) {
            if ( $('body').hasClass('show-sidebar') ) {
                $('body').removeClass('show-sidebar');
                $('body').find('.js-menu-toggle').removeClass('active');
            }
        }
    }); 

});
//END FROM TEMPLATE

//Set interval update online user
function updateUser(){
    console.log("CALL UPDATE USER");
    $.ajax({
    url: '/update-user',
    type: 'get',
    success: function(response){
        console.log(response);
    },
    error: function(error) {
        console.log(error);
    }
    });
}

$(document).ready(function(){
    setInterval(updateUser,15000);
});