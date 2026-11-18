import ChatScreen from '@/components/ChatScreen';

export const instant = false;

export default async function ChatPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;
  return <ChatScreen topicId={topicId} />;
}
