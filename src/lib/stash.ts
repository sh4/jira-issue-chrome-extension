import * as rest from "./restClient";

export interface StashRepository {
    slug: string;
    id: string;
    name: string;
    scmId: string;
    state: string;
    statusMessage: string;
    forkable: string;
    project: {
        key: string,
        id: number,
        name: string,
        description: string,
        public: boolean,
        type: string,
        link: {
            url: string,
            rel: string,
        },
        links: {
            self: [{href: string}]
        },
    },
    public: boolean,
    cloneUrl: string,
    link: {
        url: string,
        rel: string,
    },
    links: {
        clone: [{href: string, name: string }],
        self: [{url: string, rel: string }],
    }
}

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

    getRepository(project: string, repository: string): Promise<StashRepository | { message: string }> {
        const url = `${this.url}rest/api/1.0/projects/${project}/repos/${repository}`;
        return rest.Client("GET", url);
    }

    createBranch(project: string, repository: string, branchName: string, startPoint: string): Promise<StashBranch | { message: string }> {
        const branchesUrl = `${this.url}rest/branch-utils/1.0/projects/${project}/repos/${repository}/branches`;
        const json = JSON.stringify({
            name: branchName,
            startPoint: `refs/heads/${startPoint}`,
        });
        return rest.Client("POST", branchesUrl, json);
    }

}
