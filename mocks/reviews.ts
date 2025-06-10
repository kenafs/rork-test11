import { Review } from '@/types';
import { mockProviders, mockVenues } from './users';

export const mockReviews: Review[] = [
  {
    id: '1',
    reviewerId: mockVenues[0].id,
    reviewerName: mockVenues[0].name,
    reviewerImage: mockVenues[0].profileImage,
    targetId: mockProviders[0].id,
    rating: 5,
    comment: "Alex was fantastic! He read the room perfectly and kept our guests dancing all night. Very professional and easy to work with.",
    createdAt: Date.now() - 86400000 * 15,
  },
  {
    id: '2',
    reviewerId: mockVenues[1].id,
    reviewerName: mockVenues[1].name,
    reviewerImage: mockVenues[1].profileImage,
    targetId: mockProviders[0].id,
    rating: 4,
    comment: "Good DJ with great equipment. Music selection was mostly on point, though there were a few lulls during the evening.",
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    id: '3',
    reviewerId: mockProviders[1].id,
    reviewerName: mockProviders[1].name,
    reviewerImage: mockProviders[1].profileImage,
    targetId: mockVenues[0].id,
    rating: 5,
    comment: "Beautiful venue with excellent facilities. The staff was very accommodating and helped make our catering service run smoothly.",
    createdAt: Date.now() - 86400000 * 45,
  },
  {
    id: '4',
    reviewerId: mockVenues[2].id,
    reviewerName: mockVenues[2].name,
    reviewerImage: mockVenues[2].profileImage,
    targetId: mockProviders[1].id,
    rating: 5,
    comment: "The food was absolutely exquisite! Our guests couldn't stop raving about the quality and presentation. Highly recommend!",
    createdAt: Date.now() - 86400000 * 60,
  },
  {
    id: '5',
    reviewerId: mockProviders[2].id,
    reviewerName: mockProviders[2].name,
    reviewerImage: mockProviders[2].profileImage,
    targetId: mockVenues[1].id,
    rating: 4,
    comment: "Great space with good amenities. The only issue was limited parking for our staff.",
    createdAt: Date.now() - 86400000 * 75,
  },
];

export const getReviewsForUser = (userId: string) => {
  return mockReviews.filter(review => review.targetId === userId);
};

export const getReviewsByUser = (userId: string) => {
  return mockReviews.filter(review => review.reviewerId === userId);
};