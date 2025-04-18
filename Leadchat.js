import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
//import * as SecureStore from "expo-secure-store";
import { useIP } from "../components/IPContext";

const LeadChat = () => {
  const ip = useIP();
  const [tickets, setTickets] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [adminId, setAdminId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTickets = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) return;

      const response = await fetch(`http://${ip}:5000/lead-tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to fetch tickets");

      setTickets(data.tickets || []);

      const allMessages = data.tickets.flatMap(
        (ticket) => ticket.messages || []
      );
      setMessages(allMessages);

      const adminMessage = allMessages.find(
        (msg) => msg.senderRole === "admin"
      );
      if (adminMessage) setAdminId(adminMessage.senderId);
    } catch (error) {
      console.error("Error fetching tickets/messages:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };
  const sendMessage = async () => {
    if (!inputMessage.trim() || !adminId) return;

    try {
      setSending(true);
      const token = await SecureStore.getItemAsync("token");

      const response = await fetch(`http://${ip}:5000/sendmsg`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gotId: adminId,
          gotcontent: inputMessage,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send message");

      setInputMessage("");
      fetchTickets();
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }) => {
    const formattedTime = item.timestamp
      ? new Date(item.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    return (
      <View
        style={[
          styles.messageBubble,
          item.senderRole === "admin" ? styles.adminBubble : styles.leadBubble,
        ]}
      >
        <Text style={styles.content}>{item.content}</Text>
        <Text style={styles.timestamp}>{formattedTime}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Chat</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Text style={styles.refreshText}>
            {refreshing ? "Refreshing..." : "Refresh"}
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="Type your message..."
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
          disabled={sending}
        >
          <Text style={styles.sendButtonText}>{sending ? "..." : "Send"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LeadChat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    alignSelf: "center",
    marginTop: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  refreshButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 30,
  },
  refreshText: {
    color: "white",
    fontWeight: "bold",
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: "80%",
  },
  adminBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#d1e7ff",
  },
  leadBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#d4edda",
  },
  content: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: "#555",
    marginTop: 5,
    textAlign: "right",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#ccc",
    padding: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
