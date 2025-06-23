 
const API_BASE_URL = 'http://127.0.0.1:8000/api';

/**
 * Fetch posts from Django backend
 * Handles pagination for scalable social media feed
 */
export const fetchPosts = async (page = 1) => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/?page=${page}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add authentication header when ready
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Posts fetched from Django:', data);
    
    return {
      posts: data.results || [],
      hasNext: !!data.next,
      hasPrevious: !!data.previous,
      count: data.count || 0
    };
  } catch (error) {
    console.error('❌ Error fetching posts:', error);
    throw error;
  }
};

/**
 * Transform Django API response to match current PostCard format
 * This keeps our existing PostCard component working
 */
export const transformApiPost = (apiPost) => {
  return {
    id: apiPost.id,
    user: {
      username: apiPost.author?.username || 'Unknown User',
      avatar: apiPost.author?.avatar || '/api/placeholder/32/32',
      verified: false // Can add this field to backend later
    },
    content: apiPost.content || '',
    image: apiPost.image_url || null,
    timestamp: apiPost.time_since_posted || 'Unknown time',
    likes: {
      count: apiPost.total_likes || 0,
      isLiked: apiPost.is_liked || false
    },
    comments: apiPost.total_comments || 0,
    shares: apiPost.total_shares || 0,
    isActive: apiPost.is_active !== false
  };
};