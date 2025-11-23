import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, MapPin, Search, ExternalLink, RefreshCw, Filter, AlertCircle } from 'lucide-react';

const CityBadge = ({ city }) => {
  const colors = {
    'Coral Gables': 'bg-orange-100 text-orange-800 border-orange-200',
    'Coconut Grove': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Miami': 'bg-teal-100 text-teal-800 border-teal-200',
  };
  
  const defaultColor = 'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colors[city] || defaultColor}`}>
      {city}
    </span>
  );
};

export default function MiamiEventsHub() {
  // Start with empty array instead of mock data
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedCity, setSelectedCity] = useState('All');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [searchQuery, setSearchQuery] = useState('');

  // --- FETCH DATA ON LOAD ---
  useEffect(() => {
    // fetch the JSON file that sits in your public folder
    fetch('/miami_events.json')
      .then(response => {
        if (!response.ok) throw new Error('Failed to load events data');
        return response.json();
      })
      .then(data => {
        // Add simple IDs if missing
        const formattedData = data.map((evt, index) => ({
          ...evt,
          id: index,
          // Ensure image fallback if scraper didn't find one
          image: evt.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800'
        }));
        setEvents(formattedData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching events:", err);
        setError("Could not load upcoming events. Please check back later.");
        setLoading(false);
      });
  }, []);

  // Filter Logic
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // 1. City Filter
      const matchesCity = selectedCity === 'All' || event.city === selectedCity;

      // 2. Date Filter
      let matchesDate = true;
      if (dateRange.start) {
        matchesDate = matchesDate && new Date(event.date) >= new Date(dateRange.start);
      }
      if (dateRange.end) {
        matchesDate = matchesDate && new Date(event.date) <= new Date(dateRange.end);
      }

      // 3. Search Query
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCity && matchesDate && matchesSearch;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events, selectedCity, dateRange, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Header Hero */}
      <header className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white pb-12 pt-8 px-4 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 tracking-tight">Miami Events Hub</h1>
              <p className="text-teal-100 text-lg">Aggregating the best of Coral Gables, The Grove, and Miami.</p>
            </div>
            <div className="mt-4 md:mt-0 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20 text-sm flex items-center">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Updating...' : 'Live Data'}
            </div>
          </div>
        </div>
      </header>

      {/* Filters Section */}
      <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white rounded-xl shadow-xl p-6 border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Search */}
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Jazz, Festival, Art..." 
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* City Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Filter by City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <select 
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none bg-white cursor-pointer"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  <option value="All">All Cities</option>
                  <option value="Coral Gables">Coral Gables</option>
                  <option value="Coconut Grove">Coconut Grove</option>
                  <option value="Miami">Miami (General)</option>
                </select>
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">From</label>
              <input 
                type="date" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))}
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">To</label>
              <input 
                type="date" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))}
              />
            </div>

          </div>
        </div>
      </div>

      {/* Events Grid */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            {selectedCity === 'All' ? 'Upcoming Events' : `Events in ${selectedCity}`}
          </h2>
          <span className="text-slate-500 text-sm font-medium">{filteredEvents.length} events found</span>
        </div>

        {loading ? (
           <div className="text-center py-20">
             <RefreshCw className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
             <p className="text-slate-500">Scraping latest events...</p>
           </div>
        ) : error ? (
          <div className="bg-red-50 text-red-800 p-6 rounded-xl flex items-center justify-center">
             <AlertCircle className="w-6 h-6 mr-2" />
             {error}
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 flex flex-col h-full group">
                
                {/* Image Container */}
                <div className="h-48 overflow-hidden relative bg-slate-200">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {e.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800'}} 
                  />
                  <div className="absolute top-4 left-4">
                    <CityBadge city={event.city} />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center text-sm text-teal-600 font-semibold mb-3">
                    <Calendar className="w-4 h-4 mr-2" />
                    {event.date}
                    <span className="mx-2 text-slate-300">|</span>
                    Miami
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 mb-3 leading-tight group-hover:text-teal-700 transition-colors">
                    {event.title}
                  </h3>
                  
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2 flex-grow">
                    {event.description || "No description available."}
                  </p>

                  <div className="flex items-center text-slate-500 text-xs mb-6">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="truncate">{event.city}</span>
                  </div>

                  <a 
                    href={event.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-auto flex items-center justify-center w-full py-2.5 bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-700 text-sm font-semibold rounded-lg transition-colors border border-slate-200 hover:border-teal-200"
                  >
                    More Info <ExternalLink className="w-3 h-3 ml-2" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
            <Filter className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No events found</h3>
            <p className="text-slate-500">Try adjusting your filters or search terms.</p>
            <button 
              onClick={() => {setSelectedCity('All'); setDateRange({start: '', end: ''}); setSearchQuery('')}}
              className="mt-4 text-teal-600 hover:text-teal-700 font-semibold text-sm"
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-8 mt-12 text-center text-sm">
        <p>© 2025 Miami Events Hub. Data aggregated from public sources.</p>
      </footer>
    </div>
  );
}