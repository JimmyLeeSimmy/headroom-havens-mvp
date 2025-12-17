import React, { useState, useMemo } from 'react';
import { Search, Bed, Maximize, Compass, DollarSign, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

// --- INTERFACES AND TYPE DEFINITIONS ---
interface Property {
  id: number;
  name: string;
  location: string;
  priceRange: number; 
  maxHeightCM: number; 
  mattressLengthCM: number;
  ratingMember: number; 
  affiliateLink: string;
  images: string[];
  description: string;
  amenities: string[];
  safetySolution: string | null; // NEW FIELD: Holds safety device info for low headroom properties
}

interface HeaderProps {
  navigate: (path: string, propertyId?: number) => void;
  currentPage: string;
}

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  color?: string;
  className?: string;
  type?: 'submit' | 'button' | 'reset';
  disabled?: boolean;
}

interface Review {
  id: number;
  propertyId: number;
  reviewer: string;
  date: string;
  rating: number;
  comment: string;
}

// NEW: Data captured by the modal
interface BookingData {
  name: string;
  email: string;
  height: number; // Stored in CM
}

// NEW INTERFACE: Data captured by the review form
interface ReviewData {
  reviewer: string;
  email: string;
  rating: number;
  comment: string;
}

// --- GLOBAL CONFIGURATION AND DATA ---

const SAFETY_BUFFER_CM = 5; 
const HERO_IMAGE_URL = process.env.PUBLIC_URL + "/images/cottage-hero2.jpg"; 
const AFFILIATE_BASE_LINK = "https://partner-booking-site.com/?aid=HHAVENS123&prop=";

// NEW: Height options for the modal select box
const HEIGHT_OPTIONS_CM = [183, 188, 193, 198, 203, 208, 213, 218]; // Approx. 6'0" to 7'2"

// Conversion helper function
const cmToFeetInches = (cm: number): string => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet} ft ${inches} in`;
};

// Helper function to format date from YYYY-MM-DD to DD-MMM-YYYY
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr; // Return original if format is unexpected

    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1; // 0-indexed month
    const day = parts[2];
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const monthAbbr = monthNames[monthIndex];
    
    return `${day}-${monthAbbr}-${year}`;
  } catch (e) {
    console.error("Date formatting failed:", e);
    return dateStr;
  }
};

// Helper function to convert price range number to a readable label
const priceRangeToLabel = (price: number): string => {
  switch (price) {
    case 1:
      return 'Comfort';
    case 2:
    case 3: // Using 2 & 3 for Boutique
      return 'Boutique';
    case 4:
      return 'Luxury';
    case 5: 
      return 'Elite Haven'; 
    default:
      return 'Unrated';
  }
};

// Mock Property Data
const MOCK_PROPERTIES: Property[] = [
  { 
    id: 1, 
    name: "Cotswold Barn Lodge", 
    location: "Cotswolds, UK", 
    priceRange: 4, 
    maxHeightCM: 220, 
    mattressLengthCM: 215, 
    ratingMember: 4.8, 
    affiliateLink: AFFILIATE_BASE_LINK + "Lodge1", 
    images: [
      // Lead Image for Card and Detail Page
      process.env.PUBLIC_URL + "/images/cotswold-barn-1-exterior.jpg", 
      // Carousel Images
      process.env.PUBLIC_URL + "/images/cotswold-barn-2-vaulted.jpg",
      process.env.PUBLIC_URL + "/images/cotswold-barn-3-longbed.jpg",
    ], 
    description: "Architecturally stunning barn conversion with vast open spaces and original vaulted ceilings. Ideal for the 7-foot traveler.", 
    amenities: ["Vaulted Ceilings", "California King Bed", "Enclosed Garden"],
    safetySolution: null, // NEW: No solution needed (tall clearance)
  },
  { 
    id: 2, 
    name: "Highland Stone Cottage", 
    location: "Scottish Highlands, UK", 
    priceRange: 3, 
    maxHeightCM: 195, 
    mattressLengthCM: 205, 
    ratingMember: 3.5, 
    affiliateLink: AFFILIATE_BASE_LINK + "Cottage2", 
    images: [
      // Lead Image for Card and Detail Page
      process.env.PUBLIC_URL + "/images/highland-cottage-1-exterior.jpg",
      // Carousel Images
      process.env.PUBLIC_URL + "/images/highland-cottage-2-livingroom.jpg",
      process.env.PUBLIC_URL + "/images/highland-cottage-3-kitchen.jpg",
    ], 
    description: "Traditional stone cottage carefully refurbished to maximise vertical space. Low point is the kitchen beam. Features an extra-long Super King bed.", 
    amenities: ["Extra-Long King Bed", "Open Fireplace", "Lake Views"],
    safetySolution: "Sentinel Swing, Haven-Wrap", // TM removed
  },
  { 
    id: 3, 
    name: "Bristol Urban Loft", 
    location: "Bristol, UK", 
    priceRange: 5, 
    maxHeightCM: 235, 
    mattressLengthCM: 220, 
    ratingMember: 5.0, 
    affiliateLink: AFFILIATE_BASE_LINK + "Loft3", 
    images: [
      // Lead Image for Card and Detail Page
      process.env.PUBLIC_URL + "/images/bristol-loft-1-view.jpg",
      // Carousel Images
      process.env.PUBLIC_URL + "/images/bristol-loft-2-interior.jpg",
    ],
    description: "Sleek, modern penthouse apartment with floor-to-ceiling windows and zero architectural obstructions. Absolute maximum headroom throughout.", 
    amenities: ["24/7 Concierge", "Queen Mattresses (Extra Long)", "Gym Access"],
    safetySolution: null, // NEW: No solution needed (max clearance)
  },
  { 
    id: 4, 
    name: "New Forest A-Frame", 
    location: "New Forest, UK", 
    priceRange: 2, 
    maxHeightCM: 200, 
    mattressLengthCM: 200, 
    ratingMember: 4.1, 
    affiliateLink: AFFILIATE_BASE_LINK + "Cabin4", 
    images: [
      // Lead Image for Card and Detail Page
      process.env.PUBLIC_URL + "/images/aframe-cabin-1-exterior.jpg",
      // Carousel Images
      process.env.PUBLIC_URL + "/images/aframe-cabin-2-interior.jpg",
    ],
    description: "Cozy cabin retreat. Watch out for the corner beams, but the main living area is spacious. Beds are standard King length.", 
    amenities: ["Woodland Setting", "Sauna", "Hiking Trails"],
    safetySolution: "Portal-Pillow", // NEW: Requires solution
  },
];

const MOCK_REVIEWS: Review[] = [
  { id: 1, propertyId: 1, reviewer: "Liam M.", date: "2025-10-10", rating: 5.0, comment: "Absolutely massive headspace! I'm 6'10\" and didn't duck once. The California King was perfect. A true haven." },
  { id: 2, propertyId: 1, reviewer: "Sarah T.", date: "2025-09-28", rating: 4.5, comment: "Beautiful barn conversion. Liam is right about the space. Only slight negative: the shower head was a tad low, but the rest was flawless." },
  { id: 3, propertyId: 2, reviewer: "Marcus J.", date: "2025-11-01", rating: 3.0, comment: "Cozy cottage. The low kitchen beam definitely requires caution, but the extra-long bed was worth it. As advertised." },
  { id: 4, propertyId: 3, reviewer: "Jessica V.", date: "2025-10-25", rating: 5.0, comment: "Peak luxury and space. I finally felt short! The best accommodation I've ever found for height. Worth the Elite Haven price." },
];

// --- MOCK MAP EMBEDS ---
// NOTE: These are static map placeholders (Google Maps 'share' embed code, simplified).
const MOCK_MAP_EMBEDS: { [key: number]: string } = {
  1: "https://maps.google.com/maps?q=Cotswold+Barn+Lodge&t=&z=14&ie=UTF8&iwloc=&output=embed", // Cotswold Barn Lodge
  2: "https://maps.google.com/maps?q=Scottish+Highlands+Cottage+Loch+Ness&t=&z=12&ie=UTF8&iwloc=&output=embed", // Highland Stone Cottage
  3: "https://maps.google.com/maps?q=Bristol+City+Centre+Loft&t=&z=15&ie=UTF8&iwloc=&output=embed", // Bristol Urban Loft
  4: "https://maps.google.com/maps?q=New+Forest+National+Park+Cabin&t=&z=13&ie=UTF8&iwloc=&output=embed", // New Forest A-Frame
};

// --- UNIVERSAL LAYOUT COMPONENTS ---

/**
 * STANDARD: A standardized container for all major page sections.
 */
const SectionContainer: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = "" }) => (
    <div className={`max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 ${className}`}>
        {children}
    </div>
);


// 1. Button Component
const Button: React.FC<ButtonProps> = ({children, onClick, color = "bg-red-600", className = "", type = "button", disabled}) => ( 
  <button
    onClick={onClick}
    type={type} 
    disabled={disabled}
    className={`px-6 py-3 font-semibold text-white transition-colors duration-200 ${color} rounded-lg shadow-md hover:bg-red-700 disabled:opacity-50 ${className}`}
  >
    {children}
  </button>
);

// 2. Header and Navigation (Around line 118)
const Header: React.FC<HeaderProps> = ({ navigate, currentPage }) => (
  <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-md">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
      
      {/* Container for Logo, Nav, AND Badge */}
      <div className="flex items-center justify-between w-full relative"> 
          
          {/* 1. LEFT SIDE: Logo Mark and Text (Always visible) */}
<div onClick={() => navigate("home")} className="flex items-center cursor-pointer gap-x-2 flex-shrink-0">
<div className="flex items-center">
<span className="h-6 w-0.5 bg-black" /><span className="text-2xl font-bold text-red-600 font-black">H</span><span className="h-6 w-0.5 bg-black" />
</div>
<span className="text-lg font-bold text-gray-800 tracking-wider uppercase font-serif sm:whitespace-nowrap">Headroom Havens</span>
</div>

          {/* 2. RIGHT SIDE CONTAINER: Nav + Search + Beta (Managed block) */}
          <div className="flex items-center space-x-3 md:space-x-4 lg:space-x-6"> 
            
{/* Navigation Links */}
{/* FIX: Changed 'hidden md:flex' to 'hidden lg:flex' to prevent overcrowding on landscape mobile */}
<nav className="hidden lg:flex justify-end space-x-3 md:space-x-4 lg:space-x-6">
{[{ path: "listings", label: "Find Havens" }, { path: "standard", label: "Our Standard" }, { path: "contact", label: "Contact Us" }]
.map(({ path, label }) => (
<button
key={path}
onClick={() => navigate(path)}
className={`text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
currentPage === path ? 'text-red-600 font-bold' : 'text-gray-600 hover:text-red-600'
}`}
>
{label}
</button>
))}
</nav>
          
            {/* BETA Badge (Always on the far right, uses small spacing from Nav) */}
            <div className="flex items-center relative group">
<span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg cursor-help transition-all duration-300 hover:scale-105 whitespace-nowrap flex-shrink-0">
BETA
</span>
                {/* Tooltip Popup on Hover */}
<div className="absolute right-2 top-full mt-2 w-48 bg-gray-800 text-white text-xs p-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
This site is currently using mock data and is in the Beta phase.
</div>
</div>
          
            {/* Search Button (Mobile Only, next to BETA badge) */}
            <button onClick={() => navigate("listings")} className="md:hidden p-2 text-gray-600 hover:text-red-600">
              <Search size={24} />
            </button>
            
          </div> {/* End of the RIGHT SIDE CONTAINER (starts at <div className="flex items-center space-x-3...") */}
          </div> {/* End of the flex items-center justify-between w-full relative div */}
        </div> {/* End of the max-w-7xl mx-auto px-4... div (The outer content wrapper) */}
    </header>
);

// 3. Footer Component
const Footer: React.FC = () => (
  <footer className="bg-gray-800 text-white mt-8">
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center">
      <p>© {new Date().getFullYear()} Headroom Havens. All rights reserved. </p>
      <p className="mt-2 text-xs text-gray-400">
        All bookings are processed via our verified affiliate partners.
      </p>
      {/* NEW: Re-open Consent Link */}
      <p className="mt-4 text-xs text-gray-500">
        {typeof window !== 'undefined' && localStorage.getItem('cookies-rejected') === 'true' && (
          <button 
            onClick={() => { 
              localStorage.removeItem('cookies-rejected'); // Clear the rejection flag
              window.location.reload(); // Force a full reload to re-run App state logic
            }}
            className="text-red-400 hover:text-red-500 underline font-semibold"
          >
            Re-open Cookie Consent
          </button>
        )}
      </p>
      </div>
  </footer>
);

// 4. Max Height Rating Logic Component (FIXED for alignment)
const MaxHeightDisplay: React.FC<{ clearanceCM: number }> = ({ clearanceCM }) => {
  const maxSafeHeightCM = clearanceCM - SAFETY_BUFFER_CM;
  const maxSafeHeightImperial = cmToFeetInches(maxSafeHeightCM);

  return (
    // Changed to items-start and space-x-1 to match others
    <div className="flex items-start text-red-600 font-semibold space-x-1 text-left">
      <Maximize size={18} className="flex-shrink-0 mt-0.5" />
      <span>Max Height Rating: {maxSafeHeightImperial} ({Math.round(maxSafeHeightCM)} cm)</span>
    </div>
  );
};

/**
 * 7. Property Card Component
 */
const PropertyCard: React.FC<{ property: Property, navigate: (path: string, propertyId: number) => void }> = ({ property, navigate }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition-transform duration-300 hover:shadow-2xl hover:-translate-y-1 h-full w-full text-left">
    <img src={property.images[0]} alt={property.name} className="w-full h-48 object-cover" /> 
    
    <div className="p-4 flex flex-col flex-grow text-left"> 
      <h3 className="text-xl font-bold text-gray-800">{property.name}</h3>
      <p className="text-sm text-gray-500 flex items-center mb-1">
        <Compass size={16} className="mr-1" />{property.location}
      </p>

      {/* Container: space-y-0 for no gaps, text-left for safety */}
      <div className="space-y-0 mb-4 text-sm flex-grow text-left"> 
        <MaxHeightDisplay clearanceCM={property.maxHeightCM} />

        <div className="flex items-start text-gray-600 space-x-1">
          <Bed size={18} className='mt-0.5 flex-shrink-0' />
          <span>Usable Bed Length: {cmToFeetInches(property.mattressLengthCM)} ({property.mattressLengthCM} cm) - 2 Beds</span>
        </div>

        <div className="flex items-start text-gray-600 space-x-1">
          <DollarSign size={18} className='mt-0.5 flex-shrink-0' />
          <span>Price Rating: {priceRangeToLabel(property.priceRange)}</span>
        </div>

        {property.safetySolution && (
          <div className="flex items-start text-red-600 font-medium space-x-1">
            <CheckCircle size={18} className='mt-0.5 flex-shrink-0' />
            <span>Safety Solutions: {property.safetySolution}</span>
          </div>
        )}
      </div>

      {/* mt-auto ensures the button sticks to the bottom */}
      <Button onClick={() => navigate("detail", property.id)} className="w-full text-center mt-auto" color="bg-red-600 hover:bg-red-700">View Details & Book</Button>
    </div>
  </div>
);


// 5. Home Page
const HomePage: React.FC<{ navigate: (path: string) => void, showInterestButton: boolean, onOpenInterestModal: () => void }> = ({ navigate, showInterestButton, onOpenInterestModal }) => ( // UPDATED SIGNATURE
  <div>
    {/* Hero Section */}
    {/* NEW: Set EXPLICIT height for mobile (h-[400px]) and desktop (sm:h-[500px]) */}
<div className="relative shadow-xl mb-8 h-[400px] sm:h-[500px] overflow-hidden">
img
<img src={HERO_IMAGE_URL} alt="Photorealistic Cottage Doorway with Tall Man" className="absolute inset-0 w-full h-full object-cover" />
<div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-center items-center text-center p-4 pb-10 z-10">
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight drop-shadow-lg">Holiday Cottages <span className="text-red-600">with Headroom</span></h1>
        <p className="mt-4 text-xl md:text-2xl text-white/90 drop-shadow-md">Verified head clearance and bed length. We're standing up for tall travelers to the UK & Europe.</p>
        {/* NEW Container for robust centering and width control on the button */}
        <div className="mt-6 w-11/12 max-w-sm"> 
          <Button 
            onClick={() => navigate("listings")} 
// Button now fills the width of the new container, using responsive padding/text
className="w-full text-center px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base"
>
<Search size={20} className="inline mr-2"/>Find a Place with Headroom
</Button>
</div>
</div>
</div>

{/* NEW: Standalone Button for Interest Registration (placed below the Hero for mobile visibility) */}
        {showInterestButton && (
            <div className="w-full -mt-12 sm:-mt-16 mb-6 relative z-30"> {/* Adjusted margin for mobile fit */}
<div className="max-w-xs mx-auto px-4">
<Button
onClick={onOpenInterestModal}
color="bg-red-600"
className="w-full text-center px-6 py-3 text-lg font-bold shadow-2xl hover:bg-red-700" // Animation removed
>
<span className="text-xl">Register Your Interest</span>
</Button>
</div>
</div>
)}

    {/* Value Proposition Section */}
    <SectionContainer className="py-6"> 
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">The Headroom Havens Standard</h2>
      {/* items-stretch makes columns fill the height of the tallest item */}
      <div className="flex flex-wrap lg:flex-nowrap justify-center gap-6 items-stretch mb-6">
        <div className="flex flex-col items-center text-center p-5 bg-white rounded-xl shadow-lg border-t-4 border-red-600 h-full w-full lg:w-1/3"> 
          <Maximize size={48} className="text-red-600 mb-3" /> 
          <h3 className="text-xl font-semibold mb-1">Verified Clearance</h3><p className="text-gray-600">Every door frame, ceiling, and beam is measured and confirmed against our safety buffer of 5 cm (2 in).</p> 
        </div>
        <div className="flex flex-col items-center text-center p-5 bg-white rounded-xl shadow-lg border-t-4 border-red-600 h-full w-full lg:w-1/3">
          <Bed size={48} className="text-red-600 mb-3" />
          <h3 className="text-xl font-semibold mb-1">Extra-Long Beds</h3><p className="text-gray-600">No more feet dangling. We only list properties with mattresses of 200 cm (6 ft 6 in) or longer, plus open footboards.</p>
        </div>
        <div className="flex flex-col items-center text-center p-5 bg-white rounded-xl shadow-lg border-t-4 border-red-600 h-full w-full lg:w-1/3">
          <CheckCircle size={48} className="text-red-600 mb-3" />
          <h3 className="text-xl font-semibold mb-1">High-End Curation</h3><p className="text-gray-600">A collection of boutique cottages and retreats across the UK and Europe, chosen for style and verified space.</p>
        </div>
      </div>
      <div className="text-center mt-6"> 
<Button onClick={() => navigate("standard")} color="bg-gray-700 hover:bg-gray-800"><span className="-mx-0.6">Learn How We Certify Properties</span>
</Button>
</div>
    </SectionContainer>

    {/* Featured Havens Teaser */}
    <SectionContainer className="py-6"> 
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Featured Havens</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch lg:-mx-6">{MOCK_PROPERTIES.slice(0, 3).map(property => <PropertyCard key={property.id} property={property} navigate={navigate} />)}</div>
    </SectionContainer>
  </div>
);

// 6. Listings Page
const ListingsPage: React.FC<{ navigate: (path: string, propertyId: number) => void }> = ({ navigate }) => {
  const [maxHeightFilter, setMaxHeightFilter] = useState<number>(0);
  const [priceFilter, setPriceFilter] = useState<number>(0);
  const [showLowHeadroom, setShowLowHeadroom] = useState<boolean>(false); // ⬅️ NEW STATE

  const MAX_HEIGHT_OPTIONS = [193, 198, 203, 208, 213, 218];
  const PRICE_OPTIONS = [1, 2, 4, 5]; 

  const BELOW_6_2_CM = 188; // 6 feet 2 inches

  const filteredProperties = useMemo(() => {
    return MOCK_PROPERTIES.filter(property => {
      const propertySafeHeightCM = property.maxHeightCM - SAFETY_BUFFER_CM;
      
      const heightPass = maxHeightFilter === 0 || propertySafeHeightCM >= maxHeightFilter;
      const pricePass = priceFilter === 0 || 
                         (priceFilter === 2 && (property.priceRange === 2 || property.priceRange === 3)) || 
                         property.priceRange === priceFilter;
      
      // NEW: Filter for low headroom properties
      const lowHeadroomPass = !showLowHeadroom || (propertySafeHeightCM < BELOW_6_2_CM);
      
      return heightPass && pricePass && lowHeadroomPass; // ⬅️ Must pass all conditions
    });
  }, [maxHeightFilter, priceFilter, showLowHeadroom]); // ⬅️ Include new state in dependency array

  return (
    <SectionContainer className="py-4"> 
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Find Your Headroom Haven</h1> 

      {/* Filters Section - Remains horizontally aligned */}
      <div className="bg-gray-100 p-4 rounded-xl shadow-md mb-6 flex flex-col md:flex-row md:items-end md:gap-4 space-y-4 relative z-20">
        <div className="w-full md:w-1/3">
          <label htmlFor="height-filter" className="block text-sm font-medium text-gray-700 mb-0">Minimum Headroom Required:</label>
          <select
             id="height-filter"
            value={maxHeightFilter}
            onChange={(e) => setMaxHeightFilter(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 bg-white cursor-pointer" 
          >
            <option value={0}>Any Height</option>
            {MAX_HEIGHT_OPTIONS.map(cm => (
              <option key={cm} value={cm}>
                {cmToFeetInches(cm)} ({cm} cm)
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-1/3">
          <label htmlFor="price-filter" className="block text-sm font-medium text-gray-700 mb-0">Price Range:</label>
          <select
             id="price-filter"
            value={priceFilter}
            onChange={(e) => setPriceFilter(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 bg-white cursor-pointer"
          >
            <option value={0}>Any Price</option>
            {PRICE_OPTIONS.map(p => (
              <option key={p} value={p}>
                {priceRangeToLabel(p)}
              </option>
            ))}
          </select>
        </div>
      </div>

<div className="w-full md:w-1/3 flex items-end h-full">
          <div className="flex items-center pt-2">
            <input
              id="low-headroom-filter"
              type="checkbox"
              checked={showLowHeadroom}
              onChange={(e) => setShowLowHeadroom(e.target.checked)}
              className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
<label htmlFor="low-headroom-filter" className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer">
Show Lower Headroom Havens with our Safety Solutions
</label>
</div>
</div>

      {/* Listings Grid */}
{filteredProperties.length > 0 ? (
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
{filteredProperties.map(property => (
<PropertyCard key={property.id} property={property} navigate={navigate} />
))}
</div>
) : (
<div className="text-center py-10 bg-white rounded-xl shadow-lg">
<h2 className="text-xl font-semibold text-gray-600">No Havens match your criteria.</h2>
<p className="text-gray-500 mt-2">Try adjusting your minimum height or price range.</p>
</div>
      )}
    </SectionContainer>
  );
};

// --- NEW COMPONENT: Booking Data Capture Modal (Must be defined before DetailPage) ---
const BookingDataCaptureModal: React.FC<{
property: Property;
onClose: () => void;
onSuccess: (data: BookingData) => void;
}> = ({ property, onClose, onSuccess }) => {
const HEIGHT_DEFAULT_CM = 193;
const [formData, setFormData] = useState<BookingData>({
name: '',
email: '',
height: HEIGHT_DEFAULT_CM,
});
const [isSubmitting, setIsSubmitting] = useState(false);
const [consentGiven, setConsentGiven] = useState(false);
const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
const { name, value } = e.target;
setFormData((prev) => ({
...prev,
[name]: name === 'height' ? Number(value) : value,
}));
};
const handleConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
setConsentGiven(e.target.checked);
};
const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
setIsSubmitting(true);
const encode = (data: any) => {
return Object.keys(data)
.map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
.join("&");
}
const netlifyFormData = {
"form-name": "booking-lead",
...formData,
propertyId: property.id,
propertyName: property.name,
};
try {
const response = await fetch("/", {
method: "POST",
headers: { "Content-Type": "application/x-www-form-urlencoded" },
body: encode(netlifyFormData)
});
if (response.ok) {
console.log("Netlify Form submission successful. Redirecting.");
onSuccess(formData);
} else {
throw new Error(`Netlify submission failed with status: ${response.status}`);
}
} catch (error) {
console.error("Form submission error:", error);
alert("There was an error capturing your details. Please try again.");
setIsSubmitting(false);
}
};
return (
<div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto" onClick={onClose}>
<div className="flex min-h-full items-center justify-center p-4">
<div
className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all relative"
onClick={(e) => e.stopPropagation()}
>
<div className="p-6">
<h3 className="text-2xl font-bold text-gray-800 mb-1">Verify Your Booking Details</h3>
<p className="text-sm text-gray-600 mb-4">Just a quick step to secure your height-verified data before redirecting to our partner site.</p>
<form
name="booking-lead"
method="POST"
data-netlify="true"
action="/"
onSubmit={handleSubmit}
className="space-y-4"
>
<input type="hidden" name="form-name" value="booking-lead" />
<input type="hidden" name="honeypot" />
<div>
<label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
<input type="text" id="name" name="name" required value={formData.name} onChange={handleChange}
className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-600 focus:border-red-600"
disabled={isSubmitting}/>
</div>
<div>
<label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
<input type="email" id="email" name="email" required value={formData.email} onChange={handleChange}
className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-600 focus:border-red-600"
disabled={isSubmitting}/>
</div>
<div>
<label htmlFor="height" className="block text-sm font-medium text-gray-700">Your Rough Height (for recommendations)</label>
<select id="height" name="height" required value={formData.height} onChange={handleChange}
className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-600 focus:border-red-600 bg-white"
disabled={isSubmitting}
>
{HEIGHT_OPTIONS_CM.map(cm => (
<option key={cm} value={cm}>
{cmToFeetInches(cm)} ({cm} cm)
</option>
))}
</select>
</div>
<div className="flex items-start pt-2">
<input
id="booking-consent"
type="checkbox"
required
checked={consentGiven}
onChange={handleConsentChange}
className="h-4 w-4 mt-1 text-red-600 border-gray-300 rounded focus:ring-red-500 flex-shrink-0"
disabled={isSubmitting}
/>
<label htmlFor="booking-consent" className="ml-3 block text-sm text-gray-700 cursor-pointer">
I consent to Headroom Havens collecting my name, email, and height for their email updates, and I agree to the <a href="/privacy-policy" target="_blank" className="font-semibold underline text-red-600 hover:text-red-700">Privacy Policy</a>.
</label>
</div>
<div className="flex justify-end space-x-3 pt-2">
<Button type="button" onClick={onClose} color="bg-gray-400 hover:bg-gray-500" disabled={isSubmitting}>
Cancel
</Button>
<Button type="submit" disabled={isSubmitting || !consentGiven} className="flex items-center justify-center">
{isSubmitting ? (
<>
<svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="30, 200" fill="none"></circle></svg>
Processing...
</>
):(
<span className="whitespace-nowrap">
Go to Booking Partner <ChevronRight size={18} className="ml-1" />
</span>
)}
</Button>
</div>
</form>
</div>
</div>
</div>
</div>
);
};

// --- NEW COMPONENT: Interest Capture Modal (General Lead Gen) ---
interface InterestCaptureData {
  name: string;
  email: string;
  height: number; // Stored in CM
}

// Global flag key for local storage
const INTEREST_CAPTURED_KEY = 'interest-captured';
const INTEREST_CLOSED_KEY = 'interest-closed-date';

const InterestCaptureModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const HEIGHT_DEFAULT_CM = 193; // 6'4"
  const [formData, setFormData] = useState<InterestCaptureData>({
    name: '',
    email: '',
    height: HEIGHT_DEFAULT_CM,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'height' ? Number(value) : value,
    }));
  };

  const handleConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConsentGiven(e.target.checked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const encode = (data: any) => {
      return Object.keys(data)
        .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
        .join("&");
    }

    const netlifyFormData = {
      "form-name": "interest-capture",
      ...formData,
    };

    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode(netlifyFormData)
      });

      if (response.ok) {
        console.log("Interest Capture submission successful.");
        localStorage.setItem(INTEREST_CAPTURED_KEY, 'true');
        onSuccess();
      } else {
        throw new Error(`Netlify submission failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      alert("There was an error capturing your details. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Function to handle modal closure (either by X or backdrop)
  const handleClose = () => {
      localStorage.setItem(INTEREST_CLOSED_KEY, new Date().toISOString());
      onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[1100] overflow-y-auto backdrop-blur-sm" onClick={handleClose}>
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all relative border-t-8 border-red-600 animate-in fade-in zoom-in-50 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
              onClick={handleClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 p-1"
              disabled={isSubmitting}
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
          </button>

          <div className="p-6">
            <h3 className="text-3xl font-black text-red-600 mb-1 leading-tight">Stand Tall with Us! 📏</h3>
           {/* CATCHY BLURB */}
<p className="text-lg font-semibold text-gray-800 mb-4">
  Ever feel like Gandalf in a Hobbit hole?
</p>
<p className="text-sm text-gray-600 mb-5">
  We're charting demand to launch our full service! If you'd use Headroom Havens, let us know and we'll keep you updated on new listings and services. 
  {" "}Please also fill in <a href="https://forms.gle/WwW8NVZmBAxsczB39" target="_blank" rel="noopener noreferrer" className="font-bold text-red-600 underline hover:text-red-700">THIS</a> survey to help us gauge our potential market interest.
</p>
            <form
              name="interest-capture"
              method="POST"
              data-netlify="true"
              action="/"
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <input type="hidden" name="form-name" value="interest-capture" />
              <input type="hidden" name="honeypot" />
              <div>
                <label htmlFor="name-interest" className="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" id="name-interest" name="name" required value={formData.name} onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-600 focus:border-red-600"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="email-interest" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input type="email" id="email-interest" name="email" required value={formData.email} onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-600 focus:border-red-600"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="height-interest" className="block text-sm font-medium text-gray-700">Your Rough Height</label>
                <select id="height-interest" name="height" required value={formData.height} onChange={handleChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-600 focus:border-red-600 bg-white"
                  disabled={isSubmitting}
                >
                  {HEIGHT_OPTIONS_CM.map(cm => (
                    <option key={cm} value={cm}>
                      {cmToFeetInches(cm)} ({cm} cm)
                    </option>
                  ))}
                </select>
              </div>
              {/* GDPR CONSENT NOTE */}
              <div className="flex items-start pt-2">
                <input
                  id="interest-consent"
                  type="checkbox"
                  required
                  checked={consentGiven}
                  onChange={handleConsentChange}
                  className="h-4 w-4 mt-1 text-red-600 border-gray-300 rounded focus:ring-red-500 flex-shrink-0"
                  disabled={isSubmitting}
                />
                <label htmlFor="interest-consent" className="ml-3 block text-xs text-gray-500 cursor-pointer">
                  I consent to Headroom Havens collecting my data to keep me updated on future services, as detailed in the <a href="/privacy-policy" target="_blank" className="font-semibold underline text-red-600 hover:text-red-700">Privacy Policy</a>.
                </label>
              </div>
              <div className="pt-2">
                <Button type="submit" disabled={isSubmitting || !consentGiven} className="w-full flex items-center justify-center">
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="30, 200" fill="none"></circle></svg>
                      Submitting...
                    </>
                  ) : (
                    'Count Me In! (Submit Interest)'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- NEW COMPONENT: Review Submission Modal (Must be defined before DetailPage) ---
const SubmitReviewModal: React.FC<{
property: Property;
onClose: () => void;
}> = ({ property, onClose }) => {
const [formData, setFormData] = useState<ReviewData>({
reviewer: '',
email: '',
rating: 5,
comment: '',
});
const [isSubmitting, setIsSubmitting] = useState(false);
const [isSubmitted, setIsSubmitted] = useState(false);
const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
const { name, value } = e.target;
setFormData((prev) => ({
...prev,
[name]: name === 'rating' ? Number(value) : value,
}));
};
const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
setIsSubmitting(true);
const encode = (data: any) => {
return Object.keys(data)
.map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
.join("&");
}
const netlifyFormData = {
"form-name": "member-review",
...formData,
propertyId: property.id,
propertyName: property.name,
date: new Date().toISOString().slice(0, 10),
};
try {
const response = await fetch("/", {
method: "POST",
headers: { "Content-Type": "application/x-www-form-urlencoded" },
body: encode(netlifyFormData)
});
if (response.ok) {
setIsSubmitted(true);
} else {
throw new Error(`Netlify submission failed with status: ${response.status}`);
}
} catch (error) {
console.error("Review submission error:", error);
alert("There was an error submitting your review. Please try again.");
setIsSubmitting(false);
}
};
if (isSubmitted) {
return (
<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
<div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 text-center" onClick={(e) => e.stopPropagation()}>
<CheckCircle size={48} className="text-green-600 mx-auto mb-4" />
<h3 className="text-2xl font-bold mb-2">Review Submitted!</h3>
<p className="text-gray-600 mb-4">Thank you for sharing your experience. We will verify your rating and publish it soon.</p>
<Button onClick={onClose}>Close</Button>
</div>
</div>
);
}
return (
<div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto" onClick={onClose}>
<div className="flex min-h-full items-center justify-center p-4">
<div
className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all relative"
onClick={(e) => e.stopPropagation()}
>
<div className="p-6">
<h3 className="text-2xl font-bold text-gray-800 mb-1">Submit Your Rating</h3>
<p className="text-sm text-gray-600 mb-4">Help the community by rating your stay at {property.name}.</p>
<form
name="member-review"
method="POST"
data-netlify="true"
action="/"
onSubmit={handleSubmit}
className="space-y-4"
>
<input type="hidden" name="form-name" value="member-review" />
<input type="hidden" name="honeypot" />
<div>
<label htmlFor="reviewer" className="block text-sm font-medium text-gray-700">Name (e.g., John D.)</label>
<input type="text" id="reviewer" name="reviewer" required value={formData.reviewer} onChange={handleChange}
className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-600 focus:border-red-600"
disabled={isSubmitting}
/>
</div>
<div>
<label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (Private, for verification)</label>
<input type="email" id="email" name="email" required value={formData.email} onChange={handleChange}
className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-600 focus:border-red-600"
disabled={isSubmitting}
/>
</div>
<div className='flex space-x-4'>
<div className='w-1/3'>
<label htmlFor="rating" className="block text-sm font-medium text-gray-700">Rating (1-5)</label>
<select id="rating" name="rating" required value={formData.rating} onChange={handleChange}
className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-600 focus:border-red-600 bg-white"
disabled={isSubmitting}
>
{[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r}</option>)}
</select>
</div>
<div className='w-2/3'>
<label htmlFor="comment" className="block text-sm font-medium text-gray-700">Comment</label>
<textarea name="comment" id="comment" rows={3} required value={formData.comment} onChange={handleChange}
className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
disabled={isSubmitting}
></textarea>
</div>
</div>
<div className="flex justify-end space-x-3 pt-2">
<Button type="button" onClick={onClose} color="bg-gray-400 hover:bg-gray-500" disabled={isSubmitting}>
Cancel
</Button>
<Button type="submit" disabled={isSubmitting} className="flex items-center justify-center">
{isSubmitting ? (
<>
<svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="30, 200" fill="none"></circle></svg>
Submitting...
</>
):(
'Submit Rating'
)}
</Button>
</div>
</form>
</div>
</div>
</div>
</div>
);
};

// --- NEW COMPONENT: Cookie Consent Banner ---
// Update props to include onReject
const CookieConsentBanner: React.FC<{ onAccept: () => void, onReject: () => void }> = ({ onAccept, onReject }) => {
  return (
    // Fixed bottom position, high z-index to overlay content
    <div className="fixed bottom-0 left-0 w-full bg-gray-900 text-white p-4 z-[1000] shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-6">
        
        {/* Text Content */}
        <p className="text-sm text-center sm:text-left flex-grow">
We use essential cookies and collect form data for lead generation and analytics to improve our service. By clicking 'Accept & Continue' you consent to our use of these technologies. View our <a href="/privacy-policy" target="_blank" className="font-bold underline text-red-400 hover:text-red-500">Privacy Policy</a>.
        </p>

        {/* Buttons */}
        <div className="flex space-x-3 flex-shrink-0">
          <Button 
            onClick={onAccept} 
            color="bg-red-600 hover:bg-red-700" 
            className="text-sm px-4 py-2"
>
Accept & Continue
</Button>
          <Button 
            onClick={onReject} // ⬅️ UPDATED TO CALL onReject
            color="bg-gray-700 hover:bg-gray-800" 
            className="text-sm px-4 py-2"
>
Reject All
</Button>
        </div>
      </div>
    </div>
  );
};

// 8. Property Detail Page
const DetailPage: React.FC<{ property: Property, navigate: (path: string, propertyId: number | null) => void }> = ({ property, navigate }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0); 
  const [showModal, setShowModal] = useState(false); // Controls the booking modal visibility
  const [showReviewModal, setShowReviewModal] = useState(false); // Controls the review modal visibility
  
  // Function to open the booking modal when 'Book Now' is clicked
  const handleInitialBookClick = () => {
    setShowModal(true);
  };

  // Function executed after data is successfully captured in the modal (redirects to partner)
  const handleAffiliateRedirect = (data: BookingData) => {
      setShowModal(false);
      // Actual redirect to the partner site
      console.log(`Redirecting to affiliate link: ${property.affiliateLink}`);
      window.location.href = property.affiliateLink;
  };


  const totalImages = property.images.length;
  const currentImage = property.images[currentImageIndex];

  const goToNext = () => setCurrentImageIndex((prev) => (prev + 1) % totalImages);
  const goToPrev = () => setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);

  // Calculate Max Safe Height for display
  const maxSafeHeightCM = property.maxHeightCM - SAFETY_BUFFER_CM;
  const maxSafeHeightImperial = cmToFeetInches(maxSafeHeightCM);
  // Get Price Label for the bottom section
  const priceLabel = priceRangeToLabel(property.priceRange);

  // Get the map embed URL using the property ID
  const mapEmbedUrl = MOCK_MAP_EMBEDS[property.id];


  return (
    <SectionContainer className="py-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2 text-left">{property.name}</h1>
        <p className="text-xl text-gray-500 mb-4 text-left">{property.location}</p> 

        {/* Image Carousel - Full Width and Centered */}
        <div className="relative w-full aspect-video rounded-xl shadow-lg overflow-hidden mb-6"> 
          <img 
            src={currentImage} 
            alt={`${property.name} photo ${currentImageIndex + 1}`} 
            className="w-full h-full object-cover transition-opacity duration-300" 
          />
          
          {totalImages > 1 && (
            <>
              <button 
                onClick={goToPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors z-10 drop-shadow-sm"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={goToNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors z-10 drop-shadow-sm"
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>
              <div className="absolute bottom-3 right-3 text-white bg-black/50 text-xs px-3 py-1 rounded-full z-10">
                {currentImageIndex + 1} / {totalImages}
              </div>
            </>
          )}
        </div>

          {/* Details - Headroom Certified Dimensions */}
<div className="bg-white p-5 rounded-xl shadow-lg mb-6"> 
  <h2 className="text-2xl font-bold text-red-600 mb-3 flex items-center">
    <Maximize size={24} className="mr-2" />
    Headroom Certified Details
  </h2>
  
  <p className="text-gray-700 mb-4">{property.description}</p>

  {/* FIXED: gap-0 removes spacing between rows; items-start ensures left alignment */}
  <div className="flex flex-col gap-0 text-lg"> 
    
    {/* Row 1: Actual Lowest Clearance */}
    <div className="flex items-baseline">
      <span className="font-semibold mr-2 whitespace-nowrap">Actual Lowest Clearance:</span>
      <span className="text-gray-800">{cmToFeetInches(property.maxHeightCM)} ({property.maxHeightCM} cm)</span>
    </div>

    {/* Row 2: Max Height Rating */}
    <div className="flex items-baseline">
      <span className="font-semibold mr-2 whitespace-nowrap">Max Height Rating:</span>
      <span className="text-gray-800">{maxSafeHeightImperial} ({Math.round(maxSafeHeightCM)} cm)</span>
    </div>

    {/* Row 3: Usable Bed Length */}
    <div className="flex items-baseline">
      <span className="font-semibold mr-2 whitespace-nowrap">Usable Bed Length:</span>
      <span className="text-gray-800">{cmToFeetInches(property.mattressLengthCM)} ({property.mattressLengthCM} cm) - 2 Beds (1 footboard)</span>
    </div>

    {/* Row 4: Safety Solution */}
    {property.safetySolution && (
      <div className="flex items-baseline">
        <span className="font-semibold mr-2 whitespace-nowrap">Safety Solutions:</span>
        <span className='font-medium text-red-600'>{property.safetySolution}</span>
      </div>
    )}

  </div>
</div>

          {/* Google Map Embed (Updated to use iframe) */}
          <div className="h-[400px] w-full rounded-xl shadow-lg mb-6 overflow-hidden border border-gray-300"> 
            <iframe 
                src={mapEmbedUrl}
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title={`Map of ${property.name} in ${property.location}`}
            ></iframe>
          </div>

{/* Member Rating & Booking (ALIGNMENT FIX: items-stretch and h-full for equal column heights) */}
<div className="grid md:grid-cols-3 gap-4 items-stretch">
<div className="md:col-span-2 bg-gray-50 p-5 rounded-xl border border-gray-200 h-full flex flex-col order-2">
<h3 className="text-xl font-semibold mb-1">Member Comfort Rating</h3>
{/* Use flex to put rating number and details side-by-side (from step 1) */}
<div className="flex items-start justify-between gap-4 mt-1"> 
{/* Rating Number Stacked: */}
<div className="flex flex-col">
<p className="text-4xl font-bold text-green-600">{property.ratingMember.toFixed(1)}</p>
<span className="text-sm font-medium text-gray-500 self-start -mt-2">out of 5</span>
<button 
onClick={() => navigate("reviews", property.id)} 
className="text-red-600 text-sm underline hover:text-red-700 self-start font-semibold"
>See Guest Reviews</button>
</div>

{/* Supporting Text with Submit Link */}
<div className="text-left text-sm text-gray-500 flex-grow">
<p>Based on feedback from verified tall guests. All ratings are admin-approved for integrity. 
<button 
type="button" 
onClick={() => setShowReviewModal(true)} 
className="font-bold text-red-600 cursor-pointer hover:underline ml-1">SUBMIT YOUR RATING
</button>
</p>
</div>
</div>
</div>
{/* Booking Box */}
<div className="md:col-span-1 flex flex-col justify-center items-center p-5 bg-red-100 rounded-xl shadow-inner h-full order-1">
<p className="text-sm text-gray-700 mb-3 text-center">Ready to book your stress-free stay?</p>
{/* Button now opens the modal */}<Button onClick={handleInitialBookClick} className="w-full text-center"><CheckCircle size={20} className="inline mr-2"/>Book Now via Partner</Button>
<p className="text-xs mt-2 text-gray-500 text-center">Booking and commission handled securely by affiliate partner.</p>
</div>
</div>
</div>

    {/* NEW: Booking Modal integration */}
    {showModal && (
        <BookingDataCaptureModal
            property={property}
            onClose={() => setShowModal(false)}
            onSuccess={handleAffiliateRedirect}
        />
    )}
    
    {/* NEW: Review Modal integration */}
    {showReviewModal && (
        <SubmitReviewModal
            property={property}
            onClose={() => setShowReviewModal(false)}
        />
    )}
    </SectionContainer>
  );
};


// Price Tiers Table Component
const PriceTiersTable: React.FC = () => {
    const tiers = [
        { tier: '$', name: 'Comfort', rationale: 'Simple, reliable, value-focused accommodation.' },
        { tier: '$$', name: 'Boutique', rationale: 'High-style, verified quality, excellent value.' },
        { tier: '$$$', name: 'Luxury', rationale: 'Exclusive service, high-end design, premium locations.' },
        { tier: '$$$$', name: 'Elite Haven', rationale: 'Architectural masterpieces, private staff, top-tier clearance.' },
    ];

    return (
<div className="mb-8 p-5 bg-white rounded-xl shadow-lg border-t-4 border-red-600 text-left">
<h2 className="text-2xl font-semibold text-gray-800 mb-3 flex items-center"><DollarSign size={24} className="mr-2 text-red-600" />Price Tier Guide</h2>
<div className="overflow-x-auto">
<table className="min-w-full divide-y divide-gray-200">
<thead className="bg-gray-50">
<tr>
<th scope="col" className="px-3 py-1 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-1/12">Tier</th>
<th scope="col" className="px-3 py-1 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-2/12">Name</th>
<th scope="col" className="px-3 py-1 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-8/12">Rationale</th>
</tr>
</thead>
<tbody className="bg-white divide-y divide-gray-200">
{tiers.map((tier, index) => (
<tr key={index} className="hover:bg-red-50 transition-colors">
<td className="px-3 py-1 whitespace-nowrap text-sm font-medium text-red-600 text-center">{tier.tier}</td>
<td className="px-3 py-1 whitespace-nowrap text-sm font-semibold text-gray-800">{tier.name}</td>
<td className="px-3 py-1 text-sm text-gray-600">{tier.rationale}</td>
</tr>
))}
</tbody>
</table>
</div>
</div>
);
};


// 9. Headroom Standard Page

// *** No import statement is needed for public folder assets ***

const StandardPage: React.FC = () => (
<SectionContainer>
<div className="max-w-4xl mx-auto">
<h1 className="text-4xl font-bold text-gray-800 mb-4 text-left">Our Standard: Why We Certify</h1> 
<p className="text-xl text-gray-600 mb-8 text-left">We eliminate the anxiety of travel for tall guests by applying a stringent, verifiable certification process to every property.</p>

      {/* 1. Section: The Certification Process with Image Background */}
      <div 
        className="relative flex items-center justify-start min-h-[500px] mb-8 overflow-hidden rounded-xl shadow-lg"
      >
        {/* Background Image with dark overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${process.env.PUBLIC_URL + "/images/ManProfileImage.jpg"})`,
            backgroundPositionX: '45%' 
          }}
        >
          <div className="absolute inset-0 bg-black opacity-40"></div>
        </div>

        {/* Content Overlay - Removed left padding (pl-0) but kept vertical and right padding */}
        <div className="relative z-10 w-full py-6 pr-6 sm:py-10 sm:pr-10 md:py-12 md:pr-12 text-left">
          
 {/* B. The Certification Process: Heading has pl-6 to visually align it with A. heading */}
<h2 className="text-2xl font-bold text-white mb-6 pl-6 sm:pl-10 md:pl-12">The Certification Process: Photo Proof</h2>
          
          {/* Three certification items: ml-0 ensures they start right at the left edge of the content box */}
          <div className="flex flex-col space-y-6 md:space-y-8 max-w-sm ml-0">
              <div className="flex items-start space-x-4 text-white">
                  <Maximize size={36} className="text-white flex-shrink-0 mt-1" />
                  <div><h3 className="text-xl font-semibold">Vetting Measurements</h3><p className="text-gray-100 text-base">Property owners must submit the actual measurement of the lowest possible point for every area: main doors, bathroom entrances, and structural beams.</p></div>
              </div>
              <div className="flex items-start space-x-4 text-white">
                  <Search size={36} className="text-white flex-shrink-0 mt-1" />
                  <div><h3 className="text-xl font-semibold">The Photo Verification</h3><p className="text-gray-100 text-base">The most important step: We personally visit each property to measure the low points or the owner must submit <strong>photo evidence</strong> showing the measured full height of them.</p></div>
              </div>
              <div className="flex items-start space-x-4 text-white">
                  <Bed size={36} className="text-white flex-shrink-0 mt-1" />
                  <div><h3 className="text-xl font-semibold">Bed Length Verification</h3><p className="text-gray-100 text-base">We verify usable mattress length (excluding frames/footboards). Only mattresses of <strong>200 cm (6 ft 6 in)</strong> or longer qualify for listing on our site.</p></div>
              </div>
          </div>
        </div>
        </div> 
     
      {/* 2. Section: The Safety Buffer (MOVED) */}
<div className="mb-8 p-5 bg-red-50 rounded-xl border border-red-200 text-left"> 
<h2 className="text-2xl font-semibold text-red-600 mb-3">The Safety Buffer (5cm Rule)</h2>
<p className="mb-1 text-gray-700">A property must have a minimum measured clearance of <strong>6 ft 7 in (201 cm)</strong> for a guest to be rated at <strong>6 ft 5 in (196 cm)</strong>. Why?</p>
<ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
<li><strong>Dynamic Movement:</strong> When we walk, our bodies slightly lifts off the ground at the push-off point of a stride. This requires approximately 5cm or 2in of vertical clearance.</li>
<li><strong>Our Guarantee:</strong> We subtract a mandatory <strong>5cm (2in) safety buffer</strong> from the lowest measured point (door, beam, ceiling) to determine the property's true <strong>Max Height Rating</strong>.</li>
<li><strong>No Surprises:</strong> A property rated at <strong>6ft 6in (198 cm)</strong> means a 6ft 6in guest can walk around without fear of whacking their head on a door frame or beam.</li>
</ul>
</div>
     
      {/* 3. Section: Price Tier Guide (The New Table) */}
      <PriceTiersTable />
    </div>
{/* 4. Section: Headroom Haven Safety Solutions (Q5: Wrapped inside the max-w-4xl div) */}
<div className="max-w-4xl mx-auto">
<div className="mb-8 p-5 bg-red-50 rounded-xl border border-red-200 text-left">
<h2 className="text-2xl font-semibold text-red-600 mb-3 flex items-center">
<CheckCircle size={24} className="mr-2" /> Headroom Havens Safety Solutions
</h2>
<p className="mb-4 text-gray-700">
Properties certified with a Max Height Rating below 6'2" (188 cm) are valuable historic or rustic accommodations that would typically be inaccessible to tall travelers. These properties are listed only after we have installed our Headroom Havens Safety Solutions to ensure comfortable and stress-free movement around a property.
</p>
<h3 className="text-xl font-bold text-gray-800 mb-2">Some of our Installed Protective Devices:</h3>
<ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
<li>
<strong className="text-red-600">Sentinel Swing:</strong>
<span className="ml-2">Proactive warning system (luminous sphere) suspended from low-points to provide a gentle, peripheral sight/touch alert before impact.</span>
</li>
<li>
<strong className="text-red-600">Haven-Wrap:</strong> {/* Q1: TM Removed */}
<span className="ml-2">Cushioning C-channel foam professionally applied to low-hanging ceiling beams and structural elements for high-impact protection.</span>
</li>
<li>
<strong className="text-red-600">Portal-Pillow:</strong>
<span className="ml-2">Thick, semi-circular foam strip installed on the top interior edges of low doorway frames to soften accidental contact.</span>
</li>
</ul>
</div>
</div>
  </SectionContainer>
);

// --- NEW COMPONENT: Privacy Policy Page (Detailed & Compliant Template) ---
const PrivacyPolicyPage: React.FC = () => (
<SectionContainer>
<div className="max-w-4xl mx-auto py-8">
<h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">Privacy Policy</h1>
<p className="text-lg text-gray-600 mb-6 text-center">Last Updated: November 2025</p>

            <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-red-600 space-y-6 text-left">
                <h2 className="text-2xl font-bold text-gray-800">1. Introduction</h2>
                <p>
                    Headroom Havens ("we," "us," or "our") is dedicated to protecting the privacy of tall travelers. This policy explains how we collect, use, and process your personal data in compliance with the UK General Data Protection Regulation (UK GDPR) and the EU General Data Protection Regulation (GDPR).
                </p>

                <h2 className="text-2xl font-bold text-gray-800 pt-4">2. Data We Collect and Why (Lawful Basis)</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Source / Type of Data</th>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Purpose of Processing</th>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Lawful Basis (UK/EU GDPR)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            <tr className="hover:bg-red-50">
                                <td className="px-3 py-2 text-sm font-medium">Name, Email, Phone (from Contact Form)</td>
                                <td className="px-3 py-2 text-sm">To respond to your specific enquiries, manage partnerships, and provide customer support.</td>
                                <td className="px-3 py-2 text-sm">Legitimate Interests (Responding to user requests)</td>
                            </tr>
                            <tr className="hover:bg-red-50">
                                <td className="px-3 py-2 text-sm font-medium">Name, Email, Height (from Booking Modal)</td>
                                <td className="px-3 py-2 text-sm">To generate a lead profile before redirecting to our affiliate partner, enabling us to track user demographics for service improvement.</td>
                                <td className="px-3 py-2 text-sm">Consent (Given prior to submission)</td>
                            </tr>
                            <tr className="hover:bg-red-50">
                                <td className="px-3 py-2 text-sm font-medium">Reviewer Name, Email, Comment, Rating (from Review Form)</td>
                                <td className="px-3 py-2 text-sm">To verify user experience and publish the review (Name/Comment/Rating) on the website. Email is stored privately for verification purposes.</td>
                                <td className="px-3 py-2 text-sm">Consent (Given prior to submission)</td>
                            </tr>
                            <tr className="hover:bg-red-50">
                                <td className="px-3 py-2 text-sm font-medium">Cookie/Local Storage Data (Consent Flag)</td>
                                <td className="px-3 py-2 text-sm">To remember your cookie preference, ensuring you don't see the banner on every visit.</td>
                                <td className="px-3 py-2 text-sm">Contractual Obligation / Legitimate Interest (Service function)</td>
                            </tr>
                            <tr className="hover:bg-red-50">
                                <td className="px-3 py-2 text-sm font-medium">Affiliate Tracking IDs/Cookies (by Partner)</td>
                                <td className="px-3 py-2 text-sm">To track commission payments when you click a 'Book Now' link and proceed to book on the partner's site.</td>
                                <td className="px-3 py-2 text-sm">Consent (Implicitly accepted by clicking 'Accept' on banner)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 pt-4">3. Data Sharing and Affiliate Links</h2>
                <p>
                    When you click the "Book Now via Partner" button on our Detail Pages, you are immediately redirected to a third-party affiliate booking site (e.g., <span className="font-semibold">partner-booking-site.com</span>).
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>No PII Transfer: We do not share the Name, Email, or Height data collected in our modal with the affiliate partner.</li>
                    <li>Affiliate Tracking: The affiliate partner will immediately place an affiliate tracking cookie on your device to record that your referral came from Headroom Havens. This cookie is governed by the affiliate partner's own privacy policy.</li>
                    <li>Third-Party Policy: We encourage you to review the Privacy Policy of the affiliate partner before making any bookings. We are not responsible for their data handling practices.</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-800 pt-4">4. Your Rights (Data Subject Rights)</h2>
                <p>Under GDPR/UK GDPR, you have the following rights regarding the personal data we hold about you:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>The Right to Be Informed: To be informed about how your data is processed (this policy).</li>
                    <li>The Right of Access: To request a copy of the personal data we hold about you.</li>
                    <li>The Right to Rectification: To have inaccurate data corrected.</li>
                    <li>The Right to Erasure ("Right to Be Forgotten"): To request the deletion of your personal data where there is no longer a necessary purpose for us to process it (e.g., lead/review data).</li>
                    <li>The Right to Object: To object to processing based on 'Legitimate Interests' (e.g., contact form follow-up).</li>
                    <li>The Right to Withdraw Consent: To withdraw consent for processing that is based on consent (e.g., booking lead data).</li>
                </ul>
                <p>To exercise any of these rights, please contact us using the details provided below.</p>

                <h2 className="text-2xl font-bold text-gray-800 pt-4">5. Contact Us</h2>
                <p>
                    If you have any questions about this Privacy Policy or your data rights, please contact us:
                </p>
                <p className="font-semibold ml-4">Email: headroomhavens@gmail.com<br/>Address: Greenights Ltd. 15 Ford Park Crescent, Ulverston, England, LA12 7JR</p>
            </div>
        </div>
    </SectionContainer>
);


// 10. Reviews Page
interface ReviewsPageProps {
  property: Property;
}

const ReviewsPage: React.FC<ReviewsPageProps> = ({ property }) => {
  const reviews = MOCK_REVIEWS.filter(r => r.propertyId === property.id);

  return (
    <SectionContainer className="py-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Guest Reviews for {property.name}</h1>
        <p className="text-xl text-gray-500 mb-6 font-semibold">{reviews.length} Verified Reviews</p>

        <div className="space-y-6">
          {reviews.length > 0 ? (
            reviews.map(review => (
              <div key={review.id} className="bg-white p-5 rounded-xl shadow-lg border-l-4 border-red-600">
<div className="flex items-baseline space-x-4 mb-2"><p className="font-bold text-gray-800 text-lg">{review.reviewer}</p>
<span className="text-xl font-bold text-green-600">{review.rating.toFixed(1)} / 5</span>
<span className="text-sm text-gray-500">({formatDate(review.date)})</span></div>
{/* Review Comment Text */}
<p className="text-gray-700 italic mt-3 border-t pt-3 border-gray-100">"{review.comment}"</p></div>
            ))
          ) : (
            <div className="text-center py-10 bg-white rounded-xl shadow-lg">
                <p className="text-gray-600">Be the first to review this Headroom Haven!</p>
            </div>
          )}
        </div>
                      </div>
    </SectionContainer>
  );
};

// 11. Contact Page
const ContactPage: React.FC = () => {
    return (
        <> {/* ⬅️ START of React Fragment to allow multiple top-level elements */}
            <SectionContainer> 
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">Contact Us</h1><p className="text-xl text-gray-600 mb-8 text-center">We're standing up for tall travelers. Get in touch with our team, or register your interest in our future.</p> 

                    <form 
    name="contact" 
    method="POST" 
    data-netlify="true"
    action="/" // ⬅️ Directs back to the root of the site (Homepage)
    className="space-y-4 p-5 bg-white rounded-xl shadow-lg border-t-4 border-red-600 mx-auto mb-4" 
>
    <input type="hidden" name="form-name" value="contact" />
    <input type="hidden" name="honeypot" /> {/* ⬅️ Honeypot for spam prevention */}

                        <div className="space-y-1"><label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label><input
                            type="text"
                            name="name"
                            id="name"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                        /></div>

                        <div className="space-y-1"><label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label><input
                            type="email"
                            name="email"
                            id="email"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                        /></div>

                        <div className="space-y-1"><label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label><input
                            type="tel"
                            name="phone"
                            id="phone"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                        /></div>

                        <div className="space-y-1"><label htmlFor="comment" className="block text-sm font-medium text-gray-700">Comment</label><textarea
                            name="comment"
                            id="comment"
                            rows={4}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                            ></textarea></div>

{/* ⬅️ NEW: CONSENT CHECKBOX BLOCK FOR CONTACT FORM */}
<div className="flex items-start pt-2">
  <input
    id="contact-consent"
    type="checkbox"
    name="data-consent"
    required
    className="h-4 w-4 mt-1 text-red-600 border-gray-300 rounded focus:ring-red-500 flex-shrink-0"
  />
<label htmlFor="contact-consent" className="ml-3 block text-sm text-gray-700 cursor-pointer">
I consent to Headroom Havens processing my contact details solely to respond to my enquiry, as detailed in the <a href="/privacy-policy" target="_blank" className="font-semibold underline text-red-600 hover:text-red-700">Privacy Policy</a>.
</label>
</div>
{/* ⬅️ END NEW CONSENT CHECKBOX BLOCK */}

                        <Button type="submit" className="w-full mt-4">Submit</Button>
                    </form>
                    <p className="text-xs text-gray-500 text-center mt-3">Submissions are processed securely by Netlify Forms.</p>
                </div>
            </SectionContainer>

            {/* 🎯 HIDDEN NETLIFY FORMS - Must be in the DOM for Netlify's build parser */}
<form name="booking-lead" data-netlify="true" hidden>
    <input type="hidden" name="form-name" value="booking-lead" />
    <input type="text" name="name" />
    <input type="email" name="email" />
    <input type="number" name="height" />
    <input type="number" name="propertyId" />
    <input type="text" name="propertyName" />
</form>

<form name="member-review" data-netlify="true" hidden>
    <input type="hidden" name="form-name" value="member-review" />
    <input type="text" name="reviewer" />
    <input type="email" name="email" />
    <input type="number" name="rating" />
    <textarea name="comment" />
    <input type="number" name="propertyId" />
    <input type="text" name="propertyName" />
    <input type="text" name="date" />
</form>

{/* 🎯 NEW HIDDEN FORM FOR INTEREST CAPTURE MODAL */}
<form name="interest-capture" data-netlify="true" hidden>
    <input type="hidden" name="form-name" value="interest-capture" />
    <input type="text" name="name" />
    <input type="email" name="email" />
    <input type="number" name="height" />
</form>
        </> // ⬅️ END of React Fragment
    );
};


// 12. Router and Main App Component (Final Fixed Structure)
const App: React.FC = () => {
    // ----------------------------------------------------
    // 1. STATE DEFINITIONS MUST COME FIRST (FULL CODE)
    // ----------------------------------------------------
    const [hasAcceptedCookies, setHasAcceptedCookies] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('cookies-accepted') === 'true';
        }
        return false;
    });

    const [hasRejectedCookies, setHasRejectedCookies] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('cookies-rejected') === 'true';
        }
        return false;
    });

    const [location, setLocation] = useState<{ path: string, propertyId: number | null }>({ path: "home", propertyId: null });
    const currentPage = location.path;
    const selectedPropertyId = location.propertyId;
    const [showInterestModal, setShowInterestModal] = useState(false);

const [showInterestButton, setShowInterestButton] = useState<boolean>(false); // Initialize to false, button appears after cookies are handled.

    // ----------------------------------------------------
    // 2. HANDLER FUNCTIONS (FULL CODE)
    // ----------------------------------------------------
    const handleAcceptCookies = () => {
        setHasAcceptedCookies(true);
        localStorage.setItem('cookies-accepted', 'true');
        localStorage.removeItem('cookies-rejected'); // Clear rejection flag

        // NEW: Show the interest button if the user hasn't registered yet
        if (localStorage.getItem(INTEREST_CAPTURED_KEY) !== 'true') {
            setShowInterestButton(true);
        }
    };

    const handleRejectCookies = () => {
        setHasRejectedCookies(true);
        localStorage.setItem('cookies-rejected', 'true');
        localStorage.removeItem('cookies-accepted'); // Clear acceptance flag
        
        // NEW: Show the interest button if the user hasn't registered yet
        if (localStorage.getItem(INTEREST_CAPTURED_KEY) !== 'true') {
            setShowInterestButton(true);
        }
    };

    // NEW HANDLER TO OPEN MODAL FROM THE PERMANENT BUTTON
    const handleOpenInterestModal = () => {
        setShowInterestModal(true);
    };

    const handleInterestModalClose = () => {
        setShowInterestModal(false);
        localStorage.setItem(INTEREST_CLOSED_KEY, new Date().toISOString()); // Set last closed date
        // If the user closes the modal without submitting, show the permanent button
        if (localStorage.getItem(INTEREST_CAPTURED_KEY) !== 'true') {
            setShowInterestButton(true);
        }
    }

    const handleInterestModalSuccess = () => {
        // Modal logic sets 'interest-captured' in local storage
        setShowInterestModal(false);
        // Hide the permanent button on success
        setShowInterestButton(false); 
    }

    // ----------------------------------------------------
    // 3. THE NAVIGATE FUNCTION (Needs access to state above)
    // ----------------------------------------------------
    const navigate = (path: string, propertyId: number | null = null) => {
        // Define pages that are allowed regardless of cookie status
        const allowedPaths = ["home", "standard", "contact", "privacy-policy"];
        
        // This check requires access to hasRejectedCookies and hasAcceptedCookies
        if ((hasRejectedCookies || !hasAcceptedCookies) && !allowedPaths.includes(path)) {
            alert("Please accept cookies to access our listings and booking details.");
            return;
        }
        
        const newState = { path, propertyId };
        const url = (path === "detail" || path === "reviews") && propertyId !== null ? `/${path}/${propertyId}` : `/${path}`;
        window.history.pushState(newState, "", url);
        setLocation(newState);
        window.scrollTo(0, 0);
    };

    // ----------------------------------------------------
    // 4. EFFECTS AND RENDERING (REST OF THE COMPONENT)
    // ----------------------------------------------------

    React.useEffect(() => {
    // Only run if:
    // 1. Cookies are accepted (for GDPR compliance on data collection)
    // 2. The form hasn't already been submitted successfully
    // 3. The form hasn't been explicitly closed in the last 24 hours
    if (hasAcceptedCookies &&
        localStorage.getItem(INTEREST_CAPTURED_KEY) !== 'true') {

        const lastClosed = localStorage.getItem(INTEREST_CLOSED_KEY);
        if (lastClosed) {
            const closedDate = new Date(lastClosed).getTime();
            const now = new Date().getTime();
            const twentyFourHours = 24 * 60 * 60 * 1000;
            // If closed less than 24 hours ago, don't show it.
            if (now - closedDate < twentyFourHours) {
                return;
            }
        }

        const timer = setTimeout(() => {
            setShowInterestModal(true);
        }, 30000); // 30 seconds

        return () => clearTimeout(timer); // Cleanup
    }
}, [hasAcceptedCookies]); // Only re-run when cookie status changes or mounts


    React.useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            if (event.state) {
                setLocation(event.state as { path: string, propertyId: number | null });
            } else {
                setLocation({ path: "home", propertyId: null });
            }
        };

        window.addEventListener('popstate', handlePopState);

        const initialPath = window.location.pathname.slice(1).split('/');
        if (initialPath[0] && initialPath[0] !== '') {
            setLocation({ 
                path: initialPath[0],
                propertyId: initialPath[1] ? Number(initialPath[1]) : null 
            });
        }

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    const selectedProperty = useMemo(() => {
        const prop = MOCK_PROPERTIES.find(p => p.id === selectedPropertyId);
        return prop || MOCK_PROPERTIES[0]; 
    }, [selectedPropertyId]);

    let content;
    switch (currentPage) {
        case "listings":
            content = <ListingsPage navigate={navigate} />;
            break;
        case "standard":
            content = <StandardPage />;
            break;
        case "contact":
            content = <ContactPage />;
            break;
        case "privacy-policy": 
            content = <PrivacyPolicyPage />;
            break;
        case "detail":
            content = selectedPropertyId !== null ? <DetailPage property={selectedProperty} navigate={navigate} /> : <HomePage navigate={navigate} showInterestButton={showInterestButton} onOpenInterestModal={handleOpenInterestModal} />;
            break;
        case "reviews": 
            content = selectedPropertyId !== null ? <ReviewsPage property={selectedProperty} /> : <HomePage navigate={navigate} showInterestButton={showInterestButton} onOpenInterestModal={handleOpenInterestModal} />;
            break;
        case "home":
        default:
            content = <HomePage navigate={navigate} showInterestButton={showInterestButton} onOpenInterestModal={handleOpenInterestModal} />;
    }

    return (
        <div className="min-h-screen flex flex-col overflow-x-hidden">
            <Header navigate={navigate} currentPage={currentPage} />
            <main className="flex-grow">{content}</main>
            
            <Footer /> 

            {/* Cookie Banner is only rendered if neither accepted nor rejected */}
            {!hasAcceptedCookies && !hasRejectedCookies && (
                <CookieConsentBanner 
                    onAccept={handleAcceptCookies} 
                    onReject={handleRejectCookies} 
                />
            )}

            {showInterestModal && (
                <InterestCaptureModal
                    onClose={handleInterestModalClose}
                    onSuccess={handleInterestModalSuccess}
                />
            )}
        </div>
    );
};

export default App;