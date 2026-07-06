import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Store, MapPin, ClipboardCheck, CheckCircle2, Percent, DollarSign } from 'lucide-react';
import { Settings } from '../types';

interface SettingsTabProps {
  settings: Settings;
  onUpdateSettings: (settings: Settings) => Promise<void>;
}

export default function SettingsTab({ settings, onUpdateSettings }: SettingsTabProps) {
  const [restaurantName, setRestaurantName] = useState(settings.restaurantName);
  const [address, setAddress] = useState(settings.address);
  const [gstin, setGstin] = useState(settings.gstin);
  const [fssai, setFssai] = useState(settings.fssai);
  const [taxRate, setTaxRate] = useState(settings.taxRate.toString());
  const [currency, setCurrency] = useState(settings.currency);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);

    try {
      await onUpdateSettings({
        restaurantName,
        address,
        gstin,
        fssai,
        taxRate: Number(taxRate),
        currency
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto select-none bg-gray-50 h-full">
      
      {/* Header */}
      <div className="shrink-0">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-emerald-600" />
          <span>System Configurations Board</span>
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Adjust billing currency symbols, edit state tax structures, and update governmental licensing profiles.
        </p>
      </div>

      {/* Form Content card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-8 max-w-2xl shadow-sm select-none">
        
        {/* Banner feedback */}
        {success && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4.5 rounded-2xl text-xs font-bold animate-fade-in flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Operational settings saved successfully! Your AI prompts and POS checkout calculations are instantly synchronized.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs text-gray-700">
          
          {/* Restaurant Name */}
          <div className="space-y-1.5">
            <label className="font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
              <Store className="w-4 h-4 text-emerald-500" />
              <span>Restaurant Corporate Name</span>
            </label>
            <input
              type="text"
              required
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500"
            />
          </div>

          {/* Business address */}
          <div className="space-y-1.5">
            <label className="font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span>Physical Address Location</span>
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500"
            />
          </div>

          {/* Licenses section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* GSTIN */}
            <div className="space-y-1.5">
              <label className="font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                <ClipboardCheck className="w-4 h-4 text-emerald-500" />
                <span>State GSTIN code</span>
              </label>
              <input
                type="text"
                required
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* FSSAI */}
            <div className="space-y-1.5">
              <label className="font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Governmental FSSAI License No</span>
              </label>
              <input
                type="text"
                required
                value={fssai}
                onChange={(e) => setFssai(e.target.value)}
                className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Tax Rates and Currency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tax Rate */}
            <div className="space-y-1.5">
              <label className="font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-emerald-500" />
                <span>Base CGST+SGST Tax rate (%)</span>
              </label>
              <input
                type="number"
                step="any"
                required
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* Currency Symbol */}
            <div className="space-y-1.5">
              <label className="font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>Operational Currency Symbol</span>
              </label>
              <input
                type="text"
                required
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-extrabold text-xs shadow-md shadow-emerald-600/10 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <Save className="w-4.5 h-4.5" />
            <span>{submitting ? 'Updating settings...' : 'Save System Configurations'}</span>
          </button>

        </form>
      </div>

    </div>
  );
}
