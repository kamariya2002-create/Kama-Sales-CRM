import React from 'react';
import { Trip } from '../../types';

interface TripReadinessSectionProps {
    trip: Trip;
    onUpdate: (updatedTrip: Partial<Trip>) => void;
    isLocked: boolean;
    daysUntilTrip: number;
}

const CheckboxField: React.FC<{ label: string, name: keyof Trip, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> =
({ label, name, checked, onChange }) => (
    <label className="flex items-center space-x-2 cursor-pointer">
        <input type="checkbox" name={name} checked={checked} onChange={onChange} className="h-4 w-4 rounded text-sky-600 focus:ring-sky-500" />
        <span className="text-sm font-medium text-slate-700">{label}</span>
    </label>
);

const TripReadinessSection: React.FC<TripReadinessSectionProps> = ({ trip, onUpdate, isLocked, daysUntilTrip }) => {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
             const isChecked = (e.target as HTMLInputElement).checked;
            onUpdate({ [name]: isChecked });
        } else {
             onUpdate({ [name]: value });
        }
    };
    
    const handleLineIdentifiedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isChecked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : trip.lineIdentified.checked;
        const description = type === 'textarea' ? value : trip.lineIdentified.description;
        onUpdate({ lineIdentified: { checked: isChecked, description } });
    };

    const handleEquipmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        onUpdate({ 
            equipmentCollected: {
                ...trip.equipmentCollected,
                [name]: checked
            }
        });
    };

    return (
        <details className="bg-white rounded-lg shadow-sm">
            <summary className="p-4 cursor-pointer font-medium text-slate-800 hover:bg-slate-50 rounded-t-lg flex justify-between items-center">
                <span>Trip Readiness</span>
                 {isLocked && <span className="text-xs font-normal bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Available {daysUntilTrip - 3} days from now.</span>}
            </summary>
            <fieldset disabled={isLocked} className="p-6 border-t border-slate-200 space-y-4 disabled:opacity-50">
                <div className="flex items-start space-x-2">
                     <CheckboxField label="Line Identified" name="lineIdentified" checked={trip.lineIdentified.checked} onChange={handleLineIdentifiedChange} />
                     <textarea
                        name="description"
                        value={trip.lineIdentified.description}
                        onChange={handleLineIdentifiedChange}
                        placeholder="Description of the identified line..."
                        rows={2}
                        className="flex-grow mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm sm:text-sm disabled:bg-slate-50"
                        disabled={!trip.lineIdentified.checked}
                    />
                </div>
                 <CheckboxField label="Catalogs Printed" name="catalogsPrinted" checked={trip.catalogsPrinted} onChange={handleChange} />
                 <CheckboxField label="Sales Summary Folder Printed" name="salesSummaryPrinted" checked={trip.salesSummaryPrinted} onChange={handleChange} />
                 <CheckboxField label="Commercials Printed" name="commercialsPrinted" checked={trip.commercialsPrinted} onChange={handleChange} />
                 <CheckboxField label="Diamond Samples Collected" name="diamondSamplesCollected" checked={trip.diamondSamplesCollected} onChange={handleChange} />
                
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Equipment Collected</label>
                    <div className="flex items-center space-x-4">
                        <CheckboxField label="Laptop" name="laptop" checked={trip.equipmentCollected.laptop} onChange={handleEquipmentChange} />
                        <CheckboxField label="Scanner" name="scanner" checked={trip.equipmentCollected.scanner} onChange={handleEquipmentChange} />
                        <CheckboxField label="Diamond Loupe" name="diamondLoupe" checked={trip.equipmentCollected.diamondLoupe} onChange={handleEquipmentChange} />
                    </div>
                </div>
            </fieldset>
        </details>
    );
};

export default TripReadinessSection;
