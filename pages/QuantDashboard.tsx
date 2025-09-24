
import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { useFilters } from '../context/FilterContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// FIX: The linter reported that 'startOfMonth' was not an exported member of 'date-fns'. Changed to a sub-path import to resolve potential module resolution issues.
import { format, getDaysInMonth, isAfter, isBefore, parseISO, differenceInDays, getMonth, getYear, differenceInMonths } from 'date-fns';
import startOfMonth from 'date-fns/startOfMonth';
import { convertToINR, formatCurrency, formatMoney } from '../services/currencyService';
import { Link } from 'react-router-dom';

const getFiscalYearDetails = (date: Date) => {
    const year = getYear(date);
    const month = getMonth(date); // 0-11
    
    // Fiscal year starts April 1st.
    // If current month is Jan, Feb, Mar (0, 1, 2), FY started last calendar year.
    const fiscalYearStartYear = month < 3 ? year - 1 : year;
    
    const fiscalYearStart = new Date(fiscalYearStartYear, 3, 1);
    const fiscalYearEnd = new Date(fiscalYearStartYear + 1, 2, 31);
    
    const h1Start = fiscalYearStart;
    const h1End = new Date(fiscalYearStartYear, 8, 30); // Sep 30
    
    const h2Start = new Date(fiscalYearStartYear, 9, 1); // Oct 1
    const h2End = fiscalYearEnd;

    const isInH1 = date >= h1Start && date <= h1End;

    return { fiscalYearStart, fiscalYearEnd, h1Start, h1End, h2Start, h2End, isInH1 };
};

const KpiCard: React.FC<{ title: string; value: string; tooltip?: string, details?: string, detailsColor?: string }> = ({ title, value, tooltip, details, detailsColor = 'text-slate-900' }) => (
    <div className="bg-white p-5 rounded-lg shadow-sm flex flex-col justify-between min-h-[120px]">
        <div>
            <div className="flex items-center">
                <h3 className="text-sm font-medium text-slate-500 uppercase">{title}</h3>
                {tooltip && (
                    <div className="ml-1.5 group relative">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <div className="absolute bottom-full mb-2 w-64 bg-slate-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                            {tooltip}
                        </div>
                    </div>
                )}
            </div>
            <p className={`text-3xl font-bold mt-1`}>{value}</p>
        </div>
        {details && <p className={`text-sm font-medium mt-1 ${detailsColor}`}>{details}</p>}
    </div>
);

const QuantDashboard: React.FC = () => {
    const { data, loading, customerMap, salespersonMap, projectionMap } = useData();
    const { salespersonId } = useFilters();
    const [view, setView] = useState<'mtd' | 'ytd'>('mtd');

    const today = new Date();
    
    const metrics = useMemo(() => {
        const { fiscalYearStart, fiscalYearEnd, h1Start, h1End, h2Start, h2End, isInH1 } = getFiscalYearDetails(today);

        const filteredCustomers = salespersonId === 'all'
            ? [...customerMap.values()]
            : [...customerMap.values()].filter(c => c.salespersonId === salespersonId);
        
        const customerIds = new Set(filteredCustomers.map(c => c.id));

        const ytdProjection = filteredCustomers.reduce((sum, customer) => {
            const projection = projectionMap.get(customer.id);
            return sum + (projection ? convertToINR(projection.ytd) : 0);
        }, 0);

        const relevantInvoices = data.invoices.filter(i => customerIds.has(i.customerId));
        const relevantOrders = data.orders.filter(o => customerIds.has(o.customerId));
        
        const achievedYtd = relevantInvoices
            .filter(inv => isAfter(parseISO(inv.issueDate), fiscalYearStart) && isBefore(parseISO(inv.issueDate), fiscalYearEnd))
            .reduce((sum, inv) => sum + convertToINR(inv.amount), 0);

        // Prorated target calculation
        const h1Target = ytdProjection * 0.6;
        const h2Target = ytdProjection * 0.4;
        const daysInH1 = differenceInDays(h1End, h1Start) + 1;
        const daysInH2 = differenceInDays(h2End, h2Start) + 1;
        let shouldBeAchievedYTD = 0;
        if (today >= h1Start) {
            if (isInH1) {
                const daysPassedInH1 = differenceInDays(today, h1Start) + 1;
                shouldBeAchievedYTD = (daysPassedInH1 / daysInH1) * h1Target;
            } else { // in H2 or after
                const daysPassedInH2 = today > h2End ? daysInH2 : differenceInDays(today, h2Start) + 1;
                shouldBeAchievedYTD = h1Target + (daysPassedInH2 / daysInH2) * h2Target;
            }
        }
        const achievedPercent = shouldBeAchievedYTD > 0 ? (achievedYtd / shouldBeAchievedYTD) * 100 : 0;

        // MTD Calculations
        const currentMonthType = getMonth(today) >= 3 && getMonth(today) <= 8 ? 'h1' : 'h2';
        const mtdProjection = currentMonthType === 'h1' ? (ytdProjection * 0.6) / 6 : (ytdProjection * 0.4) / 6;

        const achievedMtd = relevantInvoices
            .filter(inv => isAfter(parseISO(inv.issueDate), startOfMonth(today)))
            .reduce((sum, inv) => sum + convertToINR(inv.amount), 0);

        // Order Booking MTD
        const currentMonthShort = format(today, 'MMM');
        const totalMonthlyBookingTarget = filteredCustomers.reduce((sum, customer) => {
            const projection = projectionMap.get(customer.id);
            const monthTarget = projection?.monthlyBookingTargets[currentMonthShort];
            return sum + (monthTarget ? convertToINR(monthTarget) : 0);
        }, 0);

        const mtdBookedValue = relevantOrders
            .filter(order => isAfter(parseISO(order.createdAt), startOfMonth(today)))
            .reduce((sum, order) => sum + convertToINR(order.value), 0);
        
        const bookingPercent = totalMonthlyBookingTarget > 0 ? (mtdBookedValue / totalMonthlyBookingTarget) * 100 : 0;
        
        // Pending Quotations Logic
        const quoteSentActivities = data.activities.filter(a => customerIds.has(a.customerId) && a.outcome === 'Quote sent');
        const pendingQuotesCount = quoteSentActivities.filter(activity => {
            const subsequentOrderExists = relevantOrders.some(order => 
                order.customerId === activity.customerId && isAfter(parseISO(order.createdAt), parseISO(activity.createdAt))
            );
            return !subsequentOrderExists;
        }).length;

        // Other KPIs
        const openOrders = relevantOrders.filter(o => o.status === 'Open' || o.status === 'In Production');
        const openOrdersValue = openOrders.reduce((sum, o) => sum + convertToINR(o.value), 0);
        
        const weeksRemaining = Math.ceil((getDaysInMonth(today) - today.getDate()) / 7);
        const requiredRunRateMtd = weeksRemaining > 0 ? (mtdProjection - achievedMtd) / weeksRemaining : 0;
        
        const monthsRemaining = differenceInMonths(fiscalYearEnd, today);
        const requiredRunRateYtd = monthsRemaining > 0 ? (ytdProjection - achievedYtd) / monthsRemaining : 0;

        const overdueOrders = openOrders.filter(o => isBefore(parseISO(o.promiseDate), today));
        const overdueOrdersValue = overdueOrders.reduce((sum, o) => sum + convertToINR(o.value), 0);

        let totalReceivables = 0;
        relevantInvoices.forEach(inv => {
            const outstanding = convertToINR(inv.amount) - convertToINR(inv.paidAmount);
            if (outstanding > 0) totalReceivables += outstanding;
        });

        const shortfallMtd = mtdProjection - (achievedMtd + openOrdersValue);
        const shortfallYtd = ytdProjection - (achievedYtd + openOrdersValue);

        return {
            projectionMtd: mtdProjection, achievedMtd, projectionYtd: ytdProjection, achievedYtd, achievedPercent,
            openOrders, openOrdersValue, requiredRunRateMtd, requiredRunRateYtd,
            overdueOrders, overdueOrdersValue, pendingQuotesCount, totalReceivables,
            totalMonthlyBookingTarget, mtdBookedValue, bookingPercent,
            shortfallMtd, shortfallYtd,
        };
    }, [data, salespersonId, today, customerMap, projectionMap]);

    const chartData = useMemo(() => {
        return data.salespeople.map(sp => {
            const spCustomers = data.customers.filter(c => c.salespersonId === sp.id);
            const projection = spCustomers.reduce((sum, customer) => {
                const proj = projectionMap.get(customer.id);
                return sum + (proj ? convertToINR(proj.ytd) : 0);
            }, 0);

            const achieved = data.invoices
                .filter(inv => inv.salespersonId === sp.id && isAfter(parseISO(inv.issueDate), view === 'mtd' ? startOfMonth(today) : getFiscalYearDetails(today).fiscalYearStart))
                .reduce((sum, inv) => sum + convertToINR(inv.amount), 0);

            const mtdProjectionForSp = (getMonth(today) >= 3 && getMonth(today) <= 8) ? (projection * 0.6) / 6 : (projection * 0.4) / 6;

            return {
                name: sp.name.split(' ')[0],
                projection: (view === 'mtd' ? mtdProjectionForSp : projection) / 100000, // in Lakhs
                achieved: achieved / 100000,
            }
        });
    }, [data, today, projectionMap, view]);
    
    if (loading) return <div>Loading...</div>;
    
    const ToggleButton: React.FC<{ value: 'mtd' | 'ytd', children: React.ReactNode }> = ({ value, children }) => (
        <button onClick={() => setView(value)} className={`px-4 py-1.5 text-sm font-medium rounded-md ${view === value ? 'bg-sky-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}>{children}</button>
    );

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">Quantitative Dashboard</h2>
                <div className="flex items-center space-x-1 bg-slate-200 p-1 rounded-lg">
                    <ToggleButton value="mtd">Monthly</ToggleButton>
                    <ToggleButton value="ytd">Yearly</ToggleButton>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title={`Projection (${view.toUpperCase()})`} value={formatCurrency(view === 'mtd' ? metrics.projectionMtd : metrics.projectionYtd)} />
                <KpiCard 
                    title={`Achieved (${view.toUpperCase()})`} 
                    value={formatCurrency(view === 'mtd' ? metrics.achievedMtd : metrics.achievedYtd)} 
                    details={`${metrics.achievedPercent.toFixed(1)}% of prorated target`}
                    detailsColor={metrics.achievedPercent >= 100 ? 'text-green-600' : 'text-red-600'}
                />
                 <KpiCard 
                    title="Order Booking (MTD)"
                    value={formatCurrency(metrics.mtdBookedValue)}
                    details={`${metrics.bookingPercent.toFixed(1)}% of ${formatCurrency(metrics.totalMonthlyBookingTarget)} target`}
                    detailsColor={metrics.bookingPercent >= 100 ? 'text-green-600' : 'text-red-600'}
                    tooltip="Value of new orders created this month vs monthly target."
                />
                <KpiCard 
                    title={view === 'mtd' ? "Req. Run Rate / Week" : "Req. Run Rate / Month"}
                    value={formatCurrency(view === 'mtd' ? metrics.requiredRunRateMtd : metrics.requiredRunRateYtd)} 
                    tooltip={view === 'mtd' ? "(Projection – Achieved MTD) ÷ Weeks remaining" : "(Projection – Achieved YTD) ÷ Months remaining"}
                />
                 <KpiCard 
                    title={`Shortfall (${view.toUpperCase()})`} 
                    value={formatCurrency(view === 'mtd' ? metrics.shortfallMtd : metrics.shortfallYtd)} 
                    tooltip="(Projection - (Achieved + Open Orders))"
                />
                <KpiCard title="Open Orders" value={`${formatCurrency(metrics.openOrdersValue)} (${metrics.openOrders.length})`} />
                <KpiCard title="Overdue Orders" value={`${formatCurrency(metrics.overdueOrdersValue)} (${metrics.overdueOrders.length})`} detailsColor={metrics.overdueOrders.length > 0 ? 'text-red-600' : ''}/>
                <KpiCard title="Quotation Pending" value={`${metrics.pendingQuotesCount}`} tooltip="Count of activities with outcome 'Quote sent' that have not yet resulted in an order." />
                <KpiCard title="Outstanding Receivables" value={formatCurrency(metrics.totalReceivables)} />
            </div>

            <div className="bg-white p-5 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-slate-900 mb-4">Achieved vs Projection ({view.toUpperCase()}, in Lakhs)</h3>
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{fontSize: 12}} />
                        <YAxis tick={{fontSize: 12}} />
                        <Tooltip formatter={(value: number) => `${formatCurrency(value * 100000)}`} />
                        <Legend />
                        <Bar dataKey="projection" fill="#a5b4fc" name="Projection" />
                        <Bar dataKey="achieved" fill="#38bdf8" name="Achieved" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
             <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <h3 className="text-lg font-medium text-slate-900 p-5">Open Orders</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                             <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">PO #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Value</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Promise Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Salesperson</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-slate-200">
                             {metrics.openOrders.map(order => {
                                 const isOverdue = isBefore(parseISO(order.promiseDate), today);
                                 const customer = customerMap.get(order.customerId);
                                 const salesperson = salespersonMap.get(order.salespersonId);
                                 return (
                                     <tr key={order.id} className={isOverdue ? 'bg-red-50' : 'hover:bg-slate-50'}>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{order.poNumber}</td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            <Link to={`/customers/${customer?.id}`} className="hover:text-sky-600">{customer?.name}</Link>
                                         </td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatMoney(order.value)}</td>
                                         <td className={`px-6 py-4 whitespace-nowrap text-sm ${isOverdue ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>
                                             {format(parseISO(order.promiseDate), 'dd-MMM-yyyy')}
                                         </td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{order.status}</td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{salesperson?.name}</td>
                                     </tr>
                                 );
                             })}
                         </tbody>
                    </table>
                </div>
             </div>
        </div>
    );
};

export default QuantDashboard;
