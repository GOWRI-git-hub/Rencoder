import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  dynamicheet,
    ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { useIP } from "../components/IPContext";
import { useNavigation } from "@react-navigation/native";
 

const Closed = () => {
  const ip = useIP();
  const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const { width, height } = useWindowDimensions();
    const dynamic = getDynamic(width, height);

  const fetchClosedTickets = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");

      if (!token) {
        console.warn("JWT token not found");
        return;
      }

      const response = await fetch(`http://${ip}:5000/getclosedtickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setTickets(data.tickets || []);
      console.log("Closed Tickets:", data.tickets);
    } catch (error) {
      console.error("Error fetching closed tickets:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClosedTickets();
  }, []);

  const renderTicket = ({ item }) => {
    const { firstMessage } = item;
    const formattedTime = firstMessage?.timestamp
      ? new Date(firstMessage.timestamp).toLocaleString()
      : "";

    return (
      <View style={dynamic.ticket}>
        <View style={dynamic.rowBetween}>
          <Text style={dynamic.ticketTitle}>
            {item.ticketId}: {firstMessage?.senderName || ""}
          </Text>
          <Text style={dynamic.time}>{formattedTime}</Text>
        </View>
        <Text style={dynamic.message}>
          {firstMessage?.content || "No message yet"}
        </Text>
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
      <View style={dynamic.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={dynamic.backButton}
        >
          <MaterialIcons name="arrow-back" size={30} color="#1F2937" />
        </TouchableOpacity>
        <Text style={dynamic.title}>Closed Tickets</Text>
      </View>

      <FlatList
        data={tickets}
        keyExtractor={(item) => item.ticketId}
        renderItem={renderTicket}
        ListEmptyComponent={
          <Text style={dynamic.emptyText}>No closed tickets found</Text>
        }
      />
    </View>
  );
};

export default Closed;
const getDynamic = (width, height) => ({
  container: {
    flex: 1,
    paddingTop: height * 0.05,
    paddingHorizontal: width * 0.04,
    backgroundColor: "rgb(217, 219, 201)",
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: "700",
    color: "#1F2937",
    fontFamily: "serif",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginTop: -height * 0.04,
    marginBottom: height * 0.035,
    marginLeft: width * 0.1,
  },
  backButton: {
    marginTop: height * 0.025,
  },
  topRight: {
    alignItems: "flex-end",
    marginBottom: height * 0.015,
  },

  
  ticket: {
    backgroundColor: "rgb(221, 221, 209)",
    borderRadius: width * 0.03,
    padding: width * 0.04,
    marginBottom: height * 0.015,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ticketTitle: {
    fontSize: width * 0.04,
    fontWeight: "600",
    color: "#111827",
    fontFamily: "serif",
  },
  time: {
    fontSize: width * 0.03,
    color: "#6B7280",
  },
  message: {
    marginTop: height * 0.018,
    fontSize: width * 0.035,
    color: "#374151",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
