
import { MockData } from '../types';
// FIX: The linter reported that 'subDays' was not an exported member of 'date-fns'. Changed to a sub-path import to resolve potential module resolution issues.
// FIX: The linter reported that 'startOfMonth' was not an exported member of 'date-fns'. Changed to a sub-path import to resolve potential module resolution issues.
import { formatISO, addDays } from 'date-fns';
import startOfMonth from 'date-fns/startOfMonth';
import subDays from 'date-fns/subDays';

const today = new Date();
const startOfCurrentMonth = startOfMonth(today);

const usd = (amount: number) => ({ amount, currency: "USD" as const });
const inr = (amount: number) => ({ amount, currency: "INR" as const });
const eur = (amount: number) => ({ amount, currency: "EUR" as const });

export const MOCK_DATA: MockData = {
  "salespeople": [
    {"id":"sp1","name":"Priya Nair","email":"priya@kama.example"}, // High performer
    {"id":"sp2","name":"Arjun Mehta","email":"arjun@kama.example"}, // Steady, some challenges
    {"id":"sp3","name":"Sara Khan","email":"sara@kama.example"}    // Building pipeline
  ],
  "customers": [
    {"id":"c1","name":"Aurora Gems (US)","region":"US","currency":"USD","paymentTerms":"NET30","salespersonId":"sp1", "previousYearSales": usd(250000)},
    {"id":"c2","name":"Stellar Jewels (EU)","region":"EU","currency":"EUR","paymentTerms":"NET45","salespersonId":"sp2", "previousYearSales": eur(180000)},
    {"id":"c3","name":"Bombay Boutique","region":"India","currency":"INR","paymentTerms":"NET15","salespersonId":"sp1", "previousYearSales": inr(21000000)},
    {"id":"c4","name":"Dubai Diamonds","region":"Middle East","currency":"USD","paymentTerms":"NET60","salespersonId":"sp3", "previousYearSales": usd(310000)},
    {"id":"c5","name":"Singapore Fine Metals","region":"Asia","currency":"USD","paymentTerms":"NET30","salespersonId":"sp2", "previousYearSales": usd(130000)},
    {"id":"c6","name":"London Crown Jewels","region":"EU","currency":"EUR","paymentTerms":"NET30","salespersonId":"sp3", "previousYearSales": eur(150000)},
    {"id":"c7","name":"Kolkata Creators","region":"India","currency":"INR","paymentTerms":"NET30","salespersonId":"sp1", "previousYearSales": inr(15000000)},
    {"id":"c8","name":"New York Chains Inc.","region":"US","currency":"USD","paymentTerms":"NET15","salespersonId":"sp2", "previousYearSales": usd(85000)}
  ],
   "projections": [
    // Priya's Customers (High Targets)
    {"customerId":"c1", "ytd": usd(300000), "monthlyBookingTargets": { "Apr": usd(20000), "May": usd(22000), "Jun": usd(18000), "Jul": usd(15000), "Aug": usd(15000), "Sep": usd(25000), "Oct": usd(35000), "Nov": usd(40000), "Dec": usd(30000), "Jan": usd(25000), "Feb": usd(25000), "Mar": usd(30000) }},
    {"customerId":"c3", "ytd": inr(25000000), "monthlyBookingTargets": { "Apr": inr(1800000), "May": inr(1800000), "Jun": inr(1500000), "Jul": inr(1200000), "Aug": inr(1200000), "Sep": inr(2500000), "Oct": inr(3500000), "Nov": inr(3000000), "Dec": inr(2500000), "Jan": inr(2000000), "Feb": inr(2000000), "Mar": inr(2000000) }},
    {"customerId":"c7", "ytd": inr(18000000), "monthlyBookingTargets": { "Apr": inr(1200000), "May": inr(1200000), "Jun": inr(1000000), "Jul": inr(1000000), "Aug": inr(1000000), "Sep": inr(1800000), "Oct": inr(2500000), "Nov": inr(2000000), "Dec": inr(1500000), "Jan": inr(1500000), "Feb": inr(1500000), "Mar": inr(1800000) }},
    // Arjun's Customers (Moderate Targets)
    {"customerId":"c2", "ytd": eur(220000), "monthlyBookingTargets": { "Apr": eur(15000), "May": eur(15000), "Jun": eur(12000), "Jul": eur(10000), "Aug": eur(10000), "Sep": eur(20000), "Oct": eur(30000), "Nov": eur(28000), "Dec": eur(20000), "Jan": eur(18000), "Feb": eur(18000), "Mar": eur(19000) }},
    {"customerId":"c5", "ytd": usd(150000), "monthlyBookingTargets": { "Apr": usd(10000), "May": usd(10000), "Jun": usd(8000), "Jul": usd(8000), "Aug": usd(8000), "Sep": usd(12000), "Oct": usd(18000), "Nov": usd(16000), "Dec": usd(15000), "Jan": usd(12000), "Feb": usd(12000), "Mar": usd(11000) }},
    {"customerId":"c8", "ytd": usd(100000), "monthlyBookingTargets": { "Apr": usd(7000), "May": usd(7000), "Jun": usd(6000), "Jul": usd(5000), "Aug": usd(5000), "Sep": usd(8000), "Oct": usd(12000), "Nov": usd(10000), "Dec": usd(10000), "Jan": usd(8000), "Feb": usd(8000), "Mar": usd(9000) }},
    // Sara's Customers (Building Up)
    {"customerId":"c4", "ytd": usd(350000), "monthlyBookingTargets": { "Apr": usd(25000), "May": usd(25000), "Jun": usd(20000), "Jul": usd(18000), "Aug": usd(18000), "Sep": usd(30000), "Oct": usd(40000), "Nov": usd(35000), "Dec": usd(34000), "Jan": usd(25000), "Feb": usd(25000), "Mar": usd(30000) }},
    {"customerId":"c6", "ytd": eur(180000), "monthlyBookingTargets": { "Apr": eur(12000), "May": eur(12000), "Jun": eur(10000), "Jul": eur(8000), "Aug": eur(8000), "Sep": eur(15000), "Oct": eur(25000), "Nov": eur(20000), "Dec": eur(15000), "Jan": eur(12000), "Feb": eur(12000), "Mar": eur(16000) }}
  ],
  "activities": [
    // Priya - Converted Quote (a2 -> o2)
    { "id":"a1", "meetingDate": formatISO(subDays(today, 5)), "customerId":"c1", "activityType":"Replenishment", "notes":"Finalized Q4 holiday top-up.", "outcome":"PO received", "createdAt": formatISO(subDays(today, 5)), "location":"Zoom", "program": "Core 18K Essentials" },
    { "id":"a2", "meetingDate": formatISO(subDays(today, 10)), "customerId":"c3", "activityType":"In person meeting", "notes":"Presented Diwali collection, client loved it.", "outcome":"Quote sent", "createdAt": formatISO(subDays(today, 10)), "location":"Mumbai Office", "program": "Diwali Collection" },
    // Arjun - Pending Quote (a3, no recent order)
    { "id":"a3", "meetingDate": formatISO(subDays(today, 8)), "customerId":"c2", "activityType":"PD - Briefs received", "notes":"Client has some very specific design requests for Spring.", "outcome":"Quote sent", "createdAt": formatISO(subDays(today, 8)), "location":"Email", "assignedMerchandizer":"Anjali", "program": "Spring Bridal Line", "metalWt": "1.5g - 2.0g", "diamondWt": "0.25 cts - 0.30 cts", "briefProductType": "Ring", "briefDueDate": formatISO(addDays(today, 14)) },
    { "id":"a4", "meetingDate": formatISO(subDays(today, 15)), "customerId":"c5", "activityType":"Other", "notes":"Followed up on overdue invoice INV-9005.", "outcome":"Client promised payment by end of week.", "createdAt": formatISO(subDays(today, 15)), "location":"Phone Call" },
    // Sara - Building pipeline
    { "id":"a5", "meetingDate": formatISO(subDays(today, 2)), "customerId":"c4", "activityType":"Kama Leadership calls", "notes":"Introductory call with their head of procurement. Went well.", "outcome":"Good rapport built. Follow-up meeting scheduled.", "createdAt": formatISO(subDays(today, 2)), "location":"MS Teams", "leadershipMember": "Mr. Sharma (CEO)" },
    { "id":"a6", "meetingDate": formatISO(subDays(today, 20)), "customerId":"c6", "activityType":"Store visits", "notes":"Visited their flagship London store to understand their customer profile.", "outcome":"Identified opportunity for our minimalist collection.", "createdAt": formatISO(subDays(today, 20)), "location":"London", "storeName": "Crown Jewels Mayfair", "city": "London" },
    // More data...
    { "id":"a7", "meetingDate": formatISO(subDays(today, 1)), "customerId":"c7", "activityType":"Replenishment", "notes":" Urgent replenishment for fast-moving SKUs.", "outcome":"PO received", "createdAt": formatISO(subDays(today, 1)), "location":"Email", "program": "Export Basics", "replenishmentSkus": "E-GOLD-01, E-GOLD-05", "expectedPODate": formatISO(today) },
    { "id":"a8", "meetingDate": formatISO(subDays(startOfCurrentMonth, 5)), "customerId":"c8", "activityType":"In person meeting", "notes":"Met with client to discuss Q3 performance and Q4 forecast.", "outcome":"Next steps defined", "createdAt": formatISO(subDays(startOfCurrentMonth, 5)), "location":"Client Office" }
  ],
  "orders": [
    // Corresponds to activity a1
    {"id":"o1","customerId":"c1","poNumber":"PO-1001","value":usd(28000),"promiseDate": formatISO(addDays(today, 10)),"status":"In Production","createdAt": formatISO(subDays(today, 4)),"salespersonId":"sp1"},
    // Corresponds to activity a2
    {"id":"o2","customerId":"c3","poNumber":"PO-1002","value":inr(1500000),"promiseDate": formatISO(addDays(today, 25)),"status":"Open","createdAt": formatISO(subDays(today, 8)),"salespersonId":"sp1"},
    // Arjun's order - slightly overdue
    {"id":"o3","customerId":"c2","poNumber":"PO-1003","value":eur(12000),"promiseDate": formatISO(subDays(today, 2)),"status":"In Production","createdAt": formatISO(subDays(today, 35)),"salespersonId":"sp2"},
    // Sara's first new order
    {"id":"o4","customerId":"c4","poNumber":"PO-1004","value":usd(15000),"promiseDate": formatISO(addDays(today, 40)),"status":"Open","createdAt": formatISO(subDays(today, 1)),"salespersonId":"sp3"},
    // An old shipped order for Arjun
    {"id":"o5","customerId":"c5","poNumber":"PO-0955","value":usd(9000),"promiseDate": formatISO(subDays(today, 45)),"status":"Shipped","createdAt": formatISO(subDays(today, 60)),"salespersonId":"sp2"},
    // Another open order for Priya
    {"id":"o6","customerId":"c7","poNumber":"PO-1005","value":inr(800000),"promiseDate": formatISO(addDays(today, 15)),"status":"Open","createdAt": formatISO(subDays(today, 1)),"salespersonId":"sp1"}
  ],
  "invoices": [
    // Priya - Fully Paid
    {"id":"i1","customerId":"c1","invoiceNumber":"INV-9001","issueDate": formatISO(subDays(startOfCurrentMonth, 30)),"dueDate": formatISO(startOfCurrentMonth),"amount":usd(18000),"paidAmount":usd(18000),"salespersonId":"sp1"},
    // Arjun - Overdue & Partially Paid
    {"id":"i2","customerId":"c2","invoiceNumber":"INV-9002","issueDate": formatISO(subDays(today, 50)),"dueDate": formatISO(subDays(today, 5)),"amount":eur(15000),"paidAmount":eur(5000),"salespersonId":"sp2"},
    // Priya - Recent, not due yet
    {"id":"i3","customerId":"c3","invoiceNumber":"INV-9003","issueDate": formatISO(subDays(today, 10)),"dueDate": formatISO(addDays(today, 5)),"amount":inr(1200000),"paidAmount":inr(0),"salespersonId":"sp1"},
    // Sara - Recent, small, paid
    {"id":"i4","customerId":"c6","invoiceNumber":"INV-9004","issueDate": formatISO(subDays(startOfCurrentMonth, 20)),"dueDate": formatISO(addDays(subDays(startOfCurrentMonth, 20), 30)),"amount":eur(8000),"paidAmount":eur(8000),"salespersonId":"sp3"},
    // Arjun - Old, outstanding (for activity a4)
    {"id":"i5","customerId":"c5","invoiceNumber":"INV-9005","issueDate": formatISO(subDays(today, 60)),"dueDate": formatISO(subDays(today, 30)),"amount":usd(9500),"paidAmount":usd(0),"salespersonId":"sp2"}
  ],
  "fg": [
    {"id":"fg1","customerId":"c1","sku":"NK-CLASSIC-007","value":usd(8000),"readySince": formatISO(subDays(today, 40))},
    {"id":"fg2","customerId":"c3","sku":"RG-DIWALI-002","value":inr(250000),"readySince": formatISO(subDays(today, 10))},
    {"id":"fg3","customerId":"c1","sku":"ER-STUD-011","value":usd(4500),"readySince": formatISO(subDays(today, 95))}
  ]
};
