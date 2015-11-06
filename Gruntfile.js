module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    browserify: {
        app: {
            src: ['src/js/main.js'],
            dest: 'dist/js/app.js'
        }
    },

    watch: {
      scripts: {
        files: ['Gruntfile.js', 'src/js/**/*.js', 'src/modules/*/*.js'],
        tasks: ['jshint', 'browserify'],
        options: {
          spawn: false,
        },
      },
      scss: {
        files: ['src/scss/*.scss', 'src/modules/*/*.scss'],
        tasks: ['sass'],
        options: {
          spawn: false,
        },
      },
      html: {
        files: ['src/*.html', 'src/modules/*/*.html'],
        tasks: ['includes'],
      },
      bower: {
        files: ['/bower_components/*'],
        tasks: ['wiredep']
      }
    },

    browserSync: {
        bsFiles: {
            src : ['dist/js/app.js', 'dist/*.html', 'dist/css/*.css']
        },
        options: {
            watchTask: true,
            server: {
                baseDir: 'dist',
                routes: {
                    "/bower_components": "bower_components"
                }
            }
        }
    },

    wiredep: {
      task: {
        src: [
          'src/*.html'
        ],
      }
    },

    copy: {
      txtXml: {
        files: [
          {expand: true, cwd: 'src', src: ['*.txt', '*.xml'], dest: 'dist'},
        ],
      },
      images: {
        files: [
          {expand: true, cwd: 'src', src: ['*.png', '*.jpg', '*.gif'], dest: 'dist'},
          {expand: true, cwd: 'src/img', src: ['*.png', '*.jpg', '*.gif'], dest: 'dist/img'},
        ],
      },
      jsVendor: {
        files: [
          {expand: true, cwd: 'src/js/vendor', src: ['*.js'], dest: 'dist/js/vendor'}
        ],
      }
    },

    sass: {
        options: {
            sourceMap: true
        },
        main: {
            files: {
                'dist/css/styles.css': 'src/scss/styles.scss'
            }
        }
    },

    jshint: {
      files: [
              'Gruntfile.js',
              'src/js/**/*.js',
              'src/modules/*/*.js',
              '!src/js/vendor/*.js'
              ],
      options: {
          jshintrc: '.jshintrc'
      }
    },

    clean: {
      dist: ['dist'],
    },

    includes: {
      files: {
        src: ['src/*.html'], // Source files
        dest: 'dist', // Destination directory
        flatten: true,
        cwd: '.',
        options: {
          silent: true
        }
      }
    }

  });

  require('load-grunt-tasks')(grunt);

  // Default task(s).
  grunt.registerTask('default', ['clean', 'wiredep', 'copy', 'includes', 'browserify', 'sass', 'browserSync', 'watch']);

};
