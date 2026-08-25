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
            "Full-stack engineer with 4+ years delivering production SaaS platforms, AI-enabled systems, scalable APIs, and real-time AV/IoT solutions across travel, healthcare, hospitality, and eCommerce.",
            "Combines strong full-stack fundamentals (React, Next.js, TypeScript, Node.js, Python/FastAPI) with Applied AI architectures, focusing on system reliability, type safety, evaluation-led testing, and automated cloud deployments.",
            "Focuses on end-to-end software ownership—from early architecture and data modeling to production release—while exploring interactive 3D graphics, desktop web simulations, and creative UI engineering."
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
            "id": "alignav",
            "role": "Full Stack Engineer",
            "organization": "AlignAV",
            "location": "Remote",
            "period": "Aug 2024 - Present",
            "website": "https://www.alignav.com/",
            "summary": "Full-stack engineering and real-time AV/IoT monitoring platform development with Azure IoT, Next.js, and AI guidance systems.",
            "details": [
                "Led development of asset management and real-time AV/IoT monitoring dashboards for 5,000+ connected devices, coordinating telemetry across edge services and cloud infrastructure.",
                "Implemented tenant-scoped AI assistance over permitted room/device data and knowledge articles for cited troubleshooting guidance.",
                "Implemented AI-assisted import mapping with human review safeguards before database commit.",
                "Managed deployment pipelines with Azure DevOps and Docker, ensuring reliable device telemetry and seamless client onboarding."
            ]
        },
        {
            "id": "olumi-tech",
            "role": "Full Stack Developer",
            "organization": "Olumi Tech",
            "location": "Remote",
            "period": "Nov 2023 - Feb 2025",
            "website": "",
            "summary": "Worked remotely on full stack web applications from initial implementation through integrations and deployment support.",
            "details": [
                "Used React, Node.js, Python/FastAPI, AWS, GCP, Firebase, SQL, Stripe, Shopify, OAuth, Mailgun, OpenAI, and Gemini.",
                "Integrated multimodal Gemini vision for recipe discovery in Cool Potato, plus OpenAI-assisted journaling in Diary Synergy.",
                "Contributed across healthcare, hospitality, eCommerce, and travel client products including Sunridge Medical, Lisbon Hop On, Beetkom, MedLab QCS, and Levante Cuisine."
            ]
        },
        {
            "id": "xecutors",
            "role": "Full Stack Developer",
            "organization": "Xecutors",
            "location": "Islamabad",
            "period": "Aug 2022 - Oct 2023",
            "website": "https://www.xecutors.com/",
            "summary": "Created backend services and frontend integrations for travel, payments, documents, communication, and administrative workflows.",
            "details": [
                "Coordinated Agile work through daily stand-ups and JIRA while collaborating across reusable frontend and backend deliverables.",
                "Developed Node.js serverless microservices, routed and secured them through Kong API Gateway, and automated cloud deployment with Terraform across GCP and AWS.",
                "Built micro frontend packages and web components with Next.js, TypeScript, Stencil.js, and Bit so features could be developed and deployed independently.",
                "Integrated PostgreSQL, GraphQL and Hasura, Stripe and Braintree, SendGrid, OAuth, WhatsApp Business API, Amadeus, DocuSign, and Adobe PDF generation."
            ]
        },
        {
            "id": "stash-technologies",
            "role": "MERN Stack Developer",
            "organization": "Stash Technologies",
            "location": "Remote",
            "period": "Mar 2022 - Aug 2022",
            "website": "https://stashtechnologies.com/",
            "summary": "Built Roomph.pk hotel booking flows with React.js, Node.js, REST APIs, and MongoDB.",
            "details": [
                "Designed REST endpoints and user-facing booking features with an emphasis on maintainability and reliable data handling.",
                "Refactored frontend rendering and API usage to reduce redundant work and provide a smoother booking experience."
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
                "Queues (Redis)",
                "Cron jobs",
                "Third-party integrations"
            ]
        },
        {
            "id": "applied-ai",
            "label": "Applied AI",
            "items": [
                "pgvector RAG with FTS and RRF",
                "Tenant-scoped AI assistants",
                "Cited AI guidance",
                "Bounded tenant-bound tool workflows and agents",
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
            "qualification": "BSCS, CGPA 3.30",
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
            "qualification": "FSC Pre Engineering",
            "institution": "Punjab College",
            "location": "Gujranwala",
            "period": "2016 - 2018",
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
            "id": "deviceops-ai-copilot",
            "title": "DeviceOps AI Copilot",
            "category": "Applied AI / SaaS / IoT",
            "featuredOrder": null,
            "summary": "A production-grade Applied AI and IoT copilot for device-operations teams, combining multi-tenant RAG, bounded agentic workflows, approval controls, n8n automation, and an Expo technician client.",
            "details": [
                "Built a TypeScript workspace with Next.js, PostgreSQL Row-Level Security, pgvector semantic retrieval, PostgreSQL full-text search, and reciprocal-rank fusion for cited troubleshooting guidance.",
                "Implemented structured diagnoses with Zod validation, tenant-bound read-only tools, prompt-injection defenses, approval-gated incident proposals, idempotency, audit events, and durable SSE run timelines.",
                "Added pg-boss workers and a transactional outbox, signed n8n incident routing with replay protection, and a read-only MCP adapter over authorized application services.",
                "Created an Expo technician workflow for secure sign-in, room and device context, reconnectable run status, citations, uncertainty, and approval status.",
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
            "summary": "Asset management and real-time AV/IoT monitoring for 5,000+ connected devices, rooms, environments, and operational teams.",
            "details": [
                "Built an interactive multi-tenant Next.js dashboard backed by Cosmos DB and WebSockets for live status updates and room telemetry.",
                "Developed edge services and a C# Windows monitoring client communicating with Azure IoT Hub.",
                "Integrated tenant-scoped AI assistant providing cited troubleshooting steps and intelligent bulk data imports."
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
            "summary": "A versatile Travel Widget that serves as a comprehensive tool for flight search and customization. It is a plug-and-play web component designed for seamless integration with any website",
            "details": [
                "Built as a Next.js and TypeScript frontend packaged as a reusable web component with Stencil.js and Bit.",
                "Used Apollo GraphQL subgraphs and serverless functions deployed across GCP, AWS, and Azure, with load balancing for performance and availability.",
                "The architecture was designed as a plug-and-play component that could work independently of the host website technology."
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
            "summary": "Roomph.pk is a Hotel Booking Company in Pakistan. Built using React.js and Node.js",
            "details": [
                "Web platform for discovering hotels, comparing amenities, checking real-time room availability, and completing bookings.",
                "Features responsive property profiles, interactive photo galleries, and streamlined multi-step checkout."
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
            "summary": "Xecutors provides subscription-based digital solutions",
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
            "summary": "A connected set of main, 3D, desktop-style OS, and printable resume experiences presenting the same developer portfolio in different visual formats.",
            "details": [
                "The 3D experience uses Three.js and a Blender-authored environment, while its monitor securely embeds the standalone React OS portfolio.",
                "The OS experience recreates a desktop interface while rendering portfolio pages natively and forwarding a small trusted input-event protocol to the 3D parent."
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
            "summary": "An AI-powered recipe application that detects food items in images and suggests personalized recipes based on user preferences and dietary needs, including diabetic-friendly options.",
            "details": [
                "Integrated Gemini image understanding to identify ingredients from food images and combine them with dietary-aware recipe discovery.",
                "A potato character presents recipes in an engaging format, while community features help users organize and participate in food festivals.",
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
            "summary": "Built a medical-clinic operations dashboard for employees to manage patients, treatments, lab results, progress, communications, room assignments, appointments, and task status.",
            "details": [
                "Integrated Google Calendar scheduling, detailed reporting, suggested treatments and medicines, and a Shopify-connected dispensing workflow."
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
            "summary": "A precision-management platform for quality assurance in medical laboratories.",
            "details": [
                "Enables administrators to manage staff, instrument maintenance, calibrations, reagents, device temperature logs, audits, software, inventory, and Google Workspace records."
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
            "summary": "Travel product work covering frontend, backend services, integrations, and operational workflows.",
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
            "summary": "A travel application delivered during Olumi Tech work with full stack implementation and deployment support.",
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
            "summary": "A copywriting-team website with writing samples and dynamically managed blog content.",
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
            "summary": "An AI-powered daily diary application that helps users write entries based on their mood.",
            "details": [
                "Includes a subscription community where users can discover, connect, and chat with like-minded people.",
                "Includes user-controlled mood-based journal entries, privacy controls, and contextual AI writing assistance."
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
            "summary": "A friend-organization application that brings contacts from multiple social platforms together and supports reminders for birthdays, chats, and meetings.",
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
            "summary": "API-management infrastructure used to regulate traffic and secure serverless cloud functions.",
            "details": [
                "Deployed Kong Ingress on Google Kubernetes Engine with Anthos and published OpenAPI 3 specifications through the developer portal.",
                "Added OAuth-based access control and Terraform-managed infrastructure for scalable, documented API delivery."
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
            "summary": "A hospitality web project delivered during my Olumi Tech work. Its former public domain no longer represents this project.",
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
