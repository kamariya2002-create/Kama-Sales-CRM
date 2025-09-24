
export type Currency = "INR" | "USD" | "EUR";

export type Money = { amount: number; currency: Currency };

export type Salesperson = {
  id: string;
  name: string;
  email: string;
};

export type Customer = {
  id: string;
  name: string;
  region: string;
  currency: Currency;
  paymentTerms: string;
  salespersonId: string;
  previousYearSales?: Money;
};

export type ActivityType =
  | "In person meeting"
  | "Kama Leadership calls"
  | "Replenishment"
  | "PD - Briefs received"
  | "Store visits"
  | "Mumbai office visit"
  | "Other";

export type BriefProductType = 'Ring' | 'Earring' | 'Pendant' | 'Sets' | 'Necklaces';

export type Activity = {
  id: string;
  meetingDate: string; // ISO
  customerId: string;
  activityType: ActivityType;
  attendees?: string;
  program?: string;
  notes?: string;
  outcome?: string;
  location?: string;
  
  // PD Brief fields
  briefDueDate?: string; // ISO
  assignedMerchandizer?: string;
  metalWt?: string;
  diamondWt?: string;
  briefProductType?: BriefProductType;

  // Replenishment fields
  replenishmentSkus?: string;
  expectedPODate?: string; // ISO

  // Store Visit fields
  storeName?: string;
  city?: string;

  // Leadership Call fields
  leadershipMember?: string;

  createdAt: string; // ISO
};

export type Order = {
  id: string;
  customerId: string;
  poNumber: string;
  value: Money;
  promiseDate: string; // ISO
  status: "Open" | "In Production" | "Shipped" | "Closed";
  createdAt: string; // ISO
  salespersonId: string;
};

export type Invoice = {
  id: string;
  customerId: string;
  invoiceNumber: string;
  issueDate: string; // ISO
  dueDate: string;   // ISO
  amount: Money;
  paidAmount: Money;
  salespersonId: string;
};

export type FGStock = {
  id: string;
  customerId: string; // allocation
  sku: string;
  value: Money;
  readySince: string; // ISO
};

export type Projection = {
    customerId: string;
    ytd: Money;
    monthlyBookingTargets: Record<string, Money>;
};

export type Trip = {
  id: string;
  salespersonId: string;
  location: string;
  startDate: string; // ISO Date
  durationDays: number;

  // Bookings
  visaDone: { checked: boolean; date: string | null };
  travelTicketsBooked: { checked: boolean; date: string | null };
  hotelTicketsBooked: { checked: boolean; date: string | null };

  // Trip Planning
  budget: number | null;
  actualCost: number | null;
  existingClientAppointmentTarget: number | null;
  existingClientAppointmentsSetup: number | null;
  existingClientRevenueTarget: number | null;
  newClientAppointmentTarget: number | null;
  newClientAppointmentsSetup: number | null;
  newClientOnboardingTarget: number | null;
  newClientRevenueTarget: number | null;
  coldVisitsPlanned: number | null;

  // Trip Readiness
  lineIdentified: { checked: boolean; description: string };
  catalogsPrinted: boolean;
  salesSummaryPrinted: boolean;
  equipmentCollected: {
    laptop: boolean;
    scanner: boolean;
    diamondLoupe: boolean;
  };
  commercialsPrinted: boolean;
  diamondSamplesCollected: boolean;
  
  // Trip Performance
  existingClientsMet: number | null;
  existingClientsMetList: string;
  ordersClosed: number | null;
  ordersToBeClosed30Days: number | null;
  newClientsMet: number | null;
  coldVisitsDone: number | null;
  clientsOnboarded: number | null;
  interestedClients: number | null;
  interestedClientsList: string;
  targetOnboarding30Days: number | null;
};


export type MockData = {
    salespeople: Salesperson[];
    customers: Customer[];
    activities: Activity[];
    orders: Order[];
    invoices: Invoice[];
    fg: FGStock[];
    projections: Projection[];
}