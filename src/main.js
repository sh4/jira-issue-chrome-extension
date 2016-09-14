import * as options from "./lib/options";
import * as jira from "./lib/jira";
import * as stash from "./lib/stash";
chrome.contextMenus.create({
    title: "Create JIRA Issue",
    id: "create-jira-issue",
    contexts: ["selection"],
    enabled: true,
});
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId !== "create-jira-issue") {
        return;
    }
    options.Options
        .get(chrome.storage.local)
        .then(opts => {
        const jiraAPI = new jira.JIRA(opts.jiraUrl);
        // FIXME: 前回と異なる設定のときだけプロジェクトに関する設定を取得する
        return Promise.all([
            jiraAPI.getProject(opts.jiraProject).then(p => {
                return {
                    options: opts,
                    api: jiraAPI,
                    project: p,
                };
            }),
            jiraAPI.getMyself(),
        ]);
    })
        .then(results => {
        const r = results[0];
        const opts = r.options;
        const user = results[1];
        const selectionText = info.selectionText || "";
        const macroVars = {
            "SELECTED-TEXT": selectionText,
        };
        const summary = opts.expandMacro(opts.jiraIssueSummary || "", macroVars);
        const description = opts.expandMacro(opts.jiraIssueDescription || "", macroVars);
        const issueUrl = r.api.issueUrl({
            pid: r.project.id,
            issuetype: opts.jiraIssueType,
            summary: summary,
            description: description,
            reporter: user.name,
            assignee: user.name,
        });
        chrome.tabs.create({
            url: issueUrl,
        }, (tab) => {
            const issueTabId = tab.id;
            const sessionId = `session_${(+new Date()).toString(16)}`;
            const onceMessageListener = (msg, sender, res) => {
                if (!msg) {
                    return;
                }
                if (msg.sessionId !== sessionId) {
                    return;
                }
                chrome.runtime.onMessage.removeListener(onceMessageListener);
                const branchName = opts.expandMacro(msg.branchName, {
                    "SELECTED-TEXT": selectionText,
                    "JIRA-KEY": msg.jiraIssueKey || "",
                }) || "";
                const startPointBranchName = opts.jiraIssueStartPointBranchName || "";
                if (branchName === "" || startPointBranchName === "") {
                    return;
                }
                const stashAPI = new stash.Stash(opts.stashUrl);
                stashAPI
                    .createBranch(opts.stashProject, opts.stashRepository, branchName, startPointBranchName)
                    .then(r => {
                    res(r);
                }, err => {
                    res({ error: err });
                });
                return true;
            };
            const listener = (tabId, info) => {
                if (tabId !== issueTabId || info.status !== "complete") {
                    return;
                }
                chrome.storage.local.get(sessionId, sessions => {
                    if (sessions && sessions[sessionId]) {
                        // 課題作成後の画面
                        chrome.storage.local.remove(sessionId);
                        chrome.tabs.onUpdated.removeListener(listener);
                        chrome.runtime.onMessage.addListener(onceMessageListener);
                        chrome.tabs.sendMessage(tabId, sessions[sessionId]);
                    }
                    else {
                        // 課題新規作成の画面
                        chrome.tabs.sendMessage(tabId, {
                            sessionId: sessionId,
                            enableJiraIssueCreateHelper: true,
                            branchName: opts.jiraIssueBranchName,
                            selectionText: selectionText,
                        });
                    }
                });
            };
            chrome.tabs.onUpdated.addListener(listener);
        });
    })
        .catch((err) => {
        alert(`${err.message}`);
    });
});
