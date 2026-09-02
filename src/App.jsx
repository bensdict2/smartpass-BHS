import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowRight,
  LogOut,
  ShieldCheck,
  GraduationCap,
  Key,
  Printer,
  Calendar,
  Info,
  Lock,
  Trash2,
  UserPlus,
  Shield,
  Search,
  Upload,
  FileSpreadsheet,
  Plus,
  Edit2,
  ArrowUpDown,
  Filter
} from 'lucide-react';

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  doc,
  getDoc,
  getDocs 
} from 'firebase/firestore';

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
  apiKey: "AIza" + "SyB2UUnHo4iKkR9eo5W3JryYaul5g6oIfMs",
  authDomain: "smartpass-dd6b4.firebaseapp.com",
  projectId: "smartpass-dd6b4",
  storageBucket: "smartpass-dd6b4.firebasestorage.app",
  messagingSenderId: "104573991759",
  appId: "1:104573991759:web:f52b481cb6e4ec7b0ce33a",
  measurementId: "G-HWX5Q7NRGH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'smartpass-school';

const MASTER_ADMIN_EMAIL = "bmindajao@bertie.k12.nc.us";

const DESTINATIONS = {
  'restroom': { label: 'Restroom', icon: '🚽' },
  'office': { label: 'Main Office', icon: '🏢' },
  'nurse': { label: 'Nurse', icon: '🩺' },
  'water': { label: 'Water Fountain', icon: '💧' },
  'locker': { label: 'Locker', icon: '🎒' },
  'other': { label: 'Other', icon: '📍' },
};

const getDailyPeriodCode = (periodName, teacherId, targetDate = new Date()) => {
  const dateStr = `${targetDate.getFullYear()}-${targetDate.getMonth() + 1}-${targetDate.getDate()}-${teacherId}-${periodName}`;
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash % 9000) + 1000).toString();
};

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error('Auth error:', err);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm print:hidden">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setView('home')}>
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">SmartPass Hub</h1>
        </div>
        {view !== 'home' && (
          <button 
            onClick={() => setView('home')}
            className="flex items-center space-x-1 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <LogOut size={16} />
            <span>Home</span>
          </button>
        )}
      </header>

      <main className="max-w-6xl mx-auto w-full p-6 flex-1 print:p-0 print:max-w-none print:w-full">
        {view === 'home' && <HomeView setView={setView} />}
        {view === 'student' && <StudentPortalView db={db} appId={appId} />}
        {view === 'teacher-auth' && <TeacherAuthView auth={auth} db={db} appId={appId} setView={setView} />}
        {view === 'teacher-dashboard' && <TeacherDashboardView db={db} appId={appId} user={user} setView={setView} />}
      </main>
    </div>
  );
}

function HomeView({ setView }) {
  return (
    <div className="flex flex-col items-center justify-center mt-16 space-y-8 animate-in fade-in zoom-in duration-300">
      <div className="text-center space-y-2 max-w-lg">
        <h2 className="text-3xl font-extrabold text-slate-900">School Hall Pass System</h2>
        <p className="text-slate-500">Select your portal to get started.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <button 
          onClick={() => setView('student')}
          className="flex flex-col items-center justify-center p-8 bg-white border-2 border-slate-100 rounded-2xl shadow-sm hover:border-indigo-500 hover:shadow-md transition-all group"
        >
          <div className="bg-indigo-50 text-indigo-600 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
            <GraduationCap size={48} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">I am a Student</h3>
          <p className="text-sm text-slate-500 mt-2 text-center">Request a hall pass by entering your student ID.</p>
        </button>

        <button 
          onClick={() => setView('teacher-auth')}
          className="flex flex-col items-center justify-center p-8 bg-white border-2 border-slate-100 rounded-2xl shadow-sm hover:border-indigo-500 hover:shadow-md transition-all group"
        >
          <div className="bg-indigo-50 text-indigo-600 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
            <ShieldCheck size={48} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Teacher Portal</h3>
          <p className="text-sm text-slate-500 mt-2 text-center">Log in with your school Google account.</p>
        </button>
      </div>
    </div>
  );
}

function TeacherAuthView({ auth, db, appId, setView }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email?.toLowerCase();
      const isMaster = email === MASTER_ADMIN_EMAIL.toLowerCase();

      if (!isMaster) {
        const allowedRef = doc(db, 'artifacts', appId, 'public', 'data', 'allowedTeachers', email);
        const allowedSnap = await getDoc(allowedRef);
        
        if (!allowedSnap.exists()) {
          await signOut(auth);
          setError(`Access Denied: ${email} is not an authorized teacher account.`);
          setLoading(false);
          return;
        }
      }

      setView('teacher-dashboard');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in zoom-in">
      <div className="text-center mb-6">
        <div className="mx-auto bg-indigo-100 text-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <Lock size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Teacher Google Login</h2>
        <p className="text-slate-500 mt-1 text-sm">Sign in with your authorized school Google account</p>
      </div>

      <button
        onClick={handleGoogleLogin}
        type="button"
        disabled={loading}
        className="w-full py-4 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center space-x-2"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
      </button>

      {error && <p className="text-red-500 text-xs font-semibold bg-red-50 p-3 rounded-xl mt-4 text-center">{error}</p>}
    </div>
  );
}

function StudentPortalView({ db, appId }) {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [studentIdInput, setStudentIdInput] = useState('');
  const [student, setStudent] = useState(null);
  const [accessCode, setAccessCode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const [studentError, setStudentError] = useState('');
  const [destination, setDestination] = useState('');
  const [activePass, setActivePass] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const teachersRef = collection(db, 'artifacts', appId, 'public', 'data', 'teachersDirectory');
    const unsubscribe = onSnapshot(teachersRef, (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeachers(list);
    }, (err) => console.error("Error fetching teachers:", err));
    return () => unsubscribe();
  }, [db, appId]);

  const handleStudentIdSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTeacherId || !studentIdInput.trim()) return;
    setStudentError('');

    try {
      const studentRef = doc(db, 'artifacts', appId, 'users', selectedTeacherId, 'roster', studentIdInput.trim());
      const studentSnap = await getDoc(studentRef);

      if (!studentSnap.exists()) {
        setStudentError('Student ID not found in this teacher’s roster.');
        return;
      }

      setStudent(studentSnap.data());
    } catch (err) {
      console.error("Error finding student:", err);
      setStudentError('Error verifying student ID.');
    }
  };

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (!student) return;
    const periodCode = getDailyPeriodCode(student.period, selectedTeacherId);

    if (accessCode === periodCode) {
      setIsUnlocked(true);
      setCodeError(false);
    } else {
      setCodeError(true);
      setAccessCode('');
    }
  };

  const handleRequestPass = async (e) => {
    e.preventDefault();
    if (!destination || !student) return;
    setIsSubmitting(true);

    try {
      const periodCode = getDailyPeriodCode(student.period, selectedTeacherId);
      const passesRef = collection(db, 'artifacts', appId, 'users', selectedTeacherId, 'sessions', periodCode, 'passes');
      const docRef = await addDoc(passesRef, {
        studentId: student.studentId,
        studentName: student.name,
        period: student.period,
        destination: destination,
        status: 'waiting',
        timestamp: Date.now()
      });

      setActivePass({ id: docRef.id, destination, status: 'waiting' });
    } catch (err) {
      console.error("Error submitting pass:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!activePass || !selectedTeacherId || !student) return;
    const periodCode = getDailyPeriodCode(student.period, selectedTeacherId);
    const passRef = doc(db, 'artifacts', appId, 'users', selectedTeacherId, 'sessions', periodCode, 'passes', activePass.id);
    
    const unsubscribe = onSnapshot(passRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setActivePass(prev => ({ ...prev, status: data.status }));
        if (data.status === 'returned') {
          setActivePass(null);
          setDestination('');
          setIsUnlocked(false);
          setAccessCode('');
        }
      } else {
        setActivePass(null);
      }
    });

    return () => unsubscribe();
  }, [activePass?.id, selectedTeacherId, student, appId, db]);

  if (activePass) {
    const isWaiting = activePass.status === 'waiting';
    return (
      <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-center animate-in zoom-in">
        <div className={`p-8 text-white ${isWaiting ? 'bg-amber-500' : 'bg-emerald-500'}`}>
          <h2 className="text-3xl font-bold mb-2">{isWaiting ? 'Waiting for Approval' : 'Pass Approved!'}</h2>
          <p className="text-white/80 font-medium text-lg">{isWaiting ? 'Keep this screen open.' : 'You may go to your destination.'}</p>
        </div>
        <div className="p-8 space-y-4">
          <p className="text-2xl font-bold text-slate-800">{student.name}</p>
          <p className="text-slate-600 text-lg">{DESTINATIONS[activePass.destination]?.icon} {DESTINATIONS[activePass.destination]?.label}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in zoom-in">
      {!selectedTeacherId ? (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800">Select Your Teacher</h2>
            <p className="text-slate-500 text-sm mt-1">Choose your teacher to request a pass.</p>
          </div>
          <div className="space-y-2">
            {teachers.length === 0 ? (
              <p className="text-center text-slate-400 py-6 text-sm">No teachers have registered yet.</p>
            ) : (
              teachers.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTeacherId(t.id)}
                  className="w-full p-4 border border-slate-200 hover:border-indigo-500 rounded-xl text-left font-bold text-slate-800 flex justify-between items-center transition-all bg-slate-50 hover:bg-indigo-50/50"
                >
                  <span>{t.name || t.displayName || t.email || 'Teacher'}</span>
                  <ArrowRight size={18} className="text-indigo-600" />
                </button>
              ))
            )}
          </div>
        </div>
      ) : !student ? (
        <form onSubmit={handleStudentIdSubmit} className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800">Enter Student ID</h2>
            <p className="text-slate-500 text-sm mt-1">Type your school ID number.</p>
          </div>
          <div>
            <input 
              type="text" 
              value={studentIdInput} 
              onChange={e => setStudentIdInput(e.target.value)} 
              placeholder="e.g. 123456" 
              required 
              className="w-full p-4 border border-slate-300 rounded-xl text-lg font-mono outline-none focus:ring-2 focus:ring-indigo-500" 
            />
            {studentError && <p className="text-red-500 text-xs font-semibold mt-2">{studentError}</p>}
          </div>
          <div className="flex space-x-3">
            <button type="button" onClick={() => setSelectedTeacherId('')} className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm">Back</button>
            <button type="submit" className="w-2/3 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-sm">Next</button>
          </div>
        </form>
      ) : !isUnlocked ? (
        <form onSubmit={handleCodeSubmit} className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800">Welcome, {student.name}!</h2>
            <p className="text-slate-500 text-sm mt-1">Enter today's 4-digit class code for {student.period}.</p>
          </div>
          <div>
            <input 
              type="text" 
              value={accessCode} 
              onChange={e => setAccessCode(e.target.value)} 
              placeholder="••••" 
              maxLength={4} 
              className="w-full text-center text-3xl tracking-[0.5em] font-mono p-4 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
            />
            {codeError && <p className="text-red-500 text-xs font-semibold text-center mt-2">Incorrect code. Try again.</p>}
          </div>
          <button type="submit" disabled={accessCode.length < 4} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-sm">Unlock Pass</button>
        </form>
      ) : (
        <form onSubmit={handleRequestPass} className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800">Where are you going?</h2>
            <p className="text-slate-500 text-sm mt-1">{student.name} ({student.period})</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(DESTINATIONS).map(([key, dest]) => (
              <button
                key={key}
                type="button"
                onClick={() => setDestination(key)}
                className={`p-3 border rounded-xl flex items-center space-x-2 text-left font-semibold text-sm transition-all ${destination === key ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500' : 'border-slate-200 bg-white hover:border-indigo-300 text-slate-700'}`}
              >
                <span className="text-xl">{dest.icon}</span>
                <span>{dest.label}</span>
              </button>
            ))}
          </div>
          <button type="submit" disabled={!destination || isSubmitting} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-sm">
            {isSubmitting ? 'Sending...' : 'Send Request'}
          </button>
        </form>
      )}
    </div>
  );
}

function TeacherDashboardView({ db, appId, user, setView }) {
  const teacherId = user?.uid;
  const isMasterAdmin = user?.email?.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();

  const [className, setClassName] = useState('Period 1');
  const sessionCode = getDailyPeriodCode(className, teacherId);

  const [passes, setPasses] = useState([]);
  const [periodPendingCounts, setPeriodPendingCounts] = useState({});
  const [roster, setRoster] = useState([]);
  const [allowedTeachers, setAllowedTeachers] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [newIdInput, setNewIdInput] = useState('');
  const [newNameInput, setNewNameInput] = useState('');
  const [newPeriodInput, setNewPeriodInput] = useState('Period 1');
  const [rosterError, setRosterError] = useState('');

  const [bulkInput, setBulkInput] = useState('');
  const [bulkPeriodInput, setBulkPeriodInput] = useState('Period 1');
  const [bulkMessage, setBulkMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const [newAllowedEmail, setNewAllowedEmail] = useState('');
  const [bulkTeacherInput, setBulkTeacherInput] = useState('');
  const [adminMessage, setAdminMessage] = useState('');

  const [showHelp, setShowHelp] = useState(false);
  const [displayName, setDisplayName] = useState('');

  const [reportDate, setReportDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [historicalPeriod, setHistoricalPeriod] = useState('Period 1');
  const [historicalPasses, setHistoricalPasses] = useState(null);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);

  const [manualStudentId, setManualStudentId] = useState('');
  const [manualDestination, setManualDestination] = useState('');
  const [isCreatingManualPass, setIsCreatingManualPass] = useState(false);

  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPeriod, setEditPeriod] = useState('Period 1');

  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [periodFilter, setPeriodFilter] = useState('All');

  const sortedAndFilteredRoster = React.useMemo(() => {
    let items = [...roster];
    
    // 1. Filter
    if (periodFilter !== 'All') {
      items = items.filter(student => student.period === periodFilter);
    }
    
    // 2. Sort
    if (sortConfig) {
      items.sort((a, b) => {
        const aVal = (a[sortConfig.key] || '').toString().toLowerCase();
        const bVal = (b[sortConfig.key] || '').toString().toLowerCase();
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [roster, sortConfig, periodFilter]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    if (!teacherId || !db) return;
    const periods = ['Period 1', 'Period 2', 'Period 3', 'Period 4'];
    const unsubs = periods.map(p => {
      const pCode = getDailyPeriodCode(p, teacherId);
      const pRef = collection(db, 'artifacts', appId, 'users', teacherId, 'sessions', pCode, 'passes');
      return onSnapshot(pRef, snap => {
        const count = snap.docs.filter(d => d.data().status === 'waiting').length;
        setPeriodPendingCounts(prev => ({ ...prev, [p]: count }));
      }, () => {});
    });
    return () => unsubs.forEach(u => u());
  }, [teacherId, db, appId]);

  const updatePassStatus = async (id, newStatus) => {
    const passRef = doc(db, 'artifacts', appId, 'users', teacherId, 'sessions', sessionCode, 'passes', id);
    await updateDoc(passRef, { status: newStatus, updatedAt: Date.now() });
  };

  const deletePass = async (id) => {
    const passRef = doc(db, 'artifacts', appId, 'users', teacherId, 'sessions', sessionCode, 'passes', id);
    await deleteDoc(passRef);
  };

  const addStudentToRoster = async (e) => {
    e.preventDefault();
    if (!newIdInput.trim() || !newNameInput.trim()) return;
    const cleanId = newIdInput.trim();
    if (roster.some(s => s.studentId === cleanId)) {
      setRosterError(`Student ID "${cleanId}" already exists.`);
      return;
    }
    setRosterError('');
    await setDoc(doc(db, 'artifacts', appId, 'users', teacherId, 'roster', cleanId), {
      studentId: cleanId,
      name: newNameInput.trim(),
      period: newPeriodInput
    });
    setNewIdInput('');
    setNewNameInput('');
  };

  const deleteStudentFromRoster = async (studentId) => {
    await deleteDoc(doc(db, 'artifacts', appId, 'users', teacherId, 'roster', studentId));
  };

  const handleSaveEdit = async (studentId) => {
    if (!editName.trim()) return;
    try {
      const studentRef = doc(db, 'artifacts', appId, 'users', teacherId, 'roster', studentId);
      await updateDoc(studentRef, {
        name: editName.trim(),
        period: editPeriod
      });
      setEditingStudentId(null);
    } catch (err) {
      console.error("Error updating student:", err);
    }
  };

  const handleBulkImport = async (e) => {
    if (e) e.preventDefault();
    if (!bulkInput.trim()) return;

    const lines = bulkInput.split('\n');
    let addedCount = 0;
    let skippedCount = 0;

    for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        
        const parts = line.split(/[,;\t]+/).map(p => p.trim());
        if (parts.length >= 2) {
            const studentId = parts[0];
            const name = parts[1];
            
            let assignedPeriod = bulkPeriodInput;
            if (parts.length >= 3 && parts[2]) {
                const rawPeriod = parts[2];
                if (rawPeriod.toLowerCase().includes('period')) {
                    assignedPeriod = rawPeriod;
                } else {
                    assignedPeriod = `Period ${rawPeriod}`;
                }
            }

            const isDuplicate = roster.some(s => s.studentId === studentId);
            if (!isDuplicate && studentId && name) {
                const studentRef = doc(db, 'artifacts', appId, 'users', teacherId, 'roster', studentId);
                await setDoc(studentRef, {
                    studentId: studentId,
                    name: name,
                    period: assignedPeriod
                });
                addedCount++;
            } else {
                skippedCount++;
            }
        }
    }

    setBulkMessage(`Successfully imported ${addedCount} student(s). Skipped ${skippedCount} entries.`);
    setBulkInput('');
  };

  const processFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
        const text = event.target.result;
        setBulkInput(text);
        setBulkMessage(`Loaded file "${file.name}". Click "Import List" below to finish saving.`);
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleAddAllowedTeacher = async (e) => {
    e.preventDefault();
    if (!newAllowedEmail.trim()) return;
    const cleanEmail = newAllowedEmail.trim().toLowerCase();
    setAdminMessage('');

    try {
      const allowedRef = doc(db, 'artifacts', appId, 'public', 'data', 'allowedTeachers', cleanEmail);
      await setDoc(allowedRef, { email: cleanEmail, addedAt: Date.now() });
      setAdminMessage(`Successfully authorized ${cleanEmail}!`);
      setNewAllowedEmail('');
    } catch (err) {
      setAdminMessage(`Error: ${err.message}`);
    }
  };

  const handleRemoveAllowedTeacher = async (emailId) => {
    if (window.confirm(`Remove authorization for ${emailId}?`)) {
      try {
        const allowedRef = doc(db, 'artifacts', appId, 'public', 'data', 'allowedTeachers', emailId);
        await deleteDoc(allowedRef);

        const dirRef = collection(db, 'artifacts', appId, 'public', 'data', 'teachersDirectory');
        const snap = await getDocs(dirRef);
        for (const docSnap of snap.docs) {
          const data = docSnap.data();
          if (data.email?.toLowerCase() === emailId.toLowerCase()) {
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'teachersDirectory', docSnap.id));
          }
        }
      } catch (err) {
        console.error("Error removing authorized email:", err);
      }
    }
  };

  const handleBulkTeacherImport = async () => {
    if (!bulkTeacherInput.trim()) return;
    setAdminMessage('Processing...');
    const emails = bulkTeacherInput.split(/[\n,;\t]+/).map(e => e.trim().toLowerCase()).filter(e => e.includes('@'));
    
    let added = 0;
    for (const email of emails) {
      try {
        const allowedRef = doc(db, 'artifacts', appId, 'public', 'data', 'allowedTeachers', email);
        await setDoc(allowedRef, { email: email, addedAt: Date.now() });
        added++;
      } catch (err) {
        console.error("Error adding email", err);
      }
    }
    
    setAdminMessage(`Successfully authorized ${added} teacher(s)!`);
    setBulkTeacherInput('');
  };

  const handleViewHistory = async () => {
    setIsFetchingHistory(true);
    setHistoricalPasses(null);
    try {
      const [y, m, d] = reportDate.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const histCode = getDailyPeriodCode(historicalPeriod, teacherId, dateObj);
      
      const passesRef = collection(db, 'artifacts', appId, 'users', teacherId, 'sessions', histCode, 'passes');
      const snap = await getDocs(passesRef);
      
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => a.timestamp - b.timestamp);
      
      setHistoricalPasses(list);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setIsFetchingHistory(false);
    }
  };

  const handleManualPassSubmit = async (e) => {
    e.preventDefault();
    if (!manualStudentId || !manualDestination) return;
    setIsCreatingManualPass(true);
    
    const student = roster.find(s => s.studentId === manualStudentId);
    if (student) {
      try {
        const passesRef = collection(db, 'artifacts', appId, 'users', teacherId, 'sessions', sessionCode, 'passes');
        await addDoc(passesRef, {
          studentId: student.studentId,
          studentName: student.name,
          period: className,
          destination: manualDestination,
          status: 'waiting',
          timestamp: Date.now()
        });
        setManualStudentId('');
        setManualDestination('');
      } catch (err) {
        console.error("Error creating manual pass:", err);
      }
    }
    setIsCreatingManualPass(false);
  };

  const waitingPasses = passes.filter(p => p.status === 'waiting').sort((a, b) => b.timestamp - a.timestamp);
  const activePasses = passes.filter(p => p.status === 'approved').sort((a, b) => b.timestamp - a.timestamp);
  const returnedPasses = passes.filter(p => p.status === 'returned').sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  return (
    <div className="space-y-6 animate-in fade-in">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between rounded-2xl shadow-sm print:hidden">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-600 p-2 rounded-lg text-white"><ShieldCheck size={24} /></div>
            <div>
              <div className="flex items-center">
                  <input 
                      type="text" 
                      value={displayName}
                      onChange={(e) => handleDisplayNameChange(e.target.value)}
                      placeholder="Your Name (e.g. Mr. M)"
                      className="text-xl font-bold text-slate-800 bg-transparent border-b border-dashed border-slate-300 hover:border-indigo-500 focus:outline-none focus:border-indigo-500 transition-colors p-0 mr-2 w-48"
                  />
                  {isMasterAdmin && <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center"><Shield size={10} className="mr-1"/> Admin</span>}
              </div>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>
          
          <nav className="flex space-x-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
            <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Live Passes</button>
            <button onClick={() => setActiveTab('roster')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'roster' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Roster ({roster.length})</button>
            <button onClick={() => setActiveTab('reports')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'reports' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Reports</button>
            {isMasterAdmin && (
              <button onClick={() => setActiveTab('teachers')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'teachers' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Manage Teachers</button>
            )}
          </nav>
        </div>

        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <button onClick={() => setShowHelp(true)} className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center shadow-sm">
            <Info size={16} className="mr-1.5" /> Help
          </button>
          <button onClick={() => { signOut(auth); setView('home'); }} className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center">
            <LogOut size={16} className="mr-1" /> Logout
          </button>
        </div>
      </header>

      {activeTab === 'reports' ? (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-8 animate-in zoom-in">
          <div className="border-b border-slate-100 pb-6 print:hidden">
            <h2 className="text-xl font-bold text-slate-800 flex items-center"><Calendar size={20} className="mr-2 text-indigo-600"/> View & Print Past Sessions</h2>
            <p className="text-slate-500 text-sm mt-1">Select a past date and class period to pull up the full hall pass log for that session.</p>
            
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 mt-4">
              <input 
                type="date" 
                value={reportDate} 
                onChange={e => setReportDate(e.target.value)} 
                max={new Date().toISOString().split('T')[0]}
                className="p-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium w-full sm:w-auto"
              />
              <select 
                value={historicalPeriod} 
                onChange={e => setHistoricalPeriod(e.target.value)} 
                className="p-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-bold w-full sm:w-auto"
              >
                {['Period 1', 'Period 2', 'Period 3', 'Period 4'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <button 
                onClick={handleViewHistory} 
                disabled={isFetchingHistory}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white font-bold rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center"
              >
                {isFetchingHistory ? 'Loading...' : <><Search size={16} className="mr-2"/> View Report</>}
              </button>
            </div>
          </div>

          {historicalPasses && (
            <div className="print:block text-slate-900 animate-in fade-in">
               <div className="flex justify-between items-center mb-6 print:hidden">
                   <h3 className="text-lg font-bold text-slate-800">Results for {reportDate} ({historicalPeriod})</h3>
                   <button onClick={() => window.print()} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center font-bold text-sm shadow-sm transition-colors"><Printer size={16} className="mr-2"/> Print This Report</button>
               </div>

               <div className="hidden print:block text-center mb-6 border-b-2 border-slate-800 pb-4">
                 <h1 className="text-2xl font-black mb-1">SmartPass Session Report</h1>
                 <p className="text-slate-600 font-medium">Date: {reportDate} | Class: {historicalPeriod} | Teacher: {displayName || user?.email}</p>
               </div>
               
               <div className="overflow-x-auto rounded-xl border border-slate-100 print:border-none print:overflow-visible">
                 <table className="w-full text-left border-collapse min-w-[600px] print:min-w-full">
                    <thead>
                       <tr className="border-b-2 border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                          <th className="py-3 px-2">Student</th>
                          <th className="py-3 px-2">Destination</th>
                          <th className="py-3 px-2">Status</th>
                          <th className="py-3 px-2">Time Out</th>
                          <th className="py-3 px-2">Time Returned</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                     {historicalPasses.length === 0 ? (
                        <tr><td colSpan="5" className="py-8 text-center text-slate-400 italic bg-slate-50 rounded-lg">No passes recorded for this session.</td></tr>
                     ) : (
                        historicalPasses.map(p => (
                           <tr key={p.id} className="hover:bg-slate-50">
                              <td className="py-3 px-2 font-bold">{p.studentName} <span className="block text-xs text-slate-400 font-mono font-normal">{p.studentId}</span></td>
                              <td className="py-3 px-2">{DESTINATIONS[p.destination]?.label || p.destination}</td>
                              <td className="py-3 px-2 capitalize font-semibold">{p.status}</td>
                              <td className="py-3 px-2">{new Date(p.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                              <td className="py-3 px-2">{p.updatedAt && p.status === 'returned' ? new Date(p.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}</td>
                           </tr>
                        ))
                     )}
                  </tbody>
                 </table>
               </div>
            </div>
          )}
        </div>

      ) : activeTab === 'teachers' && isMasterAdmin ? (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-8 animate-in zoom-in print:hidden">
          <div className="border-b border-slate-100 pb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center"><UserPlus size={20} className="mr-2 text-indigo-600"/> Authorize Teacher Email</h2>
            <p className="text-slate-500 text-sm mt-1">Add a teacher's school email address here. When they log in with Google using that email, they will instantly access their teacher dashboard.</p>
            
            <form onSubmit={handleAddAllowedTeacher} className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 max-w-xl">
              <input type="email" value={newAllowedEmail} onChange={e => setNewAllowedEmail(e.target.value)} placeholder="teacher@school.edu" required className="flex-1 p-2.5 border border-slate-300 rounded-xl text-sm" />
              <button type="submit" className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-sm whitespace-nowrap">Authorize Email</button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100">
               <h3 className="text-sm font-bold text-slate-700 mb-2">Or Bulk Add Teachers (Paste a list)</h3>
               <textarea 
                  value={bulkTeacherInput} 
                  onChange={e => setBulkTeacherInput(e.target.value)}
                  placeholder="Paste teacher emails here, separated by commas or on new lines...&#10;teacher1@bertie.k12.nc.us&#10;teacher2@bertie.k12.nc.us"
                  rows={3}
                  className="w-full max-w-xl p-3 border border-slate-300 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500"
               ></textarea>
               <br />
               <button onClick={handleBulkTeacherImport} className="mt-2 py-2 px-6 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-sm shadow-sm">Bulk Authorize</button>
            </div>
            {adminMessage && <p className="text-xs font-bold text-emerald-600 mt-3">{adminMessage}</p>}
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-4">Authorized Teacher Emails ({allowedTeachers.length})</h2>
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold text-slate-400 uppercase bg-slate-50">
                    <th className="py-3 px-4">School Email</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {allowedTeachers.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-800">{t.email}</td>
                      <td className="py-3 px-4 text-right">
                        {t.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase() ? (
                          <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg">Master Admin</span>
                        ) : (
                          <button onClick={() => handleRemoveAllowedTeacher(t.id)} className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg">Revoke Access</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      ) : activeTab === 'roster' ? (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6 print:hidden">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Manage Student Roster</h2>
            <p className="text-slate-500 text-sm mt-1">Add students individually, copy & paste lists, or drag and drop a CSV file below.</p>
          </div>
          
          <form onSubmit={addStudentToRoster} className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Add Single Student</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Student ID</label>
                <input type="text" value={newIdInput} onChange={e => setNewIdInput(e.target.value)} placeholder="123456" required className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-mono" />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                <input type="text" value={newNameInput} onChange={e => setNewNameInput(e.target.value)} placeholder="Jane Doe" required className="w-full p-2.5 border border-slate-300 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Period</label>
                <select value={newPeriodInput} onChange={e => setNewPeriodInput(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-xl text-sm bg-white">
                  {['Period 1', 'Period 2', 'Period 3', 'Period 4'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-sm">Add Student</button>
              </div>
            </div>
            {rosterError && <p className="text-red-500 text-xs font-semibold">{rosterError}</p>}
          </form>

          <form onSubmit={handleBulkImport} className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center"><Upload size={14} className="mr-1.5 text-indigo-600"/> Bulk Import (CSV / Paste)</h3>
              <div className="flex items-center space-x-3 text-xs">
                <span className="text-slate-500">Default period (if missing):</span>
                <select value={bulkPeriodInput} onChange={e => setBulkPeriodInput(e.target.value)} className="p-1.5 border border-slate-300 rounded-lg bg-white font-bold outline-none">
                  {['Period 1', 'Period 2', 'Period 3', 'Period 4'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${isDragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-300 bg-white hover:border-indigo-400'}`}
            >
                <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="bg-indigo-50 text-indigo-600 p-3 rounded-full">
                        <FileSpreadsheet size={24} />
                    </div>
                    <p className="text-xs font-bold text-slate-700">Drag & drop your CSV file here, or <label className="text-indigo-600 hover:underline cursor-pointer">browse <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" /></label></p>
                    <p className="text-[11px] text-slate-400">Supports .csv (Format: Student ID, Student Name, [Period])</p>
                </div>
            </div>

            <div>
              <textarea 
                  value={bulkInput} 
                  onChange={e => setBulkInput(e.target.value)} 
                  placeholder="Or paste student list here...&#10;1001, John Smith, Period 1&#10;1002, Sarah Connor, Period 2" 
                  rows={3}
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              ></textarea>
            </div>

            <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-600">{bulkMessage}</span>
                <button type="submit" className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs shadow-sm transition-colors">Import List</button>
            </div>
          </form>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-2 mt-8">
            <h3 className="text-lg font-bold text-slate-800">Current Roster Directory</h3>
            <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
              <Filter size={16} className="text-slate-500 ml-1" />
              <select 
                value={periodFilter} 
                onChange={e => setPeriodFilter(e.target.value)}
                className="p-1 border-none bg-transparent text-sm font-bold text-slate-700 outline-none focus:ring-0 cursor-pointer"
              >
                <option value="All">All Periods</option>
                {['Period 1', 'Period 2', 'Period 3', 'Period 4'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase bg-slate-50">
                  <th className="py-3 px-4 cursor-pointer hover:bg-slate-200 transition-colors group" onClick={() => requestSort('studentId')}>
                    <div className="flex items-center">Student ID <ArrowUpDown size={14} className="ml-1 opacity-40 group-hover:opacity-100"/></div>
                  </th>
                  <th className="py-3 px-4 cursor-pointer hover:bg-slate-200 transition-colors group" onClick={() => requestSort('name')}>
                    <div className="flex items-center">Name <ArrowUpDown size={14} className="ml-1 opacity-40 group-hover:opacity-100"/></div>
                  </th>
                  <th className="py-3 px-4 cursor-pointer hover:bg-slate-200 transition-colors group" onClick={() => requestSort('period')}>
                    <div className="flex items-center">Period <ArrowUpDown size={14} className="ml-1 opacity-40 group-hover:opacity-100"/></div>
                  </th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {sortedAndFilteredRoster.map(student => (
                  editingStudentId === student.studentId ? (
                    <tr key={student.studentId} className="bg-indigo-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">{student.studentId}</td>
                      <td className="py-3 px-4">
                        <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full p-1.5 border border-slate-300 rounded text-sm bg-white outline-none focus:border-indigo-500" />
                      </td>
                      <td className="py-3 px-4">
                        <select value={editPeriod} onChange={e => setEditPeriod(e.target.value)} className="p-1.5 border border-slate-300 rounded text-sm bg-white outline-none focus:border-indigo-500">
                          {['Period 1', 'Period 2', 'Period 3', 'Period 4'].map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button onClick={() => handleSaveEdit(student.studentId)} className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg mr-1" title="Save Changes"><CheckCircle2 size={18} /></button>
                        <button onClick={() => setEditingStudentId(null)} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-lg" title="Cancel"><XCircle size={18} /></button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={student.studentId} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">{student.studentId}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{student.name}</td>
                      <td className="py-3 px-4"><span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold">{student.period}</span></td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button onClick={() => { setEditingStudentId(student.studentId); setEditName(student.name); setEditPeriod(student.period); }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg mr-1" title="Edit Student"><Edit2 size={16} /></button>
                        <button onClick={() => deleteStudentFromRoster(student.studentId)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Delete Student"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        </div>

      ) : (
        <div className="space-y-6 print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-indigo-600 text-white rounded-2xl p-6 flex flex-col justify-between shadow-sm">
              <div>
                <h2 className="text-lg font-bold flex items-center"><Key className="mr-2" size={18} /> Daily Session Code</h2>
                <p className="text-indigo-200 text-xs">{className}</p>
              </div>
              <div className="text-4xl font-mono font-bold tracking-widest bg-white/20 px-4 py-2 rounded-xl mt-4 inline-block">
                {sessionCode}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm md:col-span-2 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Select Class Period</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {['Period 1', 'Period 2', 'Period 3', 'Period 4'].map((p) => {
                    const count = periodPendingCounts[p] || 0;
                    return (
                      <button
                        key={p}
                        onClick={() => setClassName(p)}
                        className={`relative py-3 px-3 rounded-xl text-xs font-bold transition-all ${className === p ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                      >
                        {p}
                        {count > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-extrabold shadow-sm">{count}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* MANUAL PASS TOOL */}
          <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 shadow-inner flex flex-col sm:flex-row items-center gap-4 print:hidden">
            <div className="flex items-center text-slate-700 font-bold whitespace-nowrap">
              <Plus size={18} className="mr-1.5 text-indigo-600" /> Manual Pass
            </div>
            <form onSubmit={handleManualPassSubmit} className="flex-1 flex flex-col sm:flex-row gap-3 w-full">
              <select 
                value={manualStudentId} 
                onChange={e => setManualStudentId(e.target.value)} 
                className="flex-1 p-2.5 border border-slate-300 rounded-xl text-sm bg-white font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">-- Select Student --</option>
                {roster
                  .filter(s => s.period === className)
                  .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                  .map(s => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.name}
                    </option>
                  ))
                }
              </select>
              <select 
                value={manualDestination} 
                onChange={e => setManualDestination(e.target.value)} 
                className="flex-1 p-2.5 border border-slate-300 rounded-xl text-sm bg-white font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">-- Select Destination --</option>
            {Object.entries(DESTINATIONS).map(([key, dest]) => (
              <option key={key} value={key}>{dest.icon} {dest.label}</option>
            ))}
          </select>
          <button 
            type="submit" 
            disabled={isCreatingManualPass || !manualStudentId || !manualDestination}
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-sm shadow-sm transition-colors whitespace-nowrap"
          >
            {isCreatingManualPass ? 'Adding...' : 'Add to Pending'}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[45vh] lg:h-[60vh]">
              <div className="bg-amber-500 p-4 flex justify-between items-center text-white shrink-0">
                <h2 className="text-lg font-bold flex items-center"><Clock size={18} className="mr-2" /> Pending Requests</h2>
                <span className="bg-amber-600 px-2.5 py-0.5 rounded-full text-xs font-bold">{waitingPasses.length}</span>
              </div>
              <div className="p-4 flex-1 overflow-y-auto bg-slate-50/50 space-y-3">
                {waitingPasses.map((pass) => (
                  <div key={pass.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800">{pass.studentName}</h3>
                      <p className="text-slate-400 text-xs font-mono">ID: {pass.studentId}</p>
                      <p className="text-slate-600 text-xs mt-0.5">{DESTINATIONS[pass.destination]?.icon} {DESTINATIONS[pass.destination]?.label}</p>
                    </div>
                    <div className="flex space-x-1.5">
                      <button onClick={() => deletePass(pass.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"><XCircle size={20} /></button>
                      <button onClick={() => updatePassStatus(pass.id, 'approved')} className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg"><CheckCircle2 size={20} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[45vh] lg:h-[60vh]">
              <div className="bg-emerald-500 p-4 flex justify-between items-center text-white shrink-0">
                <h2 className="text-lg font-bold flex items-center"><ArrowRight size={18} className="mr-2" /> Currently Out</h2>
                <span className="bg-emerald-600 px-2.5 py-0.5 rounded-full text-xs font-bold">{activePasses.length}</span>
              </div>
              <div className="p-4 flex-1 overflow-y-auto bg-slate-50/50 space-y-3">
                {activePasses.map((pass) => (
                  <div key={pass.id} className="bg-white p-4 rounded-xl border-l-4 border-l-emerald-500 border border-emerald-100 shadow-sm flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800">{pass.studentName}</h3>
                      <p className="text-slate-400 text-xs font-mono">ID: {pass.studentId}</p>
                      <p className="text-slate-600 text-xs mt-0.5">{DESTINATIONS[pass.destination]?.icon} {DESTINATIONS[pass.destination]?.label}</p>
                    </div>
                    <button onClick={() => updatePassStatus(pass.id, 'returned')} className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">Mark Returned</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[45vh] lg:h-[60vh]">
              <div className="bg-slate-600 p-4 flex justify-between items-center text-white shrink-0">
                <h2 className="text-lg font-bold flex items-center"><Calendar size={18} className="mr-2" /> Session History</h2>
                <span className="bg-slate-700 px-2.5 py-0.5 rounded-full text-xs font-bold">{returnedPasses.length}</span>
              </div>
              <div className="p-4 flex-1 overflow-y-auto bg-slate-50/50 space-y-3">
                {returnedPasses.map((pass) => (
                  <div key={pass.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between opacity-75">
                    <div>
                      <h3 className="font-bold text-slate-700 line-through">{pass.studentName}</h3>
                      <p className="text-slate-400 text-xs font-mono">ID: {pass.studentId}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{DESTINATIONS[pass.destination]?.icon} {DESTINATIONS[pass.destination]?.label}</p>
                    </div>
                    <button onClick={() => deletePass(pass.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showHelp && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-xl relative">
            <button type="button" onClick={() => setShowHelp(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><XCircle size={24} /></button>
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center"><Info size={28} className="text-indigo-600 mr-2" /> About SmartPass Hub</h2>
            <div className="space-y-4 text-slate-600 mb-6 text-sm">
              <p>Master Admin Email is configured to: <strong>{MASTER_ADMIN_EMAIL}</strong></p>
            </div>
            <button type="button" onClick={() => setShowHelp(false)} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}