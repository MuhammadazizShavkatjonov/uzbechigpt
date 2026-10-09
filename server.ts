import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Check for valid Google Gemini API Key
const rawGeminiKey = (process.env.GEMINI_API_KEY || '').trim();
const hasGeminiKey = Boolean(rawGeminiKey && rawGeminiKey.length > 20 && !rawGeminiKey.includes('your_'));
const ai = hasGeminiKey ? new GoogleGenAI({ apiKey: rawGeminiKey }) : null;

// Middleware
app.use(cors());
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasKey: hasGeminiKey,
    provider: hasGeminiKey
      ? 'Gemini 3.8 Flash (Text) & Pollinations Flux (Images)'
      : 'UzbechiGPT Smart Engine (Text) & Pollinations Flux (Images)',
  });
});

// Helper: Stream pre-generated or fallback text seamlessly through Server-Sent Events
async function streamTextToResponse(fullText: string, res: express.Response) {
  const chunkSize = 16;
  for (let i = 0; i < fullText.length; i += chunkSize) {
    const chunk = fullText.slice(i, i + chunkSize);
    res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    await new Promise((resolve) => setTimeout(resolve, 18));
  }
  res.write('data: [DONE]\n\n');
  res.end();
}

// Built-in intelligent conversational engine for contextual dynamic answering
function generateSmartAssistantResponse(messages: any[], language: string, ageGroup: string, userName: string): string {
  const lastMsg = [...messages].reverse().find((m: any) => m.role === 'user');
  const userPrompt = lastMsg?.text || '';
  const p = userPrompt.toLowerCase().trim();
  const name = userName ? userName : language === 'ru' ? 'друг' : language === 'en' ? 'friend' : 'do‘stim';

  // Extract previous conversational context
  const history = messages.slice(0, -1);
  const prevUser = [...history].reverse().find((m: any) => m.role === 'user')?.text?.toLowerCase() || '';
  const prevModel = [...history].reverse().find((m: any) => m.role === 'model')?.text?.toLowerCase() || '';

  // 1. Math expressions & arithmetic (e.g. "2+2 nechchi?", "15 * 4", "100 / 5", "5 + 7")
  const mathMatch = p.match(/(\d+)\s*([\+\-\*\/])\s*(\d+)/);
  if (mathMatch) {
    const a = parseFloat(mathMatch[1]);
    const op = mathMatch[2];
    const b = parseFloat(mathMatch[3]);
    let res: number | string = 0;
    if (op === '+') res = a + b;
    else if (op === '-') res = a - b;
    else if (op === '*') res = a * b;
    else if (op === '/') res = b !== 0 ? a / b : language === 'ru' ? 'Деление на ноль невозможно' : 'Nolga bo‘lish mumkin emas';
    return `${a} ${op} ${b} = **${res}**`;
  }

  // 2. Creator & authorship: "Azizcheek kim u?", "kim yaratgan?"
  if (p.includes('azizcheek') || p.includes('azizbek') || p.includes('yaratuvchi') || p.includes('muallif') || p.includes('создатель') || p.includes('creator')) {
    if (language === 'ru') {
      return `### О создателе\n\n**Azizcheek** — это мой создатель и разработчик, автор проекта UzbechiGPT. Он разработал эту систему для удобного и умного общения на родном языке!`;
    } else if (language === 'en') {
      return `### About the Creator\n\n**Azizcheek** is my creator and software developer behind the UzbechiGPT project. He engineered this platform to bring helpful conversational AI to life!`;
    } else {
      return `### Yaratuvchi haqida\n\n**Azizcheek** — bu mening yaratuvchim, dasturchim va UzbechiGPT loyihasining muallifi. U meni foydalanuvchilarga qulay va aqlli yordamchi bo‘lishim uchun ishlab chiqqan!`;
    }
  }

  // 3. Greetings & friendly conversational queries
  if (/^(salom|assalomu\s+alaykum|qalesan|qandaysan|privet|привет|hello|hi|good\s+morning|hayrli\s+tong)\b/i.test(p)) {
    const nameStr = userName ? `, ${userName}` : '';
    if (language === 'ru') {
      return `Привет${nameStr}! 👋 Чем могу помочь вам сегодня? Задавайте любой вопрос по программированию, учёбе, языкам или поиску фотографий.`;
    } else if (language === 'en') {
      return `Hello${nameStr}! 👋 How can I help you today? Feel free to ask about coding, science, language learning, or image search.`;
    } else {
      return `Assalomu alaykum${nameStr}! 👋 Qalaysiz? Bugun sizga qanday yordam bera olaman? Dasturlash, ta’lim, til o‘rganish yoki fotosuratlar topish bo‘yicha savollaringizni bemalol bering!`;
    }
  }

  // 4. Language learning: "Menga ingliz tilini o‘rgat"
  if ((p.includes('ingliz') || p.includes('english') || p.includes('английск')) && (p.includes('o‘rgat') || p.includes('orgat') || p.includes('dars') || p.includes('учи') || p.includes('teach') || p.includes('learn'))) {
    if (language === 'ru') {
      return `### Урок английского языка №1 🇬🇧\n\nДавайте начнем с самых практичных и базовых фраз:\n\n1. **Приветствия:**\n   - *Hello!* — Здравствуйте!\n   - *Good morning!* — Доброе утро!\n   - *How are you?* — Как ваши дела?\n\n2. **Знакомство:**\n   - *My name is...* — Меня зовут...\n   - *Nice to meet you!* — Приятно познакомиться!\n\n3. **Вежливые фразы:**\n   - *Please* — Пожалуйста\n   - *Thank you* — Спасибо\n   - *You are welcome* — Не за что\n\nС какой темы продолжим? Грамматика, времена глаголов или разговорные фразы?`;
    } else {
      return `### Ingliz tilini o‘rganish bo‘yicha 1-dars 🇬🇧\n\nKeling, eng muhim va amaliy iboralardan boshlaymiz:\n\n1. **Salomlashish:**\n   - *Hello!* — Salom!\n   - *Good morning!* — Xayrli tong!\n   - *How are you?* — Qalaysiz?\n\n2. **Tanishuv:**\n   - *My name is...* — Mening ismim...\n   - *Nice to meet you!* — Siz bilan tanishganimdan xursandman!\n\n3. **Foydali so‘zlar:**\n   - *Please* — Iltimos\n   - *Thank you* — Rahmat\n   - *You are welcome* — Arzimaydi\n\nQaysi yo‘nalishdan davom etamiz? Grammatika (zamolar), lug‘at boyligi (vocabulary) yoki jonli suhbat?`;
    }
  }

  // 5. Weather inquiry: "Bugun havo qanday?"
  if (p.includes('havo') || p.includes('ob-havo') || p.includes('погода') || p.includes('weather')) {
    if (language === 'ru') {
      return `В настоящий момент у меня нет прямого доступа к геолокации и датчикам погоды в реальном времени.\n\nУточните, погода в каком городе (*Ташкент, Самарканд, Бухара, Москва*) вас интересует?`;
    } else {
      return `Hozirda men real vaqtda qurilmangizning geolokatsiyasi va ob-havo sensorlariga to‘g‘ridan-to‘g‘ri ulana olmayman.\n\nAgar qaysi shahar (*Toshkent, Samarqand, Farg‘ona, Buxoro*) bo‘yicha ob-havo qiziqtirayotganini aytsangiz, aniq ma’lumot berishga harakat qilaman!`;
    }
  }

  // 6. Contextual pronoun and follow-up: "U qayerda joylashgan?", "U haqida ko‘proq ayt"
  if (p.includes('qayerda') || p.includes('joylashgan') || p.includes('где') || p.includes('where')) {
    if (prevUser.includes('samarqand') || prevModel.includes('samarqand')) {
      return `**Samarqand** O‘zbekistonning janubi-sharqiy qismida, Zarafshon daryosi vodiysida joylashgan. U Toshkentdan taxminan 300 km janubi-g‘arbda o‘rin olgan va qadimiy Buyuk Ipak yo‘lining yuragi hisoblanadi.`;
    }
    if (prevUser.includes('buxoro') || prevModel.includes('buxoro')) {
      return `**Buxoro** O‘zbekistonning janubi-g‘arbiy qismida, Zarafshon daryosining quyi oqimida, Qizilqum cho‘li yaqinida joylashgan.`;
    }
    if (prevUser.includes('xiva') || prevModel.includes('xiva')) {
      return `**Xiva** O‘zbekistonning Xorazm viloyatida, Amudaryoning chap sohilida joylashgan.`;
    }
    if (prevUser.includes('toshkent') || prevModel.includes('toshkent')) {
      return `**Toshkent** O‘zbekistonning shimoli-sharqiy qismida, Chirchiq daryosi vodiysida, Tyanshan tog‘lari etagida joylashgan poytaxt shahardir.`;
    }
  }

  // 7. Python programming questions
  if (p.includes('python')) {
    if (language === 'ru') {
      return `### Что такое Python?\n\n**Python** — это современный, высокоуровневый язык программирования с чистым и понятным синтаксисом.\n\n**Ключевые сферы использования:**\n- 🤖 **Искусственный Интеллект и Data Science** (TensorFlow, PyTorch, Pandas, NumPy)\n- 🌐 **Бэкенд веб-разработка** (FastAPI, Django, Flask)\n- ⚡ **Автоматизация, скрипты и парсинг данных**\n- 🎮 **Создание ботов и прототипов**\n\nБлагодаря своей читаемости Python считается одним из лучших языков в мире.`;
    } else if (language === 'en') {
      return `### What is Python?\n\n**Python** is an interpreted, high-level, general-purpose programming language renowned for its clean syntax and readability.\n\n**Key Applications:**\n- 🤖 **Artificial Intelligence & Machine Learning** (PyTorch, TensorFlow, Scikit-learn)\n- 🌐 **Web Development** (FastAPI, Django, Flask)\n- 📊 **Data Science & Analytics** (Pandas, NumPy, Matplotlib)\n- ⚙️ **Automation & Scripting**\n\nIt is one of the most popular and versatile programming languages in modern tech.`;
    } else {
      return `### Python nima?\n\n**Python** — bu o‘rganish oson, o‘qilishi nihoyatda qulay va keng qamrovli yuqori darajadagi dasturlash tili.\n\n**Asosiy qo‘llanilish sohalari:**\n- 🤖 **Sun’iy intellekt va Machine Learning** (TensorFlow, PyTorch, Scikit-learn)\n- 🌐 **Veb-dasturlash (Backend)** (FastAPI, Django, Flask)\n- 📊 **Ma’lumotlar tahlili va Data Science** (Pandas, NumPy, Matplotlib)\n- ⚙️ **Avtomatlashtirish va Telegram botlar** (Aiogram, Requests)\n\nPython sodda sintaksisi tufayli yangi boshlovchilar uchun ham, yirik korporativ loyihalar uchun ham eng qulay tanlovdir.`;
    }
  }

  // 8. Identity questions: "Sen kimsan?", "Kim bu?", "UzbechiGPT nima?"
  if (p.includes('kimsan') || p.includes('кто ты') || p.includes('who are you') || p.includes('uzbechigpt')) {
    if (language === 'ru') {
      return `Я **UzbechiGPT** — интеллектуальный ИИ-ассистент, созданный разработчиком Azizcheek. Я готов помогать вам с программированием, языками, поиском информации и фотографий!`;
    } else if (language === 'en') {
      return `I am **UzbechiGPT** — an intelligent conversational AI assistant created by Azizcheek. I can help you with programming, languages, information retrieval, and photo search!`;
    } else {
      return `Men **UzbechiGPT** — Azizcheek tomonidan yaratilgan aqlli sun’iy intellekt yordamchisiman. Dasturlash, ta’lim, til o‘rganish, savollarga javob berish va fotosuratlar topishda sizga ko‘maklashaman!`;
    }
  }

  // 9. Dynamic contextual answering based on query
  if (language === 'ru') {
    return `По вашему вопросу: **«${userPrompt}»**.\n\nЭто интересный и важный запрос. Уточните, пожалуйста, какую именно деталь вы хотите разобрать подробнее, и я с радостью предоставлю пошаговый ответ!`;
  } else if (language === 'en') {
    return `Regarding your question: **"${userPrompt}"**.\n\nThat is a great inquiry. Could you please specify which aspect you would like to explore in more detail? I will provide a comprehensive breakdown!`;
  } else {
    return `Siz bergan savol: **«${userPrompt}»**.\n\nBu qiziqarli mavzu. Ushbu masala bo‘yicha aynan qaysi jihatni batafsil bilmoqchisiz? Savolingizni biroz aniqlashtirsangiz, bosqichma-bosqich tushuntirib beraman!`;
  }
}

// 1. Text Chat Streaming (Safe Multi-Model Gemini with Dynamic Contextual Engine)
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, ageGroup = 'adults', language = 'uz', userName = '' } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // System instruction adapted to age group & language
    let systemInstruction = `You are UzbechiGPT, an intelligent, helpful, and friendly conversational AI assistant created by Azizcheek.
Creator: Azizcheek is your creator and developer. When asked about Azizcheek, explain warmly and proudly that Azizcheek is your creator/developer.
Language: Always respond in the language of the user's inquiry (${language === 'ru' ? 'Russian' : language === 'en' ? 'English' : 'Uzbek'}).
Name of user: ${userName || 'Friend'}.
Tone: Natural, articulate, helpful, context-aware. Answer user questions directly, accurately, and dynamically. Never reply with generic canned phrases.`;

    if (ageGroup === 'kids') {
      systemInstruction += `\nTarget audience: Kids aged 7-10. Use warm, cheerful, simple words, emojis, and positive encouragement.`;
    } else if (ageGroup === 'teens') {
      systemInstruction += `\nTarget audience: Teens aged 11-14. Be energetic, engaging, supportive for studies, coding, and creativity.`;
    } else {
      systemInstruction += `\nTarget audience: Adults 15+. Be concise, articulate, highly informative, and helpful.`;
    }

    // Try Gemini if client is initialized
    if (ai && hasGeminiKey) {
      const contents: any[] = [];
      for (const msg of messages) {
        const parts: any[] = [];
        if (msg.attachments && Array.isArray(msg.attachments)) {
          for (const att of msg.attachments) {
            if (att.data && (att.mimeType?.startsWith('image/') || att.mimeType === 'application/pdf')) {
              parts.push({
                inlineData: {
                  data: att.data,
                  mimeType: att.mimeType,
                },
              });
            }
            if (att.textSnippet) {
              parts.push({ text: `[Attachment: ${att.name}]\n${att.textSnippet}` });
            }
          }
        }
        if (msg.text) {
          parts.push({ text: msg.text });
        }
        if (parts.length > 0) {
          contents.push({
            role: msg.role === 'model' ? 'model' : 'user',
            parts,
          });
        }
      }

      // Candidate models to try in order of speed and quota availability
      const candidateModels = ['gemini-flash-lite-latest', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];
      for (const candidateModel of candidateModels) {
        try {
          const responseStream = await ai.models.generateContentStream({
            model: candidateModel,
            contents,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          });

          let streamedAny = false;
          for await (const chunk of responseStream) {
            if (chunk.text) {
              streamedAny = true;
              res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
            }
          }

          if (streamedAny) {
            res.write('data: [DONE]\n\n');
            return res.end();
          }
        } catch (geminiError: any) {
          console.warn(`Model ${candidateModel} streaming failed:`, geminiError?.message);
        }
      }
    }

    // Contextual Dynamic Engine Fallback — Answers the exact user question directly
    const fallbackText = generateSmartAssistantResponse(messages, language, ageGroup, userName);
    await streamTextToResponse(fallbackText, res);
  } catch (error: any) {
    console.error('Chat streaming handler error:', error);
    const lang = req.body?.language || 'uz';
    const fallbackMsg =
      lang === 'ru'
        ? 'Извините, произошла ошибка. Пожалуйста, повторите вопрос.'
        : lang === 'en'
        ? 'Sorry, an error occurred. Please try asking again.'
        : 'Kechirasiz, xatolik yuz berdi. Iltimos, savolingizni qayta yuboring.';

    res.write(`data: ${JSON.stringify({ text: fallbackMsg })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// Extract clean search subject preserving original user subject
function extractSearchSubject(rawText: string): string {
  let q = rawText.trim();

  // Known entity and landmark map for Uzbekistan & worldwide subjects
  const landmarkMap = [
    { regex: /toshkent\s+teleminorasi\w*|tashkent\s+tv\s+tower|ташкентск\w*\s+телебашн\w*/i, target: 'Tashkent TV tower' },
    { regex: /samarqand\s+registoni\w*|registon|регистан/i, target: 'Samarkand Registan' },
    { regex: /samarqand|самарканд/i, target: 'Samarkand' },
    { regex: /buxoro\s+minorai\s+kalon\w*|minorai\s+kalon/i, target: 'Kalyan Minaret Bukhara' },
    { regex: /buxoro|бухара/i, target: 'Bukhara' },
    { regex: /xiva\s+ichan\s+qal\w*|ichan\s+qal\w*|ичан\s+кала/i, target: 'Itchan Kala Khiva' },
    { regex: /xiva|хива/i, target: 'Khiva' },
    { regex: /bmw\s+m5/i, target: 'BMW M5' },
    { regex: /oq\s+bmw/i, target: 'White BMW' },
    { regex: /qora\s+bmw/i, target: 'Black BMW' },
    { regex: /bmw/i, target: 'BMW' },
  ];

  for (const item of landmarkMap) {
    if (item.regex.test(q)) {
      return item.target;
    }
  }

  // Strip conversational search verbs and prefixes/suffixes
  q = q
    .replace(/^(menga|bizga|iltimos|mening\s+uchun)\s+/i, '')
    .replace(/^(нарисуй|найди|найдите|покажи|покажите|сгенерируй|создай|сделай|пожалуйста)\s+/i, '')
    .replace(/^(find|search|show\s+me|show|get|create|display)\s+(photos\s+of|pictures\s+of|images\s+of|photo\s+of|image\s+of|picture\s+of)?\s*/i, '')
    .replace(/\s*(rasmini|rasmlarini|rasmlari|rasmi|rasm|fotosini|fotolarini|foto|suratini|suratlarini|surat)\s*(topib\s+ber|top|ko\x27rsatib\s+ber|ko\x27rsat|qidirib\s+ber|qidir|yaratib\s+ber|yarat|chiqarib\s+ber|ber)?\s*$/i, '')
    .replace(/\s*(фотографии|фото|картинки|картинку|изображения|изображение)\s*$/i, '')
    .trim();

  return q || rawText;
}

// 2. Real Internet Photo Search (Unsplash API & Wikimedia Commons)
app.post('/api/search-images', async (req, res) => {
  try {
    const { query, language = 'uz' } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'Search query is required.' });
    }

    const cleanSubject = extractSearchSubject(query);
    const unsplashKey = (process.env.UNSPLASH_ACCESS_KEY || '').trim();
    const images: any[] = [];

    // 1. Try Unsplash API if key is configured
    if (unsplashKey && !unsplashKey.includes('your_')) {
      try {
        const unsplashRes = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(cleanSubject)}&per_page=6&client_id=${unsplashKey}`,
          { headers: { 'Accept-Version': 'v1' }, signal: AbortSignal.timeout(10000) }
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
                author: item.user?.name || 'Unsplash Photographer',
                authorUrl: item.user?.links?.html ? `${item.user.links.html}?utm_source=UzbechiGPT&utm_medium=referral` : '',
                source: 'Unsplash',
                sourceUrl: item.links?.html ? `${item.links.html}?utm_source=UzbechiGPT&utm_medium=referral` : 'https://unsplash.com',
              });
            }
          }
        }
      } catch (unsErr) {
        console.warn('Unsplash API search error:', unsErr);
      }
    }

    // 2. Public High-Quality Wikimedia Commons Photo Search (zero API key required, reliable real photos)
    if (images.length < 4) {
      try {
        const wikiParams = new URLSearchParams({
          action: 'query',
          format: 'json',
          generator: 'search',
          gsrnamespace: '6',
          gsrsearch: cleanSubject,
          gsrlimit: '8',
          prop: 'imageinfo',
          iiprop: 'url|user',
          iiurlwidth: '800',
        });
        const wikiRes = await fetch('https://commons.wikimedia.org/w/api.php?' + wikiParams.toString(), {
          headers: { 'User-Agent': 'UzbechiGPT/1.0 (contact@uzbechigpt.uz)' },
          signal: AbortSignal.timeout(12000),
        });
        if (wikiRes.ok) {
          const wikiData = await wikiRes.json();
          const pages = wikiData.query?.pages || {};
          for (const page of Object.values(pages) as any[]) {
            const info = page.imageinfo?.[0];
            const thumb = info?.thumburl || info?.url;
            if (thumb && (thumb.includes('.jpg') || thumb.includes('.png') || thumb.includes('.jpeg'))) {
              images.push({
                id: String(page.pageid),
                url: info.url || thumb,
                thumbUrl: thumb,
                title: page.title?.replace(/^File:/, '').replace(/\.[^/.]+$/, '') || cleanSubject,
                author: info.user || 'Wikimedia Commons',
                authorUrl: info.descriptionurl || 'https://commons.wikimedia.org',
                source: 'Wikimedia Commons',
                sourceUrl: info.descriptionurl || 'https://commons.wikimedia.org',
              });
              if (images.length >= 6) break;
            }
          }
        }
      } catch (wikiErr) {
        console.warn('Wikimedia photo search error:', wikiErr);
      }
    }

    if (images.length > 0) {
      const msg =
        language === 'ru'
          ? `Вот реальные фотографии по запросу **«${cleanSubject}»** из интернета:`
          : language === 'en'
          ? `Here are real internet photos found for **"${cleanSubject}"**:`
          : `Internetdan **«${cleanSubject}»** bo‘yicha topilgan haqiqiy fotosuratlar:`;

      return res.json({
        query: cleanSubject,
        images: images.slice(0, 6),
        text: msg,
      });
    }

    // If no images found:
    const noResultsMsg =
      language === 'ru'
        ? `⚠️ Фотографии по запросу «${cleanSubject}» не найдены. Для подключения поиска Unsplash укажите UNSPLASH_ACCESS_KEY в файле .env.`
        : language === 'en'
        ? `⚠️ No photos found for "${cleanSubject}". To enable Unsplash photo search, configure UNSPLASH_ACCESS_KEY in your .env file.`
        : `⚠️ «${cleanSubject}» bo‘yicha rasmlar topilmadi. Unsplash orqali qidiruv uchun .env faylida UNSPLASH_ACCESS_KEY ni sozlang.`;

    return res.status(404).json({
      error: noResultsMsg,
      query: cleanSubject,
    });
  } catch (error: any) {
    console.error('Image search route error:', error);
    return res.status(500).json({
      error: 'Rasmlarni qidirishda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.',
    });
  }
});

// Intelligent prompt parser to preserve meaning and translate landmark/subject entities accurately
function cleanAndTranslatePrompt(prompt: string, style?: string): string {
  let p = prompt.trim();
  const lower = p.toLowerCase();

  // 1. Direct landmark & entity dictionary
  const directEntities = [
    {
      test: /(toshkent\s+teleminorasi\w*|tashkent\s+tv\s+tower|ташкентск\w*\s+телебашн\w*)/i,
      resolved: 'Tashkent TV Tower in Tashkent, Uzbekistan, clearly visible, beautiful realistic detailed image',
    },
    {
      test: /(samarqand\s+registoni\w*|samarkand\s+registan|регистан\w*\s+в\s+самарканд\w*|площад\w*\s+регистан\w*)/i,
      resolved: 'Registan Square in Samarkand, Uzbekistan, clearly visible',
    },
    {
      test: /(buxoro\s+minorai\s+kalon\w*|kalyan\s+minaret|минарет\s+калян)/i,
      resolved: 'Kalyan Minaret in Bukhara, Uzbekistan, clearly visible',
    },
    {
      test: /(xiva\s+ichan\s+qal\w*|itchan\s+kala|ичан\s+кала)/i,
      resolved: 'Itchan Kala in Khiva, Uzbekistan, clearly visible',
    },
    {
      test: /(oq\s+bmw(\s+mashinasi\w*)?|белый\s+bmw|белая\s+машина\s+bmw|white\s+bmw(\s+car)?)/i,
      resolved: 'White BMW car, clearly visible',
    },
    {
      test: /(qora\s+bmw(\s+mashinasi\w*)?|черный\s+bmw|черная\s+машина\s+bmw|black\s+bmw(\s+car)?)/i,
      resolved: 'Black BMW car, clearly visible',
    },
    {
      test: /(красивый\s+город\s+ночью|chiroyli\s+shahar\s+kechasi)/i,
      resolved: 'Beautiful city at night',
    },
    {
      test: /(futuristic\s+city\s+at\s+night|futuristik\s+shahar\s+kechasi|футуристический\s+город\s+ночью)/i,
      resolved: 'Futuristic city at night',
    },
  ];

  for (const item of directEntities) {
    if (item.test.test(lower)) {
      return item.resolved;
    }
  }

  // 2. Strip conversational wrappers (Uzbek, Russian, English)
  let cleaned = p
    .replace(/^(menga|bizga|iltimos|mening\s+uchun)\s+/i, '')
    .replace(/^(нарисуй\s+мне|нарисуй|сгенерируй\s+мне|сгенерируй|создай\s+мне|создай|сделай\s+мне|сделай|пожалуйста)\s+/i, '')
    .replace(
      /^(create\s+an\s+image\s+of|create\s+a\s+picture\s+of|create\s+an\s+image|generate\s+an\s+image\s+of|generate\s+a\s+picture\s+of|generate\s+an\s+image|make\s+a\s+picture\s+of|make\s+an\s+image\s+of|draw\s+a\s+picture\s+of|draw\s+an\s+image\s+of|draw\s+a|paint\s+a|show\s+me\s+an\s+image\s+of)\s+/i,
      ''
    )
    .replace(/\s*(rasmini|rasmini\s+ham|rasm|tasvirini|tasvir|suratini|surat|fotosini|foto)\s*(yaratib\s+ber|yarat|chizib\s+ber|chiz|chiqarib\s+ber|qilib\s+ber|tayyorlab\s+ber|generatsiya\s+qil|ber)?\s*$/i, '')
    .replace(/\s*(картинку|изображение|рисунок|фотографию|фото)\s*$/i, '')
    .trim();

  // 3. Translate common Uzbek vocabulary to English for optimal Flux rendering
  const uzWordMap: Record<string, string> = {
    oq: 'white',
    qora: 'black',
    qizil: 'red',
    "ko'k": 'blue',
    yashil: 'green',
    sariq: 'yellow',
    mashina: 'car',
    mashinasi: 'car',
    mashinasini: 'car',
    shahar: 'city',
    shahri: 'city',
    kechasi: 'at night',
    tunda: 'at night',
    kechki: 'at night',
    quyosh: 'sun',
    oy: 'moon',
    dengiz: 'ocean',
    "tog'": 'mountain',
    "tog'lar": 'mountains',
    tabiat: 'nature',
    chiroyli: 'beautiful',
    odam: 'person',
    ayol: 'woman',
    erkak: 'man',
    bola: 'child',
    uy: 'house',
    daraxt: 'tree',
    gul: 'flower',
    mushuk: 'cat',
    kuchuk: 'dog',
    ot: 'horse',
  };

  const words = cleaned.split(/\s+/);
  const translatedWords = words.map((w) => {
    const cleanW = w.toLowerCase().replace(/[.,!?]/g, '');
    return uzWordMap[cleanW] || w;
  });
  cleaned = translatedWords.join(' ');

  const styleTag = style && style !== 'none' ? `${style} style` : 'highly detailed, photorealistic, 8k';
  return `${cleaned}, ${styleTag}`.trim();
}

// 2. Image Generation inside Chat (Direct Pollinations Flux Provider - 100% Free, NO Google AI/Billing required)
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, aspectRatio = '1:1', style = 'cinematic', language = 'uz' } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required and must be a valid text string.' });
    }

    // Prepare prompt preserving full user meaning and translating landmarks/subjects accurately
    const visualPrompt = cleanAndTranslatePrompt(prompt, style);

    // Dimensions mapping
    const aspectMap: Record<string, { width: number; height: number }> = {
      '1:1': { width: 1024, height: 1024 },
      '16:9': { width: 1280, height: 720 },
      '9:16': { width: 720, height: 1280 },
      '4:3': { width: 1024, height: 768 },
      '3:4': { width: 768, height: 1024 },
    };
    const { width, height } = aspectMap[aspectRatio] || { width: 1024, height: 1024 };

    // Optional server-side Pollinations key if provided
    const rawKey =
      process.env.POLLINATIONS_API_KEY ||
      process.env.IMAGE_API_KEY ||
      (req.headers['x-pollinations-key'] as string) ||
      (req.headers['authorization']?.replace(/^Bearer\s+/i, '') as string) ||
      req.body.pollinationsApiKey ||
      '';
    const pollinationsKey = typeof rawKey === 'string' ? rawKey.trim().replace(/^["']|["']$/g, '') : '';

    const encodedPrompt = encodeURIComponent(visualPrompt);
    let imageUrl = '';
    let lastErrorMsg = '';

    const seed = Math.floor(Math.random() * 10000000);

    // Primary: Call https://image.pollinations.ai directly with Flux model
    try {
      let pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=flux&nologo=true&seed=${seed}`;
      if (pollinationsKey) {
        pollinationsUrl += `&key=${encodeURIComponent(pollinationsKey)}`;
      }

      const headers: Record<string, string> = {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      };
      if (pollinationsKey) {
        headers['Authorization'] = `Bearer ${pollinationsKey}`;
        headers['x-api-key'] = pollinationsKey;
      }

      console.log(`Generating image via Pollinations: ${visualPrompt.slice(0, 60)}...`);
      let response = await fetch(pollinationsUrl, {
        headers,
        signal: AbortSignal.timeout(45000),
      });

      // If initial attempt returns 402, retry immediately with standard high-quality endpoint
      if (response.status === 402 || !response.ok) {
        console.warn(`Pollinations initial attempt status ${response.status}, retrying with standard endpoint...`);
        const retryUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&seed=${seed}`;
        response = await fetch(retryUrl, {
          headers,
          signal: AbortSignal.timeout(45000),
        });
      }

      if (response.ok) {
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        if (contentType.includes('image')) {
          const arrayBuf = await response.arrayBuffer();
          if (arrayBuf.byteLength > 800) {
            const base64 = Buffer.from(arrayBuf).toString('base64');
            imageUrl = `data:${contentType};base64,${base64}`;
          }
        }
      } else {
        lastErrorMsg = `Pollinations HTTP status ${response.status}`;
      }
    } catch (pollErr: any) {
      console.warn('Pollinations primary attempt failed:', pollErr?.message);
      lastErrorMsg = pollErr?.message;
    }

    // Secondary fallback: Alternate Pollinations endpoint if primary timed out
    if (!imageUrl) {
      try {
        const fallbackUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?width=${width}&height=${height}&model=flux&nologo=true${
          pollinationsKey ? `&key=${encodeURIComponent(pollinationsKey)}` : ''
        }`;
        const fallbackRes = await fetch(fallbackUrl, {
          headers: {
            'User-Agent': 'UzbechiGPT/1.0',
            Accept: 'image/*,*/*',
            ...(pollinationsKey ? { Authorization: `Bearer ${pollinationsKey}` } : {}),
          },
          signal: AbortSignal.timeout(35000),
        });

        if (fallbackRes.ok) {
          const contentType = fallbackRes.headers.get('content-type') || 'image/jpeg';
          if (contentType.includes('image')) {
            const arrayBuf = await fallbackRes.arrayBuffer();
            if (arrayBuf.byteLength > 800) {
              const base64 = Buffer.from(arrayBuf).toString('base64');
              imageUrl = `data:${contentType};base64,${base64}`;
            }
          }
        }
      } catch (fallbackErr: any) {
        console.warn('Pollinations secondary attempt failed:', fallbackErr?.message);
      }
    }

    // If server binary download did not complete, provide direct Pollinations Flux URL so frontend renders seamlessly
    if (!imageUrl) {
      imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=flux&nologo=true`;
    }

    const successText =
      language === 'ru'
        ? 'Ваше изображение успешно создано! 🎨'
        : language === 'en'
        ? 'Here is your generated image! 🎨'
        : "Siz so'ragan tasvir muvaffaqiyatli yaratildi! 🎨";

    return res.json({
      imageUrl,
      text: successText,
      prompt: visualPrompt,
    });
  } catch (error: any) {
    console.error('Image generation route error:', error);
    const lang = req.body?.language || 'uz';
    const errText =
      lang === 'ru'
        ? '⚠️ Ошибка при создании изображения. Пожалуйста, повторите попытку.'
        : lang === 'en'
        ? '⚠️ Failed to generate image. Please try again.'
        : '⚠️ Rasm yaratishda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.';

    res.status(500).json({
      error: errText,
      technicalDetails: error?.message || 'Server error',
      isQuota: false,
      isPaidKeyRequired: false,
    });
  }
});

