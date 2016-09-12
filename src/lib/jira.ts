export interface JIRAProject {
    assigneeType: string;
    components: {
        id: string;
        isAssigneeTypeValid: boolean;
        name: string;
        self: string;
    }[];
    description: string;
    id: string;
    issueTypes: {
        avatarId: number;
        description: string;
        iconUrl: string;
        id: string;
        name: string;
        self: string;
        subtask: boolean;
    }[];
    key: string;
    projectTypeKey: string;
    self: string;
    versions?: {
        archived: boolean,
        id: string;
        name: string;
        projectId: number;
        released: boolean;
        self: string;
    }[];
}

export interface JIRAUser {
    active: boolean;
    displayName: string;
    emailAddress: string;
    key: string;
    locale: string;
    name: string;
    self: string;
    timeZone: string;
}

export class JIRA {
    url: string;

    constructor(url: string) {
        this.url = url.substr(-1, 1) !== '/' ? url + "/"  : url;
    }

    getProject(project:string): Promise<JIRAProject> {
        if (project === null) {
            return new Promise((_, reject) => reject());
        }
        const projectUrl = `${this.url}rest/api/2/project/${project}`;
        return fetch(projectUrl, { credentials: "include" })
            .then(r => r.json())
            .then(json => {
                const err = json.errorMessages;
                if (err && err.length > 0) {
                    throw new Error(err.join("\n"));
                }
                return json;
            })
            .then(p => {
                return <JIRAProject>p;
            });
    }

    getMyself(): Promise<JIRAUser> {
        return fetch(`${this.url}rest/api/2/myself`, { credentials: "include" })
            .then(r => {
                if (!r.ok) {
                    throw new Error(r.statusText);
                }
                return r.json();
            })
            .then(json => {
                return <JIRAUser>json;
            });
    }

    issueUrl(params?: { [key: string]: string }) {
        var url = `${this.url}secure/CreateIssueDetails!init.jspa`;
        if (!params) {
            return url;
        }
        url += "?";
        url += Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join("&");
        return url;
    }

}