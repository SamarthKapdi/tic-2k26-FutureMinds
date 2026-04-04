const fundService = require('./fund.service');

/**
 * GET /api/fund/categories
 */
const getCategories = async (req, res) => {
  try {
    const categories = await fundService.getCategories();
    return res.status(200).json({ success: true, data: { categories } });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load categories' });
  }
};

/**
 * POST /api/fund/campaign/create
 */
const createCampaign = async (req, res) => {
  try {
    const { title, description, target_amount, category_id, image_url, urgency, end_date } = req.body;

    if (!title || !description || !target_amount) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and target amount are required',
      });
    }

    if (parseFloat(target_amount) < 100) {
      return res.status(400).json({
        success: false,
        message: 'Minimum target amount is ₹100',
      });
    }

    const campaign = await fundService.createCampaign(req.user.id, {
      title, description, target_amount, category_id, image_url, urgency, end_date,
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('fund:new_campaign', { ...campaign, creator_name: req.user.name });
      io.emit('dashboard:refresh');
    }

    return res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: { campaign },
    });
  } catch (error) {
    console.error('Create campaign error:', error);
    return res.status(error.message.includes('similar') ? 409 : 500).json({
      success: false,
      message: error.message || 'Failed to create campaign',
    });
  }
};

/**
 * GET /api/fund/campaign/list
 */
const listCampaigns = async (req, res) => {
  try {
    const { page = 1, limit = 20, category_id, status } = req.query;
    const result = await fundService.listCampaigns(
      parseInt(page), parseInt(limit), category_id, status || 'active'
    );

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('List campaigns error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load campaigns' });
  }
};

/**
 * POST /api/fund/donate
 */
const donate = async (req, res) => {
  try {
    const { campaign_id, amount, donor_name, donor_email, donor_phone, is_anonymous } = req.body;

    if (!campaign_id || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Campaign ID and amount are required',
      });
    }

    if (parseFloat(amount) < 1) {
      return res.status(400).json({
        success: false,
        message: 'Minimum donation amount is ₹1',
      });
    }

    const order = await fundService.createDonationOrder(campaign_id, {
      amount,
      donor_name: donor_name || (req.user ? req.user.name : 'Anonymous'),
      donor_email: donor_email || '',
      donor_phone: donor_phone || '',
      donor_id: req.user ? req.user.id : null,
      is_anonymous,
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('fund:donation', { campaign_id, amount, donor_name: donor_name || 'Anonymous' });
      io.emit('dashboard:refresh');
      io.emit('leaderboard:refresh');
    }

    return res.status(201).json({
      success: true,
      message: 'Payment order created',
      data: order,
    });
  } catch (error) {
    console.error('Donate error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to process donation',
    });
  }
};

/**
 * POST /api/fund/webhook/cashfree
 */
const webhookCashfree = async (req, res) => {
  try {
    const signature = req.headers['x-cashfree-signature'] || req.headers['x-webhook-signature'];
    const result = await fundService.handleWebhook(req.body, signature);

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/fund/transactions
 */
const getTransactions = async (req, res) => {
  try {
    const { campaign_id, page = 1, limit = 20 } = req.query;
    const transactions = await fundService.getTransactions(
      req.user.id, campaign_id, parseInt(page), parseInt(limit)
    );

    return res.status(200).json({ success: true, data: { transactions } });
  } catch (error) {
    console.error('Get transactions error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load transactions' });
  }
};

module.exports = { getCategories, createCampaign, listCampaigns, donate, webhookCashfree, getTransactions };
