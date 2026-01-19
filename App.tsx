
import React, { useState, useEffect, useRef } from 'react';
import { AppRoute, AlumniProfile, UserRole, ActivityImage } from './types';
import { mockFirebase } from './services/mockFirebase';


// --- Global Styles & Animations ---
const shimmerClass = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent";

const Header: React.FC<{ setRoute: (r: AppRoute) => void, currentUser: AlumniProfile | null, onLogout: () => void }> = ({ setRoute, currentUser, onLogout }) => (
  <header className="bg-white/90 backdrop-blur-xl border-b border-[#795548]/10 py-5 px-10 sticky top-0 z-50 shadow-sm transition-all duration-500">
    <div className="max-w-[1920px] mx-auto flex justify-between items-center">
      <div className="flex items-center space-x-5 cursor-pointer group" onClick={() => setRoute(AppRoute.HOME)}>
        <div className="w-14 h-14 bg-gradient-to-br from-[#795548] to-[#5d4037] rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:rotate-12 transition-all duration-500">
          <img src="https://img.icons8.com/fluency-systems-filled/48/ffffff/university.png" alt="Logo" className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-[#795548] leading-none tracking-tighter uppercase italic">THALANG <span className="text-[#d4af37]">TC</span></h1>
          <p className="text-[9px] text-slate-400 uppercase tracking-[0.3em] mt-1 font-bold">Technical College </p>
        </div>
      </div>

      <div className="flex items-center space-x-10">
        <nav className="hidden lg:flex space-x-10 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
          <button onClick={() => setRoute(AppRoute.HOME)} className="hover:text-[#795548] transition-all relative group">
            HOME
            <span className="absolute -bottom-2 left-0 w-0 h-1 bg-[#d4af37] rounded-full transition-all group-hover:w-full"></span>
          </button>
          <button onClick={() => setRoute(AppRoute.DIRECTORY)} className="hover:text-[#795548] transition-all relative group">
            SMART NETWORK
            <span className="absolute -bottom-2 left-0 w-0 h-1 bg-[#d4af37] rounded-full transition-all group-hover:w-full"></span>
          </button>
          <button onClick={() => setRoute(AppRoute.GUIDE)} className="hover:text-[#795548] transition-all relative group">
            RESOURCE CENTER
            <span className="absolute -bottom-2 left-0 w-0 h-1 bg-[#d4af37] rounded-full transition-all group-hover:w-full"></span>
          </button>
        </nav>

        {currentUser ? (
          <div className="flex items-center space-x-5 bg-slate-50 p-2 pr-6 rounded-3xl border border-slate-200 shadow-inner hover:bg-white transition-all group">
            <div className="relative">
              <img
                src={currentUser.profileImageUrl || `https://ui-avatars.com/api/?name=${currentUser.fullName}&background=795548&color=fff`}
                className="w-12 h-12 rounded-2xl object-cover cursor-pointer ring-4 ring-white shadow-xl group-hover:scale-110 transition-transform"
                onClick={() => setRoute(AppRoute.PROFILE)}
                alt="Avatar"
              />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-black text-slate-700 leading-none mb-1 uppercase tracking-tight">{currentUser.fullName}</p>
              <button onClick={onLogout} className="text-[10px] text-red-500 font-black hover:underline opacity-60 hover:opacity-100 transition-opacity uppercase tracking-widest">Sign Out</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setRoute(AppRoute.LOGIN)} className={`bg-[#795548] text-white px-10 py-4 rounded-2xl text-[10px] font-black tracking-[0.2em] shadow-2xl hover:shadow-[#795548]/40 hover:-translate-y-1 transition-all ${shimmerClass}`}>
            ACCESS PORTAL
          </button>
        )}
      </div>
    </div>
  </header>
);

const App: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>(AppRoute.HOME);
  const [currentUser, setCurrentUser] = useState<AlumniProfile | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<AlumniProfile | null>(null);
  const [loginRole, setLoginRole] = useState<UserRole | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSector, setActiveSector] = useState('ALL');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const user = mockFirebase.getCurrentUser();
    if (user) setCurrentUser(user);
  }, []);

  const handleLogout = () => {
    mockFirebase.clearSession();
    setCurrentUser(null);
    setRoute(AppRoute.HOME);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => callback(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAuth = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const existingProfiles = mockFirebase.getAllProfiles();

    if (isRegistering) {
      const studentId = formData.get('studentId') as string;
      if (existingProfiles.some(p => p.email === email || p.studentId === studentId)) {
        alert("Account identity already exists.");
        return;
      }
      const newProfile: AlumniProfile = {
        id: Date.now().toString(),
        fullName: formData.get('fullName') as string,
        studentId,
        email,
        phone: '',
        currentStatus: 'Active Connection',
        gallery: [],
        role: loginRole || 'STUDENT',
        // @ts-ignore
        password: password
      };
      mockFirebase.saveProfile(newProfile);
      mockFirebase.setCurrentUser(newProfile.id);
      setCurrentUser(newProfile);
      setRoute(AppRoute.PROFILE);
    } else {
      const user = existingProfiles.find(p => p.email === email);
      // @ts-ignore
      if (user && (user.password === password || (!user.password && password === "1234"))) {
        mockFirebase.setCurrentUser(user.id);
        setCurrentUser(user);
        setRoute(AppRoute.PROFILE);
      } else {
        alert("Authentication Failed. (Legacy Bypass: 1234)");
      }
    }
  };

  const filteredProfiles = mockFirebase.getAllProfiles().filter(p => {
    const matchesSearch = p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.studentId.includes(searchTerm) ||
      (p.company && p.company.toLowerCase().includes(searchTerm.toLowerCase()));
    if (activeSector === 'ALL') return matchesSearch;
    // Mock logic for sector filtering - can be expanded with real data
    return matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf9] selection:bg-[#795548] selection:text-white">
      <Header setRoute={setRoute} currentUser={currentUser} onLogout={handleLogout} />

      <main className="flex-grow">
        {route === AppRoute.HOME && (
          <div className="max-w-[1920px] mx-auto p-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-8 animate-fadeIn">
                <div className="mb-20">
                  <span className="text-[#d4af37] font-black tracking-[0.6em] text-xs uppercase mb-6 block">Thalang Technical College</span>
                  <h2 className="text-[6vw] font-black text-[#795548] mb-10 leading-[0.9] tracking-tighter uppercase italic">
                    TLTC Alumni <br />
                    <span className="text-[#d4af37] relative">
                      Alumni Profile
                      <span className="absolute bottom-4 left-0 w-full h-4 bg-[#795548]/5 -z-10"></span>
                    </span>
                  </h2>
                  <p className="text-2xl text-slate-500 max-w-2xl font-medium leading-relaxed">
                    ศูนย์รวมข้อมูลและเครือข่ายศิษย์เก่าวิทยาลัยเทคนิคถลาง เพื่อการขับเคลื่อนสู่อาชีพที่มั่นคงและความสำเร็จที่ยั่งยืน
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {[
                    { id: 'ADMIN', label: 'College Management', icon: 'https://img.icons8.com/bubbles/200/manager.png', color: 'bg-blue-50/50' },
                    { id: 'STAFF', label: 'Technical Personnel', icon: 'https://img.icons8.com/bubbles/200/conference-call.png', color: 'bg-purple-50/50' },
                    { id: 'TEACHER', label: 'Instructors & Mentors', icon: 'https://img.icons8.com/bubbles/200/classroom.png', color: 'bg-orange-50/50' },
                    { id: 'STUDENT', label: 'Students & Alumni', icon: 'https://img.icons8.com/bubbles/200/graduation-cap.png', color: 'bg-green-50/50' }
                  ].map((role) => (
                    <div
                      key={role.id}
                      onClick={() => { setLoginRole(role.id as UserRole); setRoute(AppRoute.LOGIN); }}
                      className="gov-card p-12 flex flex-col items-center justify-center cursor-pointer border-2 border-transparent hover:border-[#795548] transition-all duration-700 group relative overflow-hidden shadow-xl"
                    >
                      <div className={`absolute inset-0 ${role.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10`}></div>
                      <img src={role.icon} className="w-56 h-56 mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700" />
                      <span className="text-slate-800 font-black text-xl tracking-tight uppercase italic group-hover:text-[#795548] transition-colors">{role.label}</span>
                      <div className="mt-8 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all bg-[#795548] text-white text-[10px] px-8 py-3 rounded-full font-black uppercase tracking-[0.4em] shadow-2xl">เข้าสู่ระบบ</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 space-y-12 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                <div className="gov-card p-14 border-accent bg-[#795548] text-white relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(121,85,72,0.4)]">
                  <div className="absolute top-[-30px] right-[-30px] w-64 h-64 bg-white/10 rounded-full blur-[100px]"></div>
                  <h3 className="text-3xl font-black mb-12 border-b border-white/10 pb-6 italic">TLTC Updates</h3>
                  <div className="space-y-12">
                    {[
                      { cat: 'EVENT', title: 'งานคืนสู่เหย้าชาวเทคนิคถลาง 2567' },
                      { cat: 'CAREER', title: 'เปิดรับสมัครงานร่วมกับพันธมิตรสถานประกอบการ' },
                      { cat: 'NEWS', title: 'การพัฒนาระบบเทคโนโลยีดิจิทัลเพื่อศิษย์เก่า' }
                    ].map((news, i) => (
                      <div key={i} className="group cursor-pointer">
                        <span className="text-[10px] font-black text-[#d4af37] tracking-[0.3em] mb-3 block uppercase opacity-80">{news.cat}</span>
                        <h4 className="font-bold text-xl group-hover:text-[#d4af37] group-hover:translate-x-3 transition-all duration-500 leading-tight">{news.title}</h4>
                      </div>
                    ))}
                  </div>
                  <button className="mt-16 w-full py-6 bg-white/5 hover:bg-white/10 rounded-3xl font-black text-xs tracking-[0.3em] border border-white/10 transition-all uppercase">ดูประกาศทั้งหมด</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {route === AppRoute.DIRECTORY && (
          <div className="max-w-[1700px] mx-auto p-12 animate-fadeIn">
            {/* --- Futuristic Directory Header --- */}
            <div className="relative overflow-hidden rounded-[4rem] bg-[#795548] p-20 mb-16 shadow-[0_60px_100px_-20px_rgba(121,85,72,0.4)]">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#795548] to-[#5d4037]"></div>

              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="text-center lg:text-left">
                  <span className="inline-block bg-[#d4af37] text-[#795548] font-black px-6 py-2 rounded-full text-[10px] tracking-[0.4em] uppercase mb-8 shadow-xl">Secure Database</span>
                  <h2 className="text-6xl font-black text-white mb-6 uppercase tracking-tighter italic leading-none">Discovery <br /><span className="text-[#d4af37]">Hub v2.0</span></h2>
                  <p className="text-white/60 text-xl font-medium max-w-md">ระบบสืบค้นเครือข่ายศิษย์เก่าอัจฉริยะ เชื่อมโยงทุกสายงานเทคนิคระดับสูง</p>
                </div>

                <div className="w-full lg:w-1/2 space-y-6">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-[#d4af37]/20 blur-2xl group-hover:bg-[#d4af37]/40 transition-all"></div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="SCAN IDENTITY (ชื่อ, รหัส, หรือตำแหน่งงาน...)"
                      className="relative w-full px-12 py-8 rounded-[2.5rem] bg-white/10 backdrop-blur-3xl border-2 border-white/20 text-white placeholder-white/40 focus:border-[#d4af37] outline-none transition-all text-2xl font-black tracking-tight"
                    />
                    <div className="absolute right-10 top-1/2 -translate-y-1/2">
                      <img src="https://img.icons8.com/ios-filled/50/d4af37/search--v1.png" className="w-10 h-10 animate-pulse" />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                    {['ALL', 'TECHNOLOGY', 'ENGINEERING', 'HOSPITALITY', 'BUSINESS'].map(sector => (
                      <button
                        key={sector}
                        onClick={() => setActiveSector(sector)}
                        className={`px-8 py-3 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all border-2 ${activeSector === sector ? 'bg-[#d4af37] border-[#d4af37] text-[#795548]' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/40'}`}
                      >
                        {sector}
                      </button>
                    ))}
                  </div>
                </div>


              </div>
            </div>

            {/* --- Holographic Directory Cards --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-10">
              {filteredProfiles.length > 0 ? filteredProfiles.map(p => (
                <div
                  key={p.id}
                  onClick={() => { setSelectedProfile(p); setRoute(AppRoute.PUBLIC_VIEW); }}
                  className="group relative h-[450px] rounded-[3.5rem] overflow-hidden bg-white border border-slate-100 shadow-2xl hover:-translate-y-6 transition-all duration-700 cursor-pointer"
                >
                  {/* Holographic Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#d4af37]/5 group-hover:via-[#d4af37]/10 transition-all duration-1000"></div>
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  {/* Profile Media Section */}
                  <div className="h-2/3 relative overflow-hidden">
                    <img
                      src={p.profileImageUrl || `https://ui-avatars.com/api/?name=${p.fullName}&background=795548&color=fff&size=512`}
                      className="w-full h-full object-cover transform transition-transform duration-[2s] group-hover:scale-125 group-hover:rotate-2"
                      alt={p.fullName}
                    />
                    <div className="absolute top-6 left-6 px-4 py-2 bg-black/40 backdrop-blur-xl border border-white/20 rounded-full text-[8px] font-black text-white tracking-[0.3em] uppercase">
                      ID: {p.studentId}
                    </div>
                    <div className="absolute top-6 right-6 w-4 h-4 bg-green-500 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.8)] animate-pulse"></div>
                  </div>

                  {/* Identity Content */}
                  <div className="absolute bottom-0 left-0 w-full p-10 bg-white/80 backdrop-blur-2xl border-t border-slate-50 flex flex-col items-center text-center">
                    <h4 className="font-black text-slate-800 text-2xl group-hover:text-[#795548] transition-colors mb-2 uppercase italic tracking-tighter truncate w-full">{p.fullName}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6 line-clamp-1">{p.currentStatus}</p>

                    <button className="w-full py-4 bg-[#795548] text-white text-[10px] font-black tracking-[0.4em] uppercase rounded-2xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all shadow-xl">
                      Scan Identity
                    </button>

                    {/* Visual Connector Line */}
                    <div className="mt-4 w-12 h-1 bg-[#d4af37]/20 rounded-full group-hover:w-full transition-all duration-700"></div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-48 text-center flex flex-col items-center justify-center opacity-30">
                  <img src="https://img.icons8.com/ios-filled/100/795548/nothing-found.png" className="w-32 h-32 mb-8 grayscale" />
                  <p className="text-2xl font-black uppercase tracking-[0.8em] text-[#795548]">Data Source Empty</p>
                </div>
              )}
            </div>
          </div>
        )}

        {route === AppRoute.LOGIN && (
          <div className="max-w-xl mx-auto py-24 px-6 animate-fadeIn">
            <div className="gov-card p-16 border-accent shadow-2xl bg-white relative">
              <div className="text-center mb-16">
                <span className="text-[#d4af37] font-black tracking-[0.5em] text-[10px] uppercase mb-4 block">Identity Verification</span>
                <h2 className="text-4xl font-black text-[#795548] mb-4 uppercase tracking-tighter italic">{isRegistering ? 'TLTC Join' : 'TLTC Access'}</h2>
                <div className="w-24 h-2 bg-[#d4af37] mx-auto mt-8 rounded-full shadow-md"></div>
              </div>

              <form onSubmit={handleAuth} className="space-y-8">
                {isRegistering && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Full Legal Name (ชื่อ-นามสกุล)</label>
                    <input name="fullName" placeholder="Full Identity" className="w-full px-10 py-6 bg-slate-50 border-2 border-transparent focus:border-[#795548] focus:bg-white rounded-3xl outline-none font-bold transition-all shadow-inner text-lg" required />
                  </div>
                )}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Authorized Email</label>
                  <input name="email" type="email" placeholder="Email Address" className="w-full px-10 py-6 bg-slate-50 border-2 border-transparent focus:border-[#795548] focus:bg-white rounded-3xl outline-none font-bold transition-all shadow-inner text-lg" required />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Secure Password</label>
                  <input name="password" type="password" placeholder="••••••••" className="w-full px-10 py-6 bg-slate-50 border-2 border-transparent focus:border-[#795548] focus:bg-white rounded-3xl outline-none font-bold transition-all shadow-inner text-lg" required />
                </div>

                {isRegistering && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Member ID (รหัสประจำตัว)</label>
                    <input name="studentId" placeholder="ID Number" className="w-full px-10 py-6 bg-slate-50 border-2 border-transparent focus:border-[#795548] focus:bg-white rounded-3xl outline-none font-bold transition-all shadow-inner text-lg" required />
                  </div>
                )}

                <button type="submit" className={`w-full bg-[#795548] text-white py-7 rounded-[2rem] font-black shadow-2xl hover:bg-[#5d4037] transform active:scale-95 transition-all text-xl tracking-[0.3em] mt-10 uppercase ${shimmerClass}`}>
                  {isRegistering ? 'สร้างบัญชี' : 'ยืนยันตัวตน'}
                </button>

                <div className="text-center pt-10 border-t border-slate-100">
                  <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="text-slate-500 font-black hover:text-[#795548] transition-colors uppercase text-xs tracking-[0.3em]">
                    {isRegistering ? 'มีบัญชีแล้ว? เข้าสู่ระบบ' : 'สมาชิกใหม่? ลงทะเบียนที่นี่'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {route === AppRoute.PROFILE && currentUser && (
          <div className="max-w-[1500px] mx-auto p-12 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              <div className="lg:col-span-4">
                <div className="gov-card p-14 border-accent shadow-2xl text-center relative group overflow-hidden bg-white">
                  <div className="relative inline-block mb-12">
                    <div className="w-64 h-64 rounded-[4rem] mx-auto overflow-hidden border-[12px] border-white shadow-2xl transform transition-all duration-700 group-hover:scale-105">
                      <img
                        src={currentUser.profileImageUrl || `https://ui-avatars.com/api/?name=${currentUser.fullName}&size=512&background=795548&color=fff`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-[-10px] right-[-10px] w-20 h-20 bg-[#d4af37] text-white rounded-[2rem] flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all ring-8 ring-white"
                    >
                      <img src="https://img.icons8.com/ios-filled/40/ffffff/camera.png" className="w-10 h-10" />
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, (url) => {
                      const updated = { ...currentUser, profileImageUrl: url };
                      mockFirebase.saveProfile(updated);
                      setCurrentUser(updated);
                    })} />
                  </div>

                  <h2 className="text-4xl font-black text-[#795548] mb-3 tracking-tighter uppercase italic">{currentUser.fullName}</h2>
                  <p className="text-slate-400 font-black text-xs tracking-[0.5em] uppercase mb-12">TLTC Verified Member</p>

                  <div className="grid grid-cols-1 gap-5 mb-12">
                    <div className="bg-slate-50/50 p-8 rounded-[2.5rem] text-left border border-slate-100 shadow-inner">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Work Status</p>
                      <p className="text-xl font-black text-[#795548] uppercase italic">{currentUser.currentStatus}</p>
                    </div>
                  </div>

                  <button onClick={() => setRoute(AppRoute.EDIT_PROFILE)} className="w-full py-6 bg-[#795548] text-white rounded-[2.5rem] font-black tracking-[0.3em] shadow-2xl hover:bg-[#5d4037] transition-all uppercase italic">แก้ไขโปรไฟล์</button>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-16">
                <div className="gov-card p-16 border-accent shadow-2xl relative overflow-hidden bg-white">
                  <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.8em] mb-12">Personal Narrative</h3>
                  <p className="text-3xl font-medium text-slate-700 leading-[1.5] italic">
                    "{currentUser.bio || "ยินดีที่ได้รู้จักศิษย์เก่าวิทยาลัยเทคนิคถลางทุกท่านครับ ผมพร้อมเชื่อมต่อความร่วมมือกับทุกคน"}"
                  </p>
                </div>

                <div className="gov-card p-16 border-accent shadow-2xl bg-white">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
                    <div>
                      <h3 className="text-3xl font-black text-[#795548] uppercase tracking-tighter italic">Memory Collective</h3>
                      <p className="text-slate-400 font-bold text-sm tracking-widest mt-2">พื้นที่เก็บความทรงจำสมัยเรียนและกิจกรรมวิทยาลัย</p>
                    </div>
                    <button onClick={() => {
                      const picker = document.createElement('input');
                      picker.type = 'file';
                      picker.accept = 'image/*';
                      picker.onchange = (e: any) => handleImageUpload(e, (url) => {
                        const caption = prompt("คำบรรยายภาพ (Caption):") || "Memorable Moment";
                        const updated = mockFirebase.addActivityImage(currentUser.id, {
                          id: Date.now().toString(), url, caption, date: new Date().toLocaleDateString('th-TH')
                        });
                        if (updated) setCurrentUser({ ...updated });
                      });
                      picker.click();
                    }} className={`bg-[#d4af37] text-white px-12 py-5 rounded-[2.5rem] font-black text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.3em] ${shimmerClass}`}>
                      เพิ่มรูปภาพ
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {currentUser.gallery && currentUser.gallery.length > 0 ? currentUser.gallery.map(img => (
                      <div key={img.id} className="group relative rounded-[3.5rem] overflow-hidden aspect-[3/4] shadow-2xl">
                        <img src={img.url} className="w-full h-full object-cover transform transition-transform duration-[2s] group-hover:scale-125" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#795548] via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex flex-col justify-end p-12">
                          <p className="text-white text-2xl font-black mb-3 italic">{img.caption}</p>
                          <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.4em]">{img.date}</p>
                          <button onClick={() => {
                            if (confirm("Confirm removal?")) {
                              const updated = mockFirebase.deleteActivityImage(currentUser.id, img.id);
                              if (updated) setCurrentUser({ ...updated });
                            }
                          }} className="mt-8 text-red-300 font-black text-[10px] tracking-[0.5em] uppercase hover:text-white transition-colors text-left underline">ลบรูปภาพ</button>
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-full py-40 border-4 border-dashed border-slate-100 rounded-[4rem] flex flex-col items-center justify-center opacity-30">
                        <img src="https://img.icons8.com/ios/100/795548/image-gallery.png" className="w-24 h-24 mb-8" />
                        <p className="font-black uppercase tracking-[0.8em] text-xs">No Visual Assets Yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {route === AppRoute.EDIT_PROFILE && currentUser && (
          <div className="max-w-4xl mx-auto py-24 px-6 animate-fadeIn">
            <div className="gov-card p-12 border-accent shadow-2xl bg-white">
              <h2 className="text-3xl font-black text-[#795548] mb-12 border-b border-slate-100 pb-6 italic">REFINING YOUR IDENTITY</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const updated = {
                  ...currentUser,
                  fullName: formData.get('fullName') as string,
                  currentStatus: formData.get('status') as string,
                  company: formData.get('company') as string,
                  position: formData.get('position') as string,
                  phone: formData.get('phone') as string,
                  bio: formData.get('bio') as string
                };
                mockFirebase.saveProfile(updated);
                setCurrentUser(updated);
                setRoute(AppRoute.PROFILE);
              }} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ชื่อ-นามสกุล</label>
                    <input name="fullName" defaultValue={currentUser.fullName} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-[#795548] rounded-2xl outline-none font-bold" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">เบอร์โทรศัพท์</label>
                    <input name="phone" defaultValue={currentUser.phone} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-[#795548] rounded-2xl outline-none font-bold" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">สถานะปัจจุบัน</label>
                    <select name="status" defaultValue={currentUser.currentStatus} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-[#795548] rounded-2xl outline-none font-bold">
                      <option>ทำงานแล้ว</option>
                      <option>กำลังหางาน</option>
                      <option>ศึกษาต่อ</option>
                      <option>ธุรกิจส่วนตัว</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ตำแหน่งงาน</label>
                    <input name="position" defaultValue={currentUser.position} placeholder="เช่น ช่างเทคนิค / วิศวกร" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-[#795548] rounded-2xl outline-none font-bold" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">แนะนำตัว (Bio)</label>
                  <textarea name="bio" defaultValue={currentUser.bio} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-[#795548] rounded-2xl outline-none font-bold h-48 resize-none" placeholder="บอกเล่าเรื่องราวความสำเร็จของคุณ..." />
                </div>
                <div className="flex space-x-4 pt-6">
                  <button type="submit" className={`flex-1 bg-[#795548] text-white py-5 rounded-2xl font-black text-lg tracking-[0.2em] shadow-xl hover:bg-[#5d4037] active:scale-95 transition-all ${shimmerClass}`}>SAVE EVOLUTION</button>
                  <button type="button" onClick={() => setRoute(AppRoute.PROFILE)} className="flex-1 bg-slate-100 text-slate-600 py-5 rounded-2xl font-black text-lg tracking-[0.2em] hover:bg-slate-200 transition-all">CANCEL</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {route === AppRoute.GUIDE && (
          <div className="max-w-[1500px] mx-auto p-12 animate-fadeIn">
            <div className="text-center mb-24 relative">
              <div className="absolute inset-0 flex items-center justify-center -z-10">
                <span className="text-[10vw] font-black text-slate-50 opacity-[0.05] uppercase select-none">Manual</span>
              </div>
              <span className="text-[#d4af37] font-black tracking-[0.8em] text-[10px] uppercase mb-6 block">Student & Alumni Resource</span>
              <h2 className="text-5xl font-black text-[#795548] mb-8 tracking-tighter uppercase italic">TLTC Ecosystem Manual</h2>
              <div className="w-40 h-2.5 bg-gradient-to-r from-[#795548] to-[#d4af37] mx-auto rounded-full shadow-lg"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {[
                { title: "Secure Access", desc: "เข้าใช้งานระบบด้วยอีเมลและรหัสผ่านส่วนตัว รองรับการแยกสิทธิ์ระหว่างนักศึกษา ครู และบุคลากร", icon: "https://img.icons8.com/fluency/96/password-window.png" },
                { title: "Direct Media Sync", desc: "อัปโหลดรูปภาพโปรไฟล์และรูปกิจกรรมได้โดยตรงจากมือถือหรือคอมพิวเตอร์ของคุณเพื่อสร้าง Portfolio", icon: "https://img.icons8.com/fluency/96/upload.png" },
                { title: "Alumni Directory", desc: "ฐานข้อมูลศิษย์เก่าวิทยาลัยเทคนิคถลาง ค้นหาเพื่อนร่วมรุ่นและสร้างเครือข่ายความร่วมมือทางอาชีพ", icon: "https://img.icons8.com/fluency/96/radar.png" },
                { title: "Activity Gallery", desc: "เก็บรวบรวมภาพความทรงจำจากการฝึกงาน กิจกรรมวิทยาลัย และความสำเร็จต่างๆ ในรูปแบบ Gallery", icon: "https://img.icons8.com/fluency/96/album.png" },
                { title: "Career Profile", desc: "อัปเดตตำแหน่งงานและสถานะปัจจุบันของคุณ เพื่อเป็นแรงบันดาลใจและช่องทางติดต่อสำหรับรุ่นน้อง", icon: "https://img.icons8.com/fluency/96/medal.png" },
                { title: "Student Privacy", desc: "ข้อมูลส่วนตัวของคุณจะถูกเก็บรักษาอย่างดีเยี่ยม และมีเพียงคุณเท่านั้นที่จัดการข้อมูลโปรไฟล์ของตนเองได้", icon: "https://img.icons8.com/fluency/96/safe.png" }
              ].map((item, i) => (
                <div key={i} className="gov-card p-12 border-accent group hover:bg-[#795548] transition-all duration-700 transform hover:-translate-y-4 shadow-xl">
                  <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mb-10 group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 shadow-xl border border-slate-50">
                    <img src={item.icon} className="w-14 h-14" alt={item.title} />
                  </div>
                  <h3 className="text-2xl font-black text-[#795548] group-hover:text-white mb-6 transition-colors tracking-tight uppercase italic">{item.title}</h3>
                  <p className="text-slate-500 group-hover:text-white/70 text-base leading-relaxed transition-colors font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {route === AppRoute.PUBLIC_VIEW && selectedProfile && (
          <div className="max-w-[1400px] mx-auto p-12 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-4 text-center">
                <div className="gov-card p-10 border-accent bg-white shadow-xl">
                  <img src={selectedProfile.profileImageUrl || `https://ui-avatars.com/api/?name=${selectedProfile.fullName}&size=256&background=795548&color=fff`} className="w-48 h-48 rounded-[3rem] mx-auto border-4 border-slate-50 shadow-lg object-cover mb-8" />
                  <h2 className="text-3xl font-black text-[#795548] mb-2">{selectedProfile.fullName}</h2>
                  <p className="text-slate-400 font-bold mb-6">ID: {selectedProfile.studentId}</p>
                  <div className="bg-slate-50 p-4 rounded-xl text-xs font-black uppercase text-[#795548] tracking-widest border border-slate-100">
                    Verified Member
                  </div>
                </div>
              </div>
              <div className="lg:col-span-8 space-y-12">
                <div className="gov-card p-12 border-accent bg-white shadow-xl">
                  <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-6">About</h3>
                  <p className="text-xl font-medium text-slate-600 italic">"{selectedProfile.bio || "Hello from our esteemed TLTC alumni member."}"</p>
                </div>
                <div className="gov-card p-12 border-accent bg-white shadow-xl">
                  <h3 className="text-2xl font-black text-[#795548] uppercase tracking-tighter mb-10">Activity Gallery</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {selectedProfile.gallery.map(img => (
                      <div key={img.id} className="rounded-2xl overflow-hidden shadow-lg border border-slate-100 aspect-square">
                        <img src={img.url} className="w-full h-full object-cover" alt={img.caption} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <button onClick={() => setRoute(AppRoute.DIRECTORY)} className="mt-12 mx-auto flex items-center space-x-2 text-slate-400 hover:text-[#795548] font-black uppercase tracking-widest transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              <span>Back to Directory</span>
            </button>
          </div>
        )}
      </main>

      <footer className="bg-white py-32 px-12 border-t border-slate-100 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto text-center relative">
          <h2 className="text-4xl font-black text-[#795548] tracking-tighter mb-6 italic uppercase">THALANG <span className="text-[#d4af37]">TC</span></h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.8em] text-[10px] mb-16">Thalang Technical College - Shaping Future Professionals</p>
          <div className="w-40 h-1 bg-[#795548]/10 mx-auto mb-10 rounded-full"></div>
          <p className="text-slate-300 text-[10px] font-black uppercase tracking-[1em]">© 2024 THALANG TECHNICAL COLLEGE • ALL RIGHTS RESERVED</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
