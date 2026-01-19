import { supabaseDB } from './supabaseService';
import { User, Subscription, Payment } from '../types';

class BillingService {
  /**
   * Create or update user subscription in database
   */
  async createSubscription(
    userId: string,
    razorpaySubscriptionId: string,
    startDate: string,
    endDate: string
  ): Promise<Subscription> {
    try {
      // Create or update subscription record
      const subscriptionData = {
        user_id: userId,
        plan: 'PREMIUM',
        status: 'PREMIUM_ACTIVE' as const,
        start_date: startDate,
        end_date: endDate,
        razorpay_subscription_id: razorpaySubscriptionId,
        created_at: new Date().toISOString()
      };

      // Check if subscription already exists for this user
      const { data: existingSubscription } = await supabaseDB.supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      let subscription: Subscription;
      if (existingSubscription) {
        // Update existing subscription
        const { data, error } = await supabaseDB.supabase
          .from('subscriptions')
          .update(subscriptionData)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;
        subscription = data as Subscription;
      } else {
        // Create new subscription
        const { data, error } = await supabaseDB.supabase
          .from('subscriptions')
          .insert([subscriptionData])
          .select()
          .single();

        if (error) throw error;
        subscription = data as Subscription;
      }

      // Update user's subscription status in the users table
      await supabaseDB.supabase
        .from('users')
        .update({
          subscriptionStatus: 'PREMIUM_ACTIVE',
          subscriptionEndDate: endDate
        })
        .eq('_id', userId);

      return subscription;
    } catch (error) {
      console.error('Error creating/updating subscription:', error);
      throw error;
    }
  }

  /**
   * Process payment webhook from Razorpay
   */
  async processPaymentWebhook(
    razorpayPaymentId: string,
    razorpaySubscriptionId: string,
    amount: number,
    currency: string
  ): Promise<Payment> {
    try {
      const paymentData = {
        user_id: '', // Will be determined from subscription
        amount,
        currency,
        status: 'completed' as const,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_subscription_id: razorpaySubscriptionId,
        verified: true,
        created_at: new Date().toISOString()
      };

      // First get the user ID from the subscription
      const { data: subscription } = await supabaseDB.supabase
        .from('subscriptions')
        .select('user_id')
        .eq('razorpay_subscription_id', razorpaySubscriptionId)
        .single();

      if (!subscription) {
        throw new Error(`Subscription not found for ID: ${razorpaySubscriptionId}`);
      }

      // Update payment data with user ID
      paymentData.user_id = subscription.user_id;

      // Check if payment already exists
      const { data: existingPayment } = await supabaseDB.supabase
        .from('payments')
        .select('*')
        .eq('razorpay_payment_id', razorpayPaymentId)
        .single();

      let payment: Payment;
      if (existingPayment) {
        // Update existing payment
        const { data, error } = await supabaseDB.supabase
          .from('payments')
          .update(paymentData)
          .eq('razorpay_payment_id', razorpayPaymentId)
          .select()
          .single();

        if (error) throw error;
        payment = data as Payment;
      } else {
        // Create new payment
        const { data, error } = await supabaseDB.supabase
          .from('payments')
          .insert([paymentData])
          .select()
          .single();

        if (error) throw error;
        payment = data as Payment;
      }

      return payment;
    } catch (error) {
      console.error('Error processing payment webhook:', error);
      throw error;
    }
  }

  /**
   * Handle subscription cancellation
   */
  async cancelSubscription(userId: string): Promise<void> {
    try {
      // Update subscription status to expired
      const { error } = await supabaseDB.supabase
        .from('subscriptions')
        .update({ 
          status: 'PREMIUM_EXPIRED' as const 
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Update user's subscription status
      await supabaseDB.supabase
        .from('users')
        .update({ 
          subscriptionStatus: 'PREMIUM_EXPIRED',
          subscriptionEndDate: new Date().toISOString()
        })
        .eq('_id', userId);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  /**
   * Get user's current subscription status
   */
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    try {
      const { data, error } = await supabaseDB.supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null;
        }
        throw error;
      }

      return data as Subscription;
    } catch (error) {
      console.error('Error getting user subscription:', error);
      throw error;
    }
  }

  /**
   * Check if user has active premium subscription
   */
  async hasActivePremium(userId: string): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      if (!subscription) {
        return false;
      }

      // Check if subscription is active and not expired
      const now = new Date();
      const endDate = new Date(subscription.end_date);
      
      return subscription.status === 'PREMIUM_ACTIVE' && endDate > now;
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  }

  /**
   * Check if user's subscription has expired
   */
  async isSubscriptionExpired(userId: string): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      if (!subscription) {
        return true; // No subscription means expired
      }

      const now = new Date();
      const endDate = new Date(subscription.end_date);
      
      return endDate <= now || subscription.status === 'PREMIUM_EXPIRED';
    } catch (error) {
      console.error('Error checking subscription expiry:', error);
      return true; // Default to expired if there's an error
    }
  }
}

export const billingService = new BillingService();