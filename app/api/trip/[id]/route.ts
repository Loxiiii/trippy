// app/api/trip/[id].ts
import { NextRequest, NextResponse } from 'next/server';
import { getTripById } from '@/utils/controllers/tripController';
import { getTripStopsByTripId } from '@/utils/controllers/stopController';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Extract the trip ID from the URL
    console.log('The request received is: ', request);
    const pathname = new URL(request.url).pathname;
    const idStr = pathname.split('/').pop();
    const id = idStr ? parseInt(idStr) : NaN;
    // const { searchParams } = new URL(request.url);
    // const id = searchParams.get('id');
    console.log('The params received are: ', id);

    if (!id) {
      return NextResponse.json({ message: 'Trip ID is required' }, { status: 400 });
    }

    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid trip ID' }, { status: 400 });
    }

    const trip = await getTripById(id);

    if (!trip) {
      return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
    }

    const stops = await getTripStopsByTripId(id);

    return NextResponse.json({ message: 'Trip fetched successfully', trip, stops }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching trip:', error);
    return NextResponse.json({ message: 'Error fetching trip', error: error.message }, {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}