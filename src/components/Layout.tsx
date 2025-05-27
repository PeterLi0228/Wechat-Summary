
import React from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
}

const Layout = ({ children, showNavigation = true }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-xiaohongshu-cream via-white to-xiaohongshu-lightPink">
      <div className="w-full max-w-6xl mx-auto bg-white min-h-screen shadow-xl relative">
        <main className={`${showNavigation ? 'pb-20 md:pb-0 md:pl-64' : ''}`}>
          {children}
        </main>
        {showNavigation && <Navigation />}
      </div>
    </div>
  );
};

export default Layout;
