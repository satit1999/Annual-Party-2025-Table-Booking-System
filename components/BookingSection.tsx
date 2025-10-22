import React from 'react';
import { Booking, Language } from '../types';
import TableLayout from './TableLayout';
import BookingSummary from './BookingSummary';

interface BookingSectionProps {
    selectedSeats: string[];
    setSelectedSeats: React.Dispatch<React.SetStateAction<string[]>>;
    bookings: Booking[];
    onProceed: () => void;
    currentLanguage: Language;
    isBookingClosed: boolean;
    isAdminLoggedIn: boolean;
    editingBookingId: string | null;
    onUpdateBooking: () => void;
    onCancelEdit: () => void;
}

const BookingSection: React.FC<BookingSectionProps> = (props) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
            <TableLayout {...props} />
            <BookingSummary {...props} />
        </div>
    );
};

export default BookingSection;