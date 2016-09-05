(() => {

chrome.storage.local.get("createNewIssue", (value) => {
    if (!value.createNewIssue) {
        return;
    }
    chrome.storage.local.remove("createNewIssue");
    var issueKeyMeta = document.querySelector('meta[name="ajs-issue-key"]');
    if (issueKeyMeta === null) {
        return;
    }
    var jiraIssue = issueKeyMeta.getAttribute("content");

    alert("Created:" + jiraIssue);

    // https://developer.atlassian.com/static/rest/stash/3.11.6/stash-branch-utils-rest.html
    
});

})();
