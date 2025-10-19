import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import NavTabs from './components/NavTabs';
import BookingSection from './components/BookingSection';
import FormSection from './components/FormSection';
import AdminSection from './components/AdminSection';
import AdminLoginModal from './components/AdminLoginModal';
import SuccessModal from './components/SuccessModal';
import CancelBookingModal from './components/CancelBookingModal';
import { Booking, Section, Language } from './types';
import { BOOKING_DEADLINE, calculateTotalPrice, translations } from './constants';

declare var Swal: any;

// !!! สำคัญ !!!
// 1. เปิดไฟล์ `INSTRUCTIONS_TH.md` เพื่อดูวิธีการเชื่อมต่อกับ Google Sheets ทีละขั้นตอน
// 2. คัดลอกโค้ดทั้งหมดจากไฟล์ `Code.gs` ไปยังโปรเจกต์ Google Apps Script ของคุณ
// 3. ทำตามคำแนะนำเพื่อ Deploy สคริปต์และนำ Web App URL ที่ได้มาไปวางแทนที่ค่า URL ด้านล่างนี้
const GOOGLE_SHEET_API_URL = "https://script.google.com/macros/s/AKfycbz665mKomfye7BLn-kt-t7Kd2AJKxYtmJgeoLP9s_1PrqDEteWXT2GLsuna3CnnkZ5zFw/exec";


const App: React.FC = () => {
    const [currentSection, setCurrentSection] = useState<Section>('booking');
    const [currentLanguage, setCurrentLanguage] = useState<Language>('th');
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
    const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
    const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
    const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);
    const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
    const [isSheetLoading, setIsSheetLoading] = useState<boolean>(true);

    const isBookingClosed = new Date() > BOOKING_DEADLINE;

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await fetch(`${GOOGLE_SHEET_API_URL}?action=READ`);
                if (!response.ok) throw new Error("Failed to fetch bookings from Google Sheet. Server responded with " + response.status);
                const result = await response.json();
                
                if (result.status === 'success') {
                    setBookings(result.data);
                    localStorage.setItem('tableBookings', JSON.stringify(result.data));
                } else {
                    throw new Error(result.message || "An unknown error occurred while fetching data.");
                }
            } catch (error) {
                console.error("Error fetching bookings:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Could Not Load Data',
                    text: 'Failed to connect to the booking database. Using local data as a fallback.',
                    confirmButtonColor: '#aa3a3b',
                });
                const savedBookings = localStorage.getItem('tableBookings');
                if (savedBookings) setBookings(JSON.parse(savedBookings));
                else setBookings([]);
            } finally {
                setIsSheetLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const handleBookingConfirm = useCallback(async (newBookingData: Omit<Booking, 'id' | 'timestamp' | 'status' | 'bookedBy'>) => {
        const newBookingId = `BK${(bookings.length + 1).toString().padStart(4, '0')}`;
        const newBooking: Booking = {
            id: newBookingId,
            ...newBookingData,
            status: 'confirmed',
            timestamp: new Date().toISOString(),
            bookedBy: isAdminLoggedIn ? loggedInUser ?? undefined : undefined,
        };

        Swal.fire({
            title: 'Saving Booking...',
            text: 'Please wait while we connect to the database.',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });
        try {
            const response = await fetch(GOOGLE_SHEET_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'CREATE', payload: newBooking })
            });
            const result = await response.json();
            if (!response.ok || result.status !== 'success') {
                throw new Error(result.message || 'API returned an error');
            }
            Swal.close();
        } catch (error) {
             console.error('Failed to save to Google Sheet:', error);
             Swal.fire({
                icon: 'warning', title: 'Database Error',
                text: 'Could not save the booking to the database. It is saved locally for now.',
                confirmButtonColor: '#aa3a3b',
             });
        }

        const updatedBookings = [...bookings, newBooking];
        setBookings(updatedBookings);
        localStorage.setItem('tableBookings', JSON.stringify(updatedBookings));
        setSelectedSeats([]);
        setCompletedBooking(newBooking);
        return true;
    }, [bookings, isAdminLoggedIn, loggedInUser]);

    const handleConfirmCancellation = async (bookingId: string, seatsToCancel: string[]) => {
        let bookingToUpdate: Booking | undefined;
        const updatedBookings = bookings.map(b => {
            if (b.id === bookingId) {
                const remainingSeats = b.seats.filter(s => !seatsToCancel.includes(s));
                const adminName = isAdminLoggedIn ? loggedInUser ?? undefined : b.bookedBy;

                if (remainingSeats.length === 0) {
                    bookingToUpdate = { ...b, seats: [], total: 0, status: 'cancelled' as 'cancelled', bookedBy: adminName };
                } else {
                    bookingToUpdate = { ...b, seats: remainingSeats.sort(), total: calculateTotalPrice(remainingSeats), bookedBy: adminName };
                }
                return bookingToUpdate;
            }
            return b;
        });
        
        if (bookingToUpdate) {
             try {
                const response = await fetch(GOOGLE_SHEET_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({ action: 'UPDATE', payload: bookingToUpdate })
                });
                const result = await response.json();
                if (!response.ok || result.status !== 'success') {
                    console.error('Failed to update in Google Sheet:', result.message || 'API returned an error');
                }
            } catch (error) {
                 console.error('Failed to update in Google Sheet:', error);
            }
        }

        setBookings(updatedBookings);
        localStorage.setItem('tableBookings', JSON.stringify(updatedBookings));
        setCancellingBooking(null);
        Swal.fire({
            icon: 'info',
            title: translations[currentLanguage].swalCancelSuccessTitle,
            text: translations[currentLanguage].swalCancelSuccessText,
            confirmButtonColor: '#aa3a3b',
        });
    };

    const handleLogin = (success: boolean, displayName?: string) => {
        if (success && displayName) {
            setIsAdminLoggedIn(true);
            setLoggedInUser(displayName);
            setIsLoginModalOpen(false);
            setCurrentSection('admin');
        } else {
            Swal.fire({
                icon: 'error',
                title: translations[currentLanguage].swalErrorTitle,
                text: translations[currentLanguage].swalInvalidCredentials,
                confirmButtonColor: '#aa3a3b',
            });
        }
    };

    const handleLogout = () => {
        setIsAdminLoggedIn(false);
        setLoggedInUser(null);
        setCurrentSection('booking');
    };

    const handleSectionChange = (section: Section) => {
        if (section === 'form' && selectedSeats.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: translations[currentLanguage].swalWarningTitle,
                text: translations[currentLanguage].swalSelectSeatsFirst,
                confirmButtonColor: '#aa3a3b',
            });
            return;
        }
        setCurrentSection(section);
    };

    const handleEditStart = (bookingId: string) => {
        const bookingToEdit = bookings.find(b => b.id === bookingId);
        if (bookingToEdit) {
            setEditingBookingId(bookingId);
            setSelectedSeats(bookingToEdit.seats);
            setCurrentSection('booking');
        }
    };

    const handleUpdateBooking = useCallback(async () => {
        if (!editingBookingId) return;

        let updatedBooking: Booking | null = null;
        const updatedBookings = bookings.map(b => {
            if (b.id === editingBookingId) {
                updatedBooking = {
                    ...b,
                    seats: selectedSeats.sort(),
                    total: calculateTotalPrice(selectedSeats),
                    status: selectedSeats.length > 0 ? 'confirmed' : 'cancelled',
                    bookedBy: isAdminLoggedIn ? loggedInUser ?? undefined : b.bookedBy,
                };
                return updatedBooking;
            }
            return b;
        });

        if (updatedBooking) {
            Swal.fire({
                title: 'Updating Booking...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });
            try {
                const response = await fetch(GOOGLE_SHEET_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({ action: 'UPDATE', payload: updatedBooking })
                });
                const result = await response.json();
                if (!response.ok || result.status !== 'success') {
                    throw new Error(result.message || 'API returned an error');
                }
                Swal.close();
            } catch (error) {
                 console.error('Failed to update in Google Sheet:', error);
                 Swal.fire({
                    icon: 'warning', title: 'Database Error',
                    text: 'Could not update the booking in the database. Changes are saved locally for now.',
                    confirmButtonColor: '#aa3a3b',
                 });
            }
        }

        setBookings(updatedBookings);
        localStorage.setItem('tableBookings', JSON.stringify(updatedBookings));
        
        if(updatedBooking) {
            setCompletedBooking(updatedBooking);
        }
    }, [bookings, editingBookingId, selectedSeats, isAdminLoggedIn, loggedInUser]);

    const handleCancelEdit = () => {
        setEditingBookingId(null);
        setSelectedSeats([]);
        setCurrentSection('admin');
    };

    const handleCloseSuccessModal = () => {
        setCompletedBooking(null);
        if (editingBookingId) {
            setEditingBookingId(null);
            setSelectedSeats([]);
            setCurrentSection('admin');
        } else {
            setCurrentSection('booking');
        }
    };

    if (isSheetLoading) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#aa3a3b]/30 border-t-[#aa3a3b] rounded-full animate-spin"></div>
                    <p className="text-lg text-gray-600">Connecting to database...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen text-gray-800">
            <Header
                currentLanguage={currentLanguage}
                onLanguageToggle={() => setCurrentLanguage(prev => prev === 'th' ? 'en' : 'th')}
                onAdminClick={() => setIsLoginModalOpen(true)}
                isAdminLoggedIn={isAdminLoggedIn}
                loggedInUser={loggedInUser}
                onLogout={handleLogout}
            />
            
            {isAdminLoggedIn && (
                <NavTabs
                    currentSection={currentSection}
                    onSectionChange={handleSectionChange}
                    isAdminLoggedIn={isAdminLoggedIn}
                    currentLanguage={currentLanguage}
                />
            )}

            <main className="py-8">
                <div className="container mx-auto px-4 md:px-5">
                    {currentSection === 'booking' && (
                        <BookingSection 
                            selectedSeats={selectedSeats}
                            setSelectedSeats={setSelectedSeats}
                            bookings={bookings}
                            onProceed={() => handleSectionChange('form')}
                            currentLanguage={currentLanguage}
                            isBookingClosed={isBookingClosed}
                            isAdminLoggedIn={isAdminLoggedIn}
                            editingBookingId={editingBookingId}
                            onUpdateBooking={handleUpdateBooking}
                            onCancelEdit={handleCancelEdit}
                        />
                    )}
                    {currentSection === 'form' && (
                        <FormSection
                            selectedSeats={selectedSeats}
                            onConfirmBooking={handleBookingConfirm}
                            onBack={() => setCurrentSection('booking')}
                            currentLanguage={currentLanguage}
                            isBookingClosed={isBookingClosed}
                            isAdminLoggedIn={isAdminLoggedIn}
                        />
                    )}
                    {currentSection === 'admin' && isAdminLoggedIn && (
                        <AdminSection 
                            bookings={bookings}
                            currentLanguage={currentLanguage}
                            onEditStart={handleEditStart}
                            onCancelStart={setCancellingBooking}
                        />
                    )}
                </div>
            </main>
            
            <AdminLoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onLogin={handleLogin}
                currentLanguage={currentLanguage}
            />

            <SuccessModal
                booking={completedBooking}
                onClose={handleCloseSuccessModal}
                currentLanguage={currentLanguage}
            />

            <CancelBookingModal
                isOpen={!!cancellingBooking}
                onClose={() => setCancellingBooking(null)}
                onConfirm={handleConfirmCancellation}
                booking={cancellingBooking}
                currentLanguage={currentLanguage}
            />
        </div>
    );
};

export default App;