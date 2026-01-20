
import React, { useState, useEffect, useRef } from 'react';
import { AppRoute, AlumniProfile, UserRole, ActivityImage } from './types';
import { firebaseService } from './services/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { Search, Camera, ChevronLeft, LogOut, Grid, BookOpen, Home, User, ArrowRight, Sparkles } from 'lucide-react';

// --- Styling Constants ---
const shimmerClass = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent";

const Header: React.FC<{ setRoute: (r: AppRoute) => void, currentUser: AlumniProfile | null, onLogout: () => void }> = ({ setRoute, currentUser, onLogout }) => (
  <header className="bg-white/95 backdrop-blur-xl border-b border-slate-100 py-4 px-6 md:px-12 sticky top-0 z-50 transition-all duration-300 shadow-sm">
    <div className="max-w-[1920px] mx-auto flex justify-between items-center">
      <div className="flex items-center space-x-4 cursor-pointer group" onClick={() => setRoute(AppRoute.HOME)}>
        <div className="w-12 h-12 bg-[#795548] rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-all duration-500">
          <img src="https://img.icons8.com/fluency-systems-filled/48/ffffff/university.png" alt="Logo" className="w-6 h-6" />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-xl font-black text-[#795548] leading-none tracking-tighter uppercase italic">THALANG <span className="text-[#d4af37]">TC</span></h1>
          <p className="text-[8px] text-slate-400 uppercase tracking-[0.3em] font-bold mt-1">Technical College </p>
        </div>
      </div>

      <nav className="hidden lg:flex items-center space-x-10 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
        <button onClick={() => setRoute(AppRoute.HOME)} className="hover:text-[#795548] transition-colors flex items-center gap-2 group"><Home size={14} className="group-hover:scale-125 transition-transform" /> HOME</button>
        <button onClick={() => setRoute(AppRoute.DIRECTORY)} className="hover:text-[#795548] transition-colors flex items-center gap-2 group"><Grid size={14} className="group-hover:scale-125 transition-transform" /> SMART NETWORK</button>
        <button onClick={() => setRoute(AppRoute.GUIDE)} className="hover:text-[#795548] transition-colors flex items-center gap-2 group"><BookOpen size={14} className="group-hover:scale-125 transition-transform" /> RESOURCE CENTER</button>
      </nav>

      <div className="flex items-center">
        {currentUser ? (
          <div className="flex items-center bg-white border border-[#795548]/10 rounded-full pl-2 pr-4 py-1.5 space-x-3 shadow-sm hover:shadow-xl hover:border-[#795548]/30 transition-all duration-500 group">
            <div className="relative">
              <img
                src={currentUser.profileImageUrl || `https://ui-avatars.com/api/?name=${currentUser.fullName}&background=795548&color=fff`}
                className="w-10 h-10 rounded-full object-cover border-2 border-white cursor-pointer group-hover:scale-110 transition-transform shadow-md"
                onClick={() => setRoute(AppRoute.PROFILE)}
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-black text-slate-700 leading-none uppercase">{currentUser.fullName.split(' ')[0]}</span>
              <button onClick={onLogout} className="text-[9px] text-red-400 font-bold uppercase tracking-tighter hover:text-red-600 transition-colors">SIGN OUT</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setRoute(AppRoute.LOGIN)} className={`bg-[#795548] text-white px-8 py-3.5 rounded-2xl text-[10px] font-black tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(121,85,72,0.4)] hover:shadow-[#795548]/60 hover:-translate-y-1 transition-all uppercase ${shimmerClass}`}>
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
  const [allProfiles, setAllProfiles] = useState<AlumniProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<AlumniProfile | null>(null);
  const [loginRole, setLoginRole] = useState<UserRole | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseService.auth, async (user) => {
      if (user) {
        const profile = await firebaseService.getProfile(user.uid);
        setCurrentUser(profile);
      } else {
        setCurrentUser(null);
      }
    });

    const fetchAll = async () => {
      const profiles = await firebaseService.getAllProfiles();
      setAllProfiles(profiles);
    };
    fetchAll();

    return () => unsubscribe();
  }, [route]);

  const handleLogout = async () => {
    await signOut(firebaseService.auth);
    setRoute(AppRoute.HOME);
  };

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      if (isRegistering) {
        const fullName = formData.get('fullName') as string;
        const studentId = formData.get('studentId') as string;
        const userCred = await createUserWithEmailAndPassword(firebaseService.auth, email, password);
        const newProfile: AlumniProfile = {
          id: userCred.user.uid,
          fullName,
          studentId,
          email,
          phone: '',
          currentStatus: 'Active Connection',
          gallery: [],
          role: loginRole || 'STUDENT',
          bio: 'ยินดีที่ได้รู้จักศิษย์เก่าวิทยาลัยเทคนิคถลางทุกท่านครับ ผมพร้อมเชื่อมต่อความร่วมมือกับทุกคน',
        };
        await firebaseService.saveProfile(newProfile);
        setCurrentUser(newProfile);
      } else {
        await signInWithEmailAndPassword(firebaseService.auth, email, password);
      }
      setRoute(AppRoute.PROFILE);
    } catch (error: any) {
      alert("Authentication Error: " + error.message);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => callback(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const filteredProfiles = allProfiles.filter(p => {
    return p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.studentId.includes(searchTerm) ||
      (p.company && p.company.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf9] selection:bg-[#795548] selection:text-white">
      <Header setRoute={setRoute} currentUser={currentUser} onLogout={handleLogout} />

      <main className="flex-grow">
        {/* --- HOME PAGE --- */}
        {route === AppRoute.HOME && (
          <div className="max-w-[1920px] mx-auto p-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
              <div className="lg:col-span-8 animate-fadeIn">
                <div className="mb-20">
                  <div className="flex items-center space-x-3 text-[#d4af37] mb-6">
                    <Sparkles size={16} />
                    <span className="font-black tracking-[0.5em] text-xs uppercase block">Thalang Technical College</span>
                  </div>
                  <h2 className="text-[5.5vw] font-black text-[#795548] mb-10 leading-[0.9] tracking-tighter uppercase italic">
                    TLTC Alumni <br />
                    <span className="text-[#d4af37] relative inline-block">
                      Ecosystem
                      <div className="absolute -bottom-2 left-0 w-full h-2 bg-[#d4af37]/20 rounded-full"></div>
                    </span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {[
                    { role: 'ADMIN', img: 'https://img.icons8.com/bubbles/250/manager.png', color: 'bg-blue-50' },
                    { role: 'STAFF', img: 'https://img.icons8.com/bubbles/250/conference-call.png', color: 'bg-indigo-50' },
                    { role: 'TEACHER', img: 'https://img.icons8.com/bubbles/250/classroom.png', color: 'bg-amber-50' },
                    { role: 'STUDENT', img: 'https://img.icons8.com/bubbles/250/graduation-cap.png', color: 'bg-rose-50' }
                  ].map((item) => (
                    <div
                      key={item.role}
                      onClick={() => { setLoginRole(item.role as UserRole); setRoute(AppRoute.LOGIN); }}
                      className={`gov-card p-14 flex flex-col items-center justify-center cursor-pointer border-2 border-transparent hover:border-[#795548] transition-all duration-700 group relative overflow-hidden shadow-xl ${item.color}/40`}
                    >
                      <div className="w-56 h-56 mb-6 transform group-hover:scale-110 group-hover:-rotate-3 transition-all duration-700 relative z-10 drop-shadow-2xl">
                        <img src={item.img} alt={item.role} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex items-center space-x-3 relative z-10">
                        <span className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter group-hover:text-[#795548] transition-colors">{item.role} ACCESS</span>
                        <ArrowRight className="w-6 h-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#d4af37] duration-500" />
                      </div>
                      <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
                        <h4 className="text-8xl font-black italic">{item.role[0]}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 space-y-10">
                <div className="gov-card p-12 bg-[#795548] text-white shadow-[0_50px_100px_-20px_rgba(121,85,72,0.4)] relative overflow-hidden group border-none">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-1000"></div>
                  <h3 className="text-2xl font-black mb-10 italic uppercase border-b border-white/10 pb-6 flex items-center gap-3">
                    <Sparkles className="text-[#d4af37]" size={24} />
                    COLLEGE UPDATES
                  </h3>
                  <div className="space-y-12 relative z-10">
                    <div className="group/item cursor-pointer">
                      <span className="text-[#d4af37] text-[9px] font-black uppercase tracking-[0.4em] block mb-3 opacity-80">Announcements</span>
                      <h4 className="text-xl font-bold leading-tight group-hover/item:text-[#d4af37] transition-all duration-500 italic">การยกระดับเครือข่ายศิษย์เก่าสู่อนาคตดิจิทัล</h4>
                    </div>
                    <div className="group/item cursor-pointer">
                      <span className="text-[#d4af37] text-[9px] font-black uppercase tracking-[0.4em] block mb-3 opacity-80">Opportunities</span>
                      <h4 className="text-xl font-bold leading-tight group-hover/item:text-[#d4af37] transition-all duration-500 italic">โอกาสทางอาชีพในกลุ่มบริษัทพันธมิตร Thalang TC</h4>
                    </div>
                    <div className="pt-6">
                      <button className="text-[10px] font-black uppercase tracking-widest border border-white/20 px-8 py-3 rounded-xl hover:bg-white hover:text-[#795548] transition-all duration-500">View All News</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- GUIDE / RESOURCE CENTER --- */}
        {route === AppRoute.GUIDE && (
          <div className="max-w-[1600px] mx-auto p-12 animate-fadeIn text-center">
            <div className="mb-24">
              <span className="text-[#d4af37] font-black tracking-[0.6em] text-xs uppercase mb-6 block">Student & Alumni Resource</span>
              <h2 className="text-7xl font-black text-[#795548] mb-12 italic uppercase tracking-tighter leading-none">TLTC ECOSYSTEM MANUAL</h2>
              <div className="w-40 h-2.5 bg-[#d4af37] mx-auto rounded-full shadow-[0_0_20px_rgba(212,175,55,0.4)]"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-20 px-6">
              {[
                { title: 'SECURE ACCESS', desc: 'เข้าใช้งานระบบด้วยอีเมลและรหัสผ่านส่วนตัว รองรับการแยกสิทธิ์ระหว่างนักศึกษา ครู และบุคลากร', icon: 'https://img.icons8.com/fluency/144/key.png' },
                { title: 'DIRECT MEDIA SYNC', desc: 'อัปโหลดรูปภาพโปรไฟล์และรูปกิจกรรมได้โดยตรงจากมือถือหรือคอมพิวเตอร์ของคุณเพื่อสร้าง Portfolio', icon: 'https://img.icons8.com/fluency/144/upload-2.png' },
                { title: 'ALUMNI DIRECTORY', desc: 'ฐานข้อมูลศิษย์เก่าวิทยาลัยเทคนิคถลาง ค้นหาเพื่อน ร่วมรุ่นและสร้างเครือข่ายความร่วมมือทางอาชีพ', icon: 'https://img.icons8.com/fluency/144/radar.png' }
              ].map((item, i) => (
                <div key={i} className="bg-white p-20 rounded-[4.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] flex flex-col items-center group border border-slate-50 hover:-translate-y-5 transition-all duration-700">
                  <div className="w-36 h-36 bg-slate-50 rounded-[3.5rem] flex items-center justify-center mb-12 shadow-inner group-hover:bg-[#795548]/5 transition-all duration-500">
                    <img src={item.icon} className="w-20 h-20 transform group-hover:scale-125 transition-transform duration-700" alt={item.title} />
                  </div>
                  <h3 className="text-2xl font-black text-[#795548] mb-8 italic uppercase tracking-tighter">{item.title}</h3>
                  <p className="text-slate-500 leading-relaxed font-medium text-lg px-4">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- DIRECTORY --- */}
        {route === AppRoute.DIRECTORY && (
          <div className="max-w-[1700px] mx-auto p-12 animate-fadeIn">
            <div className="relative overflow-hidden rounded-[5rem] bg-[#795548] p-16 md:p-28 mb-20 shadow-[0_80px_120px_-30px_rgba(121,85,72,0.4)] border border-white/5">
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
                <div className="text-center lg:text-left">
                  <span className="bg-[#d4af37]/20 text-[#d4af37] px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.3em] mb-8 inline-block backdrop-blur-md border border-[#d4af37]/20 shadow-xl">Professional Database</span>
                  <h2 className="text-7xl font-black text-white mb-8 uppercase tracking-tighter italic leading-[0.85]">
                    STILL GOT THE <br />
                    <span className="text-[#d4af37]">[THALANG TC] SPIRIT</span>
                  </h2>
                  <p className="text-white/60 text-xl font-medium max-w-lg leading-relaxed">ระบบสืบค้นเครือข่ายศิษย์เก่าอัจฉริยะ เชื่อมโยงทุกสายงานเทคนิคระดับสูง</p>
                </div>
                <div className="space-y-10">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#d4af37] to-[#795548] rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="SCAN IDENTITY (ชื่อ, รหัส, หรือตำแหน่งงาน...)"
                        className="w-full px-14 py-10 rounded-[3rem] bg-white/10 backdrop-blur-2xl border-2 border-white/10 text-white placeholder-white/30 focus:border-[#d4af37] focus:bg-white/15 outline-none transition-all text-2xl font-black shadow-2xl"
                      />
                      <Search className="absolute right-12 top-1/2 -translate-y-1/2 text-[#d4af37] w-10 h-10 group-hover:scale-125 transition-transform duration-500" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-5 justify-center lg:justify-start">
                    {['ALL', 'TECHNOLOGY', 'ENGINEERING', 'HOSPITALITY', 'BUSINESS'].map((cat, i) => (
                      <button key={cat} className={`px-10 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 shadow-lg ${i === 0 ? 'bg-[#d4af37] text-[#795548] shadow-[#d4af37]/20' : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/15 hover:text-white'}`}>{cat}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-12">
              {filteredProfiles.map(p => (
                <div
                  key={p.id}
                  onClick={() => { setSelectedProfile(p); setRoute(AppRoute.PUBLIC_VIEW); }}
                  className="group relative h-[520px] rounded-[4.5rem] overflow-hidden bg-white border border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.06)] hover:-translate-y-10 transition-all duration-700 cursor-pointer"
                >
                  <div className="h-[70%] relative overflow-hidden">
                    <img src={p.profileImageUrl || `https://ui-avatars.com/api/?name=${p.fullName}&background=795548&color=fff`} className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-2 transition-all duration-1000 ease-out" />
                    <div className="absolute top-8 left-8 bg-black/50 backdrop-blur-xl px-5 py-2 rounded-full text-[10px] text-white font-black uppercase tracking-widest border border-white/20 shadow-2xl">ID: {p.studentId}</div>
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-60"></div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full p-12 bg-white flex flex-col items-center">
                    <h4 className="font-black text-slate-800 text-2xl uppercase italic tracking-tighter truncate w-full text-center group-hover:text-[#795548] transition-colors duration-500">{p.fullName}</h4>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2 group-hover:text-[#d4af37] transition-colors">{p.currentStatus}</span>
                    <div className="w-14 h-1.5 bg-[#d4af37]/20 mt-8 rounded-full group-hover:w-32 group-hover:bg-[#d4af37] transition-all duration-1000"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- PROFILE PAGE (Self View) --- */}
        {route === AppRoute.PROFILE && currentUser && (
          <div className="max-w-[1700px] mx-auto p-12 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              <div className="lg:col-span-4">
                <div className="bg-white rounded-[5rem] p-16 shadow-[0_60px_100px_-20px_rgba(0,0,0,0.05)] border border-slate-50 text-center relative overflow-hidden group">
                  <div className="relative inline-block mb-14">
                    <div className="w-72 h-72 rounded-[4.5rem] overflow-hidden border-[16px] border-white shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] relative group/img">
                      <img src={currentUser.profileImageUrl || `https://ui-avatars.com/api/?name=${currentUser.fullName}&size=512&background=795548&color=fff`} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-1000" />
                      <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <Camera size={48} className="text-white transform scale-75 group-hover/img:scale-100 transition-transform duration-500" />
                      </div>
                    </div>
                    <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-4 right-4 w-20 h-20 bg-[#d4af37] text-white rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(212,175,55,0.6)] ring-8 ring-white hover:scale-110 active:scale-95 transition-all">
                      <Camera size={28} />
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, async (url) => {
                      const updated = { ...currentUser, profileImageUrl: url };
                      await firebaseService.saveProfile(updated);
                      setCurrentUser(updated);
                    })} />
                  </div>
                  <h2 className="text-4xl font-black text-[#795548] uppercase italic leading-tight mb-3 tracking-tighter">{currentUser.fullName}</h2>
                  <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.6em] mb-14">TLTC VERIFIED MEMBER</p>

                  <div className="bg-[#fdfbf9] rounded-[3rem] p-12 mb-12 shadow-inner border border-slate-100/50">
                    <span className="text-[10px] font-black uppercase text-slate-400 block mb-6 tracking-widest">Work Status</span>
                    <h4 className="text-3xl font-black text-[#795548] uppercase italic tracking-tighter leading-none">{currentUser.currentStatus}</h4>
                  </div>

                  <button onClick={() => setRoute(AppRoute.EDIT_PROFILE)} className="w-full py-7 bg-[#795548] text-white rounded-[2.5rem] font-black tracking-[0.4em] uppercase italic shadow-[0_20px_40px_-10px_rgba(121,85,72,0.4)] hover:bg-[#5d4037] transition-all hover:scale-[1.02]">แก้ไขโปรไฟล์</button>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-16">
                <div className="bg-white rounded-[5rem] p-20 shadow-[0_60px_100px_-20px_rgba(0,0,0,0.05)] border border-slate-50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-5">
                    <Sparkles size={80} className="text-[#795548]" />
                  </div>
                  <span className="text-[11px] font-black text-[#d4af37] uppercase tracking-[0.5em] mb-10 block">Personal Narrative</span>
                  <p className="text-4xl font-black text-[#795548] italic leading-[1.2] tracking-tight relative z-10 uppercase">
                    "{currentUser.bio || 'ยินดีที่ได้รู้จักศิษย์เก่าวิทยาลัยเทคนิคถลางทุกท่านครับ ผมพร้อมเชื่อมต่อความร่วมมือกับทุกคน'}"
                  </p>
                </div>

                <div className="bg-white rounded-[5rem] p-20 shadow-[0_60px_100px_-20px_rgba(0,0,0,0.05)] border border-slate-50">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-20">
                    <div>
                      <h3 className="text-5xl font-black text-[#795548] uppercase italic tracking-tighter leading-none mb-4">Memory Collective</h3>
                      <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">พื้นที่เก็บความทรงจำสมัยเรียนและกิจกรรมวิทยาลัย</p>
                    </div>
                    <button onClick={() => {
                      const picker = document.createElement('input');
                      picker.type = 'file';
                      picker.onchange = (e: any) => handleImageUpload(e, async (url) => {
                        const newImg = { id: Date.now().toString(), url, caption: "Moment", date: new Date().toLocaleDateString() };
                        await firebaseService.addActivityImage(currentUser.id, newImg);
                        setCurrentUser({ ...currentUser, gallery: [...(currentUser.gallery || []), newImg] });
                      });
                      picker.click();
                    }} className={`bg-[#d4af37] text-white px-12 py-5 rounded-[2rem] font-black text-[11px] uppercase shadow-[0_20px_40px_-10px_rgba(212,175,55,0.4)] hover:scale-105 transition-all ${shimmerClass}`}>เพิ่มรูปภาพ</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                    {currentUser.gallery?.map(img => (
                      <div key={img.id} className="group relative rounded-[3.5rem] overflow-hidden aspect-[4/5] shadow-2xl border border-slate-100">
                        <img src={img.url} className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-transform duration-1000" alt="Memory" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#795548] opacity-0 group-hover:opacity-90 transition-opacity duration-500 flex flex-col justify-end p-12">
                          <button onClick={async () => {
                            if (confirm('ยืนยันการลบรูปภาพนี้?')) {
                              await firebaseService.deleteActivityImage(currentUser.id, img);
                              setCurrentUser({ ...currentUser, gallery: currentUser.gallery.filter(i => i.id !== img.id) });
                            }
                          }} className="text-white font-black uppercase text-[10px] border border-white/30 px-6 py-3 rounded-full hover:bg-white hover:text-[#795548] transition-all tracking-widest text-center shadow-2xl">Delete Memory</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- PUBLIC VIEW --- */}
        {route === AppRoute.PUBLIC_VIEW && selectedProfile && (
          <div className="max-w-[1500px] mx-auto p-12 animate-fadeIn">
            <button onClick={() => setRoute(AppRoute.DIRECTORY)} className="group flex items-center space-x-4 text-slate-400 font-black mb-12 hover:text-[#795548] transition-all uppercase tracking-[0.3em] text-[11px]">
              <div className="w-10 h-10 bg-white shadow-md rounded-2xl flex items-center justify-center group-hover:bg-[#795548] group-hover:text-white transition-all">
                <ChevronLeft size={20} />
              </div>
              <span>BACK TO NETWORK HUB</span>
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              <div className="lg:col-span-4">
                <div className="bg-white p-16 rounded-[5rem] shadow-2xl text-center border border-slate-50">
                  <img src={selectedProfile.profileImageUrl || `https://ui-avatars.com/api/?name=${selectedProfile.fullName}&size=512&background=795548&color=fff`} className="w-72 h-72 rounded-[4.5rem] mx-auto border-[16px] border-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] object-cover mb-12" alt={selectedProfile.fullName} />
                  <h2 className="text-5xl font-black text-[#795548] mb-4 uppercase italic tracking-tighter leading-none">{selectedProfile.fullName}</h2>
                  <p className="text-[#d4af37] font-black tracking-[0.4em] uppercase text-xs mb-12 opacity-80">{selectedProfile.currentStatus}</p>
                  <div className="space-y-6 pt-10 border-t border-slate-50">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-300 uppercase tracking-widest"><span>VERIFIED ID</span> <span className="text-[#795548] bg-slate-50 px-4 py-1.5 rounded-full shadow-inner">{selectedProfile.studentId}</span></div>
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-300 uppercase tracking-widest"><span>ALUMNI LEVEL</span> <span className="text-[#d4af37] bg-[#d4af37]/5 px-4 py-1.5 rounded-full shadow-inner border border-[#d4af37]/10">{selectedProfile.role}</span></div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-8 space-y-16">
                <div className="bg-white p-20 rounded-[5rem] shadow-2xl border border-slate-50">
                  <h3 className="text-2xl font-black text-[#795548] mb-10 italic border-b border-slate-50 pb-6 uppercase tracking-widest flex items-center gap-4">
                    <div className="w-10 h-2 bg-[#d4af37] rounded-full"></div>
                    NARRATIVE
                  </h3>
                  <p className="text-4xl font-black text-[#795548] leading-tight italic uppercase tracking-tight">"{selectedProfile.bio || 'ไม่มีข้อมูลประวัติส่วนตัวในขณะนี้'}"</p>
                </div>
                <div className="bg-white p-20 rounded-[5rem] shadow-2xl border border-slate-50">
                  <h3 className="text-2xl font-black text-[#795548] mb-16 italic uppercase tracking-widest flex items-center gap-4">
                    <div className="w-10 h-2 bg-[#795548] rounded-full"></div>
                    COLLECTED MOMENTS
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
                    {selectedProfile.gallery?.length > 0 ? selectedProfile.gallery.map(img => (
                      <img key={img.id} src={img.url} className="rounded-[3rem] aspect-[4/5] object-cover shadow-2xl hover:scale-105 transition-transform duration-700 cursor-zoom-in border border-slate-50" alt="Moment" />
                    )) : (
                      <div className="col-span-full py-20 bg-slate-50 rounded-[3.5rem] border-2 border-dashed border-slate-200 text-center text-slate-400 font-black uppercase tracking-widest italic text-xs">ยังไม่มีรูปกิจกรรมที่แชร์ไว้</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- LOGIN SCREEN --- */}
        {route === AppRoute.LOGIN && (
          <div className="max-w-xl mx-auto py-24 px-6 animate-fadeIn">
            <div className="bg-white p-20 rounded-[5.5rem] shadow-[0_100px_150px_-50px_rgba(121,85,72,0.15)] border border-slate-50 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-[#795548] to-[#d4af37]"></div>
              <h2 className="text-5xl font-black text-[#795548] mb-6 uppercase text-center italic tracking-tighter leading-none">{isRegistering ? 'TLTC JOIN' : 'TLTC ACCESS'}</h2>
              <p className="text-center text-slate-400 font-bold mb-14 text-[10px] uppercase tracking-[0.4em]">Thalang Technical Alumni Network</p>
              <form onSubmit={handleAuth} className="space-y-10">
                {isRegistering && (
                  <div className="relative">
                    <input name="fullName" placeholder="Full Identity Name" className="w-full px-12 py-7 bg-slate-50 border-2 border-transparent focus:border-[#795548] rounded-[2rem] outline-none font-bold shadow-inner transition-all placeholder-slate-300" required />
                  </div>
                )}
                <input name="email" type="email" placeholder="Email Address" className="w-full px-12 py-7 bg-slate-50 border-2 border-transparent focus:border-[#795548] rounded-[2rem] outline-none font-bold shadow-inner transition-all placeholder-slate-300" required />
                <input name="password" type="password" placeholder="Password Sequence" className="w-full px-12 py-7 bg-slate-50 border-2 border-transparent focus:border-[#795548] rounded-[2rem] outline-none font-bold shadow-inner transition-all placeholder-slate-300" required />
                {isRegistering && (
                  <input name="studentId" placeholder="Identification ID" className="w-full px-12 py-7 bg-slate-50 border-2 border-transparent focus:border-[#795548] rounded-[2rem] outline-none font-bold shadow-inner transition-all placeholder-slate-300" required />
                )}
                <button type="submit" className={`w-full bg-[#795548] text-white py-8 rounded-[2.5rem] font-black shadow-2xl hover:bg-[#5d4037] transition-all text-xl tracking-[0.4em] uppercase transform active:scale-95 ${shimmerClass}`}>
                  {isRegistering ? 'CREATE ENTITY' : 'VERIFY ACCESS'}
                </button>
                <div className="text-center pt-10 border-t border-slate-50">
                  <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="text-slate-400 font-black hover:text-[#795548] transition-colors uppercase text-[11px] tracking-[0.2em] italic">
                    {isRegistering ? 'ALREADY A MEMBER? SIGN IN' : 'NEW MEMBER? CREATE PROFILE'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- EDIT PROFILE --- */}
        {route === AppRoute.EDIT_PROFILE && currentUser && (
          <div className="max-w-4xl mx-auto py-24 px-6 animate-fadeIn">
            <div className="bg-white p-20 rounded-[5.5rem] shadow-2xl border border-slate-50">
              <h2 className="text-4xl font-black text-[#795548] mb-14 italic border-b border-slate-50 pb-8 uppercase tracking-tighter">REFINING YOUR IDENTITY</h2>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const updated = {
                  ...currentUser,
                  fullName: formData.get('fullName') as string,
                  currentStatus: formData.get('status') as string,
                  bio: formData.get('bio') as string
                };
                await firebaseService.saveProfile(updated);
                setCurrentUser(updated);
                setRoute(AppRoute.PROFILE);
              }} className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em] ml-6">Full Identity</label>
                    <input name="fullName" defaultValue={currentUser.fullName} className="w-full px-10 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold focus:border-[#795548] outline-none shadow-inner" required />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em] ml-6">Current Professional Status</label>
                    <input name="status" defaultValue={currentUser.currentStatus} className="w-full px-10 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold focus:border-[#795548] outline-none shadow-inner" />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em] ml-6">Narrative Evolution (Bio)</label>
                  <textarea name="bio" defaultValue={currentUser.bio} className="w-full px-10 py-8 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] font-bold h-64 focus:border-[#795548] outline-none italic text-2xl shadow-inner leading-relaxed" />
                </div>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8 pt-10">
                  <button type="submit" className="flex-1 bg-[#795548] text-white py-7 rounded-[2rem] font-black shadow-[0_20px_40px_-10px_rgba(121,85,72,0.4)] hover:bg-[#5d4037] transition-all uppercase tracking-[0.3em] italic">CONFIRM UPDATES</button>
                  <button type="button" onClick={() => setRoute(AppRoute.PROFILE)} className="flex-1 bg-slate-100 py-7 rounded-[2rem] font-black text-slate-400 uppercase tracking-[0.3em] hover:bg-slate-200 transition-all">ABORT CHANGES</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white py-40 border-t border-slate-50 text-center relative overflow-hidden group">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-10 group-hover:rotate-[360deg] transition-transform duration-[2s] shadow-inner">
            <img src="https://img.icons8.com/fluency-systems-filled/48/795548/university.png" className="w-10 h-10" alt="Logo Footer" />
          </div>
          <h2 className="text-5xl font-black text-[#795548] italic uppercase tracking-tighter mb-4">THALANG <span className="text-[#d4af37]">TC</span></h2>
          <div className="w-16 h-1 bg-[#d4af37]/30 rounded-full mb-10"></div>
          <p className="text-slate-300 text-[11px] font-black uppercase tracking-[1.2em] mt-2">© 2024 THALANG TECHNICAL COLLEGE</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
