import Booking from '../models/Booking.js';
import User from '../models/User.js';

/**
 * @desc Create a new booking & generate WhatsApp link
 * @route POST /api/bookings
 * @access Public
 */
export const createBooking = async (req, res, next) => {
  try {
    const { studentName, phone, curriculum, plan, teacherId, teacherName } = req.body;

    if (!studentName || !phone) {
      return res.status(400).json({
        success: false,
        message: 'الاسم ورقم الهاتف مطلوبان للتسجيل.',
      });
    }

    // Generate bookingRef
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const bookingRef = `#MKT-${randomCode}`;

    // Get Teacher info if teacherId provided
    let preferredTeacher = teacherName || '';
    if (teacherId && !preferredTeacher) {
      const teacher = await User.findById(teacherId);
      if (teacher) preferredTeacher = teacher.name;
    }

    const formattedPlan = {
      sessions: plan?.sessions || 8,
      durationMins: plan?.durationMins || 30,
      label: plan?.label || `${plan?.sessions || 8} حصص شهرياً`,
      price: plan?.price || 0,
      currency: plan?.currency || 'EGP',
    };

    const targetCurriculum = curriculum || 'حفظ وتثبيت القرآن الكريم';

    // Construct WhatsApp message text
    const waText = 
`السلام عليكم منصة مُكث 🌿
أود تأكيد الحجز برقم المرجع: ${bookingRef}

👤 الاسم: ${studentName}
📱 الهاتف: ${phone}
📚 المنهج: ${targetCurriculum}
⏱️ الخطة: ${formattedPlan.sessions} حصص شهرياً (${formattedPlan.durationMins} دقيقة/حصة)
${preferredTeacher ? `🎓 المعلم المفضل: ${preferredTeacher}` : ''}`.trim();

    const targetPhone = process.env.ADMIN_WHATSAPP || process.env.WHATSAPP_NUMBER || '201000000000';
    const waLink = `https://wa.me/${targetPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waText)}`;

    // Create Booking DB Record
    const booking = await Booking.create({
      bookingRef,
      studentName,
      phone,
      curriculum: targetCurriculum,
      plan: formattedPlan,
      teacherId: teacherId || null,
      teacherName: preferredTeacher,
      waLink,
      status: 'pending',
    });

    return res.status(201).json({
      success: true,
      message: 'تم تسجيل الحجز بنجاح',
      booking,
      waLink,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Get bookings (role-aware)
 * @route GET /api/bookings
 * @access Authenticated (admin=all, teacher=their students, student=by phone)
 */
export const getBookings = async (req, res, next) => {
  try {
    const filter = {};
    const role = req.user?.role;

    if (role === 'admin') {
      // Admin can filter by any param
      const { status, phone, teacherId } = req.query;
      if (status)    filter.status    = status;
      if (phone)     filter.phone     = phone;
      if (teacherId) filter.teacherId = teacherId;
    } else if (role === 'teacher') {
      // Teacher sees only bookings assigned to them
      filter.teacherId = req.user._id;
      // Allow additional status filter
      if (req.query.status) filter.status = req.query.status;
    } else {
      // Student sees their own bookings by phone or passed studentId
      const phone = req.query.phone || req.user?.phone;
      if (phone) {
        filter.phone = phone;
      } else {
        // No phone available — return empty
        return res.json({ success: true, count: 0, bookings: [] });
      }
    }

    const bookings = await Booking.find(filter)
      .populate('teacherId', 'name email meetLink')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (err) {
    next(err);
  }
};


/**
 * @desc Update booking status
 * @route PATCH /api/bookings/:id/status
 * @access Admin
 */
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending', 'contacted', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'حالة الحجز غير صالحة.' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'الحجز غير موجود.' });
    }

    return res.json({
      success: true,
      message: 'تم تحديث حالة الحجز بنجاح',
      booking,
    });
  } catch (err) {
    next(err);
  }
};
