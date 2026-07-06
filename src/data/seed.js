export const SEED_USERS = [
  { id: 'SH-001', name: 'Marco', surname: 'Rossi', cf: 'RSSMRC85A01H501Z', email: 'marco@email.it', balance: 45.50, pin: '1234', blocked: false, role: 'utente', notes: '', privacy_base: true, privacy_gdpr: true, privacy_marketing: false, privacy_media: true, created_at: '2024-06-01T10:00:00Z' },
  { id: 'SH-002', name: 'Laura', surname: 'Bianchi', cf: 'BNCLRA90B41H501X', email: 'laura@email.it', balance: 120.00, pin: '5678', blocked: false, role: 'utente', notes: 'VIP', privacy_base: true, privacy_gdpr: true, privacy_marketing: true, privacy_media: true, created_at: '2024-06-02T10:00:00Z' },
  { id: 'SH-003', name: 'Giovanni', surname: 'Verdi', cf: 'VRDGNN78C15H501Y', email: '', balance: 8.00, pin: '9999', blocked: false, role: 'utente', notes: '', privacy_base: true, privacy_gdpr: false, privacy_marketing: false, privacy_media: false, created_at: '2024-06-05T10:00:00Z' },
  { id: 'SH-004', name: 'Sofia', surname: 'Mancini', cf: 'MNCSFA95D50H501W', email: 'sofia@email.it', balance: 0, pin: '1111', blocked: true, role: 'utente', notes: 'Sospeso temporaneamente', privacy_base: true, privacy_gdpr: true, privacy_marketing: false, privacy_media: false, created_at: '2024-06-10T10:00:00Z' },
]

export const SEED_STAFF = [
  { id: 'STAFF-01', name: 'Luigi', surname: 'Esposito', pin: '1111', role: 'Bar', active: true, created_at: '2024-06-01T09:00:00Z' },
  { id: 'STAFF-02', name: 'Anna', surname: 'Ferri', pin: '8765', role: 'Cucina', active: true, created_at: '2024-06-01T09:00:00Z' },
  { id: 'STAFF-03', name: 'Carlo', surname: 'Neri', pin: '2468', role: 'Gadget', active: false, created_at: '2024-06-03T09:00:00Z' },
]

export const SEED_TRANSACTIONS = [
  { id: 'tx-001', user_id: 'SH-001', type: 'ricarica', amount: 50, category: 'ricarica', operator: 'Admin', staff_id: null, note: 'Ricarica iniziale', voided: false, created_at: '2024-07-01T10:00:00Z' },
  { id: 'tx-002', user_id: 'SH-001', type: 'spesa', amount: -4.50, category: 'bar', operator: 'Luigi Esposito', staff_id: 'STAFF-01', note: 'Birra', voided: false, created_at: '2024-07-02T20:30:00Z' },
  { id: 'tx-003', user_id: 'SH-001', type: 'spesa', amount: -12.00, category: 'cena', operator: 'Anna Ferri', staff_id: 'STAFF-02', note: 'Piatto + bevanda', voided: false, created_at: '2024-07-03T21:00:00Z' },
  { id: 'tx-004', user_id: 'SH-001', type: 'spesa', amount: -8.00, category: 'gadget', operator: 'Luigi Esposito', staff_id: 'STAFF-01', note: 'Tazza Shanghai', voided: false, created_at: '2024-07-04T19:00:00Z' },
  { id: 'tx-005', user_id: 'SH-001', type: 'ricarica', amount: 20, category: 'ricarica', operator: 'Admin', staff_id: null, note: '', voided: false, created_at: '2024-07-04T18:00:00Z' },
  { id: 'tx-006', user_id: 'SH-002', type: 'ricarica', amount: 100, category: 'ricarica', operator: 'Admin', staff_id: null, note: 'Ricarica estate', voided: false, created_at: '2024-07-01T09:00:00Z' },
  { id: 'tx-007', user_id: 'SH-002', type: 'ricarica', amount: 50, category: 'ricarica', operator: 'Luigi Esposito', staff_id: 'STAFF-01', note: '', voided: false, created_at: '2024-07-03T18:00:00Z' },
  { id: 'tx-008', user_id: 'SH-002', type: 'spesa', amount: -30, category: 'evento', operator: 'Sistema', staff_id: null, note: 'Concerto 12/07', voided: false, created_at: '2024-07-02T15:00:00Z' },
  { id: 'tx-009', user_id: 'SH-003', type: 'ricarica', amount: 20, category: 'ricarica', operator: 'Admin', staff_id: null, note: '', voided: false, created_at: '2024-07-01T12:00:00Z' },
  { id: 'tx-010', user_id: 'SH-003', type: 'spesa', amount: -12, category: 'cena', operator: 'Anna Ferri', staff_id: 'STAFF-02', note: '', voided: false, created_at: '2024-07-05T20:00:00Z' },
]

export const SEED_EVENTS = [
  { id: 'evt-001', title: 'Concerto Jazz Live', event_date: '2026-07-12T21:00:00Z', price: 15, description: 'Trio jazz dal vivo, ingresso incluso aperitivo', spots: 80, sumup_link: 'https://pay.sumup.com/demo1', sold_out: false, created_at: '2024-06-20T10:00:00Z' },
  { id: 'evt-002', title: 'Cena Orientale di Gala', event_date: '2026-07-19T20:00:00Z', price: 35, description: 'Menu degustazione 5 portate con vino abbinato', spots: 50, sumup_link: 'https://pay.sumup.com/demo2', sold_out: false, created_at: '2024-06-20T10:00:00Z' },
  { id: 'evt-003', title: 'Karaoke Party', event_date: '2026-07-26T22:00:00Z', price: 0, description: 'Serata libera, ingresso gratuito!', spots: 120, sumup_link: '', sold_out: false, created_at: '2024-06-20T10:00:00Z' },
]

export const SEED_EVENT_REGISTRATIONS = [
  { event_id: 'evt-001', user_id: 'SH-002', paid_amount: 30, created_at: '2024-07-02T15:00:00Z' },
]

export const SEED_GADGETS = [
  { id: 'gad-001', name: 'Tazza Shanghai', price: 8, emoji: '🍵', active: true },
  { id: 'gad-002', name: 'T-shirt Rione', price: 15, emoji: '👕', active: true },
  { id: 'gad-003', name: 'Cappello estivo', price: 12, emoji: '🧢', active: true },
  { id: 'gad-004', name: 'Sacca canvas', price: 10, emoji: '👜', active: true },
  { id: 'gad-005', name: 'Poster vintage', price: 5, emoji: '🖼️', active: false },
]

export const SEED_PROMOTIONS = [
  { id: 'promo-001', title: 'Sconto Jazz -20%', type: 'evento', target_id: 'evt-001', discount_pct: 20, code: 'JAZZ20', active: true },
  { id: 'promo-002', title: 'Gadget Summer -10%', type: 'gadget', target_id: 'gad-002', discount_pct: 10, code: 'SUMMER10', active: false },
]

export const SEED_SUMUP_LINKS = [
  { id: 'su-001', label: 'Ricarica €10', url: 'https://pay.sumup.com/r10', kind: 'recharge_10' },
  { id: 'su-002', label: 'Ricarica €20', url: 'https://pay.sumup.com/r20', kind: 'recharge_20' },
  { id: 'su-003', label: 'Ricarica €50', url: 'https://pay.sumup.com/r50', kind: 'recharge_50' },
]

export const ADMIN_CREDENTIALS = { code: 'ADMIN', pin: '0000' }
