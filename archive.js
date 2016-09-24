const process  = require("process");
const fs = require("fs");
const archiver = require("archiver");
const zipArchive = archiver("zip");

zipArchive.pipe(fs.createWriteStream(__dirname + "/chrome.zip"));
zipArchive.bulk([ 
    {
        src: [
            "**/*.js",
            "**/*.html",
            "icons/**",
            "manifest.json",
        ],
        cwd: __dirname + "/chrome",
        expand: true,
    },
]);
zipArchive.finalize();
