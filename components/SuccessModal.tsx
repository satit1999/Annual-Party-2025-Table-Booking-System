import React, { useRef } from 'react';
import { Booking, Language } from '../types';
import { translations } from '../constants';

declare var html2canvas: any;
declare var Swal: any;


interface SuccessModalProps {
    booking: Booking | null;
    onClose: () => void;
    currentLanguage: Language;
}

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex justify-between items-start py-1">
        <span className="text-gray-500">{label}:</span>
        <span className="font-semibold text-gray-800 text-right">{value}</span>
    </div>
);

const SuccessModal: React.FC<SuccessModalProps> = ({ booking, onClose, currentLanguage }) => {
    const t = translations[currentLanguage];
    const modalContentRef = useRef<HTMLDivElement>(null);

    const handleSaveAsJpeg = async () => {
        if (!modalContentRef.current || !booking) {
            console.error("Modal content ref or booking not found.");
            return;
        }

        const printableArea = modalContentRef.current.querySelector('.printable-area');
        if (!printableArea) {
            console.error("Printable area not found.");
            return;
        }

        try {
            const canvas = await html2canvas(printableArea as HTMLElement, {
                scale: 2.5, // Higher scale for better quality
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            
            const link = document.createElement('a');
            const bookerName = `${booking.parent.firstName}${booking.parent.lastName}`.replace(/\s/g, '');
            link.download = `${booking.id}_${bookerName}.jpeg`;
            link.href = imgData;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            Swal.fire({
                icon: 'success',
                title: t.swalSuccessTitle,
                text: t.swalJpegSuccess,
                timer: 2000,
                showConfirmButton: false,
            });

        } catch (error) {
            console.error("Failed to save JPEG:", error);
             Swal.fire({
                icon: 'error',
                title: t.swalErrorTitle,
                text: t.swalJpegError,
                confirmButtonColor: '#aa3a3b',
            });
        }
    };
    
    if (!booking) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeIn"
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative animate-scaleUp"
                onClick={(e) => e.stopPropagation()}
            >
                <div ref={modalContentRef} className="p-6 md:p-8">
                    <div className="printable-area">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-3">
                                <span className="material-icons text-4xl text-green-600">check_circle_outline</span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800">{t.bookingSuccessTitle}</h3>
                            <p className="text-gray-600 mb-4">{t.bookingSuccessMessage}</p>
                            <p className="text-sm font-mono text-gray-500">{t.bookingIdHeader}: {booking.id}</p>
                        </div>

                        <div className="my-6 border-t border-b py-4 space-y-4">
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-2">{t.bookingDetailsTitle}</h4>
                                <div className="bg-gray-50 p-3 rounded-md space-y-1 text-sm">
                                    <InfoRow label={t.customerNameHeader} value={`${booking.parent.prefix} ${booking.parent.firstName} ${booking.parent.lastName}`} />
                                    <InfoRow label={t.studentNameHeader} value={`${booking.student.prefix} ${booking.student.firstName} ${booking.student.lastName}`} />
                                    <InfoRow label={t.seatNamesLabel} value={booking.seats.join(', ')} />
                                    <InfoRow label={t.summaryTotal} value={`${booking.total.toLocaleString()} ${t.currency}`} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleSaveAsJpeg}
                            className="w-full bg-[#aa3a3b] text-white font-bold py-3 px-6 rounded-lg transition-all hover:bg-[#8b2f30] flex items-center justify-center gap-2"
                        >
                           <span className="material-icons">image</span>
                           {t.saveAsPdfBtn}
                        </button>
                        <button 
                            onClick={onClose} 
                            className="w-full bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg transition-all hover:bg-gray-300"
                        >
                            {t.closeBtn}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuccessModal;