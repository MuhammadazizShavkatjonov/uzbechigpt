// server.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { GoogleGenAI } from "@google/genai";
dotenv.config();
var app = express();
var PORT = Number(process.env.PORT) || 3e3;
var isProd = process.env.NODE_ENV === "production";
var rawGeminiKey = (process.env.GEMINI_API_KEY || "").trim();
var hasGeminiKey = Boolean(rawGeminiKey && rawGeminiKey.length > 20 && !rawGeminiKey.includes("your_"));
var ai = hasGeminiKey ? new GoogleGenAI({ apiKey: rawGeminiKey }) : null;
app.use(cors());
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasKey: hasGeminiKey,
    provider: hasGeminiKey ? "Gemini 3.8 Flash (Text) & Pollinations Flux (Images)" : "UzbechiGPT Smart Engine (Text) & Pollinations Flux (Images)"
  });
});
async function streamTextToResponse(fullText, res) {
  const chunkSize = 16;
  for (let i = 0; i < fullText.length; i += chunkSize) {
    const chunk = fullText.slice(i, i + chunkSize);
    res.write(`data: ${JSON.stringify({ text: chunk })}

`);
    await new Promise((resolve) => setTimeout(resolve, 18));
  }
  res.write("data: [DONE]\n\n");
  res.end();
}
function generateSmartAssistantResponse(messages, language, ageGroup, userName) {
  const lastMsg = [...messages].reverse().find((m) => m.role === "user");
  const userPrompt = lastMsg?.text || "";
  const p = userPrompt.toLowerCase().trim();
  const name = userName ? userName : language === "ru" ? "\u0434\u0440\u0443\u0433" : language === "en" ? "friend" : "do\u2018stim";
  const history = messages.slice(0, -1);
  const prevUser = [...history].reverse().find((m) => m.role === "user")?.text?.toLowerCase() || "";
  const prevModel = [...history].reverse().find((m) => m.role === "model")?.text?.toLowerCase() || "";
  const mathMatch = p.match(/(\d+)\s*([\+\-\*\/])\s*(\d+)/);
  if (mathMatch) {
    const a = parseFloat(mathMatch[1]);
    const op = mathMatch[2];
    const b = parseFloat(mathMatch[3]);
    let res = 0;
    if (op === "+") res = a + b;
    else if (op === "-") res = a - b;
    else if (op === "*") res = a * b;
    else if (op === "/") res = b !== 0 ? a / b : language === "ru" ? "\u0414\u0435\u043B\u0435\u043D\u0438\u0435 \u043D\u0430 \u043D\u043E\u043B\u044C \u043D\u0435\u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E" : "Nolga bo\u2018lish mumkin emas";
    return `${a} ${op} ${b} = **${res}**`;
  }
  if (p.includes("azizcheek") || p.includes("azizbek") || p.includes("yaratuvchi") || p.includes("muallif") || p.includes("\u0441\u043E\u0437\u0434\u0430\u0442\u0435\u043B\u044C") || p.includes("creator")) {
    if (language === "ru") {
      return `### \u041E \u0441\u043E\u0437\u0434\u0430\u0442\u0435\u043B\u0435

**Azizcheek** \u2014 \u044D\u0442\u043E \u043C\u043E\u0439 \u0441\u043E\u0437\u0434\u0430\u0442\u0435\u043B\u044C \u0438 \u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u0447\u0438\u043A, \u0430\u0432\u0442\u043E\u0440 \u043F\u0440\u043E\u0435\u043A\u0442\u0430 UzbechiGPT. \u041E\u043D \u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u0430\u043B \u044D\u0442\u0443 \u0441\u0438\u0441\u0442\u0435\u043C\u0443 \u0434\u043B\u044F \u0443\u0434\u043E\u0431\u043D\u043E\u0433\u043E \u0438 \u0443\u043C\u043D\u043E\u0433\u043E \u043E\u0431\u0449\u0435\u043D\u0438\u044F \u043D\u0430 \u0440\u043E\u0434\u043D\u043E\u043C \u044F\u0437\u044B\u043A\u0435!`;
    } else if (language === "en") {
      return `### About the Creator

**Azizcheek** is my creator and software developer behind the UzbechiGPT project. He engineered this platform to bring helpful conversational AI to life!`;
    } else {
      return `### Yaratuvchi haqida

**Azizcheek** \u2014 bu mening yaratuvchim, dasturchim va UzbechiGPT loyihasining muallifi. U meni foydalanuvchilarga qulay va aqlli yordamchi bo\u2018lishim uchun ishlab chiqqan!`;
    }
  }
  if (/^(salom|assalomu\s+alaykum|qalesan|qandaysan|privet|привет|hello|hi|good\s+morning|hayrli\s+tong)\b/i.test(p)) {
    const nameStr = userName ? `, ${userName}` : "";
    if (language === "ru") {
      return `\u041F\u0440\u0438\u0432\u0435\u0442${nameStr}! \u{1F44B} \u0427\u0435\u043C \u043C\u043E\u0433\u0443 \u043F\u043E\u043C\u043E\u0447\u044C \u0432\u0430\u043C \u0441\u0435\u0433\u043E\u0434\u043D\u044F? \u0417\u0430\u0434\u0430\u0432\u0430\u0439\u0442\u0435 \u043B\u044E\u0431\u043E\u0439 \u0432\u043E\u043F\u0440\u043E\u0441 \u043F\u043E \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044E, \u0443\u0447\u0451\u0431\u0435, \u044F\u0437\u044B\u043A\u0430\u043C \u0438\u043B\u0438 \u043F\u043E\u0438\u0441\u043A\u0443 \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0439.`;
    } else if (language === "en") {
      return `Hello${nameStr}! \u{1F44B} How can I help you today? Feel free to ask about coding, science, language learning, or image search.`;
    } else {
      return `Assalomu alaykum${nameStr}! \u{1F44B} Qalaysiz? Bugun sizga qanday yordam bera olaman? Dasturlash, ta\u2019lim, til o\u2018rganish yoki fotosuratlar topish bo\u2018yicha savollaringizni bemalol bering!`;
    }
  }
  if ((p.includes("ingliz") || p.includes("english") || p.includes("\u0430\u043D\u0433\u043B\u0438\u0439\u0441\u043A")) && (p.includes("o\u2018rgat") || p.includes("orgat") || p.includes("dars") || p.includes("\u0443\u0447\u0438") || p.includes("teach") || p.includes("learn"))) {
    if (language === "ru") {
      return `### \u0423\u0440\u043E\u043A \u0430\u043D\u0433\u043B\u0438\u0439\u0441\u043A\u043E\u0433\u043E \u044F\u0437\u044B\u043A\u0430 \u21161 \u{1F1EC}\u{1F1E7}

\u0414\u0430\u0432\u0430\u0439\u0442\u0435 \u043D\u0430\u0447\u043D\u0435\u043C \u0441 \u0441\u0430\u043C\u044B\u0445 \u043F\u0440\u0430\u043A\u0442\u0438\u0447\u043D\u044B\u0445 \u0438 \u0431\u0430\u0437\u043E\u0432\u044B\u0445 \u0444\u0440\u0430\u0437:

1. **\u041F\u0440\u0438\u0432\u0435\u0442\u0441\u0442\u0432\u0438\u044F:**
   - *Hello!* \u2014 \u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435!
   - *Good morning!* \u2014 \u0414\u043E\u0431\u0440\u043E\u0435 \u0443\u0442\u0440\u043E!
   - *How are you?* \u2014 \u041A\u0430\u043A \u0432\u0430\u0448\u0438 \u0434\u0435\u043B\u0430?

2. **\u0417\u043D\u0430\u043A\u043E\u043C\u0441\u0442\u0432\u043E:**
   - *My name is...* \u2014 \u041C\u0435\u043D\u044F \u0437\u043E\u0432\u0443\u0442...
   - *Nice to meet you!* \u2014 \u041F\u0440\u0438\u044F\u0442\u043D\u043E \u043F\u043E\u0437\u043D\u0430\u043A\u043E\u043C\u0438\u0442\u044C\u0441\u044F!

3. **\u0412\u0435\u0436\u043B\u0438\u0432\u044B\u0435 \u0444\u0440\u0430\u0437\u044B:**
   - *Please* \u2014 \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430
   - *Thank you* \u2014 \u0421\u043F\u0430\u0441\u0438\u0431\u043E
   - *You are welcome* \u2014 \u041D\u0435 \u0437\u0430 \u0447\u0442\u043E

\u0421 \u043A\u0430\u043A\u043E\u0439 \u0442\u0435\u043C\u044B \u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u043C? \u0413\u0440\u0430\u043C\u043C\u0430\u0442\u0438\u043A\u0430, \u0432\u0440\u0435\u043C\u0435\u043D\u0430 \u0433\u043B\u0430\u0433\u043E\u043B\u043E\u0432 \u0438\u043B\u0438 \u0440\u0430\u0437\u0433\u043E\u0432\u043E\u0440\u043D\u044B\u0435 \u0444\u0440\u0430\u0437\u044B?`;
    } else {
      return `### Ingliz tilini o\u2018rganish bo\u2018yicha 1-dars \u{1F1EC}\u{1F1E7}

Keling, eng muhim va amaliy iboralardan boshlaymiz:

1. **Salomlashish:**
   - *Hello!* \u2014 Salom!
   - *Good morning!* \u2014 Xayrli tong!
   - *How are you?* \u2014 Qalaysiz?

2. **Tanishuv:**
   - *My name is...* \u2014 Mening ismim...
   - *Nice to meet you!* \u2014 Siz bilan tanishganimdan xursandman!

3. **Foydali so\u2018zlar:**
   - *Please* \u2014 Iltimos
   - *Thank you* \u2014 Rahmat
   - *You are welcome* \u2014 Arzimaydi

Qaysi yo\u2018nalishdan davom etamiz? Grammatika (zamolar), lug\u2018at boyligi (vocabulary) yoki jonli suhbat?`;
    }
  }
  if (p.includes("havo") || p.includes("ob-havo") || p.includes("\u043F\u043E\u0433\u043E\u0434\u0430") || p.includes("weather")) {
    if (language === "ru") {
      return `\u0412 \u043D\u0430\u0441\u0442\u043E\u044F\u0449\u0438\u0439 \u043C\u043E\u043C\u0435\u043D\u0442 \u0443 \u043C\u0435\u043D\u044F \u043D\u0435\u0442 \u043F\u0440\u044F\u043C\u043E\u0433\u043E \u0434\u043E\u0441\u0442\u0443\u043F\u0430 \u043A \u0433\u0435\u043E\u043B\u043E\u043A\u0430\u0446\u0438\u0438 \u0438 \u0434\u0430\u0442\u0447\u0438\u043A\u0430\u043C \u043F\u043E\u0433\u043E\u0434\u044B \u0432 \u0440\u0435\u0430\u043B\u044C\u043D\u043E\u043C \u0432\u0440\u0435\u043C\u0435\u043D\u0438.

\u0423\u0442\u043E\u0447\u043D\u0438\u0442\u0435, \u043F\u043E\u0433\u043E\u0434\u0430 \u0432 \u043A\u0430\u043A\u043E\u043C \u0433\u043E\u0440\u043E\u0434\u0435 (*\u0422\u0430\u0448\u043A\u0435\u043D\u0442, \u0421\u0430\u043C\u0430\u0440\u043A\u0430\u043D\u0434, \u0411\u0443\u0445\u0430\u0440\u0430, \u041C\u043E\u0441\u043A\u0432\u0430*) \u0432\u0430\u0441 \u0438\u043D\u0442\u0435\u0440\u0435\u0441\u0443\u0435\u0442?`;
    } else {
      return `Hozirda men real vaqtda qurilmangizning geolokatsiyasi va ob-havo sensorlariga to\u2018g\u2018ridan-to\u2018g\u2018ri ulana olmayman.

Agar qaysi shahar (*Toshkent, Samarqand, Farg\u2018ona, Buxoro*) bo\u2018yicha ob-havo qiziqtirayotganini aytsangiz, aniq ma\u2019lumot berishga harakat qilaman!`;
    }
  }
  if (p.includes("qayerda") || p.includes("joylashgan") || p.includes("\u0433\u0434\u0435") || p.includes("where")) {
    if (prevUser.includes("samarqand") || prevModel.includes("samarqand")) {
      return `**Samarqand** O\u2018zbekistonning janubi-sharqiy qismida, Zarafshon daryosi vodiysida joylashgan. U Toshkentdan taxminan 300 km janubi-g\u2018arbda o\u2018rin olgan va qadimiy Buyuk Ipak yo\u2018lining yuragi hisoblanadi.`;
    }
    if (prevUser.includes("buxoro") || prevModel.includes("buxoro")) {
      return `**Buxoro** O\u2018zbekistonning janubi-g\u2018arbiy qismida, Zarafshon daryosining quyi oqimida, Qizilqum cho\u2018li yaqinida joylashgan.`;
    }
    if (prevUser.includes("xiva") || prevModel.includes("xiva")) {
      return `**Xiva** O\u2018zbekistonning Xorazm viloyatida, Amudaryoning chap sohilida joylashgan.`;
    }
    if (prevUser.includes("toshkent") || prevModel.includes("toshkent")) {
      return `**Toshkent** O\u2018zbekistonning shimoli-sharqiy qismida, Chirchiq daryosi vodiysida, Tyanshan tog\u2018lari etagida joylashgan poytaxt shahardir.`;
    }
  }
  if (p.includes("python")) {
    if (language === "ru") {
      return `### \u0427\u0442\u043E \u0442\u0430\u043A\u043E\u0435 Python?

**Python** \u2014 \u044D\u0442\u043E \u0441\u043E\u0432\u0440\u0435\u043C\u0435\u043D\u043D\u044B\u0439, \u0432\u044B\u0441\u043E\u043A\u043E\u0443\u0440\u043E\u0432\u043D\u0435\u0432\u044B\u0439 \u044F\u0437\u044B\u043A \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F \u0441 \u0447\u0438\u0441\u0442\u044B\u043C \u0438 \u043F\u043E\u043D\u044F\u0442\u043D\u044B\u043C \u0441\u0438\u043D\u0442\u0430\u043A\u0441\u0438\u0441\u043E\u043C.

**\u041A\u043B\u044E\u0447\u0435\u0432\u044B\u0435 \u0441\u0444\u0435\u0440\u044B \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u044F:**
- \u{1F916} **\u0418\u0441\u043A\u0443\u0441\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 \u0418\u043D\u0442\u0435\u043B\u043B\u0435\u043A\u0442 \u0438 Data Science** (TensorFlow, PyTorch, Pandas, NumPy)
- \u{1F310} **\u0411\u044D\u043A\u0435\u043D\u0434 \u0432\u0435\u0431-\u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u043A\u0430** (FastAPI, Django, Flask)
- \u26A1 **\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0437\u0430\u0446\u0438\u044F, \u0441\u043A\u0440\u0438\u043F\u0442\u044B \u0438 \u043F\u0430\u0440\u0441\u0438\u043D\u0433 \u0434\u0430\u043D\u043D\u044B\u0445**
- \u{1F3AE} **\u0421\u043E\u0437\u0434\u0430\u043D\u0438\u0435 \u0431\u043E\u0442\u043E\u0432 \u0438 \u043F\u0440\u043E\u0442\u043E\u0442\u0438\u043F\u043E\u0432**

\u0411\u043B\u0430\u0433\u043E\u0434\u0430\u0440\u044F \u0441\u0432\u043E\u0435\u0439 \u0447\u0438\u0442\u0430\u0435\u043C\u043E\u0441\u0442\u0438 Python \u0441\u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044F \u043E\u0434\u043D\u0438\u043C \u0438\u0437 \u043B\u0443\u0447\u0448\u0438\u0445 \u044F\u0437\u044B\u043A\u043E\u0432 \u0432 \u043C\u0438\u0440\u0435.`;
    } else if (language === "en") {
      return `### What is Python?

**Python** is an interpreted, high-level, general-purpose programming language renowned for its clean syntax and readability.

**Key Applications:**
- \u{1F916} **Artificial Intelligence & Machine Learning** (PyTorch, TensorFlow, Scikit-learn)
- \u{1F310} **Web Development** (FastAPI, Django, Flask)
- \u{1F4CA} **Data Science & Analytics** (Pandas, NumPy, Matplotlib)
- \u2699\uFE0F **Automation & Scripting**

It is one of the most popular and versatile programming languages in modern tech.`;
    } else {
      return `### Python nima?

**Python** \u2014 bu o\u2018rganish oson, o\u2018qilishi nihoyatda qulay va keng qamrovli yuqori darajadagi dasturlash tili.

**Asosiy qo\u2018llanilish sohalari:**
- \u{1F916} **Sun\u2019iy intellekt va Machine Learning** (TensorFlow, PyTorch, Scikit-learn)
- \u{1F310} **Veb-dasturlash (Backend)** (FastAPI, Django, Flask)
- \u{1F4CA} **Ma\u2019lumotlar tahlili va Data Science** (Pandas, NumPy, Matplotlib)
- \u2699\uFE0F **Avtomatlashtirish va Telegram botlar** (Aiogram, Requests)

Python sodda sintaksisi tufayli yangi boshlovchilar uchun ham, yirik korporativ loyihalar uchun ham eng qulay tanlovdir.`;
    }
  }
  if (p.includes("kimsan") || p.includes("\u043A\u0442\u043E \u0442\u044B") || p.includes("who are you") || p.includes("uzbechigpt")) {
    if (language === "ru") {
      return `\u042F **UzbechiGPT** \u2014 \u0438\u043D\u0442\u0435\u043B\u043B\u0435\u043A\u0442\u0443\u0430\u043B\u044C\u043D\u044B\u0439 \u0418\u0418-\u0430\u0441\u0441\u0438\u0441\u0442\u0435\u043D\u0442, \u0441\u043E\u0437\u0434\u0430\u043D\u043D\u044B\u0439 \u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u0447\u0438\u043A\u043E\u043C Azizcheek. \u042F \u0433\u043E\u0442\u043E\u0432 \u043F\u043E\u043C\u043E\u0433\u0430\u0442\u044C \u0432\u0430\u043C \u0441 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435\u043C, \u044F\u0437\u044B\u043A\u0430\u043C\u0438, \u043F\u043E\u0438\u0441\u043A\u043E\u043C \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u0438 \u0438 \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0439!`;
    } else if (language === "en") {
      return `I am **UzbechiGPT** \u2014 an intelligent conversational AI assistant created by Azizcheek. I can help you with programming, languages, information retrieval, and photo search!`;
    } else {
      return `Men **UzbechiGPT** \u2014 Azizcheek tomonidan yaratilgan aqlli sun\u2019iy intellekt yordamchisiman. Dasturlash, ta\u2019lim, til o\u2018rganish, savollarga javob berish va fotosuratlar topishda sizga ko\u2018maklashaman!`;
    }
  }
  if (language === "ru") {
    return `\u041F\u043E \u0432\u0430\u0448\u0435\u043C\u0443 \u0432\u043E\u043F\u0440\u043E\u0441\u0443: **\xAB${userPrompt}\xBB**.

\u042D\u0442\u043E \u0438\u043D\u0442\u0435\u0440\u0435\u0441\u043D\u044B\u0439 \u0438 \u0432\u0430\u0436\u043D\u044B\u0439 \u0437\u0430\u043F\u0440\u043E\u0441. \u0423\u0442\u043E\u0447\u043D\u0438\u0442\u0435, \u043F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043A\u0430\u043A\u0443\u044E \u0438\u043C\u0435\u043D\u043D\u043E \u0434\u0435\u0442\u0430\u043B\u044C \u0432\u044B \u0445\u043E\u0442\u0438\u0442\u0435 \u0440\u0430\u0437\u043E\u0431\u0440\u0430\u0442\u044C \u043F\u043E\u0434\u0440\u043E\u0431\u043D\u0435\u0435, \u0438 \u044F \u0441 \u0440\u0430\u0434\u043E\u0441\u0442\u044C\u044E \u043F\u0440\u0435\u0434\u043E\u0441\u0442\u0430\u0432\u043B\u044E \u043F\u043E\u0448\u0430\u0433\u043E\u0432\u044B\u0439 \u043E\u0442\u0432\u0435\u0442!`;
  } else if (language === "en") {
    return `Regarding your question: **"${userPrompt}"**.

That is a great inquiry. Could you please specify which aspect you would like to explore in more detail? I will provide a comprehensive breakdown!`;
  } else {
    return `Siz bergan savol: **\xAB${userPrompt}\xBB**.

Bu qiziqarli mavzu. Ushbu masala bo\u2018yicha aynan qaysi jihatni batafsil bilmoqchisiz? Savolingizni biroz aniqlashtirsangiz, bosqichma-bosqich tushuntirib beraman!`;
  }
}
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, ageGroup = "adults", language = "uz", userName = "" } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    let systemInstruction = `You are UzbechiGPT, an intelligent, helpful, and friendly conversational AI assistant created by Azizcheek.
Creator: Azizcheek is your creator and developer. When asked about Azizcheek, explain warmly and proudly that Azizcheek is your creator/developer.
Language: Always respond in the language of the user's inquiry (${language === "ru" ? "Russian" : language === "en" ? "English" : "Uzbek"}).
Name of user: ${userName || "Friend"}.
Tone: Natural, articulate, helpful, context-aware. Answer user questions directly, accurately, and dynamically. Never reply with generic canned phrases.`;
    if (ageGroup === "kids") {
      systemInstruction += `
Target audience: Kids aged 7-10. Use warm, cheerful, simple words, emojis, and positive encouragement.`;
    } else if (ageGroup === "teens") {
      systemInstruction += `
Target audience: Teens aged 11-14. Be energetic, engaging, supportive for studies, coding, and creativity.`;
    } else {
      systemInstruction += `
Target audience: Adults 15+. Be concise, articulate, highly informative, and helpful.`;
    }
    if (ai && hasGeminiKey) {
      const contents = [];
      for (const msg of messages) {
        const parts = [];
        if (msg.attachments && Array.isArray(msg.attachments)) {
          for (const att of msg.attachments) {
            if (att.data && (att.mimeType?.startsWith("image/") || att.mimeType === "application/pdf")) {
              parts.push({
                inlineData: {
                  data: att.data,
                  mimeType: att.mimeType
                }
              });
            }
            if (att.textSnippet) {
              parts.push({ text: `[Attachment: ${att.name}]
${att.textSnippet}` });
            }
          }
        }
        if (msg.text) {
          parts.push({ text: msg.text });
        }
        if (parts.length > 0) {
          contents.push({
            role: msg.role === "model" ? "model" : "user",
            parts
          });
        }
      }
      const candidateModels = ["gemini-flash-lite-latest", "gemini-3.1-flash-lite", "gemini-3.8-flash"];
      for (const candidateModel of candidateModels) {
        try {
          const responseStream = await ai.models.generateContentStream({
            model: candidateModel,
            contents,
            config: {
              systemInstruction,
              temperature: 0.7
            }
          });
          let streamedAny = false;
          for await (const chunk of responseStream) {
            if (chunk.text) {
              streamedAny = true;
              res.write(`data: ${JSON.stringify({ text: chunk.text })}

`);
            }
          }
          if (streamedAny) {
            res.write("data: [DONE]\n\n");
            return res.end();
          }
        } catch (geminiError) {
          console.warn(`Model ${candidateModel} streaming failed:`, geminiError?.message);
        }
      }
    }
    const fallbackText = generateSmartAssistantResponse(messages, language, ageGroup, userName);
    await streamTextToResponse(fallbackText, res);
  } catch (error) {
    console.error("Chat streaming handler error:", error);
    const lang = req.body?.language || "uz";
    const fallbackMsg = lang === "ru" ? "\u0418\u0437\u0432\u0438\u043D\u0438\u0442\u0435, \u043F\u0440\u043E\u0438\u0437\u043E\u0448\u043B\u0430 \u043E\u0448\u0438\u0431\u043A\u0430. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435 \u0432\u043E\u043F\u0440\u043E\u0441." : lang === "en" ? "Sorry, an error occurred. Please try asking again." : "Kechirasiz, xatolik yuz berdi. Iltimos, savolingizni qayta yuboring.";
    res.write(`data: ${JSON.stringify({ text: fallbackMsg })}

`);
    res.write("data: [DONE]\n\n");
    res.end();
  }
});
function extractSearchSubject(rawText) {
  let q = rawText.trim();
  const landmarkMap = [
    { regex: /toshkent\s+teleminorasi\w*|tashkent\s+tv\s+tower|ташкентск\w*\s+телебашн\w*/i, target: "Tashkent TV tower" },
    { regex: /samarqand\s+registoni\w*|registon|регистан/i, target: "Samarkand Registan" },
    { regex: /samarqand|самарканд/i, target: "Samarkand" },
    { regex: /buxoro\s+minorai\s+kalon\w*|minorai\s+kalon/i, target: "Kalyan Minaret Bukhara" },
    { regex: /buxoro|бухара/i, target: "Bukhara" },
    { regex: /xiva\s+ichan\s+qal\w*|ichan\s+qal\w*|ичан\s+кала/i, target: "Itchan Kala Khiva" },
    { regex: /xiva|хива/i, target: "Khiva" },
    { regex: /bmw\s+m5/i, target: "BMW M5" },
    { regex: /oq\s+bmw/i, target: "White BMW" },
    { regex: /qora\s+bmw/i, target: "Black BMW" },
    { regex: /bmw/i, target: "BMW" }
  ];
  for (const item of landmarkMap) {
    if (item.regex.test(q)) {
      return item.target;
    }
  }
  q = q.replace(/^(menga|bizga|iltimos|mening\s+uchun)\s+/i, "").replace(/^(нарисуй|найди|найдите|покажи|покажите|сгенерируй|создай|сделай|пожалуйста)\s+/i, "").replace(/^(find|search|show\s+me|show|get|create|display)\s+(photos\s+of|pictures\s+of|images\s+of|photo\s+of|image\s+of|picture\s+of)?\s*/i, "").replace(/\s*(rasmini|rasmlarini|rasmlari|rasmi|rasm|fotosini|fotolarini|foto|suratini|suratlarini|surat)\s*(topib\s+ber|top|ko\x27rsatib\s+ber|ko\x27rsat|qidirib\s+ber|qidir|yaratib\s+ber|yarat|chiqarib\s+ber|ber)?\s*$/i, "").replace(/\s*(фотографии|фото|картинки|картинку|изображения|изображение)\s*$/i, "").trim();
  return q || rawText;
}
app.post("/api/search-images", async (req, res) => {
  try {
    const { query, language = "uz" } = req.body;
    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ error: "Search query is required." });
    }
    const cleanSubject = extractSearchSubject(query);
    const unsplashKey = (process.env.UNSPLASH_ACCESS_KEY || "").trim();
    const images = [];
    if (unsplashKey && !unsplashKey.includes("your_")) {
      try {
        const unsplashRes = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(cleanSubject)}&per_page=6&client_id=${unsplashKey}`,
          { headers: { "Accept-Version": "v1" }, signal: AbortSignal.timeout(1e4) }
        );
        if (unsplashRes.ok) {
          const unsplashData = await unsplashRes.json();
          if (Array.isArray(unsplashData.results)) {
            for (const item of unsplashData.results) {
              images.push({
                id: item.id,
                url: item.urls?.regular || item.urls?.small,
                thumbUrl: item.urls?.small || item.urls?.thumb,
                title: item.alt_description || item.description || cleanSubject,
                author: item.user?.name || "Unsplash Photographer",
                authorUrl: item.user?.links?.html ? `${item.user.links.html}?utm_source=UzbechiGPT&utm_medium=referral` : "",
                source: "Unsplash",
                sourceUrl: item.links?.html ? `${item.links.html}?utm_source=UzbechiGPT&utm_medium=referral` : "https://unsplash.com"
              });
            }
          }
        }
      } catch (unsErr) {
        console.warn("Unsplash API search error:", unsErr);
      }
    }
    if (images.length < 4) {
      try {
        const wikiParams = new URLSearchParams({
          action: "query",
          format: "json",
          generator: "search",
          gsrnamespace: "6",
          gsrsearch: cleanSubject,
          gsrlimit: "8",
          prop: "imageinfo",
          iiprop: "url|user",
          iiurlwidth: "800"
        });
        const wikiRes = await fetch("https://commons.wikimedia.org/w/api.php?" + wikiParams.toString(), {
          headers: { "User-Agent": "UzbechiGPT/1.0 (contact@uzbechigpt.uz)" },
          signal: AbortSignal.timeout(12e3)
        });
        if (wikiRes.ok) {
          const wikiData = await wikiRes.json();
          const pages = wikiData.query?.pages || {};
          for (const page of Object.values(pages)) {
            const info = page.imageinfo?.[0];
            const thumb = info?.thumburl || info?.url;
            if (thumb && (thumb.includes(".jpg") || thumb.includes(".png") || thumb.includes(".jpeg"))) {
              images.push({
                id: String(page.pageid),
                url: info.url || thumb,
                thumbUrl: thumb,
                title: page.title?.replace(/^File:/, "").replace(/\.[^/.]+$/, "") || cleanSubject,
                author: info.user || "Wikimedia Commons",
                authorUrl: info.descriptionurl || "https://commons.wikimedia.org",
                source: "Wikimedia Commons",
                sourceUrl: info.descriptionurl || "https://commons.wikimedia.org"
              });
              if (images.length >= 6) break;
            }
          }
        }
      } catch (wikiErr) {
        console.warn("Wikimedia photo search error:", wikiErr);
      }
    }
    if (images.length > 0) {
      const msg = language === "ru" ? `\u0412\u043E\u0442 \u0440\u0435\u0430\u043B\u044C\u043D\u044B\u0435 \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0438 \u043F\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u0443 **\xAB${cleanSubject}\xBB** \u0438\u0437 \u0438\u043D\u0442\u0435\u0440\u043D\u0435\u0442\u0430:` : language === "en" ? `Here are real internet photos found for **"${cleanSubject}"**:` : `Internetdan **\xAB${cleanSubject}\xBB** bo\u2018yicha topilgan haqiqiy fotosuratlar:`;
      return res.json({
        query: cleanSubject,
        images: images.slice(0, 6),
        text: msg
      });
    }
    const noResultsMsg = language === "ru" ? `\u26A0\uFE0F \u0424\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0438 \u043F\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u0443 \xAB${cleanSubject}\xBB \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B. \u0414\u043B\u044F \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u044F \u043F\u043E\u0438\u0441\u043A\u0430 Unsplash \u0443\u043A\u0430\u0436\u0438\u0442\u0435 UNSPLASH_ACCESS_KEY \u0432 \u0444\u0430\u0439\u043B\u0435 .env.` : language === "en" ? `\u26A0\uFE0F No photos found for "${cleanSubject}". To enable Unsplash photo search, configure UNSPLASH_ACCESS_KEY in your .env file.` : `\u26A0\uFE0F \xAB${cleanSubject}\xBB bo\u2018yicha rasmlar topilmadi. Unsplash orqali qidiruv uchun .env faylida UNSPLASH_ACCESS_KEY ni sozlang.`;
    return res.status(404).json({
      error: noResultsMsg,
      query: cleanSubject
    });
  } catch (error) {
    console.error("Image search route error:", error);
    return res.status(500).json({
      error: "Rasmlarni qidirishda xatolik yuz berdi. Iltimos, qayta urinib ko\u2018ring."
    });
  }
});
function cleanAndTranslatePrompt(prompt, style) {
  let p = prompt.trim();
  const lower = p.toLowerCase();
  const directEntities = [
    {
      test: /(toshkent\s+teleminorasi\w*|tashkent\s+tv\s+tower|ташкентск\w*\s+телебашн\w*)/i,
      resolved: "Tashkent TV Tower in Tashkent, Uzbekistan, clearly visible, beautiful realistic detailed image"
    },
    {
      test: /(samarqand\s+registoni\w*|samarkand\s+registan|регистан\w*\s+в\s+самарканд\w*|площад\w*\s+регистан\w*)/i,
      resolved: "Registan Square in Samarkand, Uzbekistan, clearly visible"
    },
    {
      test: /(buxoro\s+minorai\s+kalon\w*|kalyan\s+minaret|минарет\s+калян)/i,
      resolved: "Kalyan Minaret in Bukhara, Uzbekistan, clearly visible"
    },
    {
      test: /(xiva\s+ichan\s+qal\w*|itchan\s+kala|ичан\s+кала)/i,
      resolved: "Itchan Kala in Khiva, Uzbekistan, clearly visible"
    },
    {
      test: /(oq\s+bmw(\s+mashinasi\w*)?|белый\s+bmw|белая\s+машина\s+bmw|white\s+bmw(\s+car)?)/i,
      resolved: "White BMW car, clearly visible"
    },
    {
      test: /(qora\s+bmw(\s+mashinasi\w*)?|черный\s+bmw|черная\s+машина\s+bmw|black\s+bmw(\s+car)?)/i,
      resolved: "Black BMW car, clearly visible"
    },
    {
      test: /(красивый\s+город\s+ночью|chiroyli\s+shahar\s+kechasi)/i,
      resolved: "Beautiful city at night"
    },
    {
      test: /(futuristic\s+city\s+at\s+night|futuristik\s+shahar\s+kechasi|футуристический\s+город\s+ночью)/i,
      resolved: "Futuristic city at night"
    }
  ];
  for (const item of directEntities) {
    if (item.test.test(lower)) {
      return item.resolved;
    }
  }
  let cleaned = p.replace(/^(menga|bizga|iltimos|mening\s+uchun)\s+/i, "").replace(/^(нарисуй\s+мне|нарисуй|сгенерируй\s+мне|сгенерируй|создай\s+мне|создай|сделай\s+мне|сделай|пожалуйста)\s+/i, "").replace(
    /^(create\s+an\s+image\s+of|create\s+a\s+picture\s+of|create\s+an\s+image|generate\s+an\s+image\s+of|generate\s+a\s+picture\s+of|generate\s+an\s+image|make\s+a\s+picture\s+of|make\s+an\s+image\s+of|draw\s+a\s+picture\s+of|draw\s+an\s+image\s+of|draw\s+a|paint\s+a|show\s+me\s+an\s+image\s+of)\s+/i,
    ""
  ).replace(/\s*(rasmini|rasmini\s+ham|rasm|tasvirini|tasvir|suratini|surat|fotosini|foto)\s*(yaratib\s+ber|yarat|chizib\s+ber|chiz|chiqarib\s+ber|qilib\s+ber|tayyorlab\s+ber|generatsiya\s+qil|ber)?\s*$/i, "").replace(/\s*(картинку|изображение|рисунок|фотографию|фото)\s*$/i, "").trim();
  const uzWordMap = {
    oq: "white",
    qora: "black",
    qizil: "red",
    "ko'k": "blue",
    yashil: "green",
    sariq: "yellow",
    mashina: "car",
    mashinasi: "car",
    mashinasini: "car",
    shahar: "city",
    shahri: "city",
    kechasi: "at night",
    tunda: "at night",
    kechki: "at night",
    quyosh: "sun",
    oy: "moon",
    dengiz: "ocean",
    "tog'": "mountain",
    "tog'lar": "mountains",
    tabiat: "nature",
    chiroyli: "beautiful",
    odam: "person",
    ayol: "woman",
    erkak: "man",
    bola: "child",
    uy: "house",
    daraxt: "tree",
    gul: "flower",
    mushuk: "cat",
    kuchuk: "dog",
    ot: "horse"
  };
  const words = cleaned.split(/\s+/);
  const translatedWords = words.map((w) => {
    const cleanW = w.toLowerCase().replace(/[.,!?]/g, "");
    return uzWordMap[cleanW] || w;
  });
  cleaned = translatedWords.join(" ");
  const styleTag = style && style !== "none" ? `${style} style` : "highly detailed, photorealistic, 8k";
  return `${cleaned}, ${styleTag}`.trim();
}
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, aspectRatio = "1:1", style = "cinematic", language = "uz" } = req.body;
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt is required and must be a valid text string." });
    }
    const visualPrompt = cleanAndTranslatePrompt(prompt, style);
    const aspectMap = {
      "1:1": { width: 1024, height: 1024 },
      "16:9": { width: 1280, height: 720 },
      "9:16": { width: 720, height: 1280 },
      "4:3": { width: 1024, height: 768 },
      "3:4": { width: 768, height: 1024 }
    };
    const { width, height } = aspectMap[aspectRatio] || { width: 1024, height: 1024 };
    const rawKey = process.env.POLLINATIONS_API_KEY || process.env.IMAGE_API_KEY || req.headers["x-pollinations-key"] || req.headers["authorization"]?.replace(/^Bearer\s+/i, "") || req.body.pollinationsApiKey || "";
    const pollinationsKey = typeof rawKey === "string" ? rawKey.trim().replace(/^["']|["']$/g, "") : "";
    const encodedPrompt = encodeURIComponent(visualPrompt);
    let imageUrl = "";
    let lastErrorMsg = "";
    const seed = Math.floor(Math.random() * 1e7);
    try {
      let pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=flux&nologo=true&seed=${seed}`;
      if (pollinationsKey) {
        pollinationsUrl += `&key=${encodeURIComponent(pollinationsKey)}`;
      }
      const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
      };
      if (pollinationsKey) {
        headers["Authorization"] = `Bearer ${pollinationsKey}`;
        headers["x-api-key"] = pollinationsKey;
      }
      console.log(`Generating image via Pollinations: ${visualPrompt.slice(0, 60)}...`);
      let response = await fetch(pollinationsUrl, {
        headers,
        signal: AbortSignal.timeout(45e3)
      });
      if (response.status === 402 || !response.ok) {
        console.warn(`Pollinations initial attempt status ${response.status}, retrying with standard endpoint...`);
        const retryUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&seed=${seed}`;
        response = await fetch(retryUrl, {
          headers,
          signal: AbortSignal.timeout(45e3)
        });
      }
      if (response.ok) {
        const contentType = response.headers.get("content-type") || "image/jpeg";
        if (contentType.includes("image")) {
          const arrayBuf = await response.arrayBuffer();
          if (arrayBuf.byteLength > 800) {
            const base64 = Buffer.from(arrayBuf).toString("base64");
            imageUrl = `data:${contentType};base64,${base64}`;
          }
        }
      } else {
        lastErrorMsg = `Pollinations HTTP status ${response.status}`;
      }
    } catch (pollErr) {
      console.warn("Pollinations primary attempt failed:", pollErr?.message);
      lastErrorMsg = pollErr?.message;
    }
    if (!imageUrl) {
      try {
        const fallbackUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?width=${width}&height=${height}&model=flux&nologo=true${pollinationsKey ? `&key=${encodeURIComponent(pollinationsKey)}` : ""}`;
        const fallbackRes = await fetch(fallbackUrl, {
          headers: {
            "User-Agent": "UzbechiGPT/1.0",
            Accept: "image/*,*/*",
            ...pollinationsKey ? { Authorization: `Bearer ${pollinationsKey}` } : {}
          },
          signal: AbortSignal.timeout(35e3)
        });
        if (fallbackRes.ok) {
          const contentType = fallbackRes.headers.get("content-type") || "image/jpeg";
          if (contentType.includes("image")) {
            const arrayBuf = await fallbackRes.arrayBuffer();
            if (arrayBuf.byteLength > 800) {
              const base64 = Buffer.from(arrayBuf).toString("base64");
              imageUrl = `data:${contentType};base64,${base64}`;
            }
          }
        }
      } catch (fallbackErr) {
        console.warn("Pollinations secondary attempt failed:", fallbackErr?.message);
      }
    }
    if (!imageUrl) {
      imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=flux&nologo=true`;
    }
    const successText = language === "ru" ? "\u0412\u0430\u0448\u0435 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0441\u043E\u0437\u0434\u0430\u043D\u043E! \u{1F3A8}" : language === "en" ? "Here is your generated image! \u{1F3A8}" : "Siz so'ragan tasvir muvaffaqiyatli yaratildi! \u{1F3A8}";
    return res.json({
      imageUrl,
      text: successText,
      prompt: visualPrompt
    });
  } catch (error) {
    console.error("Image generation route error:", error);
    const lang = req.body?.language || "uz";
    const errText = lang === "ru" ? "\u26A0\uFE0F \u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0438 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435 \u043F\u043E\u043F\u044B\u0442\u043A\u0443." : lang === "en" ? "\u26A0\uFE0F Failed to generate image. Please try again." : "\u26A0\uFE0F Rasm yaratishda xatolik yuz berdi. Iltimos, qayta urinib ko\u2018ring.";
    res.status(500).json({
      error: errText,
      technicalDetails: error?.message || "Server error",
      isQuota: false,
      isPaidKeyRequired: false
    });
  }
});
var server_default = app;
if (!process.env.VERCEL) {
  async function startServer() {
    if (!isProd) {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true, hmr: false },
        appType: "spa"
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.resolve(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`UzbechiGPT server running on http://0.0.0.0:${PORT}`);
    });
  }
  startServer().catch((error) => {
    console.error("Server startup failed:", error);
    process.exit(1);
  });
}
export {
  server_default as default
};
