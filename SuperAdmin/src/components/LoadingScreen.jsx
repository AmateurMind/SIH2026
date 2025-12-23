import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50">
      <DotLottieReact
        src="https://lottie.host/4c74ada3-0014-4efb-ba51-c495effd8463/GQkGrwpmUS.lottie"
        loop
        autoplay
      />
    </div>
  );
};

export default LoadingScreen;
