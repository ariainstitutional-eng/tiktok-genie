import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Video, 
  FileText, 
  Mic, 
  Search, 
  Filter,
  Download,
  Play,
  Copy,
  Trash2,
  Clock,
  TrendingUp
} from "lucide-react";

// Mock data for demonstration
const MOCK_SCRIPTS = [
  {
    id: 1,
    title: "3 Money Hacks That Actually Work",
    niche: "Money Hacks",
    content: "Did you know these 3 money hacks can save you $500+ monthly? First, automate your savings...",
    createdAt: "2024-01-15",
    wordCount: 45,
    estimatedDuration: 22
  },
  {
    id: 2,
    title: "AI Tools Replacing 5 Jobs",
    niche: "Tech Facts",
    content: "These AI tools are literally replacing entire job roles right now. Number 3 will shock you...",
    createdAt: "2024-01-14",
    wordCount: 38,
    estimatedDuration: 19
  },
  {
    id: 3,
    title: "Psychology Trick for Confidence",
    niche: "Psychology Facts",
    content: "This psychology trick instantly boosts your confidence in any situation. Here's how it works...",
    createdAt: "2024-01-13",
    wordCount: 42,
    estimatedDuration: 21
  }
];

const MOCK_VOICES = [
  {
    id: 1,
    title: "Money Hacks Voiceover",
    script: "3 Money Hacks That Actually Work",
    voice: "Rachel",
    duration: 22,
    createdAt: "2024-01-15",
    size: "1.2 MB"
  },
  {
    id: 2,
    title: "AI Tools Narration",
    script: "AI Tools Replacing 5 Jobs", 
    voice: "Antoni",
    duration: 19,
    createdAt: "2024-01-14",
    size: "980 KB"
  }
];

export function ContentLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("scripts");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
            Scripts ({MOCK_SCRIPTS.length})
          </TabsTrigger>
          <TabsTrigger value="voices" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Voices ({MOCK_VOICES.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scripts" className="space-y-4">
          <div className="grid gap-4">
            {MOCK_SCRIPTS.map((script) => (
              <Card key={script.id} className="bg-glass border-glass-border shadow-glass">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{script.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {script.niche}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {script.estimatedDuration}s
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(script.content)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {script.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{script.wordCount} words</span>
                    <span>Created {script.createdAt}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="voices" className="space-y-4">
          <div className="grid gap-4">
            {MOCK_VOICES.map((voice) => (
              <Card key={voice.id} className="bg-glass border-glass-border shadow-glass">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{voice.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {voice.voice} Voice
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {voice.duration}s
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost">
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Based on: "{voice.script}"
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{voice.size}</span>
                    <span>Created {voice.createdAt}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Usage Stats */}
      <Card className="bg-glass border-glass-border shadow-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-neon-blue" />
            Usage Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-secondary/20 rounded-lg border border-secondary/30">
              <div className="text-2xl font-bold text-neon-blue mb-1">47</div>
              <div className="text-sm text-muted-foreground">Total Scripts</div>
            </div>
            <div className="text-center p-4 bg-secondary/20 rounded-lg border border-secondary/30">
              <div className="text-2xl font-bold text-neon-purple mb-1">23</div>
              <div className="text-sm text-muted-foreground">Voice Clips</div>
            </div>
            <div className="text-center p-4 bg-secondary/20 rounded-lg border border-secondary/30">
              <div className="text-2xl font-bold text-neon-pink mb-1">18.2 MB</div>
              <div className="text-sm text-muted-foreground">Storage Used</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}