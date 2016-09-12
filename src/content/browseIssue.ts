import * as options from "./lib/options";
import * as stash from "./lib/stash";

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
    options.Options.get(chrome.storage.local)
        .then(opts => {
            const branchName = opts.expandMacro(msg.branchName, {
                "SELECTED-TEXT": msg.selectionText || "",
                "JIRA-KEY": jiraIssueKey || "",
            });
            const stashAPI = new stash.Stash(opts.stashUrl);
            return stashAPI.createBranch(opts.stashProject, opts.stashRepository, branchName);
        })
        .then(b => {
            // ブランチつくった
            console.log(b);
        });
});

