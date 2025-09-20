import { useState, useEffect } from "react";
import { ScriptGenerator } from "@/components/ScriptGenerator";
import { VoiceGenerator } from "@/components/VoiceGenerator";
import { ContentLibrary } from "@/components/ContentLibrary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, FileText, Mic, Library, TrendingUp, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const [activeTab, setActiveTab] = useState("generate");
  const [stats, setStats] = useState({
    totalScripts: 0,
    totalVoiceClips: 0,
    storageUsed: 0,
    totalDownloads: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Get scripts count
      const { count: scriptsCount } = await supabase
        .from('scripts')
        .select('*', { count: 'exact', head: true });

      // Get voice clips count
      const { count: voiceClipsCount } = await supabase
        .from('voice_clips')
        .select('*', { count: 'exact', head: true });

      // Get storage usage
      const { data: storageData } = await supabase
        .from('voice_clips')
        .select('file_size');

      const totalStorage = storageData?.reduce((acc, clip) => acc + (clip.file_size || 0), 0) || 0;

      setStats({
        totalScripts: scriptsCount || 0,
        totalVoiceClips: voiceClipsCount || 0,
        storageUsed: Math.round(totalStorage / (1024 * 1024) * 10) / 10, // MB
        totalDownloads: (scriptsCount || 0) + (voiceClipsCount || 0), // Approximate
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <header className="border-b border-glass-border bg-glass backdrop-blur-xl">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-primary rounded-xl">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    Content Creator Studio
                  </h1>
                  <p className="text-sm text-muted-foreground">AI-powered content generation</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="bg-neon-purple/20 text-neon-purple border-neon-purple/30">
                  Production Ready
                </Badge>
              </div>
            </div>
          </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-glass border-glass-border shadow-glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-neon-blue" />
                Usage Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div>
                  <div className="text-3xl font-bold text-neon-blue mb-1">{stats.totalScripts}</div>
                  <div className="text-xs text-muted-foreground">Total Scripts</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-neon-purple mb-1">{stats.totalVoiceClips}</div>
                  <div className="text-xs text-muted-foreground">Voice Clips</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-neon-pink mb-1">{stats.storageUsed} MB</div>
                  <div className="text-xs text-muted-foreground">Storage Used</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-glass border-glass-border shadow-glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-neon-blue" />
                Scripts Generated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-neon-blue mb-2">{stats.totalScripts}</div>
                <p className="text-xs text-muted-foreground">Ready for voiceover</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-glass border-glass-border shadow-glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mic className="h-4 w-4 text-neon-purple" />
                Voice Clips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-neon-purple mb-2">{stats.totalVoiceClips}</div>
                <p className="text-xs text-muted-foreground">Professional quality</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-glass border-glass-border shadow-glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Download className="h-4 w-4 text-neon-pink" />
                Total Downloads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-neon-pink mb-2">{stats.totalDownloads}</div>
                <p className="text-xs text-muted-foreground">Files exported</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-glass border-glass-border">
            <TabsTrigger 
              value="generate" 
              className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Scripts
            </TabsTrigger>
            <TabsTrigger 
              value="voice" 
              className="data-[state=active]:bg-gradient-secondary data-[state=active]:text-white"
            >
              <Mic className="h-4 w-4 mr-2" />
              Voice Generation
            </TabsTrigger>
            <TabsTrigger 
              value="library" 
              className="data-[state=active]:bg-gradient-accent data-[state=active]:text-white"
            >
              <Library className="h-4 w-4 mr-2" />
              Content Library
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <ScriptGenerator onScriptGenerated={loadStats} />
          </TabsContent>

          <TabsContent value="voice" className="space-y-6">
            <VoiceGenerator onVoiceGenerated={loadStats} />
          </TabsContent>

          <TabsContent value="library" className="space-y-6">
            <ContentLibrary />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}