import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";

export default async function handler(req, res) {
  const { method } = req;
  await mongooseConnect();

  if (method === "GET") {
    // Get all orders and ensure they have status
    const orders = await Order.find().sort({ createdAt: -1 });
    
    // Check for orders without status and update them
    for (const order of orders) {
      if (!order.status) {
        await Order.updateOne(
          { _id: order._id },
          { status: 'pending' }
        );
        order.status = 'pending';
      }
    }
    
    res.json(orders);
  }

  if (method === "PUT") {
    try {
      const { _id, status } = req.body;
      
      // Validate input
      if (!_id || !status) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Update the order status
      await Order.findByIdAndUpdate(_id, { status });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({ error: error.message });
    }
  }
}