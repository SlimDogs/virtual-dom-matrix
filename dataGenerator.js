// Server modules
var express = require('express');
var bodyParser = require('body-parser');

//(function() {

	var CONST = {};
	CONST.DEFAULT_ROW_COUNT = 10000;
	CONST.DEFAULT_COLUMN_COUNT = 10000;

	function dataGenerator(rowCount, columnCount, relationshipsEnabled) {
		this.rowCount = rowCount || CONST.DEFAULT_ROW_COUNT;
		this.columnCount = columnCount || CONST.DEFAULT_COLUMN_COUNT;
		this.relationshipRendering = relationshipsEnabled || true;

		this.ROW_AXIS = [];
		this.COLUMN_AXIS = [];
	};

	dataGenerator.prototype.generate = function() {
		for (var i = 0; i < this.rowCount; i++) {
			this.ROW_AXIS.push({
				name: 'Row Object #' + i,
				id: '000_' + i
			});

			this.COLUMN_AXIS.push({
				name: 'Column Object #' + i,
				id: '000_' + i
			});

		}
	};

	dataGenerator.prototype.getRelationships = function(rowsCount, columnsCount) {
		if (rowsCount && columnsCount) {
			var relationships = [];

			for (var a = 0; a < rowsCount; a++) {
				relationships.push([]);

				for (b = 0; b < columnsCount; b++) {
					relationships[a].push(Math.floor((Math.random() * 2) + 1) === 2 ? Math.floor((Math.random() * 20) + 1) : null);
				} 
			}


			this.RELATIONSHIPS = relationships;
		}
	};

	dataGenerator.prototype.reset = function() {
		this.ROW_AXIS = [];
		this.COLUMN_AXIS = [];

		this.RELATIONSHIPS = [];
	};

	var generator = new dataGenerator();

//})();

// App logic
var app = express();
var port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', express.static(__dirname));

// Routes
// Get axis
app.get('/axis', function (req, res) {
	generator.generate();

	var jsonObj = {
		"Rows": generator.ROW_AXIS,
		"Columns": generator.COLUMN_AXIS
	};

	res.json(jsonObj);
	generator.reset();
});
// Get relationships
app.get('/relationships/:rowsCount/:columnsCount', function (req, res) {
	console.log(req.params);
	generator.getRelationships(parseInt(req.params.rowsCount), parseInt(req.params.columnsCount));

	var jsonObj = {
		"Relationships": generator.RELATIONSHIPS
	};

	res.json(jsonObj);
	generator.reset();
});

// Error handler
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(400).send(err.message);
});

app.listen(port, function () {
  console.log('Matrix Data Generator is running on port: ' + port);
});