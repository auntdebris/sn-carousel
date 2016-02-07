/*
 * Carousel
 *
 * Creates an AJAX-powered carousel
 *
 * @author: Paula Cunha
 * @version: 1.0
 *
 */

;(function ($, window, document, undefined) {

	var component = "carousel",
		defaults  = {
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
				images: "images"
			},
			container: {
				className: "carousel__container",
			},
			controls: {
				className: "carousel__controls", 
				display: {
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
				display: {
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
				display: {
					small: true,
					medium: true,
					large: true
				}
			},
			loadFromJSON: {
				enabled: true,
				url: "",
				template: ""
			},
			lazyload: true,
			drag: true
		};

	function carousel(element, options){

		this.element   = element;
		this.options   = $.extend( {}, defaults, options );

		this._defaults     = defaults;
		this._name         = component;

		this.itemElems     = [];

		this.itemTmpl      = $("#" + this.options.loadFromJSON.template).html();
		this.itemContainer = $(this.element).find("."+this.options.container.className);

		this.init();
	}

	carousel.prototype.init = function() {

		this.initItems();

		this.handleResize();
	};

	carousel.prototype.getScreenSize = function(elem, opts){

		var windowWidth = $(window).width();

		this.screenSize  = windowWidth >= opts.sizes.large  ? "large" :
						   windowWidth >= opts.sizes.medium ? "medium" : "small";
		
		return this.screenSize;
	};

	carousel.prototype.onResize = function(elem, opts){

		// throttle resize event

		var resizeEvent = $.event.special.throttledresize ? "throttledresize" : "resize";

		$(window).on(resizeEvent, { _this: this }, function(e){
			this.handleResize();
		});
	};

	carousel.prototype.handleResize = function(elem, opts){

		// carousel.prototype.items.resizeItems();

		// resize items (no-transition)
		// go to slide (no-transition)
	};

	carousel.prototype.initItems = function(){

		this.getItems();

		// if( ajax ) getitems()
		// else createitems()
	};

	carousel.prototype.getItems = function(){

		var _   = this,
			url = _.options.loadFromJSON.url;

		var request = $.getJSON(url, function(){
			
			console.log( "success" );

		}).done(function(data){

			_.items = data.data.carousel.items;
			_.itemCount = _.items.length;

			_.createItems();

		}).fail(function(){

			console.log( "error" );

		}).always(function(){

	    	console.log( "complete" );
		});
	};

	carousel.prototype.createItems = function(){

		var _ = this,

			$item;

		_.itemContainer.empty().append("<ul>");

		$.each(_.items, function(i,v){

			$item = replaceAll(_.itemTmpl,v);

			_.itemContainer.find("ul").append( $item );

			_.itemElems.push( $item );

			if( i === _.items.length-1 ){

				_.loadItemImages();
				_.resizeItems();
			}
		});

		function replaceAll(tmpl, item){

			var count = 0;

			// @todo: handle this more elegantly

			item.linkTitle = item.title;
			item.imgPath = _.options.paths.images;

			$.each(item, function(key,value){

				tmpl = tmpl.replace("{{"+key+"}}", value);

				count++;

				if( count === item.length-1 ){
					return tmpl;
				}
			});
			
			return tmpl;
		}
	};

	carousel.prototype.loadItemImages = function(){

		var _ = this;

		if( !_.options.lazyload ){

			$.each(_.itemContainer.find("img"), function(i,v){

				$(v).attr("src", $(v).data("src"));
			});

		} else {

			// todo: handle lazyload
		}
	};

	carousel.prototype.resizeItems = function(){

		var _ = this;

		console.log( _.screenSize );
	};

	carousel.prototype.fitContainer = function(){

	};

	carousel.prototype.createControls = function(){

		// createArrows
		// initArrows()
		
		// createDots()
		// initDots()
	};

	carousel.prototype.initControls = function(){

		// createArrows()
		// initArrows()
		
		// createDots()
		// initDots()
	};

	carousel.prototype.createArrows = function(){

		var $arrowPrev = $('<button class="'+ opts.arrows.prev.className +'"><i aria-hidden="true"></i><span class="visuallyhidden">'+ opts.arrows.prev.text +'</span></button>'),
			$arrowNext = $('<button class="'+ opts.arrows.next.className +'"><i aria-hidden="true"></i><span class="visuallyhidden">'+ opts.arrows.next.text +'</span></button>');

		// arrow container append arrows
	};

	carousel.prototype.createDots = function(){

		var $dot = $('<button class="'+ opts.dots.className +'"><i aria-hidden="true"></i><span class="visuallyhidden">'+ opts.dots.text +'</span></button>');

		// loop through dots
		// append
	};

	carousel.prototype.initArrows = function(){

		// update()

		// arrow on click(move.goToPrev)
		// arrow on click(move.goToNext)
	};

	carousel.prototype.initDots = function(){

		// update()
		
		// dot on click(move.goTo)
	};

	carousel.prototype.updateDots = function(){

		// setactive
	};

	carousel.prototype.updateArrows = function(){

		// setactive
	};

	carousel.prototype.initVisibility = function(){

	};

	carousel.prototype.updateVisibility = function(){

	};

	carousel.prototype.goToPrev = function(elem, opts){

		// currentpage--

		// goto(currentpage)
	};

	carousel.prototype.goToNext = function(elem, opts){

		// currentpage++

		// goto(currentpage)
	};

	carousel.prototype.goTo = function(elem, opts){

		// container left
	};

	$.fn[component] = function ( options ) {
		return this.each(function () {
			$.data(this, component, new carousel( this, options ));
		});
	};

})( jQuery, window, document );