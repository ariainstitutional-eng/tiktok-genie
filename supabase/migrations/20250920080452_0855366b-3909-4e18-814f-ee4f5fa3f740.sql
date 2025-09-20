-- Re-enable RLS on voice_clips table for security
ALTER TABLE public.voice_clips ENABLE ROW LEVEL SECURITY;

-- Allow public read access to voice clip metadata (no sensitive audio URLs are stored)
CREATE POLICY "Allow public read access to voice clips" 
ON public.voice_clips 
FOR SELECT 
USING (true);

-- Allow public creation of voice clips (needed for app functionality)
CREATE POLICY "Allow public creation of voice clips" 
ON public.voice_clips 
FOR INSERT 
WITH CHECK (true);

-- Prevent unauthorized updates and deletes
CREATE POLICY "Prevent unauthorized updates" 
ON public.voice_clips 
FOR UPDATE 
USING (false);

CREATE POLICY "Prevent unauthorized deletes" 
ON public.voice_clips 
FOR DELETE 
USING (false);

-- Also secure the scripts table while we're at it
ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to scripts
CREATE POLICY "Allow public read access to scripts" 
ON public.scripts 
FOR SELECT 
USING (true);

-- Allow public creation of scripts
CREATE POLICY "Allow public creation of scripts" 
ON public.scripts 
FOR INSERT 
WITH CHECK (true);

-- Prevent unauthorized updates and deletes on scripts
CREATE POLICY "Prevent unauthorized updates on scripts" 
ON public.scripts 
FOR UPDATE 
USING (false);

CREATE POLICY "Prevent unauthorized deletes on scripts" 
ON public.scripts 
FOR DELETE 
USING (false);