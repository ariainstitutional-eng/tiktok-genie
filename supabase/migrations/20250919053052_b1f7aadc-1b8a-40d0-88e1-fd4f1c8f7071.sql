-- Create table for generated scripts
CREATE TABLE public.scripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  niche TEXT NOT NULL,
  prompt_extra TEXT,
  word_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for generated voice clips
CREATE TABLE public.voice_clips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  script_id UUID REFERENCES public.scripts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  voice_id TEXT NOT NULL,
  voice_name TEXT NOT NULL,
  audio_url TEXT,
  file_size BIGINT DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_clips ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for scripts
CREATE POLICY "Users can view their own scripts" 
ON public.scripts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scripts" 
ON public.scripts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scripts" 
ON public.scripts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scripts" 
ON public.scripts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for voice clips
CREATE POLICY "Users can view their own voice clips" 
ON public.voice_clips 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voice clips" 
ON public.voice_clips 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice clips" 
ON public.voice_clips 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice clips" 
ON public.voice_clips 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_scripts_updated_at
BEFORE UPDATE ON public.scripts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for voice clips
INSERT INTO storage.buckets (id, name, public) 
VALUES ('voice-clips', 'voice-clips', false);

-- Create storage policies for voice clips
CREATE POLICY "Users can view their own voice clips" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'voice-clips' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own voice clips" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'voice-clips' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own voice clips" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'voice-clips' AND auth.uid()::text = (storage.foldername(name))[1]);