import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useFilters } from '../context/FilterContext';
import { Activity } from '../types';
import { format } from 'date-fns';
import { isWithinInterval, parseISO } from 'date-fns';
import ActivityForm from '../components/activities/ActivityForm';
import { Link } from 'react-router-dom';

const ActivityLog: React.FC = () => {
    const { data, loading, customerMap, salespersonMap, deleteActivity } = useData();
    const { dateRange, activityTypes, salespersonId, customerId, searchTerm } = useFilters();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

    const filteredActivities = useMemo(() => {
        return data.activities.filter(activity => {
            const customer = customerMap.get(activity.customerId);
            if (!customer) return false;

            const activityDate = parseISO(activity.meetingDate);
            const inDateRange = isWithinInterval(activityDate, { start: parseISO(dateRange.start), end: parseISO(dateRange.end) });
            const matchesActivityType = activityTypes.length === 0 || activityTypes.includes(activity.activityType);
            const matchesSalesperson = salespersonId === 'all' || customer.salespersonId === salespersonId;
            const matchesCustomer = customerId === 'all' || activity.customerId === customerId;
            const matchesSearch = searchTerm === '' ||
                customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (activity.notes && activity.notes.toLowerCase().includes(searchTerm.toLowerCase()));

            return inDateRange && matchesActivityType && matchesSalesperson && matchesCustomer && matchesSearch;
        });
    }, [data.activities, dateRange, activityTypes, salespersonId, customerId, searchTerm, customerMap]);

    const handleAddNew = () => {
        setEditingActivity(null);
        setIsFormOpen(true);
    };
    
    const handleEdit = (activity: Activity) => {
        setEditingActivity(activity);
        setIsFormOpen(true);
    };
    
    const handleDelete = (activityId: string) => {
        if(window.confirm('Are you sure you want to delete this activity?')) {
            deleteActivity(activityId);
        }
    };
    
    const exportToCSV = () => {
        const headers = ['Date', 'Customer', 'Salesperson', 'Activity Type', 'Outcome', 'Program', 'Location', 'Notes'];
        const rows = filteredActivities.map(act => {
             const customer = customerMap.get(act.customerId);
             const salesperson = customer ? salespersonMap.get(customer.salespersonId) : null;
             return [
                 format(parseISO(act.meetingDate), 'dd-MMM-yyyy'),
                 customer?.name || 'N/A',
                 salesperson?.name || 'N/A',
                 act.activityType,
                 act.outcome || '',
                 act.program || '',
                 act.location || '',
                 `"${(act.notes || '').replace(/"/g, '""')}"`
             ].join(',');
        });
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "activity_log.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return <div className="text-center p-8">Loading...</div>;
    }
    
    const ActivityTypeBadge: React.FC<{ type: Activity['activityType'] }> = ({ type }) => {
        const colors: Record<string, string> = {
            "In person meeting": "bg-blue-100 text-blue-800",
            "Kama Leadership calls": "bg-purple-100 text-purple-800",
            "Replenishment": "bg-green-100 text-green-800",
            "PD - Briefs received": "bg-yellow-100 text-yellow-800",
            "Store visits": "bg-indigo-100 text-indigo-800",
            "Mumbai office visit": "bg-pink-100 text-pink-800",
            "Other": "bg-slate-100 text-slate-800",
        };
        return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors[type] || colors['Other']}`}>{type}</span>
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">Sales Activity Log</h2>
                <div className="flex items-center space-x-2">
                    <button onClick={exportToCSV} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
                        Export CSV
                    </button>
                    <button onClick={handleAddNew} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
                        Add New Activity
                    </button>
                </div>
            </div>

            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Salesperson</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Activity Type</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Outcome</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Notes</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredActivities.map(activity => {
                                const customer = customerMap.get(activity.customerId);
                                const salesperson = customer ? salespersonMap.get(customer.salespersonId) : null;
                                return (
                                    <tr key={activity.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{format(parseISO(activity.meetingDate), 'dd-MMM-yyyy')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                            <Link to={`/customers/${customer?.id}`} className="hover:text-sky-600">{customer?.name || 'Unknown'}</Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{salesperson?.name || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500"><ActivityTypeBadge type={activity.activityType} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{activity.outcome || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate" title={activity.notes}>{activity.notes || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button onClick={() => handleEdit(activity)} className="text-sky-600 hover:text-sky-900">Edit</button>
                                            <button onClick={() => handleDelete(activity.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {filteredActivities.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <h3 className="text-lg font-medium text-slate-900">No activities found</h3>
                    <p className="mt-1 text-sm text-slate-500">Try adjusting your filters or adding a new activity.</p>
                </div>
            )}

            <ActivityForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                activity={editingActivity}
            />
        </div>
    );
};

export default ActivityLog;
