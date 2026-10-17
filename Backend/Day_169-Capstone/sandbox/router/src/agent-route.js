function getSandboxRoute(url, routeType) {
    const requestUrl = new URL(url, "http://localhost");
    const match = requestUrl.pathname.match(
        new RegExp(`^/api/sandbox/${routeType}/([a-z0-9](?:[a-z0-9-]*[a-z0-9])?)(?=/|$)`, "i")
    );

    if (!match) {
        return null;
    }

    return {
        sandboxId: match[1],
        path: `${requestUrl.pathname.slice(match[0].length) || "/"}${requestUrl.search}`,
    };
}

export function getAgentRoute(url) {
    return getSandboxRoute(url, "agent");
}

export function getPreviewRoute(url) {
    return getSandboxRoute(url, "preview");
}

export function getPreviewHmrRoute(url) {
    const requestUrl = new URL(url, "http://localhost");
    const match = requestUrl.pathname.match(
        /^\/__vite_hmr\/([a-z0-9](?:[a-z0-9-]*[a-z0-9])?)\/?$/i
    );

    if (!match) {
        return null;
    }

    return {
        sandboxId: match[1],
        path: `${requestUrl.pathname}${requestUrl.search}`,
    };
}
