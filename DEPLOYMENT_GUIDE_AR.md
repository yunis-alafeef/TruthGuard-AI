# 🛡️ دليل النشر والتشغيل السحابي المجاني الاحترافي — منصة حارس الحقيقة (TruthGuard AI)
**إعداد وتطوير:** م. يونس العفيفي (Eng. Yunis Al-Afeef) — `shoeabvv@gmail.com`  
**المستودع الرسمي:** [yunis-alafeef/TruthGuard-AI](https://github.com/yunis-alafeef/TruthGuard-AI)

---

## 📑 فهرس المحتويات
1. [المقدمة والرؤية التقنية](#1-المقدمة-والرؤية-التقنية)
2. [التحليل التقني: لماذا استبعدنا Render و Koyeb؟](#2-التحليل-التقني-لماذا-استبعدنا-render-و-koyeb)
3. [الخيار الأول (الموصى به والعملاق المجاني): Hugging Face Spaces](#3-الخيار-الأول-الموصى-به-والعملاق-المجاني-hugging-face-spaces)
4. [الخيار الثاني (الاستضافة السريعة بضغطة زر): منصة Zeabur](#4-الخيار-الثاني-الاستضافة-السريعة-بضغطة-زر-منصة-zeabur)
5. [الخيار الثالث: منصة Vercel للواجهة الأمامية](#5-الخيار-الثالث-منصة-vercel-للواجهة-الأمامية)
6. [جدول المقارنة التقنية الشاملة بين الاستضافات](#6-جدول-المقارنة-التقنية-الشاملة-بين-الاستضافات)
7. [حل مشكلة صلاحيات GitHub PAT ورفع الكود بنجاح](#7-حل-مشكلة-صلاحيات-github-pat-ورفع-الكود-بنجاح)
8. [ملفات التكوين المجهزة في المشروع (Dockerfile)](#8-ملفات-التكوين-المجهزة-في-المشروع-dockerfile)
9. [إعداد وتأمين مفتاح Google Gemini API مجاناً](#9-إعداد-وتأمين-مفتاح-google-gemini-api-مجاناً)
10. [قائمة المهام التنفيذية: ما المطلوب منك فعله الآن؟ (في 3 دقائق)](#10-قائمة-المهام-التنفيذية-ما-المطلوب-منك-فعله-الآن-في-3-دقائق)

---

## 1. المقدمة والرؤية التقنية

تم تصميم منصة **TruthGuard AI (حارس الحقيقة)** كمنظومة ذكاء اصطناعي احترافية لفحص الأخبار وكشف التضليل. تتكون المنصة من خادم موحد وسريع للغاية مبني بـ **Express + Node.js (TypeScript)** مع واجهة تفاعلية حديثة بـ **React 19 + Vite + Tailwind CSS**.

الهدف من هذا الدليل هو توفير **أفضل استضافة مجانية 100% حقيقية**، تعمل في جميع الدول (بما فيها اليمن والمنطقة العربية)، **بدون الحاجة لبطاقة بنكية (No Credit Card)**، و**بدون مشاكل السكون والتجمد البارد (Zero Cold Start)**.

---

## 2. التحليل التقني: لماذا استبعدنا Render و Koyeb؟

| المنصة | سبب الاستبعاد والمشكلة التقنية |
| :--- | :--- |
| **❌ Render Free** | 1. يدخل في وضع النوم بعد 15 دقيقة خمول، ويستغرق الاستيقاظ البارد ما بين **50 إلى 90 ثانية**.<br>2. تنتهي الحصة الشهرية (750 ساعة) سريعاً فيتوقف الموقع كلياً.<br>3. ذاكرة مخنوقة 512MB تتسبب في انهيار السيرفر بخطأ `OOM 137`. |
| **❌ Koyeb** | 1. تفرض حماية صارمة عبر Cloudflare Turnstile تمنع أحياناً مستخدمي بعض الدول العربية (مثل اليمن) من التسجيل أو إكمال التحقق.<br>2. في بعض المناطق قد تطلب بطاقة ائتمان للتحقق حتى في الباقة المجانية. |

---

## 3. الخيار الأول (الموصى به والعملاق المجاني): Hugging Face Spaces

منصة **Hugging Face Spaces** هي الخيار المجاني الأقوى والأكثر كرماً في العالم بلا منازع لمشاريع الذكاء الاصطناعي وتطبيقات Full-Stack:

### 🌟 مميزات استضافة Hugging Face Spaces:
- **16 جيجابايت RAM مجاناً للأبد!** (32 ضعف مساحة Render!).
- **2 نوى معالج vCPU حقيقي**.
- **100% مجانية للأبد دون طلب بطاقة بنكية (No Credit Card)**.
- **متاحة في جميع دول العالم (بما فيها اليمن) دون أي قيود جغرافية**.
- **دائمة التشغيل 24/7 (Always-On):** لا تنام بعد 15 دقيقة ولا تتجمد، وتستجيب فوراً للزوار دون تأخير.
- دعم كامل لحاويات **Docker** والمنفذ `7860`.
- رابط عام مباشر مع شهادة أمان SSL تلقائية مجاناً.

---

### 🚀 خطوات النشر على Hugging Face Spaces (في 3 دقائق فقط):

#### الخطوة 1: إنشاء مساحة جديدة (Create Space)
1. افتح الموقع وسجل مجاناً: [https://huggingface.co](https://huggingface.co) (يمكنك التسجيل بحساب Google أو GitHub).
2. اضغط على أيقونة ملفك الشخصي بالأعلى ثم اختر **New Space** أو توجه مباشرة إلى:  
   [https://huggingface.co/new-space](https://huggingface.co/new-space)
3. اضبط الخيارات التالية:
   - **Space name**: `truthguard-ai`
   - **License**: `mit`
   - **Space SDK**: اختر **Docker** ثم اختر **Blank**.
   - **Space Hardware**: اختر **CPU Basic (2 vCPU · 16 GB RAM · Free)**.
   - **Visibility**: اختر **Public**.
4. اضغط على زر **Create Space**.

#### الخطوة 2: إضافة مفتاح الذكاء الاصطناعي (Gemini API Key)
1. داخل الـ Space الجديد، اضغط على تبويب **Settings** بالأعلى.
2. انزل إلى قسم **Variables and secrets**.
3. اضغط على زر **New secret** وأضف:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: ضع مفتاحك المجاني من Google AI Studio.
4. اضغط **Save**.

#### الخطوة 3: رفع الكود وتشغيل التطبيق
لديك طريقتان في غاية السهولة:
- **الطريقة (أ) السريعة من المتصفح مباشرة:**
  1. في صفحة الـ Space، اذهب لتبويب **Files**.
  2. اضغط **Add file** > **Upload files**.
  3. اسحب ملفات المشروع (أهمها `Dockerfile` و `package.json` و `server.ts` ومجلد `src/`).
  4. اضغط **Commit changes to main**.
- **الطريقة (ب) عبر Git:**
  - انسخ رابط الـ Git الخاص بالـ Space وادفع إليه مباشرة:
    ```bash
    git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/truthguard-ai
    git push hf feat/free-cloud-deployment-guide:main
    ```

سيبدأ Hugging Face ببناء الـ Dockerfile وتشغيل التطبيق فوراً؛ وسيعمل على مدار الساعة دون توقف!

---

## 4. الخيار الثاني (الاستضافة السريعة بضغطة زر): منصة Zeabur

إذا أردت استضافة سحابية خفيفة ترتبط مباشرة بحساب GitHub:
1. توجه إلى [https://zeabur.com](https://zeabur.com) وسجل دخولك بـ **GitHub**.
2. اضغط **Create Project**.
3. اضغط **Deploy New Service** واختر **Git**.
4. اختر مستودعك `TruthGuard-AI`. سيكتشف Zeabur ملف `Dockerfile` تلقائياً.
5. في تبويب **Variables**، أضف `GEMINI_API_KEY` ومفتاحك.
6. في تبويب **Networking**، اضغط **Generate Domain** لتحصل على دومين مجاني دائم `*.zeabur.app`.

---

## 5. الخيار الثالث: منصة Vercel للواجهة الأمامية

تعتبر **Vercel** ([vercel.com](https://vercel.com)) أسرع شبكة عالمية مجانية لعرض واجهات React:
- بدون بطاقة بنكية.
- ربط فوري بمستودع GitHub.
- خيار مثالي لعرض الواجهة واستدعاء الـ API بسلاسة.

---

## 6. جدول المقارنة التقنية الشاملة بين الاستضافات

| المعيار | 🥇 Hugging Face Spaces | 🥈 Zeabur Free | ❌ Render Free (المرفوضة) |
| :--- | :--- | :--- | :--- |
| **الذاكرة (RAM)** | **16 GB RAM مجاناً للأبد!** | 512 MB | 512 MB (اختناق OOM) |
| **المعالج (CPU)** | **2 vCPU كاملة** | 0.5 vCPU | معالج مشترك بطيء |
| **السكون (Sleep/Idle)** | **دائم 24/7 دون أي نوم إطلاقاً** | استجابة سريعة | نوم إجباري 50-90 ثانية |
| **التوفر في اليمن والمنطقة** | ✅ متاح 100% بدون أي حظر | ✅ متاح | ⚠️ بطيء جداً |
| **طلب بطاقة ائتمان** | ❌ **لا يطلب بطاقة إطلاقاً** | ❌ لا يطلب | يطلب أحياناً للتحقق |
| **دعم Docker** | ✅ بيئة أصلية للمنفذ 7860 | ✅ مدعوم أصلياً | بطيء ومحدود |

---

## 7. حل مشكلة صلاحيات GitHub PAT ورفع الكود بنجاح

عند محاولة استخدام المفتاح الجديد المرسل:
`github_pat_11BK672ZI0XiTmZXvIDOMl_...`  
رد خادم GitHub بالخطأ التالي:
```json
{
  "message": "Resource not accessible by personal access token",
  "status": "403"
}
```

### 🔍 لماذا يظهر خطأ 403 رغم تأكيدك للصلاحيات؟
في نظام **Fine-grained personal access tokens** على GitHub:
1. يوجد خياران منفصلان تماماً يجب ضبط كلاهما:
   - **Repository access**: إذا كان مضبوطاً على `Public Repositories (read-only)`، فإن GitHub يرفض أي كتابة حتى لو فعلت الصلاحيات!
   - يجب تحويله إلى **"Only select repositories"** واختيار المستودع **`TruthGuard-AI`**.
2. وفي قسم **Repository permissions**، يجب تغيير **Contents** إلى **Read and write**.

### 💡 الحل الأسهل والأسرع والمضمون 100% (Token Classic):
بدلاً من تعقيدات الـ Fine-grained Beta، أنشئ **رمز كلاسيكي** في 30 ثانية ولن تواجه أي خطأ 403 إطلاقاً:
1. ادخل إلى الرابط المباشر:  
   👉 **[https://github.com/settings/tokens/new](https://github.com/settings/tokens/new)**
2. في خانة **Note** اكتب: `TruthGuard`
3. في خانة **Expiration** اختر: `30 days` أو المدة التي تفضلها.
4. ضع علامة صح `[✓]` على الخيار الأول: **`repo`** (Full control of private repositories).
5. انزل لأسفل الصفحة واضغط **Generate token**.
6. انسخ الرمز الذي يبدأ بـ **`ghp_...`** وضعه في التبويب داخل التطبيق، أو ارفعه فوراً بهذا الأمر:
   ```bash
   git push https://<YOUR_GHP_TOKEN>@github.com/yunis-alafeef/TruthGuard-AI.git 859a2ba:refs/heads/feat/free-cloud-deployment-guide
   ```

---

## 8. ملفات التكوين المجهزة في المشروع (Dockerfile)

تم تجهيز `Dockerfile` احترافي متعدد المراحل متوافق بالكامل مع **Hugging Face Spaces** والمنفذ `7860`:
- **مرحلة البناء (Builder):** تجمع أصول الواجهة والخادم بـ `pnpm` فائق السرعة.
- **مرحلة التشغيل (Runner):** صورة خفيفة جداً (~90MB) من Alpine Linux بمستخدم آمن `node` ومنافذ مكشوفة:
  ```dockerfile
  ENV PORT=7860
  EXPOSE 7860 3000
  HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:${PORT:-7860}/api/health || exit 1
  ```

---

## 9. إعداد وتأمين مفتاح Google Gemini API مجاناً

1. ادخل على: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. اضغط **Create API key**.
3. ضع المفتاح في إعدادات الاستضافة (Secret `GEMINI_API_KEY`). التطبيق مبرمج لقراءته تلقائياً وتفعيل نماذج Gemini 2.5 Flash للتحقق الفوري.

---

## 10. قائمة المهام التنفيذية: ما المطلوب منك فعله الآن؟ (في 3 دقائق)

- [ ] **الخطوة 1: إنشاء Space على Hugging Face**:
  - افتح [huggingface.co/new-space](https://huggingface.co/new-space).
  - الاسم: `truthguard-ai`، النوع: **Docker (Blank)**، العتاد: **CPU Basic (16GB RAM Free)**.

- [ ] **الخطوة 2: إضافة السر (GEMINI_API_KEY)**:
  - من تبويب **Settings** > **Variables and secrets** > أضف `GEMINI_API_KEY`.

- [ ] **الخطوة 3: رفع الملفات وتشغيل المنصة**:
  - ارفع ملف `Dockerfile` وملفات المشروع إلى الـ Space، وسيعمل موقعك فوراً بأقوى مواصفات مجانية في العالم وبسرعة فائقة دون نوم!

---

> 🚀 **منصة TruthGuard AI الآن جاهزة للتشغيل بأعلى كفاءة سحابية حقيقية مجانية 100%.**
