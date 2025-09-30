import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { College } from '@/models/College';
import { collegesData } from '@/data/colleges';

// GET - Search colleges (from both static data and database)
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (query.length < 2) {
      return NextResponse.json({ colleges: [] });
    }

    // Search in static data
    const staticResults = collegesData
      .filter(college =>
        college.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, limit);

    // Search in database (include both verified and unverified for better UX)
    const dbResults = await College.find({
      name: { $regex: query, $options: 'i' }
      // Removed verified: true filter to show all user-added colleges
    })
    .select('name usageCount verified')
    .sort({ verified: -1, usageCount: -1, createdAt: -1 }) // Prioritize verified, then usage
    .limit(limit)
    .lean();

    // Combine results, prioritizing static data and high-usage DB entries
    const dbCollegeNames = dbResults.map(college => college.name);
    const combinedResults = [
      ...staticResults,
      ...dbCollegeNames
    ];

    // Remove duplicates and limit
    const uniqueResults = Array.from(new Set(combinedResults)).slice(0, limit);

    // Debug logging
    console.log(`🔍 College search for "${query}":`, {
      staticResults: staticResults.length,
      dbResults: dbResults.length,
      dbColleges: dbCollegeNames,
      totalUnique: uniqueResults.length
    });

    const response = NextResponse.json({
      colleges: uniqueResults,
      debug: {
        staticCount: staticResults.length,
        dbCount: dbResults.length,
        totalCount: uniqueResults.length
      }
    });

    // Add caching headers for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

    return response;
  } catch (error) {
    console.error('Error searching colleges:', error);
    return NextResponse.json(
      { error: 'Failed to search colleges' },
      { status: 500 }
    );
  }
}

// POST - Add new college
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const { name, addedBy } = await request.json();

    if (!name || !addedBy) {
      return NextResponse.json(
        { error: 'College name and user info are required' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 3) {
      return NextResponse.json(
        { error: 'College name must be at least 3 characters long' },
        { status: 400 }
      );
    }

    // Check if college already exists in static data
    const existsInStatic = collegesData.some(college =>
      college.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existsInStatic) {
      return NextResponse.json(
        { error: 'College already exists in our database' },
        { status: 400 }
      );
    }

    // Check if college already exists in database
    const existingCollege = await College.findOne({
      name: { $regex: `^${trimmedName}$`, $options: 'i' }
    });

    if (existingCollege) {
      // Increment usage count
      existingCollege.usageCount += 1;
      existingCollege.updatedAt = new Date();
      await existingCollege.save();

      return NextResponse.json({
        success: true,
        college: existingCollege,
        message: 'College found and usage count updated'
      });
    }

    // Create new college entry
    const newCollege = await College.create({
      name: trimmedName,
      addedBy,
      verified: false, // New colleges need admin verification
      usageCount: 1
    });

    return NextResponse.json({
      success: true,
      college: newCollege,
      message: 'New college added successfully. It will be available to other users after admin verification.'
    });

  } catch (error) {
    console.error('Error adding college:', error);
    return NextResponse.json(
      { error: 'Failed to add college' },
      { status: 500 }
    );
  }
}