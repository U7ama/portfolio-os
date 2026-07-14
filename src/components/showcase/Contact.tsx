import React, { useEffect, useState, useCallback } from 'react';
import colors from '../../constants/colors';
// import twitterIcon from '../../assets/pictures/contact-twitter.png';
import ghIcon from '../../assets/pictures/contact-gh.png';
import inIcon from '../../assets/pictures/contact-in.png';
import ResumeDownload from './ResumeDownload';
import emailjs from '@emailjs/browser';
import { usePortfolioContent } from '../../content/PortfolioContent';

export interface ContactProps {}

// function to validate email
const validateEmail = (email: string) => {
    const re =
        // eslint-disable-next-line
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

interface SocialBoxProps {
    icon: string;
    link: string;
}

const SocialBox: React.FC<SocialBoxProps> = ({ link, icon }) => {
    return (
        <a rel="noopener noreferrer" target="_blank" href={link}>
            <div className="big-button-container" style={styles.social}>
                <img src={icon} alt="" style={styles.socialImage} />
            </div>
        </a>
    );
};

const Contact: React.FC<ContactProps> = (props) => {
    const { data } = usePortfolioContent();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [isFormValid, setIsFormValid] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formMessage, setFormMessage] = useState('');
    const [formMessageColor, setFormMessageColor] = useState('');

    useEffect(() => {
        if (validateEmail(email) && name.length > 0 && message.length > 0) {
            setIsFormValid(true);
        } else {
            setIsFormValid(false);
        }
    }, [email, name, message]);

    const handleSubmit = useCallback(async () => {
        if (isFormValid) {
            const serviceId = import.meta.env.REACT_APP_SERVICE_ID;
            const templateId = import.meta.env.REACT_APP_TEMPLATE_ID;
            const publicKey = import.meta.env.REACT_APP_PUBLIC_KEY;

            if (!serviceId || !templateId || !publicKey) {
                setFormMessage('The contact form is not configured.');
                setFormMessageColor(colors.red);
                return;
            }

            setIsLoading(true);
            try {
                await emailjs.send(
                    serviceId,
                    templateId,
                    {
                        to_name: data.profile.name,
                        from_name: name,
                        message,
                        to_email: email,
                    },
                    publicKey
                );
                setFormMessage(
                    `Message successfully sent. Thank you ${name}!`
                );
                setEmail('');
                setName('');
                setMessage('');
                setFormMessageColor(colors.blue);
            } catch {
                setFormMessage(
                    'There was an error sending your message. Please try again.'
                );
                setFormMessageColor(colors.red);
            } finally {
                setIsLoading(false);
            }
        } else {
            setFormMessage('Form unable to validate, please try again.');
            setFormMessageColor('red');
        }
    }, [email, name, message, isFormValid, data.profile.name]);

    useEffect(() => {
        if (formMessage.length > 0) {
            setTimeout(() => {
                setFormMessage('');
                setFormMessageColor('');
            }, 4000);
        }
    }, [formMessage]);

    return (
        <div className="site-page-content">
            <div style={styles.header}>
                <h1>Contact</h1>
                <div style={styles.socials}>
                    {data.contacts.find((contact) => contact.id === 'github') && (
                        <SocialBox
                            icon={ghIcon}
                            link={data.contacts.find(
                                (contact) => contact.id === 'github'
                            )!.url}
                        />
                    )}
                    {data.contacts.find((contact) => contact.id === 'linkedin') && (
                        <SocialBox
                            icon={inIcon}
                            link={data.contacts.find(
                                (contact) => contact.id === 'linkedin'
                            )!.url}
                        />
                    )}
                    {/* <SocialBox
                        icon={twitterIcon}
                        link={'https://twitter.com/UsamaAslam'}
                    /> */}
                </div>
            </div>
            <div className="text-block">
                <p>
                    If you have a project, opportunity, or question, feel free
                    to reach out through any of the links below or use the
                    contact form.
                </p>
                <br />
                <div style={styles.contactLinks}>
                    {data.contacts.map((contact) => (
                        <p key={contact.id}>
                            <b>{contact.label}: </b>
                            <a
                                href={contact.url}
                                target={
                                    contact.url.startsWith('http')
                                        ? '_blank'
                                        : undefined
                                }
                                rel={
                                    contact.url.startsWith('http')
                                        ? 'noopener noreferrer'
                                        : undefined
                                }
                            >
                                {contact.id === 'email'
                                    ? contact.url.replace('mailto:', '')
                                    : contact.id === 'phone'
                                      ? contact.url.replace('tel:', '')
                                      : contact.label}
                            </a>
                        </p>
                    ))}
                </div>

                <div style={styles.form}>
                    <label>
                        <p>
                            {!name && <span style={styles.star}>*</span>}
                            <b>Your name:</b>
                        </p>
                    </label>
                    <input
                        style={styles.formItem}
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <label>
                        <p>
                            {!validateEmail(email) && (
                                <span style={styles.star}>*</span>
                            )}
                            <b>Email:</b>
                        </p>
                    </label>
                    <input
                        style={styles.formItem}
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <label>
                        <p>
                            {!message && <span style={styles.star}>*</span>}
                            <b>Message:</b>
                        </p>
                    </label>
                    <textarea
                        name="message"
                        placeholder="Message"
                        style={styles.formItem}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <div style={styles.buttons}>
                        <button
                            className="site-button"
                            style={styles.button}
                            type="submit"
                            disabled={!isFormValid || isLoading}
                            onMouseDown={handleSubmit}
                        >
                            {!isLoading ? (
                                'Send Message'
                            ) : (
                                <p className="loading">Sending</p>
                            )}
                        </button>
                        <div style={styles.formInfo}>
                            <p
                                style={Object.assign(
                                    {},
                                    { color: formMessageColor }
                                )}
                            >
                                <b>
                                    <sub>
                                        {formMessage
                                            ? `${formMessage}`
                                            : ' All messages get forwarded straight to my personal email'}
                                    </sub>
                                </b>
                            </p>
                            <p>
                                <sub>
                                    {!isFormValid ? (
                                        <span>
                                            <b style={styles.star}>*</b> =
                                            required
                                        </span>
                                    ) : (
                                        '\xa0'
                                    )}
                                </sub>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <ResumeDownload />
        </div>
    );
};

const styles: StyleSheetCSS = {
    form: {
        flexDirection: 'column',
        marginTop: 32,
    },
    formItem: {
        marginTop: 4,
        marginBottom: 16,
    },
    socialImage: {
        width: 36,
        height: 36,
    },
    buttons: {
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    formInfo: {
        textAlign: 'right',

        flexDirection: 'column',
        alignItems: 'flex-end',
        paddingLeft: 24,
    },
    star: {
        paddingRight: 4,
        color: 'red',
    },
    button: {
        minWidth: 184,
        height: 32,
    },
    header: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    socials: {
        marginBottom: 16,
        justifyContent: 'flex-end',
    },
    social: {
        width: 4,
        height: 4,
        // borderRadius: 1000,

        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    contactLinks: {
        flexDirection: 'column',
        gap: 8,
    },
};

export default Contact;
