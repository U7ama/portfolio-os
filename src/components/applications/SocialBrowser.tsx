import React, { useEffect, useState } from 'react';
import Window from '../os/Window';
import useInitialWindowSize from '../../hooks/useInitialWindowSize';

export interface SocialBrowserProps extends WindowAppProps {}

type ProfileKey = 'upwork' | 'linkedin';

const PROFILES: Record<ProfileKey, {
    label: string;
    url: string;
    title: string;
    subtitle: string;
    accent: string;
}> = {
    upwork: {
        label: 'Upwork',
        url: 'https://www.upwork.com/freelancers/usamaa241',
        title: 'Usama Aslam',
        subtitle: 'Full Stack Developer',
        accent: '#14a800',
    },
    linkedin: {
        label: 'LinkedIn',
        url: 'https://www.linkedin.com/in/usama-aslam-638584194?utm_source=share_via&utm_content=profile&utm_medium=member_android',
        title: 'Usama Aslam',
        subtitle: 'Software Engineer',
        accent: '#0a66c2',
    },
};

const LinkedInBadge: React.FC = () => {
    useEffect(() => {
        const scriptId = 'linkedin-profile-badge-script';
        const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

        if (existingScript) {
            existingScript.remove();
        }

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://platform.linkedin.com/badges/js/profile.js';
        script.async = true;
        script.defer = true;
        script.type = 'text/javascript';
        document.body.appendChild(script);
    }, []);

    return (
        <div style={styles.badgeWrap}>
            <div
                className="badge-base LI-profile-badge"
                data-locale="en_US"
                data-size="large"
                data-theme="light"
                data-type="HORIZONTAL"
                data-vanity="usama-aslam-638584194"
                data-version="v1"
            >
                <a
                    className="badge-base__link LI-simple-link"
                    href="https://www.linkedin.com/in/usama-aslam-638584194?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                >
                    Usama Aslam
                </a>
            </div>
            <p style={styles.embedNote}>
                This uses LinkedIn's badge script instead of a raw iframe because LinkedIn profile pages usually refuse direct framing.
            </p>
        </div>
    );
};

const UpworkEmbedAlternative: React.FC = () => (
    <div style={styles.profilePanel}>
        <div style={Object.assign({}, styles.profileTop, { backgroundColor: PROFILES.upwork.accent })}>
            <div style={styles.avatar}>UA</div>
            <div>
                <h1 style={styles.name}>{PROFILES.upwork.title}</h1>
                <p style={styles.role}>{PROFILES.upwork.subtitle}</p>
            </div>
        </div>
        <div style={styles.profileBody}>
            <div style={styles.statusRow}>
                <span style={styles.statusDot}></span>
                <strong>Available for freelance projects</strong>
            </div>
            <p style={styles.bio}>
                I build polished web applications, portfolio experiences, automation tools, dashboards, and full-stack features with clean UI and reliable delivery.
            </p>
            <div style={styles.skillGrid}>
                {['React', 'TypeScript', 'Node.js', 'Full Stack', 'UI/UX', 'API Integrations'].map((skill) => (
                    <span key={skill} style={styles.skill}>{skill}</span>
                ))}
            </div>
            <div style={styles.statsGrid}>
                <div style={styles.statBox}>
                    <strong>Profile</strong>
                    <span>Upwork freelancer</span>
                </div>
                <div style={styles.statBox}>
                    <strong>Focus</strong>
                    <span>Web apps</span>
                </div>
                <div style={styles.statBox}>
                    <strong>Delivery</strong>
                    <span>Remote-ready</span>
                </div>
            </div>
            <p style={styles.embedNote}>
                Upwork does not provide a reliable public profile iframe/widget for this use case, so this tab renders a native in-site profile panel styled like an embedded profile.
            </p>
        </div>
    </div>
);

const SocialBrowser: React.FC<SocialBrowserProps> = (props) => {
    const { initWidth, initHeight } = useInitialWindowSize({ margin: 120 });
    const [activeTab, setActiveTab] = useState<ProfileKey>('upwork');
    const profile = PROFILES[activeTab];

    return (
        <Window
            top={40}
            left={80}
            width={Math.max(760, initWidth * 0.85)}
            height={Math.max(560, initHeight * 0.82)}
            windowTitle="Browser"
            windowBarIcon="browserIcon"
            closeWindow={props.onClose}
            onInteract={props.onInteract}
            minimizeWindow={props.onMinimize}
            bottomLeftText={profile.url}
        >
            <div style={styles.browserShell}>
                <div style={styles.tabs}>
                    {(Object.keys(PROFILES) as ProfileKey[]).map((key) => (
                        <button
                            key={key}
                            style={Object.assign(
                                {},
                                styles.tab,
                                activeTab === key && styles.activeTab,
                                activeTab === key && {
                                    borderTopColor: PROFILES[key].accent,
                                }
                            )}
                            onMouseDown={() => setActiveTab(key)}
                        >
                            {PROFILES[key].label}
                        </button>
                    ))}
                </div>
                <div style={styles.toolbar}>
                    <span style={styles.navButton}>←</span>
                    <span style={styles.navButton}>→</span>
                    <span style={styles.navButton}>⟳</span>
                    <input style={styles.addressBar} readOnly value={profile.url} />
                </div>
                <div style={styles.page}>
                    {activeTab === 'linkedin' ? (
                        <LinkedInBadge />
                    ) : (
                        <UpworkEmbedAlternative />
                    )}
                </div>
            </div>
        </Window>
    );
};

const styles: StyleSheetCSS = {
    browserShell: {
        height: '100%',
        backgroundColor: '#bfbfbf',
        display: 'flex',
        flexDirection: 'column',
    },
    tabs: {
        display: 'flex',
        gap: 2,
        padding: '6px 6px 0',
    },
    tab: {
        border: '2px outset #fff',
        borderTop: '4px solid #808080',
        background: '#d6d6d6',
        padding: '6px 18px',
        fontFamily: 'MSSerif',
        cursor: 'pointer',
    },
    activeTab: {
        background: '#fff',
        borderBottomColor: '#fff',
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: 6,
        borderTop: '1px solid #fff',
        borderBottom: '2px inset #fff',
    },
    navButton: {
        width: 24,
        height: 22,
        textAlign: 'center',
        border: '2px outset #fff',
        background: '#d6d6d6',
        fontFamily: 'MSSerif',
    },
    addressBar: {
        flex: 1,
        height: 22,
        border: '2px inset #fff',
        paddingLeft: 6,
        fontFamily: 'MSSerif',
        fontSize: 12,
    },
    page: {
        flex: 1,
        backgroundColor: '#f4f4f4',
        border: '2px inset #fff',
        margin: 6,
        padding: 24,
        overflow: 'auto',
    },
    badgeWrap: {
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        textAlign: 'center',
    },
    profilePanel: {
        maxWidth: 680,
        margin: '0 auto',
        backgroundColor: '#fff',
        border: '1px solid #8a8a8a',
        boxShadow: '4px 4px 0 #9a9a9a',
    },
    profileTop: {
        color: '#fff',
        padding: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 18,
    },
    avatar: {
        width: 84,
        height: 84,
        borderRadius: '50%',
        backgroundColor: '#fff',
        color: '#14a800',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 28,
        fontWeight: 'bold',
        border: '3px solid rgba(255, 255, 255, 0.75)',
    },
    name: {
        margin: 0,
        fontSize: 32,
        fontFamily: 'MSSerif',
    },
    role: {
        margin: '6px 0 0',
        fontSize: 16,
    },
    profileBody: {
        padding: 24,
    },
    statusRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 14,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: '50%',
        backgroundColor: '#14a800',
    },
    bio: {
        fontSize: 16,
        lineHeight: 1.5,
        margin: '0 0 18px',
    },
    skillGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 18,
    },
    skill: {
        backgroundColor: '#e4f7df',
        border: '1px solid #14a800',
        borderRadius: 14,
        padding: '6px 10px',
        fontSize: 13,
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 10,
        marginBottom: 18,
    },
    statBox: {
        border: '1px solid #c8c8c8',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        backgroundColor: '#fafafa',
    },
    embedNote: {
        maxWidth: 560,
        color: '#555',
        fontSize: 13,
        lineHeight: 1.45,
        margin: 0,
    },
};

export default SocialBrowser;
