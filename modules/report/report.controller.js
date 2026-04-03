const reportService = require('./report.service');

/**
 * POST /api/report/create
 */
const create = async (req, res) => {
  try {
    const { report_type, target_id, reason, description } = req.body;

    if (!report_type || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Report type and reason are required',
      });
    }

    const validTypes = ['blood_request', 'campaign', 'missing_person', 'user', 'other'];
    if (!validTypes.includes(report_type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid report type. Must be one of: ${validTypes.join(', ')}`,
      });
    }

    const report = await reportService.createReport(req.user.id, {
      report_type, target_id, reason, description,
    });

    return res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: { report },
    });
  } catch (error) {
    console.error('Create report error:', error);
    return res.status(error.message.includes('already reported') ? 409 : 500).json({
      success: false,
      message: error.message || 'Failed to create report',
    });
  }
};

/**
 * GET /api/report/list
 */
const list = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const reports = await reportService.listUserReports(req.user.id, parseInt(page), parseInt(limit));

    return res.status(200).json({
      success: true,
      data: { reports },
    });
  } catch (error) {
    console.error('List reports error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load reports' });
  }
};

module.exports = { create, list };
