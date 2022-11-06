import React from 'react';
import ResumeDownload from './ResumeDownload';

export interface ExperienceProps { }

const Experience: React.FC<ExperienceProps> = (props) => {
    return (
        <div className="site-page-content">
            <ResumeDownload />
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h1 style={{ fontSize: '30px' }}>Stash Technologies</h1>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href={'https://stashtechnologies.com/'}
                        >
                            <h4>www.stashtechnologies.com</h4>
                        </a>
                    </div>
                    <div style={styles.headerRow}>
                        <h3>Remote Web Developer</h3>
                        <b>
                            <p>Mar 2022 - August 2022</p>
                        </b>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <p>
                    Targeted towards hotel booking and travel industry.
                </p>
                <br />
                <ul>
                    <li>
                        <p>
                            Build Restful API's in Nodejs.
                        </p>
                    </li>
                    <li>
                        <p>
                            Designed and implemented multiple features to
                            increase app usability and user experience while
                            ensuring the quality, maintainability and
                            scalability in Reactjs.
                        </p>
                    </li>
                    <li>
                        <p>
                            Coordinated major refactors targeted towards app
                            optimization and performance resulting in a smoother
                            user experience and accomplished by eliminating
                            redundant re-renders and API calls by over 50%.
                        </p>
                    </li>
                </ul>
            </div>
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h1 style={{ fontSize: '30px' }}>Xtreme Web Tech</h1>
                        <a
                            target="_blank"
                            rel="noreferrer"
                            href={'https://xtremewebtech.com/'}
                        >
                            <h4>www.xtremewebtech.com</h4>
                        </a>
                    </div>
                    <div style={styles.headerRow}>
                        <h3>Full Stack Developer</h3>
                        <b>
                            <p>August 2022 - Present</p>
                        </b>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <p>
                    Here i worked on projects mostly related to Airline industry {' '}
                    <a target="_blank"
                        rel="noreferrer"
                        href={'https://www.copilottravel.com/'}>
                        Copilot travel.{' '} </a>
                </p>
                <br />
                <ul>
                    <li>
                        <p>
                            Coordinated with the project and team members by daily stand-ups. Followed Agile Methodology using JIRA.
                        </p>
                    </li>
                    <li>
                        <p>
                            Developed Serverless Microservices using Nodejs and used Kong API Gateway. Then through Terraform these services deployed on GCP and AWS as Cloud Functions.
                        </p>
                    </li>
                    <li>
                        <p>
                            Following Micro Frontend Architecture. Created NPM Packages using Nextjs and TypeScript
                        </p>
                    </li>
                </ul>
            </div>

        </div>
    );
};

const styles: StyleSheetCSS = {
    header: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
    },
    skillRow: {
        flex: 1,
        justifyContent: 'space-between',
    },
    skillName: {
        minWidth: 56,
    },
    skill: {
        flex: 1,
        padding: 8,
        alignItems: 'center',
    },
    progressBar: {
        flex: 1,
        background: 'red',
        marginLeft: 8,
        height: 8,
    },
    hoverLogo: {
        height: 32,
        marginBottom: 16,
    },
    headerContainer: {
        alignItems: 'flex-end',
        width: '100%',
        justifyContent: 'center',
    },
    hoverText: {
        marginBottom: 8,
    },
    indent: {
        marginLeft: 24,
    },
    headerRow: {
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    row: {
        display: 'flex',
        justifyContent: 'space-between',
    },
};

export default Experience;
