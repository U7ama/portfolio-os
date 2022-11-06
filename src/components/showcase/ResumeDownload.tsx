import React from 'react';
import printer from '../../assets/resume/printer.gif';
// import Resume from '../../assets/resume/Usama-Aslam_Resume.pdf';

export interface ResumeDownloadProps {
    altText?: string;
}

const ResumeDownload: React.FC<ResumeDownloadProps> = ({ altText }) => {
    return (
        <div style={styles.resumeContainer}>
            <img style={styles.resumePrinter} alt="" src={printer} />
            <div style={styles.resumeContainerText}>
                <h3>{altText ? altText : 'Looking for my resume?'}</h3>
                <a rel="noreferrer" target="_blank" href="https://www.canva.com/design/DAFLWy0OaKA/ybKf1-tR3-FHSJed7Kvvsg/view?utm_content=DAFLWy0OaKA&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink">
                    <p>Click here to see it!</p>
                </a>
            </div>
        </div>
    );
};

const styles: StyleSheetCSS = {
    resumeContainer: {
        backgroundColor: 'white',
        padding: 12,
        boxSizing: 'border-box',
        border: '2px solid black',
        borderLeftWidth: 0,
        borderRightWidth: 0,
        width: '100%',
        alignItems: 'center',
    },
    resumeContainerText: {
        flexDirection: 'column',
    },
    resumePrinter: {
        width: 56,
        height: 48,
        paddingRight: 24,
    },
};

export default ResumeDownload;
