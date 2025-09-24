import React from 'react';
import { Trip } from '../../types';
import { format } from 'date-fns';

interface BookingsSectionProps {
    trip: Trip;
    onUpdate: (updatedTrip: Partial<Trip>) => void;
}

const CheckboxDateField: React.FC<{
    label: string;
    name: keyof Trip;
    checked: boolean;
    date: string | null;
    onUpdate: (name: keyof Trip, value: { checked: boolean; date: string | null }) => void;
}> = ({ label, name, checked, date, onUpdate }) => {
    
    const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        onUpdate(name, {
            checked: isChecked,
            date: isChecked ? format(new Date(), 'yyyy-MM-dd') : null,
        });
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate(name, { checked, date: e.target.value });
    };

    return (
        <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 w-48 cursor-pointer">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={handleCheckChange}
                    className="h-4 w-4 rounded text-sky-600 focus:ring-sky-500"
                />
                <span className="text-sm font-medium text-slate-700">{label}</span>
            </label>
            {checked && (
                <input
                    type="date"
                    value={date || ''}
                    onChange={handleDateChange}
                    className="block w-40 px-3 py-1.5 bg-white border border-slate-300 rounded-md shadow-sm sm:text-sm"
                />
            )}
        </div>
    );
};


const BookingsSection: React.FC<BookingsSectionProps> = ({ trip, onUpdate }) => {
    
    const handleFieldUpdate = (name: keyof Trip, value: any) => {
        onUpdate({ [name]: value });
    };

    return (
        <details className="bg-white rounded-lg shadow-sm" open>
            <summary className="p-4 cursor-pointer font-medium text-slate-800 hover:bg-slate-50 rounded-t-lg">
                Bookings
            </summary>
            <div className="p-6 border-t border-slate-200 space-y-4">
                <CheckboxDateField
                    label="Visa Done"
                    name="visaDone"
                    checked={trip.visaDone.checked}
                    date={trip.visaDone.date}
                    onUpdate={handleFieldUpdate}
                />
                <CheckboxDateField
                    label="Travel Tickets Booked"
                    name="travelTicketsBooked"
                    checked={trip.travelTicketsBooked.checked}
                    date={trip.travelTicketsBooked.date}
                    onUpdate={handleFieldUpdate}
                />
                <CheckboxDateField
                    label="Hotel Tickets Booked"
                    name="hotelTicketsBooked"
                    checked={trip.hotelTicketsBooked.checked}
                    date={trip.hotelTicketsBooked.date}
                    onUpdate={handleFieldUpdate}
                />
            </div>
        </details>
    );
};

export default BookingsSection;
