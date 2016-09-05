chrome.runtime.onMessage.addListener( (msg, sender, response) => {
    if (msg.from === "content" && msg.subject === "hoge") {
        chrome.storage.local.set({ "createNewIssue": true }, () => {
        });
    }
});
