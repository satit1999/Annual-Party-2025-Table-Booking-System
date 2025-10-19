
import React from 'react';
import { translations, calculateTotalPrice } from '../constants';
import { Language } from '../types';

interface BookingSummaryProps {
    selectedSeats: string[];
    setSelectedSeats: React.Dispatch<React.SetStateAction<string[]>>;
    onProceed: () => void;
    currentLanguage: Language;
    isBookingClosed: boolean;
    isAdminLoggedIn: boolean;
    editingBookingId: string | null;
    onUpdateBooking: () => void;
    onCancelEdit: () => void;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({ 
    selectedSeats, 
    setSelectedSeats, 
    onProceed, 
    currentLanguage, 
    isBookingClosed, 
    isAdminLoggedIn,
    editingBookingId,
    onUpdateBooking,
    onCancelEdit 
}) => {
    const t = translations[currentLanguage];
    const totalAmount = calculateTotalPrice(selectedSeats);

    const canProceed = !isBookingClosed || isAdminLoggedIn;

    return (
        <div className="bg-white rounded-xl p-6 shadow-lg sticky top-24">
            <h3 className="text-xl font-bold text-[#aa3a3b] text-center mb-5">{editingBookingId ? t.editBtn : t.summaryTitle}</h3>
            
            <div className="space-y-3 text-gray-700">
                <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">{t.summarySeats}</span>
                    <span className="font-bold text-lg">{selectedSeats.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">{t.seatNamesLabel}</span>
                    <span className="font-bold text-right text-sm max-h-20 overflow-y-auto pl-2">
                        {selectedSeats.length > 0 ? selectedSeats.sort().join(', ') : '-'}
                    </span>
                </div>
                <div className="flex justify-between items-center pt-4 mt-4 border-t-2 border-[#aa3a3b]">
                    <span className="font-bold text-lg text-[#aa3a3b]">{t.summaryTotal}</span>
                    <span className="font-bold text-xl text-[#aa3a3b]">
                        {totalAmount.toLocaleString()} {currentLanguage === 'th' ? 'บาท' : 'THB'}
                    </span>
                </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
                {editingBookingId ? (
                    <>
                        <button
                            onClick={onUpdateBooking}
                            disabled={selectedSeats.length === 0}
                            className="w-full bg-green-600 text-white font-bold py-3 rounded-lg transition-all hover:bg-green-700 hover:shadow-md disabled:bg-gray-300 flex items-center justify-center gap-2"
                        >
                             <span className="material-icons">save</span>
                            {t.saveChangesBtn}
                        </button>
                        <button
                            onClick={onCancelEdit}
                            className="w-full bg-transparent border-2 border-gray-500 text-gray-600 font-bold py-2.5 rounded-lg transition-all hover:bg-gray-200"
                        >
                            {t.cancelBtn}
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={onProceed}
                            disabled={selectedSeats.length === 0 || !canProceed}
                            className="w-full bg-[#aa3a3b] text-white font-bold py-3 rounded-lg transition-all hover:bg-[#8b2f30] hover:shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            {t.proceedBtn}
                        </button>
                        <button
                            onClick={() => setSelectedSeats([])}
                            className="w-full bg-transparent border-2 border-[#aa3a3b] text-[#aa3a3b] font-bold py-2.5 rounded-lg transition-all hover:bg-[#aa3a3b] hover:text-white"
                        >
                            {t.clearBtn}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default BookingSummary;