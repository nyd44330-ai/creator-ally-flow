#!/bin/bash

# سكريبت استعادة النسخة الاحتياطية من Supabase القديم إلى الجديد
# استخدام: ./restore_backup.sh creator-ally-flow_260717.backup "postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres"

BACKUP_FILE="${1:?Error: Backup file required}"
CONNECTION_STRING="${2:?Error: Connection string required}"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ خطأ: الملف '$BACKUP_FILE' غير موجود"
    exit 1
fi

echo "🔄 جاري استعادة البيانات..."
echo "📁 الملف: $BACKUP_FILE"
echo "📍 الوجهة: Supabase"
echo ""

# تشغيل pg_restore مع الخيارات المطلوبة
pg_restore \
    --verbose \
    --no-owner \
    --no-privileges \
    --clean \
    --if-exists \
    --dbname="$CONNECTION_STRING" \
    "$BACKUP_FILE"

EXIT_CODE=$?

echo ""
echo "=========================================="

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ نجحت عملية الاستعادة!"
    echo "=========================================="
    echo ""
    echo "الخطوة التالية:"
    echo "1. اذهب إلى Supabase Dashboard"
    echo "2. اختر المشروع الجديد"
    echo "3. اذهب إلى Authentication → Providers → Google"
    echo "4. ادخل نفس Google OAuth credentials"
else
    echo "❌ فشلت عملية الاستعادة (الكود: $EXIT_CODE)"
    echo "=========================================="
    echo ""
    echo "تأكد من:"
    echo "✓ pg_restore مثبت: which pg_restore"
    echo "✓ Connection string صحيح"
    echo "✓ الجداول موجودة في Supabase"
fi

exit $EXIT_CODE
