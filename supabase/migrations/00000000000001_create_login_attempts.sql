-- Create login_attempts table
create table if not exists login_attempts (
  id uuid default uuid_generate_v4() primary key,
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table login_attempts enable row level security;

-- Create policies
create policy "Users can view their own login attempts"
  on login_attempts for select
  using (auth.uid() = (select id from auth.users where email = login_attempts.email));

create policy "Service role can view all login attempts"
  on login_attempts for select
  using (true);

-- Create index for faster lookups
create index if not exists idx_login_attempts_email
  on login_attempts(email);

create index if not exists idx_login_attempts_created_at
  on login_attempts(created_at);
