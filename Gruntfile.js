module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    jshint: {
        all: {
          src: ['Gruntfile.js', 'lib/*.js', 'index.js'],
        },
        options: {
          jshintrc: '.jshintrc'
        }
    },
    watch: {
      lib: {
        files: '<%= jshint.all.src %>',
        tasks: ['jshint:all']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  grunt.registerTask('default', ['jshint']);
};
