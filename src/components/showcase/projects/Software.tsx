import React, { useMemo } from 'react';
import ResumeDownload from '../ResumeDownload';
import YoutubeEmbed from '../../general/YoutubeEmbed';
import { usePortfolioContent } from '../../../content/PortfolioContent';

export interface SoftwareProjectsProps {}

const MyProjects: React.FC<SoftwareProjectsProps> = () => {
    const { data } = usePortfolioContent();
    const projects = useMemo(
        () =>
            [...data.projects].sort((left, right) => {
                const leftOrder = left.featuredOrder ?? Number.MAX_SAFE_INTEGER;
                const rightOrder = right.featuredOrder ?? Number.MAX_SAFE_INTEGER;
                return leftOrder - rightOrder;
            }),
        [data.projects]
    );

    return (
        <div className="site-page-content">
            <h1>My Projects</h1>
            <br />
            <p>
                A selection of products, platforms, integrations, and creative
                web experiences I have helped build.
            </p>
            <br />
            <ResumeDownload />

            {projects.map((project) => (
                <div id={project.id} className="text-block" key={project.id}>
                    <div style={styles.projectHeading}>
                        <h2>{project.title}</h2>
                        {project.featuredOrder !== null && (
                            <span style={styles.featured}>Featured</span>
                        )}
                    </div>
                    <h4>{project.category}</h4>
                    <br />
                    <p>{project.summary}</p>

                    {project.details.map((detail, index) => (
                        <React.Fragment key={`${project.id}-detail-${index}`}>
                            <br />
                            <p>{detail}</p>
                        </React.Fragment>
                    ))}

                    {project.videos.map((video) => (
                        <div
                            className="captioned-image"
                            style={styles.video}
                            key={`${project.id}-${video.id}`}
                        >
                            <YoutubeEmbed embedId={video.id} />
                            <p style={styles.caption}>
                                <sub>{video.caption}</sub>
                            </p>
                        </div>
                    ))}

                    {project.technologies.length > 0 && (
                        <p style={styles.technologies}>
                            <b>Technologies: </b>
                            {project.technologies.join(' · ')}
                        </p>
                    )}

                    {project.links.length > 0 && (
                        <>
                            <br />
                            <h3>Links:</h3>
                            <ul>
                                {project.links.map((link) => (
                                    <li key={link.url}>
                                        <a
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <p>{link.label}</p>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            ))}
            <ResumeDownload />
        </div>
    );
};

const styles: StyleSheetCSS = {
    projectHeading: {
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
    },
    featured: {
        padding: '4px 8px',
        backgroundColor: '#fff7c2',
        border: '1px solid black',
        fontFamily: 'MillenniumBold, serif',
    },
    video: {
        marginTop: 24,
    },
    caption: {
        width: '80%',
        marginTop: 8,
    },
    technologies: {
        marginTop: 16,
    },
};

export default MyProjects;
