const MOCK_DOCUMENTS = {
  statement: { id: 'STMT-2026', label: 'Fee Statement', date: '2026-07-24' },
  invoice: { id: 'INV-2216', label: 'Invoice - July 2026', date: '2026-07-18' },
  receipt: { id: 'RCT-9821', label: 'Receipt - June 2026', date: '2026-06-02' },
}

const FETCH_DELAY_MS = 500

export async function fetchDocuments() {
  await new Promise((resolve) => setTimeout(resolve, FETCH_DELAY_MS))
  return MOCK_DOCUMENTS
}
