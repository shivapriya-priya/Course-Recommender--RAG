import { useState, useRef, useEffect } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000/api";

const PLATFORMS = ["All","Udemy","Coursera","edX","MIT OCW","Alison","FutureLearn","Stanford University","Harvard University","University of Oxford","Pluralsight","Udacity","SWAYAM"];
const LEVELS = ["All","Beginner","Intermediate","Advanced","All Levels"];
const LANGUAGES = ["All","English","Spanish","French","German","Hindi","Portuguese","Arabic","Chinese","Japanese","Korean","Italian","Russian","Turkish"];

const SUGGESTIONS = [
  "Free Python courses for beginners",
  "Best machine learning courses under $20",
  "Free data science courses with certificate",
  "Web development beginner to advanced",
  "Free Harvard CS courses",
  "AI courses in Hindi language",
  "JavaScript for beginners free",
  "Data structures and algorithms",
];

function openCourse(url, platform) {
  if (!url || url === "" || url === "nan" || url === "None") {
    const searchUrl = "https://www.google.com/search?q=" + encodeURIComponent(platform + " online courses");
    window.open(searchUrl, "_blank");
    return;
  }
  let finalUrl = url;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    finalUrl = "https://" + url;
  }
  window.open(finalUrl, "_blank");
}

function PlatformCompare({ courses }) {
  if (!courses || courses.length === 0) return null;
  const byPlatform = {};
  courses.forEach(c => {
    if (!byPlatform[c.platform]) byPlatform[c.platform] = [];
    byPlatform[c.platform].push(c);
  });
  const platforms = Object.keys(byPlatform);
  if (platforms.length < 2) return null;
  return (
    <div style={{marginTop:"16px",background:"#12122a",border:"1px solid #2d2d44",borderRadius:"12px",padding:"16px"}}>
      <div style={{fontSize:"13px",fontWeight:"700",color:"#a78bfa",marginBottom:"12px",letterSpacing:"0.3px"}}>
        Platform Comparison for This Search
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:"12px"}}>
          <thead>
            <tr style={{borderBottom:"1px solid #2d2d44"}}>
              {["Platform","Courses Found","Avg Price","Free Courses","Certificate"].map(h => (
                <th key={h} style={{textAlign:"left",padding:"8px 12px",color:"#6b7280",fontWeight:"500"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {platforms.map((plat, i) => {
              const pc = byPlatform[plat];
              const free = pc.filter(c => c.is_free);
              const paid = pc.filter(c => !c.is_free);
              const avgP = paid.length > 0 ? (paid.reduce((a,c) => a + c.price, 0) / paid.length).toFixed(0) : "0";
              const hasCert = pc.some(c => c.certificate);
              return (
                <tr key={i} style={{borderBottom:"1px solid #1a1a35"}}>
                  <td style={{padding:"8px 12px",color:"#818cf8",fontWeight:"600"}}>{plat}</td>
                  <td style={{padding:"8px 12px",color:"#e2e8f0"}}>{pc.length}</td>
                  <td style={{padding:"8px 12px",color:paid.length===0?"#4ade80":"#fbbf24"}}>{paid.length===0?"Free":"$"+avgP}</td>
                  <td style={{padding:"8px 12px",color:free.length>0?"#4ade80":"#f87171"}}>{free.length>0?free.length+" free":"None"}</td>
                  <td style={{padding:"8px 12px",color:hasCert?"#4ade80":"#f87171"}}>{hasCert?"Yes":"No"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CourseCard({ course }) {
  const isFree = course.is_free;
  const rating = Number(course.avg_rating) || 0;
  const filled = Math.round(rating);
  const stars = "★".repeat(filled) + "☆".repeat(5 - filled);
  return (
    <div style={{background:"#1a1a2e",border:"1px solid #2d2d44",borderRadius:"12px",padding:"14px",display:"flex",flexDirection:"column",gap:"8px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:"11px",fontWeight:"600",padding:"3px 8px",borderRadius:"999px",background:"#312e81",color:"#a5b4fc"}}>
          {course.platform}
        </span>
        <span style={{fontSize:"11px",fontWeight:"700",padding:"3px 8px",borderRadius:"999px",background:isFree?"#14532d":"#431407",color:isFree?"#4ade80":"#fb923c"}}>
          {isFree ? "FREE" : "$" + course.price}
        </span>
      </div>
      <div style={{fontWeight:"600",fontSize:"13px",color:"#e2e8f0",lineHeight:"1.4"}}>
        {course.title}
      </div>
      {course.description && (
        <div style={{fontSize:"11px",color:"#6b7280",lineHeight:"1.5"}}>
          {String(course.description).slice(0, 100)}
        </div>
      )}
      <div style={{display:"flex",flexWrap:"wrap",gap:"6px",fontSize:"11px"}}>
        <span style={{background:"#1e1b4b",color:"#818cf8",padding:"2px 6px",borderRadius:"4px"}}>{course.level}</span>
        {course.duration_hours && course.duration_hours !== "nan" && (
          <span style={{background:"#1e1b4b",color:"#818cf8",padding:"2px 6px",borderRadius:"4px"}}>{course.duration_hours}</span>
        )}
        {course.certificate && (
          <span style={{background:"#14532d",color:"#4ade80",padding:"2px 6px",borderRadius:"4px"}}>Certificate</span>
        )}
        {course.language && course.language !== "nan" && (
          <span style={{background:"#1e1b4b",color:"#818cf8",padding:"2px 6px",borderRadius:"4px"}}>{course.language}</span>
        )}
      </div>
      <div style={{fontSize:"12px",color:"#f59e0b"}}>
        {stars}
        <span style={{fontSize:"11px",color:"#6b7280",marginLeft:"4px"}}>
          {rating > 0 ? rating.toFixed(1) : "Not rated"}
        </span>
      </div>
      {course.skills && course.skills !== "nan" && (
        <div style={{fontSize:"11px",color:"#7c3aed"}}>
          Skills: {String(course.skills).slice(0, 80)}
        </div>
      )}
      <button
        onClick={() => openCourse(course.course_url, course.platform)}
        style={{marginTop:"4px",background:"linear-gradient(135deg,#4f46e5,#7c3aed)",color:"white",border:"none",borderRadius:"8px",padding:"8px",fontSize:"12px",cursor:"pointer",fontWeight:"600"}}
      >
        Open Course
      </button>
    </div>
  );
}

function ChatTab({ platform, level, isFree, maxPrice, language, loading, setLoading }) {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hey there! Welcome to CourseAI!\n\nI am your personal learning advisor with access to 246,718 courses from 14 top platforms including Coursera, Udemy, MIT, Harvard, Stanford and more.\n\nWhat would you like to learn today? Tell me your topic, skill level, and budget — I will find the perfect courses for you!",
      courses: [],
      total: 0,
      showCards: false,
      quickReplies: null
    }
  ]);
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [questionStep, setQuestionStep] = useState(-1);
  const [userAnswers, setUserAnswers] = useState({});
  const [isGathering, setIsGathering] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function searchCourses(finalQuery) {
    setLoading(true);
    try {
      const payload = {
        query: finalQuery,
        top_k: 10,
        platform: platform !== "All" ? platform : null,
        level: level !== "All" ? level : null,
        is_free: isFree ? true : null,
        max_price: maxPrice ? parseFloat(maxPrice) : null,
        language: language !== "All" ? language : null,
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
    } catch (e) {
      setMessages(prev => [...prev, {
        role: "bot",
        text: "Oops! Something went wrong. Please make sure the backend is running on port 8000 and try again.",
        courses: [],
        total: 0,
        showCards: false,
        quickReplies: null
      }]);
    }
    setLoading(false);
  }

  async function send(q) {
    const finalQuery = q || query;
    if (!finalQuery.trim() || loading) return;

    setShowSuggestions(false);
    setQuery("");

    setMessages(prev => [...prev, {
      role: "user",
      text: finalQuery,
      courses: [],
      total: 0,
      showCards: false,
      quickReplies: null
    }]);

    if (!isGathering && questionStep === -1) {
      const lower = finalQuery.toLowerCase();
      const hasLevel = lower.includes("beginner") || lower.includes("intermediate") || lower.includes("advanced");
      const hasBudget = lower.includes("free") || lower.includes("paid") || lower.includes("$") || lower.includes("budget") || lower.includes("under");

      if (!hasLevel && !hasBudget) {
        setIsGathering(true);
        setUserAnswers({ topic: finalQuery });
        setQuestionStep(0);
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: "bot",
            text: "Great choice! To find you the perfect courses, let me ask a couple of quick questions.\n\nWhat is your current skill level?",
            courses: [],
            total: 0,
            showCards: false,
            quickReplies: ["Complete Beginner", "Intermediate", "Advanced"]
          }]);
        }, 300);
        return;
      }

      if (!hasBudget) {
        setIsGathering(true);
        setUserAnswers({ topic: finalQuery });
        setQuestionStep(1);
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: "bot",
            text: "Sounds great! One quick question — do you prefer free courses or are you okay with paid ones?",
            courses: [],
            total: 0,
            showCards: false,
            quickReplies: ["Free Only", "Under $20", "Under $50", "Any Budget"]
          }]);
        }, 300);
        return;
      }

      await searchCourses(finalQuery);
      return;
    }

    if (isGathering) {
      const answers = { ...userAnswers };
      if (questionStep === 0) {
        answers.level = finalQuery;
        setUserAnswers(answers);
        setQuestionStep(1);
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: "bot",
            text: "Perfect! And what is your budget? Do you prefer free courses or are you okay with paid ones?",
            courses: [],
            total: 0,
            showCards: false,
            quickReplies: ["Free Only", "Under $20", "Under $50", "Any Budget"]
          }]);
        }, 300);
        return;
      }

      if (questionStep === 1) {
        answers.budget = finalQuery;
        setUserAnswers(answers);
        setIsGathering(false);
        setQuestionStep(-1);
        const combinedQuery = answers.topic + " " + (answers.level || "") + " " + (answers.budget || "");
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: "bot",
            text: "Awesome! Let me search the best courses for you right now...",
            courses: [],
            total: 0,
            showCards: false,
            quickReplies: null
          }]);
        }, 300);
        setTimeout(() => searchCourses(combinedQuery.trim()), 800);
        return;
      }
    }

    await searchCourses(finalQuery);
  }

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>

      {/* Messages */}
      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:"20px",paddingRight:"4px",paddingBottom:"12px"}}>
        {messages.map((msg, i) => (
          <div key={i}>
            <div style={{display:"flex",justifyContent:msg.role==="user"?"flex-end":"flex-start"}}>
              <div style={{maxWidth:msg.role==="user"?"70%":"100%",width:msg.role==="user"?"auto":"100%"}}>
                {msg.role === "bot" && (
                  <div style={{fontSize:"11px",color:"#6b7280",marginBottom:"4px",fontWeight:"500"}}>CourseAI</div>
                )}
                <div style={{
                  padding:"14px 18px",
                  borderRadius:msg.role==="user"?"18px 18px 4px 18px":"4px 18px 18px 18px",
                  fontSize:"14px",
                  whiteSpace:"pre-wrap",
                  lineHeight:"1.7",
                  background:msg.role==="user"?"linear-gradient(135deg,#4f46e5,#7c3aed)":"#1a1a2e",
                  color:msg.role==="user"?"white":"#e2e8f0",
                  border:msg.role==="user"?"none":"1px solid #2d2d44"
                }}>
                  {msg.text}
                </div>

                {msg.quickReplies && (
                  <div style={{display:"flex",flexWrap:"wrap",gap:"8px",marginTop:"10px"}}>
                    {msg.quickReplies.map(qr => (
                      <button
                        key={qr}
                        onClick={() => send(qr)}
                        disabled={loading}
                        style={{fontSize:"12px",background:"#1e1b4b",border:"1px solid #4f46e5",borderRadius:"999px",padding:"6px 14px",cursor:"pointer",color:"#a5b4fc",fontWeight:"500"}}
                      >
                        {qr}
                      </button>
                    ))}
                  </div>
                )}

                {msg.showCards && msg.courses && msg.courses.length > 0 && (
                  <div style={{marginTop:"12px"}}>
                    <div style={{fontSize:"12px",color:"#6b7280",marginBottom:"10px"}}>
                      Found {msg.total} matching courses — free courses shown first
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:"12px"}}>
                      {msg.courses.map((course, j) => (
                        <CourseCard key={j} course={course} />
                      ))}
                    </div>
                    <PlatformCompare courses={msg.courses} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{display:"flex",justifyContent:"flex-start"}}>
            <div style={{background:"#1a1a2e",border:"1px solid #2d2d44",borderRadius:"4px 18px 18px 18px",padding:"14px 18px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                <div style={{display:"flex",gap:"4px"}}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{
                      width:"8px",height:"8px",borderRadius:"50%",background:"#7c3aed",
                      animation:"bounce 1.2s infinite",
                      animationDelay:i*0.2+"s"
                    }}/>
                  ))}
                </div>
                <span style={{fontSize:"13px",color:"#6b7280"}}>Finding the best courses for you...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Suggestions — only at start */}
      {showSuggestions && (
        <div style={{marginBottom:"12px"}}>
          <div style={{fontSize:"11px",color:"#6b7280",marginBottom:"8px",fontWeight:"500"}}>
            Try asking:
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>
            {SUGGESTIONS.map(p => (
              <button
                key={p}
                onClick={() => send(p)}
                disabled={loading}
                style={{fontSize:"12px",background:"#1a1a2e",border:"1px solid #4f46e5",borderRadius:"999px",padding:"6px 14px",cursor:"pointer",color:"#a5b4fc",fontWeight:"500"}}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Box */}
      <div style={{display:"flex",gap:"10px",background:"#1a1a2e",border:"1px solid "+(loading?"#4f46e5":"#2d2d44"),borderRadius:"16px",padding:"10px 14px",transition:"border-color 0.3s"}}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") send(); }}
          placeholder={loading ? "Please wait..." : "Ask me anything about courses..."}
          disabled={loading}
          style={{flex:1,border:"none",outline:"none",fontSize:"14px",color:"#e2e8f0",background:"transparent",cursor:loading?"not-allowed":"text"}}
        />
        <button
          onClick={() => send()}
          disabled={loading || !query.trim()}
          style={{
            background:loading||!query.trim()?"#2d2d44":"linear-gradient(135deg,#4f46e5,#7c3aed)",
            color:loading||!query.trim()?"#6b7280":"white",
            border:"none",borderRadius:"10px",padding:"8px 20px",
            fontSize:"13px",fontWeight:"600",
            cursor:loading||!query.trim()?"not-allowed":"pointer"
          }}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%,80%,100%{transform:translateY(0)}
          40%{transform:translateY(-8px)}
        }
      `}</style>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("chat");
  const [platform, setPlatform]   = useState("All");
  const [level, setLevel]         = useState("All");
  const [isFree, setIsFree]       = useState(false);
  const [maxPrice, setMaxPrice]   = useState("");
  const [language, setLanguage]   = useState("All");
  const [loading, setLoading]     = useState(false);

  return (
    <div style={{minHeight:"100vh",background:"#0f0f1a",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",color:"#e2e8f0"}}>

      {/* Header */}
      <header style={{background:"#13131f",borderBottom:"1px solid #2d2d44",padding:"14px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:100}}>
        <div>
          <div style={{fontSize:"20px",fontWeight:"700",background:"linear-gradient(135deg,#818cf8,#a78bfa)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            CourseAI
          </div>
          <div style={{fontSize:"11px",color:"#6b7280"}}>246,718 courses · 14 platforms · AI-powered</div>
        </div>
        <div style={{display:"flex",gap:"8px"}}>
          {["chat","compare"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{padding:"8px 18px",borderRadius:"8px",fontSize:"13px",fontWeight:"500",border:"none",cursor:"pointer",background:activeTab===tab?"linear-gradient(135deg,#4f46e5,#7c3aed)":"#1a1a2e",color:activeTab===tab?"white":"#6b7280"}}
            >
              {tab === "chat" ? "Chat" : "Compare Platforms"}
            </button>
          ))}
        </div>
      </header>

      <div style={{maxWidth:"1400px",margin:"0 auto",padding:"20px 16px",display:"flex",gap:"20px"}}>

        {/* Sidebar Filters */}
        <aside style={{width:"220px",flexShrink:0}}>
          <div style={{background:"#13131f",borderRadius:"12px",border:"1px solid "+(loading?"#4f46e5":"#2d2d44"),padding:"16px",position:"sticky",top:"70px",transition:"border-color 0.3s",opacity:loading?0.6:1}}>
            <div style={{fontWeight:"600",color:"#a78bfa",marginBottom:"16px",fontSize:"14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              Filters
              {loading && <span style={{fontSize:"10px",color:"#6b7280"}}>Locked...</span>}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
              <div>
                <div style={{fontSize:"11px",color:"#6b7280",marginBottom:"4px"}}>Platform</div>
                <select value={platform} onChange={e => setPlatform(e.target.value)} disabled={loading}
                  style={{width:"100%",fontSize:"12px",background:"#1a1a2e",border:"1px solid #2d2d44",borderRadius:"8px",padding:"6px 8px",color:"#e2e8f0",cursor:loading?"not-allowed":"pointer"}}>
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <div style={{fontSize:"11px",color:"#6b7280",marginBottom:"4px"}}>Level</div>
                <select value={level} onChange={e => setLevel(e.target.value)} disabled={loading}
                  style={{width:"100%",fontSize:"12px",background:"#1a1a2e",border:"1px solid #2d2d44",borderRadius:"8px",padding:"6px 8px",color:"#e2e8f0",cursor:loading?"not-allowed":"pointer"}}>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <div style={{fontSize:"11px",color:"#6b7280",marginBottom:"4px"}}>Language</div>
                <select value={language} onChange={e => setLanguage(e.target.value)} disabled={loading}
                  style={{width:"100%",fontSize:"12px",background:"#1a1a2e",border:"1px solid #2d2d44",borderRadius:"8px",padding:"6px 8px",color:"#e2e8f0",cursor:loading?"not-allowed":"pointer"}}>
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <label style={{display:"flex",alignItems:"center",gap:"8px",fontSize:"12px",color:loading?"#6b7280":"#e2e8f0",cursor:loading?"not-allowed":"pointer"}}>
                <input type="checkbox" checked={isFree} onChange={e => setIsFree(e.target.checked)} disabled={loading} style={{accentColor:"#7c3aed"}}/>
                Free courses only
              </label>
              <div>
                <div style={{fontSize:"11px",color:"#6b7280",marginBottom:"4px"}}>Max Price ($)</div>
                <input type="number" placeholder="e.g. 20" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} disabled={loading}
                  style={{width:"100%",fontSize:"12px",background:"#1a1a2e",border:"1px solid #2d2d44",borderRadius:"8px",padding:"6px 8px",color:"#e2e8f0",boxSizing:"border-box",cursor:loading?"not-allowed":"text"}}/>
              </div>
              <button
                onClick={() => { setPlatform("All"); setLevel("All"); setIsFree(false); setMaxPrice(""); setLanguage("All"); }}
                disabled={loading}
                style={{fontSize:"12px",color:loading?"#6b7280":"#f87171",background:"none",border:"1px solid #3d1515",borderRadius:"8px",cursor:loading?"not-allowed":"pointer",padding:"6px"}}
              >
                Clear All Filters
              </button>
              <div style={{padding:"10px",background:"#1a1a2e",borderRadius:"8px",border:"1px solid #2d2d44"}}>
                <div style={{fontSize:"11px",color:"#a78bfa",fontWeight:"600",marginBottom:"6px"}}>Active Filters</div>
                <div style={{fontSize:"11px",color:"#6b7280",lineHeight:"1.8"}}>
                  {platform !== "All" && <div>Platform: {platform}</div>}
                  {level !== "All" && <div>Level: {level}</div>}
                  {language !== "All" && <div>Language: {language}</div>}
                  {isFree && <div style={{color:"#4ade80"}}>Free only: Yes</div>}
                  {maxPrice && <div>Max Price: ${maxPrice}</div>}
                  {platform==="All" && level==="All" && language==="All" && !isFree && !maxPrice && (
                    <div style={{color:"#374151"}}>No filters active</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{flex:1,minWidth:0,height:"calc(100vh - 100px)"}}>
          {activeTab === "chat" ? (
            <ChatTab
              platform={platform}
              level={level}
              isFree={isFree}
              maxPrice={maxPrice}
              language={language}
              loading={loading}
              setLoading={setLoading}
            />
          ) : (
            <div style={{background:"#13131f",borderRadius:"12px",border:"1px solid #2d2d44",padding:"24px"}}>
              <div style={{fontSize:"16px",fontWeight:"600",color:"#a78bfa",marginBottom:"8px"}}>Platform Comparison</div>
              <div style={{fontSize:"13px",color:"#6b7280",marginBottom:"20px"}}>
                Search any topic in the chat to see a live comparison of platforms for that specific topic.
              </div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px"}}>
                <thead>
                  <tr style={{borderBottom:"1px solid #2d2d44"}}>
                    {["Platform","Pricing","Certificate","Best For","Career Value","Free Courses"].map(h => (
                      <th key={h} style={{textAlign:"left",padding:"10px 14px",color:"#6b7280",fontWeight:"500"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Udemy","$10-200","Yes","Practical skills","Good","Some"],
                    ["Coursera","$49/mo","Yes","University courses","Excellent","Audit only"],
                    ["edX","Free audit","Paid cert","Academic content","Excellent","Yes (audit)"],
                    ["MIT OCW","Free","No","Deep CS and Engineering","Outstanding","All free"],
                    ["Harvard University","Free","Paid cert","Prestige learning","Outstanding","Yes"],
                    ["Stanford University","Free","Paid cert","CS, AI, ML","Outstanding","Yes"],
                    ["Alison","Free","Yes","Professional skills","Good","All free"],
                    ["FutureLearn","Free audit","Paid cert","Social learning","Good","Yes"],
                    ["Pluralsight","$29/mo","Yes","Tech and coding","Very Good","Trial only"],
                    ["Udacity","$249/mo","Nanodegree","Job-ready projects","Excellent","Some"],
                    ["SWAYAM","Free","Yes","Indian university courses","Good","All free"],
                  ].map((row, i) => (
                    <tr key={i} style={{borderBottom:"1px solid #1a1a2e"}}>
                      {row.map((cell, j) => (
                        <td key={j} style={{padding:"10px 14px",color:j===0?"#818cf8":j===5?"#4ade80":"#e2e8f0",fontWeight:j===0?"600":"400"}}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}