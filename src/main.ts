import * as options from "./lib/options"
import * as jira from "./lib/jira"

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
            
            const selectionText = info.selectionText;
            const macroVars: { [key: string]:string } = {
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
            chrome.windows.create({
                url: issueUrl,
                type: "popup",
            }, (window) => {
                const issueTabId = window.tabs[0].id;
                const sessionId = `session_${(+new Date()).toString(16)}`;
                const listener = (tabId, info) => {
                    if (tabId !== issueTabId || info.status !== "complete") {
                        return;
                    }
                    chrome.storage.local.get(sessionId, sessions => {
                        if (sessions && sessions[sessionId]) {
                            // 課題作成後の画面
                            chrome.storage.local.remove(sessionId);
                            chrome.tabs.onUpdated.removeListener(listener);
                            chrome.tabs.sendMessage(tabId, sessions[sessionId]);
                        } else {
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
        .catch((err:Error) => {
            alert(`${err.message}`);
        });
});
