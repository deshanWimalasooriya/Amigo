import React from 'react';
import { FaVideo, FaGithub, FaLinkedin, FaTwitter, FaHeart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-beige-100 border-t border-beige-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">

          {/* Brand */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2.5 w-fit group"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-sage flex items-center justify-center">
                <FaVideo className="text-white text-xs" />
              </div>
              <span className="font-display font-bold text-charcoal-900">Amigo</span>
            </button>
            <p className="text-xs text-charcoal-400 leading-relaxed max-w-[200px]">
              A calm, collaborative video meeting platform built for focused teams.
            </p>
            <div className="flex gap-3">
              {[FaGithub, FaLinkedin, FaTwitter].map((Icon, i) => (
                <button
                  key={i}
                  className="w-7 h-7 rounded-lg bg-beige-200 hover:bg-sage-100 text-charcoal-500 hover:text-sage-600 flex items-center justify-center transition-all duration-200"
                >
                  <Icon className="text-xs" />
                </button>
              ))}
            </div>
          </div>

          {/* Product links */}
          <div>
            <p className="text-xs font-semibold text-charcoal-700 uppercase tracking-widest mb-3">Product</p>
            <ul className="flex flex-col gap-2">
              {[
                ['Dashboard', '/dashboard'],
                ['New Meeting', '/new-meeting'],
                ['Schedule', '/schedule-meeting'],
                ['Recordings', '/recordings'],
              ].map(([label, path]) => (
                <li key={path}>
                  <button
                    onClick={() => navigate(path)}
                    className="text-xs text-charcoal-500 hover:text-sage-600 transition-colors duration-200"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <p className="text-xs font-semibold text-charcoal-700 uppercase tracking-widest mb-3">Support</p>
            <ul className="flex flex-col gap-2">
              {['Help Center', 'Privacy Policy', 'Terms of Service', 'Contact Us'].map(label => (
                <li key={label}>
                  <button className="text-xs text-charcoal-500 hover:text-sage-600 transition-colors duration-200">
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-beige-300 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-charcoal-400">
            &copy; {year} Amigo. All rights reserved.
          </p>
          <p className="text-xs text-charcoal-400 flex items-center gap-1">
            Made with <FaHeart className="text-sage-500 text-[10px]" /> for calm collaboration
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
