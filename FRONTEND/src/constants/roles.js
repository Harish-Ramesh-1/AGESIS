export const PORTAL_IDS = {
  PARENT: 'parent',
  ACCOUNTANT: 'accountant',
  ADMIN: 'admin',
}

export const PORTALS = [
  {
    id: PORTAL_IDS.PARENT,
    icon: 'Users',
    title: 'Parent Portal',
    idLabel: 'Registration Number',
    idPlaceholder: 'P-102345',
    idPattern: /^P-\d{4,}$/,
    idHelperText: 'Must begin with "P-", e.g. P-12345',
    demoCredentials: { idValue: 'P-12345', email: 'parent.demo@agesisschool.edu' },
  },
  {
    id: PORTAL_IDS.ACCOUNTANT,
    icon: 'Briefcase',
    title: 'Accountant Portal',
    idLabel: 'Accountant UID',
    idPlaceholder: 'ACC1023',
    idPattern: /^ACC\d{3,}$/,
    idHelperText: 'Must begin with "ACC", e.g. ACC1023',
    demoCredentials: { idValue: 'ACC1023', email: 'accountant.demo@agesisschool.edu' },
  },
  {
    id: PORTAL_IDS.ADMIN,
    icon: 'ShieldCheck',
    title: 'Admin Portal',
    idLabel: 'Admin UID',
    idPlaceholder: 'ADM1001',
    idPattern: /^ADM\d{3,}$/,
    idHelperText: 'Must begin with "ADM", e.g. ADM1001',
    demoCredentials: { idValue: 'ADM1001', email: 'admin.demo@agesisschool.edu' },
  },
]

export const DEMO_OTP = '123456'
