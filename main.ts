import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Flame, Bot, User, RefreshCw, Volume2, VolumeX, Zap } from "lucide-react";

/**
 * 🌶️ Street Roast Edition — v2 (Anti‑Loop)
 * Fixes: Repeating lines. 
 * How: phrase‑level no‑repeat (openers/bodies/closers), big banks, and reply de‑dup hashing.
 * Scope: Normal-life Hinglish comedy roasts (no slurs). Hinglish text, optional Hindi TTS.
 */

export default function StreetRoastBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [speechOn, setSpeechOn] = useState(true);
  const [voices, setVoices] = useState([]);
  const scrollRef = useRef(null);
  const idRef = useRef(0);
  const recentHashesRef = useRef([]); // full-reply no-repeat window

  // phrase-level rotation trackers
  const usedRef = useRef({ openers: new Set(), bodies: new Set(), closers: new Set(), emojis: new Set(), p1tpls: new Set() });

  // Voices
  useEffect(() => {
    function load() {
      const v = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
      setVoices(v || []);
    }
    load();
    if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = load;
  }, []);

  useEffect(() => {
    pushBot("Scene set hai bhai, roast ka thela khul gaya. Aao, kaunse dialog pe tadka lagaun? 🔥");
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  function nextId() { idRef.current += 1; return idRef.current; }
  function pushUser(text) { setMessages(m => [...m, { id: nextId(), sender: "user", text: text.trim() }]); }
  function pushBot(text) {
    const t = text.trim();
    setMessages(m => [...m, { id: nextId(), sender: "bot", text: t }]);
    if (speechOn) speakHindi(t);
  }

  function handleSend() {
    const t = input.trim();
    if (!t) return;
    pushUser(t);
    setInput("");
    respond(t);
  }
  function handleKey(e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }

  // Speech
  function pickVoice() {
    return (
      voices.find(v => /(^|\b)hi(-|_)?IN\b/i.test(v.lang)) ||
      voices.find(v => /^hi/i.test(v.lang)) ||
      voices.find(v => /en(-|_)?IN/i.test(v.lang)) || null
    );
  }
  function speakHindi(text) {
    try {
      if (!window.speechSynthesis) return;
      const u = new SpeechSynthesisUtterance(text);
      const v = pickVoice();
      if (v) u.voice = v; u.lang = v?.lang || "hi-IN"; u.rate = 1.02; u.pitch = 0.98;
      window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
    } catch {}
  }

  // Utils
  const rand = n => Math.floor(Math.random() * n);
  function hash(s) { let h=0; for(let i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))|0;} return h; }
  function pushHash(h){const q=recentHashesRef.current; q.push(h); if(q.length>400) q.shift();}
  function seen(h){return recentHashesRef.current.includes(h);}  

  // non-repeating picker (rotates through set before reusing)
  function pickNoRepeat(arr, key){
    const used = usedRef.current[key];
    if (used.size >= arr.length) used.clear();
    let i; let attempts = 0;
    do { i = rand(arr.length); attempts++; } while(used.has(i) && attempts < 20);
    used.add(i);
    return arr[i];
  }

  // ---- Big lexicon banks (general life; no tech) ----
  const banks = useMemo(() => ({
    p1tpls: [
      (u)=>`Oye superstar, "${u}" bol ke aa gaya? Thoda asli content bhi laata ya sirf hawa?`,
      (u)=>`Sun hero, "${u}" likh diya aur socha main soft ho jaunga? Galat socha.`,
      (u)=>`Arre bhidu, "${u}" — itna patla point ki hawa me udd gaya.`,
      (u)=>`Aaja champion, "${u}" dekh ke lagta hai neend se uth ke seedha type kar diya.`,
      (u)=>`Listen ji, "${u}"? Thoda dum bhar ke aao, yahan mirchi free me nahi milti.`,
      (u)=>`Chhote, "${u}". Dil bada hai tumhara, par logic chhutti pe hai.`,
      (u)=>`Boss, "${u}"? Ye intro tha ya trailer jisme story hi missing hai?`,
    ],

    openers: [
      "Oye nautanki", "Aaja bhidu", "Arre chhote", "Oho legend", "Bhai dekh", "Sun champ", "Maharaj ji", "Hero material", "Public figure ji", "Drama king"
    ],

    bodies: [
      // looks/style
      "tera hairstyle itna experimental ki barber ne portfolio me 'abstract' likh diya",
      "outfit aisa ki hanger bhi resign kar de",
      "swag ka volume high, substance on mute",
      // overconfidence/attitude
      "overconfidence ka balloon itna phoola hai ki hawaa bhi sharmaye",
      "attitude ka EMI chalta rehta hai, par balance hamesha negative",
      // speed/effort
      "tu itna slow hai ki traffic light bhi coaching dene ko tayyar",
      "mehnat ka loading screen par atak gaya, bas reels full speed",
      // school/college/friends
      "class me attendance emoji jaise — kabhi kabhi dikhta hai",
      "group project me contribution: motivational quotes wali DP",
      "doston ka circle bada, par respect ka radius zero",
      // love life / social
      "DM me 'hey', life me 'seen'; algorithm ne tumhe silent mode pe daal diya",
      "date ideas itne thande ki ice-cream bhi garam lage",
      "status 'busy' rakhta hai, par kaam se busy nahi — bas drama se",
      // home/parents
      "ghar wale bolte 'beta settle ho ja', tu bolta 'pehle filter set ho ja'",
      "mummy ne kaha paani lao, tu story upload karne chala gaya",
      // money
      "pocket me hawa aur sapne me Dubai — budget comedy chal rahi hai",
      "monthly savings emoji: 🫥",
      // randomness/comedy
      "soch ka GPS har mod pe 'recalculating' bolta rehta hai",
      "confidence projector pe, planning pen-drive me reh gayi",
      "dialogues Bollywood ke, execution Sunday nap jaisa",
      "vibe itni dry ki emoji bhi paani maange",
      "tu overthinking ka brand ambassador lagta hai",
      "entry dhamakedar, content patang — hawa se hi ud gaya",
      "self‑roast automatic hai, bas trigger chahiye hota",
      "mirchi tumhare tone me nahi, meri lines me hai",
      "ye jo style hai na, slideshow jaisa — next, next, content kahaan?",
      "big talk unlimited, small results prepaid khatam",
      "energy drink pe bhi tumhari energy 'coming soon' rehti hai",
      "expectations Himalaya, execution seashore",
      "tu jab serious hota hai na, meme templates ro dete hain",
      "story highlights me personality, real life me buffering",
      "jokes tumhare itne dry ki popcorn ko bhi pani chahiye",
      "calm dikhta hai, kyunki kaam hi nahi",
      "drip itna plastic ki mannequins bhi inspire na ho",
      "pose 100, purpose 0",
      "samajhdari download me atak gayi; wifi strong, akal weak",
      "multitask aisa ki dono ka nuksan fix plan me",
      "replies tumhari elevator music — sab sunte, koi yaad nahi rakhta",
      "manners beta version, attitude pro plan",
      "badmashi trailer, himmat post‑credits scene me",
      "tashan evergreen, timing kaput",
      "bolne me turbo, karne me eco mode",
      "announcement karte ho stadium me, kaam karte ho balcony me",
      "aankhon me dream, pairon me snooze"
    ],

    closers: [
      "agla line la, varna main tujhe tagline bana du",
      "jaldi bol, warna roast ko sequel de dunga",
      "next daal, warna main tumhari bio rewrite kar dunga",
      "bol ab, warna stand‑up special shuru ho jayega",
      "chalein phir, second round pe — popcorn garam hai",
      "thoda dum lao, fir dekhna dhuaan hi dhuaan",
      "aage badho, warna main outro bhi roast me likh du",
      "short me bolo, warna long lecture milne wala hai"
    ],

    emojis: [
      "😂🔥🤡💀🍿😵‍💫🥵", "🤣🫠🚩🤦‍♂️🎭💥🙄", "🥵🙄📉💔🤡🧨✨", "😮‍💨🧠💥🎯🧊⌛"
    ]
  }), []);

  function composeReply(userText) {
    const u = (userText || "").replace(/\s+/g, " ").trim();

    // P1: dynamic template (no constant phrase)
    const p1tpl = pickNoRepeat(banks.p1tpls, 'p1tpls');
    const p1 = p1tpl(u);

    // P2: opener tag + 2 distinct body lines fused
    const opener = pickNoRepeat(banks.openers, 'openers');
    let b1 = pickNoRepeat(banks.bodies, 'bodies');
    let b2 = pickNoRepeat(banks.bodies, 'bodies');
    let tries = 0; while (b2 === b1 && tries++ < 10) { b2 = pickNoRepeat(banks.bodies, 'bodies'); }
    const p2 = `${opener}, ${b1}. Upar se ${b2}.`;

    // P3: closer + emoji pack
    const closer = pickNoRepeat(banks.closers, 'closers');
    const em = pickNoRepeat(banks.emojis, 'emojis');
    const p3 = `${closer} ${em}`;

    return `${p1}\n\n${p2}\n\n${p3}`;
  }

  function respond(userText){
    setIsTyping(true);
    let reply=""; let tries=0;
    do { reply = composeReply(userText); tries++; } while(tries<8 && seen(hash(reply)));
    pushHash(hash(reply));
    setTimeout(()=>{pushBot(reply); setIsTyping(false);}, 380+Math.random()*720);
  }

  function resetChat(){
    if(window.speechSynthesis) window.speechSynthesis.cancel();
    setMessages([]); recentHashesRef.current=[]; usedRef.current={ openers:new Set(), bodies:new Set(), closers:new Set(), emojis:new Set(), p1tpls:new Set() };
    setTimeout(()=>{pushBot("System restart. Nayi recipe, naya roast. Shuru karein? 🌶️")},140);
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-4xl grid grid-rows-[auto,1fr,auto] rounded-2xl shadow-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden min-h-[82vh]">
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 bg-white/5 border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-white/10 shrink-0"><Flame className="w-5 h-5"/></div>
            <div className="truncate">
              <div className="text-base sm:text-xl font-semibold tracking-tight truncate">Yeshaswi Roast Bot • Street Roast (Anti‑Loop)</div>
              <div className="text-[11px] sm:text-sm text-white/60 truncate">Normal life roasts • Hinglish text • Hindi voice</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <button onClick={()=>setSpeechOn(v=>!v)} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/40 hover:bg-black/50 border border-white/10">
              {speechOn? <Volume2 className="w-4 h-4"/>:<VolumeX className="w-4 h-4"/>}
              <span className="hidden sm:inline">{speechOn?"Bolna ON":"Bolna OFF"}</span>
            </button>
            <button onClick={resetChat} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10"><RefreshCw className="w-4 h-4"/> Reset</button>
          </div>
        </div>

        <div ref={scrollRef} className="overflow-y-auto p-2 sm:p-5 space-y-3">
          <AnimatePresence initial={false}>
            {messages.map(m => (
              <motion.div key={m.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.18}} className={`flex ${m.sender==='user'?'justify-end':'justify-start'}`}>
                {m.sender==='bot' && (
                  <div className="flex-shrink-0 mr-2 sm:mr-3 mt-1 hidden sm:block">
                    <div className="p-2 rounded-xl bg-red-500/20 border border-red-400/30"><Bot className="w-4 h-4"/></div>
                  </div>
                )}
                <div className={`max-w-[88%] sm:max-w-[72%] rounded-2xl px-4 py-3 text-[13px] sm:text-base leading-relaxed shadow-lg ${m.sender==='user'? 'bg-blue-500/20 border border-blue-300/20' : 'bg-red-500/15 border border-red-400/20'}`}>
                  <div className="whitespace-pre-wrap break-words">{m.text}</div>
                </div>
                {m.sender==='user' && (
                  <div className="flex-shrink-0 ml-2 sm:ml-3 mt-1 hidden sm:block"><div className="p-2 rounded-xl bg-white/10"><User className="w-4 h-4"/></div></div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <div className="flex items-center gap-2 text-white/70 text-sm pl-1">
              <div className="p-2 rounded-xl bg-white/10"><Zap className="w-4 h-4"/></div>
              <div className="italic">naya material mix ho raha hai<span className="animate-pulse">…</span></div>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 p-2 sm:p-4 bg-white/5">
          <div className="flex items-end gap-2">
            <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey} placeholder="Hinglish me likho, roast Hindi me suno… (Enter)" className="flex-1 resize-none rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 px-4 py-3 min-h-[48px] max-h-40"/>
            <button onClick={handleSend} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10"><Send className="w-4 h-4"/><span className="hidden sm:inline">Send</span></button>
          </div>
          <div className="text-[11px] sm:text-xs opacity-60 mt-2">Disclaimer: Masti wala roast — hard but playful; no slurs. 🔇</div>
        </div>
      </div>
    </div>
  );
}
