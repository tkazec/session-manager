module.exports = function (grunt) { "use strict";

grunt.initConfig({
	options: {
		less: {
			paths: ["styles"]
		}
	},
	clean: ["dist"],
	less: {
		all1: {
			files: {
				"dist/styles/popup.css": "styles/popup.less"
			}
		},
		all2: {
			files: {
				"dist/styles/options.css": "styles/options.less"
			}
		}
	},
	jade: {
		"dist": ["popup.jade", "options.jade"]
	},
	watch: {
		files: ["!(dist)", "!(dist)/**"],
		tasks: "default"
	}
});

grunt.loadTasks(require.resolve("grunt-contrib").replace("grunt.js", "tasks"));

grunt.registerTask("copy", "Copy static files.", function (gaid) {
	grunt.file.copy("manifest.json", "dist/manifest.json");
	
	grunt.file.expandFiles(["images/**", "scripts/**"]).forEach(function (file) {
		grunt.file.copy(file, "dist/" + file);
	});
});

grunt.registerTask("default", "clean copy less jade");

};