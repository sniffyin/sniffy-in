/*
  20260710000000_fix_source_check_add_global_pet.sql

  Fix: `grooming_sessions_source_check` was missing 'global_pet'.

  The app's ExternalSource union, EXTERNAL_SOURCE_LABELS, and
  EXTERNAL_SOURCE_FEE_RULE (src/pages/admin/types.ts) all include
  'global_pet', and the Add-Session modal renders a "Global Pet" pill.
  Selecting it sets source='global_pet', but the baseline CHECK
  constraint on grooming_sessions only allowed:
    sniffy, direct_call, website_booking, instagram_ad, facebook_ad,
    woofly, paw_space, oh_my_pet, sidharth, other
  ...so the INSERT failed the check constraint and "Add Session" errored.
  Typing "Global Pet" into the Other field worked only because that path
  stores source='other' (+ external_source_name='Global Pet').

  grooming_sessions predates the migrations folder, so the constraint
  lives on the baseline table — hence this standalone fix migration.

  Idempotent: drop-if-exists then re-add. Purely widens the allow-list
  (adds 'global_pet'), so it validates cleanly against existing rows.
*/

alter table public.grooming_sessions
  drop constraint if exists grooming_sessions_source_check;

alter table public.grooming_sessions
  add constraint grooming_sessions_source_check check (
    source = any (array[
      'sniffy'::text,
      'direct_call'::text,
      'website_booking'::text,
      'instagram_ad'::text,
      'facebook_ad'::text,
      'sidharth'::text,
      'woofly'::text,
      'paw_space'::text,
      'oh_my_pet'::text,
      'global_pet'::text,
      'other'::text
    ])
  );
