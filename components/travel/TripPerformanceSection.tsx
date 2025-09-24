import React from 'react';
import { Trip } from '../../types';

interface TripPerformanceSectionProps {
    trip: Trip;
    onUpdate: (updatedTrip: Partial<Trip>) => void;
    isLocked: boolean;
}

const NumberInput: React.FC<{ label: string; name: keyof Trip; value: number | null; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; prefix?: string }> =
    ({ label, name, value, onChange, prefix }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
        <div className="relative mt-1 rounded-md shadow-sm">
             {prefix && <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><span className="text-gray-500 sm:text-sm">{prefix}</span></div>}
             <input
                type="number"
                id={name}
                name={name}
                value={value ?? ''}
                onChange={onChange}
                className={`block w-full rounded-md border-slate-300 ${prefix ? 'pl-7' : ''} focus:border-sky-500 focus:ring-sky-500 sm:text-sm`}
            />
        </div>
    </div>
);

const TextArea: React.FC<{ label: string; name: keyof Trip; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; rows?: number }> =
    ({ label, name, value, onChange, rows=2 }) => (
    <div className="sm:col-span-2">
        <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
        <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            rows={rows}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm sm:text-sm"
        />
    </div>
);


const TripPerformanceSection: React.FC<TripPerformanceSectionProps> = ({ trip, onUpdate, isLocked }) => {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumber = e.target.getAttribute('type') === 'number';
        onUpdate({ [name]: isNumber ? (value === '' ? null : Number(value)) : value });
    };

    return (
        <details className="bg-white rounded-lg shadow-sm">
             <summary className="p-4 cursor-pointer font-medium text-slate-800 hover:bg-slate-50 rounded-t-lg flex justify-between items-center">
                <span>Trip Performance</span>
                {isLocked && <span className="text-xs font-normal bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Available after the trip ends.</span>}
            </summary>
            <fieldset disabled={isLocked} className="p-6 border-t border-slate-200 disabled:opacity-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <NumberInput label="Existing Clients Met" name="existingClientsMet" value={trip.existingClientsMet} onChange={handleChange} />
                    <TextArea label="List of Existing Clients Met" name="existingClientsMetList" value={trip.existingClientsMetList} onChange={handleChange} />
                    
                    <NumberInput label="Orders Closed" name="ordersClosed" value={trip.ordersClosed} onChange={handleChange} prefix="$" />
                    <NumberInput label="Orders to be Closed (30 Days)" name="ordersToBeClosed30Days" value={trip.ordersToBeClosed30Days} onChange={handleChange} prefix="$"/>
                    
                    <div className="sm:col-span-3 border-t my-2"></div>

                    <NumberInput label="New Clients Met" name="newClientsMet" value={trip.newClientsMet} onChange={handleChange} />
                    <NumberInput label="Cold Visits Done" name="coldVisitsDone" value={trip.coldVisitsDone} onChange={handleChange} />
                    <NumberInput label="Clients Onboarded" name="clientsOnboarded" value={trip.clientsOnboarded} onChange={handleChange} />
                    
                    <NumberInput label="Interested Clients" name="interestedClients" value={trip.interestedClients} onChange={handleChange} />
                    <TextArea label="List of Interested Clients" name="interestedClientsList" value={trip.interestedClientsList} onChange={handleChange} />

                    <NumberInput label="Target Onboarding (30 Days)" name="targetOnboarding30Days" value={trip.targetOnboarding30Days} onChange={handleChange} />
                </div>
            </fieldset>
        </details>
    );
};

export default TripPerformanceSection;
