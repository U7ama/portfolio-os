import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
    DEFAULT_PORTFOLIO_TIMEOUT_MS,
    FALLBACK_PORTFOLIO,
    MAX_PORTFOLIO_BYTES,
    PORTFOLIO_CACHE_KEY,
    readPortfolioCache,
    refreshPortfolioContent,
    parsePortfolioMarkdown,
} from '../src/content/portfolio.ts';

const fixtureUrl = new URL('./fixtures/portfolio-valid.md', import.meta.url);
const valid = await readFile(fixtureUrl, 'utf8');

class MemoryStorage {
    values = new Map<string, string>();
    removed: string[] = [];

    getItem(key: string) {
        return this.values.get(key) ?? null;
    }

    setItem(key: string, value: string) {
        this.values.set(key, value);
    }

    removeItem(key: string) {
        this.removed.push(key);
        this.values.delete(key);
    }
}

const cached = (markdown = valid, savedAt = '2000-01-01T00:00:00.000Z') =>
    JSON.stringify({ markdown, savedAt });

const responseWith = (body: BodyInit, init?: ResponseInit) =>
    Promise.resolve(new Response(body, init));

const withoutSection = (markdown: string, heading: string) =>
    markdown.replace(
        new RegExp(`\\n## ${heading}\\n[\\s\\S]*?(?=\\n## |$)`),
        ''
    );

test('parses schema v1 portfolio content', () => {
    const result = parsePortfolioMarkdown(valid);
    assert.equal(result.profile.name, 'Test Person');
    assert.equal(result.projects.length, 3);
    assert.equal(result.articles[0].title, 'Test Article');
});

test('requires every schema-v1 section heading', () => {
    const headings = [
        'Profile',
        'Contact',
        'Experience',
        'Skills',
        'Education',
        'Projects',
        'Uses',
        'Articles',
        'Portfolio Sites',
    ];

    for (const heading of headings) {
        assert.throws(
            () => parsePortfolioMarkdown(withoutSection(valid, heading)),
            new RegExp(`Missing required portfolio section: ${heading.toLowerCase()}`)
        );
    }
});

test('rejects unknown sections and missing required fields', () => {
    assert.throws(
        () => parsePortfolioMarkdown(valid.replace('## Uses', '## Unknown')),
        /Unknown section/
    );
    assert.throws(
        () =>
            parsePortfolioMarkdown(
                valid.replace('- summary | First project.', '- detail | Detail only.')
            ),
        /Project summary for project-a is required/
    );
});

test('requires populated profile and collection sections', () => {
    const emptyCases = [
        [valid.replace('- discipline | Full Stack\n', ''), /profile discipline/],
        [
            valid.replace('### development | Development\n\n- item | TypeScript\n', ''),
            /skill group/,
        ],
        [
            valid.replace(
                '### degree | BS Computer Science | Test University | Remote | 2020 - 2024\n\n- detail | Studied software engineering.\n',
                ''
            ),
            /education entry/,
        ],
        [valid.replace('### tools | Tools\n\n- item | Visual Studio Code\n', ''), /uses group/],
        [
            valid.replace(
                '### article | Test Article\n\n- date | 2026-01-01\n- summary | A test article.\n- link | Read article | https://example.com/article\n',
                ''
            ),
            /article/,
        ],
        [valid.replace('- main | Main Portfolio | https://example.com/\n', ''), /portfolio site/],
    ] as const;

    for (const [markdown, expected] of emptyCases) {
        assert.throws(() => parsePortfolioMarkdown(markdown), expected);
    }
});

test('requires every skills and uses group to contain items', () => {
    assert.throws(
        () => parsePortfolioMarkdown(valid.replace('- item | TypeScript\n', '')),
        /Skill group items required for development/
    );
    assert.throws(
        () => parsePortfolioMarkdown(valid.replace('- item | Visual Studio Code\n', '')),
        /Uses group items required for tools/
    );
});

test('rejects duplicate stable IDs', () => {
    assert.throws(
        () => parsePortfolioMarkdown(valid.replace('### project-c', '### project-b')),
        /Duplicate project id/
    );
});

test('requires project IDs to be stable lowercase slugs', () => {
    assert.throws(
        () => parsePortfolioMarkdown(valid.replace('### project-a', '### Project_A')),
        /Invalid project slug/
    );
});

test('rejects unknown schema versions', () => {
    assert.throws(
        () => parsePortfolioMarkdown(valid.replace('portfolio-schema: 1', 'portfolio-schema: 2')),
        /Unsupported portfolio schema version/
    );
});

test('rejects unsafe URLs', () => {
    assert.throws(
        () => parsePortfolioMarkdown(valid.replace('mailto:test@example.com', 'javascript:alert(1)')),
        /unsupported protocol/
    );
});

test('rejects malformed records and active HTML', () => {
    assert.throws(
        () => parsePortfolioMarkdown(valid.replace('- summary | First project.', '- summary')),
        /Invalid project record/
    );
    assert.throws(
        () => parsePortfolioMarkdown(`${valid}\n<script>alert(1)</script>`),
        /Raw active HTML/
    );
    assert.throws(
        () => parsePortfolioMarkdown(valid.replace('- item | TypeScript', '**broken markdown**')),
        /Unsupported content/
    );
});

test('rejects content over 256 KiB', () => {
    const oversized = valid + ' '.repeat(MAX_PORTFOLIO_BYTES);
    assert.throws(() => parsePortfolioMarkdown(oversized), /exceeds/);
});

test('uses the eight-second production timeout by default', () => {
    assert.equal(DEFAULT_PORTFOLIO_TIMEOUT_MS, 8000);
});

test('renders valid cached content immediately, including an old cache', () => {
    const storage = new MemoryStorage();
    storage.setItem(PORTFOLIO_CACHE_KEY, cached());

    const initial = readPortfolioCache(storage);

    assert.equal(initial.source, 'cache');
    assert.equal(initial.status, 'refreshing');
    assert.equal(initial.data.profile.name, 'Test Person');
    assert.deepEqual(storage.removed, []);
});

test('removes corrupt cache and starts with the bundled fallback', async (t) => {
    await t.test('invalid JSON', () => {
        const storage = new MemoryStorage();
        storage.setItem(PORTFOLIO_CACHE_KEY, '{not-json');

        const initial = readPortfolioCache(storage);

        assert.equal(initial.source, 'fallback');
        assert.strictEqual(initial.data, FALLBACK_PORTFOLIO);
        assert.deepEqual(storage.removed, [PORTFOLIO_CACHE_KEY]);
        assert.equal(storage.getItem(PORTFOLIO_CACHE_KEY), null);
    });

    await t.test('invalid cached Markdown', () => {
        const storage = new MemoryStorage();
        storage.setItem(PORTFOLIO_CACHE_KEY, cached('not portfolio Markdown'));

        const initial = readPortfolioCache(storage);

        assert.equal(initial.source, 'fallback');
        assert.strictEqual(initial.data, FALLBACK_PORTFOLIO);
        assert.deepEqual(storage.removed, [PORTFOLIO_CACHE_KEY]);
    });
});

test('network success validates, returns, and caches the document', async () => {
    const storage = new MemoryStorage();
    const initial = readPortfolioCache(storage);
    let requestedUrl = '';
    let requestInit: RequestInit | undefined;

    const result = await refreshPortfolioContent({
        current: initial,
        storage,
        url: 'https://u7ama.github.io/resume/portfolio.md',
        fetcher: (input, init) => {
            requestedUrl = String(input);
            requestInit = init;
            return responseWith(valid);
        },
        now: () => new Date('2026-07-13T00:00:00.000Z'),
    });

    assert.equal(result.source, 'network');
    assert.equal(result.status, 'ready');
    assert.equal(result.error, undefined);
    assert.equal(result.data.profile.name, 'Test Person');
    assert.equal(requestedUrl, 'https://u7ama.github.io/resume/portfolio.md');
    assert.equal(requestInit?.cache, 'no-cache');
    assert.match(String((requestInit?.headers as Record<string, string>).Accept), /text\/markdown/);

    const saved = JSON.parse(storage.getItem(PORTFOLIO_CACHE_KEY) ?? '{}');
    assert.equal(saved.markdown, valid);
    assert.equal(saved.savedAt, '2026-07-13T00:00:00.000Z');
});

test('Pages HTTP errors retain a valid stale cache', async () => {
    const storage = new MemoryStorage();
    storage.setItem(PORTFOLIO_CACHE_KEY, cached());
    const initial = readPortfolioCache(storage);

    const result = await refreshPortfolioContent({
        current: initial,
        storage,
        fetcher: () => responseWith('Not found', { status: 404 }),
    });

    assert.equal(result.source, 'cache');
    assert.equal(result.status, 'stale');
    assert.equal(result.data.profile.name, 'Test Person');
    assert.match(result.error ?? '', /HTTP 404/);
    assert.equal(storage.getItem(PORTFOLIO_CACHE_KEY), cached());
});

test('a Pages HTML error document cannot replace valid cached content', async () => {
    const storage = new MemoryStorage();
    storage.setItem(PORTFOLIO_CACHE_KEY, cached());
    const initial = readPortfolioCache(storage);

    const result = await refreshPortfolioContent({
        current: initial,
        storage,
        fetcher: () => responseWith('<!doctype html><title>GitHub Pages error</title>'),
    });

    assert.equal(result.source, 'cache');
    assert.equal(result.status, 'stale');
    assert.match(result.error ?? '', /Missing portfolio schema marker/);
    assert.equal(storage.getItem(PORTFOLIO_CACHE_KEY), cached());
});

test('offline first load retains the bundled minimal fallback', async () => {
    const initial = readPortfolioCache(null);
    const result = await refreshPortfolioContent({
        current: initial,
        fetcher: async () => {
            throw new TypeError('Network unavailable');
        },
    });

    assert.equal(result.source, 'fallback');
    assert.equal(result.status, 'stale');
    assert.strictEqual(result.data, FALLBACK_PORTFOLIO);
    assert.match(result.error ?? '', /Network unavailable/);
});

test('times out without discarding the current validated content', async () => {
    const storage = new MemoryStorage();
    storage.setItem(PORTFOLIO_CACHE_KEY, cached());
    const initial = readPortfolioCache(storage);

    const result = await refreshPortfolioContent({
        current: initial,
        storage,
        timeoutMs: 10,
        fetcher: () => new Promise<Response>(() => undefined),
    });

    assert.equal(result.source, 'cache');
    assert.equal(result.status, 'stale');
    assert.equal(result.error, 'The shared portfolio request timed out.');
    assert.equal(result.data.profile.name, 'Test Person');
});

test('rejects declared and streamed responses over 256 KiB', async (t) => {
    const initial = readPortfolioCache(null);

    await t.test('declared content length', async () => {
        const result = await refreshPortfolioContent({
            current: initial,
            fetcher: () =>
                responseWith('small body', {
                    headers: { 'content-length': String(MAX_PORTFOLIO_BYTES + 1) },
                }),
        });
        assert.equal(result.status, 'stale');
        assert.match(result.error ?? '', /256 KiB/);
    });

    await t.test('actual streamed bytes', async () => {
        const result = await refreshPortfolioContent({
            current: initial,
            fetcher: () => responseWith('x'.repeat(MAX_PORTFOLIO_BYTES + 1)),
        });
        assert.equal(result.status, 'stale');
        assert.match(result.error ?? '', /256 KiB/);
    });
});

test('retry recovers after an offline failure and replaces the fallback', async () => {
    const storage = new MemoryStorage();
    let attempts = 0;
    const fetcher = async () => {
        attempts += 1;
        if (attempts === 1) throw new TypeError('Offline');
        return new Response(valid);
    };

    const initial = readPortfolioCache(storage);
    const failed = await refreshPortfolioContent({ current: initial, storage, fetcher });
    const recovered = await refreshPortfolioContent({
        current: failed,
        storage,
        fetcher,
    });

    assert.equal(failed.source, 'fallback');
    assert.equal(failed.status, 'stale');
    assert.equal(recovered.source, 'network');
    assert.equal(recovered.status, 'ready');
    assert.equal(recovered.error, undefined);
    assert.equal(recovered.data.profile.name, 'Test Person');
    assert.equal(attempts, 2);
    assert.ok(storage.getItem(PORTFOLIO_CACHE_KEY));
});

test('a superseded request cannot overwrite the cache', async () => {
    const storage = new MemoryStorage();
    storage.setItem(PORTFOLIO_CACHE_KEY, cached());
    const initial = readPortfolioCache(storage);

    const result = await refreshPortfolioContent({
        current: initial,
        storage,
        fetcher: () => responseWith(valid),
        canCommit: () => false,
    });

    assert.strictEqual(result, initial);
    assert.equal(storage.getItem(PORTFOLIO_CACHE_KEY), cached());
});
