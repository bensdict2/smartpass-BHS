import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  MapPin, 
  ArrowRight,
  LogOut,
  ShieldCheck,
  GraduationCap,
  Key,
  Users,
  FileSpreadsheet,
  Upload,
  Printer,
  Calendar,
  Info,
  BookOpen,
  Code,
  Mail,
  Lock,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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

const firebaseConfig = {
  apiKey: "AIzaSyB2UUnHo4iKkR9" + "eo5W3JryYaul5g6oIfMs",
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
const appId = 'smartpass-school';

const DESTINATIONS = {
  'restroom': { label: 'Restroom', icon: '🚽' },
  'office': { label: 'Main Office', icon: '🏢' },
  'nurse': { label: 'Nurse', icon: '🩺' },
  'water': { label: 'Water Fountain', icon: '💧' },
  'locker': { label: 'Locker', icon: '🎒' },
  'other': { label: 'Other', icon: '📍' },
};

const getDailyPeriodCode = (periodName, teacherId) => {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}-${teacherId}-${periodName}`;
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
        await signInAnonymously(auth);
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f8fafc' }}>
        <h2 style={{ color: '#1e293b', fontSize: '24px', marginBottom: '8px' }}>Loading SmartPass...</h2>
        <p style={{ color: '#64748b' }}>Connecting to secure database.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
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

      <main className="max-w-6xl mx-auto w-full p-6 flex-1">
        {view === 'home' && <HomeView setView={setView} />}
        {view === 'student' && <StudentPortalView db={db} appId={appId} />}
        {view === 'teacher-auth' && <TeacherAuthView auth={auth} setView={setView} />}
        {view === 'teacher-dashboard' && <TeacherDashboardView db={db} appId={appId} user={user} setView={setView} />}
      </main>
    </div>
  );
}

function HomeView({ setView }) {
  return (
    <div className="flex flex-col items-center justify-center mt-16 space-y-8">
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
          <p className="text-sm text-slate-500 mt-2 text-center">Log in to manage your classes, rosters, and passes.</p>
        </button>
      </div>
    </div>
  );
}

function TeacherAuthView({ auth, setView }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setView('teacher-dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <div className="text-center mb-6">
        <div className="mx-auto bg-indigo-100 text-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <Lock size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">{isRegister ? 'Teacher Registration' : 'Teacher Login'}</h2>
        <p className="text-slate-500 mt-1 text-sm">{isRegister ? 'Create your teacher account' : 'Log in to access your dashboard'}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Teacher Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="teacher@school.edu" 
            required 
            className="w-full p-3 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" 
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="••••••••" 
            required 
            className="w-full p-3 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" 
          />
        </div>

        {error && <p className="text-red-500 text-xs font-semibold bg-red-50 p-3 rounded-xl">{error}</p>}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors shadow-sm"
        >
          {loading ? 'Processing...' : (isRegister ? 'Register Account' : 'Login to Dashboard')}
        </button>
      </form>

      <div className="text-center mt-6">
        <button 
          type="button"
          onClick={() => setIsRegister(!isRegister)} 
          className="text-xs text-indigo-600 hover:underline font-bold"
        >
          {isRegister ? 'Already have an account? Login here' : "Don't have an account? Register here"}
        </button>
      </div>
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
    const fetchTeachers = async () => {
      try {
        const teachersRef = collection(db, 'artifacts', appId, 'public', 'data', 'teachersDirectory');
        const snap = await getDocs(teachersRef);
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTeachers(list);
      } catch (err) {
        console.error("Error fetching teachers:", err);
      }
    };
    fetchTeachers();
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
      <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-center">
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
    <div className="max-w-md mx-auto mt-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      {!selectedTeacherId ? (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800">Select Your Teacher</h2>
            <p className="text-slate-500 text-sm mt-1">Choose your teacher to request a pass.</p>
          </div>
          <div className="space-y-2">
            {teachers.length === 0 ? (
              <p className="text-center text-slate-400 py-6 text-sm">No teachers have registered yet. Ask your teacher to set up their account.</p>
            ) : (
              teachers.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTeacherId(t.id)}
                  className="w-full p-4 border border-slate-200 hover:border-indigo-500 rounded-xl text-left font-bold text-slate-800 flex justify-between items-center transition-all bg-slate-50 hover:bg-indigo-50/50"
                >
                  <span>{t.displayName || t.email || 'Teacher'}</span>
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
  const [className, setClassName] = useState('Period 1');
  const sessionCode = getDailyPeriodCode(className, teacherId);

  const [passes, setPasses] = useState([]);
  const [periodPendingCounts, setPeriodPendingCounts] = useState({});
  const [roster, setRoster] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [newIdInput, setNewIdInput] = useState('');
  const [newNameInput, setNewNameInput] = useState('');
  const [newPeriodInput, setNewPeriodInput] = useState('Period 1');
  const [rosterError, setRosterError] = useState('');
  
  const [bulkInput, setBulkInput] = useState('');
  const [bulkPeriodInput, setBulkPeriodInput] = useState('Period 1');
  const [bulkMessage, setBulkMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const [showHelp, setShowHelp] = useState(false);

  const [reportDate, setReportDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [historicalPasses, setHistoricalPasses] = useState([]);
  const [historicalClassName, setHistoricalClassName] = useState('Period 1');
  const [isPrintingHistorical, setIsPrintingHistorical] = useState(false);
  const [displayName, setDisplayName] = useState('');

  // Fetch teacher's display name
  useEffect(() => {
    if (!teacherId || !db) return;
    const fetchInitialName = async () => {
      const dirRef = doc(db, 'artifacts', appId, 'public', 'data', 'teachersDirectory', teacherId);
      const snap = await getDoc(dirRef);
      if (snap.exists() && snap.data().displayName) {
          setDisplayName(snap.data().displayName);
      } else if (user?.email) {
          setDisplayName(user.email.split('@')[0]);
      }
    };
    fetchInitialName();
  }, [teacherId, db, appId, user]);

  // Register teacher in public directory
  useEffect(() => {
    if (!teacherId || !db || !displayName) return;
    const registerTeacherDir = async () => {
      const dirRef = doc(db, 'artifacts', appId, 'public', 'data', 'teachersDirectory', teacherId);
      await setDoc(dirRef, { 
          email: user.email || 'Teacher', 
          displayName: displayName,
          updatedAt: Date.now() 
      }, { merge: true });
    };
    
    const timeoutId = setTimeout(registerTeacherDir, 1000);
    return () => clearTimeout(timeoutId);
  }, [teacherId, db, appId, user, displayName]);

  // Fetch all registered teachers for management
  useEffect(() => {
    if (!db) return;
    const teachersRef = collection(db, 'artifacts', appId, 'public', 'data', 'teachersDirectory');
    const unsubscribe = onSnapshot(teachersRef, (snapshot) => {
      setAllTeachers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [db, appId]);

  // Fetch roster
  useEffect(() => {
    if (!teacherId || !db) return;
    const rosterRef = collection(db, 'artifacts', appId, 'users', teacherId, 'roster');
    const unsubscribe = onSnapshot(rosterRef, (snapshot) => {
      setRoster(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [teacherId, db, appId]);

  useEffect(() => {
    if (!teacherId || !db || !sessionCode) return;
    const passesRef = collection(db, 'artifacts', appId, 'users', teacherId, 'sessions', sessionCode, 'passes');
    const unsubscribe = onSnapshot(passesRef, (snapshot) => {
      setPasses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [teacherId, db, appId, sessionCode]);

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

  const handleDeleteTeacher = async (tId) => {
    if (confirm("Are you sure you want to remove this teacher from the school hub?")) {
      try {
        const dirRef = doc(db, 'artifacts', appId, 'public', 'data', 'teachersDirectory', tId);
        await deleteDoc(dirRef);
      } catch (err) {
        console.error("Error deleting teacher:", err);
      }
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
          await setDoc(doc(db, 'artifacts', appId, 'users', teacherId, 'roster', studentId), {
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

    setBulkMessage(`Successfully imported ${addedCount} student(s). Skipped ${skippedCount} duplicate/invalid entries.`);
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
    if (file) {
      processFile(file);
    }
  };

  const handlePrintHistoricalReport = async () => {
    if (!db || !teacherId) return;
    setIsPrintingHistorical(true);
    
    const [y, m, d] = reportDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dateStr = `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}-${dateObj.getDate()}-${teacherId}-${historicalClassName}`;
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
      hash |= 0;
    }
    const historicalSessionCode = (Math.abs(hash % 9000) + 1000).toString();

    try {
      const passesRef = collection(db, 'artifacts', appId, 'users', teacherId, 'sessions', historicalSessionCode, 'passes');
      const snapshot = await getDocs(passesRef);
      const passesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistoricalPasses(passesList);
      
      setTimeout(() => {
        window.print();
        setIsPrintingHistorical(false);
      }, 300);
    } catch (err) {
      console.error("Error fetching historical report:", err);
      setIsPrintingHistorical(false);
    }
  };

  const waitingPasses = passes.filter(p => p.status === 'waiting').sort((a, b) => b.timestamp - a.timestamp);
  const activePasses = passes.filter(p => p.status === 'approved').sort((a, b) => b.timestamp - a.timestamp);
  const returnedPasses = passes.filter(p => p.status === 'returned').sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6 animate-in fade-in">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-2xl shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="bg-indigo-600 p-2 rounded-lg text-white"><ShieldCheck size={24} /></div>
          <div>
            <div className="flex items-center">
                <input 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your Name (e.g. Mr. Smith)"
                    className="text-xl font-bold text-slate-800 bg-transparent border-b border-dashed border-slate-300 hover:border-indigo-500 focus:outline-none focus:border-indigo-500 transition-colors p-0 mr-2 w-48"
                    title="Edit how your name appears to students"
                />
                <span className="text-slate-400 text-xs cursor-help" title="Students will see this name">✏️</span>
            </div>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
          <nav className="hidden md:flex space-x-1 bg-slate-100 p-1 rounded-xl ml-4">
            <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Live Passes</button>
            <button onClick={() => setActiveTab('roster')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'roster' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Student Roster ({roster.length})</button>
            <button onClick={() => setActiveTab('teachers')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'teachers' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Manage Teachers ({allTeachers.length})</button>
          </nav>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => setShowHelp(true)} className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center shadow-sm">
            <Info size={16} className="mr-1.5" /> Help & About
          </button>
          <button onClick={() => window.print()} className="hidden sm:flex text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-sm font-bold items-center shadow-sm">
            <Printer size={16} className="mr-1.5" /> Print Report
          </button>
          <button onClick={() => { signOut(auth); setView('home'); }} className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center">
            <LogOut size={16} className="mr-1" /> Logout
          </button>
        </div>
      </header>

      {activeTab === 'teachers' ? (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Manage Registered Teachers</h2>
            <p className="text-slate-500 text-sm mt-1">Teachers listed here will appear in the student portal dropdown. You can remove any teacher instantly.</p>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-400 uppercase">
                <th className="py-3 px-4">Display Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {allTeachers.map(t => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-800">{t.displayName || 'Unnamed'}</td>
                  <td className="py-3 px-4 text-slate-600">{t.email}</td>
                  <td className="py-3 px-4 text-right">
                    {t.id === teacherId ? (
                      <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg">Current User</span>
                    ) : (
                      <button onClick={() => handleDeleteTeacher(t.id)} className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg">Remove Teacher</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'roster' ? (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6 print:hidden">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Manage Student Roster & ID Numbers</h2>
            <p className="text-slate-500 text-sm mt-1">Add student IDs individually, paste lists, or drag and drop a CSV file below.</p>
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
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
                <Upload size={14} className="mr-1.5 text-indigo-600" /> Bulk Import / Drag & Drop CSV
              </h3>
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <span className="text-xs text-slate-500">Default period if CSV lacks it:</span>
                <select value={bulkPeriodInput} onChange={e => setBulkPeriodInput(e.target.value)} className="p-1.5 border border-slate-300 rounded-lg text-xs outline-none bg-white font-bold">
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
                <p className="text-xs font-bold text-slate-700">Drag & drop your CSV file here, or <label className="text-indigo-600 hover:underline cursor-pointer">browse <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" /></label></p>
                <p className="text-[11px] text-slate-400">Supports .csv files (Format: Student ID, Student Name, [Period])</p>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">Or paste student list below:</label>
              <textarea 
                value={bulkInput} 
                onChange={e => setBulkInput(e.target.value)} 
                placeholder="1001, John Smith, Period 1&#10;1002, Sarah Connor, Period 2&#10;1003, Michael Jordan" 
                rows={3}
                className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              ></textarea>
            </div>
            <div className="flex justify-between items-center">
              {bulkMessage ? <span className="text-xs font-bold text-emerald-600">{bulkMessage}</span> : <span></span>}
              <button type="submit" disabled={!bulkInput.trim()} className="px-6 py-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs transition-colors shadow-sm">Import List</button>
            </div>
          </form>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-400 uppercase">
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {roster.map(student => (
                <tr key={student.studentId} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600">{student.studentId}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{student.name}</td>
                  <td className="py-3 px-4"><span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold">{student.period}</span></td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => deleteStudentFromRoster(student.studentId)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                <div className="grid grid-cols-4 gap-2">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[60vh]">
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

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[60vh]">
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

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[60vh]">
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

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="flex items-center space-x-3">
                <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl">
                    <Calendar size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-800">Print Past Date Report</h3>
                    <p className="text-xs text-slate-500">Select any previous date and period to generate and print records.</p>
                </div>
            </div>
            <div className="flex items-center space-x-3 w-full sm:w-auto">
                <input 
                    type="date" 
                    value={reportDate} 
                    onChange={e => setReportDate(e.target.value)} 
                    className="p-2 border border-slate-300 rounded-xl text-xs outline-none bg-white font-medium"
                />
                <select 
                    value={historicalClassName} 
                    onChange={e => setHistoricalClassName(e.target.value)} 
                    className="p-2 border border-slate-300 rounded-xl text-xs outline-none bg-white font-bold"
                >
                    {['Period 1', 'Period 2', 'Period 3', 'Period 4'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <button 
                    onClick={handlePrintHistoricalReport} 
                    disabled={isPrintingHistorical}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs transition-colors shadow-sm whitespace-nowrap flex items-center"
                >
                    <Printer size={14} className="mr-1.5" /> {isPrintingHistorical ? 'Loading...' : 'Print Past Report'}
                </button>
            </div>
          </div>
        </div>
      )}

      <div className="hidden print:block font-sans text-black">
          <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
              <h1 className="text-2xl font-black tracking-tight">SmartPass Daily Activity Report</h1>
              <p className="text-sm font-bold mt-1">
                  Class Session: {isPrintingHistorical ? historicalClassName : className} | Date: {isPrintingHistorical ? reportDate : new Date().toLocaleDateString()}
              </p>
          </div>

          <table className="w-full text-left border-collapse text-xs">
              <thead>
                  <tr className="border-b-2 border-slate-800 uppercase">
                      <th className="py-2 px-2">Student Name</th>
                      <th className="py-2 px-2">Student ID</th>
                      <th className="py-2 px-2">Destination</th>
                      <th className="py-2 px-2">Status</th>
                      <th className="py-2 px-2">Requested At</th>
                      <th className="py-2 px-2">Returned At</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                  {((isPrintingHistorical ? historicalPasses : passes).length === 0) ? (
                      <tr><td colSpan="6" className="py-6 text-center text-slate-500">No pass activity recorded for this session.</td></tr>
                  ) : (
                      (isPrintingHistorical ? historicalPasses : passes).map(pass => (
                          <tr key={pass.id}>
                              <td className="py-2 px-2 font-bold">{pass.studentName}</td>
                              <td className="py-2 px-2 font-mono">{pass.studentId || 'N/A'}</td>
                              <td className="py-2 px-2">{DESTINATIONS[pass.destination]?.label || pass.destination}</td>
                              <td className="py-2 px-2 capitalize font-semibold">{pass.status}</td>
                              <td className="py-2 px-2">{new Date(pass.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                              <td className="py-2 px-2">{pass.updatedAt && pass.status === 'returned' ? new Date(pass.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}</td>
                          </tr>
                      ))
                  )}
              </tbody>
          </table>
      </div>

      {showHelp && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-xl relative">
            <button type="button" onClick={() => setShowHelp(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><XCircle size={24} /></button>
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center"><Info size={28} className="text-indigo-600 mr-2" /> About SmartPass Hub</h2>
            <div className="space-y-4 text-slate-600 mb-6 text-sm">
              <p>Multiple teachers can log in with their own accounts to manage their independent rosters and passes on a single URL.</p>
              <p>Developed by <strong>Mr. M</strong> | Contact: <a href="mailto:ben@bymindajao.net" className="text-indigo-600 underline">ben@bymindajao.net</a></p>
            </div>
            <button type="button" onClick={() => setShowHelp(false)} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}