
import React, { useState, useEffect } from 'react';
import { Activity } from '../../types';
import { ACTIVITY_TYPES, PROGRAMS, LOCATIONS, OUTCOMES, MERCHANDIZERS, BRIEF_PRODUCT_TYPES } from '../../constants';
import { useData } from '../../context/DataContext';
import { format, parseISO } from 'date-fns';

interface ActivityFormProps {
    isOpen: boolean;
    onClose: () => void;
    activity: Activity | null;
}

const ActivityForm: React.FC<ActivityFormProps> = ({ isOpen, onClose, activity }) => {
    const { data, addActivity, updateActivity } = useData();
    const [formData, setFormData] = useState<Partial<Activity>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (activity) {
            setFormData({
                ...activity,
                meetingDate: activity.meetingDate ? format(parseISO(activity.meetingDate), 'yyyy-MM-dd') : '',
                briefDueDate: activity.briefDueDate ? format(parseISO(activity.briefDueDate), 'yyyy-MM-dd') : '',
                expectedPODate: activity.expectedPODate ? format(parseISO(activity.expectedPODate), 'yyyy-MM-dd') : '',
            });
        } else {
            setFormData({ meetingDate: format(new Date(), 'yyyy-MM-dd'), activityType: 'In person meeting' });
        }
    }, [activity, isOpen]);

    if (!isOpen) return null;
    
    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.customerId) newErrors.customerId = "Customer is required";
        if (!formData.meetingDate) newErrors.meetingDate = "Meeting date is required";
        if (!formData.activityType) newErrors.activityType = "Activity type is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        
        const finalData = { ...formData };
        if (finalData.meetingDate) finalData.meetingDate = parseISO(finalData.meetingDate).toISOString();
        if (finalData.briefDueDate) finalData.briefDueDate = parseISO(finalData.briefDueDate).toISOString();
        if (finalData.expectedPODate) finalData.expectedPODate = parseISO(finalData.expectedPODate).toISOString();

        if (activity) {
            updateActivity(finalData as Activity);
        } else {
            addActivity(finalData as Omit<Activity, 'id' | 'createdAt'>);
        }
        // TODO: Show MUI-like snackbar on success
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const renderConditionalFields = () => {
        switch (formData.activityType) {
            case 'PD - Briefs received':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 mt-4">
                        <InputField name="metalWt" label="Metal Wt (Range)" placeholder="e.g., 0.5g - 1.0g" value={formData.metalWt || ''} onChange={handleChange} />
                        <InputField name="diamondWt" label="Diamond Wt (Range)" placeholder="e.g., 0.15cts - 0.20cts" value={formData.diamondWt || ''} onChange={handleChange} />
                        <SelectField name="briefProductType" label="Brief Product Type" value={formData.briefProductType || ''} onChange={handleChange}>
                            <option value="">Select product type</option>
                            {BRIEF_PRODUCT_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                        </SelectField>
                        <InputField name="briefDueDate" label="Brief Due Date" type="date" value={formData.briefDueDate || ''} onChange={handleChange} />
                        <SelectField name="assignedMerchandizer" label="Assign to Merchandizer" value={formData.assignedMerchandizer || ''} onChange={handleChange}>
                            <option value="">Select merchandizer</option>
                            {MERCHANDIZERS.map(m => <option key={m} value={m}>{m}</option>)}
                        </SelectField>
                    </div>
                );
            case 'Replenishment':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 mt-4">
                        <InputField name="replenishmentSkus" label="Replenishment SKUs (comma-separated)" value={formData.replenishmentSkus || ''} onChange={handleChange} />
                        <InputField name="expectedPODate" label="Expected PO Date" type="date" value={formData.expectedPODate || ''} onChange={handleChange} />
                    </div>
                );
            case 'Store visits':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 mt-4">
                        <InputField name="storeName" label="Store Name" value={formData.storeName || ''} onChange={handleChange} />
                        <InputField name="city" label="City" value={formData.city || ''} onChange={handleChange} />
                    </div>
                );
            case 'Kama Leadership calls':
                return <div className="border-t pt-4 mt-4"><InputField name="leadershipMember" label="Leadership Member" value={formData.leadershipMember || ''} onChange={handleChange} /></div>;
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-16 z-30 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all">
                <form onSubmit={handleSubmit}>
                    <div className="px-6 py-4 border-b">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">{activity ? 'Edit Activity' : 'Add New Activity'}</h3>
                    </div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <SelectField name="customerId" label="Customer Name" value={formData.customerId || ''} onChange={handleChange} error={errors.customerId} required>
                                <option value="">Select a customer</option>
                                {data.customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </SelectField>
                            <InputField name="meetingDate" label="Meeting Date" type="date" value={formData.meetingDate || ''} onChange={handleChange} error={errors.meetingDate} required />
                            <SelectField name="activityType" label="Activity Type" value={formData.activityType || ''} onChange={handleChange} error={errors.activityType} required>
                                {ACTIVITY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                            </SelectField>
                            <InputField name="attendees" label="Attendees" value={formData.attendees || ''} onChange={handleChange} />
                             <SelectField name="program" label="Program" value={formData.program || ''} onChange={handleChange}>
                                <option value="">Select a program</option>
                                {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
                            </SelectField>
                             <SelectField name="location" label="Location" value={formData.location || ''} onChange={handleChange}>
                                <option value="">Select a location</option>
                                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                            </SelectField>
                             <SelectField name="outcome" label="Outcome" value={formData.outcome || ''} onChange={handleChange}>
                                <option value="">Select an outcome</option>
                                {OUTCOMES.map(o => <option key={o} value={o}>{o}</option>)}
                            </SelectField>
                        </div>
                        {renderConditionalFields()}
                        <TextAreaField name="notes" label="Notes / Meeting Minutes" value={formData.notes || ''} onChange={handleChange} />
                    </div>
                    <div className="px-6 py-3 bg-gray-50 flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700">{activity ? 'Save Changes' : 'Create Activity'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const InputField: React.FC<any> = ({ label, name, error, required, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label} {required && '*'}</label>
        <input id={name} name={name} {...props} className={`mt-1 block w-full px-3 py-2 bg-white border ${error ? 'border-red-500' : 'border-slate-300'} rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm`} />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
);

const SelectField: React.FC<any> = ({ label, name, error, required, children, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label} {required && '*'}</label>
        <select id={name} name={name} {...props} className={`mt-1 block w-full px-3 py-2 bg-white border ${error ? 'border-red-500' : 'border-slate-300'} rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm`}>
            {children}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
);

const TextAreaField: React.FC<any> = ({ label, name, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
        <textarea id={name} name={name} {...props} rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
    </div>
);


export default ActivityForm;