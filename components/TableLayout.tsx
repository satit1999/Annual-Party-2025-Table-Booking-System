import React, { useMemo } from 'react';
import { Booking, Language } from '../types';
import { translations, SEATS_PER_TABLE, TOTAL_MAIN_TABLES, TOTAL_RESERVE_TABLES } from '../constants';
import TableItem from './TableItem';

declare var Swal: any;

interface TableLayoutProps {
    selectedSeats: string[];
    setSelectedSeats: React.Dispatch<React.SetStateAction<string[]>>;
    bookings: Booking[];
    currentLanguage: Language;
    isBookingClosed: boolean;
    isAdminLoggedIn: boolean;
    editingBookingId: string | null;
}

const TableLayout: React.FC<TableLayoutProps> = ({ selectedSeats, setSelectedSeats, bookings, currentLanguage, isBookingClosed, isAdminLoggedIn, editingBookingId }) => {
    const t = translations[currentLanguage];

    const bookingDetailsMap = useMemo(() => {
        const map = new Map<string, string>();
        bookings
            .filter(b => b.id !== editingBookingId)
            .forEach(booking => {
                const bookerName = `${booking.parent.prefix} ${booking.parent.firstName} ${booking.parent.lastName}`;
                booking.seats.forEach(seatId => {
                    map.set(seatId, bookerName);
                });
            });
        return map;
    }, [bookings, editingBookingId]);

    const allTables = useMemo(() => Array.from({ length: TOTAL_MAIN_TABLES + TOTAL_RESERVE_TABLES }, (_, i) => (i + 1).toString().padStart(3, '0')), []);

    const unlockedTableIds = useMemo(() => {
        const TABLES_PER_ROW = 10;
        const isTableFullyBooked = (tableId: string): boolean => {
            let count = 0;
            for (let i = 0; i < SEATS_PER_TABLE; i++) {
                if (bookingDetailsMap.has(`${tableId}-${String.fromCharCode(65 + i)}`)) {
                    count++;
                }
            }
            return count === SEATS_PER_TABLE;
        };

        const unlocked = new Set<string>();
        let activeRowIndex = 0;
        const totalRows = Math.ceil(allTables.length / TABLES_PER_ROW);

        for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
            const rowStartTableIndex = rowIndex * TABLES_PER_ROW;
            const rowEndTableIndex = Math.min(rowStartTableIndex + TABLES_PER_ROW, allTables.length);
            const rowTableIds = allTables.slice(rowStartTableIndex, rowEndTableIndex);
            
            const isRowFullyBooked = rowTableIds.every(tableId => isTableFullyBooked(tableId));

            if (isRowFullyBooked) {
                rowTableIds.forEach(id => unlocked.add(id));
                activeRowIndex = rowIndex + 1;
            } else {
                break;
            }
        }

        if (activeRowIndex >= totalRows) {
            return unlocked;
        }

        const activeRowStartTableIndex = activeRowIndex * TABLES_PER_ROW;
        const activeRowEndTableIndex = Math.min(activeRowStartTableIndex + TABLES_PER_ROW, allTables.length);
        const activeRowTableIds = allTables.slice(activeRowStartTableIndex, activeRowEndTableIndex);

        let lastBookedInRow = -1;
        for (let i = 0; i < activeRowTableIds.length; i++) {
            if (isTableFullyBooked(activeRowTableIds[i])) {
                lastBookedInRow = i;
            } else {
                break;
            }
        }

        const unlockedInRowCount = lastBookedInRow + 2;
        for (let i = 0; i < unlockedInRowCount && i < activeRowTableIds.length; i++) {
            unlocked.add(activeRowTableIds[i]);
        }
        
        if (lastBookedInRow === -1 && activeRowTableIds.length > 0) {
            unlocked.add(activeRowTableIds[0]);
        }

        return unlocked;
    }, [bookingDetailsMap, allTables]);


    const handleSeatSelect = (seatId: string) => {
        const bookingToEdit = bookings.find(b => b.id === editingBookingId);
        const isSeatInEditingBooking = bookingToEdit?.seats.includes(seatId);

        if (bookingDetailsMap.has(seatId) && !isSeatInEditingBooking) return;

        setSelectedSeats(prev =>
            prev.includes(seatId)
                ? prev.filter(s => s !== seatId)
                : [...prev, seatId]
        );
    };
    
    const handleTableSelect = (tableId: string) => {
        const tableSeats = Array.from({ length: SEATS_PER_TABLE }, (_, i) => `${tableId}-${String.fromCharCode(65 + i)}`);
        
        const hasBookedSeats = tableSeats.some(seat => bookingDetailsMap.has(seat));
        if (hasBookedSeats) {
            Swal.fire({
                icon: 'warning',
                title: t.swalWarningTitle,
                text: t.swalTablePartiallyBooked,
                confirmButtonColor: '#aa3a3b',
            });
            return;
        }

        const areAllSelected = tableSeats.every(seat => selectedSeats.includes(seat));
        
        if (areAllSelected) {
            // Deselect all seats from this table
            setSelectedSeats(prev => prev.filter(s => !s.startsWith(`${tableId}-`)));
        } else {
            // Select all seats from this table, ensuring no duplicates
            setSelectedSeats(prev => [
                ...prev.filter(s => !s.startsWith(`${tableId}-`)), 
                ...tableSeats
            ]);
        }
    };


    const LegendItem: React.FC<{ colorClasses: string, label: string }> = ({ colorClasses, label }) => (
        <div className="flex items-center gap-2 text-sm">
            <div className={`w-5 h-5 rounded-full ${colorClasses}`}></div>
            <span>{label}</span>
        </div>
    );

    return (
        <div className="bg-white rounded-xl p-4 sm:p-8 shadow-lg relative">
            {isBookingClosed && !isAdminLoggedIn && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-xl text-center p-4">
                     <span className="material-icons text-6xl text-red-500 mb-4">event_busy</span>
                    <h2 className="text-2xl font-bold text-red-700">{t.bookingClosedTitle}</h2>
                    <p className="text-gray-600 mt-2">{t.bookingClosedMessage}</p>
                </div>
            )}
             {isBookingClosed && isAdminLoggedIn && (
                <div className="absolute top-4 left-4 bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full z-20 flex items-center gap-2">
                    <span className="material-icons text-base">vpn_key</span>
                    {t.adminOnlyText}
                </div>
            )}
            
            <div className="text-center mb-8">
                <a
                    href="https://lin.ee/relnJf7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-3 mb-6 w-full sm:w-auto bg-[#00B900] text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:bg-[#00a300] transition-all duration-300 transform hover:-translate-y-1"
                >
                    <span className="material-icons text-2xl">chat</span>
                    <span>{t.lineOABookingBtn}</span>
                </a>
                <h2 className="text-2xl font-bold text-[#aa3a3b]">{t.tableLayoutTitle}</h2>
            </div>

            <div className="flex flex-col items-center my-8">
                <div className="bg-gradient-to-r from-[#aa3a3b] to-[#8b2f30] text-white px-10 py-4 rounded-full shadow-xl mb-4 relative overflow-hidden">
                    <div className="flex items-center justify-center gap-3 text-lg font-semibold z-10 relative">
                        <span className="material-icons">theater_comedy</span>
                        <span>{t.stageLabel}</span>
                    </div>
                </div>
                <div className="text-[#aa3a3b]">
                    <span className="material-icons text-4xl animate-bounce">keyboard_arrow_down</span>
                </div>
            </div>

            <div className="mx-auto">
                <div className="grid grid-cols-10 gap-1 sm:gap-2 md:gap-3">
                    {allTables.map(tableId => (
                        <TableItem 
                            key={tableId} 
                            tableId={tableId} 
                            selectedSeats={selectedSeats} 
                            bookingDetails={bookingDetailsMap} 
                            onSeatSelect={handleSeatSelect} 
                            onTableSelect={handleTableSelect} 
                            isAdminLoggedIn={isAdminLoggedIn} 
                            currentLanguage={currentLanguage}
                            isLocked={!unlockedTableIds.has(tableId)} 
                        />
                    ))}
                </div>
            </div>

            <div className="flex justify-center flex-wrap gap-x-6 gap-y-3 mt-12 pt-8 border-t-2 border-dashed border-gray-300">
                <LegendItem colorClasses="bg-green-50 border-2 border-green-500" label={t.legendAvailable} />
                <LegendItem colorClasses="bg-[#aa3a3b] border-2 border-[#8b2f30]" label={t.legendSelected} />
                <LegendItem colorClasses="bg-green-600 border-2 border-green-700" label={t.legendPartial} />
                <LegendItem colorClasses="bg-red-500 border-2 border-red-600" label={t.legendBooked} />
            </div>
        </div>
    );
};

export default TableLayout;