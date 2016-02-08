/*
 * Carousel
 *
 * Creates an AJAX-powered carousel
 *
 * @author: Paula Cunha
 * @version: 1.0
 *
 * @todo: add support for infinite carousel
 * @todo: add better support for touch
 * @todo: add support for image lazyload
 * @todo: remember carousel position on resize
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
			classes: {
				active: "active",
				disabled: "disabled",
				hidden: "hidden"
			},
			container: {
				className: "carousel__container"
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
				url: "",
				template: ""
			},
			lazyload: true
		};

	function carousel(element, options){

		this.element       = element;
		this.options       = $.extend( {}, defaults, options );

		this._defaults     = defaults;
		this._name         = component;

		this.itemElems     = [];
		this.itemTmpl      = $("#" + this.options.loadFromJSON.template).html();
		this.itemContainer = $(this.element).find("."+this.options.container.className);

		this.numPages      = [];
		this.numCols       = [];

		this.dots 		   = [];

		this.currentPage   = {
			small: 0,
			medium: 0,
			large: 0
		};

		this.init();
	}

	/*
	 * Initialize the carousel, starting
	 * with item load and window resize
	 * handling
	 *
	 */

	carousel.prototype.init = function(){

		var _ = this;

		_.initItems();
		_.handleResize();
	};

	/*
	 * Helper function that checks whether
	 * the carousel is in view
	 *
	 */

	carousel.prototype.isInViewport = function(){

		var _ = this,

			wHeight = $(window).height(),
			wScroll = $(window).scrollTop(),
			offset  = $(_.element).offset().top,
			pos     = wScroll + wHeight;

		return ( pos > offset && (offset + wHeight + $(_.element).height() ) > pos );
	};

	/*
	 * Set container size
	 *
	 * This value will be used for all our
	 * page calculations
	 *
	 */

	carousel.prototype.setContainerSize = function(){

		var _ = this;

		_.containerSize = _.itemContainer.width();
	};

	/*
	 * Set screen size
	 *
	 * Classify window width as small,
	 * medium or large
	 *
	 */

	carousel.prototype.setScreenSize = function(){

		var _ = this;

		_.windowWidth = $(window).width();

		_.screenSize = _.windowWidth <= _.options.sizes.small  ? "small" :
					   _.windowWidth <= _.options.sizes.medium ? "medium" : "large";
	};

	/*
	 * Set number of pages
	 *
	 * Set page number for all screen sizes
	 *
	 */

	carousel.prototype.setNumPages = function(){

		var _ = this;

		$.each(_.options.itemsPerPage, function(key,v){

			_.numPages[key] = Math.ceil(_.itemCount / v);
		});
	};

	/*
	 * Set number of pages
	 *
	 * Set page number for all screen sizes
	 *
	 */

	carousel.prototype.setNumCols = function(){

		var _ = this;

		$.each(_.options.itemsPerPage, function(key,v){

			_.numCols[key] = v;
		});
	};

	/*
	 * @return {string} screen size
	 *
	 */

	carousel.prototype.getScreenSize = function(){

		var _ = this;

		_.setScreenSize();
		
		return _.screenSize;
	};

	/*
	 * @return {number} container size
	 *
	 */

	carousel.prototype.getContainerSize = function(){

		var _ = this;

		_.setContainerSize();

		return _.containerSize;
	};

	/*
	 * @return {number} columns per page
	 *
	 */

	carousel.prototype.getNumCols = function(){

		var _ = this;

		_.setNumCols();

		return _.numCols[_.screenSize];
	};

	/*
	 * @return {number} number of pages
	 *
	 */

	carousel.prototype.getNumPages = function(){

		var _ = this;

		_.setNumPages();

		return _.numPages[_.screenSize];
	};

	/*
	 * @return {number} number of pages
	 *
	 */

	carousel.prototype.handleResize = function(){

		// throttle resize event

		var _ = this;

		$(window).on("resize", { _this: this }, function(e){

			_.resizeItems();
			_.resizeContainer();

			_.updateControlVisibility();

			_.createControls();
			_.initKeyboard();

			// resetting page to 0
			// ideally it should reposition in the same slide
			// something like: _.goToPage( _.currentPage[_.screenSize] );

			_.goToPage( 0 );
		});
	};

	/*
	 * Initialize carousel items
	 *
	 */

	carousel.prototype.initItems = function(){

		var _ = this;

		_.getItems();

		// @todo: add option to use dom content
	};

	/*
 	 * AJAX request
 	 *
	 * Get item JSON
	 *
	 */

	carousel.prototype.getItems = function(){

		var _ = this,

			request = $.getJSON(_.options.loadFromJSON.url, function(data){
			
				_.items     = data.data.carousel.items;
				_.itemCount = _.items.length;

				_.createItems();

				_.createControls();

			}).fail(function(){

				console.error("Could not retrieve content.")

				// @todo: handle error
			});
	};

	/*
 	 * Create items from template
 	 * and populate carousel
	 *
	 */

	carousel.prototype.createItems = function(){

		var _ = this,

			$item;

		_.itemContainer.empty().append("<ul>");

		$.each(_.items, function(i,v){

			$item = replaceAll(_.itemTmpl,v);

			_.itemContainer.find("ul").append( $item );

			_.itemElems.push( $item );

			if( i === _.items.length-1 ){

				_.currentPage[_.screenSize] = 0;

				_.loadItemImages();
				_.resizeItems();
				_.resizeContainer();
			}
		});

		// a tiny templating engine

		function replaceAll(tmpl, item){

			var count = 0;

			// @todo: handle this a bit more elegantly

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

	/*
 	 * Loads images
 	 * 
 	 * @todo: add support for image lazyload
	 *
	 */

	carousel.prototype.loadItemImages = function(){

		var _ = this;

		if( !_.options.lazyload ){

			$.each(_.itemContainer.find("img"), function(i,v){

				$(v).attr("src", $(v).data("src"));
			});

		} else {

			// @todo: handle lazyload
		}
	};

	/*
 	 * Resizes items according
 	 * to items per page
	 *
	 */

	carousel.prototype.resizeItems = function(){

		var _ = this;

		_.setContainerSize();
		_.setScreenSize();
		_.setNumPages();
		_.setNumCols();

		_.itemWidth = _.containerSize / _.numCols[_.screenSize];

		$.each(_.itemContainer.find("li"), function(i,v){

			$(v).width(_.itemWidth);
		});
	};

	/*
 	 * Resizes item container to fit all items
	 *
	 */

	carousel.prototype.resizeContainer = function(){

		var _ = this;

		_.itemList = _.itemContainer.find("ul");

		_.itemList.width( _.getContainerSize() * _.numPages[_.screenSize] );
	};

	/*
 	 * Creates and appends controls to the carousel
	 *
	 */

	carousel.prototype.createControls = function(){

		var _ = this;

		// remove controls if they exist

		if( _.controls ) _.controls.remove();

		// create and append controls

		_.controls = $("<div class="+ _.options.controls.className +"><div></div></div>");
		$(_.element).append(_.controls);

		// create arrows and dots

		_.createArrows();
		_.createDots();

		// initialize other navigation inputs

		_.initKeyboard();
		_.initSwipe();
	};

	/*
 	 * Updates carousel controls to reflect
 	 * current page
	 *
	 */

	carousel.prototype.updateControls = function(){

		var _ = this;

		_.updateArrows();
		_.updateDots();
	};

	/*
 	 * Show or hide controls depending
 	 * on user options
	 *
	 */

	carousel.prototype.updateControlVisibility = function(){

		var _ = this;

		_.updateArrowVisibility();
		_.updateDotVisibility();
	};

	/*
 	 * Create previous and next navgation
	 *
	 */

	carousel.prototype.createArrows = function(){

		var _ = this;

		_.arrowContainer = $("<div class=" + _.options.arrows.className +">");

		_.arrowPrev      = $('<button class="' + _.options.arrows.prev.className +'"><i aria-hidden="true"></i><span class="visuallyhidden">'+ _.options.arrows.prev.text +'</span></button>');
		_.arrowNext      = $('<button class="' + _.options.arrows.next.className +'"><i aria-hidden="true"></i><span class="visuallyhidden">'+ _.options.arrows.next.text +'</span></button>');

		_.arrowContainer.append(_.arrowPrev);
		_.arrowContainer.append(_.arrowNext);

		_.controls.find("> div").append(_.arrowContainer);

		_.initArrows();
	};

	/*
 	 * Create dot navigation
	 *
	 */

	carousel.prototype.initArrows = function(){

		var _ = this;

		_.updateArrows();
		_.updateArrowVisibility();

		_.arrowPrev.on("click", function(){

			page = _.currentPage[_.screenSize]-1;

			_.goToPage(page);
		});

		_.arrowNext.on("click", function(){

			page = _.currentPage[_.screenSize]+1;

			_.goToPage(page);
		});
	};

	/*
 	 * Disable arrows if page
 	 * is unavailable
	 *
	 */

	carousel.prototype.updateArrows = function(){

		var _ = this;

		_.arrowPrev.removeClass(_.options.classes.disabled);
		_.arrowNext.removeClass(_.options.classes.disabled);

		if( _.currentPage[_.screenSize] === 0 ){

			_.arrowPrev.addClass(_.options.classes.disabled);

		} else if( _.currentPage[_.screenSize] === _.numPages[_.screenSize]-1 ){

			_.arrowNext.addClass(_.options.classes.disabled);
		}
	};

	/*
 	 * Creates dotted navation
	 *
	 */

	carousel.prototype.createDots = function(){

		var _ = this,
			i = 0,
			dot;

		_.dotContainer = $("<div class=" + _.options.dots.className + ">");

		_.dots = [];

		while( i < _.numPages[_.screenSize] ){

			dot = $('<button class="'+ _.options.dots.dot.className +'"><i aria-hidden="true"></i><span class="visuallyhidden">'+ _.options.dots.dot.text + i+1 + '</span></button>');
			
			_.dotContainer.append(dot);

			_.dots.push(dot);

			if( i === _.numPages[_.screenSize]-1 ){

				_.controls.find("> div").append(_.dotContainer);
				_.initDots();
			}

			i++;
		}
	};

	/*
 	 * Initilizes dotted navigation
	 *
	 */

	carousel.prototype.initDots = function(){

		var _ = this;

		_.updateDots();
		_.updateDotVisibility();

		_.dotContainer.find("button").on("click", function(){

			_.goToPage($(this).index());
		});
	};

	/*
 	 * Updates dotted navigation
 	 * to reflect active page
	 *
	 */

	carousel.prototype.updateDots = function(){		

		var _ = this;

		$.each(_.dots, function(i,v){

			if( i === _.currentPage[_.screenSize] ){

				$(v).addClass(_.options.classes.active);

			} else {

				$(v).removeClass(_.options.classes.active);
			}
		});
	};

	/*
 	 * Initializes keyboard navigation
	 *
	 */

	carousel.prototype.initKeyboard = function(){

		var _ = this;

		if( _.options.controls.allowKeyboard ){

			$(document).off("keydown.carousel-keyboard")
					   .on("keydown.carousel-keyboard", function(e){

				if( _.isInViewport(_.element) === true ){

				    if(e.keyCode === 37){

				    	// left arrow: prev

				    	_.goToPage(_.currentPage[_.screenSize]-1);

				    	e.preventDefault();
				    }

				    if(e.keyCode === 39){
				    
				    	// right arrow: next

				    	_.goToPage(_.currentPage[_.screenSize]+1);

				    	e.preventDefault();
					}
				}
			});
		}
	};

	/*
 	 * Initializes swipe navigation
 	 *
 	 * @depends: Hammer.js
 	 * @todo: make content follow swipe motion
	 *
	 */

	carousel.prototype.initSwipe = function(e){

		var _ = this;

		if( _.options.controls.allowSwipe && $.fn.hammer ){

			$(_.itemList).hammer({ drag_lock_to_axis: true })
						 .on("release dragleft dragright swipeleft swiperight", handleHammer);

			function handleHammer(e){

				e.gesture.preventDefault();

		        switch(e.type) {
		            case 'swipeleft':
		                _.goToPage(_.currentPage[_.screenSize]+1);
		                e.gesture.stopDetect();
		                break;

		            case 'swiperight':
		                _.goToPage(_.currentPage[_.screenSize]-1);
		                e.gesture.stopDetect();
		                break;
		        }
		    }

		} else {

			console.error("Hammer.js is needed for swipe functionality");
		}
    };

    /*
 	 * Show or hide arrows depending
 	 * on user options
	 *
	 */

	carousel.prototype.updateArrowVisibility = function(){

		var _ = this;

		_.arrowContainer.removeClass(_.options.classes.hidden);

		if( !_.options.arrows.show[_.getScreenSize()] ){

			_.arrowContainer.addClass(_.options.classes.hidden);
		}
	};

	/*
 	 * Show or hide dots depending
 	 * on user options
	 *
	 */

	carousel.prototype.updateDotVisibility = function(){

		var _ = this;

		_.dotContainer.removeClass(_.options.classes.hidden);

		if( !_.options.dots.show[_.getScreenSize()] ){

			_.dotContainer.addClass(_.options.classes.hidden);
		}
	};

	/*
 	 * Animate carousel
	 *
	 */

	carousel.prototype.goToPage = function(page){

		var _ = this;

		if( page <= 0 ) page = 0;
		if( page >= _.numPages[_.screenSize] ) page = _.numPages[_.screenSize]-1;

		if( page >= 0 && page < _.numPages[_.screenSize] ){

			_.currentPage[_.screenSize] = page;

			_.updateControls();

			// use translate where supported for better perfomance

			if( Modernizr.csstransforms3d ){

				// translate horizontally
				// use of translate3d triggers hardware acceleration

				_.itemList.css({
					transform: "translate3d(-"+ (_.containerSize * _.currentPage[_.screenSize]) + "px,0,0)"
				});

			} else if( Modernizr.csstransforms ){

				// translate horizontally

				_.itemList.css({
					transform: "translateX(-"+ (_.containerSize * _.currentPage[_.screenSize]) + "px)"
				});

			} else if( Modernizr.csstransitions ){

				// transition on left property

				_.itemList.css({
					left: -(_.containerSize * _.currentPage[_.screenSize])
				});

			} else {

				// use jQuery animate instead of CSS transitions

				_.itemList.animate({
					left: -(_.containerSize * _.currentPage[_.screenSize])
				}, 400);
			}
		}
	};

	/*
 	 * Sets current page for first slide
 	 * in all screen sizes
 	 *
 	 * @todo: finish this
	 *
	 */

	carousel.prototype.updateAllPages = function(){

		var _ = this;

		_.currentItem = _.currentPage[_.screenSize] * _.numCols[_.screenSize] + 1;

		$.each(_.options.itemsPerPage, function(key,v){

			_.currentPage[key] = Math.round(_.currentItem / _.numCols[key]);
		});
	};

	$.fn[component] = function ( options ) {
		return this.each(function () {
			$.data(this, component, new carousel( this, options ));
		});
	};

})( jQuery, window, document );