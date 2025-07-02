import mongoose from 'mongoose';

export const connectDB = async () => {
  const maxRetries = 3;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        retryWrites: true,
        retryReads: true
      });
      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (err) {
      retries++;
      console.error(`❌ MongoDB connection error (attempt ${retries}):`, err.message);
      
      if (retries < maxRetries) {
        await new Promise(res => setTimeout(res, 5000 * retries));
        console.log('Retrying connection...');
      } else {
        console.error('Failed to connect to MongoDB after maximum retries');
        process.exit(1);
      }
    }
  }
};
