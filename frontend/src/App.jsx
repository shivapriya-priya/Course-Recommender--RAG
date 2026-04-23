import { useState, useRef, useEffect } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000/api";

const PLATFORMS = ["All","Udemy","Coursera","edX","MIT OCW","Alison","FutureLearn","Stanford University","Harvard University","University of Oxford","Pluralsight","Udacity","SWAYAM"];
const LEVELS = ["All","Beginner","Intermediate","Advanced","All Levels"];
const LANGUAGES = ["All","English","Hindi","Spanish","French","German","Portuguese","Arabic","Chinese","Japanese","Korean","Italian","Russian","Turkish"];

const SUGGESTIONS = [
  "Free Python for complete beginners",
  "Machine learning under $20",
  "Free Harvard CS courses with certificate",
  "Web development from scratch",
  "Data science in Hindi language",
  "AI courses free with certificate",
];

function openCourse(url, platform, title) {
  if (!url || url === "" || url === "nan" || url === "None") {
    const q = encodeURIComponent(title + " " + platform + " course");
    window.open("https://www.google.com/search?q=" + q, "_blank");
    return;
  }
  let u = url.trim();
  if (!u.startsWith("http")) u = "https://" + u;
  window.open(u, "_blank");
}

function PlatformCompare({ courses }) {
  if (!courses || courses.length === 0) return null;
  const map = {};
  courses.forEach(c => {
    if (!map[c.platform]) map[c.platform] = [];
    map[c.platform].push(c);
  });
  const plats = Object.keys(map);
  if (plats.length < 2) return null;
  return (
    <div className="compare-box">
      <div className="compare-title">Platform comparison for this search</div>
      <table className="compare-table">
        <thead>
          <tr>
            {["Platform","Found","Avg Price","Free","Certificate"].map(h => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {plats.map((p, i) => {
            const cs = map[p];
            const free = cs.filter(c => c.is_free);
            const paid = cs.filter(c => !c.is_free);
            const avg = paid.length > 0 ? "$" + (paid.reduce((a,c)=>a+c.price,0)/paid.length).toFixed(0) : "Free";
            const cert = cs.some(c => c.certificate);
            return (
              <tr key={i}>
                <td className="plat-name">{p}</td>
                <td>{cs.length}</td>
                <td style={{color: paid.length===0?"#4ade80":"#fbbf24"}}>{avg}</td>
                <td style={{color: free.length>0?"#4ade80":"#f87171"}}>{free.length>0?free.length+" free":"None"}</td>
                <td style={{color: cert?"#4ade80":"#f87171"}}>{cert?"Yes":"No"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CourseCard({ course, idx }) {
  const isFree = course.is_free;
  const rating = Number(course.avg_rating) || 0;
  const stars = "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));
  return (
    <div className="course-card" style={{"--delay": idx * 0.08 + "s"}}>
      <div className="card-top">
        <span className="platform-badge">{course.platform}</span>
        <span className={isFree ? "price-badge free" : "price-badge paid"}>
          {isFree ? "FREE" : "$" + Number(course.price).toFixed(0)}
        </span>
      </div>
      <div className="card-title">{course.title}</div>
      {course.description && (
        <div className="card-desc">{String(course.description).slice(0,110)}</div>
      )}
      <div className="card-tags">
        <span className="tag">{course.level}</span>
        {course.duration_hours && course.duration_hours !== "nan" && (
          <span className="tag">{course.duration_hours}</span>
        )}
        {course.certificate && <span className="tag cert">Certificate</span>}
        {course.language && course.language !== "nan" && (
          <span className="tag">{course.language}</span>
        )}
      </div>
      {rating > 0 && (
        <div className="card-rating">
          <span className="stars">{stars}</span>
          <span className="rating-num">{rating.toFixed(1)}</span>
        </div>
      )}
      {course.skills && course.skills !== "nan" && (
        <div className="card-skills">{String(course.skills).slice(0,90)}</div>
      )}
      <button
        className="card-btn"
        onClick={() => openCourse(course.course_url, course.platform, course.title)}
      >
        Open Course →
      </button>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="typing-wrap">
      <div className="bot-label">CourseAI</div>
      <div className="typing-bubble">
        <span className="dot" /><span className="dot" /><span className="dot" />
        <span className="typing-text">Finding your perfect courses...</span>
      </div>
    </div>
  );
}

function ChatTab({ filters, loading, setLoading }) {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hey! I am CourseAI — your personal learning advisor.\n\nI have 246,718 courses from 14 platforms like Coursera, Udemy, MIT, Harvard, Stanford, and more.\n\nJust tell me what you want to learn. Be as specific or casual as you like — I will take care of the rest!",
      courses: [], total: 0, showCards: false, quickReplies: null
    }
  ]);
  const [query, setQuery] = useState("");
  const [showSugg, setShowSugg] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function addBot(text, extras = {}) {
    setMessages(prev => [...prev, { role:"bot", text, courses:[], total:0, showCards:false, quickReplies:null, ...extras }]);
  }

  async function searchCourses(q) {
    setLoading(true);
    try {
      const payload = {
        query: q,
        top_k: 10,
        platform: filters.platform !== "All" ? filters.platform : null,
        level: filters.level !== "All" ? filters.level : null,
        is_free: filters.isFree ? true : null,
        max_price: filters.maxPrice ? parseFloat(filters.maxPrice) : null,
        language: filters.language !== "All" ? filters.language : null,
      };
      const res = await axios.post(API + "/recommend", payload);
      setMessages(prev => [...prev, {
        role: "bot",
        text: res.data.ai_recommendation,
        courses: res.data.courses || [],
        total: res.data.total_found,
        showCards: true,
        quickReplies: null
      }]);
    } catch {
      addBot("Oops! Could not reach the backend. Please make sure the server is running on port 8000.");
    }
    setLoading(false);
  }

  async function send(q) {
    const msg = (q || query).trim();
    if (!msg || loading) return;
    setShowSugg(false);
    setQuery("");
    setMessages(prev => [...prev, { role:"user", text:msg, courses:[], total:0, showCards:false, quickReplies:null }]);
    // Directly search — filters already set by sidebar, no need to ask again
    await searchCourses(msg);
  }

  return (
    <div className="chat-tab">
      <div className="messages-area">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === "user" ? "msg-row user" : "msg-row bot"}>
            {msg.role === "bot" && <div className="bot-label">CourseAI</div>}
            <div className={msg.role === "user" ? "bubble user-bubble" : "bubble bot-bubble"}>
              {msg.text}
            </div>
            {msg.quickReplies && (
              <div className="quick-replies">
                {msg.quickReplies.map(qr => (
                  <button key={qr} className="qr-btn" onClick={() => send(qr)} disabled={loading}>{qr}</button>
                ))}
              </div>
            )}
            {msg.showCards && msg.courses && msg.courses.length > 0 && (
              <div className="cards-section">
                <div className="cards-meta">
                  Found {msg.total} courses — free courses shown first
                </div>
                <div className="cards-grid">
                  {msg.courses.map((c, j) => <CourseCard key={j} course={c} idx={j} />)}
                </div>
                <PlatformCompare courses={msg.courses} />
              </div>
            )}
          </div>
        ))}
        {loading && <TypingDots />}
        <div ref={bottomRef} />
      </div>

      {showSugg && (
        <div className="suggestions-wrap">
          <div className="sugg-label">Try asking:</div>
          <div className="sugg-list">
            {SUGGESTIONS.map(s => (
              <button key={s} className="sugg-btn" onClick={() => send(s)} disabled={loading}>{s}</button>
            ))}
          </div>
        </div>
      )}

      <div className={`input-row ${loading ? "locked" : ""}`}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") send(); }}
          placeholder={loading ? "Searching..." : "Ask me anything — topic, budget, language, level..."}
          disabled={loading}
          className="chat-input"
        />
        <button onClick={() => send()} disabled={loading || !query.trim()} className="send-btn">
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}

function CompareTab() {
  const rows = [
    ["Udemy","$10–200","Yes","Practical skills","Good","Some free"],
    ["Coursera","$49/mo","Yes","University degrees","Excellent","Audit free"],
    ["edX","Free audit","Paid cert","Academic courses","Excellent","Audit free"],
    ["MIT OCW","100% Free","None","Deep CS & Eng","Outstanding","All free"],
    ["Harvard","Free","Paid cert","Prestige & culture","Outstanding","Yes"],
    ["Stanford","Free","Paid cert","CS, AI, ML","Outstanding","Yes"],
    ["Alison","100% Free","Yes","Pro skills","Good","All free"],
    ["FutureLearn","Free audit","Paid cert","Social learning","Good","Audit free"],
    ["Pluralsight","$29/mo","Yes","Tech & Dev","Very Good","Trial only"],
    ["Udacity","$249/mo","Nanodegree","Job projects","Excellent","Some"],
    ["SWAYAM","100% Free","Yes","Indian universities","Good","All free"],
    ["Oxford","Free","Paid cert","Research & Law","Outstanding","Yes"],
  ];
  return (
    <div className="compare-page">
      <div className="compare-page-title">Platform Comparison</div>
      <div className="compare-page-sub">Use the chat to get topic-specific platform comparisons. Here is a general overview.</div>
      <div className="compare-table-wrap">
        <table className="full-compare-table">
          <thead>
            <tr>
              {["Platform","Price","Certificate","Best For","Career Value","Free Courses"].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {r.map((cell, j) => (
                  <td key={j} style={{
                    color: j===0 ? "#818cf8" : j===5 ? "#4ade80" : "#cbd5e1",
                    fontWeight: j===0 ? "600" : "400"
                  }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab]         = useState("chat");
  const [platform, setPlatform] = useState("All");
  const [level, setLevel]     = useState("All");
  const [isFree, setIsFree]   = useState(false);
  const [maxPrice, setMaxPrice] = useState("");
  const [language, setLanguage] = useState("All");
  const [loading, setLoading] = useState(false);

  const filters = { platform, level, isFree, maxPrice, language };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #080810;
          --surface: #0e0e1a;
          --surface2: #13131f;
          --border: #1e1e30;
          --border2: #2a2a40;
          --text: #e2e8f0;
          --text2: #94a3b8;
          --text3: #4b5563;
          --purple: #7c3aed;
          --purple2: #4f46e5;
          --purple-light: #a78bfa;
          --green: #4ade80;
          --amber: #fbbf24;
          --red: #f87171;
          --font: 'Sora', sans-serif;
          --mono: 'JetBrains Mono', monospace;
        }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: var(--font);
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* ─── LAYOUT ─── */
        .app-shell { display: flex; flex-direction: column; height: 100vh; }

        /* ─── HEADER ─── */
        .header {
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          padding: 0 28px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .logo {
          font-size: 18px;
          font-weight: 700;
          background: linear-gradient(120deg, #818cf8, #a78bfa, #c084fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.3px;
        }
        .logo-sub {
          font-size: 11px;
          color: var(--text3);
          font-family: var(--mono);
          margin-top: 1px;
        }
        .header-tabs { display: flex; gap: 6px; }
        .header-tab {
          padding: 7px 18px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
          font-family: var(--font);
        }
        .header-tab.active {
          background: linear-gradient(135deg, var(--purple2), var(--purple));
          color: white;
          border-color: transparent;
        }
        .header-tab:not(.active) {
          background: var(--surface2);
          color: var(--text2);
          border-color: var(--border);
        }
        .header-tab:not(.active):hover {
          border-color: var(--border2);
          color: var(--text);
        }

        /* ─── MAIN BODY ─── */
        .body-wrap {
          display: flex;
          flex: 1;
          overflow: hidden;
          gap: 0;
        }

        /* ─── SIDEBAR ─── */
        .sidebar {
          width: 230px;
          flex-shrink: 0;
          background: var(--surface);
          border-right: 1px solid var(--border);
          padding: 20px 16px;
          overflow-y: auto;
          transition: opacity 0.3s;
        }
        .sidebar.locked { opacity: 0.5; pointer-events: none; }
        .sidebar-title {
          font-size: 11px;
          font-weight: 600;
          color: var(--purple-light);
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 18px;
          font-family: var(--mono);
        }
        .filter-group { margin-bottom: 18px; }
        .filter-label {
          font-size: 11px;
          color: var(--text3);
          margin-bottom: 6px;
          font-weight: 500;
          display: block;
        }
        .filter-select, .filter-input {
          width: 100%;
          background: var(--surface2);
          border: 1px solid var(--border2);
          border-radius: 8px;
          padding: 7px 10px;
          font-size: 12px;
          color: var(--text);
          font-family: var(--font);
          outline: none;
          transition: border-color 0.2s;
          appearance: none;
        }
        .filter-select:focus, .filter-input:focus { border-color: var(--purple); }
        .filter-input::placeholder { color: var(--text3); }
        .filter-check-row {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 12px;
          color: var(--text2);
          padding: 4px 0;
        }
        .filter-check-row input[type=checkbox] { accent-color: var(--purple); width: 14px; height: 14px; }
        .clear-btn {
          width: 100%;
          background: none;
          border: 1px solid #3d1515;
          border-radius: 8px;
          padding: 7px;
          font-size: 12px;
          color: var(--red);
          cursor: pointer;
          font-family: var(--font);
          margin-top: 8px;
          transition: background 0.2s;
        }
        .clear-btn:hover { background: #3d151520; }

        .active-filters {
          margin-top: 20px;
          padding: 12px;
          background: var(--surface2);
          border-radius: 8px;
          border: 1px solid var(--border);
        }
        .active-filters-title {
          font-size: 10px;
          font-family: var(--mono);
          color: var(--purple-light);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 8px;
        }
        .active-filter-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          background: #1e1b4b;
          color: #a5b4fc;
          border-radius: 999px;
          padding: 2px 8px;
          margin: 2px;
          font-family: var(--mono);
        }
        .no-filters { font-size: 11px; color: var(--text3); }

        /* ─── MAIN CONTENT ─── */
        .main-content { flex: 1; min-width: 0; display: flex; flex-direction: column; overflow: hidden; }

        /* ─── CHAT TAB ─── */
        .chat-tab { display: flex; flex-direction: column; height: 100%; padding: 20px; gap: 12px; }

        .messages-area {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding-right: 4px;
          padding-bottom: 8px;
        }
        .messages-area::-webkit-scrollbar { width: 4px; }
        .messages-area::-webkit-scrollbar-track { background: transparent; }
        .messages-area::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }

        .msg-row { display: flex; flex-direction: column; }
        .msg-row.user { align-items: flex-end; }
        .msg-row.bot { align-items: flex-start; }

        .bot-label {
          font-size: 10px;
          font-family: var(--mono);
          color: var(--purple-light);
          margin-bottom: 5px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .bubble {
          max-width: 780px;
          padding: 14px 18px;
          border-radius: 4px 16px 16px 16px;
          font-size: 14px;
          line-height: 1.75;
          white-space: pre-wrap;
        }
        .user-bubble {
          background: linear-gradient(135deg, var(--purple2), var(--purple));
          color: white;
          border-radius: 16px 16px 4px 16px;
          max-width: 60%;
        }
        .bot-bubble {
          background: var(--surface2);
          border: 1px solid var(--border2);
          color: var(--text);
          width: 100%;
        }

        .quick-replies { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
        .qr-btn {
          font-size: 12px;
          background: #1e1b4b;
          border: 1px solid var(--purple2);
          border-radius: 999px;
          padding: 6px 14px;
          color: #a5b4fc;
          cursor: pointer;
          font-family: var(--font);
          font-weight: 500;
          transition: all 0.2s;
        }
        .qr-btn:hover { background: #2d2a5e; }

        /* ─── TYPING ─── */
        .typing-wrap { display: flex; flex-direction: column; align-items: flex-start; }
        .typing-bubble {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--surface2);
          border: 1px solid var(--border2);
          border-radius: 4px 16px 16px 16px;
          padding: 14px 18px;
        }
        .dot {
          width: 7px; height: 7px;
          background: var(--purple-light);
          border-radius: 50%;
          display: inline-block;
          animation: dotBounce 1.2s infinite;
        }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes dotBounce {
          0%,80%,100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        .typing-text { font-size: 13px; color: var(--text3); font-family: var(--mono); }

        /* ─── CARDS ─── */
        .cards-section { margin-top: 14px; width: 100%; }
        .cards-meta { font-size: 11px; color: var(--text3); margin-bottom: 12px; font-family: var(--mono); }
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 12px;
        }

        .course-card {
          background: var(--surface2);
          border: 1px solid var(--border2);
          border-radius: 12px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          animation: cardIn 0.4s ease both;
          animation-delay: var(--delay, 0s);
          transition: border-color 0.2s, transform 0.2s;
        }
        .course-card:hover { border-color: var(--purple); transform: translateY(-2px); }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .card-top { display: flex; justify-content: space-between; align-items: center; }
        .platform-badge {
          font-size: 10px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 999px;
          background: #1e1b4b;
          color: #a5b4fc;
          font-family: var(--mono);
        }
        .price-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 999px;
          font-family: var(--mono);
        }
        .price-badge.free { background: #14532d; color: var(--green); }
        .price-badge.paid { background: #431407; color: #fb923c; }

        .card-title { font-size: 13px; font-weight: 600; color: var(--text); line-height: 1.4; }
        .card-desc { font-size: 11px; color: var(--text3); line-height: 1.5; }
        .card-tags { display: flex; flex-wrap: wrap; gap: 4px; }
        .tag {
          font-size: 10px;
          background: #1a1a35;
          color: #818cf8;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: var(--mono);
        }
        .tag.cert { background: #14532d; color: var(--green); }
        .card-rating { font-size: 12px; color: var(--amber); }
        .rating-num { font-size: 11px; color: var(--text3); margin-left: 4px; }
        .card-skills { font-size: 10px; color: #7c3aed; font-family: var(--mono); }
        .card-btn {
          margin-top: 4px;
          background: linear-gradient(135deg, var(--purple2), var(--purple));
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          font-family: var(--font);
          transition: opacity 0.2s;
        }
        .card-btn:hover { opacity: 0.85; }

        /* ─── PLATFORM COMPARE (inline) ─── */
        .compare-box {
          margin-top: 16px;
          background: #0a0a18;
          border: 1px solid var(--border2);
          border-radius: 12px;
          padding: 16px;
        }
        .compare-title {
          font-size: 12px;
          font-weight: 600;
          color: var(--purple-light);
          margin-bottom: 12px;
          font-family: var(--mono);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .compare-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .compare-table th {
          text-align: left;
          padding: 6px 10px;
          color: var(--text3);
          font-weight: 500;
          border-bottom: 1px solid var(--border);
          font-family: var(--mono);
          font-size: 10px;
          text-transform: uppercase;
        }
        .compare-table td { padding: 7px 10px; color: var(--text2); border-bottom: 1px solid #0f0f20; }
        .plat-name { color: #818cf8 !important; font-weight: 600; }

        /* ─── SUGGESTIONS ─── */
        .suggestions-wrap { flex-shrink: 0; }
        .sugg-label { font-size: 10px; color: var(--text3); margin-bottom: 7px; font-family: var(--mono); text-transform: uppercase; letter-spacing: 0.5px; }
        .sugg-list { display: flex; flex-wrap: wrap; gap: 6px; }
        .sugg-btn {
          font-size: 11px;
          background: var(--surface2);
          border: 1px solid var(--border2);
          border-radius: 999px;
          padding: 5px 12px;
          color: #818cf8;
          cursor: pointer;
          font-family: var(--font);
          font-weight: 500;
          transition: all 0.2s;
        }
        .sugg-btn:hover { border-color: var(--purple); color: var(--purple-light); }

        /* ─── INPUT ─── */
        .input-row {
          display: flex;
          gap: 10px;
          background: var(--surface2);
          border: 1px solid var(--border2);
          border-radius: 14px;
          padding: 10px 12px;
          transition: border-color 0.2s;
          flex-shrink: 0;
        }
        .input-row:focus-within { border-color: var(--purple); }
        .input-row.locked { border-color: var(--purple) !important; opacity: 0.7; }
        .chat-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-size: 14px;
          color: var(--text);
          font-family: var(--font);
        }
        .chat-input::placeholder { color: var(--text3); }
        .chat-input:disabled { cursor: not-allowed; }
        .send-btn {
          background: linear-gradient(135deg, var(--purple2), var(--purple));
          color: white;
          border: none;
          border-radius: 10px;
          padding: 8px 22px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: var(--font);
          transition: opacity 0.2s;
          white-space: nowrap;
        }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .send-btn:not(:disabled):hover { opacity: 0.85; }

        /* ─── COMPARE PAGE ─── */
        .compare-page {
          padding: 28px;
          overflow-y: auto;
          height: 100%;
        }
        .compare-page-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 6px;
          letter-spacing: -0.3px;
        }
        .compare-page-sub {
          font-size: 13px;
          color: var(--text3);
          margin-bottom: 24px;
          font-family: var(--mono);
        }
        .compare-table-wrap {
          background: var(--surface2);
          border: 1px solid var(--border2);
          border-radius: 12px;
          overflow: hidden;
          overflow-x: auto;
        }
        .full-compare-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .full-compare-table th {
          text-align: left;
          padding: 12px 16px;
          color: var(--text3);
          font-weight: 500;
          background: #0a0a18;
          border-bottom: 1px solid var(--border2);
          font-family: var(--mono);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .full-compare-table td {
          padding: 11px 16px;
          border-bottom: 1px solid var(--border);
        }
        .full-compare-table tr:last-child td { border-bottom: none; }
        .full-compare-table tr:hover td { background: #0d0d1f; }
      `}</style>

      <div className="app-shell">
        {/* Header */}
        <header className="header">
          <div>
            <div className="logo">CourseAI</div>
            <div className="logo-sub">246,718 courses · 14 platforms · RAG-powered</div>
          </div>
          <div className="header-tabs">
            <button className={`header-tab ${tab==="chat"?"active":""}`} onClick={() => setTab("chat")}>Chat</button>
            <button className={`header-tab ${tab==="compare"?"active":""}`} onClick={() => setTab("compare")}>Compare Platforms</button>
          </div>
        </header>

        <div className="body-wrap">
          {/* Sidebar */}
          <aside className={`sidebar ${loading?"locked":""}`}>
            <div className="sidebar-title">Filters</div>

            <div className="filter-group">
              <label className="filter-label">Platform</label>
              <select className="filter-select" value={platform} onChange={e => setPlatform(e.target.value)}>
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Level</label>
              <select className="filter-select" value={level} onChange={e => setLevel(e.target.value)}>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Language</label>
              <select className="filter-select" value={language} onChange={e => setLanguage(e.target.value)}>
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-check-row">
                <input type="checkbox" checked={isFree} onChange={e => setIsFree(e.target.checked)} />
                Free courses only
              </label>
            </div>

            <div className="filter-group">
              <label className="filter-label">Max Price ($)</label>
              <input
                type="number"
                className="filter-input"
                placeholder="e.g. 20"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
              />
            </div>

            <button className="clear-btn" onClick={() => { setPlatform("All"); setLevel("All"); setLanguage("All"); setIsFree(false); setMaxPrice(""); }}>
              Clear all filters
            </button>

            <div className="active-filters">
              <div className="active-filters-title">Active</div>
              {platform === "All" && level === "All" && language === "All" && !isFree && !maxPrice ? (
                <div className="no-filters">No filters active</div>
              ) : (
                <>
                  {platform !== "All" && <span className="active-filter-pill">{platform}</span>}
                  {level !== "All" && <span className="active-filter-pill">{level}</span>}
                  {language !== "All" && <span className="active-filter-pill">{language}</span>}
                  {isFree && <span className="active-filter-pill" style={{color:"#4ade80",background:"#14532d"}}>Free only</span>}
                  {maxPrice && <span className="active-filter-pill">Max ${maxPrice}</span>}
                </>
              )}
            </div>
          </aside>

          {/* Main */}
          <main className="main-content">
            {tab === "chat" ? (
              <ChatTab filters={filters} loading={loading} setLoading={setLoading} />
            ) : (
              <CompareTab />
            )}
          </main>
        </div>
      </div>
    </>
  );
}
