import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50">
      <div style={{ filter: 'hue-rotate(200deg)', width: '300px', height: '300px' }}>
        <DotLottieReact
          src="https://lottie.host/f6da451b-2f5c-496f-a432-dc4e39ccf6ab/Bq5AYOX0yr.lottie"
          loop
          autoplay
        />
      </div>
    </div>
  );
};

export default LoadingScreen;
