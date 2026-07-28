-- 001_core_auth_academic.sql
-- Core: users, auth (OTP/sessions), roles, academic structure, students

create extension if not exists pgcrypto;

-- ========== USERS & AUTH ==========

create table if not exists roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  portal text not null check (portal in ('parent', 'accountant', 'admin')),
  permissions jsonb not null default '[]'::jsonb,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  portal text not null check (portal in ('parent', 'accountant', 'admin')),
  unique_id text not null unique, -- P-12345 / ACC1023 / ADM1001
  email text not null,
  phone text,
  full_name text not null default '',
  password_hash text,
  avatar_url text,
  role_id uuid references roles(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'pending', 'suspended', 'rejected')),
  two_factor_enabled boolean not null default false,
  preferences jsonb not null default '{}'::jsonb,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (portal, email)
);
create index if not exists idx_users_portal on users(portal);
create index if not exists idx_users_status on users(status);

create table if not exists otp_codes (
  id uuid primary key default gen_random_uuid(),
  portal text not null,
  id_value text not null,
  email text not null,
  otp_hash text not null,
  purpose text not null default 'login',
  expires_at timestamptz not null,
  consumed_at timestamptz,
  attempts int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_otp_lookup on otp_codes(portal, id_value, email);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  refresh_token_hash text not null,
  device_label text,
  ip text,
  user_agent text,
  created_at timestamptz not null default now(),
  last_active_at timestamptz not null default now(),
  revoked_at timestamptz
);
create index if not exists idx_sessions_user on sessions(user_id);

create table if not exists role_change_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  previous_role text,
  new_role text,
  changed_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ========== ACADEMIC STRUCTURE ==========

create table if not exists academic_years (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  start_date date not null,
  end_date date not null,
  is_current boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists classes_sections (
  id uuid primary key default gen_random_uuid(),
  class_name text not null,
  section text not null,
  class_teacher text,
  capacity int,
  academic_year_id uuid references academic_years(id) on delete set null,
  student_count int not null default 0,
  created_at timestamptz not null default now(),
  unique (class_name, section, academic_year_id)
);

create table if not exists calendar_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_type text default 'general',
  start_date date not null,
  end_date date,
  created_at timestamptz not null default now()
);

-- ========== STUDENTS ==========

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  admission_no text not null unique,
  full_name text not null,
  dob date,
  gender text,
  class_name text,
  section text,
  academic_year_id uuid references academic_years(id) on delete set null,
  parent_user_id uuid references users(id) on delete set null,
  guardian_name text,
  guardian_phone text,
  guardian_email text,
  photo_url text,
  status text not null default 'active' check (status in ('active', 'inactive', 'transferred', 'alumni')),
  admitted_at date default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_students_parent on students(parent_user_id);
create index if not exists idx_students_class on students(class_name, section);
create index if not exists idx_students_status on students(status);

create table if not exists admissions (
  id uuid primary key default gen_random_uuid(),
  applicant_name text not null,
  applying_for_class text,
  guardian_name text,
  guardian_phone text,
  guardian_email text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'waitlisted')),
  notes text,
  submitted_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references users(id) on delete set null
);

create table if not exists transfer_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  from_class text,
  to_class text,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_at timestamptz not null default now(),
  decided_at timestamptz
);

create table if not exists import_jobs (
  id uuid primary key default gen_random_uuid(),
  module text not null,
  file_name text,
  total_rows int default 0,
  success_rows int default 0,
  failed_rows int default 0,
  status text not null default 'completed' check (status in ('processing', 'completed', 'failed')),
  errors jsonb default '[]'::jsonb,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);
