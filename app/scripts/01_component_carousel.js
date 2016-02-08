/*
 * Carousel
 *
 * Creates an AJAX-powered carousel
 *
 * @author: Paula Cunha
 * @version: 1.0
 *
 * @todo: add support for infinite carousel
 * @todo: add support for touch
 * @todo: add lazyload
 * @todo: proportionally reset carousel position onresize
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
				allowDrag: true,
				allowTouch: true,
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

	carousel.prototype.init = function(){

		var _ = this;

		_.initItems();
		_.handleResize();
	};

	carousel.prototype.isInViewport = function(){

		var _ = this,

			wHeight = $(window).height(),
			wScroll = $(window).scrollTop(),
			offset  = $(_.element).offset().top,
			pos     = wScroll + wHeight;

		return ( pos > offset && (offset + wHeight + $(_.element).height() ) > pos );
	};

	carousel.prototype.setContainerSize = function(){

		var _ = this;

		_.containerSize = _.itemContainer.width();
	};

	carousel.prototype.setScreenSize = function(){

		var _ = this;

		_.windowWidth = $(window).width();

		_.screenSize = _.windowWidth <= _.options.sizes.small  ? "small" :
					   _.windowWidth <= _.options.sizes.medium ? "medium" : "large";
	};

	carousel.prototype.setNumPages = function(){

		var _ = this;

		$.each(_.options.itemsPerPage, function(key,v){

			_.numPages[key] = Math.ceil(_.itemCount / v);
		});
	};

	carousel.prototype.setNumCols = function(){

		var _ = this;

		$.each(_.options.itemsPerPage, function(key,v){

			_.numCols[key] = v;
		});
	};


	carousel.prototype.getScreenSize = function(){

		var _ = this;

		_.setScreenSize();
		
		return _.screenSize;
	};

	carousel.prototype.getContainerSize = function(){

		var _ = this;

		_.setContainerSize();

		return _.containerSize;
	};

	carousel.prototype.getNumCols = function(){

		var _ = this;

		_.setNumCols();

		return _.numCols[_.screenSize];
	};

	carousel.prototype.getNumPages = function(){

		var _ = this;

		_.setNumPages();

		return _.numPages[_.screenSize];
	};

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

	carousel.prototype.initItems = function(){

		var _ = this;

		_.getItems();

		// @todo: add option to use existing content
	};

	carousel.prototype.getItems = function(){

		var _ = this,
			url = _.options.loadFromJSON.url;

		var request = $.getJSON(url, function(data){
			
			_.items     = data.data.carousel.items;
			_.itemCount = _.items.length;

			_.createItems();

			_.createControls();

		}).done(function(){

			// done

		}).fail(function(){

			// @todo: handle error

		}).always(function(){

	    	// complete
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

	carousel.prototype.resizeContainer = function(){

		var _ = this;

		_.itemList = _.itemContainer.find("ul");

		_.itemList.width( _.getContainerSize() * _.numPages[_.screenSize] );
	};

	carousel.prototype.createControls = function(){

		var _ = this;

		if( _.controls ) _.controls.remove();

		_.controls = $("<div class="+ _.options.controls.className +"><div></div></div>");
		$(_.element).append(_.controls);

		_.createArrows();
		_.createDots();

		if( _.options.controls.allowKeyboard ){

			_.initKeyboard();
		}
	};

	carousel.prototype.updateControls = function(){

		var _ = this;

		_.updateArrows();
		_.updateDots();
	};

	carousel.prototype.updateControlVisibility = function(){

		var _ = this;

		_.updateArrowVisibility();
		_.updateDotVisibility();
	};

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

	carousel.prototype.initDots = function(){

		var _ = this,
			page;

		// _.goToPage(0);
		// _.updateControls();
		_.updateDots();
		_.updateDotVisibility();

		_.dotContainer.find("button").on("click", function(){

			page = $(this).index();

			_.goToPage(page);
		});
	};

	carousel.prototype.updateDots = function(){		

		var _ = this;

		$.each(_.dots, function(i,v){

			if( i === _.currentPage[_.screenSize] ){

				console.log("hi");

				$(v).addClass(_.options.classes.active);

			} else {

				$(v).removeClass(_.options.classes.active);
			}
		});
	};

	carousel.prototype.initKeyboard = function(){

		var _ = this;

		$(document).off("keydown.carousel-keyboard")
				   .on("keydown.carousel-keyboard", function(e){

			if( _.isInViewport(_.element) === true ){

			    if(e.keyCode == 37){

			    	// left arrow: prev

			    	console.log(_.currentPage[_.screenSize]-1);

			    	_.goToPage(_.currentPage[_.screenSize]-1);

			    	e.preventDefault();
			    }

			    if(e.keyCode == 39){
			    
			    	// right arrow: next

			    	console.log(_.currentPage[_.screenSize]+1);

			    	_.goToPage(_.currentPage[_.screenSize]+1);

			    	e.preventDefault();
				}
			}
		});
	};

	carousel.prototype.updateArrowVisibility = function(){

		var _ = this;

		_.arrowContainer.removeClass(_.options.classes.hidden);

		if( !_.options.arrows.show[_.getScreenSize()] ){

			_.arrowContainer.addClass(_.options.classes.hidden);
		}
	};

	carousel.prototype.updateDotVisibility = function(){

		var _ = this;

		_.dotContainer.removeClass(_.options.classes.hidden);

		if( !_.options.dots.show[_.getScreenSize()] ){

			_.dotContainer.addClass(_.options.classes.hidden);
		}
	};

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

	carousel.prototype.updateAllPages = function(){

		// @todo: make this work

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