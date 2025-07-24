import React from 'react';

const Footer = () => (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white dark:text-gray-200 text-center py-4 fixed left-0 bottom-0 w-full border-t border-gray-800 dark:border-gray-700 transition-colors">
        © {new Date().getFullYear()} GarudaHacks. All rights reserved.
    </footer>
);

export default Footer;
