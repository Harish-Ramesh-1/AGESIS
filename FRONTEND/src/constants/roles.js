export const PORTAL_IDS = {
  PARENT: 'parent',
  ACCOUNTANT: 'accountant',
  ADMIN: 'admin',
}

// Every seeded account (real-email judge accounts, @agesis.com sample
// accounts, and every hackathon demo student's parent) shares this one
// password so the on-screen autofill hints work uniformly everywhere.
export const DEMO_PASSWORD = 'Agesis@2026'

export const PORTALS = [
  {
    id: PORTAL_IDS.PARENT,
    icon: 'Users',
    title: 'Parent Portal',
    idLabel: 'Registration Number',
    idPlaceholder: 'P-102345',
    idPattern: /^P-\d{4,}$/,
    idHelperText: 'Must begin with "P-", e.g. P-12345',
    demoCredentials: { idValue: 'P-20001', email: 'hr@paperbuddy.in', password: DEMO_PASSWORD, note: 'has a fee balance due' },
    demoCredentialsAlt: { idValue: 'P-20004', email: 'hr@paperbuddy.in', password: DEMO_PASSWORD, note: 'fully paid, nothing due' },
    sampleCredentials: { idValue: 'P-12345', email: 'parent@agesis.com', password: DEMO_PASSWORD },
  },
  {
    id: PORTAL_IDS.ACCOUNTANT,
    icon: 'Briefcase',
    title: 'Accountant Portal',
    idLabel: 'Accountant UID',
    idPlaceholder: 'ACC1023',
    idPattern: /^ACC\d{3,}$/,
    idHelperText: 'Must begin with "ACC", e.g. ACC1023',
    demoCredentials: { idValue: 'ACC1023', email: 'hr@paperbuddy.in', password: DEMO_PASSWORD },
    sampleCredentials: { idValue: 'ACC1024', email: 'accountant@agesis.com', password: DEMO_PASSWORD },
  },
  {
    id: PORTAL_IDS.ADMIN,
    icon: 'ShieldCheck',
    title: 'Admin Portal',
    idLabel: 'Admin UID',
    idPlaceholder: 'ADM1001',
    idPattern: /^ADM\d{3,}$/,
    idHelperText: 'Must begin with "ADM", e.g. ADM1001',
    demoCredentials: { idValue: 'ADM1001', email: 'hr@paperbuddy.in', password: DEMO_PASSWORD },
    sampleCredentials: { idValue: 'ADM1002', email: 'admin@agesis.com', password: DEMO_PASSWORD },
  },
]
