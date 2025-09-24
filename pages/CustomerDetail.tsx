
import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { format, parseISO, differenceInDays } from 'date-fns';
import { formatMoney } from '../services/currencyService';

type Tab = 'Activity' | 'Orders' | 'Invoices' | 'FG Stock';

const CustomerDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data, loading, salespersonMap, customerMap, projectionMap } = useData();
    const [activeTab, setActiveTab] = useState<Tab>('Activity');
    
    const customer = useMemo(() => customerMap.get(id || ''), [id, customerMap]);
    const salesperson = useMemo(() => customer ? salespersonMap.get(customer.salespersonId) : undefined, [customer, salespersonMap]);
    const projection = useMemo(() => projectionMap.get(id || ''), [id, projectionMap]);

    const customerData = useMemo(() => {
        if (!id) return { activities: [], orders: [], invoices: [], fgStock: [] };
        return {
            activities: data.activities.filter(a => a.customerId === id),
            orders: data.orders.filter(o => o.customerId === id),
            invoices: data.invoices.filter(i => i.customerId === id),
            fgStock: data.fg.filter(f => f.customerId === id),
        };
    }, [id, data]);

    if (loading) return <div>Loading customer details...</div>;
    if (!customer) return <div>Customer not found.</div>;

    const TabButton: React.FC<{ tabName: Tab }> = ({ tabName }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tabName ? 'bg-sky-100 text-sky-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
        >
            {tabName}
        </button>
    );
    
    const renderContent = () => {
        switch (activeTab) {
            case 'Activity': return (
                <div className="flow-root">
                    <ul role="list" className="-mb-8">
                    {customerData.activities.map((activity, activityIdx) => (
                        <li key={activity.id}>
                            <div className="relative pb-8">
                                {activityIdx !== customerData.activities.length - 1 ? (
                                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                                ) : null}
                                <div className="relative flex space-x-3">
                                    <div>
                                        <span className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center ring-8 ring-white">
                                            <svg className="h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                        <div>
                                            <p className="text-sm text-slate-500">
                                                <span className="font-medium text-slate-900">{activity.activityType}</span> on {format(parseISO(activity.meetingDate), 'MMM d, yyyy')}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-600">{activity.notes}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                    </ul>
                </div>
            );
            case 'Orders': return (
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50"><tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">PO #</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Value</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Promise Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                    </tr></thead>
                    <tbody>
                    {customerData.orders.map(order => <tr key={order.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2 text-sm">{order.poNumber}</td>
                        <td className="px-4 py-2 text-sm">{formatMoney(order.value)}</td>
                        <td className="px-4 py-2 text-sm">{format(parseISO(order.promiseDate), 'dd-MMM-yyyy')}</td>
                        <td className="px-4 py-2 text-sm">{order.status}</td>
                    </tr>)}
                    </tbody>
                </table>
            );
            case 'Invoices': return (
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50"><tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Invoice #</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Due Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Outstanding</th>
                    </tr></thead>
                    <tbody>
                    {customerData.invoices.map(invoice => {
                        const outstanding = invoice.amount.amount - invoice.paidAmount.amount;
                        return (<tr key={invoice.id} className="hover:bg-slate-50">
                            <td className="px-4 py-2 text-sm">{invoice.invoiceNumber}</td>
                            <td className="px-4 py-2 text-sm">{formatMoney(invoice.amount)}</td>
                            <td className="px-4 py-2 text-sm">{format(parseISO(invoice.dueDate), 'dd-MMM-yyyy')}</td>
                            <td className={`px-4 py-2 text-sm ${outstanding > 0 ? 'text-red-600 font-semibold' : ''}`}>{formatMoney({ amount: outstanding, currency: invoice.amount.currency })}</td>
                        </tr>);
                    })}
                    </tbody>
                </table>
            );
            case 'FG Stock': return (
                 <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50"><tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">SKU</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Value</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Ready Since</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Age (Days)</th>
                    </tr></thead>
                    <tbody>
                    {customerData.fgStock.map(stock => {
                        const age = differenceInDays(new Date(), parseISO(stock.readySince));
                        return (<tr key={stock.id} className="hover:bg-slate-50">
                            <td className="px-4 py-2 text-sm">{stock.sku}</td>
                            <td className="px-4 py-2 text-sm">{formatMoney(stock.value)}</td>
                            <td className="px-4 py-2 text-sm">{format(parseISO(stock.readySince), 'dd-MMM-yyyy')}</td>
                            <td className="px-4 py-2 text-sm">{age}</td>
                        </tr>);
                    })}
                    </tbody>
                </table>
            );
            default: return null;
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="md:flex md:items-center md:justify-between">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl">{customer.name}</h2>
                        <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-2 sm:space-x-6 text-sm text-slate-500">
                            <div className="mt-2 flex items-center">Salesperson: <span className="font-medium text-slate-700 ml-1">{salesperson?.name}</span></div>
                            <div className="mt-2 flex items-center">Region: <span className="font-medium text-slate-700 ml-1">{customer.region}</span></div>
                            <div className="mt-2 flex items-center">Terms: <span className="font-medium text-slate-700 ml-1">{customer.paymentTerms}</span></div>
                            <div className="mt-2 flex items-center">Currency: <span className="font-medium text-slate-700 ml-1">{customer.currency}</span></div>
                             <div className="mt-2 flex items-center">YTD Projection: <span className="font-medium text-slate-700 ml-1">{projection ? formatMoney(projection.ytd) : 'Not Set'}</span></div>
                             <div className="mt-2 flex items-center">PY Sales (24-25): <span className="font-medium text-slate-700 ml-1">{customer.previousYearSales ? formatMoney(customer.previousYearSales) : 'N/A'}</span></div>
                        </div>
                    </div>
                    <div className="mt-4 flex md:mt-0 md:ml-4">
                        <button className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700">New Activity</button>
                    </div>
                </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm">
                <div className="border-b border-slate-200 p-2">
                    <nav className="flex space-x-2" aria-label="Tabs">
                        <TabButton tabName="Activity" />
                        <TabButton tabName="Orders" />
                        <TabButton tabName="Invoices" />
                        <TabButton tabName="FG Stock" />
                    </nav>
                </div>
                <div className="p-6">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default CustomerDetail;
