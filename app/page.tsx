'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Link as LinkIcon, TrendingUp, Lock, Users, Award, ArrowRight, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: <LinkIcon className="w-6 h-6" />,
      title: "Unified Asset Linking",
      description: "Securely connect all your banks, crypto wallets, brokerage accounts, and investment portfolios in one encrypted dashboard."
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Bank-Grade Security",
      description: "End-to-end encryption, biometric login support, real-time fraud monitoring, and SOC 2 compliant infrastructure."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Intelligent Portfolio Insights",
      description: "Real-time market data, performance analytics, risk assessment, and personalized recommendations powered by advanced algorithms."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Digital Trust & Fiduciary Standards",
      description: "Built with fiduciary responsibility in mind. Full audit trails, transparent fee structure, and dedicated trust officers available."
    }
  ];

  const testimonials = [
    {
      name: "Elena Rodriguez",
      role: "Real Estate Investor, Miami",
      quote: "Milly's Trust transformed how I manage my properties and investments. Linking everything gave me complete peace of mind and saved hours every month."
    },
    {
      name: "Marcus Chen",
      role: "Tech Entrepreneur & Angel Investor",
      quote: "The security features are unmatched. I sleep better knowing my diverse portfolio across banks and crypto is monitored 24/7 with military-grade protection."
    },
    {
      name: "Aisha Patel",
      role: "Family Office Manager",
      quote: "We use Milly's Trust for multiple high-net-worth clients. The unified view and reporting capabilities have significantly improved our operational efficiency."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-2xl tracking-tight text-slate-900">Milly&apos;s Trust</div>
              <div className="text-[10px] text-teal-600 -mt-1 font-medium">DIGITAL FIDUCIARY</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/signin" 
              className="px-5 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 transition-all text-white text-sm font-semibold rounded-2xl flex items-center gap-2 shadow-sm"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-20 pb-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-5xl mx-auto px-6 pt-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold tracking-[1px] mb-6">
            <Award className="w-3.5 h-3.5" /> TRUSTED BY OVER 12,400 FAMILIES &amp; INVESTORS
          </div>
          
          <h1 className="text-7xl font-semibold tracking-tighter text-slate-950 leading-[1.05] mb-6">
            Your complete financial<br />world, secured in one place.
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-slate-600 mb-10">
            Milly&apos;s Digital Trust is the modern fiduciary platform that lets you link every bank account, 
            digital wallet, and investment portfolio with enterprise-grade security and elegant simplicity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/signup" 
              className="group w-full sm:w-auto px-9 py-4 bg-slate-900 hover:bg-black transition-all text-white text-base font-semibold rounded-3xl flex items-center justify-center gap-3 shadow-xl shadow-slate-900/20"
            >
              Create Your Free Account
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition" />
            </Link>
            <Link 
              href="#features" 
              className="w-full sm:w-auto px-8 py-4 border border-slate-300 hover:bg-slate-50 transition text-slate-700 font-medium rounded-3xl flex items-center justify-center gap-2"
            >
              See how it works
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-500">No credit card required • Cancel anytime • 256-bit AES encryption</p>
        </div>
      </div>

      {/* Trust Bar */}
      <div className="border-y border-slate-100 py-5 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-60">
          <div className="text-sm font-medium tracking-widest">BANK OF AMERICA</div>
          <div className="text-sm font-medium tracking-widest">COINBASE</div>
          <div className="text-sm font-medium tracking-widest">FIDELITY</div>
          <div className="text-sm font-medium tracking-widest">CHASE</div>
          <div className="text-sm font-medium tracking-widest">BINANCE</div>
          <div className="text-sm font-medium tracking-widest">VANGUARD</div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <div className="text-teal-600 text-xs font-bold tracking-[2px] mb-3">WHY MILLY&apos;S TRUST</div>
          <h2 className="text-5xl font-semibold tracking-tight text-slate-900">Everything you need.<br />Nothing you don&apos;t.</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="trust-card bg-white border border-slate-200 rounded-3xl p-8 group">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-6 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-2xl tracking-tight mb-3 text-slate-900">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed text-[15px]">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-slate-900 text-white py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-teal-400 text-xs font-bold tracking-[2px] mb-3">SIMPLE. SECURE. POWERFUL.</div>
            <h2 className="text-5xl font-semibold tracking-tight">Get started in under 3 minutes</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create Your Account", desc: "Sign up with your email in seconds. We use bank-level identity verification." },
              { step: "02", title: "Link Your Assets", desc: "Connect banks via secure Plaid-like flow, add wallets with public keys, or import brokerage statements." },
              { step: "03", title: "Manage & Protect", desc: "View unified net worth, set alerts, generate reports, and enjoy proactive security monitoring." }
            ].map((item, i) => (
              <div key={i} className="border-l-2 border-teal-500 pl-6">
                <div className="text-teal-400 font-mono text-sm mb-2 tracking-widest">{item.step}</div>
                <div className="text-3xl font-semibold tracking-tight mb-4">{item.title}</div>
                <p className="text-slate-400 text-[15px] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="text-teal-600 text-xs font-bold tracking-[2px] mb-3">REAL STORIES FROM REAL FAMILIES</div>
          <h2 className="text-4xl font-semibold tracking-tight">Trusted by investors who value security and clarity.</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-white border border-slate-100 p-8 rounded-3xl">
              <div className="flex gap-1 mb-6 text-teal-500">
                {Array.from({length:5}).map((_,i)=><CheckCircle key={i} className="w-4 h-4" />)}
              </div>
              <blockquote className="text-slate-700 leading-relaxed mb-8 text-[15px]">“{t.quote}”</blockquote>
              <div>
                <div className="font-semibold text-slate-900">{t.name}</div>
                <div className="text-sm text-slate-500">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 py-20 text-white">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-6xl font-semibold tracking-tighter mb-4">Ready to take control of your financial future?</h2>
          <p className="text-teal-200 text-xl mb-10">Join thousands who trust Milly&apos;s with their most important assets.</p>
          
          <Link 
            href="/signup" 
            className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-teal-900 hover:bg-amber-50 font-semibold text-lg rounded-3xl transition-all active:scale-[0.985]"
          >
            Start Your Secure Journey Today <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-4 text-xs text-teal-300 tracking-widest">14-DAY FREE PREMIUM TRIAL • NO COMMITMENT</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 text-sm">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-y-10">
          <div>
            <div className="flex items-center gap-2 text-white mb-4">
              <Shield className="w-5 h-5" /> <span className="font-semibold">Milly&apos;s Trust</span>
            </div>
            <div className="text-xs">© {new Date().getFullYear()} Milly&apos;s Digital Trust Inc.<br />All rights reserved.</div>
          </div>
          <div>
            <div className="font-medium text-white mb-3 text-xs tracking-widest">PRODUCT</div>
            <div className="space-y-1.5 text-xs">Features<br />Security<br />Pricing<br />Integrations</div>
          </div>
          <div>
            <div className="font-medium text-white mb-3 text-xs tracking-widest">COMPANY</div>
            <div className="space-y-1.5 text-xs">About Us<br />Trust &amp; Safety<br />Careers<br />Blog</div>
          </div>
          <div>
            <div className="font-medium text-white mb-3 text-xs tracking-widest">RESOURCES</div>
            <div className="space-y-1.5 text-xs">Help Center<br />API Docs<br />Trust Center<br />Status</div>
          </div>
          <div className="text-xs md:col-span-1 col-span-2">
            <div className="font-medium text-white mb-3 text-xs tracking-widest">LEGAL</div>
            <div className="space-y-1.5">Privacy Policy<br />Terms of Service<br />Fiduciary Disclosure<br />Licenses</div>
            <div className="mt-6 text-[10px] opacity-60">This is a frontend prototype demo.<br />Not actual financial services.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
