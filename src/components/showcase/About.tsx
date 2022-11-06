import React from 'react';
// import me from '../../assets/pictures/workingAtComputer.jpg';
import meNow from '../../assets/pictures/currentme.jpg';
import { Link } from 'react-router-dom';
import ResumeDownload from './ResumeDownload';

export interface AboutProps { }

const About: React.FC<AboutProps> = (props) => {
    return (
        // add on resize listener
        <div className="site-page-content">
            {/* <img src={me} style={styles.topImage} alt="" /> */}
            <h1 style={{ marginLeft: -16 }}>Welcome</h1>
            <h3>I'm Usama Aslam</h3>
            <br />
            <div className="text-block">
                <p>
                    I'm Full Stack Developer currently working at Xtreme Web Tech! In 2022 I graduated from PMAS Arid University
                    with my BS in Computer Science.
                </p>
                <br />
                <p>
                    Thank you for taking the time to check out my portfolio. I
                    really hope you enjoy exploring it as much as I enjoyed
                    building it. If you have any questions or comments, feel
                    free to contact me using{' '}
                    <Link to="/contact">this form</Link> or shoot me an email at{' '}
                    <a href="mailto:u7amaaslam@gmail.com">
                        u7amaaslam@gmail.com
                    </a>
                </p>
            </div>
            <ResumeDownload />

            <div style={{}}>
                <div
                    style={{
                        flex: 1,
                        textAlign: 'justify',
                        alignSelf: 'center',
                        flexDirection: 'column',
                    }}
                >
                    <h3>About Me</h3>
                    <br />
                    <p>
                        In 2018, I statrted my Computer Science degree In final year, I got an
                        internship at Stash Technologies working for the Roomph.pk, primarily focusing
                        on frontend and backend work. I continued to work at Stash Technologies about half
                        year then I decided to focus on other opportunities. After my Graduation i joined Xtreme Web Tech where i am currently working as Full Stack Developer
                    </p>
                </div>
                <div style={styles.verticalImage}>
                    <img src={meNow} style={styles.image} alt="" />
                    <p>
                        <sub>
                            <b>Figure 2:</b> Me, April 2022
                        </sub>
                    </p>
                </div>
            </div>
            <div className="text-block">
                <p>
                    Thanks for reading about me! I hope that you enjoy exploring
                    the rest of my portfolio website and everything it has to
                    offer. Good luck and have fun!
                </p>
                <br />
                <p>
                    If you have any questions or comments I would love to hear
                    them. You can reach me through the{' '}
                    <Link to="/contact">contact page</Link> or shoot me an email
                    at{' '}
                    <a href="mailto:u7amaaslam@gmail.com">
                        u7amaaslam@gmail.com
                    </a>
                </p>
            </div>
        </div>
    );
};

const styles: StyleSheetCSS = {
    contentHeader: {
        marginBottom: 16,
        fontSize: 48,
    },
    image: {
        height: 'auto',
        width: '100%',
    },
    topImage: {
        height: 'auto',
        width: '100%',
        marginBottom: 32,
    },
    verticalImage: {
        alignSelf: 'center',
        // width: '80%',
        marginLeft: 32,
        marginTop: '40px',
        flex: 0.8,

        alignItems: 'center',
        // marginBottom: 32,
        textAlign: 'center',
        flexDirection: 'column',
    },
};

export default About;
