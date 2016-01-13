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
                tasks: ['jshint', 'clean:js', 'copy:jsVendor', 'browserify', /*'uglify',*/ 'cacheBust'],
                options: {
                    spawn: false,
                },
            },
            scss: {
                files: ['src/scss/*.scss', 'src/modules/*/*.scss'],
                tasks: ['clean:css', 'sass', 'postcss', 'cacheBust'],
                options: {
                    spawn: false,
                },
            },
            html: {
                files: ['src/*.html', 'src/modules/*/*.html'],
                tasks: ['includes', 'cacheBust'],
            },
            bower: {
                files: ['/bower_components/*'],
                tasks: ['wiredep', 'cacheBust']
            },
            images: {
                files: ['src/img/*.{jpg,gif,svg,png}'],
                tasks: ['copy:images', 'cacheBust']
            }
        },

        browserSync: {
            bsFiles: {
                src: ['dist/js/app.js', 'dist/*.html', 'dist/css/*.css']
            },
            options: {
                watchTask: true,
                ghostMode: false,
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
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: ['*.txt', '*.xml'],
                    dest: 'dist'
                }, ],
            },
            images: {
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: ['*.{jpg,gif,svg,png}'],
                    dest: 'dist'
                }, {
                    expand: true,
                    cwd: 'src/img',
                    src: ['*.{jpg,gif,svg,png}'],
                    dest: 'dist/img'
                }, ],
            },
            jsVendor: {
                files: [{
                    expand: true,
                    cwd: 'src/js/vendor',
                    src: ['*.js'],
                    dest: 'dist/js/vendor'
                }],
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
            css: ['dist/css'],
            js: ['dist/js'],
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
        },

        postcss: {
            options: {
                map: {
                    inline: false, // save all sourcemaps as separate files...
                    annotation: 'dist/css/maps/' // ...to the specified directory
                },

                processors: [
                    require('pixrem')(), // add fallbacks for rem units
                    require('autoprefixer')({
                        browsers: 'last 2 versions'
                    }), // add vendor prefixes
                    require('cssnano')() // minify the result
                ]
            },
            dist: {
                src: 'dist/css/*.css'
            }
        },

        uglify: {
            dist: {
                files: {
                    'dist/js/app.min.js': ['dist/js/app.js']
                }
            }
        },

        cacheBust: {
            options: {
                encoding: 'utf8',
                algorithm: 'md5',
                length: 16,
                deleteOriginals: false,
                enableUrlFragmentHint: true,
                removeUrlFragmentHint: true
            },
            assets: {
                files: [{
                    src: ['dist/css/styles.css', 'dist/index.html']
                }]
            }
        }

    });

    require('load-grunt-tasks')(grunt);

    // Default task(s).
    grunt.registerTask('default', ['clean', 'wiredep', 'copy', 'includes', 'browserify', /*'uglify',*/ 'sass', 'postcss', 'cacheBust', 'browserSync', 'watch']);

};
