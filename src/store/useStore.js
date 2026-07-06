import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  SEED_USERS, SEED_STAFF, SEED_TRANSACTIONS, SEED_EVENTS,
  SEED_EVENT_REGISTRATIONS, SEED_GADGETS, SEED_PROMOTIONS, SEED_SUMUP_LINKS
} from '../data/seed'
import { v4 as uuidv4 } from '../utils/uuid'

const initialState = {
  users: SEED_USERS,
  staff: SEED_STAFF,
  transactions: SEED_TRANSACTIONS,
  events: SEED_EVENTS,
  eventRegistrations: SEED_EVENT_REGISTRATIONS,
  gadgets: SEED_GADGETS,
  promotions: SEED_PROMOTIONS,
  sumupLinks: SEED_SUMUP_LINKS,
}

export const useStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // ── USERS ──────────────────────────────────────────────────────────
      addUser: (userData) => set((s) => ({
        users: [...s.users, { ...userData, balance: 0, blocked: false, role: 'utente', created_at: new Date().toISOString() }]
      })),
      updateUser: (id, patch) => set((s) => ({
        users: s.users.map(u => u.id === id ? { ...u, ...patch } : u)
      })),
      deleteUser: (id) => set((s) => ({
        users: s.users.filter(u => u.id !== id)
      })),

      // ── TRANSACTIONS (atomic: update balance + insert tx) ───────────────
      chargeUser: ({ user_id, amount, category, operator, staff_id = null, note = '' }) => {
        const users = get().users
        const user = users.find(u => u.id === user_id)
        if (!user) return { ok: false, error: 'Utente non trovato' }
        if (user.blocked) return { ok: false, error: 'Utente bloccato' }
        if (user.balance < Math.abs(amount)) return { ok: false, error: 'Saldo insufficiente' }
        const tx = {
          id: uuidv4(),
          user_id, type: 'spesa',
          amount: -Math.abs(amount),
          category, operator, staff_id, note,
          voided: false,
          created_at: new Date().toISOString()
        }
        set((s) => ({
          users: s.users.map(u => u.id === user_id ? { ...u, balance: +(u.balance - Math.abs(amount)).toFixed(2) } : u),
          transactions: [tx, ...s.transactions]
        }))
        return { ok: true, tx }
      },

      rechargeUser: ({ user_id, amount, operator, staff_id = null, note = '' }) => {
        const tx = {
          id: uuidv4(),
          user_id, type: 'ricarica',
          amount: +Math.abs(amount).toFixed(2),
          category: 'ricarica', operator, staff_id, note,
          voided: false,
          created_at: new Date().toISOString()
        }
        set((s) => ({
          users: s.users.map(u => u.id === user_id ? { ...u, balance: +(u.balance + Math.abs(amount)).toFixed(2) } : u),
          transactions: [tx, ...s.transactions]
        }))
        return { ok: true, tx }
      },

      voidTransaction: (tx_id) => {
        const txs = get().transactions
        const tx = txs.find(t => t.id === tx_id)
        if (!tx || tx.voided) return { ok: false }
        const reverseAmount = -tx.amount
        const storno = {
          id: uuidv4(),
          user_id: tx.user_id, type: 'storno',
          amount: reverseAmount,
          category: tx.category, operator: 'Admin',
          staff_id: null, note: `Storno di ${tx.id}`,
          voided: false,
          created_at: new Date().toISOString()
        }
        set((s) => ({
          transactions: s.transactions.map(t => t.id === tx_id ? { ...t, voided: true } : t).concat(storno),
          users: s.users.map(u => u.id === tx.user_id ? { ...u, balance: +(u.balance + reverseAmount).toFixed(2) } : u)
        }))
        return { ok: true }
      },

      // ── EVENTS ─────────────────────────────────────────────────────────
      addEvent: (ev) => set((s) => ({ events: [...s.events, { ...ev, id: uuidv4(), created_at: new Date().toISOString() }] })),
      updateEvent: (id, patch) => set((s) => ({ events: s.events.map(e => e.id === id ? { ...e, ...patch } : e) })),
      deleteEvent: (id) => set((s) => ({ events: s.events.filter(e => e.id !== id) })),

      registerEvent: ({ event_id, user_id, paid_amount }) => {
        const already = get().eventRegistrations.find(r => r.event_id === event_id && r.user_id === user_id)
        if (already) return { ok: false, error: 'Già iscritto' }
        set((s) => ({ eventRegistrations: [...s.eventRegistrations, { event_id, user_id, paid_amount, created_at: new Date().toISOString() }] }))
        return { ok: true }
      },

      // ── GADGETS ────────────────────────────────────────────────────────
      addGadget: (g) => set((s) => ({ gadgets: [...s.gadgets, { ...g, id: uuidv4() }] })),
      updateGadget: (id, patch) => set((s) => ({ gadgets: s.gadgets.map(g => g.id === id ? { ...g, ...patch } : g) })),
      deleteGadget: (id) => set((s) => ({ gadgets: s.gadgets.filter(g => g.id !== id) })),

      // ── STAFF ──────────────────────────────────────────────────────────
      addStaff: (s) => set((st) => ({ staff: [...st.staff, { ...s, created_at: new Date().toISOString() }] })),
      updateStaff: (id, patch) => set((s) => ({ staff: s.staff.map(m => m.id === id ? { ...m, ...patch } : m) })),
      deleteStaff: (id) => set((s) => ({ staff: s.staff.filter(m => m.id !== id) })),

      // ── SUMUP LINKS ────────────────────────────────────────────────────
      addSumupLink: (link) => set((s) => ({ sumupLinks: [...s.sumupLinks, { ...link, id: uuidv4(), kind: 'custom' }] })),
      deleteSumupLink: (id) => set((s) => ({ sumupLinks: s.sumupLinks.filter(l => l.id !== id) })),

      // ── PROMOTIONS ─────────────────────────────────────────────────────
      addPromotion: (p) => set((s) => ({ promotions: [...s.promotions, { ...p, id: uuidv4() }] })),
      updatePromotion: (id, patch) => set((s) => ({ promotions: s.promotions.map(p => p.id === id ? { ...p, ...patch } : p) })),
      deletePromotion: (id) => set((s) => ({ promotions: s.promotions.filter(p => p.id !== id) })),

      // ── RESET (dev) ────────────────────────────────────────────────────
      resetToSeed: () => set({ ...initialState }),
    }),
    {
      name: 'rione-shanghai-store',
      version: 1,
    }
  )
)
