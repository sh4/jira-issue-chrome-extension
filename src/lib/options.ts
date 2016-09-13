export class Options {
    stashUrl: string = "http://localhost:7990/stash/";
    stashProject: string = null;
    stashRepository: string = null;

    jiraUrl: string = "http://localhost:2990/jira/";
    jiraProject: string = null;
    jiraIssueType: string = null;
    jiraIssueSummary: string = "$(SELECTED-TEXT)";
    jiraIssueDescription: string = null;
    jiraIssueBranchName: string = "feature/$(JIRA-KEY)-";
    jiraIssueStartPointBranchName: string = "develop";

    constructor() {
    }

    static get(storage:chrome.storage.StorageArea) {
        const option = new Options();
        return new Promise<Options>((resolve, reject) => {
            storage.get(option, items => {
                const err = chrome.runtime.lastError;
                if (err) {
                    return reject(err);
                }
                return resolve(Object.assign(option, items));
            });
        });
    }

    set(storage:chrome.storage.StorageArea) {
        return new Promise<Options>((resolve, reject) => {
            if (Options.isNullOrEmpty(this.jiraUrl)) {
                return reject({ message: "JIRA URL cannot be empty" });
            }
            if (Options.isNullOrEmpty(this.jiraProject)) {
                return reject({ message: "JIRA Project cannot be empty" });
            }
            if (Options.isNullOrEmpty(this.jiraIssueType)) {
                return reject({ message: "JIRA Issue Type cannot be empty" });
            }
            if (Options.isNullOrEmpty(this.stashProject)) {
                return reject({ message: "Stash Project cannot be empty" });
            }
            if (Options.isNullOrEmpty(this.stashRepository)) {
                return reject({ message: "Stash Repository cannot be empty" });
            }
            storage.set(this, () => {
                const err = chrome.runtime.lastError;
                if (err) {
                    return reject(err);
                }
                return resolve(this);
            });
        });
    }

    expandMacro(str: string, ctx: { [key: string]: string }) {
        return (str || "").replace(/\$\(([^\)]+)\)/, (_, m) => ctx[m] || "");
    }

    static isNullOrEmpty(str:string) {
        return String.prototype.trim.call(str || "") === "";        
    }
}
