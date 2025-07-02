import Request from '../models/Request.js';
import Item from '../models/Item.js';

export const getRequestStats = async (req, res) => {
  const totalRequests = await Request.countDocuments();

  const byCategory = await Request.aggregate([
    {
      $lookup: {
        from: 'items',
        localField: 'item',
        foreignField: '_id',
        as: 'itemDetails'
      }
    },
    { $unwind: '$itemDetails' },
    {
      $group: {
        _id: '$itemDetails.category',
        count: { $sum: 1 }
      }
    }
  ]);

  const averageDuration = await Request.aggregate([
    {
      $match: {
        startTime: { $exists: true },
        endTime: { $exists: true }
      }
    },
    {
      $project: {
        durationHours: {
          $divide: [
            { $subtract: ['$endTime', '$startTime'] },
            1000 * 60 * 60
          ]
        }
      }
    },
    {
      $group: {
        _id: null,
        avgDurationHours: { $avg: '$durationHours' }
      }
    }
  ]);

  res.json({
    totalRequests,
    byCategory,
    avgDurationHours: averageDuration[0]?.avgDurationHours || 0
  });
};
