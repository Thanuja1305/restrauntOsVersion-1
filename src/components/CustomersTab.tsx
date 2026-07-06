import React, { useState } from 'react';
import { Users, Search, Plus, X, Award, Phone, Mail } from 'lucide-react';
import { Customer } from '../types';

interface CustomersTabProps {
  customers: Customer[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'loyaltyPoints'>) => Promise<void>;
}

export default function CustomersTab({ customers, onAddCustomer }: CustomersTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    setSubmitting(true);
    try {
      await onAddCustomer({ name, phone, email });
      setName('');
      setPhone('');
      setEmail('');
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto select-none bg-gray-50 h-full">
      
      {/* Header action block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <span>Loyalty VIP Customers Ledger</span>
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Audit diner records, review accrued cashback points, and register walk-in VIP accounts.
          </p>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/10 active:scale-95 transition-all duration-200 cursor-pointer shrink-0"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Register Loyalty VIP</span>
        </button>
      </div>

      {/* Filter and searching */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 items-center shadow-sm select-none">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search VIP members by name, telephone coordinates, or email..."
            className="w-full text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-100 focus:border-emerald-500 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all duration-200"
          />
        </div>
      </div>

      {/* Customers Database Table Grid */}
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm select-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">
                <th className="py-4.5 px-6">VIP Customer ID</th>
                <th className="py-4.5 px-6">Full Name</th>
                <th className="py-4.5 px-6">Phone Number</th>
                <th className="py-4.5 px-6">Email Address</th>
                <th className="py-4.5 px-6">Accrued Points</th>
                <th className="py-4.5 px-6">Enrollment Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-600">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 font-medium text-gray-400">
                    No loyalty profiles found matching search filters.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-gray-500">{c.id}</td>
                    <td className="py-4 px-6 font-semibold text-gray-800">{c.name}</td>
                    <td className="py-4 px-6 font-mono text-gray-600 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{c.phone}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-500 font-medium">
                      {c.email ? (
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{c.email}</span>
                        </span>
                      ) : (
                        <span className="text-gray-300 italic">Not shared</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 border border-emerald-100/40 px-2.5 py-1 rounded-full w-fit">
                        <Award className="w-3.5 h-3.5 shrink-0" />
                        <span>{c.loyaltyPoints} points</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-gray-400">
                      {new Date(c.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIP Register Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in select-none">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border border-gray-100 animate-scale-up">
            
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-gray-800 text-sm">Enroll New Loyalty VIP</h4>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-150 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4.5 text-xs text-gray-700">
              
              {/* Name */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-600 uppercase tracking-wider block">Full Guest Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Deshmukh"
                  className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-600 uppercase tracking-wider block">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-600 uppercase tracking-wider block">Email Address (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rahul@gmail.com"
                  className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-extrabold text-xs shadow-md shadow-emerald-600/10 active:scale-95 transition-all duration-200 cursor-pointer text-center"
              >
                {submitting ? 'Registering...' : 'Enroll VIP Member'}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
