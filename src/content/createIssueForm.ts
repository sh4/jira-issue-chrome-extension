chrome.runtime.onMessage.addListener( (msg, sender, response) => {
    if (!msg) {
        return;
    }
    if (msg.enableJiraIssueCreateHelper !== true) {
        return;
    }

    const session = {};
    session[msg.sessionId] = {
        createNewIssue: true,
        branchName: msg.branchName || "",
        selectionText: msg.selectionText || "",
    };
    chrome.storage.local.set(session);
    
    const formEl = document.querySelector("#issue-create");
    const formContentEl = formEl.querySelector('.form-body');
    const branchNameEl = document.createElement("div");
    branchNameEl.className = "field-group";
    branchNameEl.innerHTML = `
        <label for="topicbranch_name">ブランチ名</label>
        <input class="text long-field" id="topicbranch_name" type="text" value="">
        <div class="description">Stash 上で作成するブランチ名です。空の場合は作成をスキップします。</div>
    `;
    const branchNameInputEl = <HTMLInputElement>branchNameEl.querySelector("#topicbranch_name");
    branchNameInputEl.value = msg.branchName || "";
    branchNameInputEl.addEventListener("change", () => {
        session[msg.sessionId].branchName = branchNameInputEl.value;
        chrome.storage.local.set(session);
    });
    formContentEl.appendChild(branchNameEl);
});
