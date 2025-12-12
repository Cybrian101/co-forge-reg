/* eslint-disable react/jsx-no-comment-textnodes */
"use client";
import { useState } from 'react'; 
// Correct import path assuming structure src/app/page.jsx -> src/lib/supabase.js
import { supabase } from '../lib/supabase'; 
import { Loader2, Zap, CheckCircle, XCircle } from 'lucide-react'; 

// Paths and constants

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "YOUR_SUPABASE_PROJECT_URL"; 
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY"; 

const CYBRIAN_LOGO_IMG = "/CYBRIAN.jpg"; // Path relative to the public folder
const TABLE_NAME = "registrations"; // The name of the table in your Supabase DB

const communities = [
  'Cybrian', 'Rootsprout', 'Codesapiens', 'Ai geeks', 'Flutterflow', 'Others / Not Affiliated'
];

const sources = [
  'Instagram', 'LinkedIn', 'WhatsApp/Telegram Group', 'College Representative', 
  'Friend/Word of Mouth', 'Other Social Platform'
];

// --- Utility Components and Styles ---
const Field = ({ children, label, required }) => (
    <div className="flex flex-col space-y-1">
        <label className="text-sm font-medium text-indigo-200">
            {label} {required && <span className="text-red-400">*</span>}
        </label>
        {children}
    </div>
);
const InputStyle = 'w-full px-4 py-3 bg-gray-950/70 border border-indigo-900 text-white rounded-xl transition-all duration-300 focus:border-indigo-400 focus:ring-0 input-glow placeholder-gray-500';

export default function App() {
  const [form, setForm] = useState({
    leader_name: '', leader_college: '', leader_phone: '', leader_email: '',
    co_leader_name: '', co_leader_college: '', co_leader_phone: '', co_leader_email: '',
    community: '', community_other: '', source: '', eligibility_confirmed: false
  });
  const [showOtherCommunity, setShowOtherCommunity] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [loading, setLoading] = useState(false);
  
  // Checks if the Supabase client was successfully initialized (if the object has the 'from' method)
  const isSystemReady = supabase && supabase.from; 

  // 2. Form State Handlers
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'community') {
      const isOther = value === 'Others / Not Affiliated';
      setShowOtherCommunity(isOther);
      if (!isOther) {
        setForm(prev => ({ ...prev, community_other: '' }));
      }
    }
  };

  const validate = () => {
    const requiredFields = [
      'leader_name', 'leader_college', 'leader_phone', 'leader_email',
      'co_leader_name', 'co_leader_college', 'co_leader_phone', 'co_leader_email',
      'community', 'source'
    ];
    
    for (const key of requiredFields) {
      if (!form[key] || form[key].toString().trim() === '') return false;
    }

    if (form.community === 'Others / Not Affiliated' && (!form.community_other || form.community_other.trim() === '')) return false;
    if (!form.eligibility_confirmed) return false;
    
    return true;
  };

  // 3. Form Submission (SUPABASE DATA SAVING)
  const handleSubmit = async e => {
    e.preventDefault();
    setMessage(null);
    setMessageType('');
    
    if (!isSystemReady) {
        // This handles cases where the keys are missing in .env.local
        setMessage('Configuration Error: Supabase client is not initialized. Please check your .env.local file.');
        setMessageType('error');
        return;
    }
    if (!validate()) {
      setMessage('Please fill all required fields and confirm eligibility.');
      setMessageType('error');
      return;
    }

    setLoading(true);

    // Prepare data payload for Supabase insertion (matches SQL schema precisely)
    const dataToInsert = {
        leader_name: form.leader_name,
        leader_college: form.leader_college,
        leader_phone: form.leader_phone,
        leader_email: form.leader_email,
        co_leader_name: form.co_leader_name,
        co_leader_college: form.co_leader_college,
        co_leader_phone: form.co_leader_phone,
        co_leader_email: form.co_leader_email,
        community: form.community,
        community_other: form.community === 'Others / Not Affiliated' ? form.community_other : null,
        source: form.source,
        eligibility_confirmed: form.eligibility_confirmed,
    };

    try {
        const { error } = await supabase
            .from(TABLE_NAME)
            .insert([dataToInsert]);
            
        if (error) throw error;
        
        console.log("Registration data saved successfully to Supabase:", dataToInsert);
        
        setMessage('Registration successful! Check your email for your Team ID and next steps.');
        setMessageType('success');
        
        // Reset form after success
        setForm({
          leader_name: '', leader_college: '', leader_phone: '', leader_email: '',
          co_leader_name: '', co_leader_college: '', co_leader_phone: '', co_leader_email: '',
          community: '', community_other: '', source: '', eligibility_confirmed: false
        });
        setShowOtherCommunity(false);

    } catch (error) {
      console.error("Supabase Submission Error:", error);
      const errorMsg = error.message.includes('not configured')
                       ? 'Configuration Error: Please update SUPABASE_URL and SUPABASE_ANON_KEY.'
                       : `Registration failed: ${error.message || 'Check your Supabase configuration and RLS policies.'}`;
      setMessage(errorMsg);
      setMessageType('error');

    } finally {
      setLoading(false);
    }
  };

  const messageClasses = messageType === 'success' 
    ? 'bg-green-900/50 text-green-300 border border-green-700' 
    : 'bg-red-900/50 text-red-300 border border-red-700';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-950">
      <div className="w-full max-w-4xl p-8 bg-gray-900 rounded-3xl container-pulse glow-border transition duration-500 ease-in-out">
        
        {/* Header and Logo */}
        <header className="text-center mb-8">
            <div className="flex justify-center mb-4">
                <img 
                    src={CYBRIAN_LOGO_IMG} 
                    alt="Cybrian Logo" 
                    className="h-24 w-auto object-contain animate-pulse-slow"
                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/96x96/2e2e4e/ffffff?text=CYBRIAN"; }}
                />
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-400">
                CO-FORGE CHALLENGE 1.0
            </h1>
            <p className="mt-2 text-xl text-indigo-200 font-medium">Enter the Circle of Innovators</p>
        </header>

        {/* Status Message */}
        {message && (
          <div className={`mb-6 p-4 text-center rounded-xl font-semibold ${messageClasses}`}>
            {messageType === 'success' ? <CheckCircle className="inline h-5 w-5 mr-2" /> : <XCircle className="inline h-5 w-5 mr-2" />}
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-8">
          
          {/* 1. Leader Details */}
          <div className="p-6 bg-gray-800/70 rounded-xl shadow-inner border border-indigo-900/50">
            <h2 className="text-2xl font-bold mb-4 text-purple-400 border-b border-purple-500/50 pb-2">1. Leader (Cadet) Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Full Name" required>
                    <input name="leader_name" type="text" value={form.leader_name} onChange={handleChange} className={InputStyle} required />
                </Field>
                <Field label="College Name" required>
                    <input name="leader_college" type="text" value={form.leader_college} onChange={handleChange} className={InputStyle} required />
                </Field>
                <Field label="Phone Number" required>
                    <input name="leader_phone" type="tel" value={form.leader_phone} onChange={handleChange} className={InputStyle} required />
                </Field>
                <Field label="Email Address (Primary Contact)" required>
                    <input name="leader_email" type="email" value={form.leader_email} onChange={handleChange} className={InputStyle} required />
                </Field>
            </div>
          </div>

          {/* 2. Co-Leader Details */}
          <div className="p-6 bg-gray-800/70 rounded-xl shadow-inner border border-indigo-900/50">
            <h2 className="text-2xl font-bold mb-4 text-purple-400 border-b border-purple-500/50 pb-2">2. Co-Leader Details (The Partner)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Full Name" required>
                    <input name="co_leader_name" type="text" value={form.co_leader_name} onChange={handleChange} className={InputStyle} required />
                </Field>
                <Field label="College Name" required>
                    <input name="co_leader_college" type="text" value={form.co_leader_college} onChange={handleChange} className={InputStyle} required />
                </Field>
                <Field label="Phone Number" required>
                    <input name="co_leader_phone" type="tel" value={form.co_leader_phone} onChange={handleChange} className={InputStyle} required />
                </Field>
                <Field label="Email Address" required>
                    <input name="co_leader_email" type="email" value={form.co_leader_email} onChange={handleChange} className={InputStyle} required />
                </Field>
            </div>
          </div>

          {/* 3. Affiliation & Confirmation */}
          <div className="p-6 bg-gray-800/70 rounded-xl shadow-inner border border-indigo-900/50 space-y-5">
            <h2 className="text-2xl font-bold mb-4 text-purple-400 border-b border-purple-500/50 pb-2">3. Affiliation & Challenge Rules</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Community Dropdown */}
                <Field label="Representing Community" required>
                    <select name="community" value={form.community} onChange={handleChange} className={InputStyle} required>
                        <option value="" disabled>Select community...</option>
                        {communities.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </Field>

                {/* Source Dropdown */}
                <Field label="How did you learn about the challenge?" required>
                    <select name="source" value={form.source} onChange={handleChange} className={InputStyle} required>
                        <option value="" disabled>Select source...</option>
                        {sources.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </Field>
            </div>

            {/* Other Community Input */}
            {showOtherCommunity && (
                <Field label="Please specify your Community Name" required>
                    <input name="community_other" type="text" value={form.community_other} onChange={handleChange} className={InputStyle} required />
                </Field>
            )}

            {/* Eligibility Confirmation */}
            <div className="flex items-start pt-4">
                <input 
                    name="eligibility_confirmed" 
                    id="eligibility_confirmed" 
                    type="checkbox" 
                    checked={form.eligibility_confirmed} 
                    onChange={handleChange} 
                    className="mt-1 h-5 w-5 rounded-md border-gray-600 bg-gray-700 text-indigo-500 focus:ring-indigo-500 accent-indigo-500 cursor-pointer" 
                    required 
                />
                <label htmlFor="eligibility_confirmed" className="ml-3 text-base text-indigo-100 cursor-pointer">
                    I confirm the Co-leader is eligible under the challenge rules.
                    <p className="text-xs text-gray-400 mt-1">
                        (Required: Cybrian members must partner with a non-community participant; all others may partner with anyone.)
                    </p>
                </label>
            </div>
          </div>
          /* Submit Button */
          <button
            type="submit"
            className="w-full flex items-center justify-center py-4 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-extrabold text-xl rounded-xl transition duration-300 shadow-2xl shadow-purple-800/50 hover:shadow-purple-700/70 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-wait"
            disabled={loading || !isSystemReady}
          >
            {loading ? (
              <><Loader2 className="h-6 w-6 mr-3 animate-spin" /> Submitting Data...</>
            ) : (
              <><Zap className="h-6 w-6 mr-3" /> REGISTER TEAM & FORGE YOUR EDGE</>
            )}
          </button>
          
          <p className="mt-4 text-center text-sm text-gray-400">
            Next Steps: You will receive your Team ID and idea submission instructions via email after successful registration.
          </p>
        </form>
      </div>
      
       {/* Custom CSS for Animations and Glow */}
      <style jsx>{`
        /* --- General Aesthetics and Background --- */
        .background-grid {
            background-color: #111827;
            background-image: radial-gradient(circle at center, #1f2937 1px, transparent 0);
            background-size: 30px 30px;
        }

        /* --- Global Container Pulse --- */
        @keyframes container-pulse {
            0%, 100% { box-shadow: 0 0 35px rgba(147, 51, 234, 0.45); }
            50% { box-shadow: 0 0 50px rgba(79, 70, 229, 0.6); }
        }
        .container-pulse {
            animation: container-pulse 5s infinite ease-in-out;
        }

        /* --- Header/Logo Animations --- */
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; filter: drop-shadow(0 0 5px rgba(129, 140, 248, 0.7)); }
          50% { opacity: 0.7; filter: drop-shadow(0 0 15px rgba(167, 139, 250, 0.9)); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s infinite ease-in-out;
        }
        .logo-tilt {
            transform: perspective(500px) rotateY(10deg);
            transition: transform 0.5s ease-out;
        }
        .logo-tilt:hover {
            transform: perspective(500px) rotateY(-10deg);
        }
        .header-shadow {
            text-shadow: 0 0 8px rgba(147, 51, 234, 0.6);
        }
        .header-subtitle-fade {
            animation: fadeIn 2s ease-out;
        }

        /* --- Input Field Focus/Hover Effects --- */
        .input-glow:focus {
            box-shadow: 0 0 0 2px #9333ea, 0 0 15px rgba(147, 51, 234, 0.7);
            transform: translateY(-1px);
        }
        .field-hover-effect:hover .label-glow-hover {
            color: #c4b5fd; /* light purple */
            text-shadow: 0 0 5px rgba(196, 181, 253, 0.5);
            transition: color 0.3s, text-shadow 0.3s;
        }
        
        /* --- Section Slide-in Animations (Subtle Entrance) --- */
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .section-slide-in {
            animation: slideIn 0.6s ease-out 0.2s backwards;
        }
        .section-slide-in-delay {
            animation: slideIn 0.6s ease-out 0.4s backwards;
        }
        .section-slide-in-delay-2 {
            animation: slideIn 0.6s ease-out 0.6s backwards;
        }
        .fade-in-delay-3 {
            animation: fadeIn 0.8s ease-out 1s backwards;
        }

        /* --- Button Glow and Flash --- */
        @keyframes flash {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        .flash-animation {
            animation: flash 1s infinite steps(1, end);
        }
        .submit-glow:not(:disabled):hover {
            box-shadow: 0 0 30px rgba(147, 51, 234, 0.8), 0 4px 15px rgba(79, 70, 229, 0.6);
        }

        /* --- Message Shake Effects (for feedback) --- */
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-5px); }
            40%, 80% { transform: translateX(5px); }
        }
        .shake-error {
            animation: shake 0.5s ease-in-out;
        }
        @keyframes successPop {
            0% { transform: scale(0.9); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        .shake-success {
            animation: successPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      
      `}</style>
    </div>
  );
}