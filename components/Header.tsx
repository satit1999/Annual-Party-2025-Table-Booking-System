
import React from 'react';
import { Language } from '../types';
import { translations } from '../constants';

interface HeaderProps {
    currentLanguage: Language;
    onLanguageToggle: () => void;
    onAdminClick: () => void;
    isAdminLoggedIn: boolean;
    loggedInUser: string | null;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentLanguage, onLanguageToggle, onAdminClick, isAdminLoggedIn, loggedInUser, onLogout }) => {
    const t = translations[currentLanguage];

    return (
        <header className="bg-gradient-to-r from-[#aa3a3b] to-[#8b2f30] text-white p-5 shadow-md">
            <div className="container mx-auto">
                <div className="flex justify-between items-center flex-wrap gap-5">
                    <div>
                        <h1 className="text-2xl font-semibold">{t.headerTitle}</h1>
                        <p className="opacity-90 text-sm">{t.headerSubtitle}</p>
                        <p className="opacity-90 text-sm mt-1">{t.eventDate}</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <button
                            onClick={onLanguageToggle}
                            className="bg-white/20 border border-white/30 px-4 py-2 rounded-full text-sm hover:bg-white/30 transition-colors"
                        >
                            {currentLanguage === 'th' ? 'EN' : 'TH'}
                        </button>
                        {isAdminLoggedIn && loggedInUser ? (
                             <div className="flex items-center gap-3 bg-white/10 pl-4 pr-2 py-1.5 rounded-full">
                                <div className="text-right leading-tight">
                                    <span className="font-semibold text-sm">{loggedInUser}</span>
                                    <span className="text-xs opacity-80 block">{t.adminBtnText}</span>
                                </div>
                                <button
                                    onClick={onLogout}
                                    className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
                                    title={t.logoutBtn}
                                >
                                    <span className="material-icons text-xl">logout</span>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={onAdminClick}
                                className="bg-orange-400 px-5 py-2 rounded-full font-medium flex items-center gap-2 hover:bg-orange-500 transition-transform hover:-translate-y-0.5"
                            >
                                <span className="material-icons text-lg">admin_panel_settings</span>
                                <span>{t.adminBtnText}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;