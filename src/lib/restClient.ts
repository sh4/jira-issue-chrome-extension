const serviceRootUrl = (url: string) => {
    if (/^https?:\/\/[^\/]+\/[^\/]+\//.test(url)) {
        return RegExp.lastMatch;
    } else {
        return url;
    }
};

const xhrHeaders = (xhr:XMLHttpRequest) => {
    var h = new Headers();
    (xhr.getAllResponseHeaders() || '').trim().split("\n").forEach((header) => {
        var pairs = header.trim().split(":");
        var key = pairs.shift().trim();
        var value = pairs.join(":").trim();
        h.append(key, value);
    });
    return h;
};

const xhrResponse = (url: string, xhr:XMLHttpRequest) => {
    var r = new Response(xhr.responseText, {
        status: xhr.status,
        statusText: xhr.statusText,
        headers: xhrHeaders(xhr),
    });
    return r;
};

const IsFirefox = /firefox/i.test(navigator.userAgent);

const fetchInternal = (url: string, init:RequestInit) => {
    if (IsFirefox) {
        init.referrer = serviceRootUrl(url);
        return fetch(url, init);
    }
    const xhr = new XMLHttpRequest();
    return new Promise<Response>((resolve, reject) => {
        xhr.onload = () => {
            const r = xhrResponse(url, xhr);
            resolve(r);
        };
        xhr.ontimeout = () => {
            reject(new TypeError("Network request timeout"));
        };
        xhr.onerror = () => {
            reject(new TypeError("Network request failed"));
        };
        xhr.open(init.method, url, true);
        for (var key in init.headers) {
            xhr.setRequestHeader(key, init.headers[key]);
        }
        xhr.withCredentials = !!init.credentials;
        xhr.send(init.body);
    });
}

// Firefox/Chrome で WebExtension からの fetch API によるクロスオリジン通信の挙動が異なるので、内部実装を分岐させることで対応する。
// * Chrome 
//   -> XHR にダウングレード (クロスオリジンの場合 Origin ヘッダに chrome-extension:// が付与される)
// * Firefox
//   -> fetch API + Referrer ヘッダ付与
export function Client(method: string, url: string, data?: string): Promise<any | { message: string }> {
    const init:RequestInit = {
        method: method,
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json; charset=utf-8",
            "X-Atlassian-Token": "no-check",
        },
        credentials: "include",
    };
    if (method === "POST") {
        init.body = data;
    }
    return fetchInternal(url, init)
        .then(r => {
            const contentType = String.prototype.trim.call(r.headers.get("content-type") || "");
            if (contentType.indexOf("application/json") === -1) {
                return r.text().then(text => Promise.reject({
                    status: r.status,
                    message: text,
                }));
            }
            const isError = r.status >= 400;
            return r.json().then(json => {
                if (isError) {
                    const err = { status: r.status, message: null };
                    if (Array.isArray(json.errors)) {
                        err.message = json.errors.map(x => x.message || "").join("\n");
                    } else if (Array.isArray(json.errorMessages)) {
                        err.message = json.errorMessages.join("\n");
                    } else {
                        err.message = JSON.stringify(json);
                    }
                    return Promise.reject(err);
                }
                return json;
            });
        })
        .catch(err => {
            return Promise.reject({
                status: null,
                message: err.message || "",
            });
        });
}
