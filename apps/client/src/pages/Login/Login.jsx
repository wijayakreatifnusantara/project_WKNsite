/**
 * 🔒 DESIGN LOCK: FINAL & LOCKED
 * Component: Login.jsx
 * Style: Red Embossed (Neumorphism), Non-Scrollable Frame, Soft Fade-in Animation
 * This component has been finalized and should NOT be modified.
 */
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, Lock, Mail, Loader2, AlertCircle, Shield, CheckCircle } from "lucide-react";


import { useAuth } from '@/context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 🚀 Call the professional login function from AuthContext
      await login(email, password);
      // On success, AuthContext handles state and redirect is managed by App.jsx
    } catch (err) {
      setError(err.message || 'Login gagal. Periksa kembali email dan password Anda.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center p-4 bg-[#f0f2f5] overflow-hidden animate-fade-in">
      <div className="w-full max-w-[420px] transition-all duration-500 ease-out">
        {/* Embossed Card with Integrated Logo */}
        <Card className="border-white shadow-[12px_12px_24px_#d1d9e6,-12px_-12px_24px_#ffffff] bg-[#f0f2f5] rounded-[2.5rem] overflow-hidden border-[4px] sm:border-[5px]">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col items-center text-center mb-4 sm:mb-5 space-y-2 sm:space-y-3">
              <img src="/assets/wkn_logo.png" alt="WKN Logo" className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md" />
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">WKN<span className="text-[#E31E24]">site</span></h1>
                <p className="text-slate-400 text-[10px] sm:text-xs font-black uppercase tracking-widest opacity-60">Corporate Management System</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      className="h-10 sm:h-11 pl-11 border-transparent bg-[#f0f2f5] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] focus:ring-1 focus:ring-[#E31E24]/20 transition-all rounded-xl text-xs sm:text-sm font-bold text-slate-700 placeholder:text-slate-300"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="password" className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-10 sm:h-11 pl-11 pr-11 border-transparent bg-[#f0f2f5] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] focus:ring-1 focus:ring-[#E31E24]/20 transition-all rounded-xl text-xs sm:text-sm font-bold text-slate-700 placeholder:text-slate-300"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-2.5 bg-red-50 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-2 border border-red-100 animate-shake">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-10 sm:h-11 text-xs sm:text-sm font-black bg-[#E31E24] hover:bg-[#C1181E] text-white rounded-xl shadow-[5px_5px_15px_rgba(227,30,36,0.3)] transition-all duration-300 transform active:scale-[0.98] uppercase tracking-widest"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </div>
                ) : (
                  "SIGN IN"
                )}
              </Button>
            </form>

            <div className="mt-6 flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1.5 text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">
                  <Shield className="w-3 h-3 text-[#E31E24]/40" />
                  <span>Secure SSL</span>
                </div>
                <div className="w-1 h-1 bg-slate-200 rounded-full" />
                <div className="flex items-center space-x-1.5 text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">
                  <CheckCircle className="w-3 h-3 text-emerald-500/40" />
                  <span>Encrypted</span>
                </div>
              </div>

              <div className="text-center space-y-1.5">
                <p className="text-[8px] text-slate-300 font-black uppercase tracking-[0.2em]">
                  &copy; 2026 Wijaya Kreatif Nusantara
                </p>
                <div className="inline-block text-[8px] text-slate-400 font-black bg-white/50 px-2.5 py-0.5 rounded-full border border-slate-100 uppercase tracking-widest">
                  IMS VERSION 1.2.0 • OPTIMIZED FOR MOBILE
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
