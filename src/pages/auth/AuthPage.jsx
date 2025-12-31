import React from 'react';
import { Link } from 'react-router-dom';
import { User, Building2, ArrowRight, Heart } from 'lucide-react';

const AuthPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img src="/blooddonner.png" alt="Blood Donor Network" className="w-12 h-12" />
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Blood Donor Network</h1>
          </div>
          <p className="text-lg text-slate-600">Choose how you'd like to join our life-saving mission</p>
        </div>

        {/* Registration Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Donor Registration */}
          <Link to="/register/donor" className="group">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-8 text-center border-t-4 border-t-red-600">
              <div className="p-4 bg-red-50 rounded-xl text-red-600 w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-4">Register as Donor</h2>
              <p className="text-slate-500 font-medium mb-6">
                Join thousands of heroes saving lives through blood donation. Quick registration, flexible scheduling.
              </p>
              <div className="flex items-center justify-center gap-2 text-red-600 font-semibold group-hover:gap-3 transition-all">
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </Link>

          {/* Facility Registration */}
          <Link to="/register/facility" className="group">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-8 text-center border-t-4 border-t-blue-600">
              <div className="p-4 bg-blue-50 rounded-xl text-blue-600 w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-4">Register Facility</h2>
              <p className="text-slate-500 font-medium mb-6">
                Register your hospital or blood lab to manage inventory, requests, and connect with donors.
              </p>
              <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </Link>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-slate-600 mb-4">Already have an account?</p>
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all duration-300"
          >
            Sign In to Your Account
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-slate-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">50K+</div>
            <div className="text-sm text-slate-500">Lives Saved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">500+</div>
            <div className="text-sm text-slate-500">Partner Facilities</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600 mb-1">24/7</div>
            <div className="text-sm text-slate-500">Emergency Support</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;