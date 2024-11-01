

const getTripRoute = async (tripId: number) => {
    try {
      const response = await fetch(`/api/trip/${tripId}/route`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
    //   console.log('Trip Route Data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching trip route:', error);
    }
  };