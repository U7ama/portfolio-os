import React, { useState, useEffect } from 'react';
import './OldCarousel.css';

interface Props {
  images: string[];
}

const OldCarousel: React.FC<Props> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleClickPrev = () => {
    setCurrentIndex((currentIndex - 1 + images.length) % images.length);
  };

  const handleClickNext = () => {
    setCurrentIndex((currentIndex + 1) % images.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((currentIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [currentIndex, images.length]);

  return (
    <div className="carousel-container">
      <img src={images[currentIndex]} alt="Carousel Image" className="carousel-image" />
      <div className="carousel-button-next" onClick={handleClickPrev}>
        <button className="carousel-button">
          &lt;
        </button>
      </div>
      <div className="carousel-button-prev" onClick={handleClickNext}>
        <button className="carousel-button">
          &gt;
        </button>
      </div>
    </div>
  );
};

export default OldCarousel;
