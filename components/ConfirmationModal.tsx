import React from 'react';
import { ParentInfo, StudentInfo, Language } from '../types';
import { translations, calculateTotalPrice } from '../constants';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    bookingData: {
        parent: ParentInfo;
        student: StudentInfo;
        seats: string[];
        total: number;
    };
    currentLanguage: Language;
    isLoading: boolean;
}

const InfoSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-4 rounded-lg border">
        <h4 className="font-bold text-[#aa3a3b] mb-3 text-lg border-b pb-2">{title}</h4>
        <div className="space-y-2 text-sm text-gray-700">{children}</div>
    </div>
);

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, bookingData, currentLanguage, isLoading }) => {
    const t = translations[currentLanguage];

    if (!isOpen) return null;

    const { parent, student, seats, total } = bookingData;

    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity duration-300 animate-fadeIn"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-gray-50 rounded-2xl p-6 md:p-8 shadow-2xl w-full max-w-2xl relative transform transition-transform duration-300 animate-scaleUp"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors" aria-label="Close modal">
                    <span className="material-icons">close</span>
                </button>
                
                <h3 className="text-2xl font-bold text-center text-[#aa3a3b] mb-2">{t.confirmBookingTitle}</h3>
                <p className="text-center text-gray-500 mb-6">{t.confirmBookingMessage}</p>

                <div className="space-y-4">
                    <InfoSection title={t.parentTitle}>
                        <p><strong>{t.customerNameHeader}:</strong> {`${parent.prefix} ${parent.firstName} ${parent.lastName}`}</p>
                        <p><strong>{t.parentPhoneLabel}:</strong> {parent.phone}</p>
                    </InfoSection>

                    <InfoSection title={t.studentTitle}>
                        <p><strong>{t.studentNameHeader}:</strong> {`${student.prefix} ${student.firstName} ${student.lastName}`}</p>
                        <p><strong>{t.studentProgramLabel}:</strong> {student.program}</p>
                        <p><strong>{t.studentClassLabel}:</strong> {student.class}</p>
                    </InfoSection>

                    <InfoSection title={t.summaryTitle}>
                        <p><strong>{t.summarySeats}:</strong> {seats.length}</p>
                        <p><strong>{t.seatNamesLabel}:</strong> <span className="font-mono">{seats.join(', ')}</span></p>
                        <p className="text-lg font-bold text-[#aa3a3b] mt-2">
                            <strong>{t.summaryTotal}:</strong> {total.toLocaleString()} {currentLanguage === 'th' ? 'บาท' : 'THB'}
                        </p>
                    </InfoSection>
                </div>
                
                <div className="flex flex-col sm:flex-row-reverse gap-4 justify-center mt-8">
                    <button 
                        onClick={onConfirm} 
                        disabled={isLoading} 
                        className="w-full sm:w-auto bg-[#aa3a3b] text-white font-bold py-3 px-8 rounded-lg transition-all hover:bg-[#8b2f30] hover:shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                       {isLoading ? (
                           <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                       ) : (
                           t.saveBookingBtn
                       )}
                    </button>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="w-full sm:w-auto bg-transparent border-2 border-gray-400 text-gray-700 font-bold py-3 px-8 rounded-lg transition-all hover:bg-gray-200"
                    >
                        {t.editInfoBtn}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
