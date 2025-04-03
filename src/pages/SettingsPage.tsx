
import React, { useState } from 'react';
import { ArrowLeft, User, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import AppHeader from '@/components/layout/AppHeader';
import { useTheme } from '@/hooks/use-theme';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useForm } from 'react-hook-form';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface UserSettings {
  username: string;
  email: string;
  notifications: boolean;
  language: string;
}

const SettingsPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();
  const [settings, setSettings] = useState<UserSettings>({
    username: 'User',
    email: 'user@example.com',
    notifications: true,
    language: 'English'
  });

  const form = useForm<UserSettings>({
    defaultValues: settings
  });

  const goBack = () => {
    navigate('/');
  };

  const saveSettings = (data: UserSettings) => {
    setSettings(data);
    localStorage.setItem('userSettings', JSON.stringify(data));
    toast({
      title: "Settings saved",
      description: "Your settings have been successfully updated.",
    });
  };

  const handleLoginClick = () => {
    toast({
      title: "Login functionality",
      description: "Login functionality will be implemented in future updates.",
    });
  };

  const languages = [
    { value: "English", label: "English" },
    { value: "Polish", label: "Polski" },
    { value: "Spanish", label: "Español" },
    { value: "French", label: "Français" }
  ];

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    form.setValue('language', newLang);
    
    // Update settings immediately for the UI
    setSettings(prev => ({...prev, language: newLang}));
    
    toast({
      title: newLang === "Polish" ? "Zmieniono język" : "Language changed",
      description: newLang === "Polish" ? "Język został zmieniony na Polski" : `Language has been changed to ${newLang}`,
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
      <div className="flex items-center mb-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goBack} 
          className="mr-2"
          aria-label="Go back to home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <AppHeader 
          title="Settings" 
          subtitle="Customize your app experience"
          className="py-0"
        />
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        {/* User profile section */}
        <Card className="p-4 sm:p-6 space-y-4 flex-1">
          <div className="flex items-center gap-3 sm:gap-4">
            <Avatar className="h-14 w-14 sm:h-16 sm:w-16">
              <AvatarImage src="" alt={settings.username} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg sm:text-xl">
                {settings.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold">{settings.username}</h3>
              <p className="text-sm text-muted-foreground">{settings.email}</p>
            </div>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button className="w-full">Edit Profile</Button>
            </SheetTrigger>
            <SheetContent className={isMobile ? "w-full" : ""}>
              <SheetHeader>
                <SheetTitle>Edit Profile</SheetTitle>
                <SheetDescription>
                  Make changes to your profile here. Click save when you're done.
                </SheetDescription>
              </SheetHeader>
              
              <form onSubmit={form.handleSubmit(saveSettings)} className="space-y-6 py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username"
                      placeholder="Your display name"
                      {...form.register('username')}
                      defaultValue={settings.username}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      type="email"
                      placeholder="Your email address"
                      {...form.register('email')}
                      defaultValue={settings.email}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <select 
                      id="language"
                      className="bg-background w-full border rounded px-3 py-2 text-base"
                      {...form.register('language')}
                      defaultValue={settings.language}
                    >
                      {languages.map(lang => (
                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications">Notifications</Label>
                    <Switch 
                      id="notifications"
                      checked={settings.notifications}
                      onCheckedChange={(checked) => {
                        form.setValue('notifications', checked);
                      }}
                    />
                  </div>
                </div>
                
                <SheetFooter className={isMobile ? "flex-col" : ""}>
                  <SheetClose asChild>
                    <Button type="submit" className={isMobile ? "w-full" : ""}>Save changes</Button>
                  </SheetClose>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>

          <Button 
            onClick={handleLoginClick} 
            variant="outline"
            className="w-full"
          >
            <User className="mr-2 h-4 w-4" />
            Login
          </Button>
        </Card>

        {/* App settings section */}
        <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1">
          <h3 className="text-lg font-medium">App Settings</h3>
          
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Sun className={`h-5 w-5 ${theme === 'light' ? 'text-primary' : 'text-muted-foreground'}`} />
                <Switch 
                  checked={theme === 'dark'}
                  onCheckedChange={toggleTheme}
                />
                <Moon className={`h-5 w-5 ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="space-y-0.5">
                <Label>Language</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Select your preferred language
                </p>
              </div>
              <select 
                className="bg-background border rounded px-3 py-2 w-full sm:w-auto text-base"
                value={settings.language}
                onChange={handleLanguageChange}
              >
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
