import amqp from 'amqplib';

let channel: amqp.Channel | null = null;

export const connectRabbitMQ = async () => {
  const url = process.env.RABBITMQ_URL || 'amqp://localhost';
  try {
    const connection = await amqp.connect(url);
    channel = await connection.createChannel();
    console.log('Connected to RabbitMQ');
    
    // Assert queue
    await channel.assertQueue('reservation.notifications', { durable: true });
  } catch (error) {
    console.warn('RabbitMQ connection failed, messaging will be disabled:', error);
  }
};

export const getChannel = () => channel;
