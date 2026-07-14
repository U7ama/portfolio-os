import React from 'react';
import meNow from '../../assets/pictures/currentme.jpg';
import { Link } from 'react-router-dom';
import ResumeDownload from './ResumeDownload';
import { usePortfolioContent } from '../../content/PortfolioContent';

export interface AboutProps {}

const About: React.FC<AboutProps> = () => {
    const { data } = usePortfolioContent();
    const email = data.contacts.find((contact) => contact.id === 'email');

    return (
        <div className="site-page-content">
            <h1 style={{ marginLeft: -16 }}>Welcome</h1>
            <h3>I'm {data.profile.name}</h3>
            <br />
            <div className="text-block">
                {data.profile.summary.map((paragraph) => (
                    <React.Fragment key={paragraph}>
                        <p>{paragraph}</p>
                        <br />
                    </React.Fragment>
                ))}
                <p>
                    Thank you for exploring my portfolio. You can reach me using{' '}
                    <Link to="/contact">the contact page</Link>
                    {email ? (
                        <>
                            {' '}or email me at <a href={email.url}>{email.url.replace('mailto:', '')}</a>.
                        </>
                    ) : (
                        '.'
                    )}
                </p>
            </div>

            <ResumeDownload />

            <div style={styles.aboutRow}>
                <div style={styles.aboutText}>
                    <h3>Areas of Focus</h3>
                    <br />
                    <p>{data.profile.disciplines.join(' · ')}</p>
                    <br />
                    <h3>Skills</h3>
                    {data.skills.map((group) => (
                        <div key={group.id} style={styles.group}>
                            <h4>{group.label}</h4>
                            <p>{group.items.join(' · ')}</p>
                        </div>
                    ))}
                </div>
                <div style={styles.verticalImage}>
                    <img src={meNow} style={styles.image} alt={data.profile.name} />
                    <p>
                        <sub>{data.profile.name}</sub>
                    </p>
                </div>
            </div>

            <div className="text-block">
                <h2>Education</h2>
                {data.education.map((item) => (
                    <div key={item.id} style={styles.sectionEntry}>
                        <h3>{item.qualification}</h3>
                        <h4>
                            {item.institution} · {item.location} · {item.period}
                        </h4>
                        {item.details.map((detail) => (
                            <p key={detail}>{detail}</p>
                        ))}
                        {item.links.map((link) => (
                            <a
                                key={link.url}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>
                ))}
            </div>

            <div className="text-block">
                <h2>Portfolio Sites</h2>
                <ul>
                    {data.sites.map((site) => (
                        <li key={site.id}>
                            <a
                                href={site.url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <p>{site.label}</p>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const styles: StyleSheetCSS = {
    image: {
        height: 'auto',
        width: '100%',
    },
    aboutRow: {
        width: '100%',
        alignItems: 'flex-start',
        marginTop: 32,
        marginBottom: 32,
    },
    aboutText: {
        flex: 1,
        flexDirection: 'column',
    },
    verticalImage: {
        alignSelf: 'center',
        marginLeft: 32,
        flex: 0.55,
        alignItems: 'center',
        textAlign: 'center',
        flexDirection: 'column',
    },
    group: {
        flexDirection: 'column',
        marginTop: 16,
    },
    sectionEntry: {
        flexDirection: 'column',
        marginTop: 24,
        gap: 8,
    },
};

export default About;
