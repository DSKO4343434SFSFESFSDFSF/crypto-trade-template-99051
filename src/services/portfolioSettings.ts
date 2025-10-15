import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type PortfolioSettings = Tables<"portfolio_settings">;
export type PortfolioSettingsInsert = TablesInsert<"portfolio_settings">;
export type PortfolioSettingsUpdate = TablesUpdate<"portfolio_settings">;

export const portfolioSettingsService = {
  /**
   * Get user's portfolio settings, creating default ones if they don't exist
   */
  async getUserSettings(userId: string): Promise<PortfolioSettings | null> {
    try {
      const { data, error } = await supabase
        .from('portfolio_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // No settings found, create default ones
        return await this.createDefaultSettings(userId);
      }

      if (error) {
        console.error('Error fetching portfolio settings:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserSettings:', error);
      throw error;
    }
  },

  /**
   * Create default settings for a user
   */
  async createDefaultSettings(userId: string): Promise<PortfolioSettings> {
    const defaultSettings: PortfolioSettingsInsert = {
      user_id: userId,
      default_trading_amount: 100,
      preferred_currency: 'USD',
      risk_tolerance: 'medium',
      auto_rebalancing: false,
      rebalancing_frequency: 'monthly',
      target_allocation: {},
      daily_trading_limit: 1000,
      stop_loss_percentage: 10,
      take_profit_percentage: 25,
      max_portfolio_exposure: 80,
      price_alerts_enabled: true,
      portfolio_alerts_enabled: true,
      email_notifications: true,
      push_notifications: true,
      alert_thresholds: { price_change: 5, portfolio_change: 10 },
      theme_preference: 'dark',
      chart_type: 'candlestick',
      default_time_range: '24h',
      show_portfolio_value: true,
      show_profit_loss: true,
      paper_trading_mode: false,
      api_trading_enabled: false,
      two_factor_required: false,
      session_timeout_minutes: 60,
    };

    const { data, error } = await supabase
      .from('portfolio_settings')
      .insert(defaultSettings)
      .select()
      .single();

    if (error) {
      console.error('Error creating default settings:', error);
      throw error;
    }

    return data;
  },

  /**
   * Update user's portfolio settings
   */
  async updateSettings(userId: string, updates: PortfolioSettingsUpdate): Promise<PortfolioSettings> {
    const { data, error } = await supabase
      .from('portfolio_settings')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating portfolio settings:', error);
      throw error;
    }

    return data;
  },

  /**
   * Upsert user's portfolio settings (insert or update)
   */
  async upsertSettings(settings: PortfolioSettingsInsert): Promise<PortfolioSettings> {
    const { data, error } = await supabase
      .from('portfolio_settings')
      .upsert(settings)
      .select()
      .single();

    if (error) {
      console.error('Error upserting portfolio settings:', error);
      throw error;
    }

    return data;
  },

  /**
   * Update target allocation for a user
   */
  async updateTargetAllocation(userId: string, allocation: Record<string, any>): Promise<boolean> {
    // Validate that allocations sum to 100 or less
    const totalAllocation = Object.values(allocation).reduce(
      (sum, item: any) => sum + (parseFloat(item.percentage) || 0), 
      0
    );

    if (totalAllocation > 100) {
      throw new Error('Total allocation cannot exceed 100%');
    }

    const { error } = await supabase
      .from('portfolio_settings')
      .update({ 
        target_allocation: allocation,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating target allocation:', error);
      throw error;
    }

    return true;
  },

  /**
   * Reset settings to defaults
   */
  async resetToDefaults(userId: string): Promise<PortfolioSettings> {
    const defaultSettings: PortfolioSettingsUpdate = {
      default_trading_amount: 100,
      preferred_currency: 'USD',
      risk_tolerance: 'medium',
      auto_rebalancing: false,
      rebalancing_frequency: 'monthly',
      target_allocation: {},
      daily_trading_limit: 1000,
      stop_loss_percentage: 10,
      take_profit_percentage: 25,
      max_portfolio_exposure: 80,
      price_alerts_enabled: true,
      portfolio_alerts_enabled: true,
      email_notifications: true,
      push_notifications: true,
      alert_thresholds: { price_change: 5, portfolio_change: 10 },
      theme_preference: 'dark',
      chart_type: 'candlestick',
      default_time_range: '24h',
      show_portfolio_value: true,
      show_profit_loss: true,
      paper_trading_mode: false,
      api_trading_enabled: false,
      two_factor_required: false,
      session_timeout_minutes: 60,
    };

    return await this.updateSettings(userId, defaultSettings);
  },

  /**
   * Get user's risk profile based on settings
   */
  getRiskProfile(settings: PortfolioSettings): {
    level: string;
    score: number;
    recommendations: string[];
  } {
    let score = 0;
    const recommendations: string[] = [];

    // Risk tolerance scoring
    switch (settings.risk_tolerance) {
      case 'low':
        score += 1;
        break;
      case 'medium':
        score += 2;
        break;
      case 'high':
        score += 3;
        break;
    }

    // Stop loss scoring (lower percentage = higher risk tolerance)
    if (settings.stop_loss_percentage <= 5) score += 3;
    else if (settings.stop_loss_percentage <= 10) score += 2;
    else score += 1;

    // Max exposure scoring
    if (settings.max_portfolio_exposure >= 90) score += 3;
    else if (settings.max_portfolio_exposure >= 70) score += 2;
    else score += 1;

    // Daily limit scoring (relative to default)
    if (settings.daily_trading_limit >= 5000) score += 3;
    else if (settings.daily_trading_limit >= 1000) score += 2;
    else score += 1;

    // Generate recommendations based on score
    if (score <= 4) {
      recommendations.push("Consider enabling auto-rebalancing for better risk management");
      recommendations.push("Your conservative approach is good for long-term stability");
    } else if (score <= 8) {
      recommendations.push("Your balanced approach allows for growth with managed risk");
      recommendations.push("Consider reviewing your stop-loss settings periodically");
    } else {
      recommendations.push("High-risk approach - ensure you can afford potential losses");
      recommendations.push("Consider enabling 2FA for additional security");
      recommendations.push("Monitor your positions closely with these aggressive settings");
    }

    const level = score <= 4 ? 'Conservative' : score <= 8 ? 'Moderate' : 'Aggressive';

    return { level, score, recommendations };
  },

  /**
   * Validate settings before saving
   */
  validateSettings(settings: Partial<PortfolioSettings>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (settings.default_trading_amount !== undefined && settings.default_trading_amount <= 0) {
      errors.push("Default trading amount must be greater than 0");
    }

    if (settings.daily_trading_limit !== undefined && settings.daily_trading_limit <= 0) {
      errors.push("Daily trading limit must be greater than 0");
    }

    if (settings.stop_loss_percentage !== undefined && 
        (settings.stop_loss_percentage < 0 || settings.stop_loss_percentage > 100)) {
      errors.push("Stop loss percentage must be between 0 and 100");
    }

    if (settings.take_profit_percentage !== undefined && settings.take_profit_percentage < 0) {
      errors.push("Take profit percentage must be greater than or equal to 0");
    }

    if (settings.max_portfolio_exposure !== undefined && 
        (settings.max_portfolio_exposure < 0 || settings.max_portfolio_exposure > 100)) {
      errors.push("Max portfolio exposure must be between 0 and 100");
    }

    if (settings.session_timeout_minutes !== undefined && 
        (settings.session_timeout_minutes < 15 || settings.session_timeout_minutes > 1440)) {
      errors.push("Session timeout must be between 15 and 1440 minutes");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

export default portfolioSettingsService;