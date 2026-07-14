export const PORTFOLIO_CONTENT_URL =
    'https://u7ama.github.io/resume/portfolio.md';

export const PORTFOLIO_CACHE_KEY = 'portfolio-content:v1';
export const PORTFOLIO_SCHEMA_VERSION = 1 as const;
export const MAX_PORTFOLIO_BYTES = 256 * 1024;
export const DEFAULT_PORTFOLIO_TIMEOUT_MS = 8000;

export interface PortfolioLink {
    label: string;
    url: string;
}

export interface PortfolioProfile {
    name: string;
    headline: string;
    summary: string[];
    disciplines: string[];
}

export interface PortfolioContact extends PortfolioLink {
    id: string;
}

export interface PortfolioExperience {
    id: string;
    role: string;
    organization: string;
    location: string;
    period: string;
    website: string;
    summary: string;
    details: string[];
}

export interface PortfolioEducation {
    id: string;
    qualification: string;
    institution: string;
    location: string;
    period: string;
    details: string[];
    links: PortfolioLink[];
}

export interface PortfolioGroup {
    id: string;
    label: string;
    items: string[];
}

export interface PortfolioVideo {
    provider: 'youtube';
    id: string;
    caption: string;
}

export interface PortfolioProject {
    id: string;
    title: string;
    category: string;
    featuredOrder: number | null;
    summary: string;
    details: string[];
    technologies: string[];
    links: PortfolioLink[];
    videos: PortfolioVideo[];
}

export interface PortfolioArticle {
    id: string;
    title: string;
    date: string;
    summary: string;
    links: PortfolioLink[];
}

export interface PortfolioDataV1 {
    schemaVersion: typeof PORTFOLIO_SCHEMA_VERSION;
    profile: PortfolioProfile;
    contacts: PortfolioContact[];
    experience: PortfolioExperience[];
    skills: PortfolioGroup[];
    education: PortfolioEducation[];
    projects: PortfolioProject[];
    uses: PortfolioGroup[];
    articles: PortfolioArticle[];
    sites: PortfolioContact[];
}

type MutablePortfolioData = {
    schemaVersion: typeof PORTFOLIO_SCHEMA_VERSION;
    profile: PortfolioProfile;
    contacts: PortfolioContact[];
    experience: PortfolioExperience[];
    skills: PortfolioGroup[];
    education: PortfolioEducation[];
    projects: PortfolioProject[];
    uses: PortfolioGroup[];
    articles: PortfolioArticle[];
    sites: PortfolioContact[];
};

type CurrentEntry =
    | PortfolioExperience
    | PortfolioGroup
    | PortfolioEducation
    | PortfolioProject
    | PortfolioArticle;

const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);
const STABLE_PROJECT_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SECTION_NAMES = new Set([
    'profile',
    'contact',
    'experience',
    'skills',
    'education',
    'projects',
    'uses',
    'articles',
    'portfolio sites',
]);

const byteLength = (value: string) => new TextEncoder().encode(value).byteLength;

const requireValue = (value: string | undefined, context: string) => {
    if (!value?.trim()) throw new Error(`${context} is required.`);
    return value.trim();
};

export const isSafePortfolioUrl = (value: string) => {
    try {
        return SAFE_PROTOCOLS.has(new URL(value).protocol.toLowerCase());
    } catch {
        return false;
    }
};

const safeUrl = (value: string | undefined, context: string) => {
    const url = requireValue(value, context);
    if (!isSafePortfolioUrl(url)) {
        throw new Error(`${context} is invalid or uses an unsupported protocol.`);
    }
    return url;
};

const assertUnique = (items: Array<{ id: string }>, context: string) => {
    const ids = new Set<string>();
    for (const item of items) {
        if (ids.has(item.id)) throw new Error(`Duplicate ${context} id: ${item.id}`);
        ids.add(item.id);
    }
};

const parseRecord = (line: string) =>
    line
        .slice(2)
        .split('|')
        .map((part) => part.trim());

export const parsePortfolioMarkdown = (markdown: string): PortfolioDataV1 => {
    if (typeof markdown !== 'string') {
        throw new TypeError('Portfolio content must be a string.');
    }
    if (byteLength(markdown) > MAX_PORTFOLIO_BYTES) {
        throw new Error(`Portfolio content exceeds ${MAX_PORTFOLIO_BYTES} bytes.`);
    }

    const schemaMatch = markdown.match(/<!--\s*portfolio-schema:\s*(\d+)\s*-->/i);
    if (!schemaMatch) throw new Error('Missing portfolio schema marker.');
    const schemaVersion = Number(schemaMatch[1]);
    if (schemaVersion !== PORTFOLIO_SCHEMA_VERSION) {
        throw new Error(`Unsupported portfolio schema version: ${schemaVersion}.`);
    }

    const data: MutablePortfolioData = {
        schemaVersion: PORTFOLIO_SCHEMA_VERSION,
        profile: { name: '', headline: '', summary: [], disciplines: [] },
        contacts: [],
        experience: [],
        skills: [],
        education: [],
        projects: [],
        uses: [],
        articles: [],
        sites: [],
    };
    const seenSections = new Set<string>();
    let section = '';
    let currentEntry: CurrentEntry | null = null;
    const lines = markdown.replace(/\r\n?/g, '\n').split('\n');

    lines.forEach((rawLine, index) => {
        const line = rawLine.trim();
        const lineNumber = index + 1;
        if (!line || /^<!--\s*portfolio-schema:/i.test(line)) return;

        if (/<\/?(?:script|iframe|object|embed|style|link|meta)\b/i.test(line)) {
            throw new Error(`Raw active HTML is not allowed at line ${lineNumber}.`);
        }

        if (line.startsWith('# ') && !line.startsWith('## ')) {
            if (data.profile.name) throw new Error('Only one profile name is allowed.');
            data.profile.name = requireValue(line.slice(2), `Name at line ${lineNumber}`);
            return;
        }
        if (line.startsWith('> ')) {
            if (data.profile.headline) {
                throw new Error('Only one profile headline is allowed.');
            }
            data.profile.headline = requireValue(
                line.slice(2),
                `Headline at line ${lineNumber}`
            );
            return;
        }
        if (line.startsWith('## ')) {
            section = line.slice(3).trim().toLowerCase();
            if (!SECTION_NAMES.has(section)) {
                throw new Error(`Unknown section at line ${lineNumber}: ${section}.`);
            }
            if (seenSections.has(section)) {
                throw new Error(`Duplicate section at line ${lineNumber}: ${section}.`);
            }
            seenSections.add(section);
            currentEntry = null;
            return;
        }
        if (line.startsWith('### ')) {
            const parts = line
                .slice(4)
                .split('|')
                .map((part) => part.trim());

            if (section === 'experience') {
                if (parts.length !== 5) {
                    throw new Error(`Experience heading needs 5 fields at line ${lineNumber}.`);
                }
                const entry: PortfolioExperience = {
                    id: requireValue(parts[0], 'Experience id'),
                    role: requireValue(parts[1], 'Experience role'),
                    organization: requireValue(parts[2], 'Experience organization'),
                    location: requireValue(parts[3], 'Experience location'),
                    period: requireValue(parts[4], 'Experience period'),
                    website: '',
                    summary: '',
                    details: [],
                };
                data.experience.push(entry);
                currentEntry = entry;
            } else if (section === 'skills' || section === 'uses') {
                if (parts.length !== 2) {
                    throw new Error(`${section} heading needs 2 fields at line ${lineNumber}.`);
                }
                const entry: PortfolioGroup = {
                    id: requireValue(parts[0], `${section} id`),
                    label: requireValue(parts[1], `${section} label`),
                    items: [],
                };
                data[section].push(entry);
                currentEntry = entry;
            } else if (section === 'education') {
                if (parts.length !== 5) {
                    throw new Error(`Education heading needs 5 fields at line ${lineNumber}.`);
                }
                const entry: PortfolioEducation = {
                    id: requireValue(parts[0], 'Education id'),
                    qualification: requireValue(parts[1], 'Education qualification'),
                    institution: requireValue(parts[2], 'Education institution'),
                    location: requireValue(parts[3], 'Education location'),
                    period: requireValue(parts[4], 'Education period'),
                    details: [],
                    links: [],
                };
                data.education.push(entry);
                currentEntry = entry;
            } else if (section === 'projects') {
                if (parts.length !== 3) {
                    throw new Error(`Project heading needs 3 fields at line ${lineNumber}.`);
                }
                const id = requireValue(parts[0], 'Project id');
                if (!STABLE_PROJECT_SLUG.test(id)) {
                    throw new Error(`Invalid project slug at line ${lineNumber}: ${id}.`);
                }
                const entry: PortfolioProject = {
                    id,
                    title: requireValue(parts[1], 'Project title'),
                    category: requireValue(parts[2], 'Project category'),
                    featuredOrder: null,
                    summary: '',
                    details: [],
                    technologies: [],
                    links: [],
                    videos: [],
                };
                data.projects.push(entry);
                currentEntry = entry;
            } else if (section === 'articles') {
                if (parts.length !== 2) {
                    throw new Error(`Article heading needs 2 fields at line ${lineNumber}.`);
                }
                const entry: PortfolioArticle = {
                    id: requireValue(parts[0], 'Article id'),
                    title: requireValue(parts[1], 'Article title'),
                    date: '',
                    summary: '',
                    links: [],
                };
                data.articles.push(entry);
                currentEntry = entry;
            } else {
                throw new Error(
                    `Entries are not supported in ${section || 'the document root'} at line ${lineNumber}.`
                );
            }
            return;
        }

        if (!line.startsWith('- ')) {
            throw new Error(`Unsupported content at line ${lineNumber}: ${line}`);
        }
        if (!section) throw new Error(`Record appears before a section at line ${lineNumber}.`);

        const parts = parseRecord(line);
        const field = requireValue(parts[0], `Field at line ${lineNumber}`).toLowerCase();

        if (section === 'profile') {
            if (parts.length !== 2 || !['summary', 'discipline'].includes(field)) {
                throw new Error(`Invalid profile record at line ${lineNumber}.`);
            }
            data.profile[field === 'summary' ? 'summary' : 'disciplines'].push(
                requireValue(parts[1], `Profile ${field}`)
            );
        } else if (section === 'contact') {
            if (parts.length !== 3) {
                throw new Error(`Contact record needs 3 fields at line ${lineNumber}.`);
            }
            data.contacts.push({
                id: field,
                label: requireValue(parts[1], 'Contact label'),
                url: safeUrl(parts[2], 'Contact URL'),
            });
        } else if (section === 'experience') {
            const entry = currentEntry as PortfolioExperience | null;
            if (!entry) throw new Error(`Experience record has no heading at line ${lineNumber}.`);
            if (field === 'website' && parts.length === 2) {
                entry.website = safeUrl(parts[1], 'Experience website');
            } else if (field === 'summary' && parts.length === 2) {
                entry.summary = requireValue(parts[1], 'Experience summary');
            } else if (field === 'detail' && parts.length === 2) {
                entry.details.push(requireValue(parts[1], 'Experience detail'));
            } else {
                throw new Error(`Invalid experience record at line ${lineNumber}.`);
            }
        } else if (section === 'skills' || section === 'uses') {
            const entry = currentEntry as PortfolioGroup | null;
            if (!entry || field !== 'item' || parts.length !== 2) {
                throw new Error(`Invalid ${section} record at line ${lineNumber}.`);
            }
            entry.items.push(requireValue(parts[1], `${section} item`));
        } else if (section === 'education') {
            const entry = currentEntry as PortfolioEducation | null;
            if (!entry) throw new Error(`Education record has no heading at line ${lineNumber}.`);
            if (field === 'detail' && parts.length === 2) {
                entry.details.push(requireValue(parts[1], 'Education detail'));
            } else if (field === 'link' && parts.length === 3) {
                entry.links.push({
                    label: requireValue(parts[1], 'Education link label'),
                    url: safeUrl(parts[2], 'Education link URL'),
                });
            } else {
                throw new Error(`Invalid education record at line ${lineNumber}.`);
            }
        } else if (section === 'projects') {
            const entry = currentEntry as PortfolioProject | null;
            if (!entry) throw new Error(`Project record has no heading at line ${lineNumber}.`);
            if (field === 'featured' && parts.length === 2) {
                const order = Number(parts[1]);
                if (!Number.isInteger(order) || order < 1 || order > 3) {
                    throw new Error(
                        `Project featured order must be 1, 2, or 3 at line ${lineNumber}.`
                    );
                }
                entry.featuredOrder = order;
            } else if (field === 'summary' && parts.length === 2) {
                entry.summary = requireValue(parts[1], 'Project summary');
            } else if (field === 'detail' && parts.length === 2) {
                entry.details.push(requireValue(parts[1], 'Project detail'));
            } else if (field === 'technologies' && parts.length === 2) {
                entry.technologies = parts[1]
                    .split(',')
                    .map((technology) => technology.trim())
                    .filter(Boolean);
            } else if (field === 'link' && parts.length === 3) {
                entry.links.push({
                    label: requireValue(parts[1], 'Project link label'),
                    url: safeUrl(parts[2], 'Project link URL'),
                });
            } else if (field === 'video' && parts.length === 4) {
                const provider = requireValue(parts[1], 'Video provider').toLowerCase();
                const id = requireValue(parts[2], 'Video id');
                if (provider !== 'youtube' || !/^[\w-]{6,32}$/.test(id)) {
                    throw new Error(`Unsupported project video at line ${lineNumber}.`);
                }
                entry.videos.push({
                    provider: 'youtube',
                    id,
                    caption: requireValue(parts[3], 'Video caption'),
                });
            } else {
                throw new Error(`Invalid project record at line ${lineNumber}.`);
            }
        } else if (section === 'articles') {
            const entry = currentEntry as PortfolioArticle | null;
            if (!entry) throw new Error(`Article record has no heading at line ${lineNumber}.`);
            if (field === 'date' && parts.length === 2 && /^\d{4}-\d{2}-\d{2}$/.test(parts[1])) {
                entry.date = parts[1];
            } else if (field === 'summary' && parts.length === 2) {
                entry.summary = requireValue(parts[1], 'Article summary');
            } else if (field === 'link' && parts.length === 3) {
                entry.links.push({
                    label: requireValue(parts[1], 'Article link label'),
                    url: safeUrl(parts[2], 'Article link URL'),
                });
            } else {
                throw new Error(`Invalid article record at line ${lineNumber}.`);
            }
        } else if (section === 'portfolio sites') {
            if (parts.length !== 3) {
                throw new Error(`Portfolio site record needs 3 fields at line ${lineNumber}.`);
            }
            data.sites.push({
                id: field,
                label: requireValue(parts[1], 'Portfolio site label'),
                url: safeUrl(parts[2], 'Portfolio site URL'),
            });
        }
    });

    SECTION_NAMES.forEach((requiredSection) => {
        if (!seenSections.has(requiredSection)) {
            throw new Error(`Missing required portfolio section: ${requiredSection}.`);
        }
    });
    requireValue(data.profile.name, 'Profile name');
    requireValue(data.profile.headline, 'Profile headline');
    if (!data.profile.summary.length) throw new Error('At least one profile summary is required.');
    if (!data.profile.disciplines.length) {
        throw new Error('At least one profile discipline is required.');
    }
    if (!data.contacts.length) throw new Error('At least one contact is required.');
    if (!data.experience.length) throw new Error('At least one experience entry is required.');
    if (!data.skills.length) throw new Error('At least one skill group is required.');
    if (!data.education.length) throw new Error('At least one education entry is required.');
    if (!data.projects.length) throw new Error('At least one project is required.');
    if (!data.uses.length) throw new Error('At least one uses group is required.');
    if (!data.articles.length) throw new Error('At least one article is required.');
    if (!data.sites.length) throw new Error('At least one portfolio site is required.');

    assertUnique(data.contacts, 'contact');
    assertUnique(data.experience, 'experience');
    assertUnique(data.skills, 'skill group');
    assertUnique(data.education, 'education');
    assertUnique(data.projects, 'project');
    assertUnique(data.uses, 'uses group');
    assertUnique(data.articles, 'article');
    assertUnique(data.sites, 'portfolio site');

    const featuredOrders = data.projects
        .map((project) => project.featuredOrder)
        .filter((order): order is number => order !== null);
    if (featuredOrders.length !== 3 || new Set(featuredOrders).size !== 3) {
        throw new Error('Exactly three projects with unique featured orders are required.');
    }
    data.experience.forEach((entry) =>
        requireValue(entry.summary, `Experience summary for ${entry.id}`)
    );
    data.skills.forEach((group) => {
        if (!group.items.length) throw new Error(`Skill group items required for ${group.id}.`);
    });
    data.projects.forEach((project) =>
        requireValue(project.summary, `Project summary for ${project.id}`)
    );
    data.uses.forEach((group) => {
        if (!group.items.length) throw new Error(`Uses group items required for ${group.id}.`);
    });
    data.articles.forEach((article) => {
        requireValue(article.date, `Article date for ${article.id}`);
        requireValue(article.summary, `Article summary for ${article.id}`);
        if (!article.links.length) throw new Error(`Article link required for ${article.id}.`);
    });

    return data;
};

export const FALLBACK_PORTFOLIO: PortfolioDataV1 = {
    schemaVersion: PORTFOLIO_SCHEMA_VERSION,
    profile: {
        name: 'Usama Aslam',
        headline: 'Full Stack Developer | AI & SaaS',
        summary: [
            'Full stack engineer building SaaS products, dashboards, AI features, APIs, and cloud systems.',
        ],
        disciplines: ['Full Stack', 'React', 'Next.js', 'Node.js', 'AI & SaaS'],
    },
    contacts: [
        { id: 'email', label: 'Email', url: 'mailto:u7amaaslam@gmail.com' },
        { id: 'phone', label: 'Phone', url: 'tel:+923016441046' },
        { id: 'github', label: 'GitHub', url: 'https://github.com/U7ama' },
        {
            id: 'linkedin',
            label: 'LinkedIn',
            url: 'https://www.linkedin.com/in/usama-aslam-638584194/',
        },
        { id: 'resume', label: 'Resume', url: 'https://u7ama.github.io/resume/' },
    ],
    experience: [
        {
            id: 'freelance-upwork',
            role: 'Full Stack Engineer',
            organization: 'Freelance / Upwork',
            location: 'Remote',
            period: 'Jul 2024 - Present',
            website: '',
            summary: 'Build AI SaaS platforms, dashboards, internal tools, API products, and automations for clients.',
            details: [],
        },
    ],
    skills: [
        {
            id: 'full-stack',
            label: 'Full stack',
            items: ['React', 'Next.js', 'Node.js', 'TypeScript', 'Python', 'Cloud'],
        },
    ],
    education: [
        {
            id: 'bscs',
            qualification: 'BS Computer Science',
            institution: 'PMAS Arid Agriculture University',
            location: 'Rawalpindi',
            period: '2018 - 2022',
            details: [],
            links: [],
        },
    ],
    projects: [
        {
            id: 'alignav-monitoring',
            title: 'AlignAV Monitoring',
            category: 'AI / SaaS / IoT',
            featuredOrder: 1,
            summary: 'Asset management and real-time AV/IoT monitoring platform.',
            details: [],
            technologies: ['Next.js', 'Node.js', 'Azure IoT', 'Docker'],
            links: [{ label: 'Website', url: 'https://www.alignav.com/' }],
            videos: [],
        },
        {
            id: 'copilot-travel',
            title: 'Copilot Travel',
            category: 'Travel / Web Component',
            featuredOrder: 2,
            summary: 'A configurable flight-search and booking web component.',
            details: [],
            technologies: ['Next.js', 'TypeScript', 'GraphQL'],
            links: [{ label: 'Copilot Travel', url: 'https://copilottravel.com/' }],
            videos: [
                {
                    provider: 'youtube',
                    id: 'Nrv5DMTFNUw',
                    caption: 'Copilot Travel flight-booking demonstration',
                },
            ],
        },
        {
            id: 'portfolio-suite',
            title: 'Interactive Portfolio Suite',
            category: 'Portfolio / Three.js',
            featuredOrder: 3,
            summary: 'A main portfolio, 3D room, desktop-style OS, and printable resume.',
            details: [],
            technologies: ['React', 'Three.js', 'TypeScript'],
            links: [
                { label: 'Main Portfolio', url: 'https://usamaaslam.site/' },
                { label: '3D Portfolio', url: 'https://3d.usamaaslam.site/' },
                { label: 'OS Portfolio', url: 'https://os.usamaaslam.site/' },
            ],
            videos: [
                {
                    provider: 'youtube',
                    id: 'DqgwT4pzTeM',
                    caption: 'Blender scene and 3D portfolio demonstration',
                },
            ],
        },
    ],
    uses: [],
    articles: [],
    sites: [
        { id: 'main', label: 'Main Portfolio', url: 'https://usamaaslam.site/' },
        { id: 'three-d', label: '3D Portfolio', url: 'https://3d.usamaaslam.site/' },
        { id: 'os', label: 'OS Portfolio', url: 'https://os.usamaaslam.site/' },
        { id: 'resume', label: 'Resume', url: 'https://u7ama.github.io/resume/' },
    ],
};

export type PortfolioContentSource = 'fallback' | 'cache' | 'network';
export type PortfolioContentStatus = 'refreshing' | 'ready' | 'stale';

export interface PortfolioContentState {
    data: PortfolioDataV1;
    source: PortfolioContentSource;
    status: PortfolioContentStatus;
    error?: string;
}

export interface PortfolioStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}

interface CachedPortfolio {
    markdown: string;
    savedAt: string;
}

export interface FetchPortfolioOptions {
    url?: string;
    fetcher?: typeof fetch;
    signal?: AbortSignal;
    timeoutMs?: number;
}

export interface RefreshPortfolioOptions extends FetchPortfolioOptions {
    current: PortfolioContentState;
    storage?: PortfolioStorage | null;
    now?: () => Date;
    canCommit?: () => boolean;
}

export class PortfolioContentTimeoutError extends Error {
    constructor() {
        super('The shared portfolio request timed out.');
        this.name = 'PortfolioContentTimeoutError';
    }
}

/**
 * Read the last parser-validated document synchronously so consumers can paint
 * useful content before starting network revalidation. Cache age is
 * intentionally not an expiry condition: an old valid document is safer than
 * replacing the page with an empty state while offline.
 */
export const readPortfolioCache = (
    storage?: PortfolioStorage | null
): PortfolioContentState => {
    if (!storage) {
        return {
            data: FALLBACK_PORTFOLIO,
            source: 'fallback',
            status: 'refreshing',
        };
    }

    try {
        const rawCache = storage.getItem(PORTFOLIO_CACHE_KEY);
        if (!rawCache) {
            return {
                data: FALLBACK_PORTFOLIO,
                source: 'fallback',
                status: 'refreshing',
            };
        }

        const cache = JSON.parse(rawCache) as Partial<CachedPortfolio>;
        if (typeof cache.markdown !== 'string') {
            throw new Error('Invalid portfolio cache.');
        }

        return {
            data: parsePortfolioMarkdown(cache.markdown),
            source: 'cache',
            status: 'refreshing',
        };
    } catch {
        try {
            storage.removeItem(PORTFOLIO_CACHE_KEY);
        } catch {
            // Storage may be read-only or unavailable in privacy modes.
        }
        return {
            data: FALLBACK_PORTFOLIO,
            source: 'fallback',
            status: 'refreshing',
        };
    }
};

export const writePortfolioCache = (
    storage: PortfolioStorage | null | undefined,
    markdown: string,
    now: () => Date = () => new Date()
) => {
    if (!storage) return false;

    try {
        storage.setItem(
            PORTFOLIO_CACHE_KEY,
            JSON.stringify({ markdown, savedAt: now().toISOString() })
        );
        return true;
    } catch {
        // A valid network response remains useful when storage is blocked or
        // its quota is exhausted.
        return false;
    }
};

export const readLimitedPortfolioText = async (response: Response) => {
    if (!response.body) {
        const bytes = new Uint8Array(await response.arrayBuffer());
        if (bytes.byteLength > MAX_PORTFOLIO_BYTES) {
            throw new Error('Portfolio content exceeds the 256 KiB limit.');
        }
        return new TextDecoder().decode(bytes);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let size = 0;
    let markdown = '';

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            size += value.byteLength;
            if (size > MAX_PORTFOLIO_BYTES) {
                try {
                    await reader.cancel();
                } catch {
                    // Preserve the size-limit error if stream cancellation fails.
                }
                throw new Error('Portfolio content exceeds the 256 KiB limit.');
            }
            markdown += decoder.decode(value, { stream: true });
        }
        return markdown + decoder.decode();
    } finally {
        reader.releaseLock();
    }
};

export const fetchPortfolioContent = async ({
    url = PORTFOLIO_CONTENT_URL,
    fetcher = fetch,
    signal,
    timeoutMs = DEFAULT_PORTFOLIO_TIMEOUT_MS,
}: FetchPortfolioOptions = {}) => {
    const controller = new AbortController();
    const forwardAbort = () => controller.abort(signal?.reason);
    if (signal?.aborted) forwardAbort();
    else signal?.addEventListener('abort', forwardAbort, { once: true });

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
            controller.abort();
            reject(new PortfolioContentTimeoutError());
        }, timeoutMs);
    });

    const request = (async () => {
        const response = await fetcher(url, {
            cache: 'no-cache',
            signal: controller.signal,
            headers: { Accept: 'text/markdown, text/plain;q=0.9' },
        });
        if (!response.ok) {
            throw new Error(`Shared portfolio returned HTTP ${response.status}.`);
        }

        const contentLength = response.headers.get('content-length');
        const declaredSize = contentLength === null ? NaN : Number(contentLength);
        if (Number.isFinite(declaredSize) && declaredSize > MAX_PORTFOLIO_BYTES) {
            throw new Error('Portfolio content exceeds the 256 KiB limit.');
        }

        const markdown = await readLimitedPortfolioText(response);
        return { markdown, data: parsePortfolioMarkdown(markdown) };
    })();

    try {
        return await Promise.race([request, timeout]);
    } finally {
        if (timeoutId !== undefined) clearTimeout(timeoutId);
        signal?.removeEventListener('abort', forwardAbort);
    }
};

export const friendlyPortfolioError = (error: unknown) => {
    if (error instanceof PortfolioContentTimeoutError) return error.message;
    if (error instanceof DOMException && error.name === 'AbortError') {
        return 'The shared portfolio request was cancelled.';
    }
    if (error instanceof Error && error.message) return error.message;
    return 'The shared portfolio could not be refreshed.';
};

/**
 * Produce the next immutable content state. Failures deliberately retain the
 * current parser-validated cache or bundled fallback. Calling this function
 * again is the retry/recovery path used by the provider.
 */
export const refreshPortfolioContent = async ({
    current,
    storage,
    now,
    canCommit,
    ...fetchOptions
}: RefreshPortfolioOptions): Promise<PortfolioContentState> => {
    try {
        const { markdown, data } = await fetchPortfolioContent(fetchOptions);
        if (canCommit && !canCommit()) return current;
        writePortfolioCache(storage, markdown, now);
        return { data, source: 'network', status: 'ready' };
    } catch (error) {
        return {
            ...current,
            status: 'stale',
            error: friendlyPortfolioError(error),
        };
    }
};
