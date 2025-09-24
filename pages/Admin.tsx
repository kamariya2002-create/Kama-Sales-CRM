
import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Customer, Money } from '../types';
import { formatCurrency, formatMoney } from '../services/currencyService';
import { FISCAL_YEAR_MONTHS } from '../constants';

const Admin: React.FC = () => {
    const { data, salespersonMap, projectionMap, updateCustomerAssignment, updateCustomerProjection, updateCustomerMonthlyBookingTargets, loading } = useData();
    
    const [sortedCustomers, setSortedCustomers] = useState<Customer[]>([]);
    const [inputs, setInputs] = useState<Record<string, { ytd: string; monthly: Record<string, string> }>>({});

    useEffect(() => {
        const initialInputs: Record<string, { ytd: string; monthly: Record<string, string> }> = {};
        const sorted = [...data.customers].sort((a,b) => a.name.localeCompare(b.name));
        
        sorted.forEach(c => {
            const projection = projectionMap.get(c.id);
            initialInputs[c.id] = {
                ytd: projection?.ytd?.amount.toString() || '',
                monthly: FISCAL_YEAR_MONTHS.reduce((acc, month) => {
                    acc[month] = projection?.monthlyBookingTargets?.[month]?.amount.toString() || '';
                    return acc;
                }, {} as Record<string, string>)
            };
        });

        setInputs(initialInputs);
        setSortedCustomers(sorted);
    }, [data.customers, projectionMap]);

    const handleInputChange = (customerId: string, field: 'ytd' | string, value: string) => {
        setInputs(prev => {
            const customerInputs = { ...(prev[customerId] || { ytd: '', monthly: {} }) };
            if (field === 'ytd') {
                customerInputs.ytd = value;
            } else {
                customerInputs.monthly = { ...customerInputs.monthly, [field]: value };
            }
            return { ...prev, [customerId]: customerInputs };
        });
    };

    const handleSave = (customer: Customer) => {
        const customerInputs = inputs[customer.id];
        if (!customerInputs) return;

        // Save YTD projection
        const projectionAmount = parseFloat(customerInputs.ytd);
        if (!isNaN(projectionAmount)) {
            updateCustomerProjection(customer.id, { amount: projectionAmount, currency: customer.currency });
        }
        
        // Save monthly targets
        const newMonthlyTargets: Record<string, Money> = {};
        let allValid = true;
        for(const month of FISCAL_YEAR_MONTHS) {
            const amountStr = customerInputs.monthly[month];
            if (amountStr) {
                const amount = parseFloat(amountStr);
                 if (!isNaN(amount)) {
                    newMonthlyTargets[month] = { amount, currency: customer.currency };
                } else {
                    allValid = false;
                    break; 
                }
            }
        }
        if(allValid){
            updateCustomerMonthlyBookingTargets(customer.id, newMonthlyTargets);
        }
        // TODO: Add snackbar for feedback
    };
    
    const handleAssignmentChange = (customerId: string, newSalespersonId: string) => {
        updateCustomerAssignment(customerId, newSalespersonId);
    };

    if (loading) {
        return <p>Loading admin data...</p>;
    }
    
    const NumberInput: React.FC<{currency: Customer['currency'], value: string, onChange: (val: string) => void}> = ({currency, value, onChange}) => (
         <div className="relative rounded-md shadow-sm w-32">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-sm">{formatCurrency(0, currency).replace(/[\d,.]/g, '')}</span>
            </div>
            <input 
                type="number"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className="block w-full rounded-md border-slate-300 pl-7 pr-2 focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                placeholder="0"
            />
        </div>
    );

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-900">Admin Panel</h2>
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="p-5 border-b">
                    <h3 className="text-lg font-medium text-slate-900">Customer Assignments & Projections</h3>
                    <p className="text-sm text-slate-500 mt-1">Set annual revenue projections and monthly order booking targets for each customer.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="sticky left-0 bg-slate-50 px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">PY Sales (24-25)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned Salesperson</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">YTD Projection</th>
                                {FISCAL_YEAR_MONTHS.map(month => (
                                    <th key={month} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{month}-25</th>
                                ))}
                                <th className="sticky right-0 bg-slate-50 px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {sortedCustomers.map(customer => (
                                <tr key={customer.id} className="hover:bg-slate-50">
                                    <td className="sticky left-0 bg-white hover:bg-slate-50 px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{customer.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatMoney(customer.previousYearSales)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        <select 
                                            value={customer.salespersonId}
                                            onChange={(e) => handleAssignmentChange(customer.id, e.target.value)}
                                            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                                        >
                                            {data.salespeople.map(sp => (
                                                <option key={sp.id} value={sp.id}>{sp.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                       <NumberInput 
                                            currency={customer.currency} 
                                            value={inputs[customer.id]?.ytd || ''} 
                                            onChange={(val) => handleInputChange(customer.id, 'ytd', val)} 
                                        />
                                    </td>
                                    {FISCAL_YEAR_MONTHS.map(month => (
                                        <td key={month} className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            <NumberInput 
                                                currency={customer.currency} 
                                                value={inputs[customer.id]?.monthly[month] || ''} 
                                                onChange={(val) => handleInputChange(customer.id, month, val)} 
                                            />
                                        </td>
                                    ))}
                                    <td className="sticky right-0 bg-white hover:bg-slate-50 px-6 py-4 whitespace-nowrap text-sm">
                                        <button 
                                            onClick={() => handleSave(customer)}
                                            className="px-3 py-1 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                                        >
                                            Save
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Admin;
