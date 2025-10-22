
export type Section = 'booking' | 'form' | 'admin';
export type Language = 'th' | 'en';

export interface ParentInfo {
    prefix: string;
    firstName: string;
    lastName: string;
    phone: string;
}

export interface StudentInfo {
    prefix: string;
    firstName: string;
    lastName: string;
    program: string;
    class: string;
}

export interface Booking {
    id: string;
    parent: ParentInfo;
    student: StudentInfo;
    seats: string[];
    total: number;
    status: 'pending_payment' | 'confirmed' | 'cancelled';
    timestamp: string;
    bookedBy?: string;
    paymentTimestamp?: string;
    confirmedBy?: string;
}

export interface Translations {
    [key: string]: {
        [key: string]: string;
    };
}
