import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    PORTFOLIO_CONTENT_URL,
    PortfolioContentState,
    PortfolioDataV1,
    PortfolioStorage,
    readPortfolioCache,
    refreshPortfolioContent,
} from './portfolio';

interface PortfolioContentValue extends PortfolioContentState {
    data: PortfolioDataV1;
    retry: () => void;
}

const PortfolioContentContext = createContext<PortfolioContentValue | undefined>(
    undefined
);

const CONTENT_URL =
    import.meta.env.VITE_PORTFOLIO_CONTENT_URL ?? PORTFOLIO_CONTENT_URL;

const getBrowserStorage = (): PortfolioStorage | null => {
    if (typeof window === 'undefined') return null;
    try {
        return window.localStorage;
    } catch {
        return null;
    }
};

export const PortfolioContentProvider: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
    const [content, setContent] = useState<PortfolioContentState>(() =>
        readPortfolioCache(getBrowserStorage())
    );
    const contentRef = useRef(content);
    const requestRef = useRef<AbortController>();
    const requestIdRef = useRef(0);

    const refresh = useCallback(async () => {
        const requestId = ++requestIdRef.current;
        requestRef.current?.abort();
        const controller = new AbortController();
        requestRef.current = controller;
        const refreshing = {
            ...contentRef.current,
            status: 'refreshing' as const,
            error: undefined,
        };
        contentRef.current = refreshing;
        setContent(refreshing);

        const next = await refreshPortfolioContent({
            current: refreshing,
            storage: getBrowserStorage(),
            url: CONTENT_URL,
            signal: controller.signal,
            canCommit: () => requestId === requestIdRef.current,
        });
        if (requestId !== requestIdRef.current) return;
        contentRef.current = next;
        setContent(next);
    }, []);

    useEffect(() => {
        void refresh();
        return () => {
            requestIdRef.current += 1;
            requestRef.current?.abort();
        };
    }, [refresh]);

    const value = useMemo(
        () => ({ ...content, retry: () => void refresh() }),
        [content, refresh]
    );

    return (
        <PortfolioContentContext.Provider value={value}>
            {children}
        </PortfolioContentContext.Provider>
    );
};

export const usePortfolioContent = () => {
    const value = useContext(PortfolioContentContext);
    if (!value) {
        throw new Error(
            'usePortfolioContent must be used inside PortfolioContentProvider.'
        );
    }
    return value;
};

export const PortfolioContentNotice: React.FC = () => {
    const { source, status, error, retry } = usePortfolioContent();
    if (status !== 'stale') return null;

    return (
        <div role="status" style={noticeStyles.notice}>
            <p style={noticeStyles.text}>
                {source === 'fallback'
                    ? 'Showing bundled portfolio content.'
                    : 'Showing the last saved portfolio content.'}{' '}
                {error}
            </p>
            <button className="site-button" type="button" onClick={retry}>
                Retry
            </button>
        </div>
    );
};

const noticeStyles: StyleSheetCSS = {
    notice: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        zIndex: 20,
        maxWidth: 420,
        gap: 12,
        padding: 12,
        alignItems: 'center',
        backgroundColor: '#fff7c2',
        border: '2px solid black',
        boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.35)',
    },
    text: {
        fontSize: 14,
    },
};
