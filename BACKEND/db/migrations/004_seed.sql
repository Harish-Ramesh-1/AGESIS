-- 004_seed.sql
-- Demo data matching the frontend's demo credentials + baseline config rows

-- ========== ROLES ==========
insert into roles (name, description, portal, permissions, is_system) values
  ('Parent', 'Parent portal access', 'parent', '["fees:view","payments:pay","documents:view"]', true),
  ('Accountant', 'Accountant portal access', 'accountant', '["fees:manage","payments:manage","documents:manage","reports:view"]', true),
  ('Super Admin', 'Full administrative access', 'admin', '["*"]', true)
on conflict (name) do nothing;

-- ========== DEMO USERS (OTP-based login is primary; no password set) ==========
insert into users (portal, unique_id, email, phone, full_name, password_hash, role_id, status)
values
  ('parent', 'P-12345', 'parent.demo@agesisschool.edu', '+919800000001', 'Ravi Kumar',
    null, (select id from roles where name = 'Parent'), 'active'),
  ('accountant', 'ACC1023', 'accountant.demo@agesisschool.edu', '+919800000002', 'Ananya Sharma',
    null, (select id from roles where name = 'Accountant'), 'active'),
  ('admin', 'ADM1001', 'admin.demo@agesisschool.edu', '+919800000003', 'Vikram Singh',
    null, (select id from roles where name = 'Super Admin'), 'active')
on conflict (portal, email) do nothing;

-- ========== ACADEMIC ==========
insert into academic_years (label, start_date, end_date, is_current)
values ('2025-2026', '2025-06-01', '2026-04-30', true)
on conflict do nothing;

insert into classes_sections (class_name, section, class_teacher, capacity, academic_year_id, student_count)
select v.class_name, v.section, v.class_teacher, 40, (select id from academic_years where is_current = true limit 1), v.student_count
from (values
  ('5', 'A', 'Mrs. Fernandes', 32),
  ('6', 'B', 'Mr. Iyer', 28),
  ('7', 'A', 'Ms. Rao', 30)
) as v(class_name, section, class_teacher, student_count)
on conflict do nothing;

-- ========== STUDENTS (linked to demo parent) ==========
insert into students (admission_no, full_name, dob, gender, class_name, section, academic_year_id, parent_user_id, guardian_name, guardian_phone, guardian_email, status)
select 'ADM-2025-0001', 'Aarav Kumar', '2014-03-12', 'Male', '7', 'A',
  (select id from academic_years where is_current = true limit 1),
  (select id from users where unique_id = 'P-12345'),
  'Ravi Kumar', '+919800000001', 'parent.demo@agesisschool.edu', 'active'
where not exists (select 1 from students where admission_no = 'ADM-2025-0001');

insert into students (admission_no, full_name, dob, gender, class_name, section, academic_year_id, parent_user_id, guardian_name, guardian_phone, guardian_email, status)
select 'ADM-2025-0002', 'Diya Kumar', '2016-08-22', 'Female', '5', 'A',
  (select id from academic_years where is_current = true limit 1),
  (select id from users where unique_id = 'P-12345'),
  'Ravi Kumar', '+919800000001', 'parent.demo@agesisschool.edu', 'active'
where not exists (select 1 from students where admission_no = 'ADM-2025-0002');

-- ========== FEE CATEGORIES / STRUCTURE ==========
insert into fee_categories (name, taxable, tax_rate) values
  ('Tuition Fee', false, 0),
  ('Transport Fee', false, 0),
  ('Library Fee', false, 0),
  ('Lab Fee', false, 0)
on conflict (name) do nothing;

insert into fee_structures (name, class_name, academic_year_id, components, total_amount, status, created_by)
select 'Class 7 - Standard Fee Plan', '7', (select id from academic_years where is_current = true limit 1),
  '[{"category":"Tuition Fee","amount":45000},{"category":"Transport Fee","amount":12000},{"category":"Library Fee","amount":2000},{"category":"Lab Fee","amount":3000}]'::jsonb,
  62000, 'active', (select id from users where unique_id = 'ACC1023')
where not exists (select 1 from fee_structures where name = 'Class 7 - Standard Fee Plan');

insert into fee_structures (name, class_name, academic_year_id, components, total_amount, status, created_by)
select 'Class 5 - Standard Fee Plan', '5', (select id from academic_years where is_current = true limit 1),
  '[{"category":"Tuition Fee","amount":38000},{"category":"Transport Fee","amount":12000},{"category":"Library Fee","amount":1500}]'::jsonb,
  51500, 'active', (select id from users where unique_id = 'ACC1023')
where not exists (select 1 from fee_structures where name = 'Class 5 - Standard Fee Plan');

insert into student_fee_assignments (student_id, fee_structure_id, components, total_amount, assigned_by)
select s.id, fs.id, fs.components, fs.total_amount, (select id from users where unique_id = 'ACC1023')
from students s
join fee_structures fs on fs.class_name = s.class_name
where s.admission_no in ('ADM-2025-0001', 'ADM-2025-0002')
and not exists (select 1 from student_fee_assignments where student_id = s.id);

-- ========== DUES ==========
insert into dues (student_id, fee_structure_id, description, amount_due, amount_paid, due_date, status)
select s.id, sfa.fee_structure_id, 'Term 2 Fee Installment', sfa.total_amount / 2, 0, (current_date + interval '15 days')::date, 'pending'
from students s join student_fee_assignments sfa on sfa.student_id = s.id
where s.admission_no = 'ADM-2025-0001'
and not exists (select 1 from dues where student_id = s.id);

insert into dues (student_id, fee_structure_id, description, amount_due, amount_paid, due_date, status)
select s.id, sfa.fee_structure_id, 'Term 1 Fee Installment', sfa.total_amount / 2, sfa.total_amount / 2, (current_date - interval '40 days')::date, 'paid'
from students s join student_fee_assignments sfa on sfa.student_id = s.id
where s.admission_no = 'ADM-2025-0002'
and not exists (select 1 from dues where student_id = s.id and description = 'Term 1 Fee Installment');

-- ========== LATE FEE RULE ==========
insert into late_fee_rules (grace_days, fee_type, amount, applies_to, active)
select 7, 'flat', 250, 'all', true
where not exists (select 1 from late_fee_rules);

-- ========== SCHOLARSHIP POLICY ==========
insert into scholarship_policies (name, criteria, discount_type, discount_value, status)
select 'Merit Scholarship', 'Top 10% academic performers', 'percent', 15, 'active'
where not exists (select 1 from scholarship_policies where name = 'Merit Scholarship');

-- ========== DOCUMENT TEMPLATES ==========
insert into document_templates (name, type, is_default, config) values
  ('Standard Invoice', 'invoice', true, '{"color":"#4f46e5","logo":true}'),
  ('Standard Receipt', 'receipt', true, '{"color":"#4f46e5","logo":true}')
on conflict do nothing;

-- ========== FAQS ==========
insert into faqs (portal, category, question, answer) values
  ('parent', 'Payments', 'How do I pay fees online?', 'Go to Pay Fees and choose your preferred payment method.'),
  ('parent', 'Documents', 'Where can I download my receipt?', 'Visit Payment History and click Download on any transaction.'),
  ('accountant', 'Payments', 'How do I verify a payment?', 'Open Payment Verification queue and approve or reject with a remark.'),
  ('admin', 'Users', 'How do I invite a new staff member?', 'Go to User Management > Invite and enter their email and role.')
on conflict do nothing;

-- ========== NOTIFICATION TEMPLATES ==========
insert into notification_templates (name, channel, subject, body, variables) values
  ('Fee Due Reminder', 'email', 'Fee Payment Reminder - {{studentName}}', 'Dear Parent, a fee of {{amount}} is due on {{dueDate}} for {{studentName}}.', '["studentName","amount","dueDate"]'),
  ('Payment Confirmation', 'email', 'Payment Received - {{receiptNo}}', 'We have received your payment of {{amount}}. Receipt: {{receiptNo}}.', '["amount","receiptNo"]')
on conflict do nothing;

-- ========== APP SETTINGS DEFAULTS ==========
insert into app_settings (category, value) values
  ('general', '{"schoolName":"AGESIS School","timezone":"Asia/Kolkata","currency":"INR","academicYearStart":"June"}'),
  ('branding', '{"primaryColor":"#4f46e5","logoUrl":"","favicon":""}'),
  ('academic_config', '{"gradingSystem":"percentage","classesCount":12,"sectionsPerClass":4}'),
  ('notification_config', '{"emailEnabled":true,"smsEnabled":false,"pushEnabled":false}'),
  ('payment_gateway', '{"provider":"razorpay","mode":"test","keyConfigured":false}'),
  ('sms_config', '{"provider":"twilio","configured":false}'),
  ('email_config', '{"provider":"nodemailer","configured":false}'),
  ('security_policies', '{"passwordMinLength":8,"sessionTimeoutMinutes":60,"mfaRequired":false}'),
  ('device_trust', '{"requireKnownDevice":false,"trustedDevices":[]}'),
  ('backup_schedule', '{"frequency":"daily","time":"02:00","retentionDays":30,"active":true}')
on conflict (category) do nothing;
