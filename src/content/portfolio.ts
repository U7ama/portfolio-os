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
    "schemaVersion": 1,
    "profile": {
        "name": "Usama Aslam",
        "headline": "Full-Stack Engineer | Applied AI & Cloud",
        "summary": [
            "Full-stack engineer with 4+ years building production SaaS applications, APIs, and real-time AV/IoT systems across travel, healthcare, hospitality, and e-commerce.",
            "Builds with React, Next.js, TypeScript, Node.js, and Python/FastAPI, including tenant-scoped AI assistants, multimodal integrations, and retrieval-augmented generation (RAG).",
            "Work covers architecture, data modeling, testing, and cloud deployment, with a focus on reliability and type safety. Also builds interactive 3D and desktop-style web experiences."
        ],
        "disciplines": [
            "Applied AI",
            "React & Next.js",
            "Node.js & Python",
            "Cloud & DevOps",
            "RAG & AI Agents",
            "IoT & Real-time",
            "3D & Creative Web"
        ]
    },
    "contacts": [
        {
            "id": "email",
            "label": "Email",
            "url": "mailto:u7amaaslam@gmail.com"
        },
        {
            "id": "website",
            "label": "Main Portfolio",
            "url": "https://usamaaslam.site/"
        },
        {
            "id": "github",
            "label": "GitHub",
            "url": "https://github.com/U7ama"
        },
        {
            "id": "linkedin",
            "label": "LinkedIn",
            "url": "https://www.linkedin.com/in/usama-aslam-638584194/"
        },
        {
            "id": "instagram",
            "label": "Instagram",
            "url": "https://www.instagram.com/u7ama.aslam/"
        },
        {
            "id": "facebook",
            "label": "Facebook",
            "url": "https://www.facebook.com/u7ama.jatt"
        },
        {
            "id": "phone",
            "label": "Phone",
            "url": "tel:+923016441046"
        },
        {
            "id": "upwork",
            "label": "Upwork",
            "url": "https://www.upwork.com/freelancers/usamaa241?mp_source=share"
        },
        {
            "id": "resume",
            "label": "Resume",
            "url": "https://u7ama.github.io/resume/"
        }
    ],
    "experience": [
        {
            "id": "freelance-upwork",
            "role": "Full Stack Engineer",
            "organization": "Freelance via Upwork",
            "location": "Remote",
            "period": "Jul 2024 - Present",
            "website": "https://www.upwork.com/freelancers/usamaa241?mp_source=share",
            "summary": "Provide freelance full-stack development services to clients through Upwork.",
            "details": [
                "Work independently through Upwork on full-stack development."
            ]
        },
        {
            "id": "alignav",
            "role": "Full Stack Engineer",
            "organization": "AlignAV",
            "location": "Remote",
            "period": "Aug 2024 - Sep 2026",
            "website": "https://www.alignav.com/",
            "summary": "Developed dashboards, edge services, and AI tools for an AV/IoT monitoring platform covering 5,000+ connected devices.",
            "details": [
                "Led development of Next.js asset-management and monitoring dashboards for 5,000+ connected devices, with telemetry from edge services and cloud infrastructure.",
                "Developed edge services and a C# Windows monitoring client connected to Azure IoT Hub.",
                "Implemented a tenant-scoped, read-only AI assistant providing cited troubleshooting guidance from authorized room/device data and knowledge articles.",
                "Added AI-assisted import mapping and validation warnings, with human review before records are saved.",
                "Managed deployment pipelines using Azure DevOps and Docker."
            ]
        },
        {
            "id": "olumi-tech",
            "role": "Node.js Developer",
            "organization": "Olumi Tech",
            "location": "Remote",
            "period": "Nov 2023 - Jan 2025",
            "website": "",
            "summary": "Delivered full-stack features, APIs, integrations, and deployment support across seven client products.",
            "details": [
                "Built frontend features and backend APIs using React, Node.js, and Python/FastAPI.",
                "Additional technologies included AWS, GCP, Firebase, SQL, Stripe, Shopify, OAuth, and Mailgun.",
                "Integrated Gemini image analysis for ingredient identification and recipe discovery in Cool Potato, and OpenAI-assisted journaling in Diary Synergy.",
                "Contributed to Sunridge Medical, Lisbon Hop On, Beetkom, MedLab QCS, and Levante Cuisine."
            ]
        },
        {
            "id": "xecutors",
            "role": "Full Stack Developer",
            "organization": "Xecutors",
            "location": "Islamabad",
            "period": "Aug 2022 - Oct 2023",
            "website": "https://www.xecutors.com/",
            "summary": "Developed backend services and reusable frontend components for travel, payments, messaging, documents, and administrative workflows.",
            "details": [
                "Coordinated Agile delivery through daily stand-ups and Jira.",
                "Developed Node.js serverless microservices behind Kong API Gateway, using OpenAPI 3 and OAuth.",
                "Automated AWS/GCP infrastructure with Terraform and deployed Kong Ingress on GKE/Anthos.",
                "Built independently deployable Next.js/TypeScript microfrontends and reusable web components with Stencil.js and Bit.",
                "Integrated PostgreSQL and GraphQL/Hasura, alongside Stripe, Braintree, SendGrid, WhatsApp Business API, Amadeus, DocuSign, and Adobe PDF generation."
            ]
        },
        {
            "id": "stash-technologies",
            "role": "React/Node.js Developer",
            "organization": "Stash Technologies",
            "location": "Remote",
            "period": "Mar 2022 - Aug 2022",
            "website": "https://stashtechnologies.com/",
            "summary": "Built hotel discovery and booking flows for Roomph.pk using React, Node.js, REST APIs, and MongoDB.",
            "details": [
                "Developed REST endpoints and user-facing booking features.",
                "Reduced redundant rendering and API requests through frontend refactoring."
            ]
        }
    ],
    "skills": [
        {
            "id": "frontend",
            "label": "Frontend and Testing",
            "items": [
                "React.js",
                "Next.js",
                "TypeScript",
                "JavaScript",
                "Tailwind CSS",
                "HTML",
                "CSS",
                "Playwright",
                "Dashboards",
                "Three.js",
                "WebGL",
                "Framer Motion"
            ]
        },
        {
            "id": "backend",
            "label": "Backend and APIs",
            "items": [
                "Node.js",
                "Python",
                "FastAPI",
                "REST",
                "GraphQL",
                "WebSockets",
                "OAuth",
                "Redis queues",
                "Cron jobs",
                "Third-party integrations"
            ]
        },
        {
            "id": "applied-ai",
            "label": "Applied AI",
            "items": [
                "pgvector RAG, full-text search (FTS), and reciprocal-rank fusion (RRF)",
                "Tenant-scoped AI assistants",
                "Cited AI guidance",
                "Bounded, tenant-scoped tool workflows and agents",
                "OpenAI and Gemini integrations",
                "Multimodal Gemini image analysis",
                "Structured outputs and runtime validation",
                "Prompt-injection defenses, approvals, idempotency, and audit trails",
                "Streaming AI APIs and durable SSE replay",
                "Signed n8n automation and read-only MCP integration",
                "AI evaluations, regression testing, and observability"
            ]
        },
        {
            "id": "ai-cloud",
            "label": "Cloud and Delivery",
            "items": [
                "AWS",
                "GCP",
                "Azure IoT Hub and Edge",
                "Docker",
                "Kubernetes",
                "Terraform",
                "CI/CD (GitHub Actions, Azure DevOps)",
                "Observability",
                "Vercel",
                "Cloudflare"
            ]
        },
        {
            "id": "data-tools",
            "label": "Data and Product Integrations",
            "items": [
                "PostgreSQL",
                "MongoDB",
                "MySQL",
                "Firebase",
                "Cosmos DB",
                "Stripe",
                "Braintree",
                "Shopify",
                "SendGrid",
                "Amadeus",
                "DocuSign"
            ]
        }
    ],
    "education": [
        {
            "id": "bscs",
            "qualification": "BSCS, CGPA 3.30/4.00",
            "institution": "PMAS Arid Agriculture University",
            "location": "Rawalpindi",
            "period": "2018 - 2022",
            "details": [
                "Built a plant image-recognition web application for university research as the final-year Hemp Project."
            ],
            "links": [
                {
                    "label": "ECOSF Hemp Value Chain Development",
                    "url": "https://eco4science.org/Hemp-Value-Chain-Development"
                }
            ]
        },
        {
            "id": "fsc-pre-engineering",
            "qualification": "FSc Pre-Engineering",
            "institution": "Punjab College of Science",
            "location": "Gujranwala",
            "period": "2015 - 2017",
            "details": [
                "Completed pre-engineering studies before beginning the BSCS program."
            ],
            "links": []
        },
        {
            "id": "python-fundamentals",
            "qualification": "Python Fundamentals Certification",
            "institution": "DataCamp",
            "location": "Online",
            "period": "2020",
            "details": [
                "Completed foundational Python programming coursework and exercises."
            ],
            "links": []
        }
    ],
    "projects": [
        {
            "id": "blindspot-edu",
            "title": "Blindspot Edu",
            "category": "Applied AI / Education",
            "featuredOrder": null,
            "summary": "An AI learning platform that turns lecture recordings into guided lessons, identifies missing prerequisites, and connects explanations to timestamped source evidence.",
            "details": [
                "Built a Next.js and FastAPI application with audio/video upload, supported YouTube and direct-media imports, and in-browser lecture recording.",
                "Combined faster-whisper transcription and Qwen reasoning to check prerequisite coverage across the recording and generate guided learning paths, explanations, and worked examples.",
                "Implemented diagnostic checks and different reassessment questions, with saved learner progress and inspectable transcript excerpts beside the lesson.",
                "Added resumable background processing, transcript and model-response caches, and isolated anonymous learner sessions for private uploads and progress.",
                "Deployed on AWS EC2 with private S3 media storage, optional Polly narration, SES completion emails, CloudFormation infrastructure, and Systems Manager operations."
            ],
            "technologies": [
                "Next.js",
                "TypeScript",
                "Python",
                "FastAPI",
                "faster-whisper",
                "Qwen",
                "SQLite",
                "AWS EC2",
                "Amazon S3",
                "Amazon Polly",
                "Amazon SES",
                "CloudFormation",
                "Caddy"
            ],
            "links": [
                {
                    "label": "Website",
                    "url": "https://blindspot-edu.online"
                },
                {
                    "label": "Repository",
                    "url": "https://github.com/U7ama/blindspot-edu"
                },
                {
                    "label": "Demo",
                    "url": "https://youtu.be/krE6TKkHGLw"
                }
            ],
            "videos": [
                {
                    "provider": "youtube",
                    "id": "krE6TKkHGLw",
                    "caption": "Blindspot Edu learning journey and AWS deployment demonstration"
                }
            ]
        },
        {
            "id": "deviceops-ai-copilot",
            "title": "DeviceOps AI Copilot",
            "category": "Applied AI / SaaS / IoT",
            "featuredOrder": null,
            "summary": "An AI copilot for device-operations teams, with multi-tenant RAG, cited troubleshooting guidance, approval-gated workflows, signed n8n automation, and an Expo technician app.",
            "details": [
                "Built a TypeScript workspace with Next.js, PostgreSQL Row-Level Security, pgvector semantic retrieval, PostgreSQL full-text search, and reciprocal-rank fusion for cited troubleshooting guidance.",
                "Implemented Zod-validated diagnoses and bounded, tenant-scoped read-only tool workflows, with prompt-injection defenses, approval-gated incident proposals, idempotency, audit events, and durable, reconnectable SSE run timelines.",
                "Added pg-boss workers and a transactional outbox, signed n8n incident routing with replay protection, and a read-only MCP adapter over authorized application services.",
                "Created an Expo technician app with secure sign-in, room and device context, reconnectable run status, citations, uncertainty indicators, and approval status.",
                "Added a 40-case evaluation suite plus unit, API-smoke, contract, MCP, and load checks for retrieval quality, output validity, isolation, retries, and failure handling."
            ],
            "technologies": [
                "Next.js",
                "TypeScript",
                "PostgreSQL",
                "pgvector",
                "Drizzle ORM",
                "pg-boss",
                "Zod",
                "n8n",
                "Expo",
                "Playwright",
                "Docker",
                "MCP",
                "SSE"
            ],
            "links": [
                {
                    "label": "Core Repository",
                    "url": "https://github.com/U7ama/deviceops-ai-copilot"
                },
                {
                    "label": "Mobile App",
                    "url": "https://github.com/U7ama/deviceops-mobile"
                },
                {
                    "label": "Automations",
                    "url": "https://github.com/U7ama/deviceops-automations"
                }
            ],
            "videos": []
        },
        {
            "id": "alignav-monitoring",
            "title": "AlignAV Monitoring",
            "category": "AI / SaaS / IoT",
            "featuredOrder": null,
            "summary": "Asset management and real-time monitoring for 5,000+ connected AV/IoT devices, with live room telemetry and AI troubleshooting guidance.",
            "details": [
                "Built a multi-tenant Next.js dashboard with Cosmos DB and WebSockets for live device status and room telemetry.",
                "Developed edge services and a C# Windows monitoring client communicating with Azure IoT Hub.",
                "Implemented a tenant-scoped, read-only AI assistant providing cited troubleshooting guidance from authorized room/device data and knowledge articles.",
                "Added AI-assisted import mapping and validation warnings, with human review before records are saved."
            ],
            "technologies": [
                "Next.js",
                "TypeScript",
                "Node.js",
                "Python",
                "C#",
                "Azure IoT",
                "Cosmos DB",
                "Docker",
                "WebSockets"
            ],
            "links": [
                {
                    "label": "Website",
                    "url": "https://www.alignav.com/"
                }
            ],
            "videos": []
        },
        {
            "id": "copilot-travel",
            "title": "Copilot Travel",
            "category": "Travel / Web Component",
            "featuredOrder": 2,
            "summary": "A reusable flight-search and booking web component delivered through Xecutors for integration into existing websites.",
            "details": [
                "Built a Next.js/TypeScript frontend and packaged it as a reusable web component with Stencil.js and Bit.",
                "Used Apollo GraphQL subgraphs and serverless functions deployed across GCP, AWS, and Azure, with load balancing for performance and availability.",
                "Designed the component to run independently of the host website's frontend framework."
            ],
            "technologies": [
                "Next.js",
                "TypeScript",
                "Stencil.js",
                "Bit",
                "Apollo GraphQL",
                "GCP",
                "AWS",
                "Azure"
            ],
            "links": [
                {
                    "label": "Copilot Travel",
                    "url": "https://copilottravel.com/"
                },
                {
                    "label": "Integrated Travel Component",
                    "url": "https://www.integratedtravelcomponent.com/"
                }
            ],
            "videos": [
                {
                    "provider": "youtube",
                    "id": "Nrv5DMTFNUw",
                    "caption": "Copilot Travel flight-booking demonstration"
                }
            ]
        },
        {
            "id": "roomph",
            "title": "Roomph.pk",
            "category": "Hospitality / Booking",
            "featuredOrder": 1,
            "summary": "A hotel discovery and booking platform in Pakistan.",
            "details": [
                "Built hotel discovery and booking flows using React, Node.js, MongoDB, and REST APIs.",
                "Supports hotel discovery, amenity comparison, real-time room availability, and booking, with responsive property profiles, photo galleries, and multi-step checkout.",
                "Reduced redundant frontend rendering and API requests."
            ],
            "technologies": [
                "React",
                "Node.js",
                "MongoDB",
                "REST APIs",
                "Bootstrap"
            ],
            "links": [
                {
                    "label": "Website",
                    "url": "https://roomph.pk/"
                }
            ],
            "videos": [
                {
                    "provider": "youtube",
                    "id": "mSMHyw9E0bM",
                    "caption": "Roomph hotel-booking application demonstration"
                }
            ]
        },
        {
            "id": "xecutors-platforms",
            "title": "Xecutors",
            "category": "Travel / Enterprise",
            "featuredOrder": 3,
            "summary": "Full-stack contributions to subscription-based products, including backend services, frontend components, and integrations for travel, payments, documents, and communications.",
            "details": [],
            "technologies": [
                "Next.js",
                "Node.js",
                "GraphQL",
                "PostgreSQL",
                "Cloud Functions"
            ],
            "links": [
                {
                    "label": "Website",
                    "url": "https://www.xecutors.com/"
                }
            ],
            "videos": []
        },
        {
            "id": "portfolio-suite",
            "title": "Interactive Portfolio Suite",
            "category": "Portfolio / Three.js",
            "featuredOrder": null,
            "summary": "A portfolio presented as a main website, a 3D scene, a desktop-style app, and a printable resume.",
            "details": [
                "The Three.js scene uses a Blender-authored environment and embeds the standalone React desktop portfolio in its monitor.",
                "The React desktop interface renders portfolio pages directly and forwards trusted input events to the surrounding 3D scene."
            ],
            "technologies": [
                "Next.js",
                "React",
                "TypeScript",
                "Three.js",
                "WebGL",
                "Blender",
                "Webpack",
                "Vite"
            ],
            "links": [
                {
                    "label": "Main Portfolio",
                    "url": "https://usamaaslam.site/"
                },
                {
                    "label": "3D Portfolio",
                    "url": "https://3d.usamaaslam.site/"
                },
                {
                    "label": "OS Portfolio",
                    "url": "https://os.usamaaslam.site/"
                },
                {
                    "label": "OS Repository",
                    "url": "https://github.com/U7ama/portfolio-os"
                }
            ],
            "videos": [
                {
                    "provider": "youtube",
                    "id": "DqgwT4pzTeM",
                    "caption": "Blender scene and 3D portfolio demonstration"
                }
            ]
        },
        {
            "id": "cool-potato",
            "title": "Cool Potato",
            "category": "AI / SaaS",
            "featuredOrder": null,
            "summary": "A recipe app that identifies ingredients in food images and suggests recipes based on user preferences and dietary needs, including diabetic-friendly options.",
            "details": [
                "Integrated Gemini image analysis to identify ingredients and support recipe discovery based on dietary preferences.",
                "Includes a potato mascot that presents recipes, plus community tools for organizing and joining food festivals.",
                "Features schema-validated ingredient extraction, automated quality checks, and dietary-aware recipe retrieval."
            ],
            "technologies": [
                "Node.js",
                "Gemini",
                "MongoDB",
                "Mongoose",
                "Google Cloud Run",
                "Docker"
            ],
            "links": [
                {
                    "label": "App Store",
                    "url": "https://apps.apple.com/ca/app/coolpotato/id6677017071"
                }
            ],
            "videos": []
        },
        {
            "id": "sunridge-medical",
            "title": "Sunridge Medical",
            "category": "Healthcare / Web Application",
            "featuredOrder": null,
            "summary": "Built a clinic operations dashboard for patient records, appointments, treatment tracking, lab results, and staff workflows.",
            "details": [
                "Included progress tracking, staff communications, room assignments, and task management.",
                "Integrated Google Calendar scheduling, reporting, treatment and medicine suggestions, and a Shopify-connected dispensing workflow."
            ],
            "technologies": [
                "MongoDB",
                "Express.js",
                "React",
                "Node.js",
                "Material UI",
                "Socket.io",
                "Google Calendar API",
                "Shopify",
                "DigitalOcean"
            ],
            "links": [
                {
                    "label": "Website",
                    "url": "https://sunridgemedical.com/"
                }
            ],
            "videos": []
        },
        {
            "id": "medlab-qcs",
            "title": "MedLab QCS",
            "category": "Healthcare / SaaS",
            "featuredOrder": null,
            "summary": "A laboratory quality-assurance platform for tracking equipment, calibrations, audits, and inventory.",
            "details": [
                "Administrators can manage staff, instrument maintenance, calibrations, reagents, device temperature logs, audits, software, inventory, and Google Workspace records."
            ],
            "technologies": [
                "React",
                "Google Sheets automation",
                "Google Docs API",
                "Google Forms",
                "Serverless computing"
            ],
            "links": [
                {
                    "label": "Application",
                    "url": "https://qcsmlab-555fa.web.app/"
                }
            ],
            "videos": []
        },
        {
            "id": "etravelo",
            "title": "eTravelo",
            "category": "Travel / Web Application",
            "featuredOrder": null,
            "summary": "Contributions to frontend features, backend services, integrations, and operational workflows for a travel application.",
            "details": [],
            "technologies": [
                "Next.js",
                "Node.js",
                "GraphQL",
                "Travel APIs"
            ],
            "links": [
                {
                    "label": "Website",
                    "url": "https://www.etravelo.co.uk/"
                }
            ],
            "videos": []
        },
        {
            "id": "lisbon-hop-on",
            "title": "Lisbon Hop On",
            "category": "Travel / Web Application",
            "featuredOrder": null,
            "summary": "Contributed full-stack implementation and deployment support to a travel application during Olumi Tech work.",
            "details": [],
            "technologies": [
                "React",
                "Node.js",
                "APIs",
                "Cloud deployment"
            ],
            "links": [
                {
                    "label": "Website",
                    "url": "https://lisbonhopon.vercel.app/"
                }
            ],
            "videos": []
        },
        {
            "id": "beetkom",
            "title": "Beetkom",
            "category": "Real Estate / Backend",
            "featuredOrder": null,
            "summary": "Developed the backend for a property-listing application with multilingual support for English, Arabic, and Turkish.",
            "details": [
                "Implemented application services and communication workflows for the real-estate platform."
            ],
            "technologies": [
                "Node.js",
                "Firebase",
                "Twilio API",
                "Sequelize",
                "SQLite"
            ],
            "links": [
                {
                    "label": "Website",
                    "url": "https://beetkom.vercel.app/"
                }
            ],
            "videos": []
        },
        {
            "id": "info-latch",
            "title": "InfoLatch",
            "category": "Agency / Website",
            "featuredOrder": null,
            "summary": "A responsive website presenting a software-development agency, its services, process, and client work.",
            "details": [],
            "technologies": [
                "Next.js",
                "Tailwind CSS"
            ],
            "links": [
                {
                    "label": "Website",
                    "url": "https://infolatch.uk/"
                }
            ],
            "videos": []
        },
        {
            "id": "anchored-to-you",
            "title": "Anchored To You",
            "category": "AI / Computer Vision",
            "featuredOrder": null,
            "summary": "A computer-vision prototype for estimating nail size from images.",
            "details": [
                "Moved the backend approach from Node.js to Python, labeled nail-image data, and trained and fine-tuned a PyTorch model with AWS SageMaker.",
                "Integrated the model into a FastAPI backend deployed on AWS EC2."
            ],
            "technologies": [
                "Python",
                "PyTorch",
                "AWS SageMaker",
                "FastAPI",
                "AWS EC2",
                "Computer vision"
            ],
            "links": [
                {
                    "label": "Project Website",
                    "url": "https://www.anchoredtoyou.com"
                }
            ],
            "videos": []
        },
        {
            "id": "pixel-copy",
            "title": "Pixel Copy",
            "category": "Content / Web Application",
            "featuredOrder": null,
            "summary": "A website for a copywriting team, with writing samples and a CMS-managed blog.",
            "details": [
                "Used DatoCMS and GraphQL so editors could update content without code changes."
            ],
            "technologies": [
                "React",
                "DatoCMS",
                "GraphQL"
            ],
            "links": [],
            "videos": [
                {
                    "provider": "youtube",
                    "id": "Tc7DLJVtETo",
                    "caption": "Pixel Copy demonstration"
                }
            ]
        },
        {
            "id": "diary-synergy",
            "title": "Diary Synergy AI Diary Assistant",
            "category": "AI / SaaS",
            "featuredOrder": null,
            "summary": "A journal app with mood-based AI writing assistance, privacy controls, and a subscription community.",
            "details": [
                "Integrated OpenAI-assisted journaling for mood-based entries.",
                "The subscription community lets users discover, connect, and chat with like-minded people.",
                "Users control mood-based entries and privacy settings, with contextual AI writing assistance."
            ],
            "technologies": [
                "Node.js",
                "OpenAI API",
                "Firebase",
                "Cloud Firestore",
                "Google App Engine"
            ],
            "links": [],
            "videos": []
        },
        {
            "id": "shopify-invoicing",
            "title": "Shopify Invoicing App",
            "category": "eCommerce / SaaS",
            "featuredOrder": null,
            "summary": "A Shopify-connected invoicing application delivered through freelance product and API integration work.",
            "details": [
                "Features automated order and invoice synchronization, idempotent data processing, and merchant approval workflows."
            ],
            "technologies": [
                "Shopify",
                "Node.js",
                "APIs",
                "SaaS"
            ],
            "links": [],
            "videos": []
        },
        {
            "id": "amici-friends",
            "title": "Amici Friends App",
            "category": "Social / Productivity",
            "featuredOrder": null,
            "summary": "A contact-management app that combines contacts from social platforms and supports birthday, chat, and meeting reminders.",
            "details": [],
            "technologies": [
                "Node.js",
                "Firebase",
                "Push notifications"
            ],
            "links": [],
            "videos": []
        },
        {
            "id": "kong-api-gateway",
            "title": "Kong API Gateway Platform",
            "category": "Cloud / API Management",
            "featuredOrder": null,
            "summary": "Kong infrastructure for routing serverless APIs and controlling access with OAuth.",
            "details": [
                "Deployed Kong Ingress on Google Kubernetes Engine with Anthos and published OpenAPI 3 specifications through the developer portal.",
                "Added OAuth access control and managed infrastructure with Terraform."
            ],
            "technologies": [
                "Kong",
                "GKE",
                "Anthos",
                "OpenAPI",
                "OAuth",
                "Terraform",
                "Node.js"
            ],
            "links": [],
            "videos": []
        },
        {
            "id": "levante-cuisine",
            "title": "Levante Cuisine",
            "category": "Hospitality / Web Application",
            "featuredOrder": null,
            "summary": "A hospitality web application delivered during Olumi Tech work. Its former public domain no longer represents this project.",
            "details": [],
            "technologies": [
                "React",
                "Node.js",
                "Cloud deployment"
            ],
            "links": [],
            "videos": []
        }
    ],
    "uses": [
        {
            "id": "design",
            "label": "Design",
            "items": [
                "Blender for modelling and preparing 3D assets used in interactive web experiences."
            ]
        },
        {
            "id": "development",
            "label": "Development",
            "items": [
                "Claude Code and OpenAI Codex for AI-assisted development, with engineering review and validation.",
                "Visual Studio Code with the Atom One Dark theme and Operator Mono for day-to-day development.",
                "Brave as the primary browser for development and general use.",
                "React for component-oriented frontend development.",
                "Three.js for 3D effects, WebGL scenes, and image shaders.",
                "Vanilla CSS with PostCSS for maintainable styling and newer CSS features.",
                "Framer Motion for React animation and motion design."
            ]
        },
        {
            "id": "hardware",
            "label": "Hardware",
            "items": [
                "Lenovo X1 Carbon laptop",
                "Intel Core i5 vPro 8th Gen CPU",
                "Intel UHD 640 graphics",
                "Samsung 16GB DDR4 memory",
                "Logitech G403 mouse"
            ]
        }
    ],
    "articles": [
        {
            "id": "nextjs-loading",
            "title": "How To Handle Loading Between Page Changes in Next.js 14 App Router",
            "date": "2024-04-27",
            "summary": "Add a loading indicator to a Next.js App Router application using Zustand and route-change awareness.",
            "links": [
                {
                    "label": "Read article",
                    "url": "https://usamaaslam.site/articles/nextjs-loading/"
                }
            ]
        },
        {
            "id": "cloud-functions",
            "title": "Deploying Cloud Functions in Node.js using Apollo Studio on AWS, Azure, and GCP through Terraform",
            "date": "2023-05-23",
            "summary": "An introduction to deploying Node.js GraphQL cloud functions across AWS, Azure, and GCP with Terraform.",
            "links": [
                {
                    "label": "Read article",
                    "url": "https://usamaaslam.site/articles/cloud-functions/"
                }
            ]
        },
        {
            "id": "cloudflare",
            "title": "Uploading Images to Cloudflare R2 using Bash and Rclone",
            "date": "2023-05-22",
            "summary": "Use Rclone and a Bash workflow to upload and synchronize images with Cloudflare R2 storage.",
            "links": [
                {
                    "label": "Read article",
                    "url": "https://usamaaslam.site/articles/cloudflare/"
                }
            ]
        }
    ],
    "sites": [
        {
            "id": "main",
            "label": "Main Portfolio",
            "url": "https://usamaaslam.site/"
        },
        {
            "id": "three-d",
            "label": "3D Portfolio",
            "url": "https://3d.usamaaslam.site/"
        },
        {
            "id": "os",
            "label": "OS Portfolio",
            "url": "https://os.usamaaslam.site/"
        },
        {
            "id": "resume",
            "label": "Resume",
            "url": "https://u7ama.github.io/resume/"
        }
    ]
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
