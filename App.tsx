import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ChevronRight, Eye,
  FileText, HeartHandshake, Home as HomeIcon, Lock, LogIn, LogOut,
  Mail, MessageSquareWarning, Phone, Pill, Shield, Siren, User,
  UserPlus, Video, AlertTriangle
} from "lucide-react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";

const LOGO = "/media/vigil-logo.jpeg";
const RAGGING_VIDEO = "/media/anti-ragging.mp4";
const DRUG_VIDEO = "/media/anti-drug.mp4";

type UserData = {
  name: string;
  email: string;
  vigilId: string;
};

function makeVigilId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = (n: number) =>
    Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `VIG-${part(4)}-${part(4)}`;
}

function getUser(): UserData | null {
  const raw = localStorage.getItem("vigilUser");
  if (!raw) return null;
  try { return JSON.parse(raw) as UserData; } catch { return null; }
}

function setUser(user: UserData) {
  localStorage.setItem("vigilUser", JSON.stringify(user));
  localStorage.setItem("vigilLoggedIn", "true");
}

function isLoggedIn() {
  return localStorage.getItem("vigilLoggedIn") === "true";
}

function logout() {
  localStorage.removeItem("vigilLoggedIn");
}

function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/id-created" element={<IdCreated />} />
        <Route path="/" element={<Protected><Home /></Protected>} />
        <Route path="/awareness" element={<Protected><Awareness /></Protected>} />
        <Route path="/awareness/ragging/:page" element={<Protected><AwarenessTopic type="ragging" /></Protected>} />
        <Route path="/awareness/drugs/:page" element={<Protected><AwarenessTopic type="drugs" /></Protected>} />
        <Route path="/situation" element={<Protected><Situation /></Protected>} />
        <Route path="/report" element={<Protected><Report /></Protected>} />
        <Route path="/emergency" element={<Protected><Emergency /></Protected>} />
        <Route path="/support" element={<Protected><Support /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
        <Route path="*" element={<Navigate to={isLoggedIn() ? "/" : "/login"} replace />} />
      </Routes>
    </div>
  );
}

function Protected({ children }: { children: React.ReactNode }) {
  return isLoggedIn() ? <>{children}</> : <Navigate to="/login" replace />;
}

function Header({ title, back = false }: { title: string; back?: boolean }) {
  const navigate = useNavigate();
  return (
    <header className="topbar">
      <div className="topbar-inner">
        {back ? (
          <button className="icon-btn" onClick={() => navigate(-1)} aria-label="Back"><ArrowLeft /></button>
        ) : <img src={LOGO} className="mini-logo" alt="VIGIL" />}
        <div className="topbar-title">{title}</div>
        <div className="topbar-spacer" />
      </div>
    </header>
  );
}

function BottomNav() {
  const location = useLocation();
  const items = [
    { to: "/", label: "Home", icon: HomeIcon },
    { to: "/support", label: "Support", icon: HeartHandshake },
    { to: "/profile", label: "Profile", icon: User },
  ];
  return (
    <nav className="bottom-nav">
      {items.map(({ to, label, icon: Icon }) => (
        <Link key={to} to={to} className={location.pathname === to ? "nav-item active" : "nav-item"}>
          <Icon />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}

function Layout({ children, title, back = false }: { children: React.ReactNode; title: string; back?: boolean }) {
  return (
    <div className="page">
      <Header title={title} back={back} />
      <main className="content">{children}</main>
      <BottomNav />
    </div>
  );
}

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoggedIn()) navigate("/", { replace: true });
  }, [navigate]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const user = getUser();
    if (!user) {
      setError("No VIGIL account found. Please create an account first.");
      return;
    }
    if (email.trim().toLowerCase() !== user.email.toLowerCase()) {
      setError("Email does not match the saved VIGIL account.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }
    localStorage.setItem("vigilLoggedIn", "true");
    navigate("/");
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img src={LOGO} className="auth-logo" alt="VIGIL logo" />
        <p className="eyebrow">VIGIL</p>
        <h1>Welcome back</h1>
        <p className="muted">Speak up. Stay safe. Your student safety companion.</p>
        <form onSubmit={submit} className="form">
          <label>Email Address</label>
          <div className="input-wrap"><Mail /><input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Enter your email" required /></div>
          <label>Password</label>
          <div className="input-wrap"><Lock /><input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Enter your password" required /></div>
          {error && <div className="error-box">{error}</div>}
          <button className="primary-btn" type="submit"><LogIn /> Login</button>
        </form>
        <p className="switch-text">New to VIGIL? <Link to="/signup">Create an account</Link></p>
      </div>
    </div>
  );
}

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !password || !confirm) return setError("Please complete all fields.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    const user: UserData = { name: name.trim(), email: email.trim(), vigilId: makeVigilId() };
    setUser(user);
    navigate("/id-created");
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img src={LOGO} className="auth-logo" alt="VIGIL logo" />
        <p className="eyebrow">CREATE YOUR ACCOUNT</p>
        <h1>Join VIGIL</h1>
        <p className="muted">Get your unique VIGIL ID and access safety resources.</p>
        <form onSubmit={submit} className="form">
          <label>Full Name</label>
          <div className="input-wrap"><User /><input value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" /></div>
          <label>Email Address</label>
          <div className="input-wrap"><Mail /><input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Enter your email" /></div>
          <label>Password</label>
          <div className="input-wrap"><Lock /><input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="At least 6 characters" /></div>
          <label>Confirm Password</label>
          <div className="input-wrap"><Lock /><input value={confirm} onChange={e => setConfirm(e.target.value)} type="password" placeholder="Confirm password" /></div>
          {error && <div className="error-box">{error}</div>}
          <button className="primary-btn" type="submit"><UserPlus /> Create Account</button>
        </form>
        <p className="switch-text">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}

function IdCreated() {
  const navigate = useNavigate();
  const user = getUser();
  if (!user) return <Navigate to="/signup" replace />;
  return (
    <div className="auth-page">
      <div className="auth-card center">
        <img src={LOGO} className="auth-logo" alt="VIGIL logo" />
        <div className="success-icon"><CheckCircle2 /></div>
        <p className="eyebrow">ACCOUNT CREATED</p>
        <h1>Your VIGIL ID</h1>
        <div className="vigil-id">{user.vigilId}</div>
        <p className="muted">Keep this unique ID safe. It can help identify your VIGIL account when using the app.</p>
        <button className="primary-btn" onClick={() => navigate("/")}><ArrowRight /> Continue to VIGIL</button>
      </div>
    </div>
  );
}

function Home() {
  const user = getUser();
  const cards = [
    { to: "/awareness", icon: BookOpen, title: "Awareness", text: "Learn about anti-ragging and anti-drug safety." },
    { to: "/situation", icon: AlertTriangle, title: "What Should I Do?", text: "Choose a situation and get clear next steps." },
    { to: "/report", icon: MessageSquareWarning, title: "Report the Incident", text: "Prepare a clear incident report." },
    { to: "/emergency", icon: Phone, title: "Emergency Call", text: "Get immediate safety guidance." },
  ];
  return (
    <Layout title="VIGIL">
      <section className="hero">
        <img src={LOGO} className="hero-logo" alt="VIGIL logo" />
        <p className="eyebrow">WELCOME TO VIGIL</p>
        <h1>Speak Up. <span>Stay Safe.</span></h1>
        <p>Awareness, guidance, reporting and support for a safer student community.</p>
      </section>
      <section className="three-grid">
        <InfoCard icon={Eye} title="Vision" text="To support a safe, inclusive and respectful educational environment where every student can learn without fear." />
        <InfoCard icon={Shield} title="Mission" text="To educate students through prevention-focused awareness, practical guidance, reporting pathways and support." />
        <InfoCard icon={HeartHandshake} title="Motto" text="Speak Up. Stay Safe." />
      </section>
      <section>
        <div className="section-heading"><BookOpen /><div><p className="eyebrow">YOUR SAFETY TOOLKIT</p><h2>How VIGIL Helps</h2></div></div>
        <div className="card-grid">
          {cards.map(({ to, icon: Icon, title, text }) => (
            <Link className="action-card" to={to} key={to}>
              <div className="action-icon"><Icon /></div>
              <div><h3>{title}</h3><p>{text}</p></div><ChevronRight className="chevron" />
            </Link>
          ))}
        </div>
      </section>
      {user && <div className="welcome-strip">Welcome, <strong>{user.name}</strong> · VIGIL ID <strong>{user.vigilId}</strong></div>}
    </Layout>
  );
}

function InfoCard({ icon: Icon, title, text }: { icon: any; title: string; text: string }) {
  return <div className="info-card"><div className="small-icon"><Icon /></div><h3>{title}</h3><p>{text}</p></div>;
}

function Awareness() {
  return (
    <Layout title="Awareness" back>
      <section className="page-intro">
        <p className="eyebrow">LEARN BEFORE YOU ACT</p>
        <h1>Awareness</h1>
        <p>Choose a topic. Each topic takes you from understanding → rules → what to do → action.</p>
      </section>
      <div className="topic-grid">
        <Link className="topic-card ragging" to="/awareness/ragging/1">
          <Shield /><div><h2>Anti-Ragging Awareness</h2><p>Understand ragging, your rights, the rules and safe reporting steps.</p></div><ChevronRight />
        </Link>
        <Link className="topic-card drugs" to="/awareness/drugs/1">
          <Pill /><div><h2>Anti-Drug Awareness</h2><p>Learn prevention-focused information, risk awareness and how to seek help.</p></div><ChevronRight />
        </Link>
      </div>
    </Layout>
  );
}

const raggingPages = [
  {
    title: "What is Ragging?",
    eyebrow: "PAGE 1 · UNDERSTAND",
    video: RAGGING_VIDEO,
    paragraphs: [
      "Ragging is behaviour by one or more students that humiliates, intimidates, threatens, harasses or causes physical or psychological harm to another student.",
      "It is not made acceptable simply because someone calls it a tradition, joke or introduction. Every student deserves dignity, safety and a respectful learning environment."
    ],
    bullets: ["Verbal or psychological harassment", "Threatening or intimidating behaviour", "Humiliation or bullying", "Unwanted or forced activities", "Online harassment connected to student life"],
  },
  {
    title: "Know the Rules & Your Rights",
    eyebrow: "PAGE 2 · RULES",
    paragraphs: [
      "The UGC Regulations on Curbing the Menace of Ragging in Higher Educational Institutions, 2009 provide a regulatory framework for prevention and response in higher educational institutions.",
      "Institutions are expected to maintain appropriate anti-ragging mechanisms and respond to complaints according to the applicable regulations and law."
    ],
    bullets: ["Ragging is prohibited under the UGC framework.", "Students can seek institutional help and report concerns.", "Institutions have prevention and response responsibilities.", "Exact consequences depend on the incident and applicable rules/law."],
  },
  {
    title: "What Should I Do?",
    eyebrow: "PAGE 3 · GUIDANCE",
    paragraphs: [
      "If you face or witness ragging, your safety comes first. You do not have to handle a threatening situation alone."
    ],
    steps: ["Move to a safer or supervised place if you feel unsafe.", "Tell a trusted teacher, mentor, warden, counsellor, parent/guardian or another trusted adult.", "When safe and lawful, preserve relevant messages, screenshots, dates or locations.", "Use your institution's Anti-Ragging Cell/Committee or the VIGIL reporting pathway.", "Do not confront the people involved alone if doing so could put you at risk."],
  },
  {
    title: "Take Action",
    eyebrow: "PAGE 4 · ACTION",
    paragraphs: [
      "Awareness becomes useful when you know what to do next. Choose the safest appropriate action for your situation."
    ],
    actions: [
      { to: "/report", icon: MessageSquareWarning, title: "Report the Incident", text: "Prepare and submit a clear incident report." },
      { to: "/support", icon: HeartHandshake, title: "Get Support", text: "Find practical support options inside VIGIL." },
      { to: "/emergency", icon: Siren, title: "Immediate Safety", text: "If there is immediate danger, move to safety and seek appropriate emergency assistance." },
    ],
  },
];

const drugPages = [
  {
    title: "Why Drug Awareness Matters",
    eyebrow: "PAGE 1 · UNDERSTAND",
    video: DRUG_VIDEO,
    paragraphs: [
      "Students may encounter peer pressure, misinformation or unsafe situations involving substances. Prevention-focused awareness helps students recognise risk and seek support early.",
      "VIGIL does not encourage experimentation or provide instructions about obtaining or using harmful substances."
    ],
    bullets: ["Peer pressure and coercion", "Misinformation about substances", "Unsafe environments", "Pressure to keep risky activity secret", "The importance of early support"],
  },
  {
    title: "Know the Law",
    eyebrow: "PAGE 2 · RULES",
    paragraphs: [
      "The Narcotic Drugs and Psychotropic Substances Act, 1985 (NDPS Act) is India's central legal framework relating to narcotic drugs and psychotropic substances.",
      "Drug-related offences can carry serious legal consequences. The applicable law depends on the substance, conduct and circumstances, so students should not rely on rumours for legal advice."
    ],
    bullets: ["Use official legal sources for accurate information.", "Do not assume a particular legal outcome from a general rule.", "For legal questions, seek qualified professional advice.", "For safety concerns, prioritise immediate support."],
  },
  {
    title: "What Should I Do?",
    eyebrow: "PAGE 3 · GUIDANCE",
    paragraphs: [
      "If you are being pressured, worried about a friend, or see an unsafe situation, do not put yourself at risk trying to investigate or confront others."
    ],
    steps: ["Move away from pressure or immediate danger.", "Tell a trusted adult, teacher, counsellor or qualified professional.", "If you are worried about a friend, seek help rather than investigating alone.", "If someone appears to need urgent medical help, get an adult and appropriate emergency medical assistance.", "Use VIGIL's reporting and support pathways when appropriate."],
  },
  {
    title: "Get Help. Stay Safe.",
    eyebrow: "PAGE 4 · ACTION",
    paragraphs: [
      "You are not expected to solve a difficult situation alone. Choose a safe next step and involve a trusted person or qualified professional."
    ],
    actions: [
      { to: "/report", icon: MessageSquareWarning, title: "Report a Concern", text: "Prepare a clear report through VIGIL." },
      { to: "/support", icon: HeartHandshake, title: "Professional Support", text: "See support options and guidance." },
      { to: "/emergency", icon: Siren, title: "Immediate Safety", text: "If someone is in immediate danger, seek appropriate emergency assistance." },
    ],
  },
];

function AwarenessTopic({ type }: { type: "ragging" | "drugs" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pages = type === "ragging" ? raggingPages : drugPages;
  const page = Math.max(1, Math.min(4, Number(location.pathname.split("/").pop()) || 1));
  const data: any = pages[page - 1];
  const base = `/awareness/${type}`;

  function go(n: number) {
    navigate(`${base}/${n}`);
  }

  return (
    <Layout title={type === "ragging" ? "Anti-Ragging" : "Anti-Drug"} back>
      <div className="awareness-page">
        <div className="progress-row"><span>Page {page} of 4</span><div className="progress"><span style={{ width: `${page * 25}%` }} /></div></div>
        <section className="detail-card">
          <p className="eyebrow">{data.eyebrow}</p>
          <h1>{data.title}</h1>
          {data.video && (
            <div className="video-wrap">
              <video controls playsInline preload="metadata" src={data.video} />
              <div className="video-label"><Video /> Awareness video</div>
            </div>
          )}
          {data.paragraphs?.map((p: string) => <p className="large-text" key={p}>{p}</p>)}
          {data.bullets && <ul className="check-list">{data.bullets.map((x: string) => <li key={x}><CheckCircle2 />{x}</li>)}</ul>}
          {data.steps && <div className="steps">{data.steps.map((x: string, i: number) => <div className="step" key={x}><span>{i + 1}</span><p>{x}</p></div>)}</div>}
          {data.actions && <div className="action-grid">{data.actions.map((a: any) => <Link to={a.to} className="support-action" key={a.title}><a.icon /><div><strong>{a.title}</strong><span>{a.text}</span></div><ChevronRight /></Link>)}</div>}
          <div className="pager">
            <button className="secondary-btn" disabled={page === 1} onClick={() => go(page - 1)}><ArrowLeft /> Previous</button>
            {page < 4 ? <button className="primary-btn" onClick={() => go(page + 1)}>Next <ArrowRight /></button> : <Link className="primary-btn" to="/awareness">Back to Awareness</Link>}
          </div>
        </section>
      </div>
    </Layout>
  );
}

function Situation() {
  const options = [
    { icon: Shield, title: "Ragging Situation", text: "I am facing or witnessing ragging.", to: "/awareness/ragging/3" },
    { icon: Pill, title: "Drug-related Situation", text: "I am facing pressure or worried about a drug-related situation.", to: "/awareness/drugs/3" },
  ];
  return (
    <Layout title="What Should I Do?" back>
      <section className="page-intro"><p className="eyebrow">NEED GUIDANCE?</p><h1>What Should I Do?</h1><p>Choose the situation that best matches what you are facing.</p></section>
      <div className="card-grid">{options.map(o => <Link to={o.to} className="action-card" key={o.title}><div className="action-icon"><o.icon /></div><div><h3>{o.title}</h3><p>{o.text}</p></div><ChevronRight /></Link>)}</div>
      <div className="notice"><AlertTriangle /><div><strong>Safety first</strong><p>If you are in immediate danger, move to a safer place and seek appropriate emergency assistance.</p></div></div>
    </Layout>
  );
}

function Report() {
  const [submitted, setSubmitted] = useState(false);
  const [category, setCategory] = useState("Anti-Ragging");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    localStorage.setItem("vigilLastReport", JSON.stringify({ category, description, location, createdAt: new Date().toISOString() }));
    setSubmitted(true);
  }
  return (
    <Layout title="Report the Incident" back>
      <section className="page-intro"><p className="eyebrow">REPORT SAFELY</p><h1>Report the Incident</h1><p>For this prototype, your report is stored locally on this device. In a production app, reports should be securely handled by an authorised backend.</p></section>
      {submitted ? (
        <div className="success-card"><CheckCircle2 /><h2>Report Prepared</h2><p>Your report has been saved locally for this prototype.</p><button className="primary-btn" onClick={() => setSubmitted(false)}>Create Another Report</button></div>
      ) : (
        <form className="detail-card form" onSubmit={submit}>
          <label>Incident Type</label>
          <select value={category} onChange={e => setCategory(e.target.value)}><option>Anti-Ragging</option><option>Anti-Drug Concern</option></select>
          <label>Where did it happen?</label><input value={location} onChange={e => setLocation(e.target.value)} placeholder="Optional" />
          <label>What happened?</label><textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the concern in your own words..." rows={7} required />
          <button className="primary-btn" type="submit"><FileText /> Prepare Report</button>
        </form>
      )}
    </Layout>
  );
}

function Emergency() {
  return (
    <Layout title="Emergency Call" back>
      <section className="emergency-panel">
        <div className="emergency-icon"><Siren /></div>
        <p className="eyebrow">IMMEDIATE SAFETY</p>
        <h1>Are you in immediate danger?</h1>
        <p>If yes, move to a safer place and contact the appropriate emergency service or a trusted adult. VIGIL is an awareness and guidance tool; it should not replace emergency services.</p>
        <div className="emergency-actions">
          <div className="support-action"><Phone /><div><strong>Emergency assistance</strong><span>Use your device's emergency calling option or your local emergency service.</span></div></div>
          <Link className="support-action" to="/support"><HeartHandshake /><div><strong>Get Support</strong><span>Open VIGIL support resources.</span></div><ChevronRight /></Link>
        </div>
      </section>
    </Layout>
  );
}

function Support() {
  return (
    <Layout title="Support">
      <section className="page-intro"><p className="eyebrow">YOU ARE NOT ALONE</p><h1>Support</h1><p>Choose a safe person or professional support route. VIGIL is a prototype and does not replace qualified care.</p></section>
      <div className="support-list">
        <div className="support-action"><HeartHandshake /><div><strong>Trusted adult</strong><span>Talk to a parent/guardian, teacher, mentor, warden or counsellor you trust.</span></div></div>
        <div className="support-action"><Shield /><div><strong>Institutional support</strong><span>Use your institution's Anti-Ragging Cell/Committee or relevant student-support system.</span></div></div>
        <div className="support-action"><Phone /><div><strong>Tele-MANAS · 14416</strong><span>Government of India mental-health support, available 24/7.</span></div><a className="call-link" href="tel:+9114416">Call</a></div>
      </div>
    </Layout>
  );
}

function Profile() {
  const navigate = useNavigate();
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  function signOut() {
    logout();
    navigate("/login");
  }
  return (
    <Layout title="Profile">
      <section className="profile-card">
        <img src={LOGO} className="profile-logo" alt="VIGIL" />
        <p className="eyebrow">YOUR VIGIL ACCOUNT</p>
        <h1>{user.name}</h1>
        <p className="muted">{user.email}</p>
        <div className="id-box"><span>VIGIL ID</span><strong>{user.vigilId}</strong></div>
      </section>
      <div className="profile-actions">
        <Link to="/awareness" className="support-action"><BookOpen /><div><strong>Awareness</strong><span>Continue learning.</span></div><ChevronRight /></Link>
        <Link to="/support" className="support-action"><HeartHandshake /><div><strong>Support</strong><span>View support options.</span></div><ChevronRight /></Link>
        <button className="support-action danger-btn" onClick={signOut}><LogOut /><div><strong>Logout</strong><span>Sign out of this prototype account.</span></div></button>
      </div>
    </Layout>
  );
}
