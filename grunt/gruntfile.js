///////////////////////////////////////////////////////////////
module.exports = function(grunt) {
  // PROJECT CONFIGURATION ////////////////////
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    // CSSMIN TASKS ///////////
    cssmin: {
      combine: {
        files: {
          '../derjyn.css': ['../build/bones.min.css','../build/flesh.min.css','../build/style.css']
        }
      }
    },
    // UGLIFY TASKS ///////////
    uglify: {
      dist: {
        options: {
          mangle: false
        },
        files: {
          '../derjyn.min.js': ['../build/starscroll.min.js','../build/jquery.idTabs.min.js','../build/derjyn.js']
        }
      }
    },
    // PROCESSHTML TASKS //////
    processhtml: {
      dist: {
        files: {    
          '../index.html': '../build/index.html'
        }
      }
    }
  });

  // LOAD PLUGINS /////////////////////////////
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-processhtml');

  // DEFAULT TASKS ////////////////////////////
  grunt.registerTask('default', ['processhtml','cssmin','uglify']);
};
// EOF ////////////////////////////////////////////////////////