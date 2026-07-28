import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../services/store';
import { useAuth } from '../contexts/AuthContext';
import { triggerRazorpayCheckout } from '../services/razorpay';
import { 
  HeartHandshake, 
  IndianRupee, 
  Receipt, 
  ShieldCheck, 
  TrendingUp, 
  PieChart, 
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

export default function DonationLedger() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const state = useStore();
  const ledger = state.donationLedger;

  const [customAmount, setCustomAmount] = useState('1000');
  const [selectedIncident, setSelectedIncident] = useState('Kurla West Flood Relief');

  const handleDonate = (amountToUse) => {
    triggerRazorpayCheckout(
      amountToUse || customAmount,
      selectedIncident,
      currentUser,
      (paymentId) => {
        alert(`Payment Successful via Razorpay!\nTransaction ID: ${paymentId}\nThank you for contributing to public disaster relief.`);
      }
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 font-bold mb-1">
            <HeartHandshake className="w-6 h-6" />
            <h2 className="text-2xl font-extrabold text-white">{t('donations.title')}</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            {t('donations.subtitle')}
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-3.5 py-2 rounded-xl text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Verified PCI-DSS Razorpay Gateway</span>
        </div>
      </div>

      {/* Financial Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t('donations.totalRaised')}</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 flex items-center">
            <span>₹</span>
            <span>{ledger.totalRaised.toLocaleString('en-IN')}</span>
          </div>
          <p className="text-[11px] text-slate-400">100% public crowdsourced donations</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t('donations.totalSpent')}</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-sky-400 flex items-center">
            <span>₹</span>
            <span>{ledger.totalAllocated.toLocaleString('en-IN')}</span>
          </div>
          <p className="text-[11px] text-slate-400">Itemized against active relief operations</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t('donations.remaining')}</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 flex items-center">
            <span>₹</span>
            <span>{ledger.remaining.toLocaleString('en-IN')}</span>
          </div>
          <p className="text-[11px] text-slate-400">Emergency reserve buffer</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Razorpay Payment Widget */}
        <div className="lg:col-span-5 glass-card p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <IndianRupee className="w-5 h-5 text-emerald-400" />
              <span>Contribute via Razorpay</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">UPI, GPay, PhonePe, Cards, Netbanking</p>
          </div>

          {/* Incident Selector */}
          <div>
            <label className="block text-slate-300 font-bold mb-1.5 text-xs">Target Incident Fund</label>
            <select
              value={selectedIncident}
              onChange={(e) => setSelectedIncident(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-sky-500"
            >
              <option value="Kurla West Flood Relief">Kurla West Flood Relief (Mumbai)</option>
              <option value="Tamhini Landslide Clearing">Tamhini Landslide Relief (Pune)</option>
              <option value="General Disaster Emergency Pool">General Disaster Emergency Pool</option>
            </select>
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <label className="block text-slate-300 font-bold mb-2 text-xs">{t('donations.quickAmounts')}</label>
            <div className="grid grid-cols-3 gap-2">
              {[500, 1000, 2500, 5000, 10000, 25000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setCustomAmount(amt.toString());
                    handleDonate(amt);
                  }}
                  className="py-2.5 bg-slate-800 hover:bg-emerald-600/20 hover:border-emerald-500/40 border border-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1"
                >
                  <span>₹{amt.toLocaleString('en-IN')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Entry */}
          <div>
            <label className="block text-slate-300 font-bold mb-1 text-xs">{t('donations.customAmount')}</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-sm">₹</span>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold focus:outline-none focus:border-emerald-500"
                placeholder="Enter custom amount"
              />
            </div>
          </div>

          <button
            onClick={() => handleDonate()}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition transform active:scale-[0.99] flex items-center justify-center space-x-2"
          >
            <HeartHandshake className="w-5 h-5" />
            <span>Pay & Log in Public Ledger</span>
          </button>

          <p className="text-[11px] text-slate-400 text-center">
            🔒 Razorpay 256-bit SSL encrypted checkout. No card data saved on servers.
          </p>
        </div>

        {/* Right Column: Public Itemized Transparency Ledger */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-sky-400" />
                <span>{t('donations.ledgerHeader')}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Every rupee trackable with vendor invoice reference numbers</p>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-lg">
              100% Audit-Trail
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Incident</th>
                  <th className="py-2.5 px-3">Item / Service Purchased</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Vendor Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {ledger.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 text-slate-400 font-mono">{item.date}</td>
                    <td className="py-3 px-3 font-semibold text-white">{item.incidentTitle}</td>
                    <td className="py-3 px-3 text-slate-300">{item.item}</td>
                    <td className="py-3 px-3 font-bold text-emerald-400">₹{item.cost.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                      <span className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700">
                        {item.invoiceRef}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  );
}
