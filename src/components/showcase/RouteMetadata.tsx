import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://os.usamaaslam.site/';
const DEFAULT_TITLE = 'Usama Aslam | Interactive Portfolio OS';
const DEFAULT_DESCRIPTION =
    "Explore an interactive desktop-style portfolio featuring Usama Aslam's full-stack, AI, SaaS, and cloud engineering work.";

const ROUTE_TITLES: Record<string, string> = {
    '/about': 'About Usama Aslam | Portfolio OS',
    '/experience': 'Experience | Usama Aslam Portfolio OS',
    '/projects': 'Projects | Usama Aslam Portfolio OS',
    '/projects/software': 'Projects | Usama Aslam Portfolio OS',
    '/contact': 'Contact | Usama Aslam Portfolio OS',
    '/blogs': 'Articles | Usama Aslam Portfolio OS',
};

const setMetaContent = (selector: string, content: string) => {
    const element = document.querySelector<HTMLMetaElement>(selector);
    if (element) element.content = content;
};

/**
 * The Portfolio OS root is the indexable, canonical experience. Its internal
 * SPA routes intentionally remain crawlable for link discovery but are not
 * indexed as separate copies of the canonical portfolio content.
 */
const RouteMetadata = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        const normalizedPath =
            pathname !== '/' ? pathname.replace(/\/+$/, '') : pathname;
        const isRoot = normalizedPath === '/';
        const title = ROUTE_TITLES[normalizedPath] ?? DEFAULT_TITLE;

        document.title = title;
        setMetaContent(
            'meta[name="robots"]',
            isRoot
                ? 'index, follow, max-image-preview:large'
                : 'noindex, follow'
        );
        setMetaContent('meta[property="og:title"]', title);
        setMetaContent('meta[property="og:description"]', DEFAULT_DESCRIPTION);
        setMetaContent('meta[property="og:url"]', SITE_URL);
        setMetaContent('meta[name="twitter:title"]', title);
        setMetaContent('meta[name="twitter:description"]', DEFAULT_DESCRIPTION);
    }, [pathname]);

    return null;
};

export default RouteMetadata;
