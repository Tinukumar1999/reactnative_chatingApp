import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet,
  Modal, Pressable, Image, Alert, ScrollView, Platform, SafeAreaView, KeyboardAvoidingView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const initialContacts = [
  { id: '1', name: 'Jaimin', photo: 'https://i.pravatar.cc/150?img=1' },
  { id: '2', name: 'Shlok', photo: 'https://i.pravatar.cc/150?img=2' },
  { id: '3', name: 'Myntra', photo: 'https://i.pravatar.cc/150?img=3' },
  { id: '4', name: 'Zeel', photo: 'https://i.pravatar.cc/150?img=4' },
  { id: '5', name: 'Laksh', photo: 'https://i.pravatar.cc/150?img=5' }
];

export default function App() {
  const [contacts, setContacts] = useState(initialContacts);
  const [selectedContact, setSelectedContact] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState({});
  const [editMode, setEditMode] = useState({ status: false, id: null });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState(null);

  const sendMessage = () => {
    if (message.trim() === '') return;

    const newMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'me',
      seen: false,
      edited: false,
      pinned: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const contactId = selectedContact.id;
    const updatedMessages = {
      ...messages,
      [contactId]: [...(messages[contactId] || []), newMessage]
    };

    setMessages(updatedMessages);
    setMessage('');

    setTimeout(() => {
      const reply = {
        id: Date.now().toString() + '_bot',
        text: 'Auto-reply: Got your message!',
        sender: 'bot',
        seen: true,
        edited: false,
        pinned: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => ({
        ...prev,
        [contactId]: [...(prev[contactId] || []), reply]
      }));
    }, 1000);
  };

  const handleEdit = (msg) => {
    setEditMode({ status: true, id: msg.id });
    setMessage(msg.text);
    setModalVisible(false);
  };

  const saveEditedMessage = () => {
    const contactId = selectedContact.id;
    setMessages(prev => ({
      ...prev,
      [contactId]: prev[contactId].map(msg =>
        msg.id === editMode.id ? { ...msg, text: message, edited: true } : msg
      )
    }));
    setEditMode({ status: false, id: null });
    setMessage('');
  };

  const handleDelete = (msgId) => {
    const contactId = selectedContact.id;
    setMessages(prev => ({
      ...prev,
      [contactId]: prev[contactId].filter(m => m.id !== msgId)
    }));
    setModalVisible(false);
  };

  const handlePin = (msgId) => {
    const contactId = selectedContact.id;
    setMessages(prev => ({
      ...prev,
      [contactId]: prev[contactId].map(m =>
        m.id === msgId ? { ...m, pinned: !m.pinned } : m
      )
    }));
    setModalVisible(false);
  };

  const addContact = () => {
    const id = Date.now().toString();
    const name = 'Contact ' + id.slice(-4);
    const newContact = {
      id,
      name,
      photo: `https://i.pravatar.cc/150?u=${id}`
    };
    setContacts(prev => [...prev, newContact]);
  };

  const openModal = (msg) => {
    if (msg.sender !== 'me') return;
    setSelectedMsg(msg);
    setModalVisible(true);
  };

  const ContactList = () => (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={styles.title}>Chat_with_Loved1s</Text>
      {contacts.map(contact => (
        <TouchableOpacity
          key={contact.id}
          style={styles.contact}
          onPress={() => setSelectedContact(contact)}
        >
          <Image source={{ uri: contact.photo }} style={styles.avatar} />
          <Text style={styles.name}>{contact.name}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity onPress={addContact} style={styles.addBtn}>
        <Ionicons name="person-add" size={24} color="white" />
        <Text style={{ color: 'white', marginLeft: 5, fontWeight: 'bold' }}>Add Contact</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const MessageItem = ({ msg }) => (
    <TouchableOpacity onLongPress={() => openModal(msg)} style={[styles.message, styles.bubble, msg.sender === 'me' ? styles.sent : styles.received]}>
      <Text style={styles.messageText}>{msg.text}</Text>
      <View style={styles.meta}>
        {msg.edited && <Text style={styles.tag}>edited</Text>}
        {msg.pinned && <Text style={styles.tag}>📌</Text>}
        <Text style={styles.timestamp}>{msg.timestamp}</Text>
        {msg.sender === 'me' && <Text style={styles.tag}>{msg.seen ? '✓✓' : '✓'}</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.container}>
          {!selectedContact ? (
            <ContactList />
          ) : (
            <View style={{ flex: 1 }}>
              <View style={styles.header}>
                <TouchableOpacity onPress={() => setSelectedContact(null)}>
                  <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Image source={{ uri: selectedContact.photo }} style={styles.avatarSmall} />
                <Text style={styles.headerText}>{selectedContact.name}</Text>
              </View>

              <FlatList
                data={[...(messages[selectedContact.id] || [])].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <MessageItem msg={item} />}
                contentContainerStyle={{ padding: 15 }}
              />

              <View style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  placeholder="Type a message"
                  placeholderTextColor="#aaa"
                  value={message}
                  onChangeText={setMessage}
                />
                <TouchableOpacity onPress={editMode.status ? saveEditedMessage : sendMessage}>
                  <Ionicons name={editMode.status ? 'checkmark' : 'send'} size={28} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <Modal visible={modalVisible} transparent animationType="fade">
            <Pressable style={styles.modalBackground} onPress={() => setModalVisible(false)}>
              <View style={styles.modalContent}>
                <TouchableOpacity onPress={() => handleEdit(selectedMsg)}>
                  <Text style={styles.modalOption}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(selectedMsg.id)}>
                  <Text style={styles.modalOption}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handlePin(selectedMsg.id)}>
                  <Text style={styles.modalOption}>Pin/Unpin</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Modal>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffe4ec' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 10, color: '#d63384' },
  contact: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#e58fb0', marginVertical: 6, borderRadius: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 15 },
  name: { color: 'white', fontSize: 18, fontWeight: '600' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#d87093', marginTop: 20, padding: 12, borderRadius: 10 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#ff9aae' },
  avatarSmall: { width: 36, height: 36, borderRadius: 18, marginLeft: 10 },
  headerText: { color: 'white', fontSize: 20, marginLeft: 10, fontWeight: 'bold' },
  inputBox: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#ffc0cb' },
  input: { flex: 1, color: 'black', backgroundColor: '#fff0f5', borderRadius: 25, paddingHorizontal: 20, paddingVertical: Platform.OS === 'ios' ? 12 : 8, marginRight: 10, fontSize: 16 },
  message: { padding: 12, marginVertical: 6, borderRadius: 16, maxWidth: '75%' },
  sent: { backgroundColor: '#ffffff', alignSelf: 'flex-end' },
  received: { backgroundColor: '#ffffff', alignSelf: 'flex-start' },
  messageText: { fontSize: 16, color: 'black' },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 },
  tag: { color: '#555', fontSize: 11 },
  timestamp: { fontSize: 11, color: '#888' },
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fefefe', padding: 25, borderRadius: 12, width: 280 },
  modalOption: { fontSize: 18, marginVertical: 10, textAlign: 'center', color: '#d87093' }
});
