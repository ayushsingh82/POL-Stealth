import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full border-4 border-black px-6 flex items-center justify-between bg-white text-black" style={{ minHeight: '90px' }}>
      <div className="bg-[#FCD119] border-2 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] px-6 py-3 rounded-lg text-2xl font-black text-black">
        Zen-Stealth
      </div>
      <div className="flex items-center gap-8 text-2xl">
      <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" width="24" />

        <a href="https://x.com/your-x" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">𝕏</a>
        <a href="https://docs.yourproject.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">📄</a>
      </div>
    </footer>
  );
};

export default Footer;