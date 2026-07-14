import React from 'react';
import { Link } from 'react-router-dom';
import { usePortfolioContent } from '../../content/PortfolioContent';

export interface BlogProps {}

const Blog: React.FC<BlogProps> = () => {
    const { data } = usePortfolioContent();
    const email = data.contacts.find((contact) => contact.id === 'email');

    return (
        <div className="site-page-content">
            <h1 style={{ marginLeft: -16 }}>Articles</h1>
            <br />
            <div className="text-block">
                <p>
                    Thoughts, practical walkthroughs, and reflections from my
                    software development work.
                </p>
            </div>

            {data.articles.map((article) => (
                <article key={article.id} style={styles.postCard}>
                    <h3>{article.title}</h3>
                    <h4>
                        <time dateTime={article.date}>{article.date}</time>
                    </h4>
                    <p style={styles.summary}>{article.summary}</p>
                    {article.links.map((link) => (
                        <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={link.url}
                        >
                            {link.label}
                        </a>
                    ))}
                </article>
            ))}

            <div className="text-block">
                <p>
                    Questions or comments are always welcome. Reach me through
                    the <Link to="/contact">contact page</Link>
                    {email ? (
                        <>
                            {' '}or email <a href={email.url}>{email.url.replace('mailto:', '')}</a>.
                        </>
                    ) : (
                        '.'
                    )}
                </p>
            </div>
        </div>
    );
};

const styles: StyleSheetCSS = {
    postCard: {
        backgroundColor: '#f8f8f8',
        padding: 20,
        margin: '20px 0',
        border: '2px solid #808080',
        boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 12,
    },
    summary: {
        width: '100%',
    },
};

export default Blog;
