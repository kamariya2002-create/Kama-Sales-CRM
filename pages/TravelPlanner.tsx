import React, { useState, useMemo, useCallback } from 'react';
import { Trip } from '../types';
import { useData } from '../context/DataContext';
import { format, parseISO, addDays, subDays, differenceInDays } from 'date-fns';
import TripOverview from '../components/travel/TripOverview';
import BookingsSection from '../components/travel/BookingsSection';
import TripPlanningSection from '../components/travel/TripPlanningSection';
import TripReadinessSection from '../components/travel/TripReadinessSection';
import TripPerformanceSection from '../components/travel/TripPerformanceSection';


const today = new Date();

const createEmptyTrip = (salespeople: {id: string, name: string}[]): Trip => ({
  id: `trip_${Date.now()}`,
  salespersonId: salespeople.length > 0 ? salespeople[0].id : '',
  location: '',
  startDate: format(addDays(today, 30), 'yyyy-MM-dd'),
  durationDays: 5,
  visaDone: { checked: false, date: null },
  travelTicketsBooked: { checked: false, date: null },
  hotelTicketsBooked: { checked: false, date: null },
  budget: null,
  actualCost: null,
  existingClientAppointmentTarget: null,
  existingClientAppointmentsSetup: null,
  existingClientRevenueTarget: null,
  newClientAppointmentTarget: null,
  newClientAppointmentsSetup: null,
  newClientOnboardingTarget: null,
  newClientRevenueTarget: null,
  coldVisitsPlanned: null,
  lineIdentified: { checked: false, description: '' },
  catalogsPrinted: false,
  salesSummaryPrinted: false,
  equipmentCollected: { laptop: false, scanner: false, diamondLoupe: false },
  commercialsPrinted: false,
  diamondSamplesCollected: false,
  existingClientsMet: null,
  existingClientsMetList: '',
  ordersClosed: null,
  ordersToBeClosed30Days: null,
  newClientsMet: null,
  coldVisitsDone: null,
  clientsOnboarded: null,
  interestedClients: null,
  interestedClientsList: '',
  targetOnboarding30Days: null,
});

const DUMMY_TRIPS: Trip[] = [
    {
      id: 'trip1',
      salespersonId: 'sp1',
      location: 'New York, USA',
      startDate: format(addDays(today, 45), 'yyyy-MM-dd'),
      durationDays: 7,
      visaDone: { checked: true, date: format(subDays(today, 10), 'yyyy-MM-dd') },
      travelTicketsBooked: { checked: false, date: null },
      hotelTicketsBooked: { checked: false, date: null },
      budget: 5000,
      actualCost: 0,
      existingClientAppointmentTarget: 5,
      existingClientAppointmentsSetup: 2,
      existingClientRevenueTarget: 100000,
      newClientAppointmentTarget: 3,
      newClientAppointmentsSetup: 1,
      newClientOnboardingTarget: 1,
      newClientRevenueTarget: 50000,
      coldVisitsPlanned: 5,
      lineIdentified: { checked: false, description: '' },
      catalogsPrinted: false,
      salesSummaryPrinted: false,
      equipmentCollected: { laptop: false, scanner: false, diamondLoupe: false },
      commercialsPrinted: false,
      diamondSamplesCollected: false,
      existingClientsMet: null,
      existingClientsMetList: '',
      ordersClosed: null,
      ordersToBeClosed30Days: null,
      newClientsMet: null,
      coldVisitsDone: null,
      clientsOnboarded: null,
      interestedClients: null,
      interestedClientsList: '',
      targetOnboarding30Days: null,
    },
    {
      id: 'trip2',
      salespersonId: 'sp2',
      location: 'London, UK',
      startDate: format(addDays(today, 2), 'yyyy-MM-dd'),
      durationDays: 5,
      visaDone: { checked: true, date: format(subDays(today, 60), 'yyyy-MM-dd') },
      travelTicketsBooked: { checked: true, date: format(subDays(today, 20), 'yyyy-MM-dd') },
      hotelTicketsBooked: { checked: true, date: format(subDays(today, 15), 'yyyy-MM-dd') },
      budget: 3500,
      actualCost: 3200,
      existingClientAppointmentTarget: 4,
      existingClientAppointmentsSetup: 4,
      existingClientRevenueTarget: 80000,
      newClientAppointmentTarget: 2,
      newClientAppointmentsSetup: 0,
      newClientOnboardingTarget: 0,
      newClientRevenueTarget: 25000,
      coldVisitsPlanned: 2,
      lineIdentified: { checked: true, description: 'Core 18K Essentials & Diwali Collection' },
      catalogsPrinted: true,
      salesSummaryPrinted: false,
      equipmentCollected: { laptop: true, scanner: true, diamondLoupe: false },
      commercialsPrinted: true,
      diamondSamplesCollected: false,
      existingClientsMet: null,
      existingClientsMetList: '',
      ordersClosed: null,
      ordersToBeClosed30Days: null,
      newClientsMet: null,
      coldVisitsDone: null,
      clientsOnboarded: null,
      interestedClients: null,
      interestedClientsList: '',
      targetOnboarding30Days: null,
    },
    {
        id: 'trip3',
        salespersonId: 'sp3',
        location: 'Dubai, UAE',
        startDate: format(subDays(today, 15), 'yyyy-MM-dd'),
        durationDays: 4,
        visaDone: { checked: true, date: format(subDays(today, 90), 'yyyy-MM-dd') },
        travelTicketsBooked: { checked: true, date: format(subDays(today, 45), 'yyyy-MM-dd') },
        hotelTicketsBooked: { checked: true, date: format(subDays(today, 40), 'yyyy-MM-dd') },
        budget: 4000,
        actualCost: 4150,
        existingClientAppointmentTarget: 3,
        existingClientAppointmentsSetup: 3,
        existingClientRevenueTarget: 150000,
        newClientAppointmentTarget: 5,
        newClientAppointmentsSetup: 4,
        newClientOnboardingTarget: 2,
        newClientRevenueTarget: 75000,
        coldVisitsPlanned: 3,
        lineIdentified: { checked: true, description: 'Custom High Jewelry' },
        catalogsPrinted: true,
        salesSummaryPrinted: true,
        equipmentCollected: { laptop: true, scanner: true, diamondLoupe: true },
        commercialsPrinted: true,
        diamondSamplesCollected: true,
        existingClientsMet: 3,
        existingClientsMetList: 'Dubai Diamonds, Gulf Gems, Arabian Jewels',
        ordersClosed: 125000,
        ordersToBeClosed30Days: 50000,
        newClientsMet: 4,
        coldVisitsDone: 2,
        clientsOnboarded: 2,
        interestedClients: 2,
        interestedClientsList: 'Oasis Fine Jewelry, The Pearl Emporium',
        targetOnboarding30Days: 1,
      },
];


const TravelPlanner: React.FC = () => {
    const { data: { salespeople }, salespersonMap } = useData();
    const [trips, setTrips] = useState<Trip[]>(DUMMY_TRIPS);
    const [selectedTripId, setSelectedTripId] = useState<string | null>(trips.length > 0 ? trips[0].id : null);
    
    const selectedTrip = useMemo(() => trips.find(t => t.id === selectedTripId), [trips, selectedTripId]);
    
    const handleUpdateTrip = useCallback((updatedTrip: Partial<Trip>) => {
        if (!selectedTripId) return;
        setTrips(prevTrips => prevTrips.map(trip => 
            trip.id === selectedTripId ? { ...trip, ...updatedTrip } : trip
        ));
    }, [selectedTripId]);

    const handleAddNewTrip = () => {
        const newTrip = createEmptyTrip(salespeople);
        setTrips(prev => [newTrip, ...prev]);
        setSelectedTripId(newTrip.id);
    }
    
    const daysUntilTrip = selectedTrip ? differenceInDays(parseISO(selectedTrip.startDate), today) : 0;
    const isTripOver = selectedTrip ? (daysUntilTrip + selectedTrip.durationDays) < 0 : false;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Trip List Panel */}
            <div className="md:col-span-1 bg-white p-4 rounded-lg shadow-sm h-fit">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-900">All Trips</h2>
                    <button 
                        onClick={handleAddNewTrip}
                        className="px-3 py-1 text-sm font-medium text-white bg-sky-600 rounded-md shadow-sm hover:bg-sky-700"
                    >
                        New Trip
                    </button>
                </div>
                <ul className="space-y-2">
                    {trips.map(trip => {
                        const salesperson = salespersonMap.get(trip.salespersonId);
                        return (
                            <li key={trip.id}>
                                <button
                                    onClick={() => setSelectedTripId(trip.id)}
                                    className={`w-full text-left p-3 rounded-md transition-colors ${selectedTripId === trip.id ? 'bg-sky-100' : 'hover:bg-slate-50'}`}
                                >
                                    <p className="font-semibold text-slate-800">{trip.location}</p>
                                    <p className="text-sm text-slate-500">{salesperson?.name || 'N/A'}</p>
                                    <p className="text-sm text-slate-500">{format(parseISO(trip.startDate), 'dd MMM, yyyy')}</p>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Trip Details Panel */}
            <div className="md:col-span-3 space-y-6">
                {selectedTrip ? (
                    <>
                        <TripOverview trip={selectedTrip} onUpdate={handleUpdateTrip} />
                        
                        <div className="space-y-4">
                            <BookingsSection trip={selectedTrip} onUpdate={handleUpdateTrip} />
                            <TripPlanningSection trip={selectedTrip} onUpdate={handleUpdateTrip} isLocked={daysUntilTrip > 60 || daysUntilTrip < 7} daysUntilTrip={daysUntilTrip}/>
                            <TripReadinessSection trip={selectedTrip} onUpdate={handleUpdateTrip} isLocked={daysUntilTrip > 3} daysUntilTrip={daysUntilTrip}/>
                            <TripPerformanceSection trip={selectedTrip} onUpdate={handleUpdateTrip} isLocked={!isTripOver} />
                        </div>
                    </>
                ) : (
                    <div className="bg-white p-12 text-center rounded-lg shadow-sm">
                        <h3 className="text-lg font-medium text-slate-900">No Trip Selected</h3>
                        <p className="mt-1 text-sm text-slate-500">Please select a trip from the list or create a new one.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TravelPlanner;