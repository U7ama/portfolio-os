interface Env {
    ASSETS: {
        fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
    };
}

const SPA_ROUTES = new Set([
    '/',
    '/about',
    '/experience',
    '/projects',
    '/projects/software',
    '/contact',
    '/blogs',
]);

const normalizePathname = (pathname: string) => {
    if (pathname === '/') return pathname;
    return pathname.replace(/\/+$/, '');
};

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        const pathname = normalizePathname(url.pathname);

        if (
            (request.method === 'GET' || request.method === 'HEAD') &&
            SPA_ROUTES.has(pathname)
        ) {
            const indexUrl = new URL('/', request.url);
            const response = await env.ASSETS.fetch(
                new Request(indexUrl, request)
            );

            if (pathname === '/') return response;

            const headers = new Headers(response.headers);
            headers.set('X-Robots-Tag', 'noindex, follow');

            return new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers,
            });
        }

        return env.ASSETS.fetch(request);
    },
};
