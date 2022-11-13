import React from 'react';
// // @ts-ignore
// import computer from '../../../assets/pictures/projects/software/computer.mp4';
// // @ts-ignore
// import plant from '../../../assets/pictures/projects/software/plant.mp4';
// // @ts-ignore
// import shopthejob from '../../../assets/pictures/projects/software/shopthejob.mp4';
// // @ts-ignore
// import dressin from '../../../assets/pictures/projects/software/dressin.mp4';
// // @ts-ignore
// import roomph from '../../../assets/pictures/projects/software/roomph.mp4';
import ResumeDownload from '../ResumeDownload';
import VideoAsset from '../../general/VideoAsset';
import YoutubeEmbed from "../../general/YoutubeEmbed";
import './style.css'

export interface SoftwareProjectsProps { }

const MyProjects: React.FC<SoftwareProjectsProps> = (props) => {
    return (
        <div className="site-page-content">
            <h3>My Projects</h3>
            <br />
            <p>
                Below are some of my favorite projects I have worked on
                over the last few years.
            </p>
            <br />
            <ResumeDownload />
            <br />
            <div className="text-block">
                <h2>My Portfolio</h2>
                <br />
                <p>
                    This is my portfolio website, and also the
                    website you are on right now. This project was an absolute
                    joy to make and challenged me both technically and
                    creatively. Early in 2022, I knew I wanted to make an
                    interactive portfolio to aid my job search. I eventually got
                    the idea for this site around early February and began
                    development.
                </p>
                <br />
                <div className="captioned-image">
                    <YoutubeEmbed embedId="DqgwT4pzTeM" />
                    {/* <VideoAsset src={computer} /> */}
                    <p style={styles.caption}>
                        <sub>
                            <b>Figure 1:</b> Blender Scene of the 3D website.
                            The scene from Blender was baked and exported in a
                            GLTF format.
                        </sub>
                    </p>
                </div>
                <p>
                    Now, a quick technical breakdown of the site. The website is
                    split into two parts, the 3D site, and the 2D OS site. The
                    3D site uses Three.js to render the scene and renders the 2D
                    site inside of it using an iframe. The 2D OS site is a
                    simple react site that is hosted{' '}
                    <a
                        rel="noreferrer"
                        target="_blank"
                        href="https://portfolio-9u37mvrxy-u7ama.vercel.app/"
                    >
                        here
                    </a>{' '}
                    and works as a standalone web app. The actual rendering of
                    the 2D site is accomplished using a CSS renderer provided by
                    Three.js that transforms the html of the 2D site with 3D CSS
                    transforms to give the illusion of three dimensionality.
                </p>
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://portfolio-3d-seven.vercel.app/"
                        >
                            <p>
                                <b>[3D Site]</b> - 3D Website URL
                            </p>
                        </a>
                    </li>

                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://portfolio-os-swart.vercel.app/"
                        >
                            <p>
                                <b>[OS Site]</b> - 2D Website URL
                            </p>
                        </a>
                    </li>

                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://github.com/U7ama/portfolio-os.git"
                        >
                            <p>
                                <b>[GitHub]</b> - 2D Site Repository
                            </p>
                        </a>
                    </li>
                </ul>
            </div>
            <div className="text-block">
                <h2>Intelligent Plant Taxonomy</h2>
                <br />
                <p>
                    Intelligent Plant Taxonomy was my final year project. This project presents a Web app for plant species that provides easy and fast access to plant species information. This project’s overarching goal is to give plant information under a single interface to allow any user to search for said information from a single place rather than searching in several places. The user interface was designed and customized to help the user search for anything related to plants and get the required information within a few clicks.
                </p>
                <br />
                <div className="captioned-image">
                    <YoutubeEmbed embedId="czAnQxyhXVs" />
                    {/* <VideoAsset src={plant} /> */}
                    <div style={styles.caption}>
                        <p>
                            <sub>
                                <b>Figure 2: </b> Intelligent Plant Taxonomy
                                demo, searching the plant species by uploading a picture.
                            </sub>
                        </p>
                    </div>
                </div>
                <p>
                    Though there are many excellent search engines like Google, Bing, Yahoo, etc, they do not provide much plant species detail or other websites. This proposed Plants Identification web app solves this problem by specifically providing all plant data available and organizing it such that the user can search for plants easily and get the desired information.
                </p>
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://github.com/U7ama/plant-taxonomy"
                        >
                            <p>
                                <b>[GitHub]</b> - Intelligent Plant Taxonomy Repository
                            </p>
                        </a>
                    </li>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://intelligent-plant-taxonomy.herokuapp.com/"
                        >
                            <p>
                                <b>[Site]</b> - Website URL
                            </p>
                        </a>
                    </li>
                </ul>
            </div>
            <div className="text-block">
                <h2>Roomph</h2>
                <br />
                <p>
                    Roomph.pk is a website which i built during my internship in final year. Roomph! Is Pakistan’s largest hotel company. I built this website in Reactjs and Nodejs.
                </p>
                <br />
                <div className="captioned-image">
                    <YoutubeEmbed embedId="mSMHyw9E0bM" />
                    {/* <VideoAsset src={roomph} /> */}
                    <div style={styles.caption}>
                        <p>
                            <sub style={{ marginLeft: "200px" }}>
                                <b>Figure 3: </b> Roomph demo.
                            </sub>
                        </p>
                    </div>
                </div>

                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://roomph-pk.herokuapp.com/"
                        >
                            <p>
                                <b>[Site]</b> - Website URL
                            </p>
                        </a>
                    </li>
                </ul>
            </div>
            <div className="text-block">
                <h2>Shop the Job</h2>
                <br />
                <p>
                    Shop the Job is my personal project. This is an eCommerce website where user can search products category-wise. I used React and Tailwind CSS for this web app.
                </p>
                <br />
                <div className="captioned-image">
                    <YoutubeEmbed embedId="da_4aiYYX7c" />
                    {/* <VideoAsset src={shopthejob} /> */}
                    <div style={styles.caption}>
                        <p>
                            <sub style={{ marginLeft: "200px" }}>
                                <b>Figure 4: </b> Shop the Job complete demo.
                            </sub>
                        </p>
                    </div>
                </div>

                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://gitfront.io/r/u7ama/dE4ZiUR8HaF6/shopthejob/"
                        >
                            <p>
                                <b>[GitHub]</b> - Shop the Job Repository
                            </p>
                        </a>
                    </li>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://shopthejob.vercel.app/"
                        >
                            <p>
                                <b>[Site]</b> - Website URL
                            </p>
                        </a>
                    </li>
                </ul>
            </div>
            <div className="text-block">
                <h2>Dress IN</h2>
                <br />
                <p>
                    I made Dress IN web app for my friend's Shopping Store located in Rawalpindi. I used MERN Stack in this project. I made an API for products using nodejs and MongoDB cluster and frontend using React and Tailwind CSS.
                </p>
                <br />
                <div className="captioned-image">
                    <YoutubeEmbed embedId="6-If7Q6rAxo" />
                    {/* <VideoAsset src={dressin} /> */}
                    <div style={styles.caption}>
                        <p>
                            <sub style={{ marginLeft: "250px" }}>
                                <b>Figure 5: </b> Dress IN
                                demo.
                            </sub>
                        </p>
                    </div>
                </div>
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://github.com/U7ama/dress-in.git"
                        >
                            <p>
                                <b>[GitHub]</b> - Dress IN Repository
                            </p>
                        </a>
                    </li>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://github.com/U7ama/dress-in-api.git"
                        >
                            <p>
                                <b>[GitHub]</b> - Dress IN API Repository
                            </p>
                        </a>
                    </li>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://dress-in.vercel.app/"
                        >
                            <p>
                                <b>[Site]</b> - Website URL
                            </p>
                        </a>
                    </li>
                </ul>
            </div>
            <ResumeDownload />
        </div>
    );
};

const styles: StyleSheetCSS = {
    video: {
        width: '100%',
        padding: 12,
    },
    caption: {
        width: '80%',
    },
};

export default MyProjects;