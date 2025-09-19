import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mic, Play, Pause, Download, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const VOICES = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", description: "Young Female, Calm" },
  { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi", description: "Young Female, Strong" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella", description: "Young Female, Sweet" },
  { id: "ErXwobaYiN019PkySvjV", name: "Antoni", description: "Young Male, Well-rounded" },
  { id: "VR6AewLTigWG4xSOukaG", name: "Arnold", description: "Middle-aged Male, Crisp" },
  { id: "pNInz6obpgDQGcFmaJgB", name: "Adam", description: "Middle-aged Male, Deep" },
];

interface VoiceGeneratorProps {
  onVoiceGenerated?: () => void;
}

export function VoiceGenerator({ onVoiceGenerated }: VoiceGeneratorProps) {
  const [script, setScript] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const generateVoice = async () => {
    if (!script.trim()) {
      toast({
        title: "Missing script",
        description: "Please enter text to convert to speech.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedVoice) {
      toast({
        title: "No voice selected",
        description: "Please select a voice for generation.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-voice', {
        body: { 
          text: script,
          voiceId: selectedVoice
        }
      });

      if (error) throw error;

      // Convert base64 to audio blob
      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
        { type: 'audio/mpeg' }
      );
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      // Save to database
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        const selectedVoiceData = VOICES.find(v => v.id === selectedVoice);
        await supabase.from('voice_clips').insert({
          user_id: user.user.id,
          title: `Voice Clip - ${new Date().toLocaleDateString()}`,
          voice_id: selectedVoice,
          voice_name: selectedVoiceData?.name || 'Unknown',
          file_size: audioBlob.size,
          duration_seconds: Math.ceil(script.length / 150) // Approximate
        });
        onVoiceGenerated?.();
      }

      toast({
        title: "Voice generated!",
        description: "Your AI voiceover is ready to play.",
      });
    } catch (error) {
      console.error('Error generating voice:', error);
      toast({
        title: "Generation failed",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `voiceover_${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "Downloaded!",
      description: "Audio file saved to your device.",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Panel */}
      <Card className="bg-glass border-glass-border shadow-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-neon-purple" />
            Voice Generation
          </CardTitle>
          <CardDescription>
            Convert your scripts into professional AI voiceovers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="script-text">Script Text</Label>
            <Textarea
              id="script-text"
              placeholder="Paste your script here or type directly..."
              value={script}
              onChange={(e) => setScript(e.target.value)}
              className="min-h-[120px]"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{script.length} characters</span>
              <span>~{Math.ceil(script.length / 150)} seconds</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="voice-select">Voice Selection</Label>
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a voice" />
              </SelectTrigger>
              <SelectContent>
                {VOICES.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{voice.name}</span>
                      <span className="text-xs text-muted-foreground">{voice.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={generateVoice}
            disabled={isGenerating || !script.trim() || !selectedVoice}
            className="w-full bg-gradient-secondary hover:opacity-90 text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Voice...
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 mr-2" />
                Generate Voice
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Output Panel */}
      <Card className="bg-glass border-glass-border shadow-glass">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Generated Audio
            {audioUrl && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={togglePlayback}
                  className="text-neon-blue border-neon-blue/30"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadAudio}
                  className="text-neon-purple border-neon-purple/30"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardTitle>
          <CardDescription>
            High-quality AI voiceover ready for your content
          </CardDescription>
        </CardHeader>
        <CardContent>
          {audioUrl ? (
            <div className="space-y-4">
              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                className="w-full"
                controls
              />
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-neon-blue">
                  MP3 Format
                </Badge>
                <Badge variant="secondary" className="text-neon-purple">
                  High Quality
                </Badge>
                <Badge variant="secondary" className="text-neon-pink">
                  Ready to Export
                </Badge>
              </div>
              <div className="p-4 bg-secondary/20 border border-secondary/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                <p className="text-sm leading-relaxed">
                  {script.substring(0, 150)}
                  {script.length > 150 && "..."}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Volume2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Your generated audio will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}