import React, { useState, useMemo, useEffect } from 'react';import { Search, Bed, Maximize, User, Compass, DollarSign, CheckCircle } from 'lucide-react';// --- INTERFACES AND TYPE DEFINITIONS ---// Define the structure for a single property listinginterface Property {id: number;name: string;location: string;priceRange: number; // 1 to 5maxHeightCM: number; // Lowest measured clearance, used for filtering (e.g., 218 cm)mattressLengthCM: number;ratingMember: number; // Simulated user comfort rating (1-5)affiliateLink: string;image: string;description: string;amenities: string[];}// Define the structure for component propsinterface HeaderProps {navigate: (path: string, propertyId?: number) => void;currentPage: string;}interface ButtonProps {children: React.ReactNode;onClick: () => void;color?: string;className?: string;}// --- GLOBAL CONFIGURATION AND DATA ---// The user's safety margin (2 inches or 5 cm) subtracted from property clearanceconst SAFETY_BUFFER_CM = 5;// The placeholder image URL. MUST BE REPLACED with your actual hosted image.const HERO_IMAGE_URL = "https://www.google.com/search?q=https://placehold.co/1200x500/F8D4CC/333%3Ftext%3DPhotorealistic%2BCottage%2BDoorway%2B%252B%2BTall%2BMan";// Affiliate link placeholderconst AFFILIATE_BASE_LINK = "https://www.google.com/search?q=https://partner-booking-site.com/%3Faid%3DHHAVENS123%26prop%3D";// Conversion helper functionconst cmToFeetInches = (cm: number): string => {const totalInches = cm / 2.54;const feet = Math.floor(totalInches / 12);const inches = Math.round(totalInches % 12);return ${feet} ft ${inches} in;};// Mock Property Dataconst MOCK_PROPERTIES: Property[] = [{ id: 1, name: "Cotswold Barn Lodge", location: "Cotswolds, UK", priceRange: 4, maxHeightCM: 220, mattressLengthCM: 215, ratingMember: 4.8, affiliateLink: AFFILIATE_BASE_LINK + "Lodge1", image: "https://www.google.com/search?q=https://placehold.co/400x250/2E8B57/FFFFFF%3Ftext%3DBarn%2BLodge%2B220cm%2BClearance", description: "Architecturally stunning barn conversion with vast open spaces and original vaulted ceilings. Ideal for the 7-foot traveler.", amenities: ["Vaulted Ceilings", "California King Bed", "Enclosed Garden"] },{ id: 2, name: "Highland Stone Cottage", location: "Scottish Highlands, UK", priceRange: 3, maxHeightCM: 195, mattressLengthCM: 205, ratingMember: 3.5, affiliateLink: AFFILIATE_BASE_LINK + "Cottage2", image: "https://www.google.com/search?q=https://placehold.co/400x250/6B8E23/FFFFFF%3Ftext%3DStone%2BCottage%2B195cm%2BClearance", description: "Traditional stone cottage carefully refurbished to maximise vertical space. Low point is the kitchen beam. Features an extra-long Super King bed.", amenities: ["Extra-Long King Bed", "Open Fireplace", "Lake Views"] },{ id: 3, name: "Bristol Urban Loft", location: "Bristol, UK", priceRange: 5, maxHeightCM: 235, mattressLengthCM: 220, ratingMember: 5.0, affiliateLink: AFFILIATE_BASE_LINK + "Loft3", image: "https://www.google.com/search?q=https://placehold.co/400x250/A0522D/FFFFFF%3Ftext%3DUrban%2BLoft%2B235cm%2BClearance", description: "Sleek, modern penthouse apartment with floor-to-ceiling windows and zero architectural obstructions. Absolute maximum headroom throughout.", amenities: ["24/7 Concierge", "Queen Mattresses (Extra Long)", "Gym Access"] },{ id: 4, name: "New Forest A-Frame", location: "New Forest, UK", priceRange: 2, maxHeightCM: 200, mattressLengthCM: 200, ratingMember: 4.1, affiliateLink: AFFILIATE_BASE_LINK + "Cabin4", image: "https://www.google.com/search?q=https://placehold.co/400x250/556B2F/FFFFFF%3Ftext%3DA-Frame%2BCabin%2B200cm%2BClearance", description: "Cozy cabin retreat. Watch out for the corner beams, but the main living area is spacious. Beds are standard King length.", amenities: ["Woodland Setting", "Sauna", "Hiking Trails"] },];// --- NAVIGATION & STYLED COMPONENTS ---// 1. Button Componentconst Button: React.FC<ButtonProps> = ({ children, onClick, color = "bg-red-600", className = "" }) => (<buttononClick={onClick}className={px-6 py-3 font-semibold text-white transition-colors duration-200 ${color} rounded-lg shadow-md hover:bg-red-700 disabled:opacity-50 ${className}}{children}
</button>);// 2. Header and Navigationconst Header: React.FC<HeaderProps> = ({ navigate, currentPage }) => (<header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-md"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16"><div onClick={() => navigate("home")} className="flex items-center cursor-pointer space-x-2">{/* IHI Logo Icon */}<div className="relative h-6 w-6"><span className="absolute top-0 h-full w-0.5 bg-black left-0.5" /><span className="absolute top-0 h-full w-0.5 bg-black right-0.5" /><span className="absolute top-1 h-4 w-3.5 bg-black left-1.5" /></div><span className="text-lg font-bold text-gray-800 tracking-wider uppercase">Headroom Havens</span></div><nav className="hidden sm:flex space-x-6">{[{ path: "listings", label: "Find a Place with Headroom" }, { path: "standard", label: "Our Standard" }].map(({ path, label }) => (<buttonkey={path}onClick={() => navigate(path)}className={text-sm font-medium transition-colors ${ currentPage === path ? &#39;text-red-600 font-bold&#39; : &#39;text-gray-600 hover:text-red-600&#39; }}>{label}</button>))}</nav><button onClick={() => navigate("listings")} className="sm:hidden p-2 text-gray-600 hover:text-red-600"><Search size={24} /></button></div></header>);// 3. Footer Componentconst Footer: React.FC = () => (<footer className="bg-gray-800 text-white mt-12"><div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center"><p>&copy; {new Date().getFullYear()} Headroom Havens. All rights reserved. </p><p className="mt-2 text-xs text-gray-400">All bookings are processed via our verified affiliate partners. Commission is paid after guest stay.</p></div></footer>);// 4. Max Height Rating Logic Component// This component displays the max comfortable height (clearing the safety buffer)const MaxHeightDisplay: React.FC<{ clearanceCM: number }> = ({ clearanceCM }) => {const maxSafeHeightCM = clearanceCM - SAFETY_BUFFER_CM;const maxSafeHeightImperial = cmToFeetInches(maxSafeHeightCM);return (<div className="flex items-center text-red-600 font-semibold space-x-2"><Maximize size={20} className="text-red-600" /><span>Max Height Rating: {maxSafeHeightImperial} ({Math.round(maxSafeHeightCM)} cm)</span></div>);};// --- PAGES ---// 5. Home Pageconst HomePage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => (<div>{/* Hero Section */}<div className="relative bg-gray-100 shadow-xl"><img src={HERO_IMAGE_URL} alt="Photorealistic Cottage Doorway with Tall Man" className="w-full h-[500px] object-cover" /><div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-center items-center text-center p-4"><h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight drop-shadow-lg">Holiday Cottages with Headroom</h1><p className="mt-4 text-xl md:text-2xl text-white/90 drop-shadow-md">Guaranteed comfort and verified clearance for travelers 6 ft 0 in (183 cm) and taller. Stop the Stoop. Start the Holiday.</p><Button onClick={() => navigate("listings")} className="mt-8"><Search size={20} className="inline mr-2" /> Find a Place with Headroom</Button></div></div>{/* Value Proposition Section */}
<div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
  <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center">
    The Headroom Standard: Guaranteed Comfort
  </h2>
  <div className="grid md:grid-cols-3 gap-10">
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-lg border-t-4 border-red-600">
      <Maximize size={48} className="text-red-600 mb-4" />
      <h3 className="text-xl font-semibold mb-2">Verified Clearance</h3>
      <p className="text-gray-600">
        Every door frame, ceiling, and beam is measured and confirmed against our safety buffer of 5 cm (2 in).
      </p>
    </div>
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-lg border-t-4 border-red-600">
      <Bed size={48} className="text-red-600 mb-4" />
      <h3 className="text-xl font-semibold mb-2">Extra-Long Beds</h3>
      <p className="text-gray-600">
        No more feet dangling. We only list properties with mattresses of 205 cm or longer, plus open footboards.
      </p>
    </div>
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-lg border-t-4 border-red-600">
      <CheckCircle size={48} className="text-red-600 mb-4" />
      <h3 className="text-xl font-semibold mb-2">High-End Curation</h3>
      <p className="text-gray-600">
        A collection of boutique cottages and luxury retreats across the UK, chosen for style and verified space.
      </p>
    </div>
  </div>
  <div className="text-center mt-10">
    <Button onClick={() => navigate("standard")} color="bg-gray-700 hover:bg-gray-800">
      Learn How We Certify Properties
    </Button>
  </div>
</div>

{/* Featured Havens Teaser */}
<div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
    <h2 className="text-3xl font-bold text-gray-800 mb-6">Featured Havens</h2>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_PROPERTIES.slice(0, 3).map(property => (
            <PropertyCard key={property.id} property={property} navigate={navigate} />
        ))}
    </div>
</div>
</div>);// 6. Listings Page (Filterable Gallery)const ListingsPage: React.FC<{ navigate: (path: string, propertyId: number) => void }> = ({ navigate }) => {const [maxHeightFilter, setMaxHeightFilter] = useState<number>(0);const [priceFilter, setPriceFilter] = useState<number>(0);const MAX_HEIGHT_OPTIONS = [193, 198, 203, 208, 213, 218];const PRICE_OPTIONS = [1, 2, 3, 4, 5];const filteredProperties = useMemo(() => {return MOCK_PROPERTIES.filter(property => {// 1. Max Height Filter: Check if the property's safe height meets the selected filter height.const propertySafeHeightCM = property.maxHeightCM - SAFETY_BUFFER_CM;const heightPass = maxHeightFilter === 0 || propertySafeHeightCM >= maxHeightFilter;  // 2. Price Filter
  const pricePass = priceFilter === 0 || property.priceRange >= priceFilter;

  return heightPass && pricePass;
});
}, [maxHeightFilter, priceFilter]);return (<div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8"><h1 className="text-3xl font-bold text-gray-800 mb-6">Find Your Headroom Haven</h1>  {/* Filters Section */}
  <div className="bg-gray-100 p-6 rounded-xl shadow-md mb-8 grid md:grid-cols-3 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Minimum Headroom Required:
      </label>
      <select
        value={maxHeightFilter}
        onChange={(e) => setMaxHeightFilter(Number(e.target.value))}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
      >
        <option value={0}>Any Height</option>
        {MAX_HEIGHT_OPTIONS.map(cm => (
          <option key={cm} value={cm}>
            {cmToFeetInches(cm)} ({cm} cm)
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Minimum Price Range:
      </label>
      <select
        value={priceFilter}
        onChange={(e) => setPriceFilter(Number(e.target.value))}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
      >
        <option value={0}>Any Price</option>
        {PRICE_OPTIONS.map(p => (
          <option key={p} value={p}>
            {'£'.repeat(p)}
          </option>
        ))}
      </select>
    </div>
  </div>

  {/* Listings Grid */}
  {filteredProperties.length > 0 ? (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
</div>
);};// 7. Property Card Component (Used in Listings)const PropertyCard: React.FC<{ property: Property, navigate: (path: string, propertyId: number) => void }> = ({ property, navigate }) => (<div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:shadow-2xl hover:-translate-y-1"><img src={property.image} alt={property.name} className="w-full h-48 object-cover" /><div className="p-5"><h3 className="text-xl font-bold text-gray-800">{property.name}</h3><p className="text-sm text-gray-500 flex items-center mb-3"><Compass size={16} className="mr-1" /> {property.location}</p>  {/* Headroom Certified Data */}
  <div className="space-y-1 mb-4 text-sm">
    <MaxHeightDisplay clearanceCM={property.maxHeightCM} />
    <div className="flex items-center text-gray-600 space-x-1">
      <Bed size={18} />
      <span>Bed Length: {property.mattressLengthCM} cm</span>
    </div>
    <div className="flex items-center text-gray-600 space-x-1">
      <DollarSign size={18} />
      <span>Price Rating: {'£'.repeat(property.priceRange)}</span>
    </div>
  </div>

  <Button onClick={() => navigate("detail", property.id)} className="w-full text-center" color="bg-red-600 hover:bg-red-700">
    View Details & Book
  </Button>
</div>
</div>);// 8. Property Detail Pageconst DetailPage: React.FC<{ property: Property }> = ({ property }) => {const handleBookNow = () => {// Affiliate Tracking Logicconsole.log(Tracking affiliate click for property ID: ${property.id});window.location.href = property.affiliateLink;};return (<div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8"><h1 className="text-4xl font-bold text-gray-800 mb-2">{property.name}</h1><p className="text-xl text-gray-500 mb-6">{property.location}</p>  {/* Images and Map */}
  <div className="grid md:grid-cols-2 gap-6 mb-8">
    <img src={property.image.replace("400x250", "600x400")} alt={property.name} className="w-full h-full object-cover rounded-xl shadow-lg" />
    <div className="bg-gray-200 h-[400px] flex items-center justify-center rounded-xl shadow-lg">
      <p className="text-gray-600">Google Map Embed Placeholder</p>
    </div>
  </div>

  {/* Details */}
  <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
    <h2 className="text-2xl font-bold text-red-600 mb-4 flex items-center">
      <Maximize size={24} className="mr-2" /> Headroom Certified Dimensions
    </h2>
    
    <p className="text-gray-700 mb-4">{property.description}</p>

    <div className="grid sm:grid-cols-3 gap-4 text-lg">
        <div className="font-semibold">Max Height Rating:</div>
        <div className="col-span-2">
            <MaxHeightDisplay clearanceCM={property.maxHeightCM} />
        </div>
        <div className="font-semibold">Actual Lowest Clearance:</div>
        <div className="col-span-2">{cmToFeetInches(property.maxHeightCM)} ({property.maxHeightCM} cm)</div>
        <div className="font-semibold">Usable Bed Length:</div>
        <div className="col-span-2">{property.mattressLengthCM} cm</div>
    </div>
  </div>

  {/* Member Rating & Booking */}
  <div className="grid md:grid-cols-3 gap-6">
    <div className="md:col-span-2 bg-gray-50 p-6 rounded-xl border border-gray-200">
      <h3 className="text-xl font-semibold mb-4">Member Comfort Rating</h3>
      <p className="text-4xl font-bold text-green-600">{property.ratingMember.toFixed(1)} / 5.0</p>
      <p className="text-sm text-gray-500 mt-2">
        Based on feedback from verified tall guests. All ratings are admin-approved for integrity.
      </p>
      <button className="text-red-600 mt-3 text-sm underline hover:text-red-700">Submit Your Rating (Coming Soon)</button>
    </div>
    <div className="md:col-span-1 flex flex-col justify-center items-center p-6 bg-red-100 rounded-xl shadow-inner">
      <p className="text-sm text-gray-700 mb-3">Ready to book your stress-free stay?</p>
      <Button onClick={handleBookNow} className="w-full text-center">
        <CheckCircle size={20} className="inline mr-2" /> Book Now via Partner
      </Button>
      <p className="text-xs mt-2 text-gray-500">Booking handled securely by affiliate partner.</p>
    </div>
  </div>
</div>
);};// 9. Headroom Standard Pageconst StandardPage: React.FC = () => (<div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8"><h1 className="text-4xl font-bold text-gray-800 mb-6">Our Standard: Why We Certify</h1><p className="text-xl text-gray-600 mb-8">We eliminate the anxiety of travel for tall guests by applying a stringent, verifiable certification process to every property.</p>{/* Section: The Safety Buffer */}
<div className="mb-10 p-6 bg-red-50 rounded-xl border border-red-200">
    <h2 className="text-2xl font-semibold text-red-600 mb-3">1. The Safety Buffer (The $5\text{ cm}$ Rule)</h2>
    <p className="mb-4 text-gray-700">
        A property must have a minimum measured clearance of **$6\text{ ft}\ 7\text{ in}$ ($201\text{ cm}$) for a guest to be rated at $6\text{ ft}\ 5\text{ in}$ ($196\text{ cm}$). Why?
    </p>
    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
        <li>**Dynamic Movement:** When you walk, your body slightly lifts off the ground at the push-off point of your stride. This requires approximately $5\text{ cm}$ or $2\text{ in}$ of vertical clearance.</li>
        <li>**Our Guarantee:** We subtract a mandatory **$5\text{ cm}$ ($2\text{ in}$) safety buffer** from the lowest measured point (door, beam, ceiling) to determine the property's true **Max Height Rating**.</li>
        <li>**No Surprises:** A property rated at $6\text{ ft}\ 6\text{ in}$ ($198\text{ cm}$) means a $6\text{ ft}\ 6\text{ in}$ guest can walk, stretch, and jump without fear of injury.</li>
    </ul>
</div>

{/* Section: The Certification Process */}
<h2 className="text-2xl font-semibold text-gray-800 mt-12 mb-4">2. The Certification Process: Photo Proof</h2>
<div className="space-y-6">
    <div className="flex items-start space-x-4">
        <Maximize size={32} className="text-gray-700 flex-shrink-0" />
        <div>
            <h3 className="text-xl font-semibold">Vetting Measurements</h3>
            <p className="text-gray-600">Property owners must submit the actual measurement of the lowest possible point for every area: main doors, bathroom entrances, and structural beams.</p>
        </div>
    </div>
    <div className="flex items-start space-x-4">
        <Search size={32} className="text-gray-700 flex-shrink-0" />
        <div>
            <h3 className="text-xl font-semibold">The Photo Verification</h3>
            <p className="text-gray-600">The most important step: The owner must submit **photo evidence** showing a tape measure clearly documenting the full height of the low points. We require branded Headroom Havens tape (or a recognizable ruler) to verify the data's integrity.</p>
        </div>
    </div>
    <div className="flex items-start space-x-4">
        <Bed size={32} className="text-gray-700 flex-shrink-0" />
        <div>
            <h3 className="text-xl font-semibold">Bed Length Verification</h3>
            <p className="text-gray-600">We verify the **usable mattress length** (excluding frames/footboards). Only mattresses over $205\text{ cm}$ ($6\text{ ft}\ 8\text{ in}$) qualify for listing on our site.</p>
        </div>
    </div>
</div>
</div>);// 10. Router and Main App Componentconst App: React.FC = () => {const [currentPage, setCurrentPage] = useState<string>("home");const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);const navigate = (path: string, propertyId: number | null = null) => {setCurrentPage(path);setSelectedPropertyId(propertyId);window.scrollTo(0, 0); // Scroll to top on navigation};const selectedProperty = useMemo(() => {return MOCK_PROPERTIES.find(p => p.id === selectedPropertyId) || MOCK_PROPERTIES[0];}, [selectedPropertyId]);let content;switch (currentPage) {case "listings":content = <ListingsPage navigate={navigate} />;break;case "standard":content = <StandardPage />;break;case "detail":content = <DetailPage property={selectedProperty} />;break;case "home":default:content = <HomePage navigate={navigate} />;}// --- STYLING INJECTION (Workaround for CodeSandbox/Netlify) ---const TailwindStyles = () => (<styledangerouslySetInnerHTML={{__html: `/* This injects the core Tailwind directives */@tailwind base;@tailwind components;@tailwind utilities;      /* Custom body font and background */
      body {
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
        background-color: #f7f7f7;
      }
    `,
  }}
/>
);// --- END STYLING INJECTION ---return (<div className="min-h-screen flex flex-col"><TailwindStyles /><Header navigate={navigate} currentPage={currentPage} /><main className="flex-grow">{content}</main><Footer /></div>);};export default App;
