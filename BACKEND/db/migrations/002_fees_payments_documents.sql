-- 002_fees_payments_documents.sql
-- Fee structures, dues, payments, invoices/receipts

-- ========== FEES ==========

create table if not exists fee_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  taxable boolean not null default false,
  tax_rate numeric(5,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists fee_structures (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  class_name text,
  academic_year_id uuid references academic_years(id) on delete set null,
  components jsonb not null default '[]'::jsonb, -- [{category, amount}]
  total_amount numeric(12,2) not null default 0,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists student_fee_assignments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  fee_structure_id uuid references fee_structures(id) on delete set null,
  components jsonb not null default '[]'::jsonb,
  total_amount numeric(12,2) not null default 0,
  assigned_by uuid references users(id) on delete set null,
  assigned_at timestamptz not null default now()
);
create index if not exists idx_sfa_student on student_fee_assignments(student_id);

create table if not exists assignment_batches (
  id uuid primary key default gen_random_uuid(),
  fee_structure_id uuid references fee_structures(id) on delete set null,
  class_name text,
  section text,
  student_count int not null default 0,
  status text not null default 'completed' check (status in ('processing', 'completed', 'failed')),
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists scholarship_policies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  criteria text,
  discount_type text not null default 'percent' check (discount_type in ('percent', 'flat')),
  discount_value numeric(12,2) not null default 0,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now()
);

create table if not exists student_scholarships (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  policy_id uuid references scholarship_policies(id) on delete set null,
  name text,
  amount numeric(12,2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  approved_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists student_discounts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  label text,
  amount numeric(12,2) not null default 0,
  reason text,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists student_concessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  description text,
  amount numeric(12,2) not null default 0,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists misc_charges (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  description text,
  amount numeric(12,2) not null default 0,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists fee_adjustment_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  type text not null default 'adjustment',
  amount numeric(12,2) not null default 0,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_by uuid references users(id) on delete set null,
  decided_by uuid references users(id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

-- ========== DUES & LATE FEES ==========

create table if not exists dues (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  fee_structure_id uuid references fee_structures(id) on delete set null,
  description text,
  amount_due numeric(12,2) not null default 0,
  amount_paid numeric(12,2) not null default 0,
  due_date date not null,
  status text not null default 'pending' check (status in ('pending', 'overdue', 'paid', 'escalated', 'partially_paid')),
  escalated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_dues_student on dues(student_id);
create index if not exists idx_dues_status on dues(status);

create table if not exists late_fee_rules (
  id uuid primary key default gen_random_uuid(),
  grace_days int not null default 7,
  fee_type text not null default 'flat' check (fee_type in ('flat', 'percent')),
  amount numeric(12,2) not null default 0,
  applies_to text default 'all',
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists late_fee_charges (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  due_id uuid references dues(id) on delete set null,
  amount numeric(12,2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'applied', 'waived')),
  waived_by uuid references users(id) on delete set null,
  waived_reason text,
  approved_waiver boolean default false,
  created_at timestamptz not null default now()
);

create table if not exists reminder_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  filters jsonb not null default '{}'::jsonb,
  channel text not null default 'email' check (channel in ('email', 'sms', 'push', 'all')),
  message_template text,
  scheduled_at timestamptz,
  status text not null default 'scheduled' check (status in ('scheduled', 'sent', 'cancelled', 'failed')),
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists reminders (
  id uuid primary key default gen_random_uuid(),
  due_id uuid references dues(id) on delete cascade,
  student_id uuid references students(id) on delete cascade,
  campaign_id uuid references reminder_campaigns(id) on delete set null,
  channel text not null default 'email',
  message text,
  status text not null default 'sent' check (status in ('sent', 'failed', 'pending')),
  sent_at timestamptz default now()
);

-- ========== PAYMENTS ==========

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  reference_no text not null unique,
  student_id uuid not null references students(id) on delete cascade,
  due_id uuid references dues(id) on delete set null,
  amount numeric(12,2) not null default 0,
  method text not null default 'cash' check (method in ('cash', 'cheque', 'upi', 'card', 'netbanking', 'razorpay', 'bank_transfer')),
  gateway text default 'manual' check (gateway in ('manual', 'razorpay')),
  gateway_order_id text,
  gateway_payment_id text,
  gateway_signature text,
  status text not null default 'pending' check (status in ('pending', 'success', 'failed', 'refunded', 'partially_refunded')),
  received_by uuid references users(id) on delete set null,
  verified_by uuid references users(id) on delete set null,
  verified_at timestamptz,
  notes text,
  failure_reason text,
  paid_at timestamptz default now(),
  created_at timestamptz not null default now()
);
create index if not exists idx_payments_student on payments(student_id);
create index if not exists idx_payments_status on payments(status);
create index if not exists idx_payments_gateway_order on payments(gateway_order_id);

create table if not exists refunds (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references payments(id) on delete cascade,
  amount numeric(12,2) not null default 0,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'processed')),
  requested_by uuid references users(id) on delete set null,
  decided_by uuid references users(id) on delete set null,
  decided_at timestamptz,
  gateway_refund_id text,
  created_at timestamptz not null default now()
);

create table if not exists reconciliation_records (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid references payments(id) on delete set null,
  bank_reference text,
  matched boolean not null default false,
  matched_by uuid references users(id) on delete set null,
  method text default 'manual' check (method in ('manual', 'auto')),
  notes text,
  created_at timestamptz not null default now()
);

-- ========== DOCUMENTS: INVOICES / RECEIPTS ==========

create table if not exists document_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'invoice' check (type in ('invoice', 'receipt')),
  is_default boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_no text not null unique,
  student_id uuid not null references students(id) on delete cascade,
  fee_structure_id uuid references fee_structures(id) on delete set null,
  template_id uuid references document_templates(id) on delete set null,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  status text not null default 'issued' check (status in ('draft', 'issued', 'paid', 'void')),
  due_date date,
  pdf_url text,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_invoices_student on invoices(student_id);

create table if not exists receipts (
  id uuid primary key default gen_random_uuid(),
  receipt_no text not null unique,
  payment_id uuid references payments(id) on delete set null,
  student_id uuid not null references students(id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  amount numeric(12,2) not null default 0,
  pdf_url text,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_receipts_student on receipts(student_id);

create table if not exists document_activity (
  id uuid primary key default gen_random_uuid(),
  document_type text not null check (document_type in ('invoice', 'receipt')),
  document_id uuid not null,
  action text not null check (action in ('generated', 'emailed', 'shared', 'downloaded', 'printed', 'deleted')),
  actor_id uuid references users(id) on delete set null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_doc_activity_doc on document_activity(document_type, document_id);

create table if not exists bulk_generation_runs (
  id uuid primary key default gen_random_uuid(),
  document_type text not null default 'invoice',
  class_name text,
  section text,
  term text,
  total_count int not null default 0,
  success_count int not null default 0,
  failed_count int not null default 0,
  status text not null default 'completed' check (status in ('processing', 'completed', 'failed')),
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);
