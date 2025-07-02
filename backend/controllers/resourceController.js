import Item from '../models/Item.js';
import Request from '../models/Request.js';

export const getResources = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category, availability: true } : { availability: true };
    const resources = await Item.find(filter);
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching resources' });
  }
};

export const createResource = async (req, res) => {
  try {
    const resource = await Item.create(req.body);
    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ message: 'Error creating resource' });
  }
};

export const updateResourceStock = async (req, res) => {
  try {
    const { quantity } = req.body;
    const resource = await Item.findById(req.params.id);
    
    if (!resource || resource.category !== 'consumable') {
      return res.status(400).json({ message: 'Invalid consumable resource' });
    }
    
    resource.stockLevel = Math.max(0, resource.stockLevel - quantity);
    await resource.save();
    
    res.json(resource);
  } catch (err) {
    res.status(500).json({ message: 'Error updating stock' });
  }
};

// Enhanced availability check for different resource types
export const checkAvailability = async (req, res) => {
  try {
    const { resourceId, startTime, endTime, quantity = 1 } = req.query;
    const resource = await Item.findById(resourceId);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    let available = false;
    
    if (resource.category === 'consumable') {
      available = resource.stockLevel >= quantity;
    } else {
      // Check for time-based conflicts (venues/assets)
      const overlappingRequests = await Request.find({
        item: resourceId,
        status: { $in: ['pending', 'approved', 'manager-approved', 'admin-approved'] },
        $or: [
          { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
        ]
      });
      available = overlappingRequests.length === 0;
    }
    
    res.json({ available, resource });
  } catch (err) {
    res.status(500).json({ message: 'Error checking availability' });
  }
};