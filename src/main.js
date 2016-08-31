chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId !== "create-jira-issue") {
        return;
    }
    //info.selectionText
    const url = "http://localhost:2990/jira/secure/CreateIssueDetails!init.jspa?pid=10000&issuetype=10000&summary=hoge&description=fuga&reporter=admin&assignee=admin";
    chrome.windows.create({
        url: url,
        type: "popup",
    }, (window) => {

    });
    /*
    var iframe = document.createElement("iframe");
    iframe.setAttribute("src", url);
    iframe.setAttribute("frameborder", "0");
    iframe.style.border = "none";
    iframe.style.width = "80%";
    iframe.style.height = "25em";
    document.body.appendChild(iframe);
    */
});
chrome.contextMenus.create({
    title: "Create JIRA Issue",
    id: "create-jira-issue",
    contexts: ["selection"]
});
