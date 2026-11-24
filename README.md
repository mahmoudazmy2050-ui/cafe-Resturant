# مِنيو — صفحتان مستقلتان

صفحتان منفصلتان تماماً، لكل واحدة رابطها ورمز QR خاص بها. لا توجد صفحة تجمعهما معاً ولا روابط بينهما.

## الروابط بعد تفعيل Pages

| المنيو | الرابط |
| --- | --- |
| Dobamina | https://mahmoudazmy2050-ui.github.io/cafe-Resturant/dobamina/ |
| Kalamantina | https://mahmoudazmy2050-ui.github.io/cafe-Resturant/kalamantina/ |

## تفعيل النشر

من `Settings → Pages`: اختر **Deploy from a branch**، ثم `main` و `/ (root)`، واحفظ.
الروابط والرموز تعمل مباشرة بعد اكتمال النشر (دقيقة أو دقيقتان).

## الملفات

- `dobamina/index.html` — صفحة Dobamina المستقلة (عارض صفحات + زر QR + تحميل PDF).
- `kalamantina/index.html` — صفحة Kalamantina المستقلة.
- `<slug>/pages/` — صفحات WebP مضغوطة بجودة عالية.
- `downloads/` — نسخ PDF متحسّنة بنفس أبعاد الأصل للتحميل والطباعة.
- `assets/qr/` — رمز QR لكل صفحة بدقة 1024×1024، ويظهر أيضاً داخل الصفحة عبر زر QR.
- `assets/css/viewer.css` و `assets/js/menu-viewer.js` — ملفات تشغيل داخلية مشتركة، غير مرتبطة ببعضها من حيث العرض.

## تحديث منيو لاحقاً

1. استبدل الصور داخل `<slug>/pages/` مع الحفاظ على أسماء `page-01.webp` ... إلخ.
2. حدّث `data-count` وعدد الصفحة في `<slug>/index.html` ووصف الـ meta.
3. استبدل ملف الـ PDF في `downloads/`.
4. إذا تغيّر الرابط، أعد توليد رمز QR في `assets/qr/`.

الأصول الأصلية غير المضغوطة محفوظة محلياً في `_backup_originals` خارج هذا الريبو.
