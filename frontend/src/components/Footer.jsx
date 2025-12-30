import React from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "About Us", path: "/about" },
    { name: "Our Mission", path: "/mission" },
    { name: "Success Stories", path: "/stories" },
    { name: "News & Updates", path: "/news" },
  ];

  const donorResources = [
    { name: "Become a Donor", path: "/register/donor" },
    { name: "Eligibility Criteria", path: "/eligibility" },
    { name: "Donation Process", path: "/process" },
    { name: "Donor Benefits", path: "/benefits" },
  ];

  const hospitalResources = [
    { name: "Partner with Us", path: "/register/facility" },
    { name: "Blood Request", path: "/request-blood" },
    { name: "Inventory Management", path: "/inventory" },
    { name: "Emergency Protocol", path: "/emergency" },
  ];

  const socialLinks = [
    { icon: Facebook, name: "Facebook", url: "#" },
    { icon: Twitter, name: "Twitter", url: "#" },
    { icon: Instagram, name: "Instagram", url: "#" },
    { icon: Linkedin, name: "LinkedIn", url: "#" },
  ];

  return (
    <footer className="bg-slate-900 text-white relative">
      <div className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
        {/* Brand */}
        <div>
          <Link to="/" className="flex items-center gap-3 mb-6">
            <div className="w-16 h-16 flex items-center justify-center rounded-xl shadow-lg">
              <img
                src="/blooddonner.png"
                alt="Blood Donor"
                className="w-12 h-12 object-contain"
              />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">BloodDonner</h2>
              <p className="text-red-200 text-sm">Life Saver Network</p>
            </div>
          </Link>
          <p className="text-gray-300 mb-6 leading-relaxed">
            Connecting compassionate donors with those in need through advanced
            blood bank technology. Together, we save lives.
          </p>
          <div className="flex gap-4">
            {socialLinks.map((social, idx) => {
              const Icon = social.icon;
              return (
                <a
                  key={idx}
                  href={social.url}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-red-600 transition-all duration-300 hover:scale-110"
                  aria-label={social.name}
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-6 text-white flex items-center gap-2">
            <span className="w-1 h-4 bg-red-500 rounded-full"></span>
            Quick Links
          </h3>
          <ul className="space-y-3">
            {quickLinks.map((link, idx) => (
              <li key={idx}>
                <Link
                  to={link.path}
                  className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Donor Resources */}
        <div>
          <h3 className="text-lg font-semibold mb-6 text-white flex items-center gap-2">
            <span className="w-1 h-4 bg-red-500 rounded-full"></span>
            For Donors
          </h3>
          <ul className="space-y-3">
            {donorResources.map((link, idx) => (
              <li key={idx}>
                <Link
                  to={link.path}
                  className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Hospital Resources & Contact */}
        <div>
          <h3 className="text-lg font-semibold mb-6 text-white flex items-center gap-2">
            <span className="w-1 h-4 bg-red-500 rounded-full"></span>
            For Hospitals
          </h3>
          <ul className="space-y-3">
            {hospitalResources.map((link, idx) => (
              <li key={idx}>
                <Link
                  to={link.path}
                  className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3 text-gray-300">
              <Phone className="w-4 h-4 text-red-400" />
              <span>Emergency Hotline:15</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <Mail className="w-4 h-4 text-red-400" />
              <span>help@BloodDonner.org</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <MapPin className="w-4 h-4 text-red-400" />
              <span>Nationwide Network</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-gray-400 text-sm">
            © {currentYear} BloodDonner . All rights reserved.
          </span>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="hover:text-white transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>

      {/* Floating Donate Button */}
      <Link
        to="/register/donor"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-full shadow-2xl hover:scale-105 transition-all duration-300 hover:from-red-700 hover:to-red-800"
      >
        <Heart className="w-5 h-5" />
        Donate Now
      </Link>
    </footer>
  );
};

export default Footer;
