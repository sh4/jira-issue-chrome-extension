export class Client {
    xhr: XMLHttpRequest;

    constructor(method:string, url: string) {
        this.xhr = new XMLHttpRequest();
        this.xhr.open(method.toUpperCase(), url, true);
        this.xhr.setRequestHeader("Content-Type", "application/json");
        this.xhr.setRequestHeader("Accept", "application/json");
        this.xhr.setRequestHeader("X-Atlassian-Token", "no-check");
        this.xhr.withCredentials = true;
    }

    send(data?: string) {
        return this.http(this.xhr, data)
            .then((xhr:XMLHttpRequest) => {
                return this.parseResponse(xhr);
            })
            .catch((xhr:XMLHttpRequest) => {
                const response = this.parseResponse(xhr);
                var err = { status: xhr.status, message: null };
                if (Array.isArray(response.errors)) { // stash error messages
                    err.message = response.errors.map(x => x.message).join("\n");
                } else if (Array.isArray(response.errorMessages)) { // jira error messages
                    err.message = response.errorMessages.join("\n");
                } else {
                    err.message = xhr.statusText || "";
                }
                return Promise.reject(err);
            });
    }

    http(xhr:XMLHttpRequest, data?: string): Promise<XMLHttpRequest> {
        return new Promise((resolve, reject) => {
            xhr.onerror = () => {
                reject(xhr);
            };
            xhr.onload = () => {
                if (xhr.status >= 400) {
                    reject(xhr);
                } else {
                    resolve(xhr);
                }
            };
            xhr.send(data);
        });
    }

    parseResponse(xhr:XMLHttpRequest) {
        const contentType = xhr.getResponseHeader("Content-Type") || "";
        if (contentType.indexOf("application/json") !== -1) {
            return JSON.parse(xhr.responseText || "{}");
        } else {
            return { message: xhr.responseText || "" };
        }
    }

}