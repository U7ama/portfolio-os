import React from 'react';
import ResumeDownload from './ResumeDownload';
import { usePortfolioContent } from '../../content/PortfolioContent';

export interface ExperienceProps {}

const Experience: React.FC<ExperienceProps> = () => {
    const { data } = usePortfolioContent();

    return (
        <div className="site-page-content">
            <ResumeDownload />
            {data.experience.map((experience) => (
                <React.Fragment key={experience.id}>
                    <div style={styles.headerContainer}>
                        <div style={styles.header}>
                            <div style={styles.headerRow}>
                                <h1 style={{ fontSize: '30px' }}>
                                    {experience.organization}
                                </h1>
                                {experience.website && (
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={experience.website}
                                    >
                                        <h4>Visit website</h4>
                                    </a>
                                )}
                            </div>
                            <div style={styles.headerRow}>
                                <h3>{experience.role}</h3>
                                <b>
                                    <p>{experience.period}</p>
                                </b>
                            </div>
                            <p>{experience.location}</p>
                        </div>
                    </div>
                    <div className="text-block">
                        <p>{experience.summary}</p>
                        {experience.details.length > 0 && (
                            <ul>
                                {experience.details.map((detail, index) => (
                                    <li key={`${experience.id}-${index}`}>
                                        <p>{detail}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </React.Fragment>
            ))}
        </div>
    );
};

const styles: StyleSheetCSS = {
    header: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
    },
    headerContainer: {
        alignItems: 'flex-end',
        width: '100%',
        justifyContent: 'center',
        marginTop: 32,
    },
    headerRow: {
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: 24,
    },
};

export default Experience;
