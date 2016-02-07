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

		this.element       = element;
		this.options       = $.extend( {}, defaults, options );

		this._defaults     = defaults;
		this._name         = component;

		this.itemElems     = [];
		this.itemTmpl      = $("#" + this.options.loadFromJSON.template).html();
		this.itemContainer = $(this.element).find("."+this.options.container.className);

		this.init();
	}

	carousel.prototype.init = function(){

		var _ = this;

		_.initItems();
		_.handleResize();
	};

	carousel.prototype.getScreenSize = function(){

		var _ = this,
			windowWidth = $(window).width();

		_.screenSize = windowWidth >= _.options.sizes.large  ? "large" :
					   windowWidth >= _.options.sizes.medium ? "medium" : "small";
		
		return _.screenSize;
	};

	carousel.prototype.getContainerSize = function(){

		var _ = this;

		_.containerSize = _.itemContainer.width();

		return _.containerSize;
	};

	carousel.prototype.getNumCols = function(){

		var _ = this;

		_.numCols = _.options.itemsPerPage[_.getScreenSize()];

		return _.numCols;
	};

	carousel.prototype.getNumPages = function(){

		var _ = this;

		_.numPages = Math.ceil(_.itemCount / _.options.itemsPerPage[_.getScreenSize()]);

		return _.numPages;
	};

	carousel.prototype.handleResize = function(){

		// throttle resize event

		var _ = this,
			resizeEvent = $.event.special.throttledresize ? "throttledresize" : "resize";

		$(window).on("resize", { _this: this }, function(e){
			_.resizeItems();
			_.resizeContainer();
		});
	};

	carousel.prototype.initItems = function(){

		var _ = this;

		_.getItems();

		// @todo: add option to load from ajax
		// or use existing content
	};

	carousel.prototype.getItems = function(){

		var _ = this,
			url = _.options.loadFromJSON.url;

		var request = $.getJSON(url, function(data){
			
			_.items = data.data.carousel.items;
			_.itemCount = _.items.length;

			_.createItems();

			_.initControls();

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

				_.loadItemImages();
				_.resizeItems();
				_.resizeContainer();
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

			// @todo: handle lazyload
		}
	};

	carousel.prototype.resizeItems = function(){

		var _ = this;

		_.containerSize = _.getContainerSize();
		_.screenSize    = _.getScreenSize();
		_.numCols       = _.getNumCols();
		_.itemWidth		= _.containerSize / _.numCols;
		_.numPages		= _.getNumPages();

		$.each(_.itemContainer.find("li"), function(i,v){

			$(v).width(_.itemWidth);
		});
	};

	carousel.prototype.resizeContainer = function(){

		var _ = this;

		_.containerList = _.itemContainer.find("ul");

		_.containerList.width( _.containerSize * _.numPages );
	};

	carousel.prototype.initControls = function(){

		var _ = this;

		_.createControls();
	};

	carousel.prototype.createControls = function(){

		var _ = this;

		_.controls = $("<div class="+ _.options.controls.className +"><div></div></div>");
		$(_.element).append(_.controls);

		_.createArrows();
		_.createDots();
	};

	carousel.prototype.createArrows = function(){

		var _ = this;

		_.arrowContainer = $("<div class="+ _.options.arrows.className +">");
		_.arrowPrev      = $('<button class="'+ _.options.arrows.prev.className +'"><i aria-hidden="true"></i><span class="visuallyhidden">'+ _.options.arrows.prev.text +'</span></button>'),
		_.arrowNext      = $('<button class="'+ _.options.arrows.next.className +'"><i aria-hidden="true"></i><span class="visuallyhidden">'+ _.options.arrows.next.text +'</span></button>');

		_.arrowContainer.append(_.arrowPrev);
		_.arrowContainer.append(_.arrowNext);

		_.controls.find("> div").append(_.arrowContainer);
	};

	carousel.prototype.createDots = function(){

		var _ = this,

			$dot = $('<button class="'+ _.options.dots.className +'"><i aria-hidden="true"></i><span class="visuallyhidden">'+ _.options.dots.text +'</span></button>');

		// loop through dots
		// append
	};

	carousel.prototype.initArrows = function(){

		var _ = this;

		// update()

		// arrow on click(move.goToPrev)
		// arrow on click(move.goToNext)
	};

	carousel.prototype.initDots = function(){

		var _ = this;

		// update()
		
		// dot on click(move.goTo)
	};

	carousel.prototype.updateDots = function(){

		var _ = this;

		// setactive
	};

	carousel.prototype.updateArrows = function(){

		var _ = this;

		// setactive
	};

	carousel.prototype.initVisibility = function(){

		var _ = this;

	};

	carousel.prototype.updateVisibility = function(){

		var _ = this;

	};

	carousel.prototype.goToPrev = function(){

		var _ = this;

		// currentpage--

		// goto(currentpage)
	};

	carousel.prototype.goToNext = function(){

		var _ = this;

		// currentpage++

		// goto(currentpage)
	};

	carousel.prototype.goTo = function(){

		var _ = this;

		// container left
	};

	$.fn[component] = function ( options ) {
		return this.each(function () {
			$.data(this, component, new carousel( this, options ));
		});
	};

})( jQuery, window, document );