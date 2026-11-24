# مِنيو — قوائم الطعام

موقع ثابت على GitHub Pages يعرض قائمتَي الطعام بروابط مستقلة ورموز QR جاهزة للطباعة.

## الروابط بعد تفعيل Pages

| المحتوى | الرابط |
| --- | --- |
| الصفحة الرئيسية | https://mahmoudazmy2050-ui.github.io/cafe-Resturant/ |
| منيو Dobamina | https://mahmoudazmy2050-ui.github.io/cafe-Resturant/menus/dobamina/ |
| منيو Kalamantina | https://mahmoudazmy2050-ui.github.io/cafe-Resturant/menus/kalamantina/ |

## تفعيل النشر

من `Settings → Pages`: اختر **Deploy from a branch**، ثم `main` و `/ (root)`، واحفظ.
الروابط والرموز تعمل مباشرة بعد اكتمال النشر (دقيقة أو دقيقتان).

## الملفات

- `index.html` — الصفحة الرئيسية والبطاقات وأكواد QR.
- `menus/<slug>/index.html` — عارض الصفحات (تقليب، سحب، زوم، تحميل PDF).
- `menus/<slug>/pages/` — صفحات WebP مضغوطة بجودة عالية.
- `downloads/` — نسخ PDF متحسّنة بنفس أبعاد الأصل للتحميل والطباعة.
- `assets/qr/` — رموز QR بصيغة PNG بدقة 1024×1024 لتُطبع على الطاولات.

## تحديث منيو لاحقاً

1. استبدل الصور داخل `menus/<slug>/pages/` مع الحفاظ على أسماء `page-01.webp` ... إلخ.
2. حدّث `data-count` وعدد الصفحة في `menus/<slug>/index.html` و `index.html` ووصف الـ meta.
3. استبدل ملف الـ PDF في `downloads/` وصورة الغلاف في `assets/covers/`.
4. إذا تغيّر الرابط، أعد توليد رمز QR من `assets/qr/`.

الأصول الأصلية غير المضغوطة محفوظة محلياً في `_backup_originals` خارج هذا الريبو.
