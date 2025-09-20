-- Update RLS policies to be user-specific for security

-- Drop existing public policies for voice_clips
DROP POLICY IF EXISTS "Allow public read access to voice clips" ON public.voice_clips;
DROP POLICY IF EXISTS "Allow public creation of voice clips" ON public.voice_clips;

-- Create user-specific policies for voice_clips
CREATE POLICY "Users can view their own voice clips" 
ON public.voice_clips 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voice clips" 
ON public.voice_clips 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Drop existing public policies for scripts
DROP POLICY IF EXISTS "Allow public read access to scripts" ON public.scripts;
DROP POLICY IF EXISTS "Allow public creation of scripts" ON public.scripts;

-- Create user-specific policies for scripts
CREATE POLICY "Users can view their own scripts" 
ON public.scripts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scripts" 
ON public.scripts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);