import React from 'react';
// // @ts-ignore
// import computer from '../../../assets/pictures/projects/software/computer.mp4';
// // @ts-ignore
// import plant from '../../../assets/pictures/projects/software/plant.mp4';
// // @ts-ignore
// import shopthejob from '../../../assets/pictures/projects/software/shopthejob.mp4';
// // @ts-ignore
// import dressin from '../../../assets/pictures/projects/software/dressin.mp4';
// // @ts-ignore
// import roomph from '../../../assets/pictures/projects/software/roomph.mp4';
import ResumeDownload from '../ResumeDownload';
import VideoAsset from '../../general/VideoAsset';
import OldCarousel from './OldCarousel';
import YoutubeEmbed from '../../general/YoutubeEmbed';
import './style.css';

export interface SoftwareProjectsProps {}

const MyProjects: React.FC<SoftwareProjectsProps> = (props) => {
    const images = [
        '/1.png',
        '/2.png',
        // , '/3.png', '/4.png'
    ];
    return (
        <div className="site-page-content">
            <h3>My Projects</h3>
            <br />
            <p>
                Below are some of my favorite projects I have worked on over the
                last few years.
            </p>
            <br />
            <ResumeDownload />
            <br />

            <div className="text-block">
                <h2>Copilot Travel</h2>
                <br />
                <p>
                    Copilot Travel is a highly versatile Travel Widget that
                    serves as a comprehensive tool for flight search and
                    customization. It is a plug-and-play web component designed
                    for seamless integration with any website, enhancing its
                    functionality by providing a user-friendly interface for
                    flight bookings.
                </p>
                <br />
                <div className="captioned-image">
                    <YoutubeEmbed embedId="Nrv5DMTFNUw" />
                    {/* <VideoAsset src={computer} /> */}
                    <p style={styles.caption}>
                        <sub>
                            <b>Figure 0:</b> Experience the Ease of Flight
                            Booking with the Copilot Travel Demo.
                        </sub>
                    </p>
                </div>
                <p>
                    Primarily, Copilot Travel enables users to search for
                    flights across various providers, aggregating multiple
                    options at their fingertips. It significantly simplifies the
                    flight booking process, allowing users to filter and compare
                    options based on their personal preferences and
                    requirements. Beyond just flight search, Copilot Travel goes
                    the extra mile to make the journey more personalized and
                    comfortable. Users can customize their travel experience by
                    selecting their preferred seating arrangements and
                    specifying their baggage requirements, ensuring a journey
                    tailored to their needs.
                </p>
                <br />
                <p>
                    The power of Copilot Travel lies in its backend
                    architecture. It comprises Cloud Functions and Subgraphs
                    utilizing Apollo GraphQL, a robust data-fetching platform
                    that enables seamless interaction between the client and the
                    server. This infrastructure is globally deployed across all
                    regions and zones of premier cloud platforms such as Google
                    Cloud Platform (GCP), Amazon Web Services (AWS), and
                    Microsoft Azure. Post-deployment, these endpoints undergo
                    load balancing to optimize their performance, enhancing the
                    speed and reliability of the widget.
                </p>
                <br />
                <p>
                    The frontend of the Copilot Travel widget is a Next.js
                    TypeScript application that provides a robust, scalable, and
                    user-friendly interface. Furthermore, this frontend is
                    encapsulated as a web component using Stencil.js and Bit
                    components, which allows it to be integrated easily and
                    universally into any website, irrespective of the underlying
                    technology. This approach ensures maximum compatibility and
                    ease of use, making Copilot Travel an ideal solution for any
                    website looking to extend its offerings in the travel
                    domain.
                </p>
                <br />
            </div>

            <div id="kong" className="text-block">
                <h2>Kong API Gateway</h2>
                <br />
                <p>
                    At the heart of our API management, we used the Kong API
                    Gateway to regulate traffic and secure our cloud functions.
                </p>
                <div className="captioned-image">
                    <OldCarousel images={images} />
                    <p style={styles.caption}>
                        <sub>
                            <b>Figure 1:</b> Kong API Gateway implementation
                            overview.
                        </sub>
                    </p>
                </div>
                <br />
                <p>
                    At the heart of our API management, we used the Kong API
                    Gateway to regulate traffic and secure our cloud functions.
                    Initially, we deployed the Kong Ingress Controller on the
                    Google Kubernetes Engine (GKE) using Anthos, a modern
                    application management platform that extends Google Cloud
                    services and tools to your environments, whether it's
                    on-premise or other clouds. With the Kong Ingress set up, I
                    proceeded to define our APIs using the OpenAPI Specification
                    (OAS) 3.0.0. These specifications were written in a YAML or
                    JSON document, outlining the endpoints, request/response
                    structure, and other details for each of our APIs. After
                    finalizing the specifications, they were deployed into the
                    Kong Developer Portal. The portal serves as a comprehensive
                    hub for developers, providing interactive documentation that
                    facilitates easier API consumption.
                </p>
                <br />
                <p>
                    To further secure our API endpoints, I implemented OAuth, an
                    open standard for access delegation. This ensured that
                    client applications were granted limited access to user
                    resources on an HTTP service, via a third-party application.
                    It provided a more secure layer, controlling which
                    applications have access to our APIs and to what extent. By
                    incorporating Kong API Gateway, OpenAPI specifications, and
                    OAuth, we effectively managed and secured the traffic to our
                    cloud functions, creating an environment that was not only
                    efficient and scalable but also reliable and secure.
                </p>
            </div>

            <div className="text-block">
                <h2>Pixel Copy</h2>
                <br />
                <p>
                    Pixel Copy is a website for Copywriting Team that provides
                    content without having copywriting issue. It has copy
                    writing samples.
                </p>
                <br />
                <div className="captioned-image">
                    <YoutubeEmbed embedId="Tc7DLJVtETo" />
                    <p style={styles.caption}>
                        <sub>
                            <b>Figure 2:</b> Pixel Copy demo.
                        </sub>
                    </p>
                </div>
                <p>
                    This website uses DatoCMS for storing and updating blogs and
                    writing samples data dynmically. Then uses GraphQl to get
                    this data.
                </p>
                <br />
            </div>

            <div className="text-block">
                <h2>My Portfolio</h2>
                <br />
                <p>
                    This is my portfolio website, and also the website you are
                    on right now. This project was an absolute joy to make and
                    challenged me both technically and creatively. Early in
                    2022, I knew I wanted to make an interactive portfolio to
                    aid my job search. I eventually got the idea for this site
                    around early February and began development.
                </p>
                <br />
                <div className="captioned-image">
                    <YoutubeEmbed embedId="DqgwT4pzTeM" />
                    {/* <VideoAsset src={computer} /> */}
                    <p style={styles.caption}>
                        <sub>
                            <b>Figure 3:</b> Blender Scene of the 3D website.
                            The scene from Blender was baked and exported in a
                            GLTF format.
                        </sub>
                    </p>
                </div>
                <p>
                    Now, a quick technical breakdown of the site. The website is
                    split into two parts, the 3D site, and the 2D OS site. The
                    3D site uses Three.js to render the scene and renders the 2D
                    site inside of it using an iframe. The 2D OS site is a
                    simple react site that is hosted{' '}
                    <a
                        rel="noreferrer"
                        target="_blank"
                        href="https://portfolio-9u37mvrxy-u7ama.vercel.app/"
                    >
                        here
                    </a>{' '}
                    and works as a standalone web app. The actual rendering of
                    the 2D site is accomplished using a CSS renderer provided by
                    Three.js that transforms the html of the 2D site with 3D CSS
                    transforms to give the illusion of three dimensionality.
                </p>
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://portfolio-3d-seven.vercel.app/"
                        >
                            <p>
                                <b>[3D Site]</b> - 3D Website URL
                            </p>
                        </a>
                    </li>

                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://portfolio-os-swart.vercel.app/"
                        >
                            <p>
                                <b>[OS Site]</b> - 2D Website URL
                            </p>
                        </a>
                    </li>

                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://github.com/U7ama/portfolio-os.git"
                        >
                            <p>
                                <b>[GitHub]</b> - 2D Site Repository
                            </p>
                        </a>
                    </li>
                </ul>
            </div>

            <div className="text-block">
                <h2>Roomph.pk</h2>
                <br />
                <p>
                    Roomph.pk is a leading hotel booking platform in Pakistan
                    that I had the privilege of building during my tenure at
                    Stash Technologies. As the largest hotel company in the
                    country, Roomph.pk caters to a broad audience seeking
                    comfortable and convenient accommodations.
                </p>
                <br />
                <div className="captioned-image">
                    {/* <YoutubeEmbed embedId="mSMHyw9E0bM" /> */}
                    <YoutubeEmbed embedId="aNT-ytVvBRA" />
                    {/* <VideoAsset src={roomph} /> */}
                    <div style={styles.caption}>
                        <p>
                            <sub style={{ marginLeft: '200px' }}>
                                <b>Figure 4: </b> Roomph demo.
                            </sub>
                        </p>
                    </div>
                </div>
                <p>
                    The website is built using a combination of React.js and
                    Node.js, a powerful tech stack that allows for a highly
                    interactive and responsive user interface along with an
                    efficient and secure backend. The frontend of the website,
                    constructed with React.js, provides a dynamic and
                    user-friendly experience. It offers various features such as
                    browsing hotels, viewing hotel details, and making bookings.
                    The interactive nature of React.js allows for seamless user
                    navigation, making it easy for users to find and book their
                    perfect accommodation. The backend of the website is powered
                    by Node.js, providing a robust and secure foundation. It
                    employs RESTful APIs for handling various requests such as
                    fetching hotel data, processing bookings, and managing user
                    profiles. The data is stored in MongoDB, a NoSQL database,
                    ensuring efficient data retrieval and storage. This
                    architecture allows Roomph.pk to handle multiple
                    simultaneous requests seamlessly, thereby maintaining high
                    performance even during peak usage times.
                </p>
                <br />
                <p>
                    In essence, Roomph.pk is a comprehensive platform for hotel
                    bookings, offering a broad range of options to users while
                    ensuring a smooth, intuitive browsing experience. The
                    website encapsulates my hands-on experience with React.js
                    and Node.js, demonstrating my ability to build scalable,
                    high-performing web applications.
                </p>

                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://roomph.pk/"
                        >
                            <p>
                                <b>[Site]</b> - Website URL
                            </p>
                        </a>
                    </li>
                </ul>
            </div>

            <div className="text-block">
                <h2>Intelligent Plant Taxonomy</h2>
                <br />
                <p>
                    Intelligent Plant Taxonomy was my final year project. This
                    project presents a Web app for plant species that provides
                    easy and fast access to plant species information. This
                    project’s overarching goal is to give plant information
                    under a single interface to allow any user to search for
                    said information from a single place rather than searching
                    in several places. The user interface was designed and
                    customized to help the user search for anything related to
                    plants and get the required information within a few clicks.
                </p>
                <br />
                <div className="captioned-image">
                    <YoutubeEmbed embedId="czAnQxyhXVs" />
                    {/* <VideoAsset src={plant} /> */}
                    <div style={styles.caption}>
                        <p>
                            <sub>
                                <b>Figure 5: </b> Intelligent Plant Taxonomy
                                demo, searching the plant species by uploading a
                                picture.
                            </sub>
                        </p>
                    </div>
                </div>
                <p>
                    Though there are many excellent search engines like Google,
                    Bing, Yahoo, etc, they do not provide much plant species
                    detail or other websites. This proposed Plants
                    Identification web app solves this problem by specifically
                    providing all plant data available and organizing it such
                    that the user can search for plants easily and get the
                    desired information.
                </p>
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://github.com/U7ama/plant-taxonomy"
                        >
                            <p>
                                <b>[GitHub]</b> - Intelligent Plant Taxonomy
                                Repository
                            </p>
                        </a>
                    </li>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://intelligent-plant-taxonomy.herokuapp.com/"
                        >
                            <p>
                                <b>[Site]</b> - Website URL
                            </p>
                        </a>
                    </li>
                </ul>
            </div>

            <div className="text-block">
                <h2>Shop the Job</h2>
                <br />
                <p>
                    Shop the Job is my personal project. This is an eCommerce
                    website where user can search products category-wise. I used
                    React and Tailwind CSS for this web app.
                </p>
                <br />
                <div className="captioned-image">
                    <YoutubeEmbed embedId="da_4aiYYX7c" />
                    {/* <VideoAsset src={shopthejob} /> */}
                    <div style={styles.caption}>
                        <p>
                            <sub style={{ marginLeft: '200px' }}>
                                <b>Figure 6: </b> Shop the Job complete demo.
                            </sub>
                        </p>
                    </div>
                </div>

                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://gitfront.io/r/u7ama/dE4ZiUR8HaF6/shopthejob/"
                        >
                            <p>
                                <b>[GitHub]</b> - Shop the Job Repository
                            </p>
                        </a>
                    </li>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://shopthejob.vercel.app/"
                        >
                            <p>
                                <b>[Site]</b> - Website URL
                            </p>
                        </a>
                    </li>
                </ul>
            </div>

            <div className="text-block">
                <h2>Dress IN</h2>
                <br />
                <p>
                    I made Dress IN web app for my friend's Shopping Store
                    located in Rawalpindi. I used MERN Stack in this project. I
                    made an API for products using nodejs and MongoDB cluster
                    and frontend using React and Tailwind CSS.
                </p>
                <br />
                <div className="captioned-image">
                    <YoutubeEmbed embedId="6-If7Q6rAxo" />
                    {/* <VideoAsset src={dressin} /> */}
                    <div style={styles.caption}>
                        <p>
                            <sub style={{ marginLeft: '250px' }}>
                                <b>Figure 7: </b> Dress IN demo.
                            </sub>
                        </p>
                    </div>
                </div>
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://github.com/U7ama/dress-in.git"
                        >
                            <p>
                                <b>[GitHub]</b> - Dress IN Repository
                            </p>
                        </a>
                    </li>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://github.com/U7ama/dress-in-api.git"
                        >
                            <p>
                                <b>[GitHub]</b> - Dress IN API Repository
                            </p>
                        </a>
                    </li>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://dress-in.vercel.app/"
                        >
                            <p>
                                <b>[Site]</b> - Website URL
                            </p>
                        </a>
                    </li>
                </ul>
            </div>
            <ResumeDownload />
        </div>
    );
};

const styles: StyleSheetCSS = {
    video: {
        width: '100%',
        padding: 12,
    },
    caption: {
        width: '80%',
    },
};

export default MyProjects;
