/*
    OA Custom jquery Plugin
    Author: Mr. Tauts (ready to answer your questions)
*/

(function ($) {
    /*
        Constants
    */
    var CONST = {};
    CONST.FIXED_CELL_HEIGHT = 30;

	/*
		Templates
	*/
	var TPL = {};
	TPL.CANVAS = '<div>' +
        '<div class="vd-switcher">' +
            '<i class="ic-switch-axis"></i>' +
        '</div>' +
        '<div class="vd-columns-axis-description"></div>' +
		'<div class="vd-columns-axis">' +
            '<div></div>' +
        '</div>' +
        '<div class="vd-rows-axis-description"></div>' +
		'<div class="vd-rows-axis">' +
            '<div></div>' +
        '</div>' +
		'<div class="vd-table">' +
			'<div>' +
			'</div>' +
		'</div>' +
        '<div class="vd-progress-loader">' +
            '<i class="ic-loading"></i>' +
        '</div>' +
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

		this.OBJECT_ID = rowCfg.objectId;
		this.OBJECT_TYPE_ID = rowCfg.objectTypeId;

		// Other
		this.UPDATING = false;
	};
	row.prototype.repaint = function () {
	    var matrixObj = activeMatrixes[this.MATRIX_ID].matrix,
            rowItem = matrixObj.Y_AXIS.DATA[(this.TOP / matrixObj.TABLE.TOP)];

	    if (rowItem) {
	        // Updating table row
	        var rowElement = document.querySelectorAll('.vd-matrix-id-' + this.MATRIX_ID + ' .vd-row.id-' + this.ID);
	        rowElement[0].style.top = this.TOP + 'px';

	        // Updating row axis row
	        // Position
	        var rowAxisElement = document.querySelectorAll('.vd-matrix-id-' + this.MATRIX_ID + ' .row-axis-item.id-' + this.ID);
	        rowAxisElement[0].style.top = this.TOP + 'px';
	        // Inner text
	        //console.log(this.TOP / matrixObj.TABLE.TOP, 'from', matrixObj.Y_AXIS.DATA.length, 'First object is:', matrixObj.Y_AXIS.DATA[0].display, 'last object is:', matrixObj.Y_AXIS.DATA[(matrixObj.Y_AXIS.DATA.length-1)].display);
	        rowAxisElement[0].innerHTML = rowItem.display;
	        this.OBJECT_ID = rowItem.objectId;
	        this.OBJECT_TYPE_ID = rowItem.objectTypeId;

	        if (rowElement[0].className.indexOf('vd-loading') < 0) rowElement[0].className += ' vd-loading';
	    }
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
		this.OBJECT_ID = columnCfg.objectId;
		this.OBJECT_TYPE_ID = columnCfg.objectTypeId;

		// Other
		this.UPDATING = false;
	};
	column.prototype.repaint = function () {
	    var matrixObj = activeMatrixes[this.MATRIX_ID].matrix,
            columnItem = matrixObj.X_AXIS.DATA[(this.LEFT / matrixObj.TABLE.LEFT)];

	    if (columnItem) {
	        // Repaints columns with same id in all rows
	        // Updating table
	        var columnElements = document.querySelectorAll('.vd-matrix-id-' + this.MATRIX_ID + ' .vd-column.id-' + this.ID);
	        for (var i = 0; i < columnElements.length; i++) {
	            columnElements[i].style.left = this.LEFT + 'px';
	            if (columnElements[i].className.indexOf('vd-loading') < 0) columnElements[i].className += ' vd-loading';
	        }

	        // Updating column axis
	        // Position
	        var columnAxisElement = document.querySelectorAll('.vd-matrix-id-' + this.MATRIX_ID + ' .column-axis-item.id-' + this.ID);
	        columnAxisElement[0].style.left = this.LEFT + 'px';

	        // Inner text
	        columnAxisElement[0].innerHTML = columnItem.display;
	        this.OBJECT_ID = columnItem.objectId;
	        this.OBJECT_TYPE_ID = columnItem.objectTypeId;
	    }

		this.UPDATING = false;
	};

    /*
        Axis
    */
	function axis(type, items) {
	    this.MATRIX_ID = null;

	    this.TYPE = type || 'columns';
	    this.DATA = items; // All loaded items


	    this.SELECTOR = '.vd-matrix-id-' + this.MATRIX_ID + ' > div > .vd-' + this.TYPE + '-axis';

	    this.WIDTH = null;
	    this.HEIGHT = null;      
	};
	axis.prototype.bootstrap = function (config) {
	    this.HORIZONTAL = config[this.TYPE].options.horizontal;

	    this.HEIGHT = this.HORIZONTAL ? config[this.TYPE].options.height : config[this.TYPE].options.width;
	    this.WIDTH = this.HORIZONTAL ? config[this.TYPE].options.width : config[this.TYPE].options.height;

	    this.INNER_WIDTH = this.DATA.length * this.WIDTH;
	};

	/*
		Matrix table
	*/
	function table() {
		this.MATRIX_ID = null;

		this.HEIGHT = 0;
		this.WIDTH = 0;

		this.ALL_AVAILABLE_WIDTH = 0;
		this.ALL_AVAILABLE_HEIGHT = 0;

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

		this.TOP = config.rows.options.horizontal ? (config.rows.options.height || CONST.FIXED_CELL_HEIGHT) : config.rows.options.width;
		this.LEFT = config.columns.options.horizontal ? config.columns.options.width : (config.columns.options.height || CONST.FIXED_CELL_HEIGHT);

	    // Positioning table
		$(activeMatrixes[this.MATRIX_ID].selectors.table).css({
		    top: ((config.columns.options.horizontal ? config.columns.options.height : config.columns.options.width) + CONST.FIXED_CELL_HEIGHT) + 'px',
	        left: ((config.rows.options.horizontal ? config.rows.options.width : config.rows.options.height) + CONST.FIXED_CELL_HEIGHT) + 'px'
		});

		// Setting dimensions of inner
		var matrixObj = activeMatrixes[this.MATRIX_ID].matrix;
		$(activeMatrixes[this.MATRIX_ID].selectors.tableInner).css({
		    height: (matrixObj.Y_AXIS.DATA.length * this.TOP) + 'px',
		    width: (matrixObj.X_AXIS.DATA.length * this.LEFT) + 'px'
		});

	    // Setting row axis height
		$(activeMatrixes[this.MATRIX_ID].selectors.rowsAxis).css('height', ((matrixObj.Y_AXIS.DATA.length + 1) * this.TOP) + 'px');
	    // Settomg column axis width
		$(activeMatrixes[this.MATRIX_ID].selectors.columnsAxis).css('width', ((matrixObj.X_AXIS.DATA.length + 1) * this.LEFT) + 'px');

		this.INITIALIZED = true;
	};
	table.prototype.repaint = function(config) {
		if (this.INITIALIZED) {
		    var $matrix = activeMatrixes[this.MATRIX_ID].matrix,
                $table = $(activeMatrixes[this.MATRIX_ID].selectors.table);

			this.HEIGHT = $table.height();
			this.WIDTH = $table.width();

			this.ALL_AVAILABLE_WIDTH = $matrix.X_AXIS.DATA.length * this.LEFT;
			this.ALL_AVAILABLE_HEIGHT = $matrix.Y_AXIS.DATA.length * this.TOP;

			var visibleRowsCount = Math.ceil(this.HEIGHT / this.TOP) + 1,
				visibleColumnsCount = Math.ceil(this.WIDTH / this.LEFT) + 1;

		    // Limiting visible rows to available axis count
			if (visibleRowsCount > $matrix.Y_AXIS.DATA.length) visibleRowsCount = $matrix.Y_AXIS.DATA.length;
			if (visibleColumnsCount > $matrix.X_AXIS.DATA.length) visibleColumnsCount = $matrix.X_AXIS.DATA.length;

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
						matrixId: this.MATRIX_ID,
						objectId: $matrix.Y_AXIS.DATA[i].objectId,
						objectTypeId: $matrix.Y_AXIS.DATA[i].objectTypeId
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
						matrixId: this.MATRIX_ID,
						objectId: $matrix.X_AXIS.DATA[a].objectId,
						objectTypeId: $matrix.X_AXIS.DATA[a].objectTypeId
					}));
				}
				this.FIRST_COLUMN_ID = 0;
				this.LAST_COLUMN_ID = this.COLUMNS.length - 1;

			    // Updating Table DOM
			    var rowAxisHtml = '',
                    columnsAxisHtml = '',
				    matrixTableHtml = '';
                for (var a = 0; a < this.ROWS.length; a++) {
                    // Rows axis
                    rowAxisHtml += '<div class="row-axis-item id-' + a + '" style="top: ' + this.ROWS[a].TOP + 'px; left: 0; right: 0; height: ' + this.LEFT + 'px; border-bottom: 1px #ececec solid;">' + $matrix.Y_AXIS.DATA[a].display + '</div>';

                    // Table
                    matrixTableHtml += '<div class="vd-row id-' + a + '" style="top: ' + this.ROWS[a].TOP + 'px; height: ' + this.TOP + 'px; width: ' + ($matrix.X_AXIS.DATA.length * this.LEFT) + 'px;">';
				    for (var b = 0; b < this.COLUMNS.length; b++) {
				        // Columns axis
				        if (a === 0) columnsAxisHtml += '<div class="column-axis-item id-' + b + '" style="left: ' + this.COLUMNS[b].LEFT + 'px; top: 0; bottom: 0; width: ' + this.LEFT + 'px; border-right: 1px #ececec solid;">' + $matrix.X_AXIS.DATA[b].display + '</div>';

				        // Table
				        matrixTableHtml += '<div class="vd-column id-' + b + '" style="left: ' + this.COLUMNS[b].LEFT + 'px; height: ' + this.TOP + 'px; width: ' + this.LEFT + 'px;"></div>';
					}

					matrixTableHtml += '</div>';
				}

                $(activeMatrixes[this.MATRIX_ID].selectors.rowsAxis).html(rowAxisHtml);
                $(activeMatrixes[this.MATRIX_ID].selectors.columnsAxis).html(columnsAxisHtml);
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
				if (difference < (this.TOP + this.TOP/2)) {
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
						else if (direction === 'up' && this.ROWS[this.LAST_ROW_ID].TOP >= topDistance + this.HEIGHT) {
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
				if (difference < (this.LEFT + this.LEFT / 2)) {
					// Rerendering rows
					for (var i = 0; i < this.COLUMNS.length; i++) {
						var column = this.COLUMNS[i];
						if (direction === 'right' && this.COLUMNS[this.FIRST_COLUMN_ID].DISTANCE <= leftDistance) {
						    if (column.DISTANCE <= leftDistance && !column.UPDATING && this.COLUMNS[this.LAST_COLUMN_ID].DISTANCE < this.ALL_AVAILABLE_WIDTH) {
							    column.LEFT = this.COLUMNS[this.LAST_COLUMN_ID].DISTANCE;
								column.DISTANCE = column.LEFT + this.LEFT;
								this.LAST_COLUMN_ID = column.ID;
								this.FIRST_COLUMN_ID = column.ID + 1 < this.COLUMNS.length ? column.ID + 1 : 0;
								column.UPDATING = true;
								column.repaint();
							}
						}
						else if (direction === 'left' && this.COLUMNS[this.LAST_COLUMN_ID].LEFT >= leftDistance + this.WIDTH) {
						    if (column.LEFT > leftDistance + this.WIDTH && (this.COLUMNS[this.FIRST_COLUMN_ID].LEFT - this.LEFT) >= 0) {
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
	table.prototype.scroll = function() {
		var $matrixTableElement = $(activeMatrixes[this.MATRIX_ID].selectors.table);

		var scrollTop = $matrixTableElement.scrollTop();
		if (scrollTop !== this.TOP_SCROLL && (scrollTop + this.HEIGHT) < this.ALL_AVAILABLE_HEIGHT) {
			var goingDown = scrollTop > this.TOP_SCROLL;
			this.virtualize(goingDown ? 'down' : 'up', goingDown ? (scrollTop - this.TOP_SCROLL) : ( this.TOP_SCROLL - scrollTop), scrollTop);
			this.TOP_SCROLL = scrollTop;
		}
		
		var scrollLeft = $matrixTableElement.scrollLeft();
		if (scrollLeft !== this.LEFT_SCROLL && (scrollLeft + this.WIDTH) < this.ALL_AVAILABLE_WIDTH) {
			var goingRight = scrollLeft > this.LEFT_SCROLL;
			this.virtualize(goingRight ? 'right' : 'left', goingRight ? (scrollLeft - this.LEFT_SCROLL) : ( this.LEFT_SCROLL - scrollLeft), null, scrollLeft);
			this.LEFT_SCROLL = scrollLeft;
		}

		$(activeMatrixes[this.MATRIX_ID].selectors.columnsAxis).css('left', '-' + scrollLeft + 'px');
		$(activeMatrixes[this.MATRIX_ID].selectors.rowsAxis).css('top', '-' + scrollTop + 'px');
	};
	table.prototype.enableScrolling = function() {
		// Create scroll event
		var scrollCallbackTimer,
			_self = this;
		$(activeMatrixes[this.MATRIX_ID].selectors.table).scroll(function(e) {
		    clearTimeout(scrollCallbackTimer);

		    if (!_self.LOADING) {
		        _self.LOADING = true;
		        $('.vd-matrix-id-' + _self.MATRIX_ID + ' .vd-progress-loader').show();
		    }

		    _self.scroll();


		    scrollCallbackTimer = setTimeout(function () {
		        var $wp = { // ViewPort
					topMin: $(activeMatrixes[_self.MATRIX_ID].selectors.table).scrollTop(),
					topMax: $(activeMatrixes[_self.MATRIX_ID].selectors.table).scrollTop() + _self.HEIGHT,
					leftMin: $(activeMatrixes[_self.MATRIX_ID].selectors.table).scrollLeft(),
					leftMax: $(activeMatrixes[_self.MATRIX_ID].selectors.table).scrollLeft() + _self.WIDTH
				};

				if ($wp.leftMax > _self.ALL_AVAILABLE_WIDTH) $wp.leftMax = _self.ALL_AVAILABLE_WIDTH;
				if ($wp.topMax > _self.ALL_AVAILABLE_HEIGHT) $wp.topMax = _self.ALL_AVAILABLE_HEIGHT;


		        // Checking if we really need to do "FIXIN"
				var isRowsVirtualized = _self.ROWS.length * _self.TOP > _self.HEIGHT,
                    isColumnsVirtualized = _self.COLUMNS.length * _self.LEFT > _self.WIDTH;

				// Part 1 - Getting all top & left positions for stopped active view				
			    // Rows
				if (isRowsVirtualized) {
				    var rowsBehindViewportEdge = Math.ceil($wp.topMax / _self.TOP) * _self.TOP,
                        currentTopPositionList = [];
				    for (var i = 0; i < _self.ROWS.length; i++) {
				        rowsBehindViewportEdge -= _self.TOP;
				        if (rowsBehindViewportEdge < 0) rowsBehindViewportEdge = Math.ceil($wp.topMax / _self.TOP) * _self.TOP + _self.TOP;
				        currentTopPositionList.push(rowsBehindViewportEdge);
				    }
				}
				if (isColumnsVirtualized) {
				    // Columns
				    var columnsBehindViewportEdge = Math.ceil($wp.leftMax / _self.LEFT) * _self.LEFT,
                        currentLeftPositionList = [];
				    for (var i = 0; i < _self.COLUMNS.length; i++) {
				        columnsBehindViewportEdge -= _self.LEFT;
				        if (columnsBehindViewportEdge < 0) columnsBehindViewportEdge = Math.ceil($wp.leftMax / _self.LEFT) * _self.LEFT + _self.LEFT;
				        currentLeftPositionList.push(columnsBehindViewportEdge);
				    }
				}

				// Part 2 - Check for overlapping / out of viewport elements and re-draw them
			    // Rows
				if (isRowsVirtualized) {
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

				    if (badRows.length > 0) {
				        for (var i = 0; i < badRows.length; i++) {
				            badRows[i].TOP = currentTopPositionList[i];
				            badRows[i].repaint();
				        }

				        var FIRST_ROW = _self.ROWS[_self.FIRST_ROW_ID],
                            LAST_ROW = _self.ROWS[_self.LAST_ROW_ID];
				        for (var i = 0; i < _self.ROWS.length; i++) {
				            if (_self.ROWS[i].TOP < FIRST_ROW.TOP) FIRST_ROW = _self.ROWS[i];
				            if (_self.ROWS[i].TOP > LAST_ROW.TOP) LAST_ROW = _self.ROWS[i];
				        }

				        _self.FIRST_ROW_ID = FIRST_ROW.ID;
				        _self.LAST_ROW_ID = LAST_ROW.ID;
				    }
				}

			    // Columns
				if (isColumnsVirtualized) {
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
				    if (badColumns.length > 0) {
				        for (var i = 0; i < badColumns.length; i++) {
				            badColumns[i].LEFT = currentLeftPositionList[i];
				            badColumns[i].repaint();
				        }

				        var FIRST_COLUMN = _self.COLUMNS[_self.FIRST_COLUMN_ID],
                            LAST_COLUMN = _self.COLUMNS[_self.LAST_COLUMN_ID];
				        for (var i = 0; i < _self.COLUMNS.length; i++) {
				            if (_self.COLUMNS[i].LEFT < FIRST_COLUMN.LEFT) FIRST_COLUMN = _self.COLUMNS[i];
				            if (_self.COLUMNS[i].LEFT > LAST_COLUMN.LEFT) LAST_COLUMN = _self.COLUMNS[i];
				        }

				        _self.FIRST_COLUMN_ID = FIRST_COLUMN.ID;
				        _self.LAST_COLUMN_ID = LAST_COLUMN.ID;
				    }
				}

		        // Initializing relationship receiving
				_self.loadRelationships(function (_self) {
				    // Initializing selections
				    _self.performSelection();

				    _self.LOADING = false;
				    $('.vd-matrix-id-' + _self.MATRIX_ID + ' .vd-progress-loader').hide();
				});

			}, 550);
		});
	};

	table.prototype.performSelection = function () {
	    var matrixObj = activeMatrixes[this.MATRIX_ID].matrix;

	    // Running trough all items anc checking if they are selected
	    var loadingRows = $('.vd-row.vd-loading');

	    for (var i = 0, b = loadingRows.length; i < b; i++) {
	        var $row = $(loadingRows[i]),
                rowId = getId($row);


	        // Running trough all column items
	        for (var cellId = 0, c = this.COLUMNS.length; cellId < c; cellId++) {

	            var $column = $row.children('.id-' + cellId),
                    selectionString = matrixObj.TABLE.ROWS[rowId].OBJECT_ID + '_' + matrixObj.TABLE.COLUMNS[cellId].OBJECT_ID,
	                selectionStringReverse = matrixObj.TABLE.COLUMNS[cellId].OBJECT_ID + '_' + matrixObj.TABLE.ROWS[rowId].OBJECT_ID;

	            var method = (matrixObj.SELECTED_ITEMS.indexOf(selectionString) < 0 && matrixObj.SELECTED_ITEMS.indexOf(selectionStringReverse) < 0 ? 'remove' : 'add') + 'Class';

	            $column[method]('vd-selected').removeClass('vd-loading');
	        }

	        $row.removeClass('vd-loading');
	    }

	    // Additional check for selected columns if there are any missed
	    var loadingColumns = $('.vd-column.vd-loading');
	    for (var a = 0, b = loadingColumns.length; a < b; a++) {
	        var $column = $(loadingColumns[a]),
                cellId = getId($column),
                rowId = getId($column.parent()),
	            selectionString = matrixObj.TABLE.ROWS[rowId].OBJECT_ID + '_' + matrixObj.TABLE.COLUMNS[cellId].OBJECT_ID,
                selectionStringReverse = matrixObj.TABLE.COLUMNS[cellId].OBJECT_ID + '_' + matrixObj.TABLE.ROWS[rowId].OBJECT_ID;

	        var method = (matrixObj.SELECTED_ITEMS.indexOf(selectionString) < 0 && matrixObj.SELECTED_ITEMS.indexOf(selectionStringReverse) < 0 ? 'remove' : 'add') + 'Class';

	        $column[method]('vd-selected').removeClass('vd-loading');
	    }

	};

	var activeAjaxCall = null;
	table.prototype.loadRelationships = function (callback) {
	    // Cancelling previous calls
	    if (activeAjaxCall != null) {
	        activeAjaxCall.abort();
	        activeAjaxCall = null;
	    }

        
	    var matrixObj = activeMatrixes[this.MATRIX_ID].matrix,
	        rowIds = [],
            columnIds = [];

	    var loadingRows = $('.vd-row.vd-loading');
	    if (loadingRows.length > 0) {
	        for (var i = 0, b = loadingRows.length; i < b; i++) {
	            var rowId = getId($(loadingRows[i]));

	            rowIds.push(matrixObj.TABLE.ROWS[rowId].OBJECT_ID);
	            if (i === 0) {
	                for (var cellId = 0, c = this.COLUMNS.length; cellId < c; cellId++) {
	                    columnIds.push(matrixObj.TABLE.COLUMNS[cellId].OBJECT_ID);
	                }
	            }
	        }
	    }
	    else {
	        // Additional check for selected columns if there are any missed
	        var loadingColumns = $('.vd-column.vd-loading');
	        for (var a = 0, b = loadingColumns.length; a < b; a++) {
	            var cellId = getId($(loadingColumns[a])),
                    rowId = getId($(loadingColumns[a]).parent());

	            if (rowIds.indexOf(matrixObj.TABLE.ROWS[rowId].OBJECT_ID) < 0) rowIds.push(matrixObj.TABLE.ROWS[rowId].OBJECT_ID);
	            columnIds.push(matrixObj.TABLE.COLUMNS[cellId].OBJECT_ID);
	        }
	    }

	    var _self = this;
	    matrixObj.API.getRelationships(rowIds, columnIds, function (resp) {

	        // Clearing load relationships
	        $('.vd-row.vd-loading .vd-column.vd-relationship').removeClass('vd-relationship vd-single').html('');
	        $('.vd-column.vd-loading.vd-relationship').removeClass('vd-relationship vd-single').html('');

	        if (resp.data.item.intersectionItems) {

	            for (var i = 0, b = resp.data.item.intersectionItems.length; i < b; i++) {
	                var $relationship = resp.data.item.intersectionItems[i];

	                // Finding row id
	                var rowId = $.grep(matrixObj.TABLE.ROWS, function (e) {
	                    return e.OBJECT_ID === $relationship.rowObjectId;
	                })[0].ID;

	                // Finding cell id
	                var columnId = $.grep(matrixObj.TABLE.COLUMNS, function (e) {
	                    return e.OBJECT_ID === $relationship.columnObjectId;
	                })[0].ID;

	                $('.vd-matrix-id-' + _self.MATRIX_ID + ' .vd-row.id-' + rowId + ' .vd-column.id-' + columnId).addClass('vd-relationship vd-single').html('<span></span>');

	            }
	        }



	        // Render relationships if we have any!
            /*
	        if (resp.data.item.relationshipMatrix) {
	            for (var i = 0, b = rowIds.length; i < b; i++) {
	                for (var a = 0, c = columnIds.length; a < c; a++) {
	                    console.log('Relationship status is:', resp.data.item.relationshipMatrix[i][a]);
	                }
	            }
	        }
            */

	        if (callback != null) callback(_self);
	    });
	};

	/*
		Matrix canvas
	*/
	var currentMatrixId = 0,
	    activeMatrixes = [];

	function matrix(element, config) {
		this.MATRIX_ID = currentMatrixId;
		currentMatrixId++;

		element.addClass('vd-matrix vd-matrix-id-' + this.MATRIX_ID);
		element.attr('data-vd-matrix', this.MATRIX_ID);

	    // Making sure we have all params (default param extend)
		var defaults = {
		    columns: {
		        options: {
		            width: 150,
                    horizontal: false
		        }
		    },
		    rows: {
		        options: {
		            width: 150,
                    horizontal: true
		        }
		    },
			id: this.MATRIX_ID
		};
		if (!config) {
			config = defaults;
		}
		else {
		    config = $.extend(defaults, config);
		}

		// Appending canvas template

		// Pushing this to matrixes array
		activeMatrixes[this.MATRIX_ID] = {
			matrix: this,
			selectors: {
				canvas: '.vd-matrix-id-' + this.MATRIX_ID,
				table: '.vd-matrix-id-' + this.MATRIX_ID + ' > div > .vd-table',
				tableInner: '.vd-matrix-id-' + this.MATRIX_ID + ' > div > .vd-table > div',
				rowsAxis: '.vd-matrix-id-' + this.MATRIX_ID + ' > div > .vd-rows-axis > div',
				columnsAxis: '.vd-matrix-id-' + this.MATRIX_ID + ' > div > .vd-columns-axis > div',
			}
		};
		element.html(TPL.CANVAS);

	    // Creating axis
		this.X_AXIS = new axis('columns', config.columns.items);
		this.X_AXIS.bootstrap(config);
		this.Y_AXIS = new axis('rows', config.rows.items);
		this.Y_AXIS.bootstrap(config);

	    // Setting up matrix table
		this.TABLE = new table();
		this.TABLE.bootstrap(config);
		this.TABLE.repaint();
		this.TABLE.enableScrolling();

		this.VIEW_ID = config.viewId;

		this.API = config.options.api;

	    // Selected items
		this.SELECTED_ITEMS = '';

	    // Setting up resizing of multiple matrixes
		if (activeMatrixes.length === 1) {
		    $(window).on('resize.vdMatrix', function () {
		        for (var i = 0; i < activeMatrixes.length; i++) {
		            activeMatrixes[i].matrix.resize();
		        }
		    });
		}

		this.LOADING = false;
	};
	matrix.prototype.resize = function() {
		this.TABLE.ROWS = [];
		this.TABLE.COLUMNS = [];

		this.HEIGHT = $(activeMatrixes[this.MATRIX_ID].selectors.table).height();
		this.WIDTH = $(activeMatrixes[this.MATRIX_ID].selectors.table).width();

		this.TOP_SCROLL = $(activeMatrixes[this.MATRIX_ID].selectors.table).scrollTop();
		this.LEFT_SCROLL = $(activeMatrixes[this.MATRIX_ID].selectors.table).scrollLeft();
		this.TABLE.repaint();
	};
	matrix.prototype.switch = function () {
	    var tempRowsAxis = this.Y_AXIS.DATA;

	    this.Y_AXIS.DATA = this.X_AXIS.DATA;
	    this.X_AXIS.DATA = tempRowsAxis;

	    $(activeMatrixes[this.MATRIX_ID].selectors.tableInner).css({
	        height: (this.Y_AXIS.DATA.length * this.TABLE.TOP) + 'px',
	        width: (this.X_AXIS.DATA.length * this.TABLE.LEFT) + 'px'
	    });

	    $(activeMatrixes[this.MATRIX_ID].selectors.rowsAxis).css('height', ((this.Y_AXIS.DATA.length + 1)  * this.TABLE.TOP) + 'px');
	    $(activeMatrixes[this.MATRIX_ID].selectors.columnsAxis).css('width', ((this.X_AXIS.DATA.length + 1) * this.TABLE.LEFT) + 'px');

	    this.resize();
	};
	matrix.prototype.destroy = function() {
	    this.TABLE = null;

	    // Removing switch click event
	    $('.vd-matrix-id-' + this.MATRIX_ID + ' .vd-switcher').unbind('click');

	    // Removing attribute & matrix id
	    $('.vd-matrix-id-' + this.MATRIX_ID).removeAttr('data-vd-matrix').removeClass('vd-matrix-id-' + this.MATRIX_ID).html('');

	    // Unbind scrolling
	    $(activeMatrixes[this.MATRIX_ID].selectors.table).unbind('scroll');
	};


    function getId(element) {
	    var classes = element.attr('class');

	    return classes.split('id-')[1].split(' ')[0];
	};

	/*
		jQuery extend
	*/
	$.fn.matrix = function (config) {
	    if (config.action === 'create') {
	        var m = new matrix(this, config.options);

	        // Creating switch event
	        $('.vd-matrix-id-' + m.MATRIX_ID + ' .vd-switcher').click(function () {
	            m.switch();
	        });

	        // Enabling cell Selection
	        if (config.options.options.cellSelection) {
	            $('.vd-matrix-id-' + m.MATRIX_ID).on('click', '.vd-column', function () {
	                var rowId = getId($(this).parent()),
                        cellId = getId($(this));

	                var matrixObj = activeMatrixes[m.MATRIX_ID].matrix,
                        selectionString = matrixObj.TABLE.ROWS[rowId].OBJECT_ID + '_' + matrixObj.TABLE.COLUMNS[cellId].OBJECT_ID;

	                // Checking for clone element
	                var cloneElement;
	                var cloneRowId = $.grep(matrixObj.TABLE.ROWS, function (e) {
	                    return e.OBJECT_ID === matrixObj.TABLE.COLUMNS[cellId].OBJECT_ID;
	                });

	                if (cloneRowId.length > 0) {
	                    var cloneColumnId = $.grep(matrixObj.TABLE.COLUMNS, function (e) {
	                        return e.OBJECT_ID === matrixObj.TABLE.ROWS[rowId].OBJECT_ID;
	                    });

	                    if (cloneColumnId.length > 0) {
	                        cloneElement = $('.vd-matrix-id-' + m.MATRIX_ID + ' .vd-row.id-' + matrixObj.TABLE.ROWS.indexOf(cloneRowId[0]) + ' .vd-column.id-' + matrixObj.TABLE.COLUMNS.indexOf(cloneColumnId[0]));
	                    }
	                }

	                if (matrixObj.SELECTED_ITEMS.indexOf(selectionString) < 0) {
	                    matrixObj.SELECTED_ITEMS += ' ' + selectionString;
	                    $(this).addClass('vd-selected');
	                    if (cloneElement) cloneElement.addClass('vd-selected');
	                }
	                else {
	                    matrixObj.SELECTED_ITEMS = matrixObj.SELECTED_ITEMS.replace(selectionString, '');
	                    $(this).removeClass('vd-selected');
	                    if (cloneElement) cloneElement.removeClass('vd-selected');
	                }

	            });
	        }

	    }
	    else {
	        var MATRIX_ID = getId($(this)),
                matrixObj = activeMatrixes[MATRIX_ID].matrix;

	        if (config.action === 'destroy') {
	            matrixObj.destroy();
	            activeMatrixes.splice(MATRIX_ID, 1);

	            if (activeMatrixes.length === 0) {
	                $(window).unbind('resize.vdMatrix');
	            }

	            console.log('%c -- Matrix Destroyed', 'background: purple; color: yellow;');
	        }
	        else if (config.action === 'clearSelection') {
	            matrixObj.SELECTED_ITEMS = '';
	            $('.vd-matrix-id-' + m.MATRIX_ID + ' .vd-column.vd-selected').removeClass('vd-selected');

	            console.log('Matrix selection cleared');
	        }
        }

        return this;
    };

})(jQuery);