import React, { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useFilters } from '../../context/FilterContext';
import { useData } from '../../context/DataContext';
import { TIMEZONE, ACTIVITY_TYPES } from '../../constants';
import { ActivityType } from '../../types';

const Header: React.FC = () => {
  const { 
    dateRangePreset, setDateRangePreset,
    activityTypes, setActivityTypes,
    salespersonId, setSalespersonId,
    customerId, setCustomerId,
    searchTerm, setSearchTerm
  } = useFilters();
  const { data } = useData();

  const [showActivityTypeDropdown, setShowActivityTypeDropdown] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest('#activity-type-dropdown-container')) {
            setShowActivityTypeDropdown(false);
        }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const sortedCustomers = useMemo(() => 
    [...data.customers].sort((a, b) => a.name.localeCompare(b.name)), 
    [data.customers]
  );

  // FIX: Argument of type '(prev: any) => any' is not assignable to parameter of type 'ActivityType[]'.
  // The type for setActivityTypes in FilterContext only allows direct value setting, not a functional update.
  // This implementation respects that type constraint by calculating the new array before setting it.
  const handleActivityTypeChange = (type: ActivityType) => {
    setActivityTypes(
      activityTypes.includes(type)
        ? activityTypes.filter(t => t !== type)
        : [...activityTypes, type]
    );
  };

  const NavItem: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
          isActive
            ? 'bg-sky-600 text-white'
            : 'text-sky-100 hover:bg-sky-800 hover:text-white'
        }`
      }
    >
      {children}
    </NavLink>
  );

  const DatePill: React.FC<{ preset: '3' | '7' | '14' | '30', label: string }> = ({ preset, label }) => (
      <button
        onClick={() => setDateRangePreset(preset)}
        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${dateRangePreset === preset ? 'bg-white text-sky-700 shadow-sm' : 'text-sky-200 hover:bg-sky-800'}`}
      >
          {label}
      </button>
  );

  return (
    <header className="bg-sky-700 text-white shadow-md sticky top-0 z-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold">Kama Sales CRM</h1>
            <nav className="hidden md:flex items-center space-x-4">
              <NavItem to="/log">Activity Log</NavItem>
              <NavItem to="/quant">Quant Dashboard</NavItem>
              <NavItem to="/travel">Travel Planner</NavItem>
              <NavItem to="/admin">Admin</NavItem>
            </nav>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-xs bg-sky-800/50 px-2 py-1 rounded-full">{TIMEZONE}</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 py-3 border-t border-sky-600/50">
           {/* Date Pills */}
           <div className="flex items-center space-x-2 bg-sky-900/50 p-1 rounded-full">
                <DatePill preset="3" label="3D"/>
                <DatePill preset="7" label="7D"/>
                <DatePill preset="14" label="14D"/>
                <DatePill preset="30" label="30D"/>
            </div>
            
            {/* Salesperson Filter */}
            <select
                value={salespersonId}
                onChange={e => setSalespersonId(e.target.value)}
                className="bg-sky-800 text-white text-sm rounded-md border-transparent focus:border-sky-500 focus:ring-sky-500 h-8"
            >
                <option value="all">All Salespeople</option>
                {data.salespeople.map(sp => (
                    <option key={sp.id} value={sp.id}>{sp.name}</option>
                ))}
            </select>
            
            {/* Customer Filter */}
            <select
                value={customerId}
                onChange={e => {
                    setCustomerId(e.target.value);
                    if (e.target.value !== 'all') {
                        setSearchTerm(''); // Clear search when a customer is selected
                    }
                }}
                className="bg-sky-800 text-white text-sm rounded-md border-transparent focus:border-sky-500 focus:ring-sky-500 h-8 max-w-48"
            >
                <option value="all">All Customers</option>
                {sortedCustomers.map(c => (
                    <option key={c.id} value={c.id} title={c.name}>{c.name}</option>
                ))}
            </select>
            
            {/* Activity Type Filter */}
            <div id="activity-type-dropdown-container" className="relative">
                <button 
                    onClick={() => setShowActivityTypeDropdown(!showActivityTypeDropdown)}
                    className="flex items-center justify-between w-48 bg-sky-800 text-white text-sm rounded-md px-3 h-8 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                    <span className="truncate">{activityTypes.length > 0 ? `${activityTypes.length} types selected` : 'All Activity Types'}</span>
                     <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                {showActivityTypeDropdown && (
                    <div className="absolute top-full mt-1 w-64 bg-white text-slate-700 rounded-md shadow-lg z-10 p-2">
                        {ACTIVITY_TYPES.map(type => (
                            <label key={type} className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-slate-100 cursor-pointer">
                                <input 
                                    type="checkbox"
                                    checked={activityTypes.includes(type)}
                                    onChange={() => handleActivityTypeChange(type)}
                                    className="rounded text-sky-600 focus:ring-sky-500"
                                />
                                <span>{type}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Search Input */}
            <div className="relative">
                <input 
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder={customerId !== 'all' ? 'Search is disabled' : 'Search customer, notes...'}
                    disabled={customerId !== 'all'}
                    className="bg-sky-800 text-white placeholder-sky-300 text-sm rounded-md border-transparent focus:border-sky-500 focus:ring-sky-500 h-8 pl-8 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                 <svg className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;