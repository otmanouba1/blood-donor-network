import { ArrowLeft, Shield, User, MapPin } from 'lucide-react';

const SimpleLabProfile = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => window.history.back()} className="p-2 hover:bg-white/60 rounded-xl transition-all duration-300">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <img src="/blooddonner.png" alt="Blood Donor Network" className="w-8 h-8" />
              <h1 className="text-2xl font-black text-slate-900">Blood Donor Network</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-xl">
              <User className="w-5 h-5 text-white" />
            </div>
            Lab Profile (Simplified)
          </h2>
          
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-2xl">
              <h3 className="font-bold text-slate-900 mb-2">Profile Information</h3>
              <p className="text-slate-600">This is a simplified version of the lab profile page.</p>
              <p className="text-slate-600">If you can see this, the routing is working.</p>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-2xl">
              <h3 className="font-bold text-slate-900 mb-2">Status</h3>
              <p className="text-slate-600">Lab profile page loaded successfully.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleLabProfile;