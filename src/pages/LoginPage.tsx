// src/pages/LoginPage.tsx
import { useState, useEffect } from 'react';
import { KeyRound, UserPlus, AlertCircle, ShieldCheck, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../utils/cn';

export function LoginPage() {
  const [inviteCode, setInviteCode] = useState('');
  const [username, setUsername] = useState('');
  const [step, setStep] = useState<'code' | 'username'>('code');
  const [isLoading, setIsLoading] = useState(false);
  const { login, error } = useStore();

  // Clear errors when the user starts typing again
  useEffect(() => {
    if (useStore.getState().error) {
      useStore.setState({ error: null });
    }
  }, [inviteCode, username]);

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const code = inviteCode.toUpperCase().trim();
    const success = await login(code);

    if (success) {
      setIsLoading(false);
      return;
    }

    // ✅ FIX: Case-insensitive check for the "choose a username" trigger
    const currentError = useStore.getState().error;
    if (currentError && currentError.toLowerCase().includes('choose a username')) {
      setStep('username');
      useStore.setState({ error: null });
    }
    setIsLoading(false);
  };

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    setIsLoading(true);
    const code = inviteCode.toUpperCase().trim();
    await login(code, username.trim());
    setIsLoading(false);
  };

  const handleBack = () => {
    setStep('code');
    setUsername('');
    useStore.setState({ error: null });
  };

  return (
    <div className="min-h-screen bg-[#EEEEEE] flex flex-col items-center justify-center p-4 font-display">
      <div className="w-full max-w-sm">
        
        {/* --- BRAND HEADER --- */}
        <div className="text-center mb-8">
          <div className="inline-block bg-[#CC0000] py-1 px-4 mb-2 shadow-md transform -skew-x-12">
            <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter transform skew-x-12">
              Gridiron<span className="text-[#111111]">Hub</span>
            </h1>
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none">
            Broadcast Network Access
          </p>
        </div>

        {/* --- MAIN LOGIN PANEL --- */}
        <div className="bg-white border-t-4 border-[#111111] shadow-2xl overflow-hidden transition-all duration-300">
          
          {/* Panel Header */}
          <div className="bg-[#111111] py-2 px-6 flex justify-between items-center">
            <h2 className="text-[11px] font-black text-white uppercase italic tracking-widest">
              {step === 'code' ? 'Identity Verification' : 'Finalize Profile'}
            </h2>
            <div className="flex gap-1">
              <div className={cn("w-2 h-2 rounded-full transition-colors", step === 'code' ? "bg-[#CC0000]" : "bg-gray-600")} />
              <div className={cn("w-2 h-2 rounded-full transition-colors", step === 'username' ? "bg-[#CC0000]" : "bg-gray-600")} />
            </div>
          </div>

          <div className="p-8">
            {step === 'code' ? (
              <form onSubmit={handleCodeSubmit} className="space-y-6 animate-in fade-in duration-500">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                    Invite Passcode
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      placeholder="XXXX-XXXX"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-none text-[#111111] font-bold placeholder-gray-300 focus:outline-none focus:border-[#CC0000] transition-colors uppercase tracking-widest"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {error && <ErrorMessage message={error} />}

                <button
                  type="submit"
                  disabled={isLoading || inviteCode.trim().length === 0}
                  className="w-full group py-4 bg-[#111111] hover:bg-[#CC0000] text-white font-black uppercase italic tracking-tighter flex items-center justify-center transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Verify Access'}
                  <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleUsernameSubmit} className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="bg-green-50 border border-green-100 p-3 flex items-center gap-3">
                  <ShieldCheck className="text-green-600" size={20} />
                  <span className="text-[10px] font-black text-green-700 uppercase tracking-tight">Code Authenticated</span>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                    On-Air Name (Username)
                  </label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Username"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-none text-[#111111] font-bold focus:outline-none focus:border-[#CC0000] transition-colors"
                      required
                      minLength={2}
                      maxLength={20}
                      autoFocus
                    />
                  </div>
                </div>

                {error && <ErrorMessage message={error} />}

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={isLoading || username.trim().length < 2}
                    className="w-full py-4 bg-[#CC0000] text-white font-black uppercase italic tracking-tighter flex items-center justify-center shadow-lg shadow-red-500/20 transition-all disabled:opacity-50"
                  >
                    {isLoading ? 'Creating Account...' : 'Join Official League'}
                  </button>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="w-full py-2 text-[10px] font-black text-gray-400 hover:text-[#111111] uppercase tracking-widest transition-colors"
                  >
                    ← Use different code
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* --- FOOTER DECOR --- */}
        <div className="mt-8 flex justify-center gap-8 opacity-20 grayscale">
          <div className="text-[12px] font-black italic uppercase">ESPN-Style</div>
          <div className="text-[12px] font-black italic uppercase">Analytics</div>
          <div className="text-[12px] font-black italic uppercase">Live Data</div>
        </div>
      </div>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-red-50 border-l-4 border-red-600 text-red-700">
      <AlertCircle size={16} className="shrink-0" />
      <span className="text-[11px] font-bold uppercase tracking-tight">{message}</span>
    </div>
  );
}