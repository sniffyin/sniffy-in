-- ─────────────────────────────────────────────────────────────
-- Sniffy — Dummy expenses seed
--
-- Run this in the Supabase SQL editor (or psql) AFTER applying the
-- 20260525100000_create_expenses.sql migration.
--
-- Spread across April + May 2026 so the "vs last month" delta in the
-- ExpensesTab header has something to compare against.
--
-- Paid-by names rotate between Jitendra, Sidharth, Nikita.
-- created_by_id matches the AdminUser.id from authStore.ts:
--   u1 = Jitendra (admin)
--   u2 = Sidharth (viewer)
--   u3 = Nikita   (coordinator)
-- This matters because the edit/delete buttons in the UI only show up
-- when canModifyExpense() sees the logged-in user's id == created_by_id.
-- ─────────────────────────────────────────────────────────────

INSERT INTO expenses
  (title, amount, category, expense_date, payment_method,
   paid_by_name, paid_by_role, vendor_or_payee, notes,
   created_by_id, created_by_name)
VALUES
  -- ── May 2026 (current month) ───────────────────────────────

  ('Grooming kits — May restock', 24500.00, 'kit', '2026-05-22', 'upi',
   'Jitendra', 'admin', 'PetKonnect Wholesale',
   'Bulk order: shampoo, conditioners, ear-cleaner for 5 groomers.',
   'u1', 'Jitendra'),

  ('Instagram boost — Pune campaign', 8500.00, 'marketing', '2026-05-20', 'card',
   'Nikita', 'coordinator', 'Meta Ads',
   'Cat-grooming awareness, 7 day boost.',
   'u3', 'Nikita'),

  ('Developer payment — May sprint', 45000.00, 'development', '2026-05-18', 'bank',
   'Jitendra', 'admin', 'Freelance dev',
   'Phase 4 customer portal + payment QR.',
   'u1', 'Jitendra'),

  ('Cab — site visit Wakad', 420.00, 'travel', '2026-05-15', 'upi',
   'Nikita', 'coordinator', 'Uber', NULL,
   'u3', 'Nikita'),

  ('Cab — Kothrud groomer meet', 380.00, 'travel', '2026-05-14', 'upi',
   'Sidharth', 'admin', 'Ola',
   'Onboarding interview with Rakesh.',
   'u2', 'Sidharth'),

  ('Hemant — May salary', 22000.00, 'salary', '2026-05-10', 'bank',
   'Sidharth', 'admin', 'Hemant',
   'Monthly payout + ₹1500 attendance bonus.',
   'u2', 'Sidharth'),

  ('Rakesh — May salary', 19500.00, 'salary', '2026-05-10', 'bank',
   'Sidharth', 'admin', 'Rakesh',
   'Monthly payout — joined mid-April so prorated last month.',
   'u2', 'Sidharth'),

  ('Woofly settlement — April', 6800.00, 'vendor', '2026-05-08', 'bank',
   'Jitendra', 'admin', 'Woofly',
   'Commission owed for 12 prepaid sessions.',
   'u1', 'Jitendra'),

  ('Internet bill — May', 1499.00, 'utilities', '2026-05-05', 'upi',
   'Nikita', 'coordinator', 'ACT Fibernet', NULL,
   'u3', 'Nikita'),

  ('Office stationery', 720.00, 'office', '2026-05-04', 'cash',
   'Nikita', 'coordinator', 'Local stationery shop',
   'Pens, notebooks, printer paper.',
   'u3', 'Nikita'),

  ('Petrol — bike runs', 1200.00, 'travel', '2026-05-02', 'upi',
   'Jitendra', 'admin', 'HP Petrol Pump', NULL,
   'u1', 'Jitendra'),

  ('Domain renewal — sniffy.in', 1180.00, 'development', '2026-05-01', 'card',
   'Jitendra', 'admin', 'GoDaddy',
   'Annual renewal.',
   'u1', 'Jitendra'),

  -- ── April 2026 (last month) ────────────────────────────────

  ('Grooming kits — April', 18200.00, 'kit', '2026-04-25', 'upi',
   'Jitendra', 'admin', 'PetKonnect Wholesale', NULL,
   'u1', 'Jitendra'),

  ('Google Ads — Pune dog grooming', 6200.00, 'marketing', '2026-04-22', 'card',
   'Nikita', 'coordinator', 'Google Ads',
   '14 day campaign, search keywords.',
   'u3', 'Nikita'),

  ('Developer payment — April', 38000.00, 'development', '2026-04-18', 'bank',
   'Jitendra', 'admin', 'Freelance dev',
   'Phase 3 outreach + customer merge tool.',
   'u1', 'Jitendra'),

  ('Cab — vendor pitch', 650.00, 'travel', '2026-04-12', 'upi',
   'Sidharth', 'admin', 'Uber',
   'Meeting with HeadsUpForTails procurement.',
   'u2', 'Sidharth'),

  ('Hemant — April salary', 22000.00, 'salary', '2026-04-10', 'bank',
   'Sidharth', 'admin', 'Hemant', NULL,
   'u2', 'Sidharth'),

  ('Rakesh — April part-month', 9750.00, 'salary', '2026-04-10', 'bank',
   'Sidharth', 'admin', 'Rakesh',
   'Joined 15 Apr; prorated.',
   'u2', 'Sidharth'),

  ('Woofly settlement — March', 5400.00, 'vendor', '2026-04-08', 'bank',
   'Jitendra', 'admin', 'Woofly', NULL,
   'u1', 'Jitendra'),

  ('Internet bill — April', 1499.00, 'utilities', '2026-04-05', 'upi',
   'Nikita', 'coordinator', 'ACT Fibernet', NULL,
   'u3', 'Nikita'),

  ('Misc — tea / snacks for groomers', 540.00, 'misc', '2026-04-03', 'cash',
   'Nikita', 'coordinator', NULL,
   'Onboarding day refreshments.',
   'u3', 'Nikita'),

  ('Office cleaning service', 1500.00, 'office', '2026-04-02', 'cash',
   'Nikita', 'coordinator', 'House-help', NULL,
   'u3', 'Nikita');

-- Quick sanity check (optional — uncomment to run):
-- SELECT category, paid_by_name, count(*), sum(amount)
-- FROM expenses
-- GROUP BY 1, 2
-- ORDER BY 1, 2;
