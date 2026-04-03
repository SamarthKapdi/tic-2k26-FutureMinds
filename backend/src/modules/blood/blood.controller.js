const bloodService = require('./blood.service');

/**
 * POST /api/blood/register-donor
 */
const registerDonor = async (req, res) => {
  try {
    const { blood_group, latitude, longitude, address, city, last_donation_date } = req.body;

    if (!blood_group || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Blood group, latitude, and longitude are required',
      });
    }

    const validGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validGroups.includes(blood_group)) {
      return res.status(400).json({
        success: false,
        message: `Invalid blood group. Must be one of: ${validGroups.join(', ')}`,
      });
    }

    const donor = await bloodService.registerDonor(req.user.id, {
      blood_group, latitude, longitude, address, city, last_donation_date,
    });

    return res.status(201).json({
      success: true,
      message: 'Registered as blood donor successfully',
      data: { donor },
    });
  } catch (error) {
    console.error('Register donor error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to register as donor',
    });
  }
};

/**
 * POST /api/blood/create-request
 */
const createRequest = async (req, res) => {
  try {
    const {
      patient_name, blood_group, units_needed, urgency,
      hospital_name, hospital_address, latitude, longitude,
      city, contact_number, description,
    } = req.body;

    if (!patient_name || !blood_group || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Patient name, blood group, latitude, and longitude are required',
      });
    }

    const request = await bloodService.createRequest(req.user.id, {
      patient_name, blood_group, units_needed, urgency,
      hospital_name, hospital_address, latitude, longitude,
      city, contact_number, description,
    });

    return res.status(201).json({
      success: true,
      message: 'Blood request created successfully',
      data: { request },
    });
  } catch (error) {
    console.error('Create blood request error:', error);
    return res.status(error.message.includes('already have') ? 409 : 500).json({
      success: false,
      message: error.message || 'Failed to create blood request',
    });
  }
};

/**
 * GET /api/blood/nearby-donors
 */
const getNearbyDonors = async (req, res) => {
  try {
    const { latitude, longitude, blood_group, radius } = req.query;

    if (!latitude || !longitude || !blood_group) {
      return res.status(400).json({
        success: false,
        message: 'Latitude, longitude, and blood_group are required',
      });
    }

    const donors = await bloodService.findNearbyDonors(
      parseFloat(latitude),
      parseFloat(longitude),
      blood_group,
      parseFloat(radius) || 25
    );

    return res.status(200).json({
      success: true,
      data: {
        donors,
        total: donors.length,
        search_radius_km: parseFloat(radius) || 25,
      },
    });
  } catch (error) {
    console.error('Find nearby donors error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to find nearby donors',
    });
  }
};

/**
 * POST /api/blood/respond
 */
const respond = async (req, res) => {
  try {
    const { request_id, message } = req.body;

    if (!request_id) {
      return res.status(400).json({
        success: false,
        message: 'Request ID is required',
      });
    }

    const response = await bloodService.respondToRequest(req.user.id, request_id, message);

    return res.status(201).json({
      success: true,
      message: 'Response submitted successfully',
      data: { response },
    });
  } catch (error) {
    console.error('Respond to request error:', error);
    return res.status(error.message.includes('already') || error.message.includes('must register') ? 400 : 500).json({
      success: false,
      message: error.message || 'Failed to respond to request',
    });
  }
};

/**
 * GET /api/blood/history
 */
const getHistory = async (req, res) => {
  try {
    const history = await bloodService.getHistory(req.user.id);

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Get history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get donation history',
    });
  }
};

/**
 * GET /api/blood/requests (public list of active requests)
 */
const getRequests = async (req, res) => {
  try {
    const { page = 1, limit = 20, city } = req.query;
    const requests = await bloodService.getActiveRequests(parseInt(page), parseInt(limit), city);

    return res.status(200).json({
      success: true,
      data: { requests },
    });
  } catch (error) {
    console.error('Get requests error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get blood requests',
    });
  }
};

module.exports = { registerDonor, createRequest, getNearbyDonors, respond, getHistory, getRequests };
