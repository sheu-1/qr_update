-- Create users table
create table if not exists users (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create qr_codes table
create table if not exists qr_codes (
  id uuid default uuid_generate_v4() primary key,
  account_number text not null,
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_used timestamp with time zone,
  unique(account_number)
);

-- Enable RLS
alter table users enable row level security;
alter table qr_codes enable row level security;

-- Create policies
create policy "Users can view their own data"
  on users for select
  using (auth.uid() = id);

create policy "Users can insert their own data"
  on users for insert
  with check (auth.uid() = id);

create policy "Users can view their own QR codes"
  on qr_codes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own QR codes"
  on qr_codes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own QR codes"
  on qr_codes for update
  using (auth.uid() = user_id);

-- Create trigger to update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language 'plpgsql';

create trigger update_users_updated_at
  before update on users
  for each row
  execute function update_updated_at_column();
