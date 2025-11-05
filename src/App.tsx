import React, { useState, useMemo } from "react";
import {
  Home,
  Filter,
  Map,
  Bed,
  CheckSquare,
  X,
  DollarSign,
  ChevronRight,
  Menu,
  Loader,
} from "lucide-react";

// === HERO IMAGE URL (TEMPORARY PLACEHOLDER) ===
// NOTE: REPLACE THIS URL with your final hosted image link (e.g., https://headroomhavens.com/assets/tallman.jpg)
const HERO_IMAGE_URL =
  "https://placehold.co/800x600/f87171/ffffff?text=Photorealistic+Cottage+Doorway+%2B+Tall+Man";
// ===============================================

// --- APPLICATION DATA ---
// NOTE: In a real app, this data would be fetched from a database (like Firebase Firestore)
const INITIAL_PROPERTIES = [
  {
    id: 1,
    name: "The Gilded Barn Retreat",
    location: "Cotswolds, UK",
    priceRange: "£££",
    maxHeightCm: 225, // 7ft 4in clearance
    maxHeightImperial: "7 ft 3 in", // Max Comfortable User Height
    bedLengthCm: 215,
    rating: 4.8,
    image:
      "https://placehold.co/600x400/94a3b8/ffffff?text=Cotswold+Barn+Lodge",
    details:
      "An exceptionally tall barn conversion featuring vaulted ceilings and bespoke American King beds. Guaranteed no head hazards.",
    affiliateLink: "https://partner.booking.com/?aid=Headroom_Barn_123",
    lat: 51.782, // Mock coordinates
    lng: -1.787,
  },
  {
    id: 2,
    name: "Skye Lighthouse Keeper's Quarters",
    location: "Isle of Skye, UK",
    priceRange: "££",
    maxHeightCm: 205, // 6ft 9in clearance
    maxHeightImperial: "6 ft 6 in",
    bedLengthCm: 205,
    rating: 4.2,
    image:
      "https://placehold.co/600x400/1e3a8a/ffffff?text=Skye+Lighthouse+Stay",
    details:
      "Historic property with carefully measured clearances. Note: one beam in the kitchen measures 205cm. Bed is King-size, open-ended.",
    affiliateLink: "https://partner.expedia.com/?aid=Headroom_Lighthouse_456",
    lat: 57.412,
    lng: -6.445,
  },
  {
    id: 3,
    name: "High-Beam Central Loft",
    location: "London, UK",
    priceRange: "££££",
    maxHeightCm: 245, // 8ft 0in clearance
    maxHeightImperial: "7 ft 11 in",
    bedLengthCm: 220,
    rating: 5.0,
    image:
      "https://placehold.co/600x400/34d399/ffffff?text=London+High+Ceiling+Loft",
    details:
      "Modern luxury loft in Shoreditch. Industrial design with minimal obstructions. Features a true California King bed (220cm).",
    affiliateLink: "https://partner.booking.com/?aid=Headroom_London_789",
    lat: 51.523,
    lng: -0.076,
  },
  {
    id: 4,
    name: "The Long-Lodge Cabin",
    location: "Lake District, UK",
    priceRange: "££",
    maxHeightCm: 215, // 7ft 0in clearance
    maxHeightImperial: "6 ft 10 in",
    bedLengthCm: 210,
    rating: 4.6,
    image:
      "https://placehold.co/600x400/fde047/000000?text=Lake+District+Lodge",
    details:
      "A purpose-built wooden lodge optimized for height, featuring extra-tall shower heads and no footboards. Excellent outdoor views.",
    affiliateLink:
      "https://partner.boutiqueretreats.com/?aid=Headroom_Lodge_987",
    lat: 54.46,
    lng: -3.088,
  },
];

// --- MAX HEIGHT RATING TABLE (Simplified for Display) ---
const MAX_HEIGHT_RATINGS = [
  { label: "6 ft 4 in / 193 cm", maxCm: 193 },
  { label: "6 ft 6 in / 198 cm", maxCm: 198 },
  { label: "6 ft 8 in / 203 cm", maxCm: 203 },
  { label: "7 ft 0 in / 213 cm", maxCm: 213 },
  { label: "7 ft 3 in / 221 cm", maxCm: 221 },
];

// --- COMPONENTS ---

// 1. Logo Component (IHI style - H slightly taller)
const Logo = ({ className = "" }) => (
  <div
    className={`flex items-center text-xl font-extrabold tracking-tight ${className}`}
  >
    <span className="text-red-600 text-3xl font-serif mr-1 leading-none">
      |
    </span>
    <span
      className="text-gray-900 text-4xl font-serif font-black leading-none"
      style={{ fontSize: "2.3rem" }}
    >
      H
    </span>
    <span className="text-red-600 text-3xl font-serif ml-1 mr-3 leading-none">
      |
    </span>
    <span className="text-gray-800">HEADROOM</span>
    <span className="text-red-600 ml-1">HAVENS</span>
  </div>
);

// 2. Header and Navigation
const Header = ({ navigate }) => (
  <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-md">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
      <div onClick={() => navigate("home")} className="cursor-pointer">
        <Logo />
      </div>
      <nav className="hidden md:flex space-x-8 text-gray-600 font-medium">
        <button
          onClick={() => navigate("home")}
          className="hover:text-red-600 transition flex items-center"
        >
          <Home size={18} className="mr-1" /> Home
        </button>
        <button
          onClick={() => navigate("listings")}
          className="hover:text-red-600 transition flex items-center"
        >
          <Filter size={18} className="mr-1" /> Find a Place with Headroom
        </button>
        <button
          onClick={() => navigate("standards")}
          className="hover:text-red-600 transition flex items-center"
        >
          <CheckSquare size={18} className="mr-1" /> Our Standard
        </button>
      </nav>
      <div className="md:hidden">
        <Menu size={24} className="text-gray-800" />
      </div>
    </div>
  </header>
);

// 3. Homepage Component
const HomePage = ({ navigate }) => (
  <div className="relative pt-16 pb-20 bg-gray-50 overflow-hidden">
    {/* Hero Section */}
    <div className="relative max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row items-center">
        <div className="lg:w-1/2 px-4 sm:px-6 lg:px-8 pt-12 lg:pt-0 order-2 lg:order-1">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Holiday Cottages <span className="text-red-600">with Headroom</span>
          </h1>
          <p className="mt-6 text-xl text-gray-500 max-w-xl">
            Guaranteed comfort and verified clearance for travelers **6 ft 0
            in** (183 cm) and taller. Stop the Stoop. Start the Holiday.
          </p>
          <div className="mt-10 flex">
            <button
              onClick={() => navigate("listings")}
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-red-600 hover:bg-red-700 shadow-lg transform transition duration-150 ease-in-out hover:scale-105"
            >
              Find a Place with Headroom
              <ChevronRight size={18} className="ml-2" />
            </button>
          </div>
        </div>
        <div className="lg:w-1/2 w-full order-1 lg:order-2">
          {/* Hero Image */}
          <img
            className="w-full h-96 object-cover object-bottom shadow-2xl rounded-bl-3xl"
            src={HERO_IMAGE_URL}
            alt="Tall man standing comfortably in a high doorway"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://placehold.co/800x600/f87171/ffffff?text=Error:+Image+Loading+Failed";
            }}
          />
        </div>
      </div>
    </div>

    {/* Section: The Headroom Standard Snapshot */}
    <HeadroomStandardSnapshot navigate={navigate} />

    {/* Section: Featured Listings (Snapshot) */}
    <FeaturedListingsSnapshot navigate={navigate} />
  </div>
);

// Helper for the Homepage Snapshot
const HeadroomStandardSnapshot = ({ navigate }) => (
  <div className="mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-10">
      The Headroom Standard: Guaranteed Comfort
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <CheckSquare size={36} className="text-red-600 mb-3" />
        <h3 className="text-xl font-semibold text-gray-900">
          Verified Clearance
        </h3>
        <p className="mt-2 text-gray-600">
          Every door frame, ceiling, and beam is measured and confirmed against
          our safety buffer of 5 cm (2 in).
        </p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <Bed size={36} className="text-red-600 mb-3" />
        <h3 className="text-xl font-semibold text-gray-900">Extra-Long Beds</h3>
        <p className="mt-2 text-gray-600">
          No more feet dangling. We only list properties with mattresses of 205
          cm or longer, plus open footboards.
        </p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <Map size={36} className="text-red-600 mb-3" />
        <h3 className="text-xl font-semibold text-gray-900">
          High-End Curation
        </h3>
        <p className="mt-2 text-gray-600">
          A collection of boutique cottages and luxury retreats across the UK,
          chosen for style and space.
        </p>
      </div>
    </div>
    <div className="text-center mt-12">
      <button
        onClick={() => navigate("standards")}
        className="text-red-600 hover:text-red-700 font-medium flex items-center justify-center mx-auto"
      >
        Learn How We Certify Properties{" "}
        <ChevronRight size={16} className="ml-1" />
      </button>
    </div>
  </div>
);

const FeaturedListingsSnapshot = ({ navigate }) => (
  <div className="mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
      Featured Havens
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {INITIAL_PROPERTIES.slice(0, 3).map((p) => (
        <div
          key={p.id}
          className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 cursor-pointer hover:shadow-xl transition"
          onClick={() => navigate("details", p)}
        >
          <img
            src={p.image}
            alt={p.name}
            className="h-48 w-full object-cover"
          />
          <div className="p-4">
            <h3 className="text-xl font-bold text-gray-900">{p.name}</h3>
            <p className="text-gray-500 text-sm mt-1">{p.location}</p>
            <div className="mt-3 flex justify-between items-center">
              <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full text-red-800 bg-red-100 mr-3">
                Max Height: {p.maxHeightImperial}
              </span>
              <span className="text-lg font-bold text-gray-700">
                {p.priceRange}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
    <div className="text-center mt-12">
      <button
        onClick={() => navigate("listings")}
        className="inline-flex items-center px-6 py-3 border border-red-600 text-base font-medium rounded-full text-red-600 hover:text-white hover:bg-red-600 transition duration-150 ease-in-out"
      >
        View All Headroom Havens
      </button>
    </div>
  </div>
);

// 4. Listings Page Component
const ListingsPage = ({ navigate }) => {
  const [filters, setFilters] = useState({
    maxHeight: "",
    price: "",
  });

  const [loading, setLoading] = useState(false);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === prev[key] ? "" : value,
    }));
  };

  // Filtering Logic
  const filteredProperties = useMemo(() => {
    return INITIAL_PROPERTIES.filter((p) => {
      // Filter by Max Height Rating (Max Comfortable User Height)
      if (filters.maxHeight) {
        const requiredCm = MAX_HEIGHT_RATINGS.find(
          (r) => r.label === filters.maxHeight
        ).maxCm;
        // Since the property maxHeightCm is the actual clearance,
        // we compare the required CM (user height + 5cm buffer) to the clearance
        const clearanceRequired = requiredCm + 5; // Simplified logic: user height + 5cm buffer
        if (p.maxHeightCm < clearanceRequired) {
          return false;
        }
      }
      // Filter by Price Range
      if (filters.price && p.priceRange !== filters.price) {
        return false;
      }
      return true;
    });
  }, [filters]);

  const handleSearch = () => {
    setLoading(true);
    // Simulate network delay for effect
    setTimeout(() => {
      setLoading(false);
      // In a real app, this is where you'd fetch filtered data
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-8">
        Find Your Headroom Haven
      </h2>

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8 flex flex-wrap gap-4 items-center">
        <Filter size={24} className="text-gray-500 mr-2 hidden sm:block" />
        <div className="font-medium text-gray-700 mr-4">Filter by:</div>

        {/* Max Height Filter */}
        <div className="flex flex-wrap gap-2">
          <label className="text-sm font-medium text-gray-700 w-full sm:w-auto">
            Max User Height:
          </label>
          {MAX_HEIGHT_RATINGS.map((r) => (
            <button
              key={r.label}
              onClick={() => handleFilterChange("maxHeight", r.label)}
              className={`px-3 py-1 text-sm rounded-full transition ${
                filters.maxHeight === r.label
                  ? "bg-red-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Price Range Filter */}
        <div className="flex flex-wrap gap-2 ml-auto sm:ml-4">
          <label className="text-sm font-medium text-gray-700 w-full sm:w-auto">
            Price:
          </label>
          {["££", "£££", "££££"].map((price) => (
            <button
              key={price}
              onClick={() => handleFilterChange("price", price)}
              className={`px-3 py-1 text-sm rounded-full transition ${
                filters.price === price
                  ? "bg-red-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {price}
            </button>
          ))}
        </div>

        <button
          onClick={handleSearch}
          className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-gray-900 hover:bg-gray-700 transition flex items-center"
          disabled={loading}
        >
          {loading ? (
            <Loader size={20} className="animate-spin mr-2" />
          ) : (
            <Filter size={18} className="mr-2" />
          )}
          {loading ? "Searching..." : "Apply Filters"}
        </button>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="text-center py-10 text-gray-600 flex justify-center items-center">
          <Loader size={32} className="animate-spin mr-3 text-red-600" />{" "}
          Loading results...
        </div>
      ) : filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
          {filteredProperties.map((p) => (
            <PropertyCard key={p.id} property={p} navigate={navigate} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-600 border border-dashed p-10 rounded-xl mt-6">
          <X size={40} className="text-red-400 mx-auto mb-3" />
          <p className="font-semibold text-lg">No Havens Found.</p>
          <p className="text-sm">
            Try relaxing your search criteria to find a certified property.
          </p>
        </div>
      )}
    </div>
  );
};

// Property Card Component (used in Listings Page)
const PropertyCard = ({ property, navigate }) => (
  <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transform hover:scale-[1.01] transition duration-200">
    <img
      src={property.image}
      alt={property.name}
      className="h-56 w-full object-cover"
    />
    <div className="p-6">
      <h3 className="text-2xl font-bold text-gray-900">{property.name}</h3>
      <p className="text-gray-500 text-md mt-1">{property.location}</p>

      <div className="mt-4 space-y-2">
        <div className="flex items-center text-sm font-medium text-gray-700">
          <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full text-red-800 bg-red-100 mr-3">
            HEADROOM CERTIFIED
          </span>
          <span className="text-xl font-bold text-red-600">
            {property.maxHeightImperial}
          </span>
          <span className="text-gray-500 ml-1">
            / {property.maxHeightCm} cm
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Bed size={16} className="text-gray-400 mr-2" />
          Bed Length: {property.bedLengthCm} cm
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <DollarSign size={16} className="text-gray-400 mr-2" />
          Price Range: {property.priceRange}
        </div>
      </div>

      <button
        onClick={() => navigate("details", property)}
        className="mt-6 w-full py-2 border border-transparent text-base font-medium rounded-full text-white bg-gray-900 hover:bg-red-600 transition duration-150"
      >
        View Details
      </button>
    </div>
  </div>
);

// 5. Property Detail Page Component
const DetailPage = ({ property }) => {
  const handleBookNow = () => {
    console.log(`Redirecting to affiliate link: ${property.affiliateLink}`);
    // NOTE: In a real browser, this would redirect the user.
    window.open(property.affiliateLink, "_blank");
    alert(
      `Redirecting to partner site for booking (Affiliate Tracked!). Link: ${property.affiliateLink}`
    );
  };

  // Mock Google Map Embed URL (static for a single file app)
  const mapSrc = `https://maps.google.com/maps?q=${property.lat},${property.lng}&z=15&output=embed`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Image and Header */}
        <div className="relative">
          <img
            src={property.image.replace("600x400", "1200x600")}
            alt={property.name}
            className="h-[400px] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-8 flex items-end">
            <h1 className="text-4xl font-extrabold text-white">
              {property.name}
            </h1>
          </div>
        </div>

        <div className="p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Details */}
          <div className="lg:col-span-2">
            <p className="text-lg text-gray-700 mb-6">{property.details}</p>

            <div className="space-y-4 border-b pb-6 mb-6">
              <h2 className="text-2xl font-bold text-red-600 flex items-center">
                <CheckSquare size={24} className="mr-3" /> Headroom Certified
                Details
              </h2>
              <p className="text-gray-800 font-semibold text-xl">
                Max User Height Rating:{" "}
                <span className="text-red-600">
                  {property.maxHeightImperial}
                </span>{" "}
                ( {property.maxHeightCm} cm)
              </p>
              <p className="text-gray-700">
                **Lowest Clearance Point:** {property.maxHeightCm + 5} cm (or
                higher)
              </p>
              <p className="text-gray-700">
                **Bed Length (Usable):** {property.bedLengthCm} cm
              </p>
              <p className="text-gray-700">
                **Price Range:** {property.priceRange}
              </p>
            </div>

            {/* Member Comfort Rating Section */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Member Comfort Rating ({property.rating}/5.0)
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                This rating is submitted by verified Headroom Havens customers
                and manually approved by our team to maintain data integrity and
                trust.
              </p>
              <div className="flex items-center space-x-4">
                <div className="text-4xl font-bold text-red-600">
                  {property.rating}
                </div>
                <div className="text-sm text-gray-500">
                  Based on {Math.floor(property.rating * 10)} stays.
                </div>
              </div>
            </div>

            <button
              onClick={handleBookNow}
              className="mt-8 w-full py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-red-600 hover:bg-red-700 shadow-2xl transform transition duration-150 ease-in-out hover:scale-[1.01]"
            >
              Book Now via Partner Site (Affiliate Tracked!)
            </button>
          </div>

          {/* Right Column: Location Map */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-gray-100 p-6 rounded-xl shadow-inner">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Map size={20} className="mr-2 text-red-600" /> Location
              </h3>
              <p className="text-gray-700 mb-4">{property.location}</p>
              <iframe
                src={mapSrc}
                width="100%"
                height="250"
                style={{ border: 0, borderRadius: "12px" }}
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 6. Headroom Standard Page Component
const HeadroomStandardPage = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 className="text-4xl font-extrabold text-gray-900 mb-6">
      The Headroom Standard: How We Certify Comfort
    </h1>
    <p className="text-xl text-gray-600 mb-10">
      For tall travelers, disappointment isn't just discomfort—it's a physical
      risk. Our standard ensures that when you book a Headroom Haven, the space
      is guaranteed to fit you.
    </p>

    <section className="mb-10">
      <h2 className="text-3xl font-bold text-red-600 mb-4">
        1. The Safety Buffer: Why 5 cm Matters
      </h2>
      <p className="mb-4 text-gray-700">
        Standard accommodation often ignores the clearance needed for natural
        movement. Our **Max Height Rating** uses a clear 5 cm (**2 in**) safety
        buffer. We take the lowest measured point in the property (door,
        ceiling, or beam) and subtract 5 cm. This resulting number is the
        **Maximum Comfortable User Height**.
      </p>
      <p className="font-semibold text-gray-800">
        Example: If a doorway measures 203 cm (6 ft 8 in), the Max Height Rating
        is set at 198 cm (6 ft 6 in), guaranteeing 5 cm of clearance above the
        head of a person of that height.
      </p>
    </section>

    <section className="mb-10">
      <h2 className="text-3xl font-bold text-red-600 mb-4">
        2. The Photo Verification Process
      </h2>
      <p className="mb-4 text-gray-700">
        We demand proof, not just promises. To achieve the **Headroom
        Certified** badge, property owners must submit:
      </p>
      <ul className="list-disc list-inside space-y-2 text-gray-700">
        <li>
          **Measurement Photos:** Clear, high-quality photos showing a tape
          measure extended from the floor to the lowest point of the structure
          (door frame, beam, or ceiling).
        </li>
        <li>
          **Bed Length Photos:** Photos verifying the usable mattress length
          (from edge to edge, not the frame).
        </li>
        <li>
          **Footboard Confirmation:** Confirmation that the bed is open-ended,
          or the footboard height is negligible.
        </li>
      </ul>
    </section>

    <section>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        3. Max Height Rating Table
      </h2>
      <p className="mb-4 text-gray-700">
        Use this table to find your safety threshold:
      </p>
      <div className="overflow-x-auto rounded-lg shadow-md border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-red-600 text-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Measured Clearance (Lowest Point)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Max Comfortable User Height
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Max Height Rating (to Display)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-sm text-gray-700">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                6 ft 8 in (203 cm)
              </td>
              <td className="px-6 py-4 whitespace-nowrap">6 ft 6 in</td>
              <td className="px-6 py-4 whitespace-nowrap">198 cm</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                6 ft 10 in (208 cm)
              </td>
              <td className="px-6 py-4 whitespace-nowrap">6 ft 8 in</td>
              <td className="px-6 py-4 whitespace-nowrap">203 cm</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                7 ft 0 in (213 cm)
              </td>
              <td className="px-6 py-4 whitespace-nowrap">6 ft 10 in</td>
              <td className="px-6 py-4 whitespace-nowrap">208 cm</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                7 ft 2 in (218 cm)
              </td>
              <td className="px-6 py-4 whitespace-nowrap">7 ft 0 in</td>
              <td className="px-6 py-4 whitespace-nowrap">213 cm</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                7 ft 4 in (224 cm)
              </td>
              <td className="px-6 py-4 whitespace-nowrap">7 ft 2 in</td>
              <td className="px-6 py-4 whitespace-nowrap">218 cm</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
);

// 7. Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedProperty, setSelectedProperty] = useState(null);

  const navigate = (page, data = null) => {
    setCurrentPage(page);
    if (page === "details" && data) {
      setSelectedProperty(data);
    } else {
      setSelectedProperty(null);
    }
    window.scrollTo(0, 0); // Scroll to top on navigation
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage navigate={navigate} />;
      case "listings":
        return <ListingsPage navigate={navigate} />;
      case "standards":
        return <HeadroomStandardPage />;
      case "details":
        return selectedProperty ? (
          <DetailPage property={selectedProperty} />
        ) : (
          <HomePage navigate={navigate} />
        );
      default:
        return <HomePage navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header navigate={navigate} />
      <main>{renderPage()}</main>
      <footer className="bg-gray-900 text-white py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Logo className="text-white justify-center mb-4" />
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Headroom Havens. All Rights Reserved.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            <span className="font-bold text-red-600">
              Affiliate Disclosure:
            </span>{" "}
            We earn a commission on bookings made through partner links.
            Commission is paid after the guest completes their stay.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
