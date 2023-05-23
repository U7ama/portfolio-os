import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { blogData } from '../../assets/blogs/blogs';

export interface BlogProps { }

interface BlogPost {
    title: string;
    content: string;
    date: string;
    author: string;
    image: string;
}

const Blog: React.FC<BlogProps> = (props) => {
    const [selectedPost, setSelectedPost] = useState<number | null>(null);

    const handleClick = (index: number) => {
        if (selectedPost === index) {
            // If the post is currently selected, deselect it
            setSelectedPost(null);
        } else {
            // If the post is not currently selected, select it
            setSelectedPost(index);
        }
    };

    return (
        <div className="site-page-content">
            <h1 style={{ marginLeft: -16 }}>Blog</h1>
            <br />
            <div className="text-block">
                <p>
                    Welcome to my blog! Here you will find a collection of my thoughts, experiences and reflections.
                </p>
                <br />
            </div>

            {blogData.map((post: BlogPost, index: number) => (
                <div key={index} style={styles.postCard}>
                    <h3>{post.title}</h3>
                    <h4>By {post.author} on {post.date}</h4>
                    {/* <div style={styles.verticalImage}>
                        <img src={post.image} style={styles.image} alt="" />
                        <p>
                            <sub>
                                <b>Figure {index+1}:</b> Image for blog post titled "{post.title}"
                            </sub>
                        </p>
                    </div> */}
                    <p style={selectedPost === index ? styles.fullContent : styles.truncatedContent}>
                        {selectedPost === index ? (
                            post.content.split('\n').map((para, i) => <p key={i}>{para}</p>)
                        ) : (
                            post.content.split('\n')[0]
                        )}
                    </p>
                    <button style={styles.readMoreButton} onClick={() => handleClick(index)}>
                        {selectedPost === index ? "Read Less" : "Read More"}
                    </button>
                </div>
            ))}

            <div className="text-block">
                <p>
                    Thanks for reading my blog! I hope that you enjoyed it.
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
    verticalImage: {
        alignSelf: 'center',
        marginLeft: 32,
        marginTop: '40px',
        alignItems: 'center',
        textAlign: 'center',
        flexDirection: 'column',
    },
    postCard: {
        backgroundColor: '#f8f8f8',
        padding: '20px',
        margin: '20px 0',
        borderRadius: '10px',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
    },
    truncatedContent: {
        width: '100%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    fullContent: {
        width: '100%',
    },
    readMoreButton: {
        marginTop: '10px',
        fontFamily: 'Times New Roman',
        fontSize: '20px',
        border: 'none',
        backgroundColor: 'transparent',
        color: 'blue',
        cursor: 'pointer',
    },
};

export default Blog;
