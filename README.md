# مِنيو — صفحتان مستقلتان

صفحتان منفصلتان تماماً، لكل واحدة رابطها ورمز QR خاص بها. لا توجد صفحة تجمعهما معاً ولا روابط بينهما.

## الروابط بعد تفعيل Pages

| المنيو | الرابط |
| --- | --- |
| صفحة دخول بسيطة (روابط فقط) | https://mahmoudazmy2050-ui.github.io/cafe-Resturant/ |
| Dopamina | https://mahmoudazmy2050-ui.github.io/cafe-Resturant/dopamina/ |
| Kalamantina | https://mahmoudazmy2050-ui.github.io/cafe-Resturant/kalamantina/ |

> رموز QR المطبوعة تشير إلى الرابطين نفسهما مع `?v=5` لتفادي نسخة المتصفح القديمة المحفوظة (Cache-Control: max-age=600). الرابط بدون البارامتر يعمل بشكل طبيعي بعد انتهاء مدة الحفظ.

> الاسم الصحيح هو **Dopamina**. الروابط القديمة بالاسم `Dobamina` لسه شغّالة: `dobamina/` بيعمل تحويل تلقائي لـ `dopamina/` (ومعاه `menu/` ورقم الصفحة)، ونسخة `downloads/Dobamina_Menu_compressed.pdf` محفوظة عشان كيورات التحميل/العرض القديمة ما تنكسرش. الكيورات الجديدة كلها بقت على الاسم الصحيح.

## كيور ارات تحميل PDF مباشر

ملفان منفصلان عن كيور الصفحات (اللي بتفتح اللاندنج):

- `assets/qr/dopamina-pdf-qr.png` → `https://raw.githubusercontent.com/mahmoudazmy2050-ui/cafe-Resturant/main/downloads/Dopamina_Menu_compressed.pdf`
- `assets/qr/kalamantina-pdf-qr.png` → `https://raw.githubusercontent.com/mahmoudazmy2050-ui/cafe-Resturant/main/downloads/Kalamantina_Menu_compressed.pdf`

روابط `raw.githubusercontent.com` بترجع بصيغة `application/octet-stream`، فالجوال بينزّل الملف فور مسح الرمز. رابط PDF على GitHub Pages بيفتح عارض PDF جوه المتصفح بدل التحميل المباشر. لو اتغيّر اسم الملف أو الفرع، لازم تتولّد الكيورات دي من جديد.

## كيور ارات عرض PDF جوه المتصفح

ملفان كمان للعرض بدون تحميل:

- `assets/qr/dopamina-view-qr.png` → `https://mahmoudazmy2050-ui.github.io/cafe-Resturant/downloads/Dopamina_Menu_compressed.pdf`
- `assets/qr/kalamantina-view-qr.png` → `https://mahmoudazmy2050-ui.github.io/cafe-Resturant/downloads/Kalamantina_Menu_compressed.pdf`

دي بترجع بصيغة `application/pdf`، فالمتصفح يفتح عارض PDF مباشرة من غير ما ينزّل الملف.

## تفعيل النشر

من `Settings → Pages`: اختر **Deploy from a branch**، ثم `main` و `/ (root)`، واحفظ.
الروابط والرموز تعمل مباشرة بعد اكتمال النشر (دقيقة أو دقيقتان).

## الملفات

- `dopamina/index.html` — الصفحة الجميلة المستقلة لـ Dopamina (غلاف + QR + فتح المنيو + تحميل PDF).
- `kalamantina/index.html` — الصفحة الجميلة المستقلة لـ Kalamantina.
- `<slug>/menu/index.html` — عارض الصفحات الخاص بكل منيو.
- `<slug>/menu/pages/` — صفحات WebP مضغوطة بجودة عالية.
- `downloads/` — نسخ PDF متحسّنة بنفس أبعاد الأصل للتحميل والطباعة.
- `assets/qr/` — رمز QR لكل صفحة بدقة 1024×1024، ويظهر أيضاً داخل الصفحة عبر زر QR.
- `assets/css/viewer.css` و `assets/js/menu-viewer.js` — ملفات تشغيل داخلية مشتركة، غير مرتبطة ببعضها من حيث العرض.

## تحديث منيو لاحقاً

1. استبدل الصور داخل `<slug>/menu/pages/` مع الحفاظ على أسماء `page-01.webp` ... إلخ.
2. حدّث `data-count` في `<slug>/menu/index.html`، وعدد الصفحات في `<slug>/index.html` ووصف الـ meta.
3. استبدل ملف الـ PDF في `downloads/`.
4. إذا تغيّر الرابط، أعد توليد رمز QR في `assets/qr/`.

الأصول الأصلية غير المضغوطة محفوظة محلياً في `_backup_originals` خارج هذا الريبو.
