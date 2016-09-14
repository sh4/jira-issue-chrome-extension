export interface StashBranch {
    displayId: string; // feature/PIYO-0000
    id: string; // refs/heads/feature/PIYO-0000
    isDefault: boolean;
    latestChangeset: string; // <sha1>
    latestCommit: string; // <sha1>
    type: string; // BRANCH
}

export class Stash {
    url: string;

    constructor(url: string) {
        this.url = url.substr(-1, 1) !== '/' ? url + "/"  : url;
    }

    createBranch(project: string, repository: string, branchName: string, startPoint: string) {
        const branchesUrl = `${this.url}rest/branch-utils/1.0/projects/${project}/repos/${repository}/branches`;
        const json = JSON.stringify({
            name: branchName,
            startPoint: `refs/heads/${startPoint}`,
        });

        return new Promise<StashBranch | { message: string }>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", branchesUrl, true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("Accept", "application/json");
            xhr.setRequestHeader("X-Atlassian-Token", "no-check");
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    const contentType = xhr.getResponseHeader("Content-Type") || "";
                    var response;
                    if (contentType.indexOf("application/json") !== -1) {
                        response = JSON.parse(xhr.responseText || "");
                    } else {
                        response = { message: xhr.responseText || "" };
                    }
                    if (xhr.status >= 400) {
                        if (response.errors) {
                            reject({ message: response.errors.map(x => x.message).join("\n") });                            
                        } else {
                            reject({ message: xhr.statusText || "" });
                        }
                    } else {
                        resolve(<StashBranch>response);
                    }
                }
            };
            xhr.withCredentials = true;
            xhr.send(json);
        });
    }
}