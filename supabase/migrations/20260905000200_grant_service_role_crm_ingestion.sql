begin;

-- =========================================================
-- SECUREVOLT CRM
-- SERVER-SIDE WEBSITE INGESTION PRIVILEGES
--
-- The Supabase secret key executes through service_role.
-- service_role bypasses RLS, but PostgreSQL object grants
-- are still required before tables can be accessed.
--
-- These grants are intentionally limited to the operations
-- required by public.ingest_website_quote().
-- =========================================================

grant usage
on schema public
to service_role;


-- ---------------------------------------------------------
-- Read-only lookup tables
-- ---------------------------------------------------------

grant select
on table
  public.organizations,
  public.organization_members,
  public.pipelines,
  public.pipeline_stages
to service_role;


-- ---------------------------------------------------------
-- Companies
--
-- Function:
--   SELECT existing company
--   INSERT new company
-- ---------------------------------------------------------

grant select, insert
on table public.companies
to service_role;


-- ---------------------------------------------------------
-- Contacts
--
-- Function:
--   SELECT existing contact
--   INSERT new contact
--   UPDATE existing contact
-- ---------------------------------------------------------

grant select, insert, update
on table public.contacts
to service_role;


-- ---------------------------------------------------------
-- Deals
--
-- Function:
--   SELECT for request-id idempotency
--   INSERT new opportunity
-- ---------------------------------------------------------

grant select, insert
on table public.deals
to service_role;

commit;
