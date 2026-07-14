interface YoutubeEmbedProps {
    embedId: string;
}

const YoutubeEmbed = ({ embedId }: YoutubeEmbedProps) => {
    const autoplay = embedId === 'Nrv5DMTFNUw' ? '&autoplay=1' : '';

    return (
        <div style={styles.container}>
            <iframe
                style={styles.iframe}
                src={`https://www.youtube.com/embed/${embedId}?rel=0${autoplay}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                title="Project video"
                referrerPolicy="strict-origin-when-cross-origin"
            />
        </div>
    );
};

const styles: StyleSheetCSS = {
    container: {
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        paddingTop: '56.25%',
    },
    iframe: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
    },
};

export default YoutubeEmbed;
