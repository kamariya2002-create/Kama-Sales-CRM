
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { MockData, Activity, Salesperson, Customer, Projection, Money } from '../types';
import { MOCK_DATA } from '../mock/seed';

interface DataContextType {
  data: MockData;
  loading: boolean;
  salespersonMap: Map<string, Salesperson>;
  customerMap: Map<string, Customer>;
  projectionMap: Map<string, Projection>;
  updateActivity: (activity: Activity) => void;
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => void;
  deleteActivity: (activityId: string) => void;
  updateCustomerAssignment: (customerId: string, salespersonId: string) => void;
  updateCustomerProjection: (customerId: string, newProjectionYtd: Money) => void;
  updateCustomerMonthlyBookingTargets: (customerId: string, newBookingTargets: Record<string, Money>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<MockData>(MOCK_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data from an API
    const timer = setTimeout(() => {
      setData(MOCK_DATA);
      setLoading(false);
    }, 500);
    // TODO: Replace with actual API call
    return () => clearTimeout(timer);
  }, []);
  
  const addActivity = (activity: Omit<Activity, 'id' | 'createdAt'>) => {
    const newActivity: Activity = {
      ...activity,
      id: `a${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setData(prevData => ({
      ...prevData,
      activities: [newActivity, ...prevData.activities],
    }));
  };
  
  const updateActivity = (updatedActivity: Activity) => {
    setData(prevData => ({
      ...prevData,
      activities: prevData.activities.map(act => act.id === updatedActivity.id ? updatedActivity : act),
    }));
  };

  const deleteActivity = (activityId: string) => {
    setData(prevData => ({
        ...prevData,
        activities: prevData.activities.filter(act => act.id !== activityId),
    }));
  };

  const updateCustomerAssignment = (customerId: string, salespersonId: string) => {
    setData(prevData => ({
        ...prevData,
        customers: prevData.customers.map(c => c.id === customerId ? { ...c, salespersonId } : c),
    }));
  };

  const updateCustomerProjection = (customerId: string, newProjectionYtd: Money) => {
      setData(prevData => {
          const existingProjectionIndex = prevData.projections.findIndex(p => p.customerId === customerId);
          let newProjections = [...prevData.projections];

          if (existingProjectionIndex > -1) {
              newProjections[existingProjectionIndex] = { ...newProjections[existingProjectionIndex], ytd: newProjectionYtd };
          } else {
              newProjections.push({ 
                  customerId, 
                  ytd: newProjectionYtd, 
                  monthlyBookingTargets: {} 
              });
          }
          
          return {
              ...prevData,
              projections: newProjections,
          };
      });
  };
  
  const updateCustomerMonthlyBookingTargets = (customerId: string, newBookingTargets: Record<string, Money>) => {
    setData(prevData => {
        const existingProjectionIndex = prevData.projections.findIndex(p => p.customerId === customerId);
        let newProjections = [...prevData.projections];

        if (existingProjectionIndex > -1) {
            newProjections[existingProjectionIndex] = { ...newProjections[existingProjectionIndex], monthlyBookingTargets: newBookingTargets };
        } else {
            const customer = prevData.customers.find(c => c.id === customerId);
            if (customer) {
                 newProjections.push({ 
                     customerId, 
                     ytd: { amount: 0, currency: customer.currency }, // Default YTD
                     monthlyBookingTargets: newBookingTargets 
                 });
            }
        }
        return { ...prevData, projections: newProjections };
    });
  };

  const { salespersonMap, customerMap, projectionMap } = useMemo(() => {
    const salespersonMap = new Map(data.salespeople.map(sp => [sp.id, sp]));
    const customerMap = new Map(data.customers.map(c => [c.id, c]));
    const projectionMap = new Map(data.projections.map(p => [p.customerId, p]));
    return { salespersonMap, customerMap, projectionMap };
  }, [data]);

  return (
    <DataContext.Provider value={{ 
        data, 
        loading, 
        salespersonMap, 
        customerMap, 
        projectionMap,
        addActivity, 
        updateActivity, 
        deleteActivity,
        updateCustomerAssignment,
        updateCustomerProjection,
        updateCustomerMonthlyBookingTargets: updateCustomerMonthlyBookingTargets
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
