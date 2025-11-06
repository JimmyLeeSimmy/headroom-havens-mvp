import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams } from "react-router-dom";
import { Home, Info, Phone, Mail, Star, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const container = "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8";

const properties = [
  {
    id: 1,
    name: "Sea Breeze Cottage",
    location: "Cornwall, UK",
    price: "£250/night",
    description:
      "A charming coastal retreat with breathtaking sea views and direct beach access.",
    images: ["/images/cottage1.jpg", "/images/cottage2.jpg", "/images/cottage3.jpg"],
    features: ["3 Bedrooms", "2 Bathrooms", "Hot Tub", "Ocean View"],
  },
  {
    id: 2,
    name: "Mountain Haven",
    location: "Scottish Highlands",
    price: "£300/night",
    description:
      "Secluded cabin nestled in the Highlands — perfect for hiking and stargazing.",
    images: ["/images/mountain1.jpg", "/images/mountain2.jpg", "/images/mountain3.jpg"],
    features: ["2 Bedrooms", "Fireplace", "Sauna", "Panoramic View"],
  },
  {
    id: 3,
    name: "The Glass Lodge",
    location: "Lake District",
    price: "£400/night",
    description:
      "A modern glass-fronted lodge offering luxury comfort and tranquil lake views.",
    images: ["/images/lake1.jpg", "/images/lake2.jpg", "/images/lake3.jpg"],
    features: ["4 Bedrooms", "Private Dock", "Cinema Room", "Smart Home"],
  },
];

const Header = () => (
  <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100">
    <div className={`${container} flex justify-between items-center h-14 sm:h-16`}>
      <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-800">
        <Home className="w-5 h-5 text-blue-600" />
        Headroom Havens
      </Link>
      <nav className="flex items-center gap-6 text-sm sm:text-base">
        <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <Link to="/about" className="hover:text-blue-600 transition-colors">About</Link>
        <Link to="/listings" className="hover:text-blue-600 transition-colors">Havens</Link>
        <Link to="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
      </nav>
    </div>
  </header>
);

const Footer = () => (
  <footer className="bg-gray-800 text-white mt-10">
    <div className={`${container} py-6 text-center text-sm`}>
      <p>&copy; {new Date().getFullYear()} Headroom Havens. All rights reserved.</p>
    </div>
  </footer>
);

const HomePage = () => (
  <motion.div
    className="text-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.6 }}
  >
    <div className="relative bg-gray-900 text-white py-24">
      <div className={`${container}`}>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Discover Your Perfect Escape
        </h1>
        <p className="text-lg text-gray-300 mb-6">
          Handpicked luxury havens designed for comfort, calm, and unforgettable stays.
        </p>
        <Link
          to="/listings"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg shadow-lg transition"
        >
          Explore Havens
        </Link>
      </div>
    </div>

    <div className={`${container} py-10`}>
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        The Headroom Havens Standard
      </h2>
      <div className="grid md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {["Luxury", "Nature", "Comfort"].map((feature, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition"
          >
            <Star className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature}</h3>
            <p className="text-gray-600 text-sm">
              Experience world-class amenities, serene landscapes, and top-tier design.
            </p>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

const ListingsPage = () => {
  const [filter, setFilter] = useState("");
  const filteredProperties = properties.filter(
    (p) =>
      p.name.toLowerCase().includes(filter.toLowerCase()) ||
      p.location.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className={`${container} py-10`}>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Available Havens</h1>
        <input
          type="text"
          placeholder="Search by name or location..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredProperties.map((property) => (
          <Link
            key={property.id}
            to={`/property/${property.id}`}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <img
              src={property.images[0]}
              alt={property.name}
              className="w-full h-56 md:h-60 object-cover object-center"
            />
            <div className="p-4 md:p-5 space-y-2">
              <h3 className="text-lg font-bold text-gray-800 leading-tight">
                {property.name}
              </h3>
              <p className="text-gray-600 text-sm flex items-center gap-1">
                <MapPin className="w-4 h-4 text-blue-600" />
                {property.location}
              </p>
              <p className="text-blue-600 font-semibold">{property.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const PropertyDetailPage = () => {
  const { id } = useParams();
  const property = properties.find((p) => p.id === parseInt(id || "0"));

  if (!property) return <div className="text-center py-20 text-gray-500">Property not found.</div>;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <h1 className="text-4xl font-bold text-gray-800">{property.name}</h1>
      <div className="relative w-full aspect-[16/9] rounded-xl shadow-md overflow-hidden">
        <img
          src={property.images[0]}
          alt={property.name}
          className="object-cover w-full h-full object-center"
        />
      </div>
      <div className="text-gray-600 text-lg leading-relaxed">{property.description}</div>
      <ul className="grid sm:grid-cols-2 gap-4">
        {property.features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-gray-700">
            <Star className="w-4 h-4 text-blue-600" /> {f}
          </li>
        ))}
      </ul>
    </div>
  );
};

const AboutPage = () => (
  <div className={`${container} py-10 text-center`}>
    <h1 className="text-3xl font-bold text-gray-800 mb-4">About Headroom Havens</h1>
    <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
      Headroom Havens curates a portfolio of luxury retreats across the UK. Each haven
      embodies exceptional design, serene locations, and unparalleled hospitality.
    </p>
  </div>
);

const ContactPage = () => (
  <div className={`${container} py-10 text-center`}>
    <h1 className="text-3xl font-bold text-gray-800 mb-4">Contact Us</h1>
    <div className="text-gray-600 max-w-lg mx-auto space-y-4">
      <p>We’d love to hear from you. Reach out with any inquiries or booking requests.</p>
      <div className="flex justify-center flex-col sm:flex-row gap-4 text-sm">
        <a href="mailto:info@headroomhavens.com" className="flex items-center gap-2 text-blue-600 hover:underline">
          <Mail className="w-4 h-4" /> info@headroomhavens.com
        </a>
        <a href="tel:+441234567890" className="flex items-center gap-2 text-blue-600 hover:underline">
          <Phone className="w-4 h-4" /> +44 1234 567 890
        </a>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/property/:id" element={<PropertyDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
