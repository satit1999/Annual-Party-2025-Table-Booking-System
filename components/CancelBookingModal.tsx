import React, { useState, useMemo, useEffect } from 'react';
import { Booking, Language } from '../types';
import { translations, calculateTotalPrice, SEATS_PER_TABLE } from '../constants';

declare var Swal: any;

interface CancelBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (bookingId: string, seatsToCancel: string[]) => void;
    booking: Booking | null;
    currentLanguage: Language;
}

const CancelBookingModal: React.FC<CancelBookingModalProps> = ({ isOpen, onClose, onConfirm, booking, currentLanguage }) => {
    const t = translations[currentLanguage];
    const [seatsToCancel, setSeatsToCancel] = useState<string[]>([]);

    useEffect(() => {
        if (!isOpen) {
            setSeatsToCancel([]);
        }
    }, [isOpen]);

    const seatsByTable = useMemo(() => {
        const grouped: { [key: string]: string[] } = {};
        if (booking?.seats) {
            booking.seats.forEach(seat => {
                const [tableId, seatNum] = seat.split('-');
                if (!grouped[tableId]) {
                    grouped[tableId] = [];
                }
                if (seatNum) {
                    grouped[tableId].push(seatNum);
                }
            });
        }
        return grouped;
    }, [booking]);

    const remainingSeats = useMemo(() => {
        return booking ? booking.seats.filter(s => !seatsToCancel.includes(s)) : [];
    }, [booking, seatsToCancel]);

    const newTotal = calculateTotalPrice(remainingSeats);

    if (!isOpen || !booking) return null;

    const handleTableCheck = (tableId: string, isChecked: boolean) => {
        const tableSeats = seatsByTable[tableId].map(seatNum => `${tableId}-${seatNum}`);
        if (isChecked) {
            setSeatsToCancel(prev => [...new Set([...prev, ...tableSeats])]);
        } else {
            setSeatsToCancel(prev => prev.filter(s => !tableSeats.includes(s)));
        }
    };

    const handleSeatCheck = (seatId: string, isChecked: boolean) => {
        if (isChecked) {
            setSeatsToCancel(prev => [...prev, seatId]);
        } else {
            setSeatsToCancel(prev => prev.filter(s => s !== seatId));
        }
    };

    const handleConfirm = () => {
        if (seatsToCancel.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: t.swalWarningTitle,
                text: t.swalSelectItemsToCancel,
                confirmButtonColor: '#aa3a3b',
            });
            return;
        }
        onConfirm(booking.id, seatsToCancel);
    };
    
    const sortedTableIds = Object.keys(seatsByTable).sort();

    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeIn"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl w-full max-w-2xl relative animate-scaleUp max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" aria-label="Close modal">
                    <span className="material-icons">close</span>
                </button>
                
                <h3 className="text-2xl font-bold text-center text-[#aa3a3b] mb-2">{t.cancelBookingTitle}</h3>
                <p className="text-center text-gray-500 mb-6 font-mono">{t.bookingIdHeader}: {booking.id}</p>

                <div className="flex-grow overflow-y-auto pr-2">
                    <p className="font-semibold mb-4 text-gray-700">{t.selectItemsToCancel}:</p>
                    <div className="space-y-4">
                        {sortedTableIds.map(tableId => {
                            const tableSeats = seatsByTable[tableId].map(seatNum => `${tableId}-${seatNum}`);
                            const allOnTableSelected = tableSeats.every(s => seatsToCancel.includes(s));
                            const isFullTable = tableSeats.length === SEATS_PER_TABLE;

                            return (
                                <div key={tableId} className="bg-gray-50 p-4 rounded-lg border">
                                    <div className="flex items-center justify-between border-b pb-2 mb-3">
                                        <h4 className="font-bold text-lg text-gray-800">{t.tableLabel} {tableId}</h4>
                                        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="h-5 w-5 rounded border-gray-300 text-[#aa3a3b] focus:ring-[#aa3a3b]"
                                                checked={allOnTableSelected}
                                                onChange={(e) => handleTableCheck(tableId, e.target.checked)}
                                            />
                                            {isFullTable ? t.cancelEntireTable : t.selectAll}
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {seatsByTable[tableId].map(seatNum => {
                                            const seatId = `${tableId}-${seatNum}`;
                                            return (
                                                <label key={seatId} className="flex items-center gap-2 p-2 bg-white rounded-md border has-[:checked]:bg-red-50 has-[:checked]:border-red-400 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                                        checked={seatsToCancel.includes(seatId)}
                                                        onChange={(e) => handleSeatCheck(seatId, e.target.checked)}
                                                    />
                                                    <span className="font-mono">{t.seatsLabel} {seatNum}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t space-y-3">
                    <div className="flex justify-between items-center text-lg">
                        <span className="font-medium text-gray-600">{t.originalTotal}:</span>
                        <span className="font-bold text-gray-800">{booking.total.toLocaleString()} {t.currency}</span>
                    </div>
                    <div className="flex justify-between items-center text-xl">
                        <span className="font-bold text-[#aa3a3b]">{t.newTotal}:</span>
                        <span className="font-bold text-[#aa3a3b]">{newTotal.toLocaleString()} {t.currency}</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row-reverse gap-4 justify-center mt-6">
                    <button 
                        onClick={handleConfirm} 
                        disabled={seatsToCancel.length === 0}
                        className="w-full sm:w-auto bg-red-600 text-white font-bold py-3 px-8 rounded-lg transition-all hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        {t.confirmCancellationBtn}
                    </button>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="w-full sm:w-auto bg-transparent border-2 border-gray-400 text-gray-700 font-bold py-3 px-8 rounded-lg transition-all hover:bg-gray-200"
                    >
                        {t.cancelBtn}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancelBookingModal;