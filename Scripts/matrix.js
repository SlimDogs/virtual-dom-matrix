(function(window, $) {
	console.log('Running matrix logic v2.0');

	var CONST = {};
	CONST.ROW_HEIGHT = 30; // PX
	CONST.COLUMN_WIDTH = 30; //

	function matrix(config) {
		if (!config) config = {};

		this.SELECTORS = {
			CONTAINER: null,
			COLUMNS: null,
			ROWS: null,
			TABLE: null,
			TABLE_INNER: null,
			TABLE_CONTAINER: null
		};
		this.INITIALIZED = false;

		this.ROW_HEIGHT = config.ROW_HEIGHT || CONST.ROW_HEIGHT;
		this.COLUMN_WIDTH = config.COLUMN_WIDTH || CONST.COLUMN_WIDTH;

		this.templates = {};

		// Canvas template
		this.templates.canvas = '<div class="matrix">'+
			'<div class="column-objects">column</div>'+
			'<div class="row-objects">row</div>'+
			'<div class="matrix-table"><div style="height: 100%; width: 100%; overflow: auto;" class="matrix"><div>table</div></div></div>'
		'</div>';

		this.templates.axisItem = '<div class="object"><i></i> <span>{$0}</span></div>';

		this.rows = [];
		this.columns = [];
		this.loadedRelationships = [];

		// Display configuration
		this.VISIBLE_ROWS = [];
		this.VISIBLE_COLUMNS = [];

		this.CONTAINER_HEIGHT = 0;
		this.CONTAINER_WIDTH = 0;

		this.LAST_SCROLL_TOP = 0;
		this.LAST_SCROLL_LEFT = 0;
	};

	matrix.prototype.calculateDefaults = function() {
		var element = $(this.MATRIX_SELECTOR);

		var visibleRowsCount = Math.ceil($(this.SELECTORS.TABLE).height() / this.ROW_HEIGHT),
			visibleColumnsCount = Math.ceil($(this.SELECTORS.TABLE).width() / this.COLUMN_WIDTH);

		var initialTop = Math.floor($(this.SELECTORS.TABLE_INNER).scrollTop() / this.ROW_HEIGHT) * this.ROW_HEIGHT,
			initialLeft = Math.floor($(this.SELECTORS.TABLE_INNER).scrollLeft() / this.COLUMN_WIDTH) * this.COLUMN_WIDTH;

		// Creating virtual dom
		for (var i = 0; i < visibleRowsCount; i++) {
			this.VISIBLE_ROWS.push({
				top: initialTop + i * this.ROW_HEIGHT,
				distance: initialTop + (i * this.ROW_HEIGHT) + this.ROW_HEIGHT,
				id: i
			});
		}

		for (var a = 0; a < visibleColumnsCount; a++) {
			this.VISIBLE_COLUMNS.push({
				left: initialLeft + a * this.COLUMN_WIDTH,
				distance: initialLeft + (a * this.COLUMN_WIDTH) + this.COLUMN_WIDTH,
				id: a
			})
		}

		this.CONTAINER_HEIGHT = $('#' + this.SELECTORS.CONTAINER).height();
		this.CONTAINER_WIDTH = $('#' + this.SELECTORS.CONTAINER).width();

		this.FIRST_ROW_ID = 0;
		this.LAST_ROW_ID = visibleRowsCount - 1;

		this.FIRST_COLUMN_ID = 0;
		this.LAST_COLUMN_ID = visibleColumnsCount - 1;
	};

	matrix.prototype.resizeEvent = function() {
		var self = this;
		$(window).resize(function() {
			self.VISIBLE_ROWS = [];
			self.VISIBLE_COLUMNS = [];

			self.CONTAINER_HEIGHT = $('#' + self.SELECTORS.CONTAINER).height();
			self.CONTAINER_WIDTH = $('#' + self.SELECTORS.CONTAINER).width();

			self.LAST_SCROLL_TOP = $(self.SELECTORS.TABLE_INNER).scrollTop();
			self.LAST_SCROLL_LEFT = $(self.SELECTORS.TABLE_INNER).scrollLeft();


			m.calculateDefaults();
			m.draw(null, true);
		});
	};

	function updateRow(row) {
		$('.row.id-' + row.id).css('top', row.top + 'px');
		row.updating = false;
	};

	function updateColumns(column) {
		console.log('Updating columns with id', column.id);
		$('.row > .id-' + column.id).css('left', column.left + 'px');
		column.updating = false;
	};

	var virtualizeInProgress = false;
	matrix.prototype.virtualize = function(direction, difference, topDistance, leftDistance, full) {
		if (!virtualizeInProgress) {
			virtualizeInProgress = true;

			/*
				Rendering logic
				For vertical scrolling
			*/
			if (direction === 'up' || direction === 'down') {


				// Small distance scroll
				if (difference < this.CONTAINER_HEIGHT && !full) {

					// Rerendering rows
					for (var i = 0; i < this.VISIBLE_ROWS.length; i++) {
						var row = this.VISIBLE_ROWS[i];
						//debugger;
						if (direction === 'down') {
							if (row.distance <= topDistance && !row.updating) {

								row.top = this.VISIBLE_ROWS[this.LAST_ROW_ID].distance;
								row.distance = row.top + this.ROW_HEIGHT;
								this.LAST_ROW_ID = row.id;
								this.FIRST_ROW_ID = row.id + 1 < this.VISIBLE_ROWS.length ? row.id + 1 : 0;
								row.updating = true;

								updateRow(row);
							}
						}
						else {

							if (row.top >= topDistance + this.CONTAINER_HEIGHT) {
								row.top = this.VISIBLE_ROWS[this.FIRST_ROW_ID].top - this.ROW_HEIGHT;
								row.distance = row.top + this.ROW_HEIGHT;
								this.FIRST_ROW_ID = row.id;
								this.LAST_ROW_ID = row.id - 1 >= 0 ? row.id - 1 : this.VISIBLE_ROWS.length - 1;
								row.updating = true;

								updateRow(row);
							}
						}
					}

				}
				else {

					// Full rerender
					var firstTopValue = Math.floor(topDistance / this.ROW_HEIGHT) * this.ROW_HEIGHT;
					for (var i = 0; i < this.VISIBLE_ROWS.length; i++) {
						var row = this.VISIBLE_ROWS[i];

						row.top = firstTopValue + i * this.ROW_HEIGHT;
						row.distance = row.top + this.ROW_HEIGHT;

						updateRow(row);
					}

					this.FIRST_ROW_ID = 0;
					this.LAST_ROW_ID = this.VISIBLE_ROWS.length - 1;

				}

				virtualizeInProgress = false;
			}

			/*
				Rendering logic
				For horizontal scrolling
			*/
			else {
				// Small distance scroll
				if (difference < this.CONTAINER_WIDTH && !full) {
					//debugger;
					// Rerendering rows
					for (var i = 0; i < this.VISIBLE_COLUMNS.length; i++) {
						var column = this.VISIBLE_COLUMNS[i];
						//debugger;
						if (direction === 'right') {
							if (column.distance <= leftDistance && !column.updating) {

								column.left = this.VISIBLE_COLUMNS[this.LAST_COLUMN_ID].distance;
								column.distance = column.left + this.COLUMN_WIDTH;
								this.LAST_COLUMN_ID = column.id;
								this.FIRST_COLUMN_ID = column.id + 1 < this.VISIBLE_COLUMNS.length ? column.id + 1 : 0;
								column.updating = true;

								updateColumns(column);
							}
						}
						else {

							if (column.left > leftDistance + this.CONTAINER_WIDTH) {

								column.left = this.VISIBLE_COLUMNS[this.FIRST_COLUMN_ID].left - this.COLUMN_WIDTH;
								column.distance = column.left + this.COLUMN_WIDTH;
								this.FIRST_COLUMN_ID = column.id;
								this.LAST_COLUMN_ID = column.id - 1 >= 0 ? column.id - 1 : this.VISIBLE_COLUMNS.length - 1;
								column.updating = true;

								updateColumns(column);
							}
						}
					}

				}
				else {
					var firstLeftValue = Math.floor(leftDistance / this.COLUMN_WIDTH) * this.COLUMN_WIDTH;
					for (var i = 0; i < this.VISIBLE_COLUMNS.length; i++) {
						var column = this.VISIBLE_COLUMNS[i];

						column.left = firstLeftValue + i * this.COLUMN_WIDTH;
						column.distance = column.left + this.COLUMN_WIDTH;

						updateColumns(column);
					}

					this.FIRST_COLUMN_ID = 0;
					this.LAST_COLUMN_ID = this.VISIBLE_COLUMNS.length - 1;
				}

				virtualizeInProgress = false;

			}
		}
	};

	// Redrawimg matrix
	matrix.prototype.draw = function(event, forced) {
		if (this.INITIALIZED && !forced) {
			var $matrixTableElement = $(this.SELECTORS.TABLE_INNER);

			var scrollTop = $matrixTableElement.scrollTop();
			if (scrollTop !== this.LAST_SCROLL_TOP) {

				var goingDown = scrollTop > this.LAST_SCROLL_TOP;
				m.virtualize(goingDown ? 'down' : 'up', goingDown ? (scrollTop - this.LAST_SCROLL_TOP) : ( this.LAST_SCROLL_TOP - scrollTop), scrollTop);

				this.LAST_SCROLL_TOP = scrollTop;
			}
			
			var scrollLeft = $matrixTableElement.scrollLeft();
			if (scrollLeft !== this.LAST_SCROLL_LEFT) {

				var goingRight = scrollLeft > this.LAST_SCROLL_LEFT;
				m.virtualize(goingRight ? 'right' : 'left', goingRight ? (scrollLeft - this.LAST_SCROLL_LEFT) : ( this.LAST_SCROLL_LEFT - scrollLeft), null, scrollLeft);

				this.LAST_SCROLL_LEFT = scrollLeft;
			}
		}
		else {
			var initialTop = 0,
				initialLeft = 0;
			if (forced) {
				$(this.SELECTORS.TABLE_CONTAINER).html('');
			}

			var matrixTableHtml = '';
			for (var a = 0; a < this.VISIBLE_ROWS.length; a++) {
				matrixTableHtml += '<div class="row id-' + a + '" style="top: ' + this.VISIBLE_ROWS[a].top + 'px; height: ' + this.ROW_HEIGHT + 'px; width: ' + (this.columns.length * this.COLUMN_WIDTH) + 'px; position: absolute; left: 0; right: 0; border-bottom: 1px #eee solid;">'

				for (var b = 0; b < this.VISIBLE_COLUMNS.length; b++) {
					matrixTableHtml += '<div class="column-cell id-' + b + '" style="width: ' + this.COLUMN_WIDTH + 'px; height: ' + this.ROW_HEIGHT + 'px; border-right: 1px #eee solid; left: ' + this.VISIBLE_COLUMNS[b].left + 'px;"></div>'
				}

				matrixTableHtml += '</div>';
			}

			$(this.SELECTORS.TABLE_CONTAINER).html(matrixTableHtml);

			this.INITIALIZED = true;
		}

		return null;
	};

	matrix.prototype.reCheck = function() {
		console.log('Rechecking', this);
		var $wp = { // ViewPort
			topMin: $(this.SELECTORS.TABLE_INNER).scrollTop(),
			topMax: $(this.SELECTORS.TABLE_INNER).scrollTop() + this.CONTAINER_HEIGHT,
			leftMin: $(this.SELECTORS.TABLE_INNER).scrollLeft(),
			leftMax: $(this.SELECTORS.TABLE_INNER).scrollLeft() + this.CONTAINER_WIDTH
		};


		/*
			Part 1 - Getting all top & left positions for stopped active view
		*/
		// Rows
		var rowsBehindViewportEdge = (($wp.topMax / this.ROW_HEIGHT).toFixed(0) * this.ROW_HEIGHT) - this.ROW_HEIGHT,
			currentTopPositionList = [];

		for (var i = 0; i < this.VISIBLE_ROWS.length; i++) {
			rowsBehindViewportEdge -= this.ROW_HEIGHT;
			currentTopPositionList.push(rowsBehindViewportEdge);
		}

		// Columns
		var columnsBehindViewportEdge = (($wp.leftMax / this.COLUMN_WIDTH).toFixed(0) * this.COLUMN_WIDTH) - this.COLUMN_WIDTH,
			currentLeftPositionList = [];

		for (var i = 0; i < this.VISIBLE_COLUMNS.length; i++) {
			columnsBehindViewportEdge -= this.COLUMN_WIDTH;
			currentLeftPositionList.push(columnsBehindViewportEdge);
		}

		/*
			Part 2 - Check for overlapping / out of viewport elements and re-draw them
		*/
		// Rows
		var badRows = [];
		// Checking if all rows are in viewport
		for (var i = 0; i < this.VISIBLE_ROWS.length; i++) {
			var row = this.VISIBLE_ROWS[i];
			var positionIndex = currentTopPositionList.indexOf(row.top);
			if (positionIndex < 0) {
				badRows.push(row);
			}
			else {
				currentTopPositionList.splice(positionIndex, 1);
			}
		}
		for (var i = 0; i < badRows.length; i++) {
			var row = badRows[i];

			row.top = currentTopPositionList[i];

			updateRow(row);
		}


		// Columns
		var badColumns = [];
		// Checking if all rows are in viewport
		for (var i = 0; i < this.VISIBLE_COLUMNS.length; i++) {
			var column = this.VISIBLE_COLUMNS[i];
			var positionIndex = currentLeftPositionList.indexOf(column.left);
			if (positionIndex < 0) {
				badColumns.push(column);
			}
			else {
				currentLeftPositionList.splice(positionIndex, 1);
			}
		}
		for (var i = 0; i < badColumns.length; i++) {
			var column = badColumns[i];

			column.left = currentLeftPositionList[i];

			updateColumns(column);
		}
	};

	// Generating matrix
	matrix.prototype.generate = function (selector, id) {
		var self = this;
		if (selector) {
			$('#' + selector).html(this.templates.canvas);
			this.SELECTORS.CONTAINER = selector;
			this.SELECTORS.COLUMNS = '#' + selector + ' > .matrix > .column-objects';
			this.SELECTORS.ROWS = '#' + selector + ' > .matrix > .row-objects';
			this.SELECTORS.TABLE = '#' + selector + ' > .matrix > .matrix-table';
			this.SELECTORS.TABLE_INNER = '#' + selector + ' > .matrix > .matrix-table > .matrix';
			this.SELECTORS.TABLE_CONTAINER = '#' + selector + ' > .matrix > .matrix-table > .matrix > div';

			// Create scroll event
			//var now = new Date().getTime();
			var scrollCallbackTimer;
			$(this.SELECTORS.TABLE_INNER).scroll(function(e) {
				//if (new Date().getTime() - now > 500) {
					//now = new Date().getTime();
					clearTimeout(scrollCallbackTimer);
					m.draw(e);

					scrollCallbackTimer = setTimeout(function() {
						m.reCheck();
					}, 550);
				//}
			});

			if (!id) id = 0;
			this.MATRIX_ID = id;

/*

			$('body').append('<style class="matrix-id-' + this.MATRIX_ID + '">'+
				this.SELECTORS.COLUMNS + ' { height: ' + this.ROW_HEIGHT + 'px; left: ' + this.COLUMN_WIDTH + 'px; };' +
				this.SELECTORS.ROWS + ' { width: ' + this.COLUMN_WIDTH + 'px; top: ' + this.ROW_HEIGHT + 'px; };' +
				this.SELECTORS.TABLE + ' { left: ' + this.COLUMN_WIDTH + 'px; top: ' + this.ROW_HEIGHT + 'px; };' +
			'</style>');
*/

			// Setting sizes
			$(this.SELECTORS.COLUMNS).css('height', self.ROW_HEIGHT + 'px');
			$(this.SELECTORS.COLUMNS).css('left', self.COLUMN_WIDTH + 'px');
			$(this.SELECTORS.ROWS).css('width', self.COLUMN_WIDTH + 'px');
			$(this.SELECTORS.ROWS).css('top', self.ROW_HEIGHT + 'px');
			$(this.SELECTORS.TABLE).css('left', self.COLUMN_WIDTH + 'px');
			$(this.SELECTORS.TABLE).css('top', self.ROW_HEIGHT + 'px');

			// Getting matrix data
			$.get('http://localhost:3000/axis', function(resp) {
				self.rows = resp.Rows;
				self.columns = resp.Columns;

				$(self.SELECTORS.TABLE_CONTAINER).css('height', (self.rows.length * self.ROW_HEIGHT).toString() + 'px');
				$(self.SELECTORS.TABLE_CONTAINER).css('width', (self.columns.length * self.COLUMN_WIDTH).toString() + 'px');

				// Getting relationships
				$.get('http://localhost:3000/relationships/50/50', function(resp) {
					self.loadedRelationships = resp.Relationships;

					m.resizeEvent();

					m.calculateDefaults();
					m.draw();
				});
			});
		}
	};

	var m = new matrix();
	m.generate('matrix-container');

})(this, jQuery);