import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-indigo-600 flex flex-col items-center justify-center z-[100]">
      <h1 className="text-5xl font-bold text-white animate-pulse">
        BU-Planner
      </h1>
    </div>
  );
};

export default SplashScreen;