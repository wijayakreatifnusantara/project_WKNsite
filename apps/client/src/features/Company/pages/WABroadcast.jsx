import React, { useState } from 'react';
import { 
  IconBrandWhatsapp, 
  IconSend, 
  IconUsers, 
  IconFileText,
  IconCheck,
  IconLoader2
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const WABroadcast = () => {
  const [target, setTarget] = useState('all');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    setSuccess(false);

    try {
      const res = await fetch('http://localhost:8000/api/whatsapp/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ target, message })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSuccess(true);
        setMessage('');
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-transparent custom-scrollbar animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#25D366]/10 flex items-center justify-center border border-[#25D366]/30 shadow-neu">
            <IconBrandWhatsapp size={32} className="text-[#25D366]" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 font-outfit tracking-tight uppercase">
              WhatsApp <span className="text-[#25D366]">Broadcast</span>
            </h2>
            <p className="text-slate-400 text-[9px] mt-1 font-black uppercase tracking-[0.3em] opacity-70">Mass Messaging Center</p>
          </div>
        </header>

        <Card className="bg-transparent border border-white/20 shadow-neu rounded-3xl overflow-hidden p-6">
          <div className="space-y-6">
            
            {/* Target Audience */}
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                <IconUsers size={14} /> Target Audience
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setTarget('all')}
                  className={`h-12 px-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all border ${
                    target === 'all' 
                      ? 'bg-[#25D366]/10 border-[#25D366]/50 text-[#25D366] shadow-neu-inset' 
                      : 'bg-transparent border-white/20 text-slate-500 shadow-neu hover:text-[#25D366]'
                  }`}
                >
                  Semua Karyawan
                </button>
                <button
                  onClick={() => setTarget('managers')}
                  className={`h-12 px-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all border ${
                    target === 'managers' 
                      ? 'bg-[#25D366]/10 border-[#25D366]/50 text-[#25D366] shadow-neu-inset' 
                      : 'bg-transparent border-white/20 text-slate-500 shadow-neu hover:text-[#25D366]'
                  }`}
                >
                  Manajer & Supervisor
                </button>
              </div>
            </div>

            {/* Message Box */}
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                <IconFileText size={14} /> Broadcast Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ketik pengumuman penting di sini..."
                className="w-full h-40 p-4 bg-transparent border border-white/20 rounded-2xl shadow-neu-inset text-sm font-bold text-slate-700 focus:outline-none focus:border-[#25D366]/50 transition-all resize-none custom-scrollbar"
              />
              <p className="text-[10px] font-bold text-slate-400 mt-2 ml-1">Gunakan *Teks* untuk bold, _Teks_ untuk italic (Format standar WhatsApp).</p>
            </div>

            <div className="pt-4 border-t border-white/20 flex items-center justify-between">
              {success ? (
                <div className="flex items-center gap-2 text-[#25D366] text-xs font-black uppercase tracking-widest bg-[#25D366]/10 px-4 py-2 rounded-lg">
                  <IconCheck size={16} /> Pesan Berhasil Dikirim!
                </div>
              ) : (
                <div />
              )}
              
              <button 
                onClick={handleSend}
                disabled={sending || !message.trim()}
                className={`flex items-center gap-2 h-12 px-8 rounded-xl font-black uppercase tracking-widest text-white shadow-neu transition-all ${
                  sending || !message.trim() ? 'bg-slate-300 cursor-not-allowed' : 'bg-[#25D366] hover:bg-[#1da851] active:shadow-neu-inset active:scale-95'
                }`}
              >
                {sending ? <IconLoader2 className="animate-spin" size={16} /> : <IconSend size={16} />}
                <span>Send Broadcast</span>
              </button>
            </div>

          </div>
        </Card>
      </div>
    </div>
  );
};

export default WABroadcast;
