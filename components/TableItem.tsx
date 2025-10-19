import React from 'react';
import { SEATS_PER_TABLE, translations } from '../constants';
import { Language } from '../types';


interface TableItemProps {
    tableId: string;
    selectedSeats: string[];
    bookingDetails: Map<string, string>;
    onSeatSelect: (seatId: string) => void;
    onTableSelect: (tableId: string) => void;
    isAdminLoggedIn: boolean;
    currentLanguage: Language;
    isLocked: boolean;
}

const getChairPosition = (index: number, totalSeats: number) => {
    const angle = (index / totalSeats) * 360 - 90; // -90 to start from top-center
    const angleRad = (angle * Math.PI) / 180;
    const radius = 39; // Percentage from container center to chair's center
    const x = 50 + radius * Math.cos(angleRad);
    const y = 50 + radius * Math.sin(angleRad);
    return { top: `${y}%`, left: `${x}%` };
};


const TableItem: React.FC<TableItemProps> = ({ tableId, selectedSeats, bookingDetails, onSeatSelect, onTableSelect, isAdminLoggedIn, currentLanguage, isLocked }) => {
    const t = translations[currentLanguage];
    const seats = Array.from({ length: SEATS_PER_TABLE }, (_, i) => `${tableId}-${String.fromCharCode(65 + i)}`);
    const numBooked = seats.filter(seatId => bookingDetails.has(seatId)).length;
    const areAllSeatsSelected = seats.every(seat => selectedSeats.includes(seat));
    const isAnySeatSelectedByAdmin = isAdminLoggedIn && seats.some(seatId => selectedSeats.includes(seatId));
    const isFullyBooked = numBooked === SEATS_PER_TABLE;

    // Allow interaction ONLY if the user is an admin and the table isn't full.
    const canInteract = isAdminLoggedIn && !isFullyBooked;

    let status = 'available';
    if (isFullyBooked) {
        status = 'booked';
    } else if (areAllSeatsSelected) { // Simplified for both admin/public
        status = 'selected';
    } else if (numBooked > 0 || seats.some(seatId => selectedSeats.includes(seatId))) { // Simplified for both admin/public
        status = 'partial';
    }


    const statusClasses = {
        available: 'border-green-400 bg-green-50 text-green-800',
        selected: 'border-[#aa3a3b] bg-[#aa3a3b] text-white',
        partial: 'border-green-700 bg-green-600 text-white',
        booked: 'border-red-400 bg-red-500 text-white cursor-not-allowed opacity-70',
        locked: 'border-gray-300 bg-gray-200 text-gray-500', // For available tables in a locked row
    };
    
    // Determine table visual status
    const isVisuallyLocked = isLocked && !isAnySeatSelectedByAdmin;
    const tableStatusKey = (isVisuallyLocked && status === 'available') ? 'locked' : status;
    const tableClasses = statusClasses[tableStatusKey as keyof typeof statusClasses];
    
    // Determine cursor based on interactability
    const tableCursorClass = canInteract ? 'cursor-pointer' : (isFullyBooked ? 'cursor-not-allowed' : 'cursor-default');
    
    return (
        <div className="relative group w-full aspect-square flex items-center justify-center">
            {/* Table */}
            <div
                onClick={() => {
                    if (canInteract) {
                        onTableSelect(tableId);
                    }
                }}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[48%] h-[48%] border-2 rounded-full flex items-center justify-center font-bold transition-all duration-300 hover:shadow-lg ${tableClasses} ${tableCursorClass} text-[0.7rem] sm:text-xs md:text-sm`}
            >
                <span>{tableId}</span>
            </div>

            {/* Chairs */}
            {seats.map((seatId, index) => {
                const isBooked = bookingDetails.has(seatId);
                const isSelected = selectedSeats.includes(seatId);
                
                let chairColorClass = 'bg-green-500'; // Default available
                if (isBooked) {
                    chairColorClass = 'bg-red-500';
                } else if (isSelected) {
                    chairColorClass = 'bg-[#8b2f30] ring-2 ring-white';
                } else if (isLocked && !isAdminLoggedIn) { // Only lock for non-admins
                    chairColorClass = 'bg-gray-400';
                }

                const chairCanInteract = canInteract && !isBooked;
                const cursorClass = chairCanInteract ? 'cursor-pointer hover:scale-125' : 'cursor-default';

                return (
                    <div
                        key={seatId}
                        style={getChairPosition(index, SEATS_PER_TABLE)}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (chairCanInteract) {
                                onSeatSelect(seatId);
                            }
                        }}
                        className={`absolute w-[22%] h-[22%] -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform group flex items-center justify-center text-white font-bold ${cursorClass} ${chairColorClass} text-[0.5rem] sm:text-[0.6rem] md:text-xs`}
                    >
                        <span>{String.fromCharCode(65 + index)}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default TableItem;