# مِنيو — صفحتان مستقلتان

صفحتان منفصلتان تماماً، لكل واحدة رابطها ورمز QR خاص بها. لا توجد صفحة تجمعهما معاً ولا روابط بينهما.

## الروابط بعد تفعيل Pages

| المنيو | الرابط |
| --- | --- |
| صفحة دخول بسيطة (روابط فقط) | https://mahmoudazmy2050-ui.github.io/cafe-Resturant/ |
| Dobamina | https://mahmoudazmy2050-ui.github.io/cafe-Resturant/dobamina/ |
| Kalamantina | https://mahmoudazmy2050-ui.github.io/cafe-Resturant/kalamantina/ |

> رموز QR المطبوعة تشير إلى الرابطين نفسهما مع `?v=4` لتفادي نسخة المتصفح القديمة المحفوظة (Cache-Control: max-age=600). الرابط بدون البارامتر يعمل بشكل طبيعي بعد انتهاء مدة الحفظ.

## تفعيل النشر

من `Settings → Pages`: اختر **Deploy from a branch**، ثم `main` و `/ (root)`، واحفظ.
الروابط والرموز تعمل مباشرة بعد اكتمال النشر (دقيقة أو دقيقتان).

## الملفات

- `dobamina/index.html` — الصفحة الجميلة المستقلة لـ Dobamina (غلاف + QR + فتح المنيو + تحميل PDF).
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
