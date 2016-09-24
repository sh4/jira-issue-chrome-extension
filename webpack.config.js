module.exports = {
    entry: {
        main: __dirname + "/src/main.ts",
        options: __dirname + "/src/options.ts",
        contentBrowseIssue: __dirname + "/src/content/browseIssue.ts",
        contentCreateIssueForm: __dirname + "/src/content/createIssueForm.ts",
    },

    output: {
        filename: "[name].js",
        path: __dirname + "/chrome"
    },

    resolve: {
        extensions: ["", ".ts", ".tsx", ".js"]
    },

    module: {
        loaders: [
            {
                test: /\.tsx?$/,
                include: /src/,
                loaders: ["babel", "ts"]
            }
        ],

        preLoaders: [
            { test: /\.js$/, loader: "source-map-loader" }
        ],
    },

    devtool: "source-map",
};
