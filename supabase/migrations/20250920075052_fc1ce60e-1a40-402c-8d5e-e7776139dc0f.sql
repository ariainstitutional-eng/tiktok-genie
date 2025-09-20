-- Temporarily disable RLS and allow public access to all tables
ALTER TABLE public.scripts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_clips DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own scripts" ON public.scripts;
DROP POLICY IF EXISTS "Users can create their own scripts" ON public.scripts;
DROP POLICY IF EXISTS "Users can update their own scripts" ON public.scripts;
DROP POLICY IF EXISTS "Users can delete their own scripts" ON public.scripts;

DROP POLICY IF EXISTS "Users can view their own voice clips" ON public.voice_clips;
DROP POLICY IF EXISTS "Users can create their own voice clips" ON public.voice_clips;
DROP POLICY IF EXISTS "Users can update their own voice clips" ON public.voice_clips;
DROP POLICY IF EXISTS "Users can delete their own voice clips" ON public.voice_clips;