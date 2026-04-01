import { MessagePublisher } from '../../../../domain/ports/out/MessagePublisher';
import { getChannel } from '../../../config/rabbitmq';

export class RabbitMQPublisher implements MessagePublisher {
  async publish(event: string, data: unknown): Promise<void> {
    const channel = getChannel();
    if (!channel) {
      console.warn('RabbitMQ channel not available, event not published:', event);
      return;
    }

    const msg = JSON.stringify({ event, data, timestamp: new Date() });
    channel.sendToQueue('reservation.notifications', Buffer.from(msg), {
      persistent: true
    });
  }
}
