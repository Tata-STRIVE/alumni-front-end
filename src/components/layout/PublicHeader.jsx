import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

// A new component for switching languages
const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  // Get the current language, or the first part if it's region-specific (e.g., "en-US")
  const currentLang = i18n.language.split('-')[0];

  return (
    <div className="ml-4">
      <select 
        onChange={(e) => changeLanguage(e.target.value)} 
        value={currentLang}
        className="bg-strive-blue text-white text-sm rounded-md p-1 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-strive-orange"
      >
        <option value="en">English</option>
        <option value="hi">हिन्दी</option>
        <option value="te">తెలుగు</option>
      </select>
    </div>
  );
};

const PublicHeader = () => {
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { t } = useTranslation(); // Initialize the translation function

    const navLinkClasses = ({ isActive }) => 
        `text-sm font-semibold ${isActive ? 'text-strive-orange' : 'text-white'} hover:text-strive-orange transition-colors`;
    
    const mobileNavLinkClasses = ({ isActive }) => 
        `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-strive-orange text-white' : 'text-gray-300 hover:bg-strive-blue hover:text-white'}`;

    return (
        <header className="bg-strive-blue shadow-md sticky top-0 z-50">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-white font-bold text-xl flex-shrink-0">
                            STRIVE <span className="text-strive-orange">Connect</span>
                        </Link>
                        <div className="hidden md:block md:ml-10">
                            <div className="flex items-baseline space-x-4">
                                <NavLink to="/success-stories" className={navLinkClasses}>{t('header.success_stories')}</NavLink>
                                <NavLink to="/events" className={navLinkClasses}>{t('header.events')}</NavLink>
                                <NavLink to="/courses" className={navLinkClasses}>{t('header.courses')}</NavLink>
                            </div>
                        </div>
                    </div>
                    
                    <div className="hidden md:flex items-center">
                       {user ? (
                           <div className="flex items-center">
                                <Link to="/dashboard" className="text-white text-sm mr-4 hover:underline">
                                    {t('header.welcome', { name: user.fullName })}
                                </Link>
                                <button onClick={logout} className="bg-strive-orange text-white px-4 py-2 rounded-md text-sm">{t('header.logout')}</button>
                           </div>
                       ) : (
                           <Link to="/login" className="bg-strive-orange text-white px-5 py-2 rounded-md text-sm">{t('header.login')}</Link>
                       )}
                       <LanguageSwitcher />
                    </div>
                       
                    <div className="-mr-2 flex md:hidden">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} type="button" className="bg-strive-blue p-2 rounded-md text-strive-orange">
                            <i className={`fa ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} fa-lg`}></i>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Panel */}
            {isMobileMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <NavLink to="/success-stories" className={mobileNavLinkClasses} onClick={() => setIsMobileMenuOpen(false)}>{t('header.success_stories')}</NavLink>
                        <NavLink to="/events" className={mobileNavLinkClasses} onClick={() => setIsMobileMenuOpen(false)}>{t('header.events')}</NavLink>
                        <NavLink to="/courses" className={mobileNavLinkClasses} onClick={() => setIsMobileMenuOpen(false)}>{t('header.courses')}</NavLink>
                    </div>
                    <div className="pt-4 pb-3 border-t border-blue-800">
                        {user ? (
                             <div className="px-5">
                                <p className="text-base font-medium text-white">{t('header.welcome', { name: user.fullName })}</p>
                                <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="mt-3 w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-300">{t('header.logout')}</button>
                            </div>
                        ) : (
                            <div className="px-2">
                                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center bg-strive-orange text-white px-3 py-2">{t('header.login')}</Link>
                            </div>
                        )}
                        <div className="mt-3 px-5">
                            <LanguageSwitcher />
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default PublicHeader;

