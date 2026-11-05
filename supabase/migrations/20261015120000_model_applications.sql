-- Get-involved submissions: the three forms (model, creative, general idea) on
-- the footer's /get-involved page, one table each. The two photo buckets also
-- carry a size and type ceiling of their own, so a bad object is refused even
-- if the server action's checks are ever bypassed.
--
-- Each row is a stranger's name, city, one contact handle and a selfie, so none
-- of it is public. RLS is on with NO policies (service-role only, same posture
-- as subscribers/orders), and the selfie bucket is private: the founder views
-- them through Studio or a signed URL, never a public link. Selfies are
-- re-encoded server-side before upload, which also strips EXIF location data.

create table public.model_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  gender text not null check (gender in ('male', 'female', 'other')),
  -- Free text, only meaningful when gender = 'other'.
  gender_other text,
  -- The "but why male models" follow-up; only asked when gender = 'male'.
  why_male_models text,
  -- One contact, of the applicant's choosing: phone, email or Instagram handle.
  contact text not null,
  selfie_path text not null,
  created_at timestamptz not null default now()
);

alter table public.model_applications enable row level security;

-- The action re-encodes to WebP before upload, so WebP is the only type needed.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('model-selfies', 'model-selfies', false, 5242880, array['image/webp'])
on conflict (id) do nothing;

-- A creative's pitch: same identity fields as a model, plus their speciality.
-- Free text on purpose -- the form suggests director, photographer and so on,
-- but a videographer should not be turned away by a dropdown.
create table public.creative_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  speciality text not null,
  contact text not null,
  -- A piece of their work, private like the selfies.
  work_path text not null,
  created_at timestamptz not null default now()
);

alter table public.creative_applications enable row level security;

-- The action re-encodes to WebP before upload, so WebP is the only type needed.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('creative-work', 'creative-work', false, 5242880, array['image/webp'])
on conflict (id) do nothing;

-- The open-ended box. Contact is required so an idea can be answered.
create table public.idea_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text not null,
  idea text not null,
  created_at timestamptz not null default now()
);

alter table public.idea_submissions enable row level security;
