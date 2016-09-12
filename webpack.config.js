module.exports = {
    entry: {
        main: __dirname + "/src/main.js",
        options: __dirname + "/src/options.js",
        contentBrowseIssue: __dirname + "/src/content/browseIssue.js",
        contentCreateIssueForm: __dirname + "/src/content/createIssueForm.js",
    },

    output: {
        filename: "[name].js",
        path: __dirname + "/chrome"
    },

    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader"
            }
        ]
    },

    //devtool: "source-map",

};
