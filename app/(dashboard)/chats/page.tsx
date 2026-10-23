import ChatRoom from "@/modules/chat";

export default function ChatsPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ChatRoom embedded />
    </div>
  );
}
