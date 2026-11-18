import ChatScreen from '@/components/ChatScreen';

export const instant = false;

export default async function ChatPage({
  params,
  searchParams,
}: {
  params: Promise<{ topicId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { topicId } = await params;
  const sp = await searchParams;
  const t = sp.t;
  return <ChatScreen topicId={topicId} customText={typeof t === 'string' ? t.slice(0, 160) : undefined} />;
}
