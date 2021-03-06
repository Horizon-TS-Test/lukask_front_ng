jQuery(document).ready(function ($) {
	// browser window scroll (in pixels) after which the "menu" link is shown
	var offset = parseInt($("#local-content-1").offset().top);

	var navigationContainer = $('#cd-nav'),
		mainNavigation = navigationContainer.find('#cd-main-nav');

	//hide or show the "menu" link
	checkMenu();
	$(window).scroll(function () {
		checkMenu();
	});
	$(window).resize(function () {
		offset = parseInt($("#local-content-1").offset().top);
		checkMenu();
	});

	//open or close the menu clicking on the bottom "menu" link
	$('.cd-nav-trigger#menu-nav').on('click', function (event) {
		event.preventDefault();
		$(this).toggleClass('menu-is-open');
		//we need to remove the transitionEnd event handler (we add it when scolling up with the menu open)
		mainNavigation.off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend').toggleClass('is-visible');
	});

	function checkMenu() {
		if ($(window).scrollTop() >= offset && !navigationContainer.hasClass('is-fixed')) {
			navigationContainer.addClass('is-fixed').find('.cd-nav-trigger').one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function () {
				mainNavigation.addClass('has-transitions');
			});
		} else if ($(window).scrollTop() < offset) {
			//check if the menu is open when scrolling up
			if (mainNavigation.hasClass('is-visible')) {
				//close the menu with animation
				$('.cd-nav-trigger#menu-nav').click();
				mainNavigation.removeClass('is-visible has-transitions');
				navigationContainer.removeClass('is-fixed');
				$('.cd-nav-trigger').removeClass('menu-is-open');
			} else {
				navigationContainer.removeClass('is-fixed');
				mainNavigation.removeClass('has-transitions');
			}
		}
	}
});