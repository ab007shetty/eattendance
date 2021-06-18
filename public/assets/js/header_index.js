$(document).ready(function () {
    $('.navbar-toggler').on('click', function () {
        // $('#sidenav-main').toggleClass('active');
        $('.overlay').toggleClass('active');
        console.log("hello");
    });
});

searchVisible = 0;
transparent = true;
hasTransparent = false;

$(document).ready(function(){
   if($('nav[role="navigation"]').hasClass('navbar-transparent')){
        hasTransparent = true;
   }
   $('[data-toggle="search"]').click(function(){
        if(searchVisible == 0){
            searchVisible = 1;
            $(this).parent().addClass('active');
            $(this).children('p').html('Close');
            $('.navbar-search-form').fadeIn(function(){
                $('.navbar-search-form input').focus();
            });
        } else {
            searchVisible = 0;
            $(this).parent().removeClass('active');
            $(this).children('p').html('Search');
            $(this).blur();
            $('.navbar-search-form').fadeOut(function(){
                $('.navbar-search-form input').blur();
            });
        } 
    });
    
});

$(document).scroll(function() {
   if(hasTransparent){
        if( $(this).scrollTop() > 260 ) {
            if(transparent) {
                transparent = false;
                $('nav[role="navigation"]').removeClass('navbar-transparent');
            }
        } else {
            if( !transparent ) {
                transparent = true;
                $('nav[role="navigation"]').addClass('navbar-transparent');
            }
        }
    }
});


 $(document).ready(function() {
            $(".menu-icon").on("click", function() {
                  $("nav ul").toggleClass("showing");
            });
      });

      // Scrolling Effect

      $(window).on("scroll", function() {
            if($(window).scrollTop()) {
                  $('nav').addClass('black');
            }

            else {
                  $('nav').removeClass('black');
            }
      })


$(document).ready(function() {
$(window).scroll(function() {
if ($(this).scrollTop() > 20) {
$('#toTopBtn').fadeIn();
} else {
$('#toTopBtn').fadeOut();
}
});

$('#toTopBtn').click(function() {
$("html, body").animate({
scrollTop: 0
}, 1000);
return false;
});
});

