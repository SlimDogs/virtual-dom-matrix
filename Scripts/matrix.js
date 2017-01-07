/*
    OA virtual-dom-matrix plugin
    v.2.0.0b

    ~ Tauts
*/

(function ($) {

    'use strict';

    /*
        Constants
    */
    var CONST = {};
    CONST.FIXED_CELL_HEIGHT = 30;
    CONST.OBJECT_ICON_WIDTH = 30;

	/*
		Templates
	*/
	var TPL = {};
	TPL.CANVAS = '<div>' +
        '<div class="vd-switcher">' +
            '<i class="ic-switch-axis"></i>' +
        '</div>' +
        '<div class="vd-columns-axis-description"><span></span><div>Lead</div></div>' +
		'<div class="vd-columns-axis">' +
            '<div></div>' +
        '</div>' +
        '<div class="vd-rows-axis-description"><span></span><div>Member</div></div>' +
		'<div class="vd-rows-axis">' +
            '<div></div>' +
        '</div>' +
        // Table
		'<div class="vd-table">' +
            // Rows > columns goes here
            '<div></div>' +
		'</div>' +
        // Shadows
        '<div class="vd-columns-axis-shadow"></div>' +
        '<div class="vd-rows-axis-shadow"></div>' +
        // Loader element
        '<div class="vd-progress-loader">' +
            '<i class="ic-loading"></i>' +
        '</div>' +
	'</div>';

<<<<<<< cb6bf32ef5f761f30e3338eb3580855c191a2198
    /*
        Utility functions
    */
	function getId(element) {
	    var classes = element.attr('class');
	    return classes.split('id-')[1].split(' ')[0];
	};

=======
>>>>>>> Changes made
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
            rowItem = matrixObj.Y_AXIS.DATA[(this.TOP / matrixObj.TABLE.CELL_HEIGHT)];

	    if (rowItem) {
	        // Updating table row
	        var rowElement = document.querySelectorAll('.vd-matrix-id-' + this.MATRIX_ID + ' .vd-row.id-' + this.ID);
	        rowElement[0].style.top = this.TOP + 'px';

	        // Updating row axis row
	        // Position
	        var rowAxisElement = document.querySelectorAll('.vd-matrix-id-' + this.MATRIX_ID + ' .vd-row-axis-item.id-' + this.ID);
	        rowAxisElement[0].style.top = this.TOP + 'px';

	        this.OBJECT_ID = rowItem.objectId;
	        this.OBJECT_TYPE_ID = rowItem.objectTypeId;

	        // Inner text
	        rowAxisElement[0].childNodes[(rowAxisElement[0].childNodes.length - 1)].childNodes[0].innerHTML = rowItem.display;

	        // Icon update
            rowAxisElement[0].childNodes[0].setAttribute('class', 'item-icon svg-sprite ' + rowItem.icon.color);
            rowAxisElement[0].childNodes[0].childNodes[0].setAttribute('xlink:href', '#' + rowItem.icon.icon);

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
            columnItem = matrixObj.X_AXIS.DATA[(this.LEFT / matrixObj.TABLE.CELL_WIDTH)];

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
	        var columnAxisElement = document.querySelectorAll('.vd-matrix-id-' + this.MATRIX_ID + ' .vd-column-axis-item.id-' + this.ID);
	        columnAxisElement[0].style.left = this.LEFT + 'px';

	        this.OBJECT_ID = columnItem.objectId;
	        this.OBJECT_TYPE_ID = columnItem.objectTypeId;

	        // Inner text
	        columnAxisElement[0].childNodes[(columnAxisElement[0].childNodes.length - 1)].childNodes[0].innerHTML = columnItem.display;

	        // Icon update
	        columnAxisElement[0].childNodes[0].setAttribute('class', 'item-icon svg-sprite ' + columnItem.icon.color);
	        columnAxisElement[0].childNodes[0].childNodes[0].setAttribute('xlink:href', '#' + columnItem.icon.icon);
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

	    this.SELECTOR = null;
	};
	axis.prototype.bootstrap = function (config) {
	    this.MATRIX_ID = config.id;
	    this.SELECTOR = '.vd-matrix-id-' + this.MATRIX_ID + ' > div > .vd-' + this.TYPE + '-axis';

	    this.DISPLAY = config[this.TYPE].options.name;

	    this.HORIZONTAL = config[this.TYPE].options.horizontal;
	    this.CLICKABLE = config[this.TYPE].options.clickable;
	    this.SHOW_TEXT = config[this.TYPE].options.showText;
	    this.SHOW_ICON = config[this.TYPE].options.showIcon;

	    this.ITEM_WIDTH = function (returnFullWidth) {
	        if (this.SHOW_TEXT) return config[this.TYPE].options.width - (this.SHOW_ICON && !returnFullWidth ? CONST.OBJECT_ICON_WIDTH : 0);
	        else return CONST.FIXED_CELL_HEIGHT;
	    }

	    this.INNER_WIDTH = this.DATA.length * this.ITEM_WIDTH(true);
	};

	/*
		Matrix table
	*/
	function table(config) {
	    this.MATRIX_ID = config.id;
	    this.SHOW_RELATIONSHIP_COUNT = config.options.showRelationshipCount;

		this.HEIGHT = 0;
		this.WIDTH = 0;

		this.ALL_AVAILABLE_WIDTH = 0;
		this.ALL_AVAILABLE_HEIGHT = 0;

		this.ROWS = [];
		this.COLUMNS = [];

		this.TOP_SCROLL = 0;
		this.LEFT_SCROLL = 0;

		this.LOADED_RELATIONSHIPS = {};

		this.LOADING = true;
	};
	table.prototype.repaint = function (isForcedRepaint) {
	    /*
            Repainting whole table to use all the latest data provided
        */
	    var $matrix = activeMatrixes[this.MATRIX_ID].matrix,
            $table = $(activeMatrixes[this.MATRIX_ID].selectors.table),
            $yAxis = $matrix.Y_AXIS,
            $xAxis = $matrix.X_AXIS,
            $cellWidth = $matrix.X_AXIS.HORIZONTAL ? $matrix.X_AXIS.ITEM_WIDTH(true) : CONST.FIXED_CELL_HEIGHT,
            $cellHeight = $matrix.Y_AXIS.HORIZONTAL ? CONST.FIXED_CELL_HEIGHT : $matrix.Y_AXIS.ITEM_WIDTH(true);

	    this.ALL_AVAILABLE_WIDTH = $matrix.X_AXIS.DATA.length * $cellWidth;
	    this.ALL_AVAILABLE_HEIGHT = $matrix.Y_AXIS.DATA.length * $cellHeight;
	    this.CELL_HEIGHT = $cellHeight;
	    this.CELL_WIDTH = $cellWidth;

	    /*
            Table:
            I - Updating top, left positions
            II - Generating new DOM (Axis included to save additional loops)
                ...
        */

        // I:
	    var tableAndShadowPositionTop = (($matrix.X_AXIS.HORIZONTAL ? CONST.FIXED_CELL_HEIGHT : $matrix.X_AXIS.ITEM_WIDTH(true)) + CONST.FIXED_CELL_HEIGHT) + 'px',
            tableAndShadowPositionLeft = (($matrix.Y_AXIS.HORIZONTAL ? $matrix.Y_AXIS.ITEM_WIDTH(true) : CONST.FIXED_CELL_HEIGHT) + CONST.FIXED_CELL_HEIGHT) + 'px';
	    $(activeMatrixes[this.MATRIX_ID].selectors.table).css({ top: tableAndShadowPositionTop, left: tableAndShadowPositionLeft });

	    this.HEIGHT = $table.height();
	    this.WIDTH = $table.width();

	    // II:
        // Calculating how many rows we can fit in viewport
	    var visibleRowsCount = Math.ceil(this.HEIGHT / $cellHeight) + 1,
			visibleColumnsCount = Math.ceil(this.WIDTH / $cellWidth) + 1;

		// If we can show more then we have...
		if (visibleRowsCount > $matrix.Y_AXIS.DATA.length) visibleRowsCount = $matrix.Y_AXIS.DATA.length;
		if (visibleColumnsCount > $matrix.X_AXIS.DATA.length) visibleColumnsCount = $matrix.X_AXIS.DATA.length;

        // We update dom only if we can show more or less rows / columns than we currently are showing
		if (this.ROWS.length != visibleRowsCount || this.COLUMNS.length !== visibleColumnsCount || isForcedRepaint) {
		    // Triggering loading
		    this.LOADING = true;
		    $('.vd-matrix-id-' + this.MATRIX_ID + ' .vd-progress-loader').show();

			var $tableScrollTop = $table.scrollTop(),
                $tableScrollLeft = $table.scrollLeft(),
			    initialTop = Math.floor($tableScrollTop / $cellHeight) * $cellHeight,
				initialLeft = Math.floor($tableScrollLeft / $cellWidth) * $cellWidth;

			// Creating virtual dom
			this.ROWS = [];
			for (var i = 0; i < visibleRowsCount; i++) {
			    this.ROWS.push(new row({
			        top: initialTop + i * $cellHeight,
			        distance: initialTop + (i * $cellHeight) + $cellHeight,
			        id: i,
			        matrixId: this.MATRIX_ID,
			        objectId: $yAxis.DATA[i].objectId,
			        objectTypeId: $yAxis.DATA[i].objectTypeId
			    }));
			}
			this.FIRST_ROW_ID = 0;
			this.LAST_ROW_ID = this.ROWS.length - 1;

			this.COLUMNS = [];
			for (var a = 0; a < visibleColumnsCount; a++) {
			    this.COLUMNS.push(new column({
			        left: initialLeft + a * $cellWidth,
			        distance: initialLeft + (a * $cellWidth) + $cellWidth,
			        id: a,
			        matrixId: this.MATRIX_ID,
			        objectId: $xAxis.DATA[a].objectId,
			        objectTypeId: $xAxis.DATA[a].objectTypeId
			    }));
			}
			this.FIRST_COLUMN_ID = 0;
			this.LAST_COLUMN_ID = this.COLUMNS.length - 1;

			// Updating Table DOM
			var rowAxisHtml = '',
                columnsAxisHtml = '',
				matrixTableHtml = '';
			for (var a = 0; a < this.ROWS.length; a++) {
			    /*
                    Row Axis item
                */
			    var $yItem = $yAxis.DATA[a];
			    rowAxisHtml += '<div class="vd-row-axis-item id-' + a + '" style="top: ' + this.ROWS[a].TOP + 'px; height: ' + ($yAxis.HORIZONTAL ? CONST.FIXED_CELL_HEIGHT : $yAxis.ITEM_WIDTH(true)) + 'px;" title="' + $yItem.display + '">' +
                        ($yItem.icon && $yAxis.SHOW_ICON ? '<svg class="item-icon svg-sprite ' + $yItem.icon.color + '"><use xlink:href="#' + $yItem.icon.icon + '" /></svg>' : '') + // Icon
                        ($yItem.icon.subIcon != null && $yAxis.SHOW_ICON ? '<span class="' + $yItem.icon.subIcon + '"></span>' : '') +
                        ($yAxis.SHOW_TEXT ? '<div style="width: ' + $yAxis.ITEM_WIDTH() + 'px;"><span>' + $yItem.display + '</span></div>' : '') +
                    '</div>';

			    // Table row
			    matrixTableHtml += '<div class="vd-row id-' + a + ' vd-loading" style="top: ' + this.ROWS[a].TOP + 'px; height: ' + $cellHeight + 'px; width: ' + ($xAxis.DATA.length * this.CELL_WIDTH) + 'px;">';

			    for (var b = 0; b < this.COLUMNS.length; b++) {
			        /*
                        Column Axis Item
                    */
			        if (a === 0) { // Preventing axis regeneration
			            var $xItem = $xAxis.DATA[b];
			            columnsAxisHtml += '<div class="vd-column-axis-item id-' + b + '" style="left: ' + this.COLUMNS[b].LEFT + 'px; width: ' + $cellWidth + 'px;" title="' + $xItem.display + '">' +
                                ($xItem.icon && $xAxis.SHOW_ICON ? '<svg class="item-icon svg-sprite ' + $xItem.icon.color + '"><use xlink:href="#' + $xItem.icon.icon + '" /></svg>' : '') +
                                ($xItem.icon.subIcon != null && $xAxis.SHOW_ICON ? '<span class="' + $xItem.icon.subIcon + '"></span>' : '') +
                                ($xAxis.SHOW_TEXT ? '<div style="width: ' + $xAxis.ITEM_WIDTH() + 'px;"><span>' + $xItem.display + '</span></div>' : '') +
                            '</div>';

			        }

			        // Table
			        matrixTableHtml += '<div class="vd-column id-' + b + '" style="left: ' + this.COLUMNS[b].LEFT + 'px; height: ' + $cellHeight + 'px; width: ' + $cellWidth + 'px;"></div>';
			    }

			    matrixTableHtml += '</div>';
			}

		    // Appending Table DOM & setting proper sizes
			$(activeMatrixes[this.MATRIX_ID].selectors.tableInner).html(matrixTableHtml)
            .css({
                height: ($yAxis.DATA.length * $cellHeight) + 'px',
                width: ($xAxis.DATA.length * $cellWidth) + 'px'
            });

			if ($matrix.API.onCellContextMenu) {
			    /*
                    On right mouse click inside the cell
                */
			    $.contextMenu('destroy', '.vd-matrix-id-' + this.MATRIX_ID + ' .vd-column');
			    $.contextMenu({
			        selector: '.vd-matrix-id-' + this.MATRIX_ID + ' .vd-column',
			        build: function ($cell) {
			            /*
                            Getting cell details
                        */
			            var rowId = getId($($cell).parent()),
                            cellId = getId($($cell)),
                            hasRelationships = $($cell).hasClass('vd-relationship'),
                            row = $matrix.TABLE.ROWS[rowId],
                            column = $matrix.TABLE.COLUMNS[cellId];

			            var contextMenuReturn = {
                            element: $cell,
                            columnItemId: column.OBJECT_ID,
                            columnItemName: $matrix.X_AXIS.DATA[(column.LEFT / $matrix.TABLE.CELL_WIDTH)].display,
                            rowItemId: row.OBJECT_ID,
                            rowItemName: $matrix.Y_AXIS.DATA[(row.TOP / $matrix.TABLE.CELL_HEIGHT)].display,
                            pairStringOne: row.OBJECT_ID + '_' + column.OBJECT_ID,
                            pairStringTwo: column.OBJECT_ID + '_' + row.OBJECT_ID,
			                options: {
			                    isSelected: $matrix.SELECTED_ITEMS[row.OBJECT_ID + '_' + column.OBJECT_ID] != null || $matrix.SELECTED_ITEMS[column.OBJECT_ID + '_' + row.OBJECT_ID] != null,
			                    isRelated: $($cell).hasClass('vd-relationship'),
			                    selectedItems: $matrix.SELECTED_ITEMS,
			                    selectedItemsCount: Object.keys($matrix.SELECTED_ITEMS).length,
			                    relationshipsData: $matrix.TABLE.LOADED_RELATIONSHIPS,
			                    selectedRelationships: $matrix.SELECTED_RELATIONSHIPS,
			                    selectedRelationshipsCount: Object.keys($matrix.SELECTED_RELATIONSHIPS).length
			                }
			            };

			            return {
                            items: $matrix.API.onCellContextMenu(contextMenuReturn)
			            }
			        }
			    });
			}

			/*
                Axis:
                I - Updating rows axis (adding / removing vertical class, setting correct height & updating dom
                II - Updating columns axis (adding / removing vertical class, setting correct height & updating dom
            */
		    // I:
			$(activeMatrixes[this.MATRIX_ID].selectors.rowsAxis)[($yAxis.HORIZONTAL ? 'remove' : 'add') + 'Class']('vd-vertical')
            [($yAxis.SHOW_TEXT && !$yAxis.SHOW_ICON ? 'add' : 'remove') + 'Class']('vd-no-icons')
            .css('height', (($yAxis.HORIZONTAL ? CONST.FIXED_CELL_HEIGHT : $yAxis.ITEM_WIDTH(true)) * $yAxis.DATA.length) + 'px')
            .html(rowAxisHtml);
			$($yAxis.SELECTOR).css({
			    'width': ($yAxis.HORIZONTAL ? $yAxis.ITEM_WIDTH(true) : CONST.FIXED_CELL_HEIGHT) + 'px',
			    'top': (($xAxis.HORIZONTAL ? CONST.FIXED_CELL_HEIGHT : $xAxis.ITEM_WIDTH(true)) + CONST.FIXED_CELL_HEIGHT) + 'px'
			});

			// II:
			$(activeMatrixes[this.MATRIX_ID].selectors.columnsAxis)[($xAxis.HORIZONTAL ? 'remove' : 'add') + 'Class']('vd-vertical')
            [($xAxis.SHOW_TEXT && !$xAxis.SHOW_ICON ? 'add' : 'remove') + 'Class']('vd-no-icons')
            .css('width', (($xAxis.HORIZONTAL ? $xAxis.ITEM_WIDTH(true) : CONST.FIXED_CELL_HEIGHT) * $matrix.X_AXIS.DATA.length) + 'px')
            .html(columnsAxisHtml);
			$($xAxis.SELECTOR).css({
			    'height': ($xAxis.HORIZONTAL ? CONST.FIXED_CELL_HEIGHT : $xAxis.ITEM_WIDTH(true)) + 'px',
			    'left': (($yAxis.HORIZONTAL ? $yAxis.ITEM_WIDTH(true) : CONST.FIXED_CELL_HEIGHT) + CONST.FIXED_CELL_HEIGHT)+ 'px'
			});

			/*
                Shadows:
                I - Updating absolute positions & opacity
            */
			// I:
            var rowShadowOpacity = ($tableScrollLeft / (this.ALL_AVAILABLE_WIDTH - this.WIDTH)) * 100;
            $(activeMatrixes[this.MATRIX_ID].selectors.rowsShadow).css({
                'left': tableAndShadowPositionLeft,
                'opacity': Math.ceil(rowShadowOpacity) / 100
		    });
            var columnShadowOpacity = ($tableScrollTop / (this.ALL_AVAILABLE_HEIGHT - this.HEIGHT)) * 100;
            $(activeMatrixes[this.MATRIX_ID].selectors.columnsShadow).css({
                'top': tableAndShadowPositionTop,
                'opacity': Math.ceil(columnShadowOpacity) / 100
            });

            /*
                Rendering selected items + getting relationships
            */
            this.loadRelationships();
		}

	    /*
            Updating axis names
        */
		$('.vd-matrix-id-' + this.MATRIX_ID + ' .vd-columns-axis-description span').html($xAxis.DISPLAY).attr('title', $xAxis.DISPLAY);
		$('.vd-matrix-id-' + this.MATRIX_ID + ' .vd-rows-axis-description span').html($yAxis.DISPLAY).attr('title', $yAxis.DISPLAY);
	};
	var virtualizationInProgress = false;
	table.prototype.virtualize = function(direction, difference, topDistance, leftDistance) {
		if (!virtualizationInProgress) {
		    virtualizationInProgress = true;
			//For vertical scrolling
			if (direction === 'up' || direction === 'down') {
				// Small distance scroll
			    if (difference < (this.CELL_HEIGHT + this.CELL_HEIGHT / 2)) {
					// Rerendering rows
					for (var i = 0; i < this.ROWS.length; i++) {
						var row = this.ROWS[i];
						if (direction === 'down' && this.ROWS[this.FIRST_ROW_ID].DISTANCE <= topDistance) {
							if (row.DISTANCE <= topDistance && !row.UPDATING) {
								row.TOP = this.ROWS[this.LAST_ROW_ID].DISTANCE;
								row.DISTANCE = row.TOP + this.CELL_HEIGHT;
								this.LAST_ROW_ID = row.ID;
								this.FIRST_ROW_ID = row.ID + 1 < this.ROWS.length ? row.ID + 1 : 0;
								row.UPDATING = true;
								row.repaint();
							}
						}
						else if (direction === 'up' && this.ROWS[this.LAST_ROW_ID].TOP >= topDistance + this.HEIGHT) {
							if (row.TOP >= topDistance + this.HEIGHT) {
							    row.TOP = this.ROWS[this.FIRST_ROW_ID].TOP - this.CELL_HEIGHT;
								row.DISTANCE = row.TOP + this.CELL_HEIGHT;
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
				    var firstTopValue = Math.floor(topDistance / this.CELL_HEIGHT) * this.CELL_HEIGHT;
					for (var i = 0; i < this.ROWS.length; i++) {
						var row = this.ROWS[i];

						row.TOP = firstTopValue + i * this.CELL_HEIGHT;
						row.DISTANCE = row.TOP + this.CELL_HEIGHT;
						row.repaint();
					}

					this.FIRST_ROW_ID = 0;
					this.LAST_ROW_ID = this.ROWS.length - 1;
				}
			}
			//For horizontal scrolling
			else {
				// Small distance scroll
			    if (difference < (this.CELL_WIDTH + this.CELL_WIDTH / 2)) {
					// Rerendering rows
					for (var i = 0; i < this.COLUMNS.length; i++) {
						var column = this.COLUMNS[i];
						if (direction === 'right' && this.COLUMNS[this.FIRST_COLUMN_ID].DISTANCE <= leftDistance) {
						    if (column.DISTANCE <= leftDistance && !column.UPDATING && this.COLUMNS[this.LAST_COLUMN_ID].DISTANCE < this.ALL_AVAILABLE_WIDTH) {
							    column.LEFT = this.COLUMNS[this.LAST_COLUMN_ID].DISTANCE;
							    column.DISTANCE = column.LEFT + this.CELL_WIDTH;
								this.LAST_COLUMN_ID = column.ID;
								this.FIRST_COLUMN_ID = column.ID + 1 < this.COLUMNS.length ? column.ID + 1 : 0;
								column.UPDATING = true;
								column.repaint();
							}
						}
						else if (direction === 'left' && this.COLUMNS[this.LAST_COLUMN_ID].LEFT >= leftDistance + this.WIDTH) {
						    if (column.LEFT > leftDistance + this.WIDTH && (this.COLUMNS[this.FIRST_COLUMN_ID].LEFT - this.CELL_WIDTH) >= 0) {
						        column.LEFT = this.COLUMNS[this.FIRST_COLUMN_ID].LEFT - this.CELL_WIDTH;
						        column.DISTANCE = column.LEFT + this.CELL_WIDTH;
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
			        var firstLeftValue = Math.floor(leftDistance / this.CELL_WIDTH) * this.CELL_WIDTH;
					for (var i = 0; i < this.COLUMNS.length; i++) {
						var column = this.COLUMNS[i];

						column.LEFT = firstLeftValue + i * this.CELL_WIDTH;
						column.DISTANCE = column.LEFT + this.CELL_WIDTH;
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

			var columnShadowOpacity = (scrollTop / (this.ALL_AVAILABLE_HEIGHT - this.HEIGHT)) * 100;
			$(activeMatrixes[this.MATRIX_ID].selectors.columnsShadow).css('opacity', Math.ceil(columnShadowOpacity) / 100);
		}
		
		var scrollLeft = $matrixTableElement.scrollLeft();
		if (scrollLeft !== this.LEFT_SCROLL && (scrollLeft + this.WIDTH) < this.ALL_AVAILABLE_WIDTH) {
			var goingRight = scrollLeft > this.LEFT_SCROLL;
			this.virtualize(goingRight ? 'right' : 'left', goingRight ? (scrollLeft - this.LEFT_SCROLL) : ( this.LEFT_SCROLL - scrollLeft), null, scrollLeft);
			this.LEFT_SCROLL = scrollLeft;

			var rowShadowOpacity = (scrollLeft / (this.ALL_AVAILABLE_WIDTH - this.WIDTH)) * 100;
			$(activeMatrixes[this.MATRIX_ID].selectors.rowsShadow).css('opacity', Math.ceil(rowShadowOpacity) / 100);
		}

		$(activeMatrixes[this.MATRIX_ID].selectors.columnsAxis).css('left', '-' + scrollLeft + 'px');
		$(activeMatrixes[this.MATRIX_ID].selectors.rowsAxis).css('top', '-' + scrollTop + 'px');
	};
	table.prototype.enableScrolling = function() {
		// Create scroll event
		var scrollCallbackTimer,
			_self = this;
<<<<<<< cb6bf32ef5f761f30e3338eb3580855c191a2198
		$(activeMatrixes[this.MATRIX_ID].selectors.table).scroll(function(e) {
		    clearTimeout(scrollCallbackTimer);

		    if (!_self.LOADING) {
		        _self.LOADING = true;
		        $('.vd-matrix-id-' + _self.MATRIX_ID + ' .vd-progress-loader').show();
		    }

		    _self.scroll();


		    scrollCallbackTimer = setTimeout(function () {
		        var $wp = { // ViewPort
=======
		$(activeMatrixes[this.MATRIX_ID].selectors.table).on('scroll', function(e) {
			clearTimeout(scrollCallbackTimer);
			_self.scroll(e);

			scrollCallbackTimer = setTimeout(function() {
				/*
					Making sure
				*/
				var $wp = { // ViewPort
>>>>>>> Changes made
					topMin: $(activeMatrixes[_self.MATRIX_ID].selectors.table).scrollTop(),
					topMax: $(activeMatrixes[_self.MATRIX_ID].selectors.table).scrollTop() + _self.HEIGHT,
					leftMin: $(activeMatrixes[_self.MATRIX_ID].selectors.table).scrollLeft(),
					leftMax: $(activeMatrixes[_self.MATRIX_ID].selectors.table).scrollLeft() + _self.WIDTH
				};

				if ($wp.leftMax > _self.ALL_AVAILABLE_WIDTH) $wp.leftMax = _self.ALL_AVAILABLE_WIDTH;
				if ($wp.topMax > _self.ALL_AVAILABLE_HEIGHT) $wp.topMax = _self.ALL_AVAILABLE_HEIGHT;


		        // Checking if we really need to do "FIXIN"
		        var isRowsVirtualized = _self.ROWS.length * _self.CELL_HEIGHT > _self.HEIGHT,
                    isColumnsVirtualized = _self.COLUMNS.length * _self.CELL_WIDTH > _self.WIDTH;

				// Part 1 - Getting all top & left positions for stopped active view				
			    // Rows
				if (isRowsVirtualized) {
				    var rowsBehindViewportEdge = Math.ceil($wp.topMax / _self.CELL_HEIGHT) * _self.CELL_HEIGHT,
                        currentTopPositionList = [];
				    for (var i = 0; i < _self.ROWS.length; i++) {
				        rowsBehindViewportEdge -= _self.CELL_HEIGHT;
				        if (rowsBehindViewportEdge < 0) rowsBehindViewportEdge = Math.ceil($wp.topMax / _self.CELL_HEIGHT) * _self.CELL_HEIGHT + _self.CELL_HEIGHT;
				        currentTopPositionList.push(rowsBehindViewportEdge);
				    }
				}
				if (isColumnsVirtualized) {
				    // Columns
				    var columnsBehindViewportEdge = Math.ceil($wp.leftMax / _self.CELL_WIDTH) * _self.CELL_WIDTH,
                        currentLeftPositionList = [];
				    for (var i = 0; i < _self.COLUMNS.length; i++) {
				        columnsBehindViewportEdge -= _self.CELL_WIDTH;
				        if (columnsBehindViewportEdge < 0) columnsBehindViewportEdge = Math.ceil($wp.leftMax / _self.CELL_WIDTH) * _self.CELL_WIDTH + _self.CELL_WIDTH;
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
				            badRows[i].DISTANCE = currentTopPositionList[i] + _self.CELL_HEIGHT;
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
				            badColumns[i].DISTANCE = currentLeftPositionList[i] + _self.CELL_WIDTH;
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
				_self.loadRelationships();

			}, 550);
		});
	};

	table.prototype.performSelection = function () {
	    if (activeMatrixes[this.MATRIX_ID]) {
	        var matrixObj = activeMatrixes[this.MATRIX_ID].matrix;

	        // Running trough all items anc checking if they are selected
	        var loadingRows = $('.vd-matrix-id-' + this.MATRIX_ID + ' .vd-row.vd-loading');

	        for (var i = 0, b = loadingRows.length; i < b; i++) {
	            var $row = $(loadingRows[i]),
                    rowId = getId($row);


	            // Running trough all column items
	            for (var cellId = 0, c = this.COLUMNS.length; cellId < c; cellId++) {

	                var $column = $row.children('.id-' + cellId),
                        selectionString = matrixObj.TABLE.ROWS[rowId].OBJECT_ID + '_' + matrixObj.TABLE.COLUMNS[cellId].OBJECT_ID,
                        selectionStringReverse = matrixObj.TABLE.COLUMNS[cellId].OBJECT_ID + '_' + matrixObj.TABLE.ROWS[rowId].OBJECT_ID;

	                var method = (!matrixObj.SELECTED_ITEMS[selectionString] && !matrixObj.SELECTED_ITEMS[selectionStringReverse] ? 'remove' : 'add') + 'Class';

	                $column[method]('vd-selected').removeClass('vd-loading');
	            }

	            $row.removeClass('vd-loading');
	        }

	        // Additional check for selected columns if there are any missed
	        var loadingColumns = $('.vd-matrix-id-' + this.MATRIX_ID + ' .vd-column.vd-loading');
	        for (var a = 0, b = loadingColumns.length; a < b; a++) {
	            var $column = $(loadingColumns[a]),
                    cellId = getId($column),
                    rowId = getId($column.parent()),
                    selectionString = matrixObj.TABLE.ROWS[rowId].OBJECT_ID + '_' + matrixObj.TABLE.COLUMNS[cellId].OBJECT_ID,
                    selectionStringReverse = matrixObj.TABLE.COLUMNS[cellId].OBJECT_ID + '_' + matrixObj.TABLE.ROWS[rowId].OBJECT_ID;

	            var method = (!matrixObj.SELECTED_ITEMS[selectionString] && !matrixObj.SELECTED_ITEMS[selectionStringReverse] ? 'remove' : 'add') + 'Class';

	            $column[method]('vd-selected').removeClass('vd-loading');
	        }
	    }
	};

	var activeAjaxCall = null;
	table.prototype.loadRelationships = function () {
	    // Cancelling previous calls
	    if (activeAjaxCall != null) {
	        activeAjaxCall.abort();
	        activeAjaxCall = null;
	    }

	    var matrixObj = activeMatrixes[this.MATRIX_ID].matrix,
	        rowIds = [],
            columnIds = [];

	    var loadingRows = $('.vd-matrix-id-' + this.MATRIX_ID + ' .vd-row.vd-loading'),
	        loadingColumns = $('.vd-matrix-id-' + this.MATRIX_ID + ' .vd-column.vd-loading');

	    /*
            Usually scrolling is possible only to one direction,
            thats why we do relationship loading only one direction side here
        */
	    if (loadingRows.length > loadingColumns.length || loadingRows.length === loadingColumns.length) {
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
	        for (var a = 0, b = loadingColumns.length; a < b; a++) {
	            var cellId = getId($(loadingColumns[a])),
                    rowId = getId($(loadingColumns[a]).parent());

	            if (rowIds.indexOf(matrixObj.TABLE.ROWS[rowId].OBJECT_ID) < 0) rowIds.push(matrixObj.TABLE.ROWS[rowId].OBJECT_ID);
	            columnIds.push(matrixObj.TABLE.COLUMNS[cellId].OBJECT_ID);
	        }
	    }

	    if (rowIds.length > 0 && columnIds.length > 0) {
	        var _self = this,
	            affectedRelationshipElements = [
                $('.vd-matrix-id-' + this.MATRIX_ID + ' .vd-row.vd-loading .vd-column.vd-relationship'),
                $('.vd-matrix-id-' + this.MATRIX_ID + ' .vd-column.vd-loading.vd-relationship')
	        ];
	        matrixObj.API.getRelationships(rowIds, columnIds, function (resp) {
	            for (a = 0, c = affectedRelationshipElements.length; a < c; a++) {
	                // Clearing load relationships
	                var relationshipElements = affectedRelationshipElements[a];
	                for (var i = 0, b = relationshipElements.length; i < b; i++) {
	                    // Removing specific relationship classes
	                    var classString = $(relationshipElements[i]).attr('class');
	                    if (classString.indexOf('vd-relationship') >= 0) {
	                        var previousRelationshipCount = classString.split('vd-count-')[1].split(' ')[0];
	                        $(relationshipElements[i]).removeClass('vd-count-' + previousRelationshipCount).html('<span></span>');
	                    }

                        // Removing memory entry
	                    var loadedRelationshipKey = $(relationshipElements[i]).attr('data-relationship');
	                    if (!matrixObj.SELECTED_RELATIONSHIPS[loadedRelationshipKey]) delete _self.LOADED_RELATIONSHIPS[loadedRelationshipKey];

                        // Removing data attribute, class, inner DOM
	                    $(relationshipElements[i]).removeAttr('data-relationship').removeClass('vd-relationship').html('');
	                }
	            }

	            if (resp.data.item.intersectionItems && resp.data.item.intersectionItems.length > 0) {
	                for (var i = 0, b = resp.data.item.intersectionItems.length; i < b; i++) {
	                    var $relationship = resp.data.item.intersectionItems[i];
	                    var affectedCells = [];

	                    // Original cell
	                    // Finding row id
	                    var row = $.grep(matrixObj.TABLE.ROWS, function (e) {
	                        return e.OBJECT_ID === $relationship.rowObjectId;
	                    })[0];
	                    if (row) {
	                        var rowId = row.ID;

	                        // Finding cell id
	                        var column = $.grep(matrixObj.TABLE.COLUMNS, function (e) {
	                            return e.OBJECT_ID === $relationship.columnObjectId;
	                        })[0];
	                        if (column) {
	                            var columnId = column.ID;
	                            affectedCells.push($('.vd-matrix-id-' + _self.MATRIX_ID + ' .vd-row.id-' + rowId + ' .vd-column.id-' + columnId));
	                        }
	                    }

	                    // Clone cell
	                    // Finding row id
	                    var rowClone = $.grep(matrixObj.TABLE.ROWS, function (e) {
	                        return e.OBJECT_ID === $relationship.columnObjectId;
	                    })[0];
	                    if (rowClone) {
	                        var rowCloneId = rowClone.ID;
	                        // Finding cell id
	                        var columnClone = $.grep(matrixObj.TABLE.COLUMNS, function (e) {
	                            return e.OBJECT_ID === $relationship.rowObjectId;
	                        })[0];
	                        if (columnClone) {
	                            var columnCloneId = columnClone.ID;
	                            affectedCells.push($('.vd-matrix-id-' + _self.MATRIX_ID + ' .vd-row.id-' + rowCloneId + ' .vd-column.id-' + columnCloneId));
	                        }
	                    }

	                    // Pushing relationship to the relationships object
	                    if (!_self.LOADED_RELATIONSHIPS[$relationship.rowObjectId + '_' + $relationship.columnObjectId]) {
	                        $relationship.columnItem = {
	                            objectId: $relationship.columnObjectId,
	                            display: matrixObj.X_AXIS.DATA[((column ? column.LEFT : columnClone.LEFT) / _self.CELL_WIDTH)].display
	                        };
	                        $relationship.rowItem = {
	                            objectId: $relationship.rowObjectId,
	                            display: matrixObj.Y_AXIS.DATA[((row ? row.TOP : rowClone.TOP) / _self.CELL_HEIGHT)].display
	                        };
	                        _self.LOADED_RELATIONSHIPS[$relationship.rowObjectId + '_' + $relationship.columnObjectId] = $relationship;
	                    }

	                    for (var a = 0, c = affectedCells.length; a < c; a++) {
	                        var cloneRelationshipRenderExists = affectedCells[a].hasClass('vd-relationship'),
                                relationshipStringPair = $relationship.rowObjectId + '_' + $relationship.columnObjectId;
	                        if (cloneRelationshipRenderExists) {
	                            // Making sure that data-relationship attribute is different then expected
	                            var relationshipStringClonePair = affectedCells[a].attr('data-relationship');

	                            if (relationshipStringPair !== relationshipStringClonePair) {


	                                var previousCount = affectedCells[a].children('span').text();
	                                previousCount = previousCount === '' ? 1 : parseInt(previousCount);

	                                affectedCells[a].removeClass('vd-count-' + previousCount);
	                            }
	                        }
	                        var relationshipCount = $relationship.relationships.length + (cloneRelationshipRenderExists && previousCount != null ? previousCount : 0),
                                relationshipClassCount = relationshipCount < 16 ? relationshipCount : 'lots';

	                        affectedCells[a].attr('data-relationship', relationshipStringPair)
                            .addClass('vd-relationship vd-count-' + relationshipClassCount)
                            .html('<span>' + (matrixObj.TABLE.SHOW_RELATIONSHIP_COUNT && relationshipCount > 1 ? relationshipCount : '') + '</span>');
	                    }

	                }
	            }

	            _self.performSelection();

	            _self.LOADING = false;
	            $('.vd-matrix-id-' + _self.MATRIX_ID + ' .vd-progress-loader').hide();
	        });
	    }
	    else {
	        this.LOADING = false;
	        $('.vd-matrix-id-' + this.MATRIX_ID + ' .vd-progress-loader').hide();
        }
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
<<<<<<< cb6bf32ef5f761f30e3338eb3580855c191a2198
		    columns: {
		        options: {
		            width: 150,
		            horizontal: false,
		            showText: true,
		            showIcon: true,
		            clickable: false
		        }
		    },
		    rows: {
		        options: {
		            width: 150,
		            horizontal: true,
		            showText: true,
		            showIcon: true,
		            clickable: false
		        }
		    },
		    options: {
		        showRelationshipCount: false
		    },
=======
			row: {
				height: 30,
				width: 150,
				position: horizontal
			},
			column: {
				width: 150,
				height: 30,
				position: vertical
			},
>>>>>>> Changes made
			id: this.MATRIX_ID
		};
		if (!config) {
			config = defaults;
		}
		else {
		    config = $.extend(true, defaults, config);
		}

		// Appending canvas template

		// Pushing this to matrixes array
		activeMatrixes[this.MATRIX_ID] = {
			matrix: this,
			selectors: {
<<<<<<< cb6bf32ef5f761f30e3338eb3580855c191a2198
				canvas: '.vd-matrix-id-' + this.MATRIX_ID,
				table: '.vd-matrix-id-' + this.MATRIX_ID + ' > div > .vd-table',
				tableInner: '.vd-matrix-id-' + this.MATRIX_ID + ' > div > .vd-table > div',
				rowsAxis: '.vd-matrix-id-' + this.MATRIX_ID + ' > div > .vd-rows-axis > div',
				columnsAxis: '.vd-matrix-id-' + this.MATRIX_ID + ' > div > .vd-columns-axis > div',
				rowsShadow: '.vd-matrix-id-' + this.MATRIX_ID + ' > div > .vd-rows-axis-shadow',
				columnsShadow: '.vd-matrix-id-' + this.MATRIX_ID + ' > div > .vd-columns-axis-shadow'
=======
				canvas: '.matrix-id-' + this.MATRIX_ID,
				table: '.matrix-id-' + this.MATRIX_ID + ' > div > .table',
				tableInner: '.matrix-id-' + this.MATRIX_ID + ' > div > .table > div',
				columns: '.matrix-id-' + this.MATRIX_ID + ' > div > .columns-axis',
				rows: '.matrix-id-' + this.MATRIX_ID + ' > div > .rows-axis',
>>>>>>> Changes made
			}
		};
		element.html(TPL.CANVAS);

        // Mains
		this.VIEW_ID = config.viewId;
		this.API = config.options.api;

	    // Creating axis
		this.X_AXIS = new axis('columns', config.columns.items);
		this.X_AXIS.bootstrap(config);
		this.Y_AXIS = new axis('rows', config.rows.items);
		this.Y_AXIS.bootstrap(config);

	    // Setting up matrix table
		this.TABLE = new table(config);
		this.TABLE.repaint();
		this.TABLE.enableScrolling();

	    // Selected items
		this.SELECTED_ITEMS = config.selectedItems || {};
		this.SELECTED_RELATIONSHIPS = {};

	    // Setting up resizing of multiple matrixes
		if (activeMatrixes.length === 1) {
		    $(window).on('resize.vdMatrix', function () {
		        for (var i = 0; i < activeMatrixes.length; i++) {
		            activeMatrixes[i].matrix.TABLE.repaint();
		        }
		    });
		}
	};
	matrix.prototype.switch = function () {
	    var tempRowsAxis = this.Y_AXIS.DATA,
            tempRowsDisplay = this.Y_AXIS.DISPLAY;

	    this.Y_AXIS.DATA = this.X_AXIS.DATA;
	    this.X_AXIS.DATA = tempRowsAxis;

	    this.Y_AXIS.DISPLAY = this.X_AXIS.DISPLAY;
	    this.X_AXIS.DISPLAY = tempRowsDisplay;
        
	    var $selectors = activeMatrixes[this.MATRIX_ID].selectors;
	    $($selectors.table).scrollTop(0).scrollLeft(0);

	    $($selectors.tableInner).css({
	        height: (this.Y_AXIS.DATA.length * this.TABLE.CELL_HEIGHT) + 'px',
	        width: (this.X_AXIS.DATA.length * this.TABLE.CELL_WIDTH) + 'px'
	    });

	    $($selectors.rowsAxis).css('height', ((this.Y_AXIS.DATA.length + 1) * this.TABLE.CELL_HEIGHT) + 'px');
	    $($selectors.columnsAxis).css('width', ((this.X_AXIS.DATA.length + 1) * this.TABLE.CELL_WIDTH) + 'px');

	    // Api
	    if (this.API.onAxisSwtich) {
	        this.API.onAxisSwtich();
	    }

	    this.TABLE.repaint();
	};
	matrix.prototype.destroy = function() {
	    this.TABLE = null;

	    // Removing switch click event
	    $('.vd-matrix-id-' + this.MATRIX_ID + ' .vd-switcher').unbind('click');

	    // Removing attribute & matrix id
	    $('.vd-matrix-id-' + this.MATRIX_ID).removeAttr('data-vd-matrix').removeClass('vd-matrix-id-' + this.MATRIX_ID).html('');

	    // Unbind scrolling
	    $(activeMatrixes[this.MATRIX_ID].selectors.table).unbind('scroll');

	    // Unbiding context menu
	    $.contextMenu('destroy', '.vd-matrix-id-' + this.MATRIX_ID + ' .vd-column');
	};

	/*
		jQuery extend
	*/
	$.fn.matrix = function (config) {
	    if (config.action === 'create') {
	        var m = new matrix(this, config.options);
	        config.options.id = m.MATRIX_ID;

	        // Creating switch event
	        $('.vd-matrix-id-' + m.MATRIX_ID + ' .vd-switcher').click(function () {
	            m.switch();
	        });

            // Axis highlight effect
	        $('.vd-matrix-id-' + m.MATRIX_ID).on('mouseenter', '.vd-column', function () {
                // Remove previous hovers
	            $('.vd-matrix-id-' + m.MATRIX_ID + ' .vd-column-axis-item.hover').removeClass('hover');
	            $('.vd-matrix-id-' + m.MATRIX_ID + ' .vd-row-axis-item.hover').removeClass('hover');

	            var rowId = getId($(this).parent()),
                    cellId = getId($(this));

	            $('.vd-matrix-id-' + m.MATRIX_ID + ' .vd-row-axis-item.id-' + rowId).addClass('hover');
	            $('.vd-matrix-id-' + m.MATRIX_ID + ' .vd-column-axis-item.id-' + cellId).addClass('hover');
	        });
	        $('.vd-matrix-id-' + m.MATRIX_ID + ' .vd-table').mouseleave(function () {
	            $('.vd-matrix-id-' + m.MATRIX_ID + ' .vd-column-axis-item.hover').removeClass('hover');
	            $('.vd-matrix-id-' +m.MATRIX_ID + ' .vd-row-axis-item.hover').removeClass('hover');
	        });

	        // Enabling cell Selection
	        if (config.options.options.cellSelection) {
	            $('.vd-matrix-id-' + m.MATRIX_ID).on('click', '.vd-column', function () {
	                var rowId = getId($(this).parent()),
                        cellId = getId($(this)),
                        hasRelationships = $(this).hasClass('vd-relationship'),
                        matrixObj = activeMatrixes[m.MATRIX_ID].matrix,
                        selectionStringOne = matrixObj.TABLE.ROWS[rowId].OBJECT_ID + '_' + matrixObj.TABLE.COLUMNS[cellId].OBJECT_ID,
                        selectionStringTwo = matrixObj.TABLE.COLUMNS[cellId].OBJECT_ID + '_' + matrixObj.TABLE.ROWS[rowId].OBJECT_ID;

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

	                if (!matrixObj.SELECTED_ITEMS[selectionStringOne] || !matrixObj.SELECTED_ITEMS[selectionStringTwo]) {
	                    var row = matrixObj.TABLE.ROWS[rowId],
                            column = matrixObj.TABLE.COLUMNS[cellId];

	                    var selectionObject = {
	                        columnObjectId: column.OBJECT_ID,
	                        rowObjectId: row.OBJECT_ID,
	                        columnObjectTypeId: column.OBJECT_TYPE_ID,
	                        rowObjectTypeId: row.OBJECT_TYPE_ID,
	                        columnObjectName: matrixObj.X_AXIS.DATA[(column.LEFT / matrixObj.TABLE.CELL_WIDTH)].display,
	                        rowObjectName: matrixObj.Y_AXIS.DATA[(row.TOP / matrixObj.TABLE.CELL_HEIGHT)].display,
	                        modelId: matrixObj.X_AXIS.DATA[(column.LEFT / matrixObj.TABLE.CELL_WIDTH)].modelId
	                    };
	                    matrixObj.SELECTED_ITEMS[selectionStringOne] = selectionObject;

	                    if (selectionStringOne !== selectionStringTwo) {
	                        matrixObj.SELECTED_ITEMS[selectionStringTwo] = selectionObject;
	                    }

	                    if (hasRelationships) {
	                        matrixObj.SELECTED_RELATIONSHIPS[$(this).attr('data-relationship')] = angular.copy(matrixObj.TABLE.LOADED_RELATIONSHIPS[$(this).attr('data-relationship')]);
	                    }

	                    $(this).addClass('vd-selected');
	                    if (cloneElement) cloneElement.addClass('vd-selected');

	                    if (m.API.onCellSelectionChange) {
	                        m.API.onCellSelectionChange(selectionStringOne, true, matrixObj.SELECTED_ITEMS, matrixObj.SELECTED_RELATIONSHIPS, matrixObj.TABLE.LOADED_RELATIONSHIPS, m.MATRIX_ID);
	                    }
	                }
	                else {
	                    delete matrixObj.SELECTED_ITEMS[selectionStringOne];
	                    // Just to be sure we always clear the 

<<<<<<< cb6bf32ef5f761f30e3338eb3580855c191a2198
	                    if (selectionStringOne !== selectionStringTwo) {
	                        delete matrixObj.SELECTED_ITEMS[selectionStringTwo];
	                    }

	                    if (hasRelationships) {
	                        delete matrixObj.SELECTED_RELATIONSHIPS[$(this).attr('data-relationship')];
	                    }

	                    $(this).removeClass('vd-selected');
	                    if (cloneElement) cloneElement.removeClass('vd-selected');

	                    if (m.API.onCellSelectionChange) {
	                        m.API.onCellSelectionChange(selectionStringOne, false, matrixObj.SELECTED_ITEMS, matrixObj.SELECTED_RELATIONSHIPS, matrixObj.TABLE.LOADED_RELATIONSHIPS, m.MATRIX_ID);
	                    }
	                }
	            });
	        }

	        // Enabling axis items clicking
	        if (config.options.columns.options.clickable && m.API.openAxisItem) {
	            $('.vd-matrix-id-' + m.MATRIX_ID).on('click', '.vd-column-axis-item span', function () {
	                var columnId = getId($(this).parent().parent());
	                m.API.openAxisItem(m.TABLE.COLUMNS[columnId].OBJECT_ID);
	            });
	        }
	        if (config.options.rows.options.clickable && m.API.openAxisItem) {
	            $('.vd-matrix-id-' + m.MATRIX_ID).on('click', '.vd-row-axis-item span', function () {
	                var rowId = getId($(this).parent().parent());
	                m.API.openAxisItem(m.TABLE.ROWS[rowId].OBJECT_ID);
	            });
	        }

	        // Firing on initialize method
	        if (m.API.onInitialized) {
	            m.API.onInitialized();
            }

	    }
	    else {
	        var MATRIX_ID = getId($(this)),
                matrixObj = activeMatrixes[MATRIX_ID].matrix;

	        switch (config.action) {

	            case 'destroy':
	                matrixObj.destroy();
	                activeMatrixes.splice(MATRIX_ID, 1);

	                if (activeMatrixes.length === 0) {
	                    $(window).unbind('resize.vdMatrix');
	                }
	            break;

	            case 'updateAxis':
	                var axis = (config.options.type === 'rows' ? 'Y' : 'X') + '_AXIS';
	                matrixObj[axis].bootstrap(config.options.options);
	                matrixObj.TABLE.repaint(true);
	            break;

	            case 'clearSelection':
	                matrixObj.SELECTED_ITEMS = {};
	                matrixObj.SELECTED_RELATIONSHIPS = {};
	                $('.vd-matrix-id-' + MATRIX_ID + ' .vd-column.vd-selected').removeClass('vd-selected');
	                matrixObj.API.onCellSelectionChange('', false, '', '', {}, MATRIX_ID);
	            break;

	            case 'selectionContext':
	                var context = {
	                    selectedItems: matrixObj.SELECTED_ITEMS,
	                    selectedItemsCount: Object.keys(matrixObj.SELECTED_ITEMS).length,
	                    selectedRelationships: matrixObj.SELECTED_RELATIONSHIPS,
	                    selectedRelationshipsCount: Object.keys(matrixObj.SELECTED_RELATIONSHIPS).length,
	                    relationshipsData: matrixObj.TABLE.LOADED_RELATIONSHIPS
	                };

	                if (config.element) {
	                    var rowId = getId($(config.element).parent()),
                            cellId = getId($(config.element)),
                            hasRelationships = $(config.element).hasClass('vd-relationship'),
                            column = matrixObj.TABLE.COLUMNS[cellId],
                            row = matrixObj.TABLE.ROWS[rowId];

	                    context.item =  {
	                        isRelated: hasRelationships,
	                        isSelected: matrixObj.SELECTED_ITEMS[matrixObj.SELECTED_ITEMS[matrixObj.TABLE.ROWS[rowId].OBJECT_ID + '_' + matrixObj.TABLE.COLUMNS[cellId].OBJECT_ID]] != null || matrixObj.SELECTED_ITEMS[matrixObj.SELECTED_ITEMS[matrixObj.TABLE.COLUMNS[cellId].OBJECT_ID + '_' + matrixObj.TABLE.ROWS[rowId].OBJECT_ID]] != null,
	                        columnItemId: column.OBJECT_ID,
                            columnObjectTypeId: column.OBJECT_TYPE_ID,
	                        columnItemName: matrixObj.X_AXIS.DATA[(column.LEFT / matrixObj.TABLE.CELL_WIDTH)].display,
	                        rowItemId: row.OBJECT_ID,
                            rowObjectTypeId: row.OBJECT_TYPE_ID,
	                        rowItemName: matrixObj.Y_AXIS.DATA[(row.TOP / matrixObj.TABLE.CELL_HEIGHT)].display,
	                        pairStringOne: row.OBJECT_ID + '_' + column.OBJECT_ID,
	                        pairStringTwo: column.OBJECT_ID + '_' + row.OBJECT_ID,
	                        modelId: matrixObj.X_AXIS.DATA[(column.LEFT / matrixObj.TABLE.CELL_WIDTH)].modelId
	                    }
	                }
                
	                return context;
	            break;

	            case 'repaint':
	                if (!config.element) matrixObj.TABLE.repaint();
	                else matrixObj.TABLE.loadRelationships();
	                break;

	            case 'setLoader':
	                matrixObj.TABLE.LOADING = config.value;
	                $('.vd-matrix-id-' + MATRIX_ID + ' .vd-progress-loader')[config.value ? 'hide' : 'show']();
	            break;

	            case 'deSelectRelationships':
	                for (var i = 0, b = config.items.length; i < b; i++) {
	                    delete matrixObj.SELECTED_ITEMS[config.items[i]];
	                }
	                matrixObj.API.onCellSelectionChange('', false, '', '', {}, MATRIX_ID);
	            break;

	            case 'updateCellSettings':
	                matrixObj.TABLE.SHOW_RELATIONSHIP_COUNT = config.options.showRelationshipCount;
	                $('.vd-matrix-id-' + MATRIX_ID + ' .vd-row').addClass('vd-loading');
	                matrixObj.TABLE.repaint(true);
	            break;

	            case 'rebindAxis':
	                matrixObj.X_AXIS.DATA = config.options.columns.items;
	                matrixObj.Y_AXIS.DATA = config.options.rows.items;
	                matrixObj.TABLE.repaint(true);
	            break;
	        }
        }

        return this;
    };

})(jQuery);
=======
$('#matrix-container').matrix({
	row: {
		height: 30,
		width: 150,
		position: horizontal
	},
	column: {
		width: 150,
		height: 30,
		position: vertical
	}
});
>>>>>>> Changes made
