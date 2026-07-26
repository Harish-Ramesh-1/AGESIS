import { BookOpen, CalendarDays, CreditCard, FileText, GraduationCap, Megaphone, Receipt, Settings } from 'lucide-react'

export const CATEGORY_ICONS = {
  payment: CreditCard,
  invoice: FileText,
  receipt: Receipt,
  announcement: Megaphone,
  event: CalendarDays,
  scholarship: GraduationCap,
  academic: BookOpen,
  system: Settings,
}

export const CATEGORY_LABELS = {
  payment: 'Payments',
  invoice: 'Invoices',
  receipt: 'Receipts',
  announcement: 'Announcements',
  event: 'Events',
  scholarship: 'Scholarships',
  academic: 'Academic',
  system: 'System',
}
