
import React from 'react';
import { Section, Language } from '../types';
import { translations } from '../constants';

interface NavTabsProps {
    currentSection: Section;
    onSectionChange: (section: Section) => void;
    isAdminLoggedIn: boolean;
    currentLanguage: Language;
}

const NavTab: React.FC<{
    label: string;
    icon: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
    const activeClasses = "text-white bg-gradient-to-r from-[#aa3a3b] to-[#8b2f30] border-orange-400 shadow-lg -translate-y-0.5";
    const inactiveClasses = "text-gray-500 hover:text-[#aa3a3b] hover:bg-red-500/10 hover:-translate-y-px";

    return (
        <button
            onClick={onClick}
            className={`px-6 md:px-10 py-5 font-semibold text-lg border-b-4 transition-all duration-300 flex items-center gap-3 whitespace-nowrap ${isActive ? activeClasses : inactiveClasses}`}
        >
            <span className="material-icons text-2xl">{icon}</span>
            <span>{label}</span>
        </button>
    );
};

const NavTabs: React.FC<NavTabsProps> = ({ currentSection, onSectionChange, isAdminLoggedIn, currentLanguage }) => {
    const t = translations[currentLanguage];

    if (!isAdminLoggedIn) return null;

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-40 border-b border-gray-200">
            <div className="container mx-auto flex justify-center overflow-x-auto">
                <NavTab
                    label={t.navBooking}
                    icon="event_seat"
                    isActive={currentSection === 'booking'}
                    onClick={() => onSectionChange('booking')}
                />
                <NavTab
                    label={t.navForm}
                    icon="person_add"
                    isActive={currentSection === 'form'}
                    onClick={() => onSectionChange('form')}
                />
                {isAdminLoggedIn && (
                    <NavTab
                        label={t.navAdmin}
                        icon="dashboard"
                        isActive={currentSection === 'admin'}
                        onClick={() => onSectionChange('admin')}
                    />
                )}
            </div>
        </nav>
    );
};

export default NavTabs;
