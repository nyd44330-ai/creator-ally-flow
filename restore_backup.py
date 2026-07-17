#!/usr/bin/env python3
"""
سكريبت استعادة النسخة الاحتياطية من Supabase القديم إلى الجديد
يجب تشغيله على جهازك المحلي حيث لديك pg_restore مثبت

استخدام:
    python3 restore_backup.py creator-ally-flow_260717.backup "postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
"""

import subprocess
import sys
import os

def restore_backup(backup_file, connection_string):
    """استعادة ملف النسخة الاحتياطية إلى Supabase"""
    
    if not os.path.exists(backup_file):
        print(f"❌ خطأ: الملف '{backup_file}' غير موجود")
        sys.exit(1)
    
    if not connection_string:
        print("❌ خطأ: لم يتم تقديم connection string")
        sys.exit(1)
    
    print(f"🔄 جاري استعادة البيانات من: {backup_file}")
    print(f"📍 الوجهة: Supabase")
    print()
    
    # أمر pg_restore مع الخيارات المطلوبة
    cmd = [
        'pg_restore',
        '--verbose',
        '--no-owner',
        '--no-privileges',
        '--clean',
        '--if-exists',
        f'--host={extract_host(connection_string)}',
        f'--port={extract_port(connection_string)}',
        f'--username={extract_user(connection_string)}',
        f'--dbname={extract_db(connection_string)}',
        backup_file
    ]
    
    # إعداد متغير البيئة للكلمة السرية
    env = os.environ.copy()
    env['PGPASSWORD'] = extract_password(connection_string)
    
    try:
        result = subprocess.run(cmd, env=env, capture_output=False)
        
        if result.returncode == 0:
            print()
            print("=" * 60)
            print("✅ نجحت عملية الاستعادة!")
            print("=" * 60)
            print()
            print("الخطوة التالية:")
            print("1. اذهب إلى Supabase Dashboard")
            print("2. اختر المشروع الجديد")
            print("3. اذهب إلى Authentication → Providers → Google")
            print("4. ادخل نفس Google OAuth credentials من المشروع القديم")
            return True
        else:
            print()
            print("❌ فشلت عملية الاستعادة")
            return False
            
    except FileNotFoundError:
        print("❌ خطأ: pg_restore غير مثبت!")
        print()
        print("التثبيت:")
        print("  macOS:  brew install postgresql")
        print("  Ubuntu: sudo apt-get install postgresql-client")
        print("  Windows: https://www.postgresql.org/download/windows/")
        sys.exit(1)
    except Exception as e:
        print(f"❌ خطأ: {e}")
        sys.exit(1)

def extract_host(conn_str):
    """استخراج hostname من connection string"""
    import re
    match = re.search(r'@([\w.-]+)', conn_str)
    return match.group(1) if match else 'localhost'

def extract_port(conn_str):
    """استخراج port من connection string"""
    import re
    match = re.search(r':(\d+)/', conn_str)
    return match.group(1) if match else '5432'

def extract_user(conn_str):
    """استخراج username من connection string"""
    import re
    match = re.search(r'postgres://([^:]+):', conn_str)
    return match.group(1) if match else 'postgres'

def extract_password(conn_str):
    """استخراج password من connection string"""
    import re
    match = re.search(r':([^@]+)@', conn_str)
    return match.group(1) if match else ''

def extract_db(conn_str):
    """استخراج database name من connection string"""
    import re
    match = re.search(r'/(\w+)$', conn_str)
    return match.group(1) if match else 'postgres'

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("استخدام:")
        print(f"  python3 {sys.argv[0]} <backup_file> <connection_string>")
        print()
        print("مثال:")
        print(f'  python3 {sys.argv[0]} creator-ally-flow_260717.backup "postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres"')
        sys.exit(1)
    
    backup_file = sys.argv[1]
    connection_string = sys.argv[2]
    
    restore_backup(backup_file, connection_string)
