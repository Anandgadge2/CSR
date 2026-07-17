"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Send, Paperclip, CheckCheck, Landmark, Building2, UserCheck, 
  Search, Pin, Smile, Mic, Play, MoreVertical, Heart, ThumbsUp, AlertCircle
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Message {
  id: string;
  senderName: string;
  senderRole: string;
  text: string;
  time: string;
  isVoice?: boolean;
  voiceDuration?: string;
  reactions?: string[];
  pinned?: boolean;
}

interface ChatRoom {
  id: string;
  partnerName: string;
  partnerType: "NGO" | "COMPANY";
  lastMessage: string;
  updatedAt: string;
  unread: boolean;
  pinned: boolean;
  projectTitle?: string;
}

const mockChats: ChatRoom[] = [
  {
    id: "chat-1",
    partnerName: "Sahyadri Eco Foundation",
    partnerType: "NGO",
    lastMessage: "Please verify the S3 PDF links for Phase 1 check dam reports.",
    updatedAt: "14:22 PM",
    unread: true,
    pinned: true,
    projectTitle: "Gadchiroli Watershed Initiative"
  },
  {
    id: "chat-2",
    partnerName: "Sahyadri Technology Ventures Ltd",
    partnerType: "COMPANY",
    lastMessage: "Board approved the Pune Smart-Classroom budget tranche.",
    updatedAt: "Yesterday",
    unread: false,
    pinned: false,
    projectTitle: "Pune Rural Digital Classrooms"
  }
];

const mockInitialMessages: Record<string, Message[]> = {
  "chat-1": [
    { id: "m-1", senderName: "Sahyadri Eco Foundation", senderRole: "NGO_ADMIN", text: "Hello team, we have completed geological surveying for check dam sites in Aheri.", time: "14:15 PM", reactions: ["👍"] },
    { id: "m-2", senderName: "You", senderRole: "COMPANY_ADMIN", text: "Great! Can you share the certificate reports or soil analysis results?", time: "14:18 PM", pinned: true },
    { id: "m-3", senderName: "Sahyadri Eco Foundation", senderRole: "NGO_ADMIN", text: "Please verify the S3 PDF links for Phase 1 check dam reports.", time: "14:22 PM" }
  ],
  "chat-2": [
    { id: "m-4", senderName: "You", senderRole: "NGO_ADMIN", text: "We have finalized the hardware specs for Loni Kalbhor schools.", time: "10:30 AM" },
    { id: "m-5", senderName: "Sahyadri Technology Ventures Ltd", senderRole: "COMPANY_ADMIN", text: "Board approved the Pune Smart-Classroom budget tranche.", time: "10:35 AM", reactions: ["🎉", "❤️"] },
    { id: "m-6", senderName: "Sahyadri Technology Ventures Ltd", senderRole: "COMPANY_ADMIN", text: "Voice briefing attached.", time: "10:36 AM", isVoice: true, voiceDuration: "0:42" }
  ]
};

export default function ChatSystem() {
  const [activeChat, setActiveChat] = useState<ChatRoom>(mockChats[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "unread" | "pinned">("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(mockInitialMessages[activeChat.id] || []);
  }, [activeChat]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim()) return;

    const newMessage: Message = {
      id: `m-new-${Date.now()}`,
      senderName: "You",
      senderRole: "COMPANY_ADMIN",
      text: inputVal,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: []
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputVal("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const partnerReply: Message = {
        id: `m-rep-${Date.now()}`,
        senderName: activeChat.partnerName,
        senderRole: activeChat.partnerType === "NGO" ? "NGO_ADMIN" : "COMPANY_ADMIN",
        text: `Understood, we are checking the logs. Will update soon.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reactions: []
      };
      setMessages((prev) => [...prev, partnerReply]);
    }, 2000);
  };

  const handleSendVoiceNote = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      const voiceMessage: Message = {
        id: `m-voice-${Date.now()}`,
        senderName: "You",
        senderRole: "COMPANY_ADMIN",
        text: "Voice note briefing",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isVoice: true,
        voiceDuration: "0:15",
        reactions: []
      };
      setMessages((prev) => [...prev, voiceMessage]);
    }, 2500);
  };

  const handleTogglePinMessage = (id: string) => {
    setMessages(messages.map(m => m.id === id ? { ...m, pinned: !m.pinned } : m));
  };

  const handleReact = (messageId: string, emoji: string) => {
    setMessages(messages.map(m => {
      if (m.id === messageId) {
        const reactions = m.reactions || [];
        return {
          ...m,
          reactions: reactions.includes(emoji) 
            ? reactions.filter(r => r !== emoji) 
            : [...reactions, emoji]
        };
      }
      return m;
    }));
  };

  const filteredChats = mockChats.filter(chat => {
    if (filterMode === "pinned") return chat.pinned;
    if (filterMode === "unread") return chat.unread;
    return true;
  });

  const displayMessages = messages.filter(m => 
    !searchQuery || m.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-140px)] w-full">
      
      {/* Title block */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">Collaboration Hub</h1>
        <p className="text-slate-500 text-xs">Real-time messaging and document review workspace</p>
      </div>

      {/* Main chat box container */}
      <div className="flex-grow flex border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-sm min-h-0">
        
        {/* Left Panel: Conversation Index */}
        <div className="w-80 border-r border-slate-200/80 flex flex-col h-full bg-slate-50/50 shrink-0">
          
          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-200/80 flex gap-1.5 overflow-x-auto shrink-0 bg-white">
            {[
              { id: "all", label: "All chats" },
              { id: "unread", label: "Unread" },
              { id: "pinned", label: "Pinned" }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterMode(f.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterMode === f.id 
                    ? "bg-slate-100 text-black shadow-sm" 
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Rooms List */}
          <div className="flex-grow overflow-y-auto flex flex-col divide-y divide-slate-100">
            {filteredChats.map((chat) => (
              <div 
                key={chat.id}
                onClick={() => {
                  setActiveChat(chat);
                  chat.unread = false;
                }}
                className={`p-4 flex flex-col gap-2 cursor-pointer transition-all hover:bg-slate-50 relative ${
                  activeChat.id === chat.id ? "bg-blue-50/50 border-l-2 border-blue-600" : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="bg-slate-100 border border-slate-200/60 p-1.5 rounded-lg text-slate-600">
                      {chat.partnerType === "NGO" ? <Landmark size={13} /> : <Building2 size={13} />}
                    </div>
                    <span className="font-bold text-xs text-slate-800">{chat.partnerName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {chat.pinned && <Pin size={9} className="text-blue-500 fill-blue-500/10" />}
                    <span className="text-[10px] text-slate-400 font-semibold">{chat.updatedAt}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 truncate pl-8">{chat.lastMessage}</p>

                {chat.unread && (
                  <span className="absolute right-4 bottom-4 w-2 h-2 rounded-full bg-blue-600" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Chat Stream */}
        <div className="flex-1 flex flex-col h-full bg-slate-50/30 justify-between min-w-0">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-200/80 flex justify-between items-center bg-white shrink-0">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-sm text-slate-900">{activeChat.partnerName}</span>
                {activeChat.pinned && <Pin size={11} className="text-blue-500 fill-blue-500/10" />}
              </div>
              {activeChat.projectTitle && (
                <span className="text-[11px] text-slate-500 font-medium">Proposal Ref: {activeChat.projectTitle}</span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {/* Search Toggle */}
              {searchOpen && (
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter messages..." 
                  className="bg-slate-50 border border-slate-200 rounded-lg py-1 px-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all w-44"
                />
              )}
              <button 
                onClick={() => {
                  setSearchOpen(!searchOpen);
                  setSearchQuery("");
                }}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-all"
              >
                <Search size={15} />
              </button>

              <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-550 animate-pulse shrink-0" />
                Live Escrow Session
              </span>
            </div>
          </div>

          {/* Message Stream */}
          <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 bg-slate-50/40">
            {displayMessages.map((m) => {
              const isMe = m.senderName === "You";
              return (
                <div key={m.id} className={`flex flex-col gap-1 max-w-[75%] relative group ${
                  isMe ? "self-end items-end" : "self-start items-start"
                }`}>
                  <div className="flex gap-1.5 items-center text-[10px] text-slate-400 font-semibold px-1">
                    <span>{m.senderName}</span>
                    {m.pinned && <Pin size={8} className="text-blue-500 fill-blue-500/10" />}
                  </div>

                  {/* Bubble */}
                  <div className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed relative shadow-sm ${
                    isMe 
                      ? "bg-blue-600 text-white rounded-tr-none" 
                      : "bg-white border border-slate-200/80 text-slate-800 rounded-tl-none"
                  }`}>
                    {m.isVoice ? (
                      <div className="flex items-center gap-3 w-48">
                        <button className={`p-2 rounded-lg transition-colors ${
                          isMe ? "bg-white/10 text-white hover:bg-white/20" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                        }`}>
                          <Play size={13} className={isMe ? "fill-white" : "fill-blue-600"} />
                        </button>
                        <div className="flex-grow flex flex-col gap-1">
                          {/* Audio Wave Mockup */}
                          <div className="h-4 flex items-center gap-0.5">
                            {[1,4,2,5,3,6,4,2,3,5,4,2,6,3,1].map((h, i) => (
                              <span 
                                key={i} 
                                className={`flex-grow h-full rounded-full ${isMe ? "bg-white/30" : "bg-slate-200"}`} 
                                style={{ height: `${h * 15}%` }} 
                              />
                            ))}
                          </div>
                          <span className={`text-[9px] ${isMe ? "text-white/70" : "text-slate-400"}`}>{m.voiceDuration} Voice note</span>
                        </div>
                      </div>
                    ) : (
                      m.text
                    )}

                    {/* Reactions overlay */}
                    {m.reactions && m.reactions.length > 0 && (
                      <div className="absolute bottom-[-9px] right-2 flex gap-0.5 bg-white px-1.5 py-0.5 rounded-full border border-slate-200 shadow-sm text-[10px]">
                        {m.reactions.map((r, i) => (
                          <span key={i}>{r}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions (visible on hover) */}
                  <div className={`hidden group-hover:flex items-center gap-1.5 text-slate-400 absolute top-4 ${
                    isMe ? "left-[-85px]" : "right-[-85px]"
                  }`}>
                    <button onClick={() => handleReact(m.id, "👍")} className="hover:text-slate-700 hover:scale-110 transition-transform">👍</button>
                    <button onClick={() => handleReact(m.id, "❤️")} className="hover:text-slate-700 hover:scale-110 transition-transform">❤️</button>
                    <button 
                      onClick={() => handleTogglePinMessage(m.id)} 
                      className="hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-all"
                    >
                      <Pin size={11} className={m.pinned ? "text-blue-500 fill-blue-500/10" : ""} />
                    </button>
                  </div>

                  <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-0.5 px-1 mt-0.5">
                    {m.time} {isMe && <CheckCheck size={10} className="text-blue-500" />}
                  </span>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex flex-col gap-1 max-w-[70%] self-start items-start">
                <span className="text-[10px] text-slate-400 font-semibold">{activeChat.partnerName}</span>
                <div className="bg-white border border-slate-200/80 px-3.5 py-2.5 rounded-2xl flex gap-1 items-center shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Input Panel */}
          <div className="p-4 border-t border-slate-200/80 bg-white shrink-0">
            {isRecording ? (
              <div className="flex justify-between items-center bg-rose-50 border border-rose-200/60 px-4 py-2.5 rounded-xl text-rose-700 text-xs font-semibold animate-pulse">
                <span>Recording voice note...</span>
                <button onClick={() => setIsRecording(false)} className="text-rose-500 hover:text-rose-800 font-bold">Cancel</button>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex items-center gap-2.5">
                <button type="button" className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 hover:bg-slate-50 rounded-lg">
                  <Paperclip size={16} />
                </button>
                <input 
                  type="text" 
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder={`Message ${activeChat.partnerName}...`}
                  className="flex-grow bg-slate-50 border border-slate-200/80 rounded-xl py-2.5 px-4 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
                
                {/* Emoji shortcut */}
                <button type="button" onClick={() => setInputVal(prev => prev + " 👍")} className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-lg">
                  <Smile size={16} />
                </button>
                
                {/* Voice Note Trigger */}
                <button type="button" onClick={handleSendVoiceNote} className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-lg">
                  <Mic size={16} />
                </button>
                
                <Button type="submit" className="px-3.5 py-2">
                  <Send size={13} className="mr-1" /> Send
                </Button>
              </form>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
