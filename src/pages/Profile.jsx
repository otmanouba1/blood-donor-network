import { Shield, User, ArrowLeft } from "lucide-react";

export default function Profile() {
  const token = localStorage.getItem("token");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Glassmorphism Navigation Bar */}
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
            
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-3xl">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-900">Profile</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <div className="text-center mb-8">
            <div className="p-4 bg-red-100 rounded-3xl w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Shield className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">User Profile</h2>
            <p className="text-slate-500">Manage your Blood Donor Network account</p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
            <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <div className="p-2 bg-red-600 rounded-xl">
                <User className="w-5 h-5 text-white" />
              </div>
              Authentication Status
            </h3>
            
            {token ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-emerald-900">Successfully Authenticated</p>
                    <p className="text-sm text-emerald-700">Your session is active and secure</p>
                  </div>
                </div>
                
                <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                  <p className="text-sm text-slate-600 mb-2">Session Token (Preview)</p>
                  <p className="font-mono text-slate-900 bg-slate-100 px-3 py-2 rounded-xl text-sm">
                    {token.substring(0, 20)}...
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-red-900">Authentication Required</p>
                  <p className="text-sm text-red-700">Please login to access your profile</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
