# Supabase Setup Guide

This guide will help you set up Supabase for the Vocabulary Learning App.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Basic understanding of SQL and database concepts

## Step 1: Create a New Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in the details:
   - **Name**: `vocabulary-learning-app`
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
4. Click "Create new project"
5. Wait for the project to be provisioned (~2 minutes)

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. Add these to your `.env` file:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 3: Run Database Migrations

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the contents of `supabase/migrations/20260123_initial_schema.sql`
4. Paste into the SQL editor
5. Click "Run" to execute the migration

This will create:
- ✅ `profiles` table (user profiles)
- ✅ `word_packs` table (vocabulary packs)
- ✅ `pack_words` table (individual words)
- ✅ `user_word_progress` table (learning progress)
- ✅ Row Level Security (RLS) policies
- ✅ Automatic triggers for timestamps
- ✅ Auto-profile creation on signup

## Step 4: Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional):
   - Go to **Authentication** → **Email Templates**
   - Customize confirmation and password reset emails

## Step 5: Seed Initial Data (Optional)

To add sample vocabulary packs:

1. Go to **SQL Editor**
2. Run this query:

```sql
-- Insert sample word pack
INSERT INTO public.word_packs (name, description, level, category, word_count)
VALUES ('Essential A2 Vocabulary', 'Core vocabulary for A2 level learners', 'A2', 'General', 300);

-- Get the pack ID
SELECT id FROM public.word_packs WHERE name = 'Essential A2 Vocabulary';

-- Insert sample words (replace <pack_id> with actual ID)
INSERT INTO public.pack_words (pack_id, term, meaning, example, type, level)
VALUES 
  ('<pack_id>', 'ephemeral', 'geçici, kısa ömürlü', 'The beauty of cherry blossoms is ephemeral.', 'adjective', 'C1'),
  ('<pack_id>', 'serendipity', 'tesadüf, şans eseri', 'Finding this book was pure serendipity.', 'noun', 'C2');
```

## Step 6: Verify RLS Policies

Test that Row Level Security is working:

1. Go to **Authentication** → **Users**
2. Create a test user manually
3. Go to **Table Editor** → **user_word_progress**
4. Try to insert a row with a different `user_id` than your test user
5. It should fail (this is correct!)

## Step 7: Test the Integration

1. In your app, update `.env` with your Supabase credentials
2. Restart the development server: `npm run dev`
3. Try signing up a new user
4. Check Supabase dashboard to see if:
   - User appears in **Authentication** → **Users**
   - Profile is auto-created in `profiles` table

## Troubleshooting

### "Invalid API key" error
- Double-check your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Make sure there are no extra spaces or quotes
- Restart the dev server after changing `.env`

### RLS policy errors
- Make sure you're authenticated before accessing data
- Check that policies are enabled: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
- Verify user ID matches: `auth.uid()` should return your user's ID

### Sync not working
- Check browser console for errors
- Verify internet connection
- Make sure `VITE_ENABLE_SUPABASE_SYNC=true` in `.env`

## Security Best Practices

### ✅ DO:
- Keep your `anon` key in `.env` (it's safe to expose)
- Use RLS policies for all tables
- Validate data on the client AND server
- Use `service_role` key only in secure backend environments

### ❌ DON'T:
- Commit `.env` to git (it's in `.gitignore`)
- Disable RLS policies
- Trust client-side validation alone
- Expose `service_role` key in client code

## Next Steps

- [ ] Customize email templates
- [ ] Add more vocabulary packs
- [ ] Set up Supabase Storage for images/audio
- [ ] Configure custom domain (optional)
- [ ] Set up database backups

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

---

**Need help?** Open an issue on GitHub or check the Supabase Discord community.
