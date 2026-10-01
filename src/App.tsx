import { useState } from 'react';
import { ArrowUp, Menu, Plus, Sparkles } from 'lucide-react';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [sent, setSent] = useState<string[]>([]);
  const submit = () => { const value = prompt.trim(); if (!value) return; setSent(v => [...v, value]); setPrompt(''); };
  return <main className="shell">
    <header className="topbar"><button className="iconbtn" aria-label="Menu"><Menu size={19}/></button><div className="brand"><span className="brandmark"><Sparkles size={17}/></span>CHATGPT<span className="brand-accent">UZB</span></div><button className="newchat" onClick={()=>setSent([])}><Plus size={16}/> Yangi chat</button></header>
    <section className="content">{sent.length===0 ? <div className="welcome"><div className="orb"><Sparkles size={26}/></div><p className="eyebrow">SUN’IY INTELLEKT YORDAMCHISI</p><h1>Bugun sizga <span>qanday yordam</span> bera olaman?</h1><p className="sub">Savolingizni yozing va suhbatni boshlang.</p><div className="suggestions"><button onClick={()=>setPrompt('Menga yangi loyiha uchun g‘oya ber')}>💡 Loyiha uchun g‘oya</button><button onClick={()=>setPrompt('Menga dasturlashni o‘rganishda yordam ber')}>⌘ Dasturlash</button><button onClick={()=>setPrompt('Matnimni yaxshilab ber')}>✦ Matn yozish</button></div></div> : <div className="messages">{sent.map((s,i)=><article className="message" key={i}><div className="avatar">A</div><p>{s}</p></article>)}<div className="notice">Bu boshlang‘ich interfeys. Asl AI javoblari uchun loyihangizning API va chat kodlarini ulash kerak.</div></div>}</section>
    <footer className="composer-wrap"><div className="composer"><textarea value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();submit();}}} placeholder="CHATGPTUZB’dan biror narsa so‘rang..." rows={1}/><button className="send" onClick={submit} aria-label="Yuborish"><ArrowUp size={19}/></button></div><p className="disclaimer">CHATGPTUZB xato qilishi mumkin. Muhim ma’lumotlarni tekshiring.</p></footer>
  </main>;
}