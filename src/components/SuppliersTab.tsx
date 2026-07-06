import React, { useState } from 'react';
import { Truck, Search, Plus, X, User, Phone, Mail, MapPin } from 'lucide-react';
import { Supplier } from '../types';

interface SuppliersTabProps {
  suppliers: Supplier[];
  onAddSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => Promise<void>;
}

export default function SuppliersTab({ suppliers, onAddSupplier }: SuppliersTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.contactName && s.contactName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    s.phone.includes(searchTerm)
  );

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    setSubmitting(true);
    try {
      await onAddSupplier({ name, contactName, phone, email, address });
      setName('');
      setContactName('');
      setPhone('');
      setEmail('');
      setAddress('');
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
            <Truck className="w-5 h-5 text-emerald-600" />
            <span>Raw Goods Suppliers Registry</span>
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Browse logistics partnerships, access urgent vendor contacts, and monitor active raw materials channels.
          </p>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/10 active:scale-95 transition-all duration-200 cursor-pointer shrink-0"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Add New Partner</span>
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
            placeholder="Search raw goods suppliers by name, point of contact, or telephone coordinates..."
            className="w-full text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-100 focus:border-emerald-500 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all duration-200"
          />
        </div>
      </div>

      {/* Suppliers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 select-none">
        {filteredSuppliers.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white border border-gray-100 rounded-3xl font-medium text-gray-400">
            No supplier accounts found matching current filters.
          </div>
        ) : (
          filteredSuppliers.map((supp) => (
            <div 
              key={supp.id} 
              className="bg-white border border-gray-100 rounded-3xl p-6 flex flex-col justify-between gap-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {/* Header and profile block */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold text-base uppercase shrink-0">
                  {supp.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-800 leading-tight">{supp.name}</h4>
                  <span className="text-[10px] text-gray-400 font-mono font-bold uppercase mt-1 block">ID: {supp.id}</span>
                </div>
              </div>

              {/* Contact list details */}
              <div className="space-y-2.5 pt-3 border-t border-gray-50 text-xs text-gray-600">
                {supp.contactName && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="font-semibold text-gray-700">{supp.contactName}</span>
                    <span className="text-[10px] text-gray-400 font-mono">(Manager)</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-mono text-gray-700 font-medium">{supp.phone}</span>
                </div>

                {supp.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="font-medium text-gray-500 truncate">{supp.email}</span>
                  </div>
                )}

                {supp.address && (
                  <div className="flex items-start gap-2 pt-1 border-t border-gray-50/50 mt-1">
                    <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-gray-400 text-[11px] leading-relaxed">{supp.address}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Supplier Overlay Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in select-none">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border border-gray-100 animate-scale-up">
            
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-gray-800 text-sm">Register Raw Goods Supplier</h4>
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
              
              {/* Supplier Corporate Name */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-600 uppercase tracking-wider block">Company Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Hyderabad Veg Distributers"
                  className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Contact point name */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-600 uppercase tracking-wider block">Primary Point of Contact</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Grid: Phone & Email */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-600 uppercase tracking-wider block">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9812345678"
                    className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-600 uppercase tracking-wider block">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. support@vegdist.com"
                    className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Geographic Address */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-600 uppercase tracking-wider block">Business Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Plot No 44, Industrial Area, Hyderabad"
                  className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-extrabold text-xs shadow-md shadow-emerald-600/10 active:scale-95 transition-all duration-200 cursor-pointer text-center"
              >
                {submitting ? 'Connecting supplier...' : 'Establish supply partnership'}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
