
import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../constants';

interface AdminLoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (success: boolean, displayName?: string) => void;
    currentLanguage: Language;
}

const adminUsers = [
    { fullName: 'นางนราวรรณ สุ่นตระกูล', username: '0970601930', password: '0970601930' },
    { fullName: 'น.ส.นาถนรี ปรียานนท์', username: '0949647964', password: '0949647964' },
    { fullName: 'น.ส.บุศรัตน์ พลอยเลิศ', username: '0651562457', password: '0651562457' },
    { fullName: 'นายพสิษฐ์ สัตบุตร', username: 'A0833759527', password: 'A0833759527' },
    { fullName: 'น.ส.รุ่งนภา พรมบุตร', username: '0969780682', password: '0969780682' },
    { fullName: 'นางอรวรรณ ไชยบาล', username: '0651561755', password: '0651561755' },
    { fullName: 'น.ส.เพชรพัชรี สุระปัญญา', username: '0924606190', password: '0924606190' },
    { fullName: 'นายเสฎฐวุฒิ แก้วมรกต', username: '0652630965', password: '0652630965' },
    { fullName: 'นายเอื้อวิช วัฒนะวิโรฒ', username: '0958607873', password: '0958607873' },
    { fullName: 'นายวิศัลย์ เพ็ชรตระกูล', username: '0818343465', password: '0818343465' },
    { fullName: 'นางปราณี เรียนรู้', username: '08802105933', password: '08802105933' },
];

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onLogin, currentLanguage }) => {
    const t = translations[currentLanguage];
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const user = adminUsers.find(u => u.username === username && u.password === password);
        if (user) {
            onLogin(true, user.fullName);
            setUsername('');
            setPassword('');
        } else {
            onLogin(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl p-8 shadow-2xl w-full max-w-md relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
                    <span className="material-icons">close</span>
                </button>
                
                <h3 className="text-2xl font-bold text-center text-[#aa3a3b] mb-6">{t.adminLoginTitle}</h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="font-medium text-gray-700 block mb-2">{t.usernameLabel}</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#aa3a3b]"
                            required
                        />
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 block mb-2">{t.passwordLabel}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#aa3a3b]"
                            required
                        />
                    </div>
                    <div className="pt-2">
                        <button type="submit" className="w-full bg-[#aa3a3b] text-white font-bold py-3 rounded-lg transition-all hover:bg-[#8b2f30] hover:shadow-md">
                            {t.loginBtn}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLoginModal;
