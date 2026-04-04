const missingService = require('./missing.service')
const { uploadMissingPersonImage } = require('../../services/r2.service')

/**
 * POST /api/missing/report
 */
const report = async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      description,
      image_url,
      latitude,
      longitude,
      last_seen_address,
      last_seen_date,
      city,
      contact_number,
      urgency,
      unique_identifiers,
    } = req.body

    let resolvedImageUrl = image_url
    if (req.file) {
      resolvedImageUrl = await uploadMissingPersonImage(req.file)
    }

    if (!name || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Name, latitude, and longitude are required',
      })
    }

    const missing = await missingService.reportMissing(req.user.id, {
      name,
      age,
      gender,
      description,
      image_url: resolvedImageUrl,
      latitude,
      longitude,
      last_seen_address,
      last_seen_date,
      city,
      contact_number,
      urgency,
      unique_identifiers,
    })

    const io = req.app.get('io')
    if (io) {
      io.emit('missing:new_report', {
        ...missing,
        reporter_name: req.user.name,
      })
      io.emit('dashboard:refresh')
      io.emit('leaderboard:refresh')
    }

    return res.status(201).json({
      success: true,
      message: 'Missing person report created successfully',
      data: { missing },
    })
  } catch (error) {
    console.error('Report missing error:', error)
    return res.status(error.message.includes('similar') ? 409 : 500).json({
      success: false,
      message: error.message || 'Failed to create report',
    })
  }
}

/**
 * GET /api/missing/list
 */
const list = async (req, res) => {
  try {
    const { page = 1, limit = 20, city, status } = req.query
    const result = await missingService.listMissing(
      parseInt(page),
      parseInt(limit),
      city,
      status || 'missing'
    )

    return res.status(200).json({ success: true, data: result })
  } catch (error) {
    console.error('List missing error:', error)
    return res
      .status(500)
      .json({ success: false, message: 'Failed to load missing persons' })
  }
}

/**
 * POST /api/missing/sighting
 */
const sighting = async (req, res) => {
  try {
    const {
      missing_person_id,
      latitude,
      longitude,
      address,
      description,
      image_url,
      sighting_date,
    } = req.body

    if (!missing_person_id || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Missing person ID, latitude, and longitude are required',
      })
    }

    const result = await missingService.reportSighting(req.user.id, {
      missing_person_id,
      latitude,
      longitude,
      address,
      description,
      image_url,
      sighting_date,
    })

    const io = req.app.get('io')
    if (io) {
      io.emit('missing:new_sighting', {
        missing_person_id,
        reporter_name: req.user.name,
      })
      io.emit('dashboard:refresh')
      io.emit('leaderboard:refresh')
    }

    return res.status(201).json({
      success: true,
      message: 'Sighting reported successfully',
      data: { sighting: result },
    })
  } catch (error) {
    console.error('Report sighting error:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to report sighting',
    })
  }
}

/**
 * GET /api/missing/:id
 */
const getDetail = async (req, res) => {
  try {
    const result = await missingService.getMissingDetail(req.params.id)
    return res.status(200).json({ success: true, data: result })
  } catch (error) {
    console.error('Get missing detail error:', error)
    return res
      .status(404)
      .json({ success: false, message: error.message || 'Not found' })
  }
}

module.exports = { report, list, sighting, getDetail }
