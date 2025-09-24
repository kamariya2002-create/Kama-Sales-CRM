import React from 'react';
import { Trip } from '../../types';

interface TripPlanningSectionProps {
    trip: Trip;
    onUpdate: (updatedTrip: Partial<Trip>) => void;
    isLocked: boolean;
    daysUntilTrip: number;
}

const NumberInput: React.FC<{ label: string; name: keyof Trip; value: number | null; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string, prefix?: string }> = 
({ label, name, value, onChange, placeholder, prefix }) => (
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
                placeholder={placeholder}
                className={`block w-full rounded-md border-slate-300 ${prefix ? 'pl-7' : ''} focus:border-sky-500 focus:ring-sky-500 sm:text-sm`}
            />
        </div>
    </div>
);

const SectionBlock: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="border-t border-slate-200 mt-6 pt-6">
        <h4 className="text-md font-semibold text-slate-800">{title}</h4>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {children}
        </div>
    </div>
);

const TripPlanningSection: React.FC<TripPlanningSectionProps> = ({ trip, onUpdate, isLocked, daysUntilTrip }) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        onUpdate({ [name]: value === '' ? null : Number(value) });
    };

    const totalAppointments = (trip.existingClientAppointmentsSetup || 0) + (trip.newClientAppointmentsSetup || 0);
    const totalRevenueTarget = (trip.existingClientRevenueTarget || 0) + (trip.newClientRevenueTarget || 0);

    const getLockMessage = () => {
        if (daysUntilTrip > 60) return `Planning can begin ${daysUntilTrip - 60} days from now.`;
        if (daysUntilTrip < 7) return `Planning period has ended.`;
        return '';
    };

    return (
        <details className="bg-white rounded-lg shadow-sm" open>
             <summary className="p-4 cursor-pointer font-medium text-slate-800 hover:bg-slate-50 rounded-t-lg flex justify-between items-center">
                <span>Trip Planning</span>
                {isLocked && <span className="text-xs font-normal bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">{getLockMessage()}</span>}
            </summary>
            <fieldset disabled={isLocked} className="p-6 border-t border-slate-200 disabled:opacity-50">
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <NumberInput label="Total Budget" name="budget" value={trip.budget} onChange={handleChange} prefix="$"/>
                    <NumberInput label="Actual Cost" name="actualCost" value={trip.actualCost} onChange={handleChange} prefix="$" />
                 </div>
                 
                 <SectionBlock title="Existing Clients">
                     <NumberInput label="Appointment Target" name="existingClientAppointmentTarget" value={trip.existingClientAppointmentTarget} onChange={handleChange} />
                     <NumberInput label="Appointments Setup" name="existingClientAppointmentsSetup" value={trip.existingClientAppointmentsSetup} onChange={handleChange} />
                     <NumberInput label="Revenue Target" name="existingClientRevenueTarget" value={trip.existingClientRevenueTarget} onChange={handleChange} prefix="$" />
                 </SectionBlock>

                 <SectionBlock title="New Clients">
                     <NumberInput label="Appointment Target" name="newClientAppointmentTarget" value={trip.newClientAppointmentTarget} onChange={handleChange} />
                     <NumberInput label="Appointments Setup" name="newClientAppointmentsSetup" value={trip.newClientAppointmentsSetup} onChange={handleChange} />
                     <NumberInput label="Onboarding Target" name="newClientOnboardingTarget" value={trip.newClientOnboardingTarget} onChange={handleChange} />
                     <NumberInput label="Revenue Target" name="newClientRevenueTarget" value={trip.newClientRevenueTarget} onChange={handleChange} prefix="$" />
                 </SectionBlock>

                 <div className="border-t border-slate-200 mt-6 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <NumberInput label="Cold Visits Planned" name="coldVisitsPlanned" value={trip.coldVisitsPlanned} onChange={handleChange} />
                    <div className="p-4 bg-slate-50 rounded-md text-center">
                        <p className="text-sm font-medium text-slate-500">Total Appointments Set</p>
                        <p className="text-2xl font-bold text-slate-800 mt-1">{totalAppointments}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-md text-center">
                        <p className="text-sm font-medium text-slate-500">Total Revenue Target</p>
                        <p className="text-2xl font-bold text-slate-800 mt-1">${totalRevenueTarget.toLocaleString()}</p>
                    </div>
                 </div>

            </fieldset>
        </details>
    );
};

export default TripPlanningSection;
