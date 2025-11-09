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
}

interface Review {
  id: number;
  propertyId: number;
  reviewer: string;
  date: string;
  rating: number;
  comment: string;
}

// --- GLOBAL CONFIGURATION AND DATA ---

const SAFETY_BUFFER_CM = 5; 
const HERO_IMAGE_URL = process.env.PUBLIC_URL + "/images/cottage-hero.png"; 
const AFFILIATE_BASE_LINK = "https://partner-booking-site.com/?aid=HHAVENS123&prop=";

// Conversion helper function
const cmToFeetInches = (cm: number): string => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet} ft ${inches} in`;
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
      "https://placehold.co/600x400/2E8B57/FFFFFF?text=Barn+Lodge+Exterior",
      "https://placehold.co/600x400/2E8B57/FFFFFF?text=Vaulted+Ceilings",
      "https://placehold.co/600x400/2E8B57/FFFFFF?text=Extra-Long+Bed",
    ], 
    description: "Architecturally stunning barn conversion with vast open spaces and original vaulted ceilings. Ideal for the 7-foot traveler.", 
    amenities: ["Vaulted Ceilings", "California King Bed", "Enclosed Garden"] 
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
      "https://placehold.co/600x400/6B8E23/FFFFFF?text=Stone+Cottage+Exterior",
      "https://placehold.co/600x400/6B8E23/FFFFFF?text=Living+Room+Beam+195cm",
      "https://placehold.co/600x400/6B8E23/FFFFFF?text=Kitchen+Low+Point",
    ], 
    description: "Traditional stone cottage carefully refurbished to maximise vertical space. Low point is the kitchen beam. Features an extra-long Super King bed.", 
    amenities: ["Extra-Long King Bed", "Open Fireplace", "Lake Views"] 
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
      "https://placehold.co/600x400/A0522D/FFFFFF?text=Urban+Loft+View",
      "https://placehold.co/600x400/A0522D/FFFFFF?text=Floor+to+Ceiling+Window",
    ],
    description: "Sleek, modern penthouse apartment with floor-to-ceiling windows and zero architectural obstructions. Absolute maximum headroom throughout.", 
    amenities: ["24/7 Concierge", "Queen Mattresses (Extra Long)", "Gym Access"] 
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
      "https://placehold.co/600x400/556B2F/FFFFFF?text=A-Frame+Exterior",
      "https://placehold.co/600x400/556B2F/FFFFFF?text=Cozy+Interior",
    ],
    description: "Cozy cabin retreat. Watch out for the corner beams, but the main living area is spacious. Beds are standard King length.", 
    amenities: ["Woodland Setting", "Sauna", "Hiking Trails"] 
  },
];

const MOCK_REVIEWS: Review[] = [
  { id: 1, propertyId: 1, reviewer: "Liam M.", date: "2025-10-10", rating: 5.0, comment: "Absolutely massive headspace! I'm 6'10\" and didn't duck once. The California King was perfect. A true haven." },
  { id: 2, propertyId: 1, reviewer: "Sarah T.", date: "2025-09-28", rating: 4.5, comment: "Beautiful barn conversion. Liam is right about the space. Only slight negative: the shower head was a tad low, but the rest was flawless." },
  { id: 3, propertyId: 2, reviewer: "Marcus J.", date: "2025-11-01", rating: 3.0, comment: "Cozy cottage. The low kitchen beam definitely requires caution, but the extra-long bed was worth it. As advertised." },
  { id: 4, propertyId: 3, reviewer: "Jessica V.", date: "2025-10-25", rating: 5.0, comment: "Peak luxury and space. I finally felt short! The best accommodation I've ever found for height. Worth the Elite Haven price." },
];

// --- UNIVERSAL LAYOUT COMPONENTS ---

/**
 * STANDARD: A standardized container for all major page sections.
 * This ensures consistent horizontal alignment (mx-auto), maximum width (max-w-7xl),
 * and vertical padding (py-6) on ALL pages/sections.
 */
const SectionContainer: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = "" }) => (
    <div className={`max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 ${className}`}>
        {children}
    </div>
);


// 1. Button Component
const Button: React.FC<ButtonProps> = ({ children, onClick, color = "bg-red-600", className = "", type = "button" }) => (
  <button
    onClick={onClick}
    type={type} 
    className={`px-6 py-3 font-semibold text-white transition-colors duration-200 ${color} rounded-lg shadow-md hover:bg-red-700 disabled:opacity-50 ${className}`}
  >
    {children}
  </button>
);

// 2. Header and Navigation
const Header: React.FC<HeaderProps> = ({ navigate, currentPage }) => (
  <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-md">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
      {/* ADDED gap-x-1 to create a tight, controlled space between the logo mark and the text */}
      <div onClick={() => navigate("home")} className="flex items-center cursor-pointer gap-x-2">
        {/* Logo Mark - Tightly spaced */}
        <div className="flex items-center">
    <span className="h-6 w-0.5 bg-black" /><span className="text-2xl font-bold text-red-600 font-black">H</span><span className="h-6 w-0.5 bg-black" />
  </div>{/* 'Headroom Havens' text is now separated from the logo mark by gap-x-1 */} <span className="text-lg font-bold text-gray-800 tracking-wider uppercase font-serif sm:whitespace-nowrap">Headroom Havens</span></div>
     <nav className="hidden sm:flex justify-end space-x-3 md:space-x-4 lg:space-x-6">
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
      <button onClick={() => navigate("listings")} className="sm:hidden p-2 text-gray-600 hover:text-red-600">
        <Search size={24} />
      </button>
    </div>
  </header>
);

// 3. Footer Component
const Footer: React.FC = () => (
  <footer className="bg-gray-800 text-white mt-8">
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center">
      <p>&copy; {new Date().getFullYear()} Headroom Havens. All rights reserved. </p>
      <p className="mt-2 text-xs text-gray-400">
        All bookings are processed via our verified affiliate partners.
      </p>
    </div>
  </footer>
);

// 4. Max Height Rating Logic Component
// 4. Max Height Rating Logic Component
const MaxHeightDisplay: React.FC<{ clearanceCM: number }> = ({ clearanceCM }) => {
  const maxSafeHeightCM = clearanceCM - SAFETY_BUFFER_CM;
  const maxSafeHeightImperial = cmToFeetInches(maxSafeHeightCM);

  return (
    <div className="flex items-center text-red-600 font-semibold space-x-2 text-left">
      <Maximize size={20} className="text-red-600" />
      {/* ADD -translate-y-px to shift the text up by 1px for perfect alignment */}
      <span className="-translate-y-px">Max Height Rating: {maxSafeHeightImperial} ({Math.round(maxSafeHeightCM)} cm)</span>
    </div>
  );
};

/**
 * 7. Property Card Component - Core Fixes for Alignment
 * 1. Added h-full to the root div to ensure it stretches to the height of the tallest card in the row.
 * 2. Added flex-col to enable vertical stacking.
 * 3. Added flex-grow to the inner p-4 div to push the button to the bottom.
 * 4. Added mt-auto to the button container to stick it to the bottom.
 */
const PropertyCard: React.FC<{ property: Property, navigate: (path: string, propertyId: number) => void }> = ({ property, navigate }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition-transform duration-300 hover:shadow-2xl hover:-translate-y-1 h-full w-full">
    <img src={property.images[0]} alt={property.name} className="w-full h-48 object-cover" /> 
    {/* Use flex-grow to push the button to the bottom */}
    <div className="p-4 flex flex-col flex-grow"> 
      <h3 className="text-xl font-bold text-gray-800">{property.name}</h3>
      <p className="text-sm text-gray-500 flex items-center mb-1"><Compass size={16} className="mr-1" />{property.location}</p>

      <div className="space-y-1 mb-4 text-sm flex-grow text-left"> 
        <MaxHeightDisplay clearanceCM={property.maxHeightCM} />
        <div className="flex items-start text-gray-600 space-x-1"><Bed size={18} className='mt-0.5 flex-shrink-0' /><span className="flex-wrap">Usable Bed Length: {cmToFeetInches(property.mattressLengthCM)} ({property.mattressLengthCM} cm) - 2 Beds</span></div>
        <div className="flex items-center text-gray-600 space-x-1"><DollarSign size={18} /><span>Price Rating: {priceRangeToLabel(property.priceRange)}</span></div>
      </div>

      {/* mt-auto ensures the button sticks to the bottom */}
      <Button onClick={() => navigate("detail", property.id)} className="w-full text-center mt-auto" color="bg-red-600 hover:bg-red-700">View Details & Book</Button>
    </div>
  </div>
);


// 5. Home Page
const HomePage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => (
  <div>
    {/* Hero Section */}
    <div className="relative bg-gray-100 shadow-xl mb-8"> 
      <img src={HERO_IMAGE_URL} alt="Photorealistic Cottage Doorway with Tall Man" className="w-full h-[500px] object-cover" />
      <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-center items-center text-center p-4">
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight drop-shadow-lg">Holiday Cottages <span className="text-red-600">with Headroom</span></h1>
        <p className="mt-4 text-xl md:text-2xl text-white/90 drop-shadow-md">Verified head clearance and bed length. Standing up for tall travelers.</p>
        <Button onClick={() => navigate("listings")} className="mt-6"><Search size={20} className="inline mr-2" />Find a Place with Headroom</Button>
      </div>
      </div>

    {/* Value Proposition Section (FIXED: Added items-stretch to the grid) */}
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

    {/* Featured Havens Teaser (FIXED: items-stretch for equal height PropertyCards) */}
    <SectionContainer className="py-6"> 
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Featured Havens</h2>
        {/* items-stretch ensures PropertyCards (which use h-full) are equal height */}
        <div className="flex flex-wrap lg:flex-nowrap justify-center gap-6 items-stretch">
            {MOCK_PROPERTIES.slice(0, 3).map(property => (
                <PropertyCard key={property.id} property={property} navigate={navigate} />
            ))}
        </div>
    </SectionContainer>
  </div>
);

// 6. Listings Page
const ListingsPage: React.FC<{ navigate: (path: string, propertyId: number) => void }> = ({ navigate }) => {
  const [maxHeightFilter, setMaxHeightFilter] = useState<number>(0);
  const [priceFilter, setPriceFilter] = useState<number>(0);

  const MAX_HEIGHT_OPTIONS = [193, 198, 203, 208, 213, 218];
  const PRICE_OPTIONS = [1, 2, 4, 5]; 

  const filteredProperties = useMemo(() => {
    return MOCK_PROPERTIES.filter(property => {
      const propertySafeHeightCM = property.maxHeightCM - SAFETY_BUFFER_CM;
      const heightPass = maxHeightFilter === 0 || propertySafeHeightCM >= maxHeightFilter;
      const pricePass = priceFilter === 0 || 
                         (priceFilter === 2 && (property.priceRange === 2 || property.priceRange === 3)) || 
                         property.priceRange === priceFilter;
      
      return heightPass && pricePass; // AND logic is correctly used here
    });
  }, [maxHeightFilter, priceFilter]);

  return (
    <SectionContainer className="py-4"> 
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Find Your Headroom Haven</h1> 

      {/* Filters Section - Remains horizontally aligned */}
      <div className="bg-gray-100 p-4 rounded-xl shadow-md mb-6 flex flex-wrap items-end gap-4"> 
        <div className="w-full md:w-1/3">
          <label htmlFor="height-filter" className="block text-sm font-medium text-gray-700 mb-0">Minimum Headroom Required:</label>
          <select
             id="height-filter"
            value={maxHeightFilter}
            onChange={(e) => setMaxHeightFilter(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500" 
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
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
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

      {/* Listings Grid (FIXED: items-stretch for equal height PropertyCards) */}
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

// 8. Property Detail Page
const DetailPage: React.FC<{ property: Property, navigate: (path: string, propertyId: number | null) => void }> = ({ property, navigate }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0); 
  
  const handleBookNow = () => {
    console.log(`Tracking affiliate click for property ID: ${property.id}`);
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
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors z-10 **drop-shadow-sm**"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={goToNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors z-10 **drop-shadow-sm**"
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

          {/* Details - Headroom Certified Dimensions (ALIGNMENT FIX: Custom grid for paired data) */}
          <div className="bg-white p-5 rounded-xl shadow-lg mb-6"> 
            <h2 className="text-2xl font-bold text-red-600 mb-3 flex items-center"><Maximize size={24} className="mr-2" />Headroom Certified Details</h2>
<p className="text-gray-700 mb-4">{property.description}</p>

            {/* FIX: Using simple flex column structure for flush left alignment */}
            <div className="flex flex-col gap-y-1 text-lg text-left"> 
                {/* Actual Lowest Clearance */}
                <div className="flex flex-wrap">
                    <span className="font-semibold mr-3">Actual Lowest Clearance:</span><span>{cmToFeetInches(property.maxHeightCM)} ({property.maxHeightCM} cm)</span>
                </div>
                
                {/* Max Height Rating */}
                <div className="flex flex-wrap">
                    <span className="font-semibold mr-3">Max Height Rating:</span><span>{maxSafeHeightImperial} ({Math.round(maxSafeHeightCM)} cm)</span>
                </div>
                
                {/* Usable Bed Length */}
                <div className="flex flex-wrap">
                    <span className="font-semibold mr-3">Usable Bed Length:</span><span>{cmToFeetInches(property.mattressLengthCM)} ({property.mattressLengthCM} cm) - 2 Beds (1 footboard)</span>
                </div>
            </div>
          </div> 

          {/* Google Map Placeholder */}
          <div className="bg-gray-200 h-[400px] w-full flex items-center justify-center rounded-xl shadow-lg mb-6"> 
            <p className="text-gray-600">Google Map Embed Placeholder</p>
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
        >
            See Guest Reviews
        </button>
    </div>
        
        {/* Supporting Text with Submit Link */}
        <div className="text-left text-sm text-gray-500 flex-grow">
            <p>Based on feedback from verified tall guests. All ratings are admin-approved for integrity. <span className="font-bold text-red-600 cursor-pointer hover:underline ml-1">SUBMIT YOUR RATING</span></p>
        </div>
    </div>
</div>
        {/* Booking Box */}
        <div className="md:col-span-1 flex flex-col justify-center items-center p-5 bg-red-100 rounded-xl shadow-inner h-full order-1">
              <p className="text-sm text-gray-700 mb-3 text-center">Ready to book your stress-free stay?</p>
              <Button onClick={handleBookNow} className="w-full text-center"><CheckCircle size={20} className="inline mr-2" />Book Now via Partner</Button>
              <p className="text-xs mt-2 text-gray-500 text-center">Booking handled securely by affiliate partner.</p>
            </div>
          </div>
      </div>
    </SectionContainer>
  );
};


// Price Tiers Table Component
const PriceTiersTable: React.FC = () => {
    const tiers = [
        { tier: '$', name: 'Comfort', rationale: 'Simple, reliable, value-focused accommodation.' },
        { tier: '$$', name: 'Boutique', rationale: 'Our core market: high-style, verified quality, excellent value.' },
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
const StandardPage: React.FC = () => (
  <SectionContainer> 
    {/* Adjusted max-w-4xl wrapper to be inside the SectionContainer for consistency */}
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-800 mb-4 text-left">Our Standard: Why We Certify</h1> 
      <p className="text-xl text-gray-600 mb-8 text-left">We eliminate the anxiety of travel for tall guests by applying a stringent, verifiable certification process to every property.</p>

      {/* 1. Section: The Safety Buffer (Use mb-8 for consistent section separation) */}
      <div className="mb-8 p-5 bg-red-50 rounded-xl border border-red-200 text-left"> 
          <h2 className="text-2xl font-semibold text-red-600 mb-3">A. The Safety Buffer (The 5 cm Rule)</h2>
          <p className="**mb-1** text-gray-700">A property must have a minimum measured clearance of <strong>6 ft 7 in (201 cm)</strong> for a guest to be rated at <strong>6 ft 5 in (196 cm)</strong>. Why?</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
              <li><strong>Dynamic Movement:</strong> When you walk, your body slightly lifts off the ground at the push-off point of your stride. This requires approximately 5 cm or 2 in of vertical clearance.</li>
              <li><strong>Our Guarantee:</strong> We subtract a mandatory <strong>5 cm (2 in) safety buffer</strong> from the lowest measured point (door, beam, ceiling) to determine the property's true <strong>Max Height Rating</strong>.</li>
              <li><strong>No Surprises:</strong> A property rated at <strong>6 ft 6 in (198 cm)</strong> means a 6 ft 6 in guest can walk around without fear of whacking their head on a door frame or beam.</li>
          </ul>
      </div>
      
      {/* 2. Section: The Certification Process (Consistent vertical spacing) */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-1 text-left">B. The Certification Process: Photo Proof</h2>
      <div className="space-y-2 mb-5">
          <div className="flex items-start space-x-3">
              <Maximize size={32} className="text-gray-700 flex-shrink-0 mt-1" />
              <div><h3 className="text-xl font-semibold">Vetting Measurements</h3><p className="text-gray-600 mb-0">Property owners must submit the actual measurement of the lowest possible point for every area: main doors, bathroom entrances, and structural beams.</p></div>
          </div>
          <div className="flex items-start space-x-3">
              <Search size={32} className="text-gray-700 flex-shrink-0 mt-1" />
              <div><h3 className="text-xl font-semibold">The Photo Verification</h3><p className="text-gray-600 mb-0">The most important step: The owner must submit <strong>photo evidence</strong> showing a tape measure clearly documenting the full height of the low points. We require branded Headroom Havens tape (or a recognizable ruler) to verify the data's integrity.</p></div>
          </div>
          <div className="flex items-start space-x-3">
              <Bed size={32} className="text-gray-700 flex-shrink-0 mt-1" />
              <div><h3 className="text-xl font-semibold">Bed Length Verification</h3><p className="text-gray-600 mb-0">We verify usable mattress length (excluding frames/footboards). Only mattresses over <strong>200 cm (6 ft 6 in)</strong> or longer qualify for listing on our site.</p></div>
          </div>
      </div>
      
      {/* 3. Section: Price Tier Guide (The New Table) */}
      <PriceTiersTable />
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
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold text-gray-800">{review.reviewer}</p>
                  <span className="text-xs text-gray-500">{review.date}</span>
                </div>
                <div className="flex items-center space-x-1 mb-2">
                  <span className="text-lg font-bold text-green-600">{review.rating.toFixed(1)} / 5.0</span>
                </div>
                <p className="text-gray-700 italic">"{review.comment}"</p>
              </div>
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
        <SectionContainer> 
            <div className="max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">Contact Us</h1><p className="text-xl text-gray-600 mb-8 text-center">We're standing up for tall travelers. Get in touch with our team.</p> 

                <form 
                    name="contact" 
                    method="POST" 
                    data-netlify="true"
                    className="space-y-4 p-5 bg-white rounded-xl shadow-lg border-t-4 border-red-600 mx-auto mb-4" 
                >
                    <input type="hidden" name="form-name" value="contact" />

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
<Button type="submit" className="w-full mt-4">Submit</Button>
                </form>
                <p className="text-xs text-gray-500 text-center mt-3">Submissions are processed securely by Netlify Forms.</p>
            </div>
        </SectionContainer>
    );
};


// 12. Router and Main App Component (No Changes)
const App: React.FC = () => {
  const [location, setLocation] = useState<{ path: string, propertyId: number | null }>({ path: "home", propertyId: null });
  const currentPage = location.path;
  const selectedPropertyId = location.propertyId;

  const navigate = (path: string, propertyId: number | null = null) => {
    const newState = { path, propertyId };
    const url = (path === "detail" || path === "reviews") && propertyId !== null ? `/${path}/${propertyId}` : `/${path}`;
    window.history.pushState(newState, "", url);
    setLocation(newState);
    window.scrollTo(0, 0);
  };

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
    case "detail":
  content = selectedPropertyId !== null ? <DetailPage property={selectedProperty} navigate={navigate} /> : <HomePage navigate={navigate} />;
  break;
case "reviews": 
      content = selectedPropertyId !== null ? <ReviewsPage property={selectedProperty} /> : <HomePage navigate={navigate} />;
      break;

    case "home":
    default:
      content = <HomePage navigate={navigate} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header navigate={navigate} currentPage={currentPage} />
      <main className="flex-grow">{content}</main>
      <Footer />
    </div>
  );
};

export default App;