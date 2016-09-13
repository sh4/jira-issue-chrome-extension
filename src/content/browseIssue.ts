import * as options from "../lib/options";
import * as stash from "../lib/stash";

declare var AJS:any;

chrome.runtime.onMessage.addListener( (msg, sender, response) => {
    if (!msg) {
        return;
    }
    if (msg.createNewIssue !== true) {
        return;
    }
    var issueKeyMeta = document.querySelector('meta[name="ajs-issue-key"]');
    if (issueKeyMeta === null) {
        return;
    }
    var jiraIssueKey = issueKeyMeta.getAttribute("content");

    chrome.runtime.sendMessage({
        sessionId: msg.sessionId,
        branchName: msg.branchName,
        jiraIssueKey: jiraIssueKey,
    }, (r) => {
        r || (r = {});
        if (r.error) {
            if (r.error.message) {
                alert(r.error.message);
            }
            return;
        }
        console.log(r);
        /*
        if (AJS.flag) {
            AJS.flag({
                type: "info",
                title: "ブランチを作成しました。",
                body: "hoge"
            });
        } else {
            // ブランチつくった
        }
        */
    });  
});

