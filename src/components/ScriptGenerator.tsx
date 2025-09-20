import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Copy, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const NICHES = [
  "Tech Facts",
  "History Stories", 
  "Science Discoveries",
  "Life Hacks",
  "Motivational",
  "Psychology Facts",
  "Business Tips",
  "Health & Wellness"
];

interface ScriptGeneratorProps {
  onScriptGenerated?: () => void;
}

export function ScriptGenerator({ onScriptGenerated }: ScriptGeneratorProps) {
  const [selectedNiche, setSelectedNiche] = useState("");
  const [promptExtra, setPromptExtra] = useState("");
  const [generatedScript, setGeneratedScript] = useState("");
  const [title, setTitle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateScript = async () => {
    if (!selectedNiche) {
      toast({
        title: "Missing niche",
        description: "Please select a content niche.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-script', {
        body: { 
          niche: selectedNiche.toLowerCase(),
          promptExtra: promptExtra || ""
        }
      });

      if (error) throw error;

      setGeneratedScript(data.script);
      setTitle(data.title);

      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      await supabase.from('scripts').insert({
        title: `Script - ${selectedNiche} - ${new Date().toLocaleDateString()}`,
        content: data.script,
        niche: selectedNiche,
        prompt_extra: promptExtra,
        word_count: data.script.split(' ').length,
        user_id: user.id
      });
      onScriptGenerated?.();
      
      toast({
        title: "Script generated!",
        description: "Your content is ready for review.",
      });
    } catch (error) {
      console.error('Error generating script:', error);
      toast({
        title: "Generation failed",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyScript = () => {
    navigator.clipboard.writeText(generatedScript);
    toast({
      title: "Copied!",
      description: "Script copied to clipboard.",
    });
  };

  const downloadScript = () => {
    if (!generatedScript) return;
    
    const blob = new Blob([generatedScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'script'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "Script saved to your device.",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Panel */}
      <Card className="bg-glass border-glass-border shadow-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-neon-blue" />
            Generate Script
          </CardTitle>
          <CardDescription>
            Create engaging 20-second scripts for TikTok and Instagram Reels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="niche">Content Niche</Label>
            <Select value={selectedNiche} onValueChange={setSelectedNiche}>
              <SelectTrigger>
                <SelectValue placeholder="Select your niche" />
              </SelectTrigger>
              <SelectContent>
                {NICHES.map((n) => (
                  <SelectItem key={n} value={n}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-prompt">Custom Instructions (Optional)</Label>
            <Textarea
              id="custom-prompt"
              placeholder="Add specific details, tone, or requirements..."
              value={promptExtra}
              onChange={(e) => setPromptExtra(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <Button 
            onClick={generateScript}
            disabled={isGenerating || !selectedNiche}
            className="w-full bg-gradient-primary hover:opacity-90 text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Script
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Output Panel */}
      <Card className="bg-glass border-glass-border shadow-glass">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Generated Script
            {generatedScript && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyScript}
                  className="text-neon-blue border-neon-blue/30"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadScript}
                  className="text-neon-green border-neon-green/30"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardTitle>
          <CardDescription>
            Ready-to-use script optimized for maximum engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          {generatedScript ? (
            <div className="space-y-4">
              <div className="p-4 bg-secondary/20 border border-secondary/30 rounded-lg">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {generatedScript}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-neon-blue">
                  Hook: First 3 seconds
                </Badge>
                <Badge variant="secondary" className="text-neon-purple">
                  CTA: Check bio
                </Badge>
                <Badge variant="secondary" className="text-neon-pink">
                  20-22 seconds
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Your generated script will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}