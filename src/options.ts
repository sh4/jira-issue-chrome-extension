import * as options from "./lib/options";
import * as jira from "./lib/jira";
import * as stash from "./lib/stash";

var saveFlashTimer = null;

const setOptionValues = (options) => {
    const optElems = document.querySelectorAll(".option-value");
    Array.prototype.forEach.call(optElems, el => {
        options[el.getAttribute("id")] = el.value || "";
    });
    [
        "jiraUrl",
        "jiraProject",
        "stashUrl",
        "stashProject",
        "stashRepository",
        "jiraIssueBranchName",
        "jiraIssueStartPointBranchName",
    ].forEach(x => options[x] = String.prototype.trim.call(options[x] || ""));
    return options;
};

const handleStashServerError = (err: { status: number, message: string }) => {
    const el = <HTMLElement>document.querySelector("#stashUrl-error");
    el.style.display = "block";
    el.textContent = "";
    if (err.status >= 500) {
        el.textContent = "Stash サーバー側でエラーが発生しています。時間をおいて再度アクセスしてください。";
    } else if (err.status === 401) {
        el.textContent = "認証が必要です。 Stash にログインしてください。";
    } else if (err.status === 404) {
        el.textContent = err.message || "Stash サーバーが見つからないか、プロジェクトもしくはリポジトリが存在しません。";
    } else {
        el.textContent = "Stash サーバーへのアクセス中にエラーが発生しました。";
    }
};

const handleJiraServerError = (err: { status: number, message: string }) => {
    const el = <HTMLElement>document.querySelector("#jiraUrl-error");
    el.style.display = "block";
    el.textContent = "";
    if (err.status >= 500) {
        el.textContent = "JIRA サーバー側でエラーが発生しています。時間をおいて再度アクセスしてください。";
    } else if (err.status === 401) {
        el.textContent = "認証が必要です。JIRA にログインしてください。";
    } else if (err.status === 404) {
        el.textContent = err.message || "JIRA サーバーが見つからないか、プロジェクトが存在しません。";
    } else {
        el.textContent = "JIRA サーバーへのアクセス中にエラーが発生しました。";
    }
};

const validateStashProject = () => {
    const form: {
        stashUrl: string,
        stashProject: string,
        stashRepository: string
    } = setOptionValues({});
    const noError = () => (<HTMLElement>document.querySelector("#stashUrl-error")).style.display = "none";
    const stashAPI = new stash.Stash(form.stashUrl);
    stashAPI.getRepository(form.stashProject, form.stashRepository)
        .then(p => noError())
        .catch(err => handleStashServerError(err));
};

const setIssueTypeSelect = (selectIssueTypeId?:string) => {
    const url = (<HTMLInputElement>document.querySelector("#jiraUrl")).value;
    const project = (<HTMLInputElement>document.querySelector("#jiraProject")).value;
    if (url === "" || project === "") {
        return;
    }
    if (!selectIssueTypeId) {
        selectIssueTypeId = (<HTMLInputElement>document.querySelector("#jiraIssueType")).value; 
    }
    const noError = () => (<HTMLElement>document.querySelector("#jiraUrl-error")).style.display = "none";
    const selectEl = <HTMLSelectElement>document.querySelector("#jiraIssueType");
    return new jira.JIRA(url).getProject(project).then(p => {
        noError();
        selectEl.innerHTML = "";
        p.issueTypes.forEach(t => {
            const optionEl = document.createElement("option");
            optionEl.textContent = t.name;
            optionEl.title = t.description;
            optionEl.value = t.id;
            selectEl.appendChild(optionEl);
        });
        selectEl.disabled = false;
        selectEl.value = selectIssueTypeId;
    }).catch(err => {
        handleJiraServerError(err);
        const optionEl = document.createElement("option");
        optionEl.textContent = "[タスク一覧の取得に失敗]";
        selectEl.innerHTML = "";
        selectEl.disabled = true;
        selectEl.appendChild(optionEl);
    });
};

document.addEventListener("DOMContentLoaded", () => {
    options.Options
        .get(chrome.storage.local)
        .then(opts => {
            Object.keys(opts).forEach(x => {
                let el = <HTMLInputElement>document.getElementById(x);
                if (el !== null) {
                    el.value = opts[x];
                }
            });
            return opts;
        })
        .then(opts => {
            setIssueTypeSelect(opts.jiraIssueType);
        });
});

Array.prototype.forEach.call(
    document.querySelectorAll("#jiraUrl, #jiraProject"),
    el => {
        el.addEventListener("change", () => setIssueTypeSelect());
    });
Array.prototype.forEach.call(
    document.querySelectorAll("#stashUrl, #stashProject, #stashRepository"),
    el => {
        el.addEventListener("change", () => validateStashProject());
    });

document.querySelector("#save").addEventListener("click", () => {
    const statusEl = document.querySelector("#status");
    options.Options
        .get(chrome.storage.local)
        .then(options => {
            setOptionValues(options);
            return Promise.all([
                new jira.JIRA(options.jiraUrl)
                    .getProject(options.jiraProject),
                new stash.Stash(options.stashUrl)
                    .getRepository(options.stashProject, options.stashRepository),
            ]).then(() => options);
        })
        .then(options => {
            return options.set(chrome.storage.local);
        })
        .then(() => {
            clearTimeout(saveFlashTimer);
            statusEl.textContent = "Options Saved.";
            saveFlashTimer = setTimeout(() => statusEl.textContent = "", 5000);
        })
        .catch(err => {
            clearTimeout(saveFlashTimer);
            const span = document.createElement("span");
            span.textContent = err.message || "";
            span.style.color = "red";
            span.style.fontWeight = "bold";
            statusEl.innerHTML = "";
            statusEl.appendChild(span);
        });
});
