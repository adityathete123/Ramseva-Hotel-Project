const API_BASE = '/api';

export async function initializeApp(accessToken: string) {
  try {
    const roomsResponse = await fetch(`${API_BASE}/rooms/types/init`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (roomsResponse.ok) {
      console.log('Room types initialized successfully');
      return true;
    } else {
      console.error('Failed to initialize room types');
      return false;
    }
  } catch (error) {
    console.error('Initialization error:', error);
    return false;
  }
}
