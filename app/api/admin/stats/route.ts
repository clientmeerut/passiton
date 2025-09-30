import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Opportunity } from '@/models/Opportunity';
import { User } from '@/models/User';
import { Product } from '@/models/Product';
import jwt from 'jsonwebtoken';

// Helper function to verify admin access
async function verifyAdmin(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) return false;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return decoded.isAdmin && decoded.userId === 'admin';
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  // Verify admin access
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();

    // Get various statistics
    const totalUsers = await User.countDocuments({});
    const verifiedUsers = await User.countDocuments({ verified: true });
    const totalOpportunities = await Opportunity.countDocuments({});
    const activeOpportunities = await Opportunity.countDocuments({ active: true });
    const totalProducts = await Product.countDocuments({});
    const soldProducts = await Product.countDocuments({ sold: true });

    // Get opportunities by type
    const opportunitiesByType = await Opportunity.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Get recent activities (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const recentOpportunities = await Opportunity.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const recentProducts = await Product.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    return NextResponse.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          verified: verifiedUsers,
          recent: recentUsers
        },
        opportunities: {
          total: totalOpportunities,
          active: activeOpportunities,
          inactive: totalOpportunities - activeOpportunities,
          recent: recentOpportunities,
          byType: opportunitiesByType
        },
        products: {
          total: totalProducts,
          sold: soldProducts,
          active: totalProducts - soldProducts,
          recent: recentProducts
        }
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}