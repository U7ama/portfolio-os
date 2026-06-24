import React, { useEffect, useState } from 'react';
import { Link } from '../general';
// import forHire from '../../assets/pictures/forHireGif.gif';
import { useLocation, useNavigate } from 'react-router';

export interface VerticalNavbarProps { }

const VerticalNavbar: React.FC<VerticalNavbarProps> = (props) => {
    const location = useLocation();
    const [isHome, setIsHome] = useState(false);
    const [isMobileViewport, setIsMobileViewport] = useState(window.innerWidth <= 768);

    const navigate = useNavigate();
    const goToContact = () => {
        navigate('/contact');
    };

    useEffect(() => {
        const onWindowResize = () => {
            setIsMobileViewport(window.innerWidth <= 768);
        };

        window.addEventListener('resize', onWindowResize, false);
        return () => {
            window.removeEventListener('resize', onWindowResize, false);
        };
    }, []);

    useEffect(() => {
        if (location.pathname === '/') {
            setIsHome(true);
        } else {
            setIsHome(false);
        }
        return () => { };
    }, [location.pathname]);

    return !isHome ? (
        <div style={Object.assign({}, styles.navbar, isMobileViewport && styles.mobileNavbar)}>
            <div style={Object.assign({}, styles.header, isMobileViewport && styles.mobileHeader)}>
                <h1 style={styles.headerText}>Usama</h1>
                <h1 style={styles.headerText}>Aslam</h1>
                <h3 style={styles.headerShowcase}>Showcase '23</h3>
            </div>
            <div style={Object.assign({}, styles.links, isMobileViewport && styles.mobileLinks)}>
                <Link containerStyle={Object.assign({}, styles.link, isMobileViewport && styles.mobileLink)} to="" text="HOME" />
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
                <Link
                    containerStyle={Object.assign({}, styles.link, isMobileViewport && styles.mobileLink)}
                    to="blogs"
                    text="ARTICLES"
                />
            </div>
            <div style={styles.spacer} />
            <div style={styles.forHireContainer} onMouseDown={goToContact}>
                {/* <img src={forHire} style={styles.image} alt="" /> */}
            </div>
        </div>
    ) : (
        <></>
    );
};

const styles: StyleSheetCSS = {
    navbar: {
        width: 300,
        height: '100%',
        flexDirection: 'column',
        padding: 48,
        boxSizing: 'border-box',
        position: 'fixed',
        overflow: 'hidden',
    },
    mobileNavbar: {
        width: '100%',
        height: 'auto',
        minHeight: 86,
        position: 'relative',
        padding: 12,
        overflowX: 'auto',
        overflowY: 'hidden',
        borderBottom: '2px solid #c0c0c0',
        flexShrink: 0,
    },
    header: {
        flexDirection: 'column',
        marginBottom: 64,
    },
    mobileHeader: {
        marginBottom: 8,
        minWidth: 120,
    },
    headerText: {
        fontSize: 38,
        lineHeight: 1,
    },
    headerShowcase: {
        marginTop: 12,
    },
    logo: {
        width: '100%',
        marginBottom: 8,
    },
    link: {
        marginBottom: 32,
    },
    mobileLink: {
        marginBottom: 0,
        marginRight: 14,
        whiteSpace: 'nowrap',
    },
    expandedLink: {
        marginBottom: 16,
    },
    insetLinks: {
        flexDirection: 'column',
        marginLeft: 32,
        marginBottom: 16,
    },
    insetLink: {
        marginBottom: 8,
    },
    links: {
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'center',
    },
    mobileLinks: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflowX: 'auto',
    },
    image: {
        width: '80%',
    },
    spacer: {
        flex: 1,
    },
    forHireContainer: {
        cursor: 'pointer',

        width: '100%',
    },
};

export default VerticalNavbar;
