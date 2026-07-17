# خطة إكمال التطبيق وربطه بالخلفية

## 1. تفعيل Lovable Cloud

تفعيل قاعدة البيانات والمصادقة قبل أي تعديل على الكود.

## 2. المصادقة (المعلنون فقط)

- تسجيل الدخول عبر **Google** فقط عبر broker الخاص بـ Lovable (`lovable.auth.signInWithOAuth`).
- صفحة عامة `/auth` مع زر «الدخول بحساب Google» + شاشة استقبال.
- حماية جميع الصفحات الحالية بنقلها إلى `src/routes/_authenticated/` (index، favorites، messages، campaigns، account، campaign.new، campaign.payment، influencer.$id).
- إبقاء `/` كصفحة هبوط عامة موجزة للزوار غير المسجلين + إعادة توجيه للمعلنين المسجلين إلى لوحتهم، أو جعل `/` نفسه محمياً وإضافة `/welcome` عامة. سأختار الخيار الثاني لبساطة التنقل الحالي.
- عرض حالة الجلسة في الهيدر (اسم/صورة + خروج) وربط زر «تسجيل الخروج» في `/account` بـ `supabase.auth.signOut` مع تنظيف الكاش.

## 3. مخطط قاعدة البيانات (migrations + GRANT + RLS)

- `profiles` (id=auth.uid، full_name، company_name، industry، website، description، phone، avatar_url) — trigger لإنشائه عند التسجيل.
- `influencers` (id, name, category, city, followers, rating, price, image, verified, bio, platforms jsonb, works jsonb) — قراءة عامة (`TO anon SELECT`).
- `campaigns` (id, advertiser_id, name, goal, budget, spent, status, start_date, end_date, platforms text[], content_type, deliverables, notes) — RLS: المالك فقط.
- `campaign_influencers` (campaign_id, influencer_id, status) — RLS عبر ملكية الحملة.
- `favorites` (user_id, influencer_id) — RLS: المالك.
- `conversations` (id, advertiser_id, influencer_id, campaign_id) + `messages` (conversation_id, sender, body, created_at) — RLS: المالك.
- `payments` (id, campaign_id, advertiser_id, amount, fee, tax, total, method, provider='chargily', provider_ref, status) — RLS: المالك.
- Seed migration ينقل بيانات `mock-influencers.ts` إلى جدول `influencers`.

## 4. طبقة البيانات (Server Functions)

- `src/lib/influencers.functions.ts`: `listInfluencers`, `getInfluencer` (عام عبر publishable client).
- `src/lib/campaigns.functions.ts`: `listMyCampaigns`, `createCampaign`, `getCampaign` (محمية).
- `src/lib/favorites.functions.ts`: `listFavorites`, `toggleFavorite`.
- `src/lib/messages.functions.ts`: `listConversations`, `getMessages`, `sendMessage`.
- `src/lib/profile.functions.ts`: `getMyProfile`, `updateMyProfile`.
- `src/lib/payments.functions.ts`: `createChargilyCheckout`, `getPaymentStatus`.
- استخدام TanStack Query (`ensureQueryData` في loader + `useSuspenseQuery` في المكون) مع `errorComponent`/`notFoundComponent` لكل route.

## 5. تكامل Chargily Pay

- سر `CHARGILY_API_KEY` + `CHARGILY_WEBHOOK_SECRET` عبر `add_secret`.
- Server function `createChargilyCheckout` ينشئ Checkout ويعيد رابط الدفع → توجيه المستخدم.
- Server route عام `src/routes/api/public/chargily-webhook.ts` للتحقق من التوقيع وتحديث حالة `payments` + إنشاء الحملة/المحادثات عند النجاح.
- صفحتا رجوع: `/campaign/payment/success` و`/campaign/payment/cancel`.

## 6. النماذج والتحقق

- إضافة **zod** + **react-hook-form** لنماذج `campaign.new` و`account` (فعلياً موجودة UI فقط).
- رسائل خطأ عربية، تعطيل الزر أثناء الإرسال، `toast` للنجاح/الفشل.

## 7. حالات التحميل والأخطاء

- `pendingComponent` هيكلي (skeletons) موحّد يعيد استخدام أنماط البطاقات الحالية.
- `errorComponent` موحّد + `notFoundComponent` في كل route.
- Root `notFoundComponent` عربي.

## 8. التنقل والإصلاحات

- ربط بطاقات المؤثرين والحملات فعلياً بالبيانات الحيّة.
- ربط زر «إنشاء حملة» في الحالات الفارغة.
- تدفق الدفع: `campaign.new` → إنشاء سجل حملة draft → `campaign.payment` (Chargily) → webhook يفعّلها → إعادة توجيه إلى `/messages` مع محادثات مُنشأة.
- التأكد من صحة أسماء الروابط (`to`/`params`) في كل مكان.

## 9. الاستجابة والجاهزية للنشر

- مراجعة كل صفحة على 375px و768px و1280px.
- إضافة meta لكل route (title/description/og موجودة جزئياً — استكمالها).
- فحص `code--dependency_scan` و`security--run_security_scan` قبل النهاية.

## تفاصيل تقنية

```text
src/
├── routes/
│   ├── __root.tsx                    (Header ديناميكي + Toaster + Query provider)
│   ├── welcome.tsx                   (هبوط عام)
│   ├── auth.tsx                      (Google sign-in)
│   ├── auth.callback.tsx             (استقبال الجلسة)
│   ├── _authenticated/
│   │   ├── route.tsx                 (مُدار — ssr:false)
│   │   ├── index.tsx                 (نقل من routes/index.tsx)
│   │   ├── favorites.tsx
│   │   ├── messages.tsx
│   │   ├── campaigns.tsx
│   │   ├── account.tsx
│   │   ├── influencer.$id.tsx
│   │   ├── campaign.new.tsx
│   │   ├── campaign.payment.tsx
│   │   ├── campaign.payment.success.tsx
│   │   └── campaign.payment.cancel.tsx
│   └── api/public/
│       └── chargily-webhook.ts
├── lib/
│   ├── *.functions.ts                (server fns أعلاه)
│   └── chargily.server.ts            (SDK wrapper)
└── integrations/supabase/*           (مُدارة)
```

الأسرار المطلوبة من المستخدم: `CHARGILY_API_KEY`, `CHARGILY_WEBHOOK_SECRET` (سيُطلب داخل build mode عبر `add_secret`).

هل أبدأ التنفيذ؟ ارد تعديل بسيط وهو تسجيل الدخول فقط عندما محاولة القيام بإنشاء حملة مع مؤثر  معين وليس قبلها تبقى الرئيسية تظهر بشكل عادي للتصفح  فهمت تأكد من هذه النقطة 