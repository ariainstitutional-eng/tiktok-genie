import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScriptGenerator } from "@/components/ScriptGenerator";
import { VoiceGenerator } from "@/components/VoiceGenerator";
import { ContentLibrary } from "@/components/ContentLibrary";
import { 
  Zap, 
  Mic, 
  Video, 
  TrendingUp, 
  Sparkles,
  Play,
  Download
} from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("scripts");

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-10"></div>
        <div className="relative px-6 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-glass border border-glass-border rounded-full px-4 py-2 mb-6">
              <Sparkles className="h-4 w-4 text-neon-blue" />
              <span className="text-sm text-muted-foreground">Automated Content Creation</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Content Creator Studio
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Generate viral TikTok & Instagram content with AI-powered scripts, 
              professional voiceovers, and automated video creation.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Badge variant="secondary" className="px-4 py-2">
                <Zap className="h-4 w-4 mr-2" />
                AI Scripts
              </Badge>
              <Badge variant="secondary" className="px-4 py-2">
                <Mic className="h-4 w-4 mr-2" />
                Voice Generation  
              </Badge>
              <Badge variant="secondary" className="px-4 py-2">
                <Video className="h-4 w-4 mr-2" />
                Video Assets
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="scripts" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Scripts
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Voice
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Library
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scripts" className="space-y-6">
            <ScriptGenerator />
          </TabsContent>

          <TabsContent value="voice" className="space-y-6">
            <VoiceGenerator />
          </TabsContent>

          <TabsContent value="library" className="space-y-6">
            <ContentLibrary />
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card className="bg-glass border-glass-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Scripts Generated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neon-blue">47</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +12% from last week
              </p>
            </CardContent>
          </Card>

          <Card className="bg-glass border-glass-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Voice Clips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neon-purple">23</div>
              <p className="text-xs text-muted-foreground">
                <Play className="h-3 w-3 inline mr-1" />
                Ready for export
              </p>
            </CardContent>
          </Card>

          <Card className="bg-glass border-glass-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neon-pink">156</div>
              <p className="text-xs text-muted-foreground">
                <Download className="h-3 w-3 inline mr-1" />
                Content exported
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;