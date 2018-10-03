module.exports = function (grunt) {

    grunt.initConfig({
        uglify: {
            dist: {
                files: {'build/js/viewer3D.js': 'build/js/script.js'}
            }
        },
        concat: {
            dev: {
                src: ['build/js/script.js'],
                dest: 'build/js/viewer3D.js'
            },
            sass: {
                src: ['src/css/**/*.*css'],
                dest: 'build/css/viewer3D.scss'
            }
        },
        browserify: {
            dist: {
                files: {
                    'build/js/script.js': ['src/js/**/*.js']
                },
                options: {
                    browserifyOptions: {standalone: 'Viewer3D'}
                }
            },
            global: {
                files: {
                    'build/js/script.js': ['src/js/**/*.js', 'src/js/global.jscript']
                },
                options: {}
            },
        },
        babel: {
            dist: {
                options: {
                    sourceMap: false,
                    presets: ['es2015'],
                    compact: false
                },
                files: {
                    "build/js/script.js": "build/js/script.js"
                }
            }
        },
        clean: {
            dist: {
                src: ['build/js/script.js','build/css/viewer3D.scss']
            }
        },
        watch: {
            dev: {
                files: ['src/js/**/*.js'],
                tasks: ['dev'],
                options: {
                    interrupt: true,
                    atBegin: true
                }
            }
        },
        copy: {
            dist: {
                files: [
                    // includes files within path
                    {src: 'src/assets.json', dest: 'build/assets.json'},
                    {expand: true, src: '**', cwd: 'src/img/', dest: 'build/img/'},
                    {expand: true, src: '**', cwd: 'www/', dest: 'build/'},
                    {expand: true, src: '**', cwd: 'src/models/', dest: 'build/models/'},
                    {expand: true, src: '**', cwd: 'src/fonts/', dest: 'build/fonts/'},
                    {expand: true, src: '**', cwd: 'src/shaders/', dest: 'build/shaders/'}
                ]
            }
        },
        sass: {
            options: {
                sourceMap: false
            },
            dist: {
                files: {
                    'build/css/viewer3D.css': 'build/css/viewer3D.scss'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-sass');


    grunt.registerTask('build', ['browserify:dist', 'babel', 'uglify', 'concat:sass', 'sass', 'copy', 'clean']);
    grunt.registerTask('pretty', ['browserify:dist', 'babel', 'concat', 'sass', 'copy', 'clean']);
    grunt.registerTask('global', ['browserify:global', 'babel', 'uglify', 'concat:sass', 'sass', 'copy', 'clean']);
    grunt.registerTask('default', ['build']);
    grunt.registerTask('dev', ['browserify:dist', /*'babel',*/ 'concat', 'sass', 'copy', 'clean']);
};
