(function($) {
	var CONST = {};
	CONST.ROW_HEIGHT = 30; // PX
	CONST.COLUMN_WIDTH = 30; // PX

	/*
		Templates
	*/
	var TPL = {};
	TPL.CANVAS = '<div>' +
		'<div class="columns-axis"></div>' +
		'<div class="rows-axis"></div>' +
		'<div class="table">' +
			'<div>' +
			'</div>' +
		'</div>'
	'</div>';


	/*
		Row items
	*/
	function row(rowCfg) {
		// Esentials
		this.MATRIX_ID = rowCfg.matrixId || 0;
		this.TOP = rowCfg.top || 0;
		this.DISTANCE = rowCfg.distance || 0;
		this.ID = rowCfg.id || 0;

		// Other
		this.UPDATING = false;
	};
	row.prototype.repaint = function() {
		var rowElement = document.querySelectorAll('.matrix-id-' + this.MATRIX_ID + ' .row.id-' + this.ID);
		rowElement[0].style.top = this.TOP + 'px';
		if (rowElement[0].className.indexOf('loading') < 0) rowElement[0].className += ' loading';
		this.UPDATING = false;
	};

	/*
		Column items
	*/
	function column(columnCfg) {
		// Esentials
		this.MATRIX_ID = columnCfg.matrixId || 0;
		this.LEFT = columnCfg.left || 0;
		this.DISTANCE = columnCfg.distance || 0;
		this.ID = columnCfg.id || 0;

		// Other
		this.UPDATING = false;
	};
	column.prototype.repaint = function() {
		// Repaints columns with same id in all rows
		var columnElements = document.querySelectorAll('.matrix-id-' + this.MATRIX_ID + ' .column.id-' + this.ID);
		for (var i = 0; i < columnElements.length; i++) {
			columnElements[i].style.left = this.LEFT + 'px';
			if (columnElements[i].className.indexOf('loading') < 0) columnElements[i].className += ' loading';
		}
		this.UPDATING = false;
	};
	/*
		Matrix table
	*/
	function table() {
		this.MATRIX_ID = null;

		this.HEIGH = 0;
		this.WIDTH = 0;

		this.ROWS = [];
		this.COLUMNS = [];

		this.TOP_SCROLL = 0;
		this.LEFT_SCROLL = 0;

		this.INITIALIZED = false;
	};
	table.prototype.bootstrap = function(config) {
		this.MATRIX_ID = config.id;

		this.ROWS = [];
		this.COLUMNS = [];

		this.TOP = config.rowHeight;
		this.LEFT = config.columnWidth;

		// Positioning table
		$(activeMatrixes[this.MATRIX_ID].selectors.table).css({
			top: this.TOP + 'px',
			left: this.LEFT + 'px'
		});

		// Setting dimensions of inner
		var matrixObj = activeMatrixes[this.MATRIX_ID].matrix;
		$(activeMatrixes[this.MATRIX_ID].selectors.tableInner).css({
			height: (matrixObj.COLUMNS_AXIS.length * this.TOP) + 'px',
			width: (matrixObj.ROWS_AXIS.length * this.LEFT) + 'px'
		});

		this.INITIALIZED = true;
	};
	table.prototype.repaint = function(config) {
		if (this.INITIALIZED) {
			var $table = $(activeMatrixes[this.MATRIX_ID].selectors.table);
			this.HEIGHT = $table.height();
			this.WIDTH = $table.width();

			var visibleRowsCount = Math.ceil(this.HEIGHT / this.TOP) + 1,
				visibleColumnsCount = Math.ceil(this.WIDTH / this.LEFT) + 1;

			if (this.ROWS.length != visibleRowsCount || this.COLUMNS.length !== visibleColumnsCount) {
				var initialTop = Math.floor($table.scrollTop() / this.TOP) * this.TOP,
					initialLeft = Math.floor($table.scrollLeft() / this.LEFT) * this.LEFT;

				// Creating virtual dom
				this.ROWS = [];
				for (var i = 0; i < visibleRowsCount; i++) {
					this.ROWS.push(new row({
						top: initialTop + i * this.TOP,
						distance: initialTop + (i * this.TOP) + this.TOP,
						id: i,
						matrixId: this.MATRIX_ID
					}));
				}
				this.FIRST_ROW_ID = 0;
				this.LAST_ROW_ID = this.ROWS.length - 1;

				this.COLUMNS = [];
				for (var a = 0; a < visibleColumnsCount; a++) {
					this.COLUMNS.push(new column({
						left: initialLeft + a * this.LEFT,
						distance: initialLeft + (a * this.LEFT) + this.LEFT,
						id: a,
						matrixId: this.MATRIX_ID
					}));
				}
				this.FIRST_COLUMN_ID = 0;
				this.LAST_COLUMN_ID = this.COLUMNS.length - 1;

				// Updating DOM
				var matrixTableHtml = '';
				for (var a = 0; a < this.ROWS.length; a++) {
					matrixTableHtml += '<div class="row id-' + a + '" style="top: ' + this.ROWS[a].TOP + 'px; height: ' + this.TOP + 'px; width: ' + (10000 * this.LEFT) + 'px;">'

					for (var b = 0; b < this.COLUMNS.length; b++) {
						matrixTableHtml += '<div class="column id-' + b + '" style="left: ' + this.COLUMNS[b].LEFT + 'px; height: ' + this.TOP + 'px; width: ' + this.LEFT + 'px;"></div>'
					}

					matrixTableHtml += '</div>';
				}

				$(activeMatrixes[this.MATRIX_ID].selectors.tableInner).html(matrixTableHtml);
			}
		}
	};
	var virtualizationInProgress = false;
	table.prototype.virtualize = function(direction, difference, topDistance, leftDistance) {
		if (!virtualizationInProgress) {
			virtualizationInProgress = true;

			//For vertical scrolling
			if (direction === 'up' || direction === 'down') {
				// Small distance scroll
				if (difference < this.HEIGHT) {
					// Rerendering rows
					for (var i = 0; i < this.ROWS.length; i++) {
						var row = this.ROWS[i];
						if (direction === 'down' && this.ROWS[this.FIRST_ROW_ID].DISTANCE <= topDistance) {
							if (row.DISTANCE <= topDistance && !row.UPDATING) {
								row.TOP = this.ROWS[this.LAST_ROW_ID].DISTANCE;
								row.DISTANCE = row.TOP + this.TOP;
								this.LAST_ROW_ID = row.ID;
								this.FIRST_ROW_ID = row.ID + 1 < this.ROWS.length ? row.ID + 1 : 0;
								row.UPDATING = true;
								row.repaint();
							}
						}
						else if (this.ROWS[this.LAST_ROW_ID].TOP >= topDistance + this.HEIGHT) {
							if (row.TOP >= topDistance + this.HEIGHT) {
								row.TOP = this.ROWS[this.FIRST_ROW_ID].TOP - this.TOP;
								row.DISTANCE = row.TOP + this.TOP;
								this.FIRST_ROW_ID = row.ID;
								this.LAST_ROW_ID = row.ID - 1 >= 0 ? row.ID - 1 : this.ROWS.length - 1;
								row.UPDATING = true;
								row.repaint();
							}
						}
						else break;
					}
				}
				else {
					// Full rerender
					var firstTopValue = Math.floor(topDistance / this.TOP) * this.TOP;
					for (var i = 0; i < this.ROWS.length; i++) {
						var row = this.ROWS[i];

						row.TOP = firstTopValue + i * this.TOP;
						row.DISTANCE = row.TOP + this.TOP;
						row.repaint();
					}

					this.FIRST_ROW_ID = 0;
					this.LAST_ROW_ID = this.ROWS.length - 1;
				}
			}
			//For horizontal scrolling
			else {
				// Small distance scroll
				if (difference < this.WIDTH) {
					// Rerendering rows
					for (var i = 0; i < this.COLUMNS.length; i++) {
						var column = this.COLUMNS[i];
						if (direction === 'right' && this.COLUMNS[this.FIRST_COLUMN_ID].DISTANCE <= leftDistance) {
							if (column.DISTANCE <= leftDistance && !column.UPDATING) {
								column.LEFT = this.COLUMNS[this.LAST_COLUMN_ID].DISTANCE;
								column.DISTANCE = column.LEFT + this.LEFT;
								this.LAST_COLUMN_ID = column.ID;
								this.FIRST_COLUMN_ID = column.ID + 1 < this.COLUMNS.length ? column.ID + 1 : 0;
								column.UPDATING = true;
								column.repaint();
							}
						}
						else if (this.COLUMNS[this.LAST_COLUMN_ID].LEFT >= leftDistance + this.WIDTH) {
							if (column.LEFT > leftDistance + this.WIDTH) {
								column.LEFT = this.COLUMNS[this.FIRST_COLUMN_ID].LEFT - this.LEFT;
								column.DISTANCE = column.LEFT + this.LEFT;
								this.FIRST_COLUMN_ID = column.ID;
								this.LAST_COLUMN_ID = column.ID - 1 >= 0 ? column.ID - 1 : this.COLUMNS.length - 1;
								column.UPDATING = true;
								column.repaint();
							}
						}
						else break;
					}
				}
				else {
					var firstLeftValue = Math.floor(leftDistance / this.LEFT) * this.LEFT;
					for (var i = 0; i < this.COLUMNS.length; i++) {
						var column = this.COLUMNS[i];

						column.LEFT = firstLeftValue + i * this.LEFT;
						column.DISTANCE = column.LEFT + this.LEFT;
						column.repaint();
					}

					this.FIRST_COLUMN_ID = 0;
					this.LAST_COLUMN_ID = this.COLUMNS.length - 1;
				}
			}

			virtualizationInProgress = false;
		}
	};
	table.prototype.scroll = function(event) {
		var $matrixTableElement = $(activeMatrixes[this.MATRIX_ID].selectors.table);

		var scrollTop = $matrixTableElement.scrollTop();
		if (scrollTop !== this.TOP_SCROLL) {
			var goingDown = scrollTop > this.TOP_SCROLL;
			this.virtualize(goingDown ? 'down' : 'up', goingDown ? (scrollTop - this.TOP_SCROLL) : ( this.TOP_SCROLL - scrollTop), scrollTop);
			this.TOP_SCROLL = scrollTop;
		}
		
		var scrollLeft = $matrixTableElement.scrollLeft();
		if (scrollLeft !== this.LEFT_SCROLL) {
			var goingRight = scrollLeft > this.LEFT_SCROLL;
			this.virtualize(goingRight ? 'right' : 'left', goingRight ? (scrollLeft - this.LEFT_SCROLL) : ( this.LEFT_SCROLL - scrollLeft), null, scrollLeft);
			this.LEFT_SCROLL = scrollLeft;
		}
	};
	table.prototype.enableScrolling = function() {
		// Create scroll event
		var scrollCallbackTimer,
			_self = this;
		$(activeMatrixes[this.MATRIX_ID].selectors.table).scroll(function(e) {
			clearTimeout(scrollCallbackTimer);
			_self.scroll(e);

			scrollCallbackTimer = setTimeout(function() {
				/*
					Making sure
				*/
				var $wp = { // ViewPort
					topMin: $(activeMatrixes[_self.MATRIX_ID].selectors.table).scrollTop(),
					topMax: $(activeMatrixes[_self.MATRIX_ID].selectors.table).scrollTop() + _self.HEIGHT,
					leftMin: $(activeMatrixes[_self.MATRIX_ID].selectors.table).scrollLeft(),
					leftMax: $(activeMatrixes[_self.MATRIX_ID].selectors.table).scrollLeft() + _self.WIDTH
				};

				// Part 1 - Getting all top & left positions for stopped active view				
				// Rows
				var rowsBehindViewportEdge = Math.ceil($wp.topMax / _self.TOP) * _self.TOP,
					currentTopPositionList = [];
				for (var i = 0; i < _self.ROWS.length; i++) {
					rowsBehindViewportEdge -= _self.TOP;
					if (rowsBehindViewportEdge < 0) rowsBehindViewportEdge = Math.ceil($wp.topMax / _self.TOP) * _self.TOP + _self.TOP;
					currentTopPositionList.push(rowsBehindViewportEdge);
				}
				// Columns
				var columnsBehindViewportEdge = Math.ceil($wp.leftMax / _self.LEFT) * _self.LEFT,
					currentLeftPositionList = [];
				for (var i = 0; i < _self.COLUMNS.length; i++) {
					columnsBehindViewportEdge -= _self.LEFT;
					if (columnsBehindViewportEdge < 0) columnsBehindViewportEdge = Math.ceil($wp.leftMax / _self.LEFT) * _self.LEFT + _self.LEFT;
					currentLeftPositionList.push(columnsBehindViewportEdge);
				}

				// Part 2 - Check for overlapping / out of viewport elements and re-draw them
				// Rows
				var badRows = [];
				// Checking if all rows are in viewport
				for (var i = 0; i < _self.ROWS.length; i++) {
					var positionIndex = currentTopPositionList.indexOf(_self.ROWS[i].TOP);
					if (positionIndex < 0) {
						badRows.push(_self.ROWS[i]);
					}
					else {
						currentTopPositionList.splice(positionIndex, 1);
					}
				}
				for (var i = 0; i < badRows.length; i++) {
					badRows[i].TOP = currentTopPositionList[i];
					badRows[i].repaint();
				}

				// Columns
				var badColumns = [];
				// Checking if all rows are in viewport
				for (var i = 0; i < _self.COLUMNS.length; i++) {
					var positionIndex = currentLeftPositionList.indexOf(_self.COLUMNS[i].LEFT);
					if (positionIndex < 0) {
						badColumns.push(_self.COLUMNS[i]);
					}
					else {
						currentLeftPositionList.splice(positionIndex, 1);
					}
				}
				for (var i = 0; i < badColumns.length; i++) {
					badColumns[i].LEFT = currentLeftPositionList[i];
					badColumns[i].repaint();
				}

			}, 550);
		});
	};

	/*
		Matrix canvas
	*/
	var currentMatrixId = 0,
		activeMatrixes = [];

	function matrix (element, config) {
		this.MATRIX_ID = currentMatrixId;
		currentMatrixId++;

		element.addClass('vd-matrix matrix-id-' + this.MATRIX_ID);

		// Making sure we have all params (default param extend)
		var defaults = {
			rowHeight: 30,
			columnWidth: 30,
			id: this.MATRIX_ID
		};
		if (!config) {
			config = defaults;
		}
		else {
			for (prop in defaults) {
				if (!config[prop]) config[prop] = defaults[prop];
			}
		}
		// Appending canvas template

		// Pushing this to matrixes array
		activeMatrixes[this.MATRIX_ID] = {
			matrix: this,
			selectors: {
				canvas: '.matrix-id-' + this.MATRIX_ID,
				table: '.matrix-id-' + this.MATRIX_ID + ' > div > .table',
				tableInner: '.matrix-id-' + this.MATRIX_ID + ' > div > .table > div'
			}
		};
		element.html(TPL.CANVAS);

		// Getting AXIS
		var self = this;
		$.get('http://localhost:3000/axis', function(resp) {
			self.ROWS_AXIS = resp.Rows;
			self.COLUMNS_AXIS = resp.Columns;

			// Setting up matrix table
			self.TABLE = new table();
			self.TABLE.bootstrap(config);
			self.TABLE.repaint();
			self.TABLE.enableScrolling();

			// Setting up resizing of multiple matrixes
			$(window).resize(function() {
				for (var i = 0; i < activeMatrixes.length; i++) {
					activeMatrixes[i].matrix.resize();
				}
			});

			// Getting relationships
			/*
			$.get('http://localhost:3000/relationships/50/50', function(resp) {
				self.loadedRelationships = resp.Relationships;
				m.resizeEvent();

				m.calculateDefaults();
				m.draw();
			});
			*/
		});
	};
	matrix.prototype.resize = function() {
		this.ROWS = [];
		this.COLUMNS = [];

		this.HEIGHT = $(activeMatrixes[this.MATRIX_ID].selectors.table).height();
		this.WIDTH = $(activeMatrixes[this.MATRIX_ID].selectors.table).width();

		this.TOP_SCROLL = $(activeMatrixes[this.MATRIX_ID].selectors.table).scrollTop();
		this.LEFT_SCROLL = $(activeMatrixes[this.MATRIX_ID].selectors.table).scrollLeft();
		this.TABLE.repaint();
	};
	matrix.prototype.destroy = function() {
		this.TABLE = null;
	};

	/*
		jQuery extend
	*/
	$.fn.matrix = function(config) {
		var m = new matrix(this, config);

        return this;
    };

})(jQuery);

$('#matrix-container').matrix({
	rowHeight: 30,
	columnWidth: 30
});

$('#test').matrix({
	rowHeight: 150,
	columnWidth: 30
});