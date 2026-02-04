import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create new report
export const createReport = async (req, res) => {
  try {
    const { subject, category, description, imageUrl } = req.body;
    const userId = req.user.id;

    console.log('[CreateReport] Payload:', { subject, category, description, imageUrl, userId });

    // Validation
    if (!subject || !category || !description) {
      return res.status(400).json({
        error: 'Subject, category, and description are required'
      });
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        userId,
        subject,
        category,
        description,
        imageUrl: imageUrl || null
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            name: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Report submitted successfully',
      report
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
};

// Get user's reports
export const getUserReports = async (req, res) => {
  try {
    const userId = req.user.id;

    const reports = await prisma.report.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            name: true
          }
        }
      }
    });

    res.json({ reports });
  } catch (error) {
    console.error('Get user reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

// Get single report (user can only see their own)
export const getReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const report = await prisma.report.findFirst({
      where: {
        id,
        userId // Ensure user can only see their own report
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            name: true
          }
        }
      }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ report });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
};

// Admin: Get all reports with filters
export const getAllReports = async (req, res) => {
  try {
    const { status, category, priority, search } = req.query;

    const where = {};

    if (status) where.status = status;
    if (category) where.category = category;
    if (priority) where.priority = priority;

    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { user: { username: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const reports = await prisma.report.findMany({
      where,
      orderBy: [
        { status: 'asc' }, // Open reports first
        { createdAt: 'desc' }
      ],
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            name: true
          }
        }
      }
    });

    // Get statistics
    const stats = await prisma.report.groupBy({
      by: ['status'],
      _count: true
    });

    res.json({
      reports,
      stats: stats.reduce((acc, stat) => {
        acc[stat.status] = stat._count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

// Admin: Update report status
export const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, adminNote } = req.body;
    const adminId = req.user.id;

    const updateData = {};

    if (status) {
      updateData.status = status;
      if (status === 'resolved' || status === 'closed') {
        updateData.resolvedBy = adminId;
        updateData.resolvedAt = new Date();
      }
    }

    if (priority) updateData.priority = priority;
    if (adminNote !== undefined) updateData.adminNote = adminNote;

    const report = await prisma.report.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            name: true
          }
        }
      }
    });

    res.json({
      message: 'Report updated successfully',
      report
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
};

// Admin: Delete report
export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.report.delete({
      where: { id }
    });

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
};
