module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		sass: {
			dist: {
				options: {
					sourceMap: true,
					outputStyle: 'compressed'
				},
				files: {
					'Styles/matrix.css': 'Styles/app.scss'
				}
			}
		},
		watch: {
			css: {
				files: 'Styles/*.scss',
				tasks: ['sass:dist']
			}
		},
		notify_hooks: {
			options: {
				enabled: true,
				max_jshint_notifications: 5,
				title: 'Virtual DOM Matrix',
				success: false,
				duration: 3
			}
		}
	});

	grunt.loadNpmTasks('grunt-sass');

	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.loadNpmTasks('grunt-notify');

	grunt.task.run('notify_hooks');

	grunt.registerTask('default', ['sass:dist', 'watch']);

};