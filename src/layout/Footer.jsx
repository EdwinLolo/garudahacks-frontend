import React from 'react';

const socialLinks = [
  {
    href: 'https://twitter.com/garudahacks',
    label: 'Twitter',
    icon: (
      <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8.29 20c7.547 0 11.675-6.155 11.675-11.495 0-.175 0-.349-.012-.522A8.18 8.18 0 0022 5.92a8.19 8.19 0 01-2.357.636A4.118 4.118 0 0021.448 4.1a8.224 8.224 0 01-2.605.977A4.107 4.107 0 0015.447 4c-2.266 0-4.104 1.828-4.104 4.084 0 .32.036.634.106.934C7.728 8.94 4.1 7.13 1.67 4.149a4.07 4.07 0 00-.555 2.052c0 1.418.724 2.669 1.825 3.401A4.093 4.093 0 01.8 8.575v.051c0 1.98 1.417 3.633 3.301 4.008a4.1 4.1 0 01-1.085.144c-.265 0-.522-.026-.772-.075.523 1.623 2.037 2.805 3.833 2.837A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
      </svg>
    ),
  },
  {
    href: 'https://github.com/garudahacks',
    label: 'GitHub',
    icon: (
      <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.477 2 2 6.484 2 12.012c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.528 2.341 1.088 2.91.832.091-.646.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .267.18.579.688.481C19.138 20.175 22 16.427 22 12.012 22 6.484 17.523 2 12 2z"/>
      </svg>
    ),
  },
];

const Footer = () => (
  <footer className="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 py-10 border-t border-gray-100 dark:border-gray-800 transition-colors">
    <div className="container mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0 text-center md:text-left">
      <div>
        <h3 className="text-xl font-bold text-blue-600 dark:text-blue-300 mb-1">LearnMuse</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Empowering minds, one lesson at a time.</p>
      </div>
      <div className="flex gap-6">
        {socialLinks.map(({ href, label, icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="hover:scale-110 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-200 ease-in-out"
            title={label}
          >
            {icon}
          </a>
        ))}
      </div>
    </div>
    <div className="mt-6 text-sm text-center text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-4">
      &copy; {new Date().getFullYear()} <span className="font-semibold text-blue-600 dark:text-blue-300">LearnMuse</span>. All rights reserved.
    </div>
  </footer>
);

export default Footer;
