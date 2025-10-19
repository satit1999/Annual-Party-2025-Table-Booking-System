import React, { useMemo } from 'react';
import { Booking, Language } from '../types';
import { translations } from '../constants';

interface BookingDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: Booking;
    currentLanguage: Language;
}

const InfoRow: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 py-2">
        <span className="material-icons text-lg text-[#aa3a3b] mt-1">{icon}</span>
        <div className="flex flex-col">
            <span className="text-sm text-gray-500">{label}</span>
            <span className="font-semibold text-gray-800">{value}</span>
        </div>
    </div>
);

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ isOpen, onClose, booking, currentLanguage }) => {
    const t = translations[currentLanguage];

    if (!isOpen) return null;

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
            for (const tableId in grouped) {
                grouped[tableId].sort();
            }
        }
        return grouped;
    }, [booking?.seats]);

    const sortedTableIds = useMemo(() => Object.keys(seatsByTable).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })), [seatsByTable]);

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
                
                <h3 className="text-2xl font-bold text-center text-[#aa3a3b] mb-2">{t.bookingDetailsTitle}</h3>
                <p className="text-center text-gray-500 mb-6 font-mono">{t.bookingIdHeader}: {booking.id}</p>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Parent Info */}
                    <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-bold text-[#aa3a3b] mb-3 text-lg border-b pb-2">{t.parentTitle}</h4>
                        <InfoRow icon="person" label={t.customerNameHeader} value={`${booking.parent.prefix} ${booking.parent.firstName} ${booking.parent.lastName}`} />
                        <InfoRow icon="phone" label={t.parentPhoneLabel} value={booking.parent.phone} />
                    </div>
                    {/* Student Info */}
                     <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-bold text-[#aa3a3b] mb-3 text-lg border-b pb-2">{t.studentTitle}</h4>
                        <InfoRow icon="school" label={t.studentNameHeader} value={`${booking.student.prefix} ${booking.student.firstName} ${booking.student.lastName}`} />
                        <InfoRow icon="class" label={t.studentProgramLabel} value={booking.student.program} />
                        <InfoRow icon="assignment" label={t.studentClassLabel} value={booking.student.class} />
                    </div>
                </div>

                {/* Booking Details */}
                <div className="mt-6 bg-white p-4 rounded-lg border">
                    <h4 className="font-bold text-[#aa3a3b] mb-3 text-lg border-b pb-2">{t.summaryTitle}</h4>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-3 bg-gray-100 rounded">
                            <div className="text-sm text-gray-500">{t.amountHeader}</div>
                            <div className="font-bold text-lg text-[#aa3a3b]">{booking.total.toLocaleString()} {currentLanguage === 'th' ? 'บาท' : 'THB'}</div>
                        </div>
                         <div className="p-3 bg-gray-100 rounded">
                            <div className="text-sm text-gray-500">{t.statusHeader}</div>
                            <div className="font-bold text-lg text-green-600 capitalize">{booking.status}</div>
                        </div>
                        <div className="p-3 bg-gray-100 rounded lg:col-span-2">
                            <div className="text-sm text-gray-500">Booking Date</div>
                            <div className="font-bold text-lg">{new Date(booking.timestamp).toLocaleString(currentLanguage === 'th' ? 'th-TH' : 'en-US')}</div>
                        </div>
                         {booking.bookedBy && (
                             <div className="p-3 bg-gray-100 rounded sm:col-span-2 lg:col-span-4">
                                <div className="text-sm text-gray-500">{t.bookedByHeader}</div>
                                <div className="font-bold text-lg">{booking.bookedBy}</div>
                            </div>
                        )}
                    </div>
                    <div className="mt-4">
                        <h5 className="font-semibold text-gray-700 mb-2">{t.seatsHeader}</h5>
                        <div className="bg-gray-100 p-4 rounded-lg max-h-40 overflow-y-auto font-mono text-sm space-y-2">
                            {sortedTableIds.length > 0 ? (
                                sortedTableIds.map(tableId => (
                                    <div key={tableId} className="flex items-baseline">
                                        <span className="font-bold w-24 shrink-0">{t.tableLabel} {tableId}:</span>
                                        <span className="text-gray-700 flex-1">{seatsByTable[tableId].join(', ')}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center">-</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingDetailsModal;