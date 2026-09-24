const asyncHandler = require('../utils/asyncHandler');
const { BadRequestError } = require('../utils/error');
const bookingService = require('../services/booking.service');

exports.createBooking = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    scheduleId,
    seatIds,
    passengers,
    idempotencyKey,
    fromStationId,
    toStationId,
    fromSeq,
    toSeq,
  } = req.body;

  if (!scheduleId || !seatIds || !passengers || !idempotencyKey) {
    throw new BadRequestError(
      `scheduleId, seatIds, passengers, and idempotencyKey are required`,
    );
  }
  const result = await bookingService.createBooking(
    userId,
    scheduleId,
    seatIds,
    passengers,
    idempotencyKey,
    fromStationId,
    toStationId,
    fromSeq,
    toSeq,
  );

  return res.status(201).json({
    success: true,
    data: result,
  });
});

exports.getBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.id;

  const result = await bookingService.getBooking(bookingId, userId);

  return res.status(200).json({
    success: true,
    data: result,
  });
});

exports.getUserBookings = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { status, page, limit } = req.query;

  const result = await bookingService.getUserBookings(userId, {
    status,
    page: page ? parseInt(page, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
  });

  return res.status(200).json({
    success: true,
    data: result,
  });
});

exports.cancelBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.id;

  const result = await bookingService.cancelBooking(bookingId, userId);

  return res.status(200).json({
    success: true,
    data: result,
  });
});

exports.verifyPayment = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.id;
  const { razorpayPaymentId, razorpaySignature } = req.body;

  const result = await bookingService.verifyPayment(
    bookingId,
    userId,
    razorpayPaymentId,
    razorpaySignature
  );

  return res.status(200).json({
    success: true,
    data: result,
  });
});
