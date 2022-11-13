import PropTypes from "prop-types";
import { useState, useEffect } from 'react';

const YoutubeEmbed = ({ embedId }: any) => {
    const [autoplay, setAutoplay] = useState("")
    useEffect(() => {
        if (embedId === "DqgwT4pzTeM") {
            setAutoplay("&autoplay=1")
        };
    });

    return (
        <div className="container">
            <iframe
                width="853"
                className="responsive-iframe"
                height="480"
                src={`https://www.youtube.com/embed/${embedId}?rel=0${autoplay}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Embedded youtube"
            />
        </div>
    )
};

YoutubeEmbed.propTypes = {
    embedId: PropTypes.string.isRequired
};

export default YoutubeEmbed;