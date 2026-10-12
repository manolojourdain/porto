import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  MapPin, Calendar, Compass, Bookmark, Plane, 
  ChevronRight, X, Plus, Check, Circle, CheckCircle2,
  Image as ImageIcon, Sun, CloudRain, Wind, Heart,
  MoreHorizontal, Map as MapIcon, Navigation, ChevronLeft,
  Coffee, Utensils, GlassWater, Moon, ShoppingBag, Camera
} from 'lucide-react';

const CustomStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    :root {
      --safe-area-top: env(safe-area-inset-top, 0px);
      --safe-area-bottom: env(safe-area-inset-bottom, 24px);
    }
    
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Helvetica Neue", sans-serif;
      background-color: #f2f2f7; /* Apple system background */
      color: #1c1c1e;
      -webkit-font-smoothing: antialiased;
      -webkit-tap-highlight-color: transparent;
    }

    /* Hide scrollbar for Chrome, Safari and Opera */
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }

    /* Hide scrollbar for IE, Edge and Firefox */
    .no-scrollbar {
      -ms-overflow-style: none;  /* IE and Edge */
      scrollbar-width: none;  /* Firefox */
    }

    .glass-nav {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }
    
    .apple-sheet {
      box-shadow: 0 -10px 40px rgba(0,0,0,0.1);
    }

    /* Smooth page transitions */
    .fade-enter {
      opacity: 0;
      transform: scale(0.98);
    }
    .fade-enter-active {
      opacity: 1;
      transform: scale(1);
      transition: opacity 300ms, transform 300ms;
    }
  `}</style>
);

// --- Custom Hooks ---
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

// --- Data Models ---
const TRIP_START_DATE = new Date('2026-11-20T00:00:00');

const PLACES = [
  {
    id: "jardim-do-morro",
    name: "Jardim do Morro",
    category: "Viewpoints",
    area: "Gaia",
    description: "One of the best sunset views over Porto and the Dom Luís I Bridge. Grab a drink and sit on the grass.",
    price: "Free",
    image: "https://images.unsplash.com/photo-1582260655866-963d33ea6476?auto=format&fit=crop&w=800&q=80",
    mapsUrl: "https://maps.google.com/?q=Jardim+do+Morro+Porto"
  },
  {
    id: "ribeira",
    name: "Cais da Ribeira",
    category: "Must See",
    area: "Ribeira",
    description: "The historic riverfront promenade. Colorful houses, narrow cobbled streets, and countless cafes.",
    price: "Free",
    image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=800&q=80",
    mapsUrl: "https://maps.google.com/?q=Ribeira+Porto"
  },
  {
    id: "cantina-32",
    name: "Cantina 32",
    category: "Restaurants",
    area: "Rua das Flores",
    description: "Industrial-chic spot famous for its contemporary Portuguese dishes and cheesecake served in a plant pot.",
    price: "$$$",     image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",     mapsUrl: "https://maps.google.com/?q=Cantina+32+Porto"   },   {     id: "serralves",     name: "Serralves Museum & Park",     category: "Culture",     area: "Boavista",     description: "Stunning contemporary art museum set in massive, beautifully manicured grounds. Perfect for a calm morning.",     price: "€20",     image: "https://images.unsplash.com/photo-1560961806-03c6218f0a20?auto=format&fit=crop&w=800&q=80",     mapsUrl: "https://maps.google.com/?q=Serralves+Porto"   },   {     id: "majestic-cafe",     name: "Majestic Café",     category: "Coffee",     area: "Baixa",     description: "Historic Belle Époque café. Extremely beautiful architecture, though prices reflect its fame.",     price: "$$$",     image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",     mapsUrl: "https://maps.google.com/?q=Majestic+Cafe+Porto"   },   {     id: "dom-luis",     name: "Dom Luís I Bridge",     category: "Must See",     area: "Douro River",     description: "Iconic double-deck metal arch bridge. Walk the top deck for breathtaking panoramic views of the city.",     price: "Free",     image: "https://images.unsplash.com/photo-1621255554124-71fc96344275?auto=format&fit=crop&w=800&q=80",     mapsUrl: "https://maps.google.com/?q=Dom+Luis+Bridge+Porto"   },   {     id: "base-porto",     name: "Base Porto",     category: "Bars",     area: "Clérigos",     description: "Open-air garden bar right next to the Clérigos Tower. Great vibe, music, and cocktails under the olive trees.",     price: "$$",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80",
    mapsUrl: "https://maps.google.com/?q=Base+Porto"
  }
];

const ITINERARY = {
  "2026-11-20": {
    label: "Fri 20",
    full: "Friday 20 November",
    events: [
      { id: "e1", time: "09:00", title: "Departure", desc: "Flight out to Porto." },
      { id: "e2", time: "13:30", title: "Arrival in Porto", desc: "Land at OPO. Take the metro (Line E) to Trindade." },
      { id: "e3", time: "15:00", title: "Hotel Check-in", desc: "Drop bags, freshen up." },
      { id: "e4", time: "17:00", title: "Ribeira Walk", desc: "Head down to the riverfront, explore the alleys." },
      { id: "e5", time: "20:30", title: "Dinner", desc: "Reservation at Cantina 32." },
    ]
  },
  "2026-11-21": {
    label: "Sat 21",
    full: "Saturday 21 November",
    events: [
      { id: "e6", time: "09:30", title: "Breakfast", desc: "Coffee and Pastéis de Nata nearby." },
      { id: "e7", time: "10:30", title: "Livraria Lello", desc: "Visit the famous bookstore (tickets booked)." },
      { id: "e8", time: "12:00", title: "Clérigos Tower", desc: "Climb for the city view." },
      { id: "e9", time: "14:00", title: "Lunch at Bolhão", desc: "Fresh food at Mercado do Bolhão." },
      { id: "e10", time: "16:30", title: "Wine Tasting", desc: "Caves in Vila Nova de Gaia." },
      { id: "e11", time: "18:00", title: "Sunset", desc: "Drinks at Jardim do Morro." },
    ]
  },
  "2026-11-22": {
    label: "Sun 22",
    full: "Sunday 22 November",
    events: [
      { id: "e12", time: "10:00", title: "Slow Morning", desc: "Walk to Foz do Douro." },
      { id: "e13", time: "11:30", title: "Serralves", desc: "Museum and park walk." },
      { id: "e14", time: "14:00", title: "Seafood Lunch", desc: "Matosinhos area." },
      { id: "e15", time: "19:00", title: "Francesinha Night", desc: "Try the traditional heavy sandwich." },
    ]
  },
  "2026-11-23": {
    label: "Mon 23",
    full: "Monday 23 November",
    events: [
      { id: "e16", time: "09:00", title: "Breakfast & Pack", desc: "Last morning coffee." },
      { id: "e17", time: "10:30", title: "Souvenir Shopping", desc: "Rua Santa Catarina." },
      { id: "e18", time: "14:00", title: "Head to Airport", desc: "Metro back to OPO." },
      { id: "e19", time: "16:45", title: "Flight Home", desc: "Departure." },
    ]
  }
};

const CATEGORIES = ["All", "Must See", "Food", "Coffee", "Restaurants", "Bars", "Viewpoints", "Culture", "Shopping"];

const HomeView = ({ setTab }) => {
  const [countdown, setCountdown] = useState({ type: 'days', val: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diffMs = TRIP_START_DATE - now;
      
      if (diffMs <= 0) {
        setCountdown({ type: 'started', val: null });
      } else if (diffMs < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        setCountdown({ type: 'hours', val: `${hours}h ${minutes}m` });
      } else {
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        setCountdown({ type: 'days', val: days });
      }
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen px-6 pt-16 pb-32 animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-5xl font-semibold tracking-tighter text-zinc-900 leading-none">PORTO</h1>
          <p className="text-zinc-400 font-medium mt-2 tracking-wide text-sm uppercase">20 — 23 November</p>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative w-full h-[400px] rounded-[2.5rem] overflow-hidden shadow-sm mb-8">
        <img 
          src="https://images.unsplash.com/photo-1621255554124-71fc96344275?auto=format&fit=crop&w=800&q=80" 
          alt="Porto"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40"></div>
        
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-4 border border-white/30 text-white">
            {countdown.type === 'started' ? (
              <div>
                <p className="text-2xl font-semibold tracking-tight">Porto, today.</p>
                <p className="text-white/80 text-sm mt-1">3 nights · 2 people</p>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="text-4xl font-semibold tracking-tight leading-none">
                  {countdown.val}
                </span>
                <span className="text-white/80 font-medium mt-1">
                  {countdown.type === 'days' ? 'days until Porto' : 'until Porto'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mini Weather Widget (Mock) */}
      <div className="bg-zinc-100 rounded-3xl p-5 flex items-center justify-between mb-8">
        <div>
          <h3 className="text-zinc-500 font-medium text-sm">Weather Forecast</h3>
          <p className="text-zinc-900 font-semibold text-lg mt-0.5">Porto</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-semibold">17°</p>
            <p className="text-zinc-500 text-sm">14° / 19°</p>
          </div>
          <CloudRain className="w-8 h-8 text-zinc-700" strokeWidth={1.5} />
        </div>
      </div>

      <div className="flex justify-center mt-auto mb-4">
        <p className="text-zinc-400 text-sm font-medium tracking-wide">
          Porto — us two. <span className="mx-2">·</span> 20.11.26
        </p>
      </div>
    </div>
  );
};

const TodayView = () => {
  const [activeDate, setActiveDate] = useState("2026-11-20");
  const [completedEvents, setCompletedEvents] = useLocalStorage("porto_completed_itinerary", {});

  const toggleComplete = (eventId) => {
    setCompletedEvents(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  const dates = Object.keys(ITINERARY);
  const currentDayData = ITINERARY[activeDate];

  return (
    <div className="flex flex-col min-h-screen pt-16 pb-32 bg-white">
      <div className="px-6 mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 mb-6">Itinerary</h1>
        
        {/* Horizontal Date Selector */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {dates.map(date => {
            const isActive = date === activeDate;
            return (
              <button
                key={date}
                onClick={() => setActiveDate(date)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'
                }`}
              >
                {ITINERARY[date].label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-6 mt-4">
        <h2 className="text-zinc-500 font-medium mb-6">{currentDayData.full}</h2>
        
        <div className="relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-[39px] top-4 bottom-4 w-px bg-zinc-200" />

          <div className="flex flex-col gap-8">
            {currentDayData.events.map((event) => {
              const isDone = completedEvents[event.id];
              return (
                <div key={event.id} className="flex gap-5 relative z-10">
                  <div className="w-[80px] shrink-0 text-right pt-0.5">
                    <span className="text-zinc-900 font-medium">{event.time}</span>
                  </div>
                  
                  <div className="shrink-0 mt-1 cursor-pointer" onClick={() => toggleComplete(event.id)}>
                    <div className={`w-4 h-4 rounded-full border-[1.5px] transition-colors flex items-center justify-center bg-white
                      ${isDone ? 'border-zinc-900 bg-zinc-900' : 'border-zinc-300'}`}
                    >
                      {isDone && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                  </div>
                  
                  <div className={`flex-1 pb-2 transition-opacity ${isDone ? 'opacity-40' : 'opacity-100'}`}>
                    <h3 className={`font-semibold text-zinc-900 text-lg leading-tight ${isDone ? 'line-through' : ''}`}>
                      {event.title}
                    </h3>
                    {event.desc && (
                      <p className="text-zinc-500 mt-1.5 text-sm leading-relaxed">{event.desc}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const PlaceDetailModal = ({ place, isOpen, onClose, isSaved, toggleSave }) => {
  if (!place) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-white transform transition-transform duration-300 ease-out apple-sheet overflow-y-auto no-scrollbar
      ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
    >
      <div className="relative h-[45vh] w-full bg-zinc-100">
        <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
        
        {/* Top Gradient for icons visibility */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
        
        <button 
          onClick={onClose}
          className="absolute top-12 left-5 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20"
        >
          <X className="w-5 h-5" />
        </button>

        <button 
          onClick={() => toggleSave(place.id)}
          className="absolute top-12 right-5 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20"
        >
          <Heart className={`w-5 h-5 ${isSaved ? 'fill-current text-white' : 'text-white'}`} />
        </button>
      </div>

      <div className="px-6 py-8 pb-32">
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-zinc-500">
          <span>{place.category}</span>
          <span>·</span>
          <span>{place.area}</span>
        </div>
        
        <h1 className="text-3xl font-semibold text-zinc-900 tracking-tight leading-tight mb-2">
          {place.name}
        </h1>
        
        <p className="text-zinc-900 font-medium mb-8">
          {place.price}
        </p>

        <div className="h-px w-full bg-zinc-100 mb-8" />

        <p className="text-zinc-600 leading-relaxed text-[15px] mb-10">
          {place.description}
        </p>

        <a 
          href={place.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-zinc-900 text-white rounded-2xl py-4 font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <Navigation className="w-5 h-5" />
          Open in Maps
        </a>
      </div>
    </div>
  );
};

const PlaceCard = ({ place, onClick, isSaved, toggleSave }) => {
  return (
    <div className="flex flex-col gap-3 group" onClick={() => onClick(place)}>
      <div className="relative w-full aspect-square rounded-[2rem] overflow-hidden bg-zinc-100 cursor-pointer">
        <img src={place.image} alt={place.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        <button 
          onClick={(e) => { e.stopPropagation(); toggleSave(place.id); }}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-black/20 backdrop-blur-md border border-white/20 text-white z-10"
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>
      <div>
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-zinc-900 text-lg leading-tight">{place.name}</h3>
        </div>
        <p className="text-zinc-500 text-sm mt-0.5">{place.category} · {place.area}</p>
      </div>
    </div>
  );
};

const ExploreView = ({ savedPlaces, setSavedPlaces }) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedPlace, setSelectedPlace] = useState(null);

  const toggleSave = (id) => {
    setSavedPlaces(prev => {
      if (prev.includes(id)) return prev.filter(p => p !== id);
      return [...prev, id];
    });
  };

  const filteredPlaces = activeCategory === "All" 
    ? PLACES 
    : PLACES.filter(p => p.category === activeCategory);

  return (
    <div className="flex flex-col min-h-screen pt-16 pb-32 bg-white">
      <div className="px-6 mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 mb-6">Explore</h1>
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 grid grid-cols-2 gap-x-4 gap-y-8 mt-2">
        {filteredPlaces.map(place => (
          <PlaceCard 
            key={place.id} 
            place={place} 
            onClick={setSelectedPlace} 
            isSaved={savedPlaces.includes(place.id)}
            toggleSave={toggleSave}
          />
        ))}
      </div>

      <PlaceDetailModal 
        place={selectedPlace} 
        isOpen={!!selectedPlace} 
        onClose={() => setSelectedPlace(null)} 
        isSaved={selectedPlace ? savedPlaces.includes(selectedPlace.id) : false}
        toggleSave={toggleSave}
      />
    </div>
  );
};

const SavedView = ({ savedPlaces, setSavedPlaces }) => {
  const [selectedPlace, setSelectedPlace] = useState(null);

  const savedList = PLACES.filter(p => savedPlaces.includes(p.id));

  const toggleSave = (id) => {
    setSavedPlaces(prev => prev.filter(p => p !== id));
  };

  return (
    <div className="flex flex-col min-h-screen pt-16 pb-32 bg-[#f2f2f7]">
      <div className="px-6 mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 mb-2">Saved</h1>
        <p className="text-zinc-500 font-medium">{savedList.length} places</p>
      </div>

      {savedList.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 opacity-50">
          <Bookmark className="w-12 h-12 text-zinc-400 mb-4" strokeWidth={1} />
          <p className="text-zinc-500 text-center">No saved places yet.<br/>Start exploring and tap the heart icon.</p>
        </div>
      ) : (
        <div className="px-4 flex flex-col gap-4">
          {savedList.map(place => (
            <div 
              key={place.id} 
              onClick={() => setSelectedPlace(place)}
              className="bg-white rounded-3xl p-3 flex gap-4 items-center shadow-sm cursor-pointer"
            >
              <img src={place.image} alt={place.name} className="w-20 h-20 rounded-2xl object-cover bg-zinc-100" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-zinc-900 truncate">{place.name}</h3>
                <p className="text-zinc-500 text-sm mt-0.5">{place.category}</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); toggleSave(place.id); }}
                className="p-3 mr-1 text-zinc-900"
              >
                <Heart className="w-5 h-5 fill-current" />
              </button>
            </div>
          ))}
        </div>
      )}

      <PlaceDetailModal 
        place={selectedPlace} 
        isOpen={!!selectedPlace} 
        onClose={() => setSelectedPlace(null)} 
        isSaved={selectedPlace ? savedPlaces.includes(selectedPlace.id) : false}
        toggleSave={toggleSave}
      />
    </div>
  );
};

const TripSection = ({ title, icon: Icon, children }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="bg-white rounded-[2rem] overflow-hidden mb-4 shadow-sm border border-zinc-100/50">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-5 flex items-center justify-between bg-white text-left"
      >
        <div className="flex items-center gap-4">
          <div className="bg-zinc-100 p-2.5 rounded-2xl text-zinc-900">
            <Icon className="w-5 h-5" strokeWidth={2} />
          </div>
          <span className="font-semibold text-lg text-zinc-900">{title}</span>
        </div>
        <ChevronRight className={`w-5 h-5 text-zinc-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>
      
      {expanded && (
        <div className="px-6 pb-6 pt-2 border-t border-zinc-50">
          {children}
        </div>
      )}
    </div>
  );
}

const EditableRow = ({ label, value, onChange, placeholder }) => (
  <div className="flex flex-col py-3 border-b border-zinc-100 last:border-0">
    <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">{label}</span>
    <input 
      type="text" 
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)} 
      placeholder={placeholder}
      className="bg-transparent border-none p-0 text-zinc-900 font-medium focus:ring-0 w-full placeholder:text-zinc-300 outline-none"
    />
  </div>
);

const TripView = () => {
  const [stayData, setStayData] = useLocalStorage("porto_stay", { hotel: "The Yeatman", address: "Rua do Choupelo", checkIn: "20 Nov, 15:00", checkOut: "23 Nov, 12:00", ref: "XYZ123" });
  const [flightData, setFlightData] = useLocalStorage("porto_flights", { outFlight: "TP 1234", outTime: "09:00", retFlight: "TP 5678", retTime: "16:45" });
  
  // Budget State
  const [budgetTotal, setBudgetTotal] = useLocalStorage("porto_budget_total", "1000");
  const [expenses, setExpenses] = useLocalStorage("porto_budget_expenses", []);
  const [newExpAmount, setNewExpAmount] = useState("");
  const [newExpDesc, setNewExpDesc] = useState("");

  const addExpense = () => {
    if (!newExpAmount || !newExpDesc) return;
    setExpenses([{ id: Date.now(), amount: parseFloat(newExpAmount), desc: newExpDesc }, ...expenses]);
    setNewExpAmount("");
    setNewExpDesc("");
  };
  const deleteExpense = (id) => setExpenses(expenses.filter(e => e.id !== id));
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Packing State
  const [packingItems, setPackingItems] = useLocalStorage("porto_packing", [
    { id: 1, text: "Passport", packed: true },
    { id: 2, text: "Comfortable shoes", packed: false },
    { id: 3, text: "Camera & charger", packed: false },
  ]);
  const [newItem, setNewItem] = useState("");

  const toggleItem = (id) => setPackingItems(items => items.map(i => i.id === id ? { ...i, packed: !i.packed } : i));
  const addItem = (e) => {
    e.preventDefault();
    if (!newItem) return;
    setPackingItems([...packingItems, { id: Date.now(), text: newItem, packed: false }]);
    setNewItem("");
  };
  const deleteItem = (id) => setPackingItems(items => items.filter(i => i.id !== id));
  
  const packedCount = packingItems.filter(i => i.packed).length;

  return (
    <div className="flex flex-col min-h-screen pt-16 pb-32 bg-[#f2f2f7]">
      <div className="px-6 mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Trip Details</h1>
      </div>

      <div className="px-4">
        {/* STAY */}
        <TripSection title="Accommodation" icon={Moon}>
          <EditableRow label="Name" value={stayData.hotel} onChange={(val) => setStayData({...stayData, hotel: val})} />
          <EditableRow label="Address" value={stayData.address} onChange={(val) => setStayData({...stayData, address: val})} />
          <div className="grid grid-cols-2 gap-4">
            <EditableRow label="Check-in" value={stayData.checkIn} onChange={(val) => setStayData({...stayData, checkIn: val})} />
            <EditableRow label="Check-out" value={stayData.checkOut} onChange={(val) => setStayData({...stayData, checkOut: val})} />
          </div>
          <EditableRow label="Booking Ref" value={stayData.ref} onChange={(val) => setStayData({...stayData, ref: val})} />
        </TripSection>

        {/* FLIGHTS */}
        <TripSection title="Flights" icon={Plane}>
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-zinc-900 mb-2">Outbound</h4>
            <div className="grid grid-cols-2 gap-4">
              <EditableRow label="Flight" value={flightData.outFlight} onChange={(val) => setFlightData({...flightData, outFlight: val})} />
              <EditableRow label="Time" value={flightData.outTime} onChange={(val) => setFlightData({...flightData, outTime: val})} />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 mb-2">Return</h4>
            <div className="grid grid-cols-2 gap-4">
              <EditableRow label="Flight" value={flightData.retFlight} onChange={(val) => setFlightData({...flightData, retFlight: val})} />
              <EditableRow label="Time" value={flightData.retTime} onChange={(val) => setFlightData({...flightData, retTime: val})} />
            </div>
          </div>
        </TripSection>

        {/* BUDGET */}
        <TripSection title="Budget" icon={ShoppingBag}>
          <div className="flex justify-between items-end mb-6 bg-zinc-50 p-4 rounded-2xl">
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Total Spent</p>
              <p className="text-2xl font-semibold text-zinc-900">€{totalSpent.toFixed(2)}</p>
            </div>
            <div className="text-right w-24">
              <EditableRow label="Budget" value={budgetTotal} onChange={setBudgetTotal} placeholder="0" />
            </div>
          </div>
          
          <div className="flex gap-2 mb-6">
            <input 
              type="text" placeholder="Desc" value={newExpDesc} onChange={e => setNewExpDesc(e.target.value)}
              className="flex-1 bg-zinc-100 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-zinc-400 placeholder:text-zinc-400"
            />
            <input 
              type="number" placeholder="€" value={newExpAmount} onChange={e => setNewExpAmount(e.target.value)}
              className="w-20 bg-zinc-100 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-zinc-400 placeholder:text-zinc-400"
            />
            <button onClick={addExpense} className="bg-zinc-900 text-white p-3 rounded-xl">
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {expenses.map(exp => (
              <div key={exp.id} className="flex justify-between items-center py-2 border-b border-zinc-100 last:border-0">
                <span className="text-zinc-900">{exp.desc}</span>
                <div className="flex items-center gap-4">
                  <span className="font-medium text-zinc-900">€{exp.amount}</span>
                  <button onClick={() => deleteExpense(exp.id)} className="text-zinc-300 hover:text-red-500"><X className="w-4 h-4"/></button>
                </div>
              </div>
            ))}
          </div>
        </TripSection>

        {/* PACKING */}
        <TripSection title="Packing List" icon={CheckCircle2}>
          <p className="text-sm font-medium text-zinc-500 mb-4">{packedCount} / {packingItems.length} packed</p>
          
          <div className="flex flex-col gap-1 mb-6">
            {packingItems.map(item => (
              <div key={item.id} className="flex items-center gap-3 py-2 group">
                <button onClick={() => toggleItem(item.id)} className="text-zinc-400 flex-shrink-0">
                  {item.packed ? <CheckCircle2 className="w-6 h-6 text-zinc-900" fill="#18181b" stroke="white" /> : <Circle className="w-6 h-6 text-zinc-300" />}
                </button>
                <span className={`flex-1 text-[15px] ${item.packed ? 'text-zinc-400 line-through' : 'text-zinc-900'}`}>{item.text}</span>
                <button onClick={() => deleteItem(item.id)} className="text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={addItem} className="flex gap-2">
            <input 
              type="text" placeholder="Add item..." value={newItem} onChange={e => setNewItem(e.target.value)}
              className="flex-1 bg-zinc-100 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-zinc-400 placeholder:text-zinc-400 text-[15px]"
            />
            <button type="submit" className="bg-zinc-100 text-zinc-900 p-3 rounded-xl font-medium">Add</button>
          </form>
        </TripSection>
        
        {/* MEMORIES - Apple Journal Style snippet */}
        <TripSection title="Memories" icon={Camera}>
          <div className="bg-zinc-50 rounded-2xl p-6 text-center border border-zinc-100 border-dashed">
             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
               <Camera className="w-5 h-5 text-zinc-400" />
             </div>
             <p className="text-zinc-900 font-medium mb-1">Add a Memory</p>
             <p className="text-zinc-500 text-sm mb-4">Store a photo and a short note locally on your device.</p>
             <button className="bg-zinc-900 text-white rounded-full px-5 py-2.5 text-sm font-medium w-full pointer-events-none opacity-50">
               Coming soon
             </button>
          </div>
        </TripSection>

      </div>
    </div>
  );
};

const BottomNav = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', icon: Compass, label: 'Home' },
    { id: 'today', icon: Calendar, label: 'Today' },
    { id: 'explore', icon: MapPin, label: 'Explore' },
    { id: 'saved', icon: Bookmark, label: 'Saved' },
    { id: 'trip', icon: Plane, label: 'Trip' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="w-full max-w-[500px] glass-nav border-t border-zinc-200/50 pointer-events-auto pb-[env(safe-area-inset-bottom,16px)]">
        <div className="flex justify-between items-center px-4 pt-3 pb-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 w-16 active:scale-95 transition-transform ${isActive ? 'text-zinc-900' : 'text-zinc-400'}`}
              >
                <Icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [savedPlaces, setSavedPlaces] = useLocalStorage('porto_saved_places', []);

  // Dynamically inject PWA Manifest and Meta tags for standalone mode
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const manifest = {
        name: "Porto Trip",
        short_name: "Porto",
        start_url: ".",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#f2f2f7",
        icons: [{
          src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23fff'/%3E%3Cpath d='M20 70 C30 50, 70 50, 80 70 M30 70 L30 30 M70 70 L70 30' stroke='%23000' stroke-width='6' fill='none'/%3E%3C/svg%3E",
          sizes: "192x192",
          type: "image/svg+xml"
        }]
      };
      
      const stringManifest = JSON.stringify(manifest);
      const blob = new Blob([stringManifest], { type: 'application/json' });
      const manifestURL = URL.createObjectURL(blob);
      
      let link = document.querySelector('link[rel="manifest"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'manifest';
        document.head.appendChild(link);
      }
      link.href = manifestURL;

      // Add iOS meta tags
      const addMeta = (name, content, isProperty = false) => {
        let meta = document.querySelector(`meta[${isProperty ? 'property' : 'name'}="${name}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          if (isProperty) meta.setAttribute('property', name);
          else meta.name = name;
          document.head.appendChild(meta);
        }
        meta.content = content;
      };

      addMeta('apple-mobile-web-app-capable', 'yes');
      addMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
      addMeta('theme-color', '#f2f2f7');
      addMeta('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    }
  }, []);

  return (
    <>
      <CustomStyles />
      <div className="flex justify-center bg-zinc-100 min-h-screen">
        {/* Mobile Container wrapper (centers on desktop, full on mobile) */}
        <div className="w-full max-w-[500px] min-h-screen bg-white relative overflow-hidden shadow-2xl sm:border-x sm:border-zinc-200">
          
          {/* Main Content Area */}
          <main className="h-full overflow-y-auto no-scrollbar">
            {activeTab === 'home' && <HomeView setTab={setActiveTab} />}
            {activeTab === 'today' && <TodayView />}
            {activeTab === 'explore' && <ExploreView savedPlaces={savedPlaces} setSavedPlaces={setSavedPlaces} />}
            {activeTab === 'saved' && <SavedView savedPlaces={savedPlaces} setSavedPlaces={setSavedPlaces} />}
            {activeTab === 'trip' && <TripView />}
          </main>

          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>
    </>
  );
}
