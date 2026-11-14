# MVP Plan: Patient Tracking System (Shadcn UI & Audit Log)

## 📌 Project Overview
A patient medical record and eye injection tracking desktop application built with **Electron + React + TypeScript + SQLite**.
The system includes secure **Authentication (Login)**, **Role-Based Access Control (Admin / Employee)**, and a comprehensive **Activity Log (Audit Trail)** to track every action performed in the system.
The UI is styled with **Tailwind CSS + Shadcn UI components** in clean Dark/Slate aesthetics (similar to `D:\alhady`).

---

## 👥 Users, Roles & Permissions

### User Roles
1. **مدير (Admin)**:
   - كامل الصلاحيات في النظام (Full Access).
   - تسجيل الدخول وإدارة المستخدمين والموظفين (إضافة/تعديل/تعطيل).
   - إدارة الأطباء، الدول، المحافظات، وأنواع الحقن.
   - إضافة، تعديل، وحذف سجلات المرضى.
   - استعراض سجل النشاطات الكامل (Activity Audit Log) مع التصفية والبحث.
   - تقارير وإحصائيات عامة.

2. **موظف (Employee)**:
   - تسجيل الدخول بحسابه الخاص.
   - تسجيل المرضى الجدد ومتابعة حقنهم.
   - تحديث عدد الجرعات المعطاة للمريض (Administered Doses).
   - البحث واستعراض قائمة المرضى.
   - منع حذف المرضى أو الوصول لإدارة الموظفين أو سجل العمليات الإدارية.
   - يتم تسجيل وتوثيق أي حركة يقوم بها تلقائياً في الـ Activity Log.

---

## 🗄️ Core Data Model & SQLite Schema

```sql
-- 1. جدول المستخدمين والموظفين
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT CHECK(role IN ('admin', 'employee')) NOT NULL DEFAULT 'employee',
  status TEXT CHECK(status IN ('active', 'inactive')) NOT NULL DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. جدول سجل النشاطات (Activity Audit Log)
CREATE TABLE activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  action TEXT NOT NULL, -- 'LOGIN', 'LOGOUT', 'CREATE_PATIENT', 'UPDATE_DOSES', 'DELETE_PATIENT', etc.
  entity_type TEXT NOT NULL, -- 'patient', 'user', 'doctor', 'auth'
  entity_id TEXT,
  details TEXT, -- JSON أو وصف للعملية والتغييرات
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 3. جدول الأطباء
CREATE TABLE doctors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
);

-- 4. جدول الدول
CREATE TABLE countries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);

-- 5. جدول المحافظات
CREATE TABLE provinces (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  country_id INTEGER,
  FOREIGN KEY (country_id) REFERENCES countries(id)
);

-- 6. جدول أنواع الحقن
CREATE TABLE injection_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);

-- 7. جدول المرضى ومتابعة الحقن
CREATE TABLE patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  age INTEGER,
  phone TEXT,
  national_id TEXT,
  country_id INTEGER NOT NULL DEFAULT 1,
  province_id INTEGER,
  eye_side TEXT CHECK(eye_side IN ('right', 'left', 'both')),
  injection_side TEXT CHECK(injection_side IN ('right', 'left', 'both')),
  injection_type_id INTEGER,
  total_doses INTEGER DEFAULT 0,
  administered_doses INTEGER DEFAULT 0,
  remaining_doses INTEGER GENERATED ALWAYS AS (total_doses - administered_doses) VIRTUAL,
  status TEXT CHECK(status IN ('review', 'complication', 'pending')) DEFAULT 'review',
  doctor_id INTEGER NOT NULL,
  created_by INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (country_id) REFERENCES countries(id),
  FOREIGN KEY (province_id) REFERENCES provinces(id),
  FOREIGN KEY (injection_type_id) REFERENCES injection_types(id),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

---

## 🔄 User Flows

### Flow 1: Authentication (تسجيل الدخول)
1. تشغيل التطبيق وفتح شاشة الدخول (Login Dialog / Card).
2. إدخال اسم المستخدم وكلمة المرور.
3. التحقق من البيانات وتنشيط الحساب، وتسجيل عملية `LOGIN` في جدول `activity_logs`.
4. توجيه المستخدم للواجهة المناسبة حسب الرتبة (Admin / Employee).

### Flow 2: Creating a New Patient (تسجيل مريض جديد)
1. **اختيار الطبيب المشرف**: قائمة منسدلة من جدول الأطباء.
2. **اختيار الدولة والمحافظة**:
   - اختيار الدولة من القائمة (الافتراضي: العراق).
   - عند اختيار العراق: تظهر قائمة المحافظات التابعة للعراق.
   - عند اختيار غير العراق: يتم إخفاء أو تعطيل حقل المحافظة.
3. **بيانات المريض الأساسية**: الاسم، العمر، رقم الهاتف، الرقم الوطني.
4. **جهة العين وجهة الحقن**:
   - جهة العين: يمين (ين) / يسار (يس) / كلاهما (يمين ويسار معاً).
   - جهة الحقن: يمين (ين) / يسار (يس) / كلاهما (يمين ويسار).
5. **تفاصيل الحقن**:
   - نوع الحقنة من جدول `injection_types`.
   - إجمالي الجرعات المطلوبة.
   - الجرعات المعطاة مبدئياً (تبدأ من 0).
   - الحالة المبدئية: مراجعة (Review) / مضاعفات (Complication) / قيد الانتظار (Pending).
6. **الحفظ والتوثيق**:
   - حفظ السجل في SQLite.
   - ربط السجل بالمستخدم الحالي (`created_by = current_user.id`).
   - تسجيل حركة فورية في `activity_logs` توثق اسم الموظف والعملية `CREATE_PATIENT`.

### Flow 3: Activity Audit Log (سجل النشاطات للمدير)
- شاشة خاصة للأدمن لعرض جدول زمني (Audit Timeline / Table):
  - اسم الموظف / المستخدم.
  - نوع العملية (تسجيل دخول، إضافة مريض، تعديل جرعة، إلخ).
  - الكيان المتأثر (رقم واسم المريض).
  - التفاصيل والتاريخ والوقت بدقة.
  - خيارات التصفية حسب الموظف، نوع العملية، والتاريخ.

---

## 🎨 UI Design: Shadcn / Tailwind Components (مثل D:\alhady)

### Design Specifications
- **Framework**: Tailwind CSS v3 + `clsx` + `tailwind-merge` + `lucide-react`.
- **Theme**: Dark Slate Modern Palette (`slate-950`, `slate-900`, `slate-800`, `slate-700`, accents in `indigo-500` / `blue-500` / `emerald-500`).
- **Typography & Direction**: خطوط نظام نظيفة ومتناسقة مع دعم كامل لاتجاه اليمين لليسار `dir="rtl"`.
- **Reusable Shadcn Components**:
  - `Button`: أزرار متناسقة بحالات (primary, destructive, outline, secondary, ghost).
  - `Input` & `Label`: حقول إدخال بتصميم حديث مع رسائل خطأ وتلميحات.
  - `Select` / `Dropdown`: قوائم اختيار حديثة للأطباء والدول والمحافظات.
  - `Card`: بطاقات بتأثيرات حواف ناعمة وخلفيات معتمة (Glass / Dark Slate).
  - `Badge`: شارات للحالات (مراجعة: أزرق، مضاعفات: أحمر، قيد الانتظار: أصفر).
  - `Table`: جدول بيانات متقدم لعرض المرضى وسجل النشاطات.
  - `Dialog` / `Modal`: نوافذ منبثقة لتأكيد العمليات والتعديل السريع.

---

## 🚀 IPC Channels & Handlers (Electron Main Process)

### 1. Auth & Users IPC
- `auth:login(credentials)`: التحقق وتوليد الجلسة وتسجيل حركة الدخول.
- `auth:logout(userId)`: إنهاء الجلسة وتسجيل الخروج.
- `users:getAll()`: جلب قائمة الموظفين (Admin فقط).
- `users:create(userData)`: إنشاء موظف جديد (Admin فقط).
- `users:toggleStatus(userId)`: تفعيل/تعطيل موظف.

### 2. Activity Log IPC
- `activity:getLogs(filter)`: استعلام سجل النشاطات مع التصفية والترتيب.
- `activity:logAction(entry)`: دالة مساعدة مركزية لتوثيق أي حركة.

### 3. Patient Tracking IPC
- `patients:getAll(filter)`: جلب المرضى مع أسماء الأطباء والمحافظات.
- `patients:create(patientData)`: إضافة مريض مع تسجيل لوغ تلقائي.
- `patients:updateDoses(patientId, administeredDoses)`: تحديث جرعات المريض.
- `patients:delete(patientId)`: حذف مريض (Admin فقط مع توثيق الحذف).

### 4. Metadata IPC
- `metadata:getDoctors()`: قائمة الأطباء.
- `metadata:getCountries()`: قائمة الدول.
- `metadata:getProvinces(countryId)`: جلب المحافظات حسب الدولة.
- `metadata:getInjectionTypes()`: أنواع الحقن.

---

## 🌱 Initial Seed Data (البيانات الأولية)

### Users:
1. **Admin**:
   - الاسم: المدير العام
   - اسم المستخدم: `admin`
   - كلمة المرور: `admin123`
   - الرتبة: `admin`
2. **Employee**:
   - الاسم: أحمد الموظف
   - اسم المستخدم: `user`
   - كلمة المرور: `user123`
   - الرتبة: `employee`

### Countries:
- العراق (Iraq - id=1)

### Iraq Provinces:
- بغداد، نينوى، البصرة، أربيل، كركوك، السليمانية، كربلاء، النجف، الأنبار، بابل، ديالي، واسط، ميسان، ذي قار، المثنى، القادسية، صلاح الدين، دهوك.

### Sample Doctors:
- د. أحمد مصطفى
- د. سامي عبد الله
- د. ليلى كريم

### Injection Types:
- حقن داخل العين (Intravitreal)
- تحت الملتحمة (Subconjunctival)
- تحت الجلد (Subcutaneous)
- وريدي (Intravenous)
- عضلي (Intramuscular)
