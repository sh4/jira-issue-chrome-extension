import * as options from "./lib/options";
import * as jira from "./lib/jira";

var saveFlashTimer = null;

const setIssueTypeSelect = (selectIssueTypeId?:string) => {
    const url = (<HTMLInputElement>document.querySelector("#jiraUrl")).value;
    const project = (<HTMLInputElement>document.querySelector("#jiraProject")).value;
    if (url === "" || project === "") {
        return;
    }
    if (!selectIssueTypeId) {
        selectIssueTypeId = (<HTMLInputElement>document.querySelector("#jiraIssueType")).value; 
    }
    new jira.JIRA(url).getProject(project).then(p => {
        const selectEl = document.querySelector("#jiraIssueType");
        selectEl.innerHTML = "";
        p.issueTypes.forEach(t => {
            const optionEl = document.createElement("option");
            optionEl.textContent = t.name;
            optionEl.title = t.description;
            optionEl.value = t.id;
            selectEl.appendChild(optionEl);
        });
        (<HTMLSelectElement>selectEl).value = selectIssueTypeId;
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
    el => el.addEventListener("change", () => setIssueTypeSelect()));

document.querySelector("#save").addEventListener("click", () => {
    const statusEl = document.querySelector("#status");
    options.Options
        .get(chrome.storage.local)
        .then(options => {
            const optElems = document.querySelectorAll(".option-value");
            Array.prototype.forEach.call(optElems, el => {
                options[el.getAttribute("id")] = el.value || "";
            });
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
