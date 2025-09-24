import React, { createContext, useContext, useState, useMemo } from 'react';
import { ActivityType } from '../types';
// FIX: The linter reported that 'subDays', 'startOfMonth', and 'startOfYear' were not exported members of 'date-fns'.
// Changed to sub-path imports to resolve potential module resolution issues.
import { endOfMonth, endOfYear, formatISO } from 'date-fns';
import subDays from 'date-fns/subDays';
import startOfMonth from 'date-fns/startOfMonth';
import startOfYear from 'date-fns/startOfYear';


type DateRangePreset = '3' | '7' | '14' | '30' | 'mtd' | 'ytd';

interface DateRange {
  start: string;
  end: string;
}

interface FilterContextType {
  dateRangePreset: DateRangePreset;
  setDateRangePreset: (preset: DateRangePreset) => void;
  dateRange: DateRange;
  activityTypes: ActivityType[];
  setActivityTypes: (types: ActivityType[]) => void;
  salespersonId: string | 'all';
  setSalespersonId: (id: string | 'all') => void;
  customerId: string | 'all';
  setCustomerId: (id: string | 'all') => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

const calculateDateRange = (preset: DateRangePreset): DateRange => {
    const now = new Date();
    switch (preset) {
        case '7': return { start: formatISO(subDays(now, 7)), end: formatISO(now) };
        case '14': return { start: formatISO(subDays(now, 14)), end: formatISO(now) };
        case '30': return { start: formatISO(subDays(now, 30)), end: formatISO(now) };
        case 'mtd': return { start: formatISO(startOfMonth(now)), end: formatISO(endOfMonth(now))};
        case 'ytd': return { start: formatISO(startOfYear(now)), end: formatISO(endOfYear(now))};
        case '3':
        default:
            return { start: formatISO(subDays(now, 3)), end: formatISO(now) };
    }
}

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>('3');
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [salespersonId, setSalespersonId] = useState<string | 'all'>('all');
  const [customerId, setCustomerId] = useState<string | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const dateRange = useMemo(() => calculateDateRange(dateRangePreset), [dateRangePreset]);

  return (
    <FilterContext.Provider value={{
      dateRangePreset,
      setDateRangePreset,
      dateRange,
      activityTypes,
      setActivityTypes,
      salespersonId,
      setSalespersonId,
      customerId,
      setCustomerId,
      searchTerm,
      setSearchTerm
    }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
