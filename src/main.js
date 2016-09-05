/*
chrome.runtime.onMessage.addListener( (msg, sender) => {
    if (msg.from === "content" && msg.subject === "create-issue-"
});
*/


chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId !== "create-jira-issue") {
        return;
    }
    //info.selectionText
    var lastOpenTabId = 0;
    const url = "http://localhost:2990/jira/secure/CreateIssueDetails!init.jspa?pid=10000&issuetype=10000&summary=hoge&description=fuga&reporter=admin&assignee=admin";
    const sendMessage = (tabId) => {
        chrome.tabs.sendMessage(tabId, {
            from: "content",
            subject: "hoge",
        });
    };
    chrome.tabs.onUpdated.addListener((tabId, info) => {
        if (tabId === lastOpenTabId && info.status === "complete") {
            sendMessage(tabId);
        }
    });
    chrome.windows.create({
        url: url,
        type: "popup",
    }, (window) => {
        lastOpenTabId = window.tabs[0].id;
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
