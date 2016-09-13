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

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", branchesUrl, true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("Accept", "application/json");
            xhr.setRequestHeader("X-Atlassian-Token", "no-check");
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    var res = xhr.responseText || "";
                    if (xhr.getResponseHeader("Content-Type") === "application/json") {
                        res = JSON.parse(res);
                    }
                    if (xhr.status >= 400) {
                        reject(res);
                    } else {
                        resolve(res);
                    }
                }
            };
            xhr.withCredentials = true;
            xhr.send(json);
        });
    }
}