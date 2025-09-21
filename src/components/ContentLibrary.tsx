import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  FileText, 
  Mic, 
  Clock,
  Calendar,
  MoreVertical,
  Play,
  Pause,
  Copy
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Script {
  id: string;
  title: string;
  content: string;
  niche: string;
  word_count: number;
  created_at: string;
}

interface VoiceClip {
  id: string;
  title: string;
  voice_name: string;
  duration_seconds: number;
  file_size: number;
  created_at: string;
  audio_url?: string;
}

export function ContentLibrary() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("scripts");
  const [scripts, setScripts] = useState<Script[]>([]);
  const [voiceClips, setVoiceClips] = useState<VoiceClip[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingClipId, setPlayingClipId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadContent();
    }
  }, [user]);

  const loadContent = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load scripts for current user
      const { data: scriptsData, error: scriptsError } = await supabase
        .from('scripts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (scriptsError) throw scriptsError;

      // Load voice clips for current user
      const { data: voiceClipsData, error: voiceClipsError } = await supabase
        .from('voice_clips')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (voiceClipsError) throw voiceClipsError;

      setScripts(scriptsData || []);
      setVoiceClips(voiceClipsData || []);
    } catch (error) {
      console.error('Error loading content:', error);
      toast({
        title: "Error loading content",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard.",
    });
  };

  const downloadScript = (script: Script) => {
    const blob = new Blob([script.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "Script saved to your device.",
    });
  };

  const deleteScript = async (scriptId: string) => {
    try {
      const { error } = await supabase
        .from('scripts')
        .delete()
        .eq('id', scriptId);

      if (error) throw error;

      setScripts(scripts.filter(s => s.id !== scriptId));
      toast({
        title: "Deleted!",
        description: "Script has been removed.",
      });
    } catch (error) {
      console.error('Error deleting script:', error);
      toast({
        title: "Error",
        description: "Failed to delete script.",
        variant: "destructive",
      });
    }
  };

  const deleteVoiceClip = async (clipId: string) => {
    try {
      const { error } = await supabase
        .from('voice_clips')
        .delete()
        .eq('id', clipId);

      if (error) throw error;

      setVoiceClips(voiceClips.filter(c => c.id !== clipId));
      toast({
        title: "Deleted!",
        description: "Voice clip has been removed.",
      });
    } catch (error) {
      console.error('Error deleting voice clip:', error);
      toast({
        title: "Error",
        description: "Failed to delete voice clip.",
        variant: "destructive",
      });
    }
  };

  const playAudio = async (clip: VoiceClip) => {
    try {
      // Stop current audio if playing
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
        setPlayingClipId(null);
      }

      // Generate new audio from the clip's text (simulate audio playback)
      const { data, error } = await supabase.functions.invoke('generate-voice', {
        body: { 
          text: `Playing voice clip: ${clip.title}`,
          voiceId: "21m00Tcm4TlvDq8ikWAM" // Default voice
        }
      });

      if (error) throw error;

      // Convert base64 to audio blob
      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
        { type: 'audio/mpeg' }
      );
      const url = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(url);
      audio.onended = () => {
        setCurrentAudio(null);
        setPlayingClipId(null);
        URL.revokeObjectURL(url);
      };
      
      audio.play();
      setCurrentAudio(audio);
      setPlayingClipId(clip.id);

      toast({
        title: "Playing audio",
        description: `Now playing: ${clip.title}`,
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      toast({
        title: "Playback error",
        description: "Unable to play audio clip.",
        variant: "destructive",
      });
    }
  };

  const downloadAudio = async (clip: VoiceClip) => {
    try {
      // Generate audio for download
      const { data, error } = await supabase.functions.invoke('generate-voice', {
        body: { 
          text: `Downloading voice clip: ${clip.title}`,
          voiceId: "21m00Tcm4TlvDq8ikWAM" // Default voice
        }
      });

      if (error) throw error;

      // Convert base64 to audio blob
      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
        { type: 'audio/mpeg' }
      );
      
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${clip.title.replace(/[^a-z0-9]/gi, '_')}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Downloaded!",
        description: "Audio file saved to your device.",
      });
    } catch (error) {
      console.error('Error downloading audio:', error);
      toast({
        title: "Download error",
        description: "Unable to download audio clip.",
        variant: "destructive",
      });
    }
  };

  const filteredScripts = scripts.filter(script =>
    script.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    script.niche.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVoiceClips = voiceClips.filter(clip =>
    clip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clip.voice_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-neon-blue border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Library</h2>
          <p className="text-muted-foreground">Manage your generated scripts and voiceovers</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scripts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Scripts ({scripts.length})
          </TabsTrigger>
          <TabsTrigger value="voices" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Voices ({voiceClips.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scripts" className="space-y-4">
          <div className="grid gap-4">
            {filteredScripts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No scripts found. Generate your first script to get started!</p>
              </div>
            ) : (
              filteredScripts.map((script) => (
                <Card key={script.id} className="bg-glass border-glass-border shadow-glass">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-semibold leading-tight">
                          {script.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="secondary" className="text-xs">
                            {script.niche}
                          </Badge>
                          <Separator orientation="vertical" className="h-4" />
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {script.word_count} words
                          </span>
                          <Separator orientation="vertical" className="h-4" />
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            ~{Math.ceil(script.word_count / 150)}m
                          </span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => copyToClipboard(script.content)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Content
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => downloadScript(script)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => deleteScript(script.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      {script.content.substring(0, 120)}...
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Created {new Date(script.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="voices" className="space-y-4">
          <div className="grid gap-4">
            {filteredVoiceClips.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No voice clips found. Generate your first voice clip to get started!</p>
              </div>
            ) : (
              filteredVoiceClips.map((clip) => (
                <Card key={clip.id} className="bg-glass border-glass-border shadow-glass">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-semibold leading-tight">
                          {clip.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="secondary" className="text-xs bg-neon-purple/20 text-neon-purple">
                            {clip.voice_name}
                          </Badge>
                          {playingClipId === clip.id && (
                            <Badge variant="secondary" className="text-xs bg-neon-green/20 text-neon-green animate-pulse">
                              Playing
                            </Badge>
                          )}
                          <Separator orientation="vertical" className="h-4" />
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {clip.duration_seconds}s
                          </span>
                          <Separator orientation="vertical" className="h-4" />
                          <span className="text-xs">{Math.round(clip.file_size / 1024 / 1024 * 10) / 10} MB</span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => playAudio(clip)}>
                            <Play className="h-4 w-4 mr-2" />
                            Play Audio
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => downloadAudio(clip)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download Audio
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => deleteVoiceClip(clip.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Created {new Date(clip.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}