-- 003_notifications_admin.sql
-- Notifications, audit, support, rewards, admin settings/security/integrations/backup

-- ========== NOTIFICATIONS ==========

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade, -- null = broadcast
  portal text check (portal in ('parent', 'accountant', 'admin')),
  title text not null,
  message text not null,
  type text default 'info' check (type in ('info', 'success', 'warning', 'error', 'payment', 'due', 'system')),
  read boolean not null default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_notifications_user on notifications(user_id);
create index if not exists idx_notifications_portal on notifications(portal);

create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  audience jsonb not null default '{}'::jsonb, -- {classes:[], sections:[], portals:[]}
  channel text not null default 'email' check (channel in ('email', 'sms', 'push', 'all')),
  status text not null default 'sent' check (status in ('sent', 'scheduled', 'cancelled')),
  sent_by uuid references users(id) on delete set null,
  sent_at timestamptz default now(),
  created_at timestamptz not null default now()
);

create table if not exists notification_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  channel text not null default 'email' check (channel in ('email', 'sms', 'push')),
  subject text,
  body text not null,
  variables jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists scheduled_notifications (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references notification_templates(id) on delete set null,
  title text,
  message text,
  target jsonb default '{}'::jsonb,
  scheduled_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'sent', 'cancelled', 'failed')),
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists notification_logs (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('email', 'sms', 'push')),
  recipient text,
  subject text,
  status text not null default 'sent' check (status in ('sent', 'failed', 'pending')),
  error text,
  created_at timestamptz not null default now()
);

-- ========== AUDIT ==========

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references users(id) on delete set null,
  actor_name text,
  action text not null,
  entity_type text,
  entity_id text,
  details jsonb default '{}'::jsonb,
  severity text default 'normal' check (severity in ('low', 'normal', 'high', 'critical')),
  ip text,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_created on audit_logs(created_at desc);
create index if not exists idx_audit_actor on audit_logs(actor_id);

-- ========== SUPPORT ==========

create table if not exists faqs (
  id uuid primary key default gen_random_uuid(),
  portal text check (portal in ('parent', 'accountant', 'admin', 'all')),
  category text,
  question text not null,
  answer text not null,
  created_at timestamptz not null default now()
);

create table if not exists support_tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_no text not null unique,
  user_id uuid references users(id) on delete set null,
  portal text check (portal in ('parent', 'accountant', 'admin')),
  subject text not null,
  description text,
  category text default 'general',
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references support_tickets(id) on delete cascade,
  sender_id uuid references users(id) on delete set null,
  message text not null,
  created_at timestamptz not null default now()
);

-- ========== REWARDS ==========

create table if not exists rewards_ledger (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  points int not null default 0,
  badge text,
  reason text,
  created_at timestamptz not null default now()
);

-- ========== ADMIN: USERS/ROLES already in 001 (roles, role_change_logs) ==========

create table if not exists user_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  portal text not null check (portal in ('parent', 'accountant', 'admin')),
  role_id uuid references roles(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired')),
  invited_by uuid references users(id) on delete set null,
  invited_at timestamptz not null default now(),
  resent_at timestamptz
);

-- ========== ADMIN: INTEGRATIONS / API KEYS ==========

create table if not exists api_keys (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  key_prefix text not null,
  key_hash text not null,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);

create table if not exists webhooks (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  events jsonb not null default '[]'::jsonb,
  secret text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ========== ADMIN: GENERIC SETTINGS (key/value per category) ==========
-- Covers: general, branding, academic_config, notification_config,
-- payment_gateway, sms_config, email_config, security_policies,
-- device_trust, backup_schedule

create table if not exists app_settings (
  id uuid primary key default gen_random_uuid(),
  category text not null unique,
  value jsonb not null default '{}'::jsonb,
  updated_by uuid references users(id) on delete set null,
  updated_at timestamptz not null default now()
);

-- ========== ADMIN: SECURITY CENTER ==========

create table if not exists security_alerts (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  description text,
  ip text,
  severity text default 'medium' check (severity in ('low', 'medium', 'high', 'critical')),
  status text not null default 'open' check (status in ('open', 'resolved', 'blocked')),
  resolved_by uuid references users(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists allowed_ips (
  id uuid primary key default gen_random_uuid(),
  ip_or_cidr text not null,
  label text,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ========== ADMIN: BACKUP / EXPORT ==========

create table if not exists backup_jobs (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'manual' check (type in ('manual', 'scheduled')),
  status text not null default 'completed' check (status in ('processing', 'completed', 'failed')),
  file_url text,
  size_bytes bigint,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists export_jobs (
  id uuid primary key default gen_random_uuid(),
  module text not null,
  format text not null default 'csv' check (format in ('csv', 'xlsx', 'pdf')),
  status text not null default 'completed' check (status in ('processing', 'completed', 'failed')),
  file_url text,
  requested_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ========== ADMIN: AI INSIGHTS ==========

create table if not exists ai_insights_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

-- ========== REPORTS ==========

create table if not exists scheduled_reports (
  id uuid primary key default gen_random_uuid(),
  report_type text not null,
  frequency text not null default 'weekly' check (frequency in ('daily', 'weekly', 'monthly')),
  recipients jsonb default '[]'::jsonb,
  active boolean not null default true,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);
