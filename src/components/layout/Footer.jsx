import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import the hook

/**
 * The final, complete Footer component, now fully translated.
 */
const Footer = () => {
    const { t } = useTranslation(); // Initialize the translation function

    return (
        <footer className="bg-strive-blue">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                    <div className="space-y-8 xl:col-span-1">
                        <Link to="/" className="text-2xl font-bold text-white">
                            STRIVE <span className="text-strive-orange">Connect</span>
                        </Link>
                        <p className="text-gray-300 text-base">
                            {t('footer.empowering_message')}
                        </p>
                    </div>
                    <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">{t('footer.navigate_heading')}</h3>
                                <ul className="mt-4 space-y-4">
                                    <li><Link to="/success-stories" className="text-base text-gray-200 hover:text-white">{t('header.success_stories')}</Link></li>
                                    <li><Link to="/events" className="text-base text-gray-200 hover:text-white">{t('header.events')}</Link></li>
                                    <li><Link to="/courses" className="text-base text-gray-200 hover:text-white">{t('header.courses')}</Link></li>
                                </ul>
                            </div>
                            <div className="mt-12 md:mt-0">
                                <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">{t('footer.alumni_heading')}</h3>
                                <ul className="mt-4 space-y-4">
                                    <li><Link to="/login" className="text-base text-gray-200 hover:text-white">{t('header.login')}</Link></li>
                                    <li><Link to="/dashboard" className="text-base text-gray-200 hover:text-white">{t('header.my_hub')}</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-12 border-t border-gray-700 pt-8">
                    <p className="text-base text-gray-300 xl:text-center">{t('footer.copyright')}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

    