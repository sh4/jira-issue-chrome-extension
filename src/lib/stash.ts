import * as rest from "./restClient";

const IsFirefox = /firefox/i.test(navigator.userAgent);

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

class XHRHeaderRewriter {
    handler: (details:any) => void;

    constructor(handler: (details:any) => void) {
        this.handler = handler;
    }

    static register(url: string, rewriteHeaders: [{ name: string, value: string }]) {
        const refererChanger = (details) => {
            const requestHeaders = details.requestHeaders || [];
            rewriteHeaders.forEach(rewrite => {
                if (!requestHeaders.some(h => {
                    if (h.name === rewrite.name) {
                        h.value = rewrite.value;
                        return true;
                    }
                })) {
                    requestHeaders.push(rewrite);
                }
            });
            return { requestHeaders: requestHeaders };
        };
        chrome.webRequest.onBeforeSendHeaders.addListener(refererChanger, {
            urls: [url],
            types: ["xmlhttprequest"]
        }, ["blocking", "requestHeaders"]);
        return new XHRHeaderRewriter(refererChanger);
    }

    unregister() {
        chrome.webRequest.onBeforeSendHeaders.removeListener(this.handler);
    }
}

export class Stash {
    url: string;

    constructor(url: string) {
        this.url = url.substr(-1, 1) !== '/' ? url + "/"  : url;
    }

    getRepository(project: string, repository: string): Promise<StashRepository | { message: string }> {
        const url = `${this.url}rest/api/1.0/projects/${project}/repos/${repository}`;
        return new rest.Client("GET", url).send();
    }

    createBranch(project: string, repository: string, branchName: string, startPoint: string): Promise<StashBranch | { message: string }> {
        const branchesUrl = `${this.url}rest/branch-utils/1.0/projects/${project}/repos/${repository}/branches`;
        const json = JSON.stringify({
            name: branchName,
            startPoint: `refs/heads/${startPoint}`,
        });
        const requestPromise = new rest.Client("POST", branchesUrl).send(json);
        if (IsFirefox) {
            // Firefox の場合は Origin/Referer ヘッダともに付与されず、そのままだと XSRF Check Failed になるので、
            // XHRリクエストをインターセプトして Referer ヘッダを注入する
            const headerRewriter = XHRHeaderRewriter.register(
                branchesUrl, 
                [{ name: "Referer", value: this.url }]);
            const always = x => {
                headerRewriter.unregister();
                return x;
            };
            return requestPromise.then(always).catch(always);
        } else {
            return requestPromise;
        }
    }

}
