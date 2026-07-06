import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Mic, 
  Check, 
  ShoppingBag, 
  DollarSign, 
  Percent, 
  TrendingUp, 
  AlertTriangle,
  Award,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Clock,
  User,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Message, Settings } from '../types';

interface AIAgentTabProps {
  settings: Settings;
  chatHistory: Message[];
  onSendMessage: (text: string) => Promise<void>;
  onClearChat: () => Promise<void>;
  isLoading: boolean;
  onSwitchTab: (tab: string) => void;
  triggerNewOrder: () => void;
}

export default function AIAgentTab({ 
  settings, 
  chatHistory, 
  onSendMessage, 
  onClearChat, 
  isLoading, 
  onSwitchTab,
  triggerNewOrder 
}: AIAgentTabProps) {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);

  const startVoiceRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported in browser.");
      alert("Voice speech recognition is not supported in this browser. Please use text input.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
    };

    recognition.onerror = (event: any) => {
      console.warn("Voice speech recognition failed, switching to text mode.", event.error);
      setIsListening(false);
      
      const errorLog = {
        error_type: "VoiceRecognitionError",
        source: "voice",
        timestamp: new Date().toISOString(),
        payload_snapshot: { errorCode: event.error }
      };
      console.error("Voice Observability Log:", JSON.stringify(errorLog, null, 2));
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (err: any) {
      console.error("Failed to start voice recognition:", err);
      setIsListening(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const query = inputText;
    setInputText('');
    await onSendMessage(query);
  };

  const handleSuggestionClick = async (text: string) => {
    if (text === "Create a new order") {
      onSwitchTab('orders');
      setTimeout(() => triggerNewOrder(), 100);
      return;
    }
    await onSendMessage(text);
  };

  const suggestions = [
    { text: "Today's sales summary", icon: ShoppingBag, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { text: "Create a new order", icon: Sparkles, color: "text-teal-600 bg-teal-50 border-teal-100" },
    { text: "Show low stock items", icon: AlertTriangle, color: "text-amber-600 bg-amber-50 border-amber-100" },
    { text: "Today's profit", icon: DollarSign, color: "text-blue-600 bg-blue-50 border-blue-100" },
    { text: "Top 5 customers", icon: Award, color: "text-purple-600 bg-purple-50 border-purple-100" },
    { text: "Recent orders", icon: Clock, color: "text-rose-600 bg-rose-50 border-rose-100" }
  ];

  return (
    <div className="flex flex-col h-full bg-transparent flex-1 select-none overflow-hidden relative">
      {/* Scrollable Chat Area */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        
        {/* Banner Hero Card */}
        <motion.div 
          initial={{ opacity: 0, y: -20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 24 }}
          className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 shadow-lg shadow-emerald-600/10"
        >
          {/* Chef Hat + Robot Background Watermark */}
          <div className="absolute right-0 bottom-0 top-0 opacity-10 pointer-events-none w-1/3 flex items-center justify-center">
            <Bot className="w-64 h-64 text-emerald-300" />
          </div>

          <div className="space-y-4 max-w-2xl z-10">
            <div className="flex items-center gap-3">
              {/* Cute SVG Robot Profile */}
              <motion.div 
                whileHover={{ rotate: [0, -8, 8, -8, 0], scale: 1.05 }}
                transition={{ duration: 0.5 }}
                className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-400/20 shrink-0"
              >
                <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" strokeLinecap="round"/>
                  <rect x="5" y="8" width="14" height="9" rx="2" fill="currentColor" fillOpacity="0.1" />
                  <circle cx="9" cy="12" r="1.5" fill="currentColor" />
                  <circle cx="15" cy="12" r="1.5" fill="currentColor" />
                  <path d="M9 15h6" strokeLinecap="round" />
                </svg>
              </motion.div>
              <div>
                <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  I'm your Restaurant AI Agent <span className="text-lg">🤖</span>
                </h3>
                <p className="text-xs text-emerald-100 leading-relaxed mt-1">
                  I can help you with orders, inventory, finance, customers, suppliers, reports and much more.
                </p>
              </div>
            </div>

            {/* Badges container */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {['Smart', 'Fast', 'Accurate', 'Always Ready'].map((badge, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * idx, type: 'spring' }}
                  key={badge} 
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/10 text-emerald-50 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150"
                >
                  <div className="bg-white text-emerald-600 p-0.5 rounded-full">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>{badge}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Vector Bowl Graphic representing Food Bowl */}
          <div className="hidden lg:flex items-center justify-center shrink-0 w-36 h-36 relative select-none">
            {/* Concentric ambient background pulse waves */}
            <div className="absolute w-44 h-44 rounded-full border border-emerald-500/10 animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite] pointer-events-none" />
            <div className="absolute w-36 h-36 rounded-full border border-teal-400/20 pointer-events-none" />
            
            {/* Salad bowl visual outer rotating ring */}
            <motion.div 
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.04, 1]
              }}
              transition={{ 
                rotate: { repeat: Infinity, duration: 25, ease: "linear" },
                scale: { repeat: Infinity, duration: 4, ease: "easeInOut" }
              }}
              className="w-32 h-32 rounded-full bg-gradient-to-tr from-emerald-500/15 to-teal-400/25 border border-emerald-400/30 flex items-center justify-center absolute"
            />

            {/* Inner bowl with hover interactions */}
            <motion.div 
              whileHover={{ scale: 1.15, rotate: 12 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 350, damping: 15 }}
              className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center relative shadow-xl shadow-orange-500/30 cursor-grab active:cursor-grabbing z-10"
            >
              {/* Toppings bubbling/floating inside the soup */}
              <motion.div 
                animate={{ x: [0, 2, -1, 0], y: [0, -3, 1, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                className="absolute top-2 left-6 w-3 h-3 rounded-full bg-red-600 border border-red-500" 
              />
              <motion.div 
                animate={{ x: [0, -2, 2, 0], y: [0, 3, -2, 0] }}
                transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut" }}
                className="absolute top-8 right-3 w-4.5 h-4.5 rounded-full bg-red-500 border border-red-400" 
              />
              <motion.div 
                animate={{ x: [0, 3, -2, 0], y: [0, 2, -3, 0] }}
                transition={{ repeat: Infinity, duration: 4.8, ease: "easeInOut" }}
                className="absolute bottom-4 left-4 w-4 h-4 rounded-full bg-green-500 border border-green-400" 
              />
              <motion.div 
                animate={{ x: [0, -3, 1, 0], y: [0, -2, 3, 0] }}
                transition={{ repeat: Infinity, duration: 3.9, ease: "easeInOut" }}
                className="absolute bottom-6 right-8 w-3.5 h-3.5 rounded-full bg-yellow-400 border border-yellow-300" 
              />
              
              <span className="text-3xl relative z-25">🍲</span>
            </motion.div>

            {/* Tomato Floating */}
            <motion.div 
              drag
              dragConstraints={{ left: -45, right: 45, top: -45, bottom: 45 }}
              dragElastic={0.4}
              dragTransition={{ bounceStiffness: 450, bounceDamping: 12 }}
              animate={{ 
                y: [0, -7, 1, 0],
                rotate: [0, 8, -8, 0]
              }}
              whileHover={{ 
                scale: 1.4, 
                filter: "drop-shadow(0 12px 14px rgba(239, 68, 68, 0.5))",
                cursor: "grab"
              }}
              whileTap={{ scale: 0.9, cursor: "grabbing" }}
              transition={{ 
                y: { repeat: Infinity, duration: 2.6, ease: "easeInOut" },
                rotate: { repeat: Infinity, duration: 4, ease: "easeInOut" },
                scale: { type: "spring", stiffness: 350, damping: 15 }
              }}
              className="absolute -top-1 -right-1 text-2xl z-20 select-none"
            >
              🍅
            </motion.div>
            {/* Basil leaves */}
            <motion.div 
              drag
              dragConstraints={{ left: -45, right: 45, top: -45, bottom: 45 }}
              dragElastic={0.4}
              dragTransition={{ bounceStiffness: 450, bounceDamping: 12 }}
              animate={{ 
                rotate: [12, 28, 4, 12],
                y: [0, 4, -4, 0]
              }}
              whileHover={{ 
                scale: 1.4, 
                filter: "drop-shadow(0 12px 14px rgba(16, 185, 129, 0.5))",
                cursor: "grab"
              }}
              whileTap={{ scale: 0.9, cursor: "grabbing" }}
              transition={{ 
                rotate: { repeat: Infinity, duration: 3.2, ease: "easeInOut" },
                y: { repeat: Infinity, duration: 2.4, ease: "easeInOut" },
                scale: { type: "spring", stiffness: 350, damping: 15 }
              }}
              className="absolute -bottom-1 -left-2 text-xl z-20 select-none"
            >
              🌿
            </motion.div>
          </div>
        </motion.div>

        {/* Suggestions Tray */}
        <div className="space-y-3 shrink-0">
          <p className="text-xs font-bold text-gray-400 tracking-wider uppercase font-mono">Try asking me something like...</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {suggestions.map((sug, i) => {
              const SugIcon = sug.icon;
              return (
                <motion.button
                  key={sug.text}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, type: 'spring', stiffness: 220, damping: 18 }}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleSuggestionClick(sug.text)}
                  className="flex flex-col items-start gap-3.5 p-4 bg-white border border-gray-100 hover:border-emerald-500/30 rounded-2xl transition-all duration-200 text-left shrink-0 select-none cursor-pointer group focus:outline-none shadow-sm"
                >
                  <div className="p-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl group-hover:scale-110 transition-all duration-200">
                    <SugIcon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-700 leading-snug group-hover:text-emerald-700">{sug.text}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Chat Stream History */}
        <div className="space-y-6 pt-6 border-t border-gray-100">
          <AnimatePresence initial={false}>
            {chatHistory.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 18, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                  className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'} items-start`}
                >
                  {/* Robot profile for agent messages */}
                  {!isUser && (
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5 text-emerald-600" />
                    </div>
                  )}

                  <div className={`max-w-[75%] space-y-2 ${isUser ? 'order-1 text-right' : 'order-2'}`}>
                    {/* Text Message Bubble */}
                    <div className={`px-4.5 py-3.5 rounded-2xl text-xs leading-relaxed inline-block text-left ${
                      isUser 
                        ? 'bg-emerald-600 text-white rounded-tr-none shadow-sm shadow-emerald-600/10 font-medium' 
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none font-medium'
                    }`}>
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </div>

                    {/* Rich Structural Attachments */}
                    {msg.attachmentType && (
                      <div className="mt-3 text-left">
                        
                        {/* attachmentType: SALES SUMMARY CARDS */}
                        {msg.attachmentType === 'sales_summary' && (
                           <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mt-2">
                             {/* Card 1: Total Orders */}
                             <motion.div 
                               whileHover={{ y: -3, scale: 1.02 }}
                               className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-150 flex items-center gap-3"
                             >
                               <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                                 <ShoppingBag className="w-5 h-5" />
                               </div>
                               <div>
                                 <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Orders</span>
                                 <span className="text-lg font-bold text-gray-800 font-sans mt-0.5 block">
                                   {msg.attachmentData.totalOrders}
                                 </span>
                               </div>
                             </motion.div>

                             {/* Card 2: Total Revenue */}
                             <motion.div 
                               whileHover={{ y: -3, scale: 1.02 }}
                               className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-150 flex items-center gap-3"
                             >
                               <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                                 <DollarSign className="w-5 h-5" />
                               </div>
                               <div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Revenue</span>
                                <span className="text-lg font-bold text-gray-800 font-sans mt-0.5 block">
                                  {settings.currency}{msg.attachmentData.totalRevenue.toLocaleString()}
                                </span>
                              </div>
                            </motion.div>

                            {/* Card 3: Average Order Value */}
                            <motion.div 
                              whileHover={{ y: -3, scale: 1.02 }}
                              className="bg-white border border-gray-100 p-4.5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-150 flex items-center gap-3"
                            >
                              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                                <Percent className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Avg Order Value</span>
                                <span className="text-lg font-bold text-gray-800 font-sans mt-0.5 block">
                                  {settings.currency}{msg.attachmentData.averageOrderValue}
                                </span>
                              </div>
                            </motion.div>

                            {/* Card 4: Top Selling Item */}
                            <motion.div 
                              whileHover={{ y: -3, scale: 1.02 }}
                              className="bg-white border border-gray-100 p-4.5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-150 flex items-center gap-3"
                            >
                              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                                <Award className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Top Selling Item</span>
                                <span className="text-xs font-bold text-emerald-700 mt-1 block truncate max-w-[130px]">
                                  {msg.attachmentData.topSellingItem}
                                </span>
                              </div>
                            </motion.div>
                          </div>
                        )}

                        {/* attachmentType: LOW STOCK BADGES */}
                        {msg.attachmentType === 'low_stock' && (
                          <div className="flex flex-wrap gap-2.5 max-w-2xl mt-1.5">
                            {msg.attachmentData.map((item: any, idx: number) => (
                              <motion.div 
                                key={idx} 
                                whileHover={{ scale: 1.04 }}
                                className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200/50 text-amber-800 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-default"
                              >
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                <span className="text-gray-800 font-bold">{item.name}</span>
                                <span className="text-amber-700 font-mono text-[11px] bg-white/60 px-1.5 py-0.5 rounded-md border border-amber-200/30">
                                  {item.stock}
                                </span>
                              </motion.div>
                            ))}
                          </div>
                        )}

                        {/* attachmentType: RECENT ORDERS WITH MIN STATUS */}
                        {msg.attachmentType === 'recent_orders' && (
                          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden max-w-xl mt-1.5 divide-y divide-gray-50 animate-fade-in">
                            {msg.attachmentData.map((ord: any) => (
                              <div key={ord.id} className="p-3 flex items-center justify-between text-xs hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                  <span className="font-mono text-gray-500 font-medium">{ord.id}</span>
                                  <span className="font-semibold text-gray-800">{ord.customer}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-gray-700">{settings.currency}{ord.total}</span>
                                  <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] uppercase font-bold ${
                                    ord.status === 'completed' 
                                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                      : 'bg-amber-50 text-amber-600 border border-amber-100'
                                  }`}>
                                    {ord.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                      </div>
                    )}

                    {/* Message Timestamp */}
                    <span className="text-[10px] text-gray-400 block font-mono mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* User avatar for user messages */}
                  {isUser && (
                    <div className="w-9 h-9 rounded-xl bg-gray-200 text-gray-700 flex items-center justify-center shrink-0 font-bold text-xs uppercase select-none">
                      <User className="w-4 h-4" />
                    </div>
                  )}

                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Loading Typing Indicator Bubble */}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 items-start"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="bg-white text-gray-800 border border-gray-100 px-4.5 py-3 rounded-2xl rounded-tl-none inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>
      {/* Action Tray & Input Footer */}
      <div className="p-5 bg-white border-t border-gray-100 select-none shrink-0 relative">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-center gap-3">
          
          {/* Reset chat logs icon */}
          <button 
            type="button"
            onClick={onClearChat}
            title="Reset Conversation"
            className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-150 shrink-0 cursor-pointer focus:outline-none"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          {/* Text Input Block */}
          <div className="flex-1 relative bg-gray-50 border border-gray-200 focus-within:border-emerald-500/40 focus-within:bg-white rounded-2xl px-5 py-3.5 transition-all duration-200">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything about your restaurant..."
              className="w-full text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
            />
          </div>

          {/* Send Trigger Circle */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className={`p-3.5 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 cursor-pointer focus:outline-none ${
              inputText.trim() && !isLoading
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10 active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>

          {/* Voice Mic Trigger Icon */}
          <button
            type="button"
            onClick={startVoiceRecognition}
            className={`p-3.5 border rounded-full shrink-0 transition-all duration-150 cursor-pointer focus:outline-none ${
              isListening
                ? 'bg-red-50 text-red-500 border-red-200 animate-pulse'
                : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-700'
            }`}
            title="Speech recognition trigger"
          >
            <Mic className="w-4 h-4" />
          </button>

        </form>
        <p className="text-center text-[10px] text-gray-400 mt-2">
          Powered by RestaurantOS Core Intelligence Engine
        </p>
      </div>
    </div>
  );
}
