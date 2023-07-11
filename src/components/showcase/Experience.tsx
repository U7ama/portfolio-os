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
                        <h1 style={{ fontSize: '30px' }}>Xecutors</h1>
                        <a
                            target="_blank"
                            rel="noreferrer"
                            href={'https://xecutors.com/'}
                        >
                            <h4>www.xecutors.com</h4>
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
                    At Xecutors, I've had the opportunity to work extensively on
                    projects centered around the Airline industry. My role and
                    responsibilities have ranged widely and involved practical
                    hands-on experiences:
                </p>
                <br />
                <ul>
                    <li>
                        <p>
                            Embracing Agile Methodology, I coordinated daily
                            stand-ups to facilitate transparent and efficient
                            communication with my team members. I tracked our
                            progress and managed tasks using JIRA, thereby
                            maintaining a well-organized workflow that was
                            critical to the success of our projects.
                        </p>
                    </li>
                    <li>
                        <p>
                            We developed Serverless Microservices using Node.js
                            and implemented them through the Kong API Gateway.
                            This involved writing clean, efficient code and
                            integrating multiple services using Kong.
                            Post-development, I utilized Terraform, an
                            Infrastructure as Code (IaC) tool, to automate the
                            deployment of these services as Cloud Functions onto
                            renowned platforms such as Google Cloud Platform
                            (GCP) and Amazon Web Services (AWS). This process
                            involved scripting deployment configurations,
                            thoroughly testing the setups, and monitoring the
                            performance post-deployment.
                        </p>
                    </li>
                    <li>
                        <p>
                            Here we adopted the Micro Frontend Architecture for
                            our projects, where we created reusable NPM packages
                            and web components using Stencil.js and Bit
                            Components in Next.js and TypeScript. This involved
                            partitioning the frontend of our applications into
                            distinct features encapsulated in their own
                            packages. I coded these packages using Next.js for
                            server-side rendering, and TypeScript for type
                            safety and improved code quality. This architecture
                            allowed our team to develop and deploy features
                            independently, thus improving scalability and
                            maintainability of our applications.
                        </p>
                    </li>
                </ul>
                <br />
                <p>
                    My tenure at Xecutors has been a journey of constant
                    learning and technical growth, with the opportunity to apply
                    advanced techniques and methodologies to real-world
                    projects. I have not only developed and refined my skills
                    but have also contributed to delivering high-quality
                    solutions for our clients in the Airline industry.
                </p>
            </div>
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
                        <h3>React Node JS Developer</h3>
                        <b>
                            <p>Mar 2022 - August 2022</p>
                        </b>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <p>
                    At Stash Technologies, my focus was on building solutions
                    tailored for the hotel booking and travel industry. My role
                    was multifaceted and involved a variety of responsibilities:
                </p>
                <br />
                <ul>
                    <li>
                        <p>
                            I was tasked with constructing RESTful APIs using
                            Node.js, which served as a critical component in our
                            application architecture. This involved detailed
                            planning of endpoints based on user requirements,
                            writing efficient code to implement these endpoints,
                            and meticulous testing to ensure the APIs performed
                            as expected. Each API was built with an emphasis on
                            robustness and security, making them reliable tools
                            for data transmission.
                        </p>
                    </li>
                    <li>
                        <p>
                            A significant part of my role involved designing and
                            implementing new features using React.js to enhance
                            the application's usability and user experience.
                            This process included brainstorming effective and
                            intuitive design ideas, translating these designs
                            into code, and performing thorough tests to verify
                            their performance. While creating these features, I
                            adhered to best coding practices to ensure the
                            quality, maintainability, and scalability of the
                            application.
                        </p>
                    </li>
                    <li>
                        <p>
                            I also coordinated major refactoring efforts aimed
                            at optimizing application performance. The result
                            was a much smoother user experience, achieved by
                            identifying and eliminating redundant re-renders and
                            superfluous API calls. These efforts led to a
                            substantial improvement in application efficiency,
                            reducing unnecessary operations by over 50%.
                        </p>
                    </li>
                </ul>
                <br />
                <p>
                    In summary, my role at Stash Technologies allowed me to
                    delve deep into technical problem-solving while maintaining
                    a user-centric focus, ultimately contributing to an improved
                    application experience for users in the hotel booking and
                    travel industry.
                </p>
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
