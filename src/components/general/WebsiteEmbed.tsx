import PropTypes from "prop-types";

const WebsiteEmbed = ({ url }: any) => {

    return (
        <div className="container">
            <iframe
                width="853"
                className="responsive-iframe"
                height="480"
                src={url}
                frameBorder="0"
                allowFullScreen

            />
        </div>
    )
};

WebsiteEmbed.propTypes = {
    url: PropTypes.string.isRequired
};

export default WebsiteEmbed;