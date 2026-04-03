const { query, getClient } = require('../../config/db');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

/**
 * Get all fund categories
 */
const getCategories = async () => {
  const result = await query('SELECT * FROM fund_categories WHERE is_active = true ORDER BY name');
  return result.rows;
};

/**
 * Create a fund campaign
 */
const createCampaign = async (userId, data) => {
  const { title, description, target_amount, category_id, image_url, urgency, end_date } = data;

  // Duplicate detection
  const duplicate = await query(
    `SELECT id FROM fund_campaigns 
     WHERE creator_id = $1 AND title ILIKE $2 AND status = 'active' 
     AND created_at > NOW() - INTERVAL '24 hours'`,
    [userId, `%${title}%`]
  );

  if (duplicate.rows.length > 0) {
    throw new Error('A similar campaign already exists. Please check your active campaigns.');
  }

  const result = await query(
    `INSERT INTO fund_campaigns (creator_id, category_id, title, description, target_amount, image_url, urgency, end_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [userId, category_id || null, title, description, parseFloat(target_amount), image_url || null, urgency || 'normal', end_date || null]
  );

  return result.rows[0];
};

/**
 * List campaigns with filters
 */
const listCampaigns = async (page = 1, limit = 20, category_id = null, status = 'active') => {
  const offset = (page - 1) * limit;
  let whereClause = 'WHERE fc.status = $3';
  const params = [limit, offset, status];

  if (category_id) {
    whereClause += ` AND fc.category_id = $4`;
    params.push(category_id);
  }

  const result = await query(
    `SELECT fc.*, u.name as creator_name, u.trust_score, u.is_verified,
     cat.name as category_name, cat.icon as category_icon,
     ROUND((fc.raised_amount / NULLIF(fc.target_amount, 0)) * 100, 2) as progress_percentage,
     (SELECT COUNT(*) FROM fund_transactions WHERE campaign_id = fc.id AND payment_status = 'success') as donor_count
     FROM fund_campaigns fc
     JOIN users u ON fc.creator_id = u.id
     LEFT JOIN fund_categories cat ON fc.category_id = cat.id
     ${whereClause}
     ORDER BY 
       CASE fc.urgency 
         WHEN 'critical' THEN 1 
         WHEN 'urgent' THEN 2 
         ELSE 3 
       END,
       fc.created_at DESC
     LIMIT $1 OFFSET $2`,
    params
  );

  const countResult = await query(
    `SELECT COUNT(*) FROM fund_campaigns fc ${whereClause.replace('$3', '$1').replace('$4', '$2')}`,
    category_id ? [status, category_id] : [status]
  );

  return {
    campaigns: result.rows,
    total: parseInt(countResult.rows[0].count),
    page,
    limit,
    totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
  };
};

/**
 * Create a Cashfree payment order
 * Documentation: https://docs.cashfree.com/reference/pgcreateorder
 */
const createDonationOrder = async (campaignId, donorData) => {
  const { amount, donor_name, donor_email, donor_phone, donor_id, is_anonymous } = donorData;

  // Verify campaign exists and is active
  const campaign = await query('SELECT * FROM fund_campaigns WHERE id = $1 AND status = $2', [campaignId, 'active']);
  if (campaign.rows.length === 0) {
    throw new Error('Campaign not found or no longer active');
  }

  const orderId = `SAHYOG_${Date.now()}_${uuidv4().substring(0, 8)}`;

  // Create transaction record
  const transaction = await query(
    `INSERT INTO fund_transactions (campaign_id, donor_id, amount, donor_name, donor_email, donor_phone, cashfree_order_id, is_anonymous, payment_status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending') RETURNING *`,
    [campaignId, donor_id || null, parseFloat(amount), donor_name, donor_email, donor_phone, orderId, is_anonymous || false]
  );

  // Create Cashfree order
  const cashfreeAppId = process.env.CASHFREE_APP_ID;
  const cashfreeSecretKey = process.env.CASHFREE_SECRET_KEY;
  const cashfreeApiUrl = process.env.CASHFREE_API_URL || 'https://sandbox.cashfree.com/pg';

  if (!cashfreeAppId || cashfreeAppId === 'your_cashfree_app_id') {
    // Development mode - return mock order
    console.log('⚠️ [DEV MODE] Cashfree credentials not configured. Returning mock order.');
    return {
      order_id: orderId,
      transaction_id: transaction.rows[0].id,
      payment_session_id: `mock_session_${orderId}`,
      order_status: 'ACTIVE',
      payment_link: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/mock/${orderId}`,
      environment: 'development',
    };
  }

  try {
    const response = await fetch(`${cashfreeApiUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': cashfreeAppId,
        'x-client-secret': cashfreeSecretKey,
        'x-api-version': '2023-08-01',
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: parseFloat(amount),
        order_currency: 'INR',
        customer_details: {
          customer_id: donor_id || `guest_${Date.now()}`,
          customer_name: donor_name,
          customer_email: donor_email,
          customer_phone: donor_phone,
        },
        order_meta: {
          return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/status/${orderId}`,
          notify_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/fund/webhook/cashfree`,
        },
        order_note: `Donation for: ${campaign.rows[0].title}`,
      }),
    });

    const cashfreeOrder = await response.json();

    if (!response.ok) {
      throw new Error(cashfreeOrder.message || 'Failed to create Cashfree order');
    }

    // Update transaction with Cashfree details
    await query(
      'UPDATE fund_transactions SET cashfree_payment_id = $1 WHERE id = $2',
      [cashfreeOrder.cf_order_id || cashfreeOrder.order_id, transaction.rows[0].id]
    );

    return {
      order_id: orderId,
      transaction_id: transaction.rows[0].id,
      payment_session_id: cashfreeOrder.payment_session_id,
      order_status: cashfreeOrder.order_status,
      environment: 'production',
    };
  } catch (error) {
    // Mark transaction as failed
    await query("UPDATE fund_transactions SET payment_status = 'failed' WHERE id = $1", [transaction.rows[0].id]);
    throw error;
  }
};

/**
 * Handle Cashfree webhook
 * Verifies webhook signature and updates transaction status
 */
const handleWebhook = async (payload, signature) => {
  const webhookSecret = process.env.CASHFREE_WEBHOOK_SECRET;

  // Verify webhook signature (if secret is configured)
  if (webhookSecret && webhookSecret !== 'your_cashfree_webhook_secret') {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(payload))
      .digest('base64');

    if (signature !== expectedSignature) {
      throw new Error('Invalid webhook signature');
    }
  }

  const { data } = payload;
  if (!data || !data.order || !data.order.order_id) {
    throw new Error('Invalid webhook payload');
  }

  const orderId = data.order.order_id;
  const paymentStatus = data.payment?.payment_status || data.order.order_status;

  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Update transaction
    let dbStatus = 'pending';
    if (paymentStatus === 'SUCCESS' || paymentStatus === 'PAID') {
      dbStatus = 'success';
    } else if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') {
      dbStatus = 'failed';
    }

    const txResult = await client.query(
      `UPDATE fund_transactions SET payment_status = $1, cashfree_payment_id = $2, payment_method = $3, updated_at = NOW()
       WHERE cashfree_order_id = $4 RETURNING *`,
      [dbStatus, data.payment?.cf_payment_id || null, data.payment?.payment_group || null, orderId]
    );

    if (txResult.rows.length === 0) {
      throw new Error(`Transaction not found for order: ${orderId}`);
    }

    // If payment successful, update campaign raised amount
    if (dbStatus === 'success') {
      const tx = txResult.rows[0];
      await client.query(
        'UPDATE fund_campaigns SET raised_amount = raised_amount + $1, updated_at = NOW() WHERE id = $2',
        [tx.amount, tx.campaign_id]
      );

      // Check if campaign target reached
      const campaign = await client.query('SELECT * FROM fund_campaigns WHERE id = $1', [tx.campaign_id]);
      if (campaign.rows[0] && parseFloat(campaign.rows[0].raised_amount) >= parseFloat(campaign.rows[0].target_amount)) {
        await client.query("UPDATE fund_campaigns SET status = 'completed', updated_at = NOW() WHERE id = $1", [tx.campaign_id]);
      }

      // Boost donor trust score
      if (tx.donor_id) {
        await client.query('UPDATE users SET trust_score = LEAST(trust_score + 2, 100) WHERE id = $1', [tx.donor_id]);
      }
    }

    await client.query('COMMIT');
    return { status: dbStatus, orderId };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get transactions for a campaign or user
 */
const getTransactions = async (userId, campaignId = null, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  let whereClause = '';
  const params = [limit, offset];

  if (campaignId) {
    whereClause = 'WHERE ft.campaign_id = $3';
    params.push(campaignId);
  } else {
    whereClause = 'WHERE ft.donor_id = $3';
    params.push(userId);
  }

  const result = await query(
    `SELECT ft.*, fc.title as campaign_title
     FROM fund_transactions ft
     JOIN fund_campaigns fc ON ft.campaign_id = fc.id
     ${whereClause}
     ORDER BY ft.created_at DESC
     LIMIT $1 OFFSET $2`,
    params
  );

  return result.rows;
};

module.exports = {
  getCategories,
  createCampaign,
  listCampaigns,
  createDonationOrder,
  handleWebhook,
  getTransactions,
};
