import React from 'react';
// import me from '../../assets/pictures/workingAtComputer.jpg';
import meNow from '../../assets/pictures/currentme.jpg';
import { Link } from 'react-router-dom';
import ResumeDownload from './ResumeDownload';

export interface AboutProps {}

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
                    Greetings! I am a proficient MERN Stack Developer currently
                    enhancing digital solutions at Xecutors. My journey into the
                    world of computer science initiated in 2018, when I embarked
                    on my Bachelor's degree in Computer Science from PMAS Arid
                    University. The knowledge and skills I gathered there came
                    to fruition when I graduated in 2022.
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
                        The milestone of my educational journey was a coveted
                        job opportunity at Stash Technologies in my final year.
                        During this phase, I had the chance to work on{' '}
                        <a
                            href="https://roomph.pk/"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Roomph.pk
                        </a>
                        , and some other projects honing my skills in frontend
                        and backend development. After a rewarding tenure of
                        half a year with Stash Technologies, I decided to
                        broaden my horizon, seeking new challenges and
                        experiences. Then i joined the dynamic team at Xecutors,
                        where I am currently contributing as a MERN Stack
                        Developer. This platform has allowed me to blend my
                        academic learning with practical expertise, pushing the
                        boundaries of web development.
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
                    I invite you to explore my portfolio, a culmination of my
                    relentless passion for coding, problem-solving, and
                    creativity. If you have any queries or need further
                    information, please feel free to reach out. I hope you enjoy
                    navigating through my accomplishments and projects as much
                    as I have relished creating them. Thank you for your time
                    and happy exploring!
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
