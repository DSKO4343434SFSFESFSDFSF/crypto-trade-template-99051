import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";
import { 
  Settings as SettingsIcon, 
  DollarSign, 
  Shield, 
  Bell, 
  Palette, 
  Zap,
  Save,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Eye,
  Lock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import portfolioSettingsService, { PortfolioSettings } from "@/services/portfolioSettings";



const Settings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<PortfolioSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const userSettings = await portfolioSettingsService.getUserSettings(user.id);
      setSettings(userSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Validate settings before saving
      const validation = portfolioSettingsService.validateSettings(settings);
      if (!validation.isValid) {
        toast({
          title: "Validation Error",
          description: validation.errors.join(', '),
          variant: "destructive",
        });
        return;
      }

      await portfolioSettingsService.upsertSettings({
        ...settings,
        user_id: user.id,
      });

      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const defaultSettings = await portfolioSettingsService.resetToDefaults(user.id);
      setSettings(defaultSettings);
      toast({
        title: "Settings Reset",
        description: "All settings have been reset to default values",
      });
    } catch (error) {
      console.error('Error resetting settings:', error);
      toast({
        title: "Error",
        description: "Failed to reset settings",
        variant: "destructive",
      });
    }
  };

  const updateSetting = (key: keyof PortfolioSettings, value: any) => {
    if (!settings) return;
    setSettings(prev => prev ? { ...prev, [key]: value } : null);
  };

  if (loading || !settings) {
    return (
      <div className="flex h-screen bg-[#0A0A0A]">
        <Sidebar className="w-64 flex-shrink-0" />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0A0A0A]">
      <Sidebar className="w-64 flex-shrink-0" />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-8 h-8 text-green-500" />
              <div>
                <h1 className="text-3xl font-bold text-white">Portfolio Settings</h1>
                <p className="text-gray-400">Customize your crypto trading experience</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={resetToDefaults}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
              <Button
                onClick={saveSettings}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="trading" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 bg-gray-800">
              <TabsTrigger value="trading" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Trading
              </TabsTrigger>
              <TabsTrigger value="risk" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Risk
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Alerts
              </TabsTrigger>
              <TabsTrigger value="display" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Display
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Advanced
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* Trading Preferences */}
            <TabsContent value="trading" className="space-y-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    Trading Preferences
                  </CardTitle>
                  <CardDescription>Configure your default trading settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="trading-amount" className="text-white">Default Trading Amount</Label>
                      <Input
                        id="trading-amount"
                        type="number"
                        value={settings.default_trading_amount}
                        onChange={(e) => updateSetting('default_trading_amount', parseFloat(e.target.value) || 0)}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency" className="text-white">Preferred Currency</Label>
                      <Select
                        value={settings.preferred_currency}
                        onValueChange={(value) => updateSetting('preferred_currency', value)}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                          <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                          <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Risk Tolerance</Label>
                    <Select
                      value={settings.risk_tolerance}
                      onValueChange={(value) => updateSetting('risk_tolerance', value)}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Conservative approach</SelectItem>
                        <SelectItem value="medium">Medium - Balanced approach</SelectItem>
                        <SelectItem value="high">High - Aggressive approach</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator className="bg-gray-700" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Auto Rebalancing</Label>
                        <p className="text-sm text-gray-400">Automatically rebalance portfolio based on target allocation</p>
                      </div>
                      <Switch
                        checked={settings.auto_rebalancing}
                        onCheckedChange={(checked) => updateSetting('auto_rebalancing', checked)}
                      />
                    </div>

                    {settings.auto_rebalancing && (
                      <div className="space-y-2">
                        <Label className="text-white">Rebalancing Frequency</Label>
                        <Select
                          value={settings.rebalancing_frequency}
                          onValueChange={(value) => updateSetting('rebalancing_frequency', value)}
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Risk Management */}
            <TabsContent value="risk" className="space-y-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-yellow-500" />
                    Risk Management
                  </CardTitle>
                  <CardDescription>Set limits and risk controls for your trading</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-white">Daily Trading Limit</Label>
                      <Input
                        type="number"
                        value={settings.daily_trading_limit}
                        onChange={(e) => updateSetting('daily_trading_limit', parseFloat(e.target.value) || 0)}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Max Portfolio Exposure (%)</Label>
                      <Input
                        type="number"
                        value={settings.max_portfolio_exposure}
                        onChange={(e) => updateSetting('max_portfolio_exposure', parseFloat(e.target.value) || 0)}
                        className="bg-gray-800 border-gray-600 text-white"
                        max="100"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">Stop Loss Percentage: {settings.stop_loss_percentage}%</Label>
                      <Slider
                        value={[settings.stop_loss_percentage]}
                        onValueChange={(value) => updateSetting('stop_loss_percentage', value[0])}
                        max={50}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Take Profit Percentage: {settings.take_profit_percentage}%</Label>
                      <Slider
                        value={[settings.take_profit_percentage]}
                        onValueChange={(value) => updateSetting('take_profit_percentage', value[0])}
                        max={100}
                        min={5}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      <span className="text-yellow-500 font-medium">Risk Warning</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      These settings help manage risk but don't guarantee profits or prevent losses. 
                      Cryptocurrency trading involves substantial risk of loss.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-500" />
                    Notifications & Alerts
                  </CardTitle>
                  <CardDescription>Configure how you receive trading alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Price Alerts</Label>
                        <p className="text-sm text-gray-400">Get notified of significant price changes</p>
                      </div>
                      <Switch
                        checked={settings.price_alerts_enabled}
                        onCheckedChange={(checked) => updateSetting('price_alerts_enabled', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Portfolio Alerts</Label>
                        <p className="text-sm text-gray-400">Get notified of portfolio performance changes</p>
                      </div>
                      <Switch
                        checked={settings.portfolio_alerts_enabled}
                        onCheckedChange={(checked) => updateSetting('portfolio_alerts_enabled', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Email Notifications</Label>
                        <p className="text-sm text-gray-400">Receive alerts via email</p>
                      </div>
                      <Switch
                        checked={settings.email_notifications}
                        onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Push Notifications</Label>
                        <p className="text-sm text-gray-400">Receive alerts as push notifications</p>
                      </div>
                      <Switch
                        checked={settings.push_notifications}
                        onCheckedChange={(checked) => updateSetting('push_notifications', checked)}
                      />
                    </div>
                  </div>

                  <Separator className="bg-gray-700" />

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-white">Price Change Alert Threshold (%)</Label>
                      <Input
                        type="number"
                        value={(settings.alert_thresholds as any)?.price_change || 5}
                        onChange={(e) => updateSetting('alert_thresholds', {
                          ...(settings.alert_thresholds as any),
                          price_change: parseFloat(e.target.value) || 0
                        })}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Portfolio Change Alert Threshold (%)</Label>
                      <Input
                        type="number"
                        value={(settings.alert_thresholds as any)?.portfolio_change || 10}
                        onChange={(e) => updateSetting('alert_thresholds', {
                          ...(settings.alert_thresholds as any),
                          portfolio_change: parseFloat(e.target.value) || 0
                        })}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Display Preferences */}
            <TabsContent value="display" className="space-y-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-500" />
                    Display Preferences
                  </CardTitle>
                  <CardDescription>Customize the appearance of your dashboard</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-white">Theme</Label>
                      <Select
                        value={settings.theme_preference}
                        onValueChange={(value) => updateSetting('theme_preference', value)}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="auto">Auto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Chart Type</Label>
                      <Select
                        value={settings.chart_type}
                        onValueChange={(value) => updateSetting('chart_type', value)}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="line">Line</SelectItem>
                          <SelectItem value="candlestick">Candlestick</SelectItem>
                          <SelectItem value="area">Area</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Default Time Range</Label>
                      <Select
                        value={settings.default_time_range}
                        onValueChange={(value) => updateSetting('default_time_range', value)}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1h">1 Hour</SelectItem>
                          <SelectItem value="24h">24 Hours</SelectItem>
                          <SelectItem value="7d">7 Days</SelectItem>
                          <SelectItem value="30d">30 Days</SelectItem>
                          <SelectItem value="1y">1 Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator className="bg-gray-700" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Show Portfolio Value</Label>
                        <p className="text-sm text-gray-400">Display total portfolio value on dashboard</p>
                      </div>
                      <Switch
                        checked={settings.show_portfolio_value}
                        onCheckedChange={(checked) => updateSetting('show_portfolio_value', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Show Profit/Loss</Label>
                        <p className="text-sm text-gray-400">Display profit/loss information</p>
                      </div>
                      <Switch
                        checked={settings.show_profit_loss}
                        onCheckedChange={(checked) => updateSetting('show_profit_loss', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Features */}
            <TabsContent value="advanced" className="space-y-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-500" />
                    Advanced Features
                  </CardTitle>
                  <CardDescription>Enable advanced trading features</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Paper Trading Mode</Label>
                        <p className="text-sm text-gray-400">Practice trading without real money</p>
                        <Badge variant="secondary" className="mt-1">Safe for beginners</Badge>
                      </div>
                      <Switch
                        checked={settings.paper_trading_mode}
                        onCheckedChange={(checked) => updateSetting('paper_trading_mode', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">API Trading</Label>
                        <p className="text-sm text-gray-400">Enable API-based automated trading</p>
                        <Badge variant="destructive" className="mt-1">Advanced users only</Badge>
                      </div>
                      <Switch
                        checked={settings.api_trading_enabled}
                        onCheckedChange={(checked) => updateSetting('api_trading_enabled', checked)}
                      />
                    </div>
                  </div>

                  {settings.api_trading_enabled && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <span className="text-red-500 font-medium">High Risk Feature</span>
                      </div>
                      <p className="text-sm text-gray-300">
                        API trading can execute trades automatically. Only enable if you understand the risks 
                        and have proper safeguards in place.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security */}
            <TabsContent value="security" className="space-y-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-red-500" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>Protect your account and trading activities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Two-Factor Authentication Required</Label>
                        <p className="text-sm text-gray-400">Require 2FA for all trading activities</p>
                        <Badge variant="outline" className="mt-1">Recommended</Badge>
                      </div>
                      <Switch
                        checked={settings.two_factor_required}
                        onCheckedChange={(checked) => updateSetting('two_factor_required', checked)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Session Timeout (minutes)</Label>
                    <Select
                      value={settings.session_timeout_minutes.toString()}
                      onValueChange={(value) => updateSetting('session_timeout_minutes', parseInt(value))}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="240">4 hours</SelectItem>
                        <SelectItem value="1440">24 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-green-500" />
                      <span className="text-green-500 font-medium">Security Tip</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      Enable 2FA and use shorter session timeouts for better security, 
                      especially when trading with significant amounts.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;