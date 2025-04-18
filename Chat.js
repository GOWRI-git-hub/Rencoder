import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  dynamicheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useRoute } from "@react-navigation/native";
import { useIP } from "../components/IPContext";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";



const Chat = () => {
  const { ticketId } = useRoute().params;
  const ip = useIP();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [role, setRole] = useState(null);
  const [ticket, setTicket] = useState(null);
 const { width, height } = useWindowDimensions();
    const dynamic = getDynamic(width, height);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchRole = async () => {
      const storedRole = await SecureStore.getItemAsync("roal");
      setRole(storedRole);
    };
    fetchRole();
  }, []);


  const fetchMessages = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        console.log("JWT token not found");
        return;
      }

      const response = await fetch(`http://${ip}:5000/getmessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ticketId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch messages");
      }

      setMessages(data.ticket?.messages || []);
      setTicket(data.ticket);
      console.log("Fetched ticket data:", data.ticket);

    } catch (error) {
      console.error("Error fetching messages:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      setSending(true);
      const token = await SecureStore.getItemAsync("token");

      if (!token || messages.length === 0) {
        return Alert.alert(
          "Error",
          "User not authenticated or messages not loaded"
        );
      }

      const senderId = messages[0].senderId;

      // console.log("senderid", senderId);
      const response = await fetch(`http://${ip}:5000/sendmsg`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ticketId,
          gotcontent: inputMessage,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send");

      setInputMessage("");
      fetchMessages();
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSending(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMessages();
  };

  const renderItem = ({ item }) => {
    const formattedTime = item.timestamp
      ? new Date(item.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    const isCurrentUser = item.senderRole === role;
    return (
    
      <View
        style={[
          dynamic.messageBubble,
          isCurrentUser ? dynamic.myMessage : dynamic.otherMessage,
          // item.senderRole === "admin" ? dynamic.adminBubble : dynamic.leadBubble,
        ]}
      >
        <Text style={dynamic.content}>{item.content}</Text>
        <Text style={dynamic.timestamp}>{formattedTime}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={dynamic.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={dynamic.container}>
      {/* <Text style={dynamic.title}>{messages[0]?.senderName || "Unknown"}</Text> */}
      {/* <View style={dynamic.header}>
        <Text style={dynamic.title}>{messages[0]?.senderName || "Unknown"}</Text>
        <TouchableOpacity onPress={handleRefresh} style={dynamic.refreshButton}>
          <Text style={dynamic.refreshText}>
            {refreshing ? "Refreshing..." : "Refresh"}
          </Text>
        </TouchableOpacity>
      </View> */}
      <View style={dynamic.inputContainers}>
        <View style={dynamic.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={dynamic.backButton}
          >
            <MaterialIcons name="arrow-back" size={30} color="#1F2937" />
          </TouchableOpacity>
          <Text style={dynamic.title}>
            {role === "lead"
              ? ticket?.assignedTo || "Unknown"
              : messages[0]?.senderName || "Unknown"}
          </Text>
          <TouchableOpacity onPress={handleRefresh} style={dynamic.iconButton}>
            <MaterialIcons name="refresh" size={28} color="#34495E" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
      <View style={dynamic.inputContainer}>
        <TextInput
          style={dynamic.input}
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="Type a message..."
        />
        <TouchableOpacity
          style={dynamic.sendButton}
          onPress={sendMessage}
          disabled={sending}
        >
          <FontAwesome
            name="send"
            size={22}
            color={sending ? "#ccc" : "#34495E"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Chat;const getDynamic = (width, height) => ({
  backButton: {
    marginTop: height * 0.025,
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    // paddingHorizontal: width * 0.04,
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: height * 0.02,
    flex: 1,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: height * 0.015,
    marginTop: height * 0.010,
  },
  iconButton: {
    padding: width * 0.02,
    marginTop: height * 0.025,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: width * 0.035,
    borderRadius: width * 0.04,
    marginVertical: height * 0.008,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCFCE7",
    borderColor: "#4ADE80",
    marginLeft: width * 0.1,
    marginRight: width * 0.025,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#E0E7FF",
    borderColor: "#6366F1",
    marginRight: width * 0.1,
    marginLeft: width * 0.025,
  },
  content: {
    fontSize: width * 0.04,
    color: "#1F2937",
    lineHeight: height * 0.03,
  },
  timestamp: {
    fontSize: width * 0.03,
    color: "#6B7280",
    marginTop: height * 0.005,
    textAlign: "right",
  },
  inputContainers: {
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.03,
    backgroundColor: "#FFFFFF",
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopColor: "#E5E7EB",
    borderTopWidth: 1,
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.03,
    backgroundColor: "#FFFFFF",
  },
  input: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: width * 0.05,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.012,
    fontSize: width * 0.04,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sendButton: {
    marginLeft: width * 0.025,
    backgroundColor: "#E5E7EB",
    padding: width * 0.03,
    borderRadius: width * 0.075,
    justifyContent: "center",
    alignItems: "center",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
