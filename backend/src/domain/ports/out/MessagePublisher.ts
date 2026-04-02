export interface MessagePublisher {
  publish(event: string, data: unknown): Promise<void>
}
