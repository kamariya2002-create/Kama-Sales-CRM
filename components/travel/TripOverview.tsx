import React, { useState, useEffect } from 'react';
import { Trip } from '../../types';
import { useData } from '../../context/DataContext';
import { format, parseISO, differenceInDays, addDays } from 'date-fns';

interface TripOverviewProps {
    trip: Trip;
    onUpdate: (updatedTrip: Partial<Trip>) => void;
}

const InputField: React.FC<{ label: string; name: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void; type?: string; children?: React.ReactNode; }> =
    ({ label, name, value, onChange, type = "text", children }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
        {type === 'select' ? (
             <select id={name} name={name} value={value} onChange={onChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm">
                 {children}
            </select>
        ) : (
            <input type={type} id={name} name={name} value={value} onChange={onChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
        )}
    </div>
);


const TripOverview: React.FC<TripOverviewProps> = ({ trip, onUpdate }) => {
    const { data: { salespeople } } = useData();
    const [daysLeft, setDaysLeft] = useState(0);

    useEffect(() => {
        const calculateDaysLeft = () => {
            const diff = differenceInDays(parseISO(trip.startDate), new Date());
            setDaysLeft(diff > 0 ? diff : 0);
        };
        calculateDaysLeft();
        const interval = setInterval(calculateDaysLeft, 1000 * 60 * 60); // Recalculate every hour
        return () => clearInterval(interval);
    }, [trip.startDate]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onUpdate({ [name]: name === 'durationDays' ? parseInt(value, 10) || 0 : value });
    };

    const endDate = addDays(parseISO(trip.startDate), trip.durationDays);

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <h2 className="text-2xl font-bold text-slate-900 mb-4 md:mb-0">Trip Details</h2>
                 <div className="text-center bg-sky-100 text-sky-800 p-3 rounded-lg">
                    <div className="text-4xl font-bold">{daysLeft}</div>
                    <div className="text-sm font-medium uppercase tracking-wider">Days to go</div>
                </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                 <InputField label="Salesperson" name="salespersonId" value={trip.salespersonId} onChange={handleChange} type="select">
                    {salespeople.map(sp => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
                </InputField>
                <InputField label="Location" name="location" value={trip.location} onChange={handleChange} />
                <InputField label="Start Date" name="startDate" type="date" value={trip.startDate} onChange={handleChange} />
                <InputField label="No. of Days" name="durationDays" type="number" value={trip.durationDays} onChange={handleChange} />
            </div>
             <div className="mt-4 text-sm text-slate-500">
                Trip duration: {format(parseISO(trip.startDate), 'dd MMM, yyyy')} - {format(endDate, 'dd MMM, yyyy')}
            </div>
        </div>
    );
};

export default TripOverview;
