var jstest = (function(){

	function initializer(){

		var $carousel = $("#test-carousel"),

			url       = $carousel.data("item-url"),
			imgurl 	  = $carousel.data("item-imgurl"),
			template  = $carousel.data("item-tmpl"),

			carouselOptions = {
				sizes: {
					small: 400,
					medium: 800,
					large: 980
				},
				itemsPerPage: {
					small: 1,
					medium: 2,
					large: 4
				},
				paths: {
					images: imgurl
				},
				classes: {
					active: "active",
					disabled: "disabled",
					hidden: "hidden"
				},
				container: {
					className: "carousel__container",
				},
				controls: {
					className: "carousel__controls",
					allowKeyboard: true,
					allowSwipe: true,
					show: {
						small: true,
						medium: true,
						large: true
					}
				},
				arrows: {
					className: "carousel__arrows", 
					prev: {
						className: "carousel__arrow carousel__arrow--prev",
						text: "Previous page"
					},
					next: {
						className: "carousel__arrow carousel__arrow--next",
						text: "Next page"
					},
					show: {
						small: true,
						medium: true,
						large: true
					}
				},
				dots: {
					className: "carousel__dots",
					dot: {
						className: "carousel__dot",
						text: "Page "
					},
					show: {
						small: false,
						medium: true,
						large: true
					}
				},
				loadFromJSON: {
					enabled: true,
					url: url,
					template: template
				},
				lazyload: false
			};

		$carousel.carousel(carouselOptions);
	}

	return {
		init: initializer
	};
})( window );

jstest.init();