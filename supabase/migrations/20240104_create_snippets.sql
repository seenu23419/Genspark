-- Create snippets table
create table if not exists snippets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  language text not null,
  code_text text not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table snippets enable row level security;

-- Policies
create policy "Users can insert their own snippets"
  on snippets for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own snippets"
  on snippets for select
  using (auth.uid() = user_id);
