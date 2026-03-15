import React from "react";

export const CubeLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-16 w-full">
      <div className="w-20 h-20 grid grid-cols-3 gap-1 bg-transparent">
        {Array.from({ length: 9 }).map((_, i) => {
          const delays = [
            "0.2s",
            "0.3s",
            "0.4s",
            "0.3s",
            "0.4s",
            "0.5s",
            "0.4s",
            "0.5s",
            "0.6s",
          ];
          return (
            <div
              key={i}
              className="bg-blue-600 rounded-sm"
              style={{
                animationName: "cubeGridScaleDelay",
                animationDuration: "1.3s",
                animationIterationCount: "infinite",
                animationTimingFunction: "ease-in-out",
                animationDelay: delays[i],
              }}
            />
          );
        })}
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes cubeGridScaleDelay {
          0%, 70%, 100% {
            transform: scale3D(1, 1, 1);
          }
          35% {
            transform: scale3D(0, 0, 1);
          }
        }
      `}} />
      <div className="flex flex-col items-center space-y-2 text-center mt-4">
        <h3 className="text-2xl font-semibold text-gray-800">Hang tight!</h3>
        <p className="text-gray-500 font-medium animate-pulse max-w-sm text-center">
          We are generating your personalized interview environment...
        </p>
      </div>
    </div>
  );
};
