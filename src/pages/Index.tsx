import { useState, useEffect } from "react";
import { ScriptGenerator } from "@/components/ScriptGenerator";
import { VoiceGenerator } from "@/components/VoiceGenerator";
import { ContentLibrary } from "@/components/ContentLibrary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, FileText, Mic, Library, TrendingUp, Download, Clock, Users, LogIn, UserPlus, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

export default function Index() {
  const [activeTab, setActiveTab] = useState("generate");
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalScripts: 0,
    totalVoiceClips: 0,
    storageUsed: 0,
    totalDownloads: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Welcome back!",
          description: "Successfully signed in.",
        });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Account created!",
          description: "You can now start creating content.",
        });
      }
      setShowAuth(false);
      setEmail("");
      setPassword("");
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
  };

  if (!user && !showAuth) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <Card className="w-full max-w-md bg-glass border-glass-border shadow-glass">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-primary rounded-xl">
                <Zap className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
              Content Creator Studio
            </CardTitle>
            <CardDescription>
              AI-powered script generation and voice synthesis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => { setShowAuth(true); setIsLogin(true); }}
              className="w-full bg-gradient-primary hover:opacity-90"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
            <Button 
              onClick={() => { setShowAuth(true); setIsLogin(false); }}
              variant="outline"
              className="w-full"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Create Account
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user && showAuth) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <Card className="w-full max-w-md bg-glass border-glass-border shadow-glass">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isLogin ? "Sign In" : "Create Account"}
            </CardTitle>
            <CardDescription>
              {isLogin ? "Welcome back to your content studio" : "Start creating amazing content today"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:opacity-90"
                disabled={loading}
              >
                {loading ? "Loading..." : (isLogin ? "Sign In" : "Create Account")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowAuth(false)}
              >
                Back
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
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