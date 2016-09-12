export class Stash {
    url: string;

    constructor(url: string) {
        this.url = url.substr(-1, 1) !== '/' ? url + "/"  : url;
    }

    createBranch(project: string, repository: string, branchName: string, startPoint: string = "develop") {
        const branchesUrl = `${this.url}rest/branch-utils/1.0/projects/${project}/repos/${repository}/branches`;
        const data = new FormData();
        data.append("json", JSON.stringify({
            name: branchName,
            startPoint: `refs/heads/${startPoint}`,
        }));
        return fetch(branchesUrl, {
            method: "POST", 
            credentials: "include",
            body: data,
        })
        .then(r => r.json())
        .then(json => {
            if (json.errors) {
                throw new Error(json.errors.map(e => e.message).join("\r\n"));
            }
            return json;
        });
    }
}