import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: Date;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Initialize notifications
    const initialNotifications: Notification[] = [
      {
        id: '1',
        title: 'Welcome to Content Creator Studio!',
        message: 'Start generating viral scripts and professional voiceovers for your content.',
        type: 'info',
        read: false,
        timestamp: new Date()
      },
      {
        id: '2',
        title: 'System Status',
        message: 'All AI services are operational and ready for content generation.',
        type: 'success',
        read: false,
        timestamp: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
      },
      {
        id: '3',
        title: 'Production Ready',
        message: 'Your content studio is fully configured and production-ready.',
        type: 'success',
        read: false,
        timestamp: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
      }
    ];
    
    setNotifications(initialNotifications);

    // Simulate periodic notifications for demo
    const interval = setInterval(() => {
      const tips = [
        'Tip: Use specific niches for better script targeting',
        'Tip: Try different voices to find your perfect match',
        'Tip: Keep scripts between 40-60 words for optimal engagement',
        'Success: Your content library is growing!'
      ];
      
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      const newNotification: Notification = {
        id: Date.now().toString(),
        title: 'Content Tip',
        message: randomTip,
        type: Math.random() > 0.7 ? 'success' : 'info',
        read: false,
        timestamp: new Date()
      };

      setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep last 10
    }, 120000); // Every 2 minutes

    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0 max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No notifications
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b border-border/50 hover:bg-muted/50 transition-colors ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium">{notification.title}</h4>
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-primary"></div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}