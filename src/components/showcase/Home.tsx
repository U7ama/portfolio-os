import React, { useEffect, useState } from 'react';
import { Link } from '../general';

// import forhire from '../../assets/pictures/forHireGif.gif';
import { useNavigate } from 'react-router';

export interface HomeProps { }

const Home: React.FC<HomeProps> = (props) => {
    const navigate = useNavigate();
    const [isMobileViewport, setIsMobileViewport] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const onWindowResize = () => {
            setIsMobileViewport(window.innerWidth <= 768);
        };

        window.addEventListener('resize', onWindowResize, false);
        return () => {
            window.removeEventListener('resize', onWindowResize, false);
        };
    }, []);

    const goToContact = () => {
        navigate('/contact');
    };

    return (
        <div style={styles.page}>
            <div style={Object.assign({}, styles.header, isMobileViewport && styles.mobileHeader)}>
                <h1 style={Object.assign({}, styles.name, isMobileViewport && styles.mobileName)}>Usama Aslam</h1>
                <h2>Full Stack Developer</h2>
            </div>
            <div style={Object.assign({}, styles.buttons, isMobileViewport && styles.mobileButtons)}>
                <Link containerStyle={Object.assign({}, styles.link, isMobileViewport && styles.mobileLink)} to="about" text="ABOUT" />
                <Link
                    containerStyle={Object.assign({}, styles.link, isMobileViewport && styles.mobileLink)}
                    to="experience"
                    text="EXPERIENCE"
                />
                <Link
                    containerStyle={Object.assign({}, styles.link, isMobileViewport && styles.mobileLink)}
                    to="projects"
                    text="PROJECTS"
                />
                <Link
                    containerStyle={Object.assign({}, styles.link, isMobileViewport && styles.mobileLink)}
                    to="contact"
                    text="CONTACT"
                />
                <Link containerStyle={Object.assign({}, styles.link, isMobileViewport && styles.mobileLink)} to="blogs" text="ARTICLES" />
            </div>
            <div style={styles.forHireContainer} onMouseDown={goToContact}>
                {/* <img src={forhire} alt="" /> */}
            </div>
        </div>
    );
};

const styles: StyleSheetCSS = {
    page: {
        left: 0,
        right: 0,
        top: 0,
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        height: '100%',
    },
    header: {
        textAlign: 'center',
        marginBottom: 64,
        marginTop: 64,

        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttons: {
        justifyContent: 'space-between',
    },
    mobileButtons: {
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
    },
    image: {
        width: 800,
    },
    link: {
        padding: 16,
    },
    mobileLink: {
        padding: 9,
    },
    nowHiring: {
        backgroundColor: 'red',
        padding: 16,
    },
    forHireContainer: {
        marginTop: 64,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
    },
    name: {
        fontSize: 72,
        marginBottom: 16,
        lineHeight: 0.9,
    },
    mobileName: {
        fontSize: 'clamp(42px, 15vw, 64px)',
    },
    mobileHeader: {
        marginBottom: 24,
        marginTop: 24,
        paddingLeft: 12,
        paddingRight: 12,
    },
};

export default Home;
