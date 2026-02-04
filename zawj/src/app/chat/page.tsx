'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Send, MessageCircle, User, Search, Phone, Video, MoreVertical, Shield, AlertTriangle } from 'lucide-react'
import { chatApi, Conversation, Message } from '@/lib/api/chat'
import { useAuthStore } from '@/store/auth'
import { useChatStore } from '@/store/chat'
import { usersApi } from '@/lib/api/users'
import Link from 'next/link'

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { isAuthenticated, user } = useAuthStore()
  const { conversations, messages, addMessage } = useChatStore()

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => usersApi.getProfile(),
    enabled: isAuthenticated,
  })

  // Check if user has valid Tuteur
  const hasValidMahram = user?.role === 'admin' ||
    user?.gender === 'male' ||
    (user?.gender === 'female' && (user?.waliId || user?.waliInfo?.platformServicePaid))

  const { data: conversationsData, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatApi.getConversations(),
    enabled: isAuthenticated,
  })

  const { data: messagesData } = useQuery({
    queryKey: ['messages', selectedConversation?.id],
    queryFn: () => selectedConversation ? chatApi.getMessages(selectedConversation.id) : null,
    enabled: !!selectedConversation,
  })

  useEffect(() => {
    if (conversationsData) {
      useChatStore.getState().setConversations(conversationsData)
    }
  }, [conversationsData])

  useEffect(() => {
    if (messagesData) {
      useChatStore.getState().setMessages(messagesData)
    }
  }, [messagesData])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !selectedConversation) return

    try {
      const newMessage = await chatApi.sendMessage(selectedConversation.participants[0], message)
      addMessage(newMessage)
      setMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative">
        {/* Aura d'arrière-plan */}
        <div className="hero-aura top-[-200px] left-[-100px]"></div>
        <div className="hero-aura bottom-[-200px] right-[-100px]"></div>

        <div className="text-center relative z-10">
          <div className="w-16 h-16 bg-[#ff007f] rounded-2xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-4">
            Z
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Connexion requise</h2>
          <p className="text-gray-400 mb-6">Vous devez être connecté pour accéder aux messages.</p>
          <a
            href="/login"
            className="btn-pink px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest inline-block"
          >
            Se connecter
          </a>
        </div>
      </div>
    )
  }

  if (!hasValidMahram) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative">
        {/* Aura d'arrière-plan */}
        <div className="hero-aura top-[-200px] left-[-100px]"></div>
        <div className="hero-aura bottom-[-200px] right-[-100px]"></div>

        <div className="text-center relative z-10 max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-[#ff007f] rounded-2xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-4">
            <Shield className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Tuteur Requis</h2>
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center text-yellow-400 mb-2">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span className="font-semibold">Communication Restreinte</span>
            </div>
            <p className="text-gray-300 text-sm">
              Pour communiquer sur Nissfi, vous devez avoir un Tuteur (tuteur légal) validé qui supervise vos échanges.
            </p>
          </div>
          <p className="text-gray-400 mb-6">
            Si vous n'avez pas de Tuteur familial, vous pouvez bénéficier de notre service Tuteur plateforme.
          </p>
          <Link
            href="/profile"
            className="btn-pink px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest inline-block"
          >
            Demander un Tuteur
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-[#0a0a0a]">
      {/* Conversations Sidebar */}
      <div className="w-80 glass-card border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Messages</h2>
          <div className="mt-3 relative">
            <Search className="absolute left-4 top-4 h-4 w-4 text-[#ff007f]" />
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              className="w-full pl-12 pr-4 py-3 bg-[#1a1a1a] border border-[#ff007f]/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff007f] focus:border-[#ff007f] transition-all text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff007f] mx-auto"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-600" />
              <p>Aucune conversation</p>
              <p className="text-sm mt-1">Commencez par contacter un Tuteur</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedConversation?.id === conversation.id}
                onClick={() => setSelectedConversation(conversation)}
              />
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0a0a0a]">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="glass-card border-b border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#ff007f] rounded-full flex items-center justify-center text-white font-bold">
                    {selectedConversation.participants[0]?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{selectedConversation.participants.join(', ')}</h3>
                    <p className="text-sm text-gray-400">En ligne</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-[#ff007f] transition-colors rounded-lg hover:bg-[#1a1a1a]">
                    <Phone className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-[#ff007f] transition-colors rounded-lg hover:bg-[#1a1a1a]">
                    <Video className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-[#ff007f] transition-colors rounded-lg hover:bg-[#1a1a1a]">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <MessageItem key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="glass-card border-t border-gray-700 p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-4">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="flex-1 px-4 py-3 bg-[#1a1a1a] border border-[#ff007f]/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff007f] focus:border-[#ff007f] transition-all"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="btn-pink px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Envoyer
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Sélectionnez une conversation</h3>
              <p className="text-gray-400">Choisissez une conversation pour commencer à discuter</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ConversationItem({
  conversation,
  isSelected,
  onClick
}: {
  conversation: Conversation
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-[#1a1a1a] transition-colors ${
        isSelected ? 'bg-[#ff007f]/10 border-l-4 border-l-[#ff007f]' : ''
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-[#ff007f] rounded-full flex items-center justify-center">
          <User className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {conversation.participants.join(', ')}
          </p>
          {conversation.lastMessage && (
            <p className="text-sm text-gray-400 truncate">
              {conversation.lastMessage.content}
            </p>
          )}
        </div>
        {conversation.unreadCount > 0 && (
          <div className="bg-[#ff007f] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {conversation.unreadCount}
          </div>
        )}
      </div>
    </div>
  )
}

function MessageItem({ message }: { message: Message }) {
  const { user } = useAuthStore()
  const isOwnMessage = message.senderId === user?.id

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
          isOwnMessage
            ? 'bg-[#ff007f] text-white'
            : 'bg-[#1a1a1a] text-white border border-gray-700'
        }`}
      >
        <p className="text-sm">{message.content}</p>
        <p className={`text-xs mt-1 ${isOwnMessage ? 'text-pink-100' : 'text-gray-400'}`}>
          {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  )
}
