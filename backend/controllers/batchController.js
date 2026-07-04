const Batch = require("../models/Batch");
const User = require("../models/User");

// Create Batch
const createBatch = async (req, res) => {
  try {
    const { title, description, instructor } = req.body;

    const batch = new Batch({
      title,
      description,
      instructor,
    });

    await batch.save();

    res.status(201).json({
      success: true,
      message: "Batch created successfully",
      batch,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating batch",
      error: error.message,
    });
  }
};

// Enroll User in Batch
const enrollBatch = async (req, res) => {
  try {
    const { userId, batchId } = req.body;

    if (!userId || !batchId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Batch ID are required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    const batchIdStr = String(batchId);

    if ((user.enrolledBatches || []).map(String).includes(batchIdStr)) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this batch",
      });
    }

    user.enrolledBatches = user.enrolledBatches || [];
    user.enrolledBatches.push(batchIdStr);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Enrollment successful",
      enrolledBatches: user.enrolledBatches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Enrollment failed",
      error: error.message,
    });
  }
};

// Get Enrolled Batches
const getEnrolledBatches = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const batches = await Batch.find({
      _id: {
        $in: user.enrolledBatches || [],
      },
    });

    res.status(200).json({
      success: true,
      enrolledBatches: batches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch enrolled batches",
      error: error.message,
    });
  }
};

// Unenroll User
const unenrollBatch = async (req, res) => {
  try {
    const { userId, batchId } = req.body;

    if (!userId || !batchId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Batch ID are required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const batchIdStr = String(batchId);

    if (!(user.enrolledBatches || []).map(String).includes(batchIdStr)) {
      return res.status(400).json({
        success: false,
        message: "User is not enrolled in this batch",
      });
    }

    user.enrolledBatches = user.enrolledBatches.filter(
      (id) => String(id) !== batchIdStr
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: "Unenrolled successfully",
      enrolledBatches: user.enrolledBatches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unenrollment failed",
      error: error.message,
    });
  }
};

module.exports = {
  createBatch,
  enrollBatch,
  getEnrolledBatches,
  unenrollBatch,
};