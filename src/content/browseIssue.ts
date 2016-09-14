import * as options from "../lib/options";

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
        options.Options.get(chrome.storage.local).then(opts => {
            const stashUrl = opts.stashUrl + (opts.stashUrl.substr(-1, 1) !== "/" ? "/" : "");
            const title = "ブランチを作成しました";
            const body = `
                ブランチ <input class="text" style="padding:4px" type="text" value="${r.displayId}" onfocus="this.select()"> を作成しました。 
                <a href="${stashUrl}projects/${opts.stashProject}/repos/${opts.stashRepository}/commits?until=${encodeURIComponent(r.id)}" target="_blank">Stash 上で確認</a>
            `;
            const div = document.createElement("div");
            div.style.position = "absolute";
            div.style.top = "20px";
            div.style.left = "50%";
            div.style.zIndex = "10";
            div.innerHTML = `<div style="position:relative;left:-50%">
                <div class="aui-message aui-message-info info closeable shadowed">
                    <p class="title"><strong>${title}</strong></p>
                    <p>${body}</p>
                    <span class="aui-icon icon-close" role="button" tabindex="0"></span>
                </div>
            </div>`;
            div.querySelector(".icon-close").addEventListener("click", () => {
                document.body.removeChild(div);
            });
            document.body.appendChild(div);
        });
    });
});

