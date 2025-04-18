import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  dynamicheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ToastAndroid,
  useWindowDimensions,
} from "react-native";
import { Picker } from "@react-native-picker/picker"; 
import * as SecureStore from "expo-secure-store";
import { useIP } from "../components/IPContext";
import { useNavigation } from "@react-navigation/native";

const LeadTicket = () => {
  const ip = useIP();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
const [showForm, setShowForm] = useState(false);
  const [assignedTo, setAssignedTo] = useState("");
  const [ticketContent, setTicketContent] = useState("");
    const navigation = useNavigation();
     const { width, height } = useWindowDimensions();
      const dynamic = getDynamic(width, height);

  const fetchLeadTickets = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");

      if (!token) {
        console.warn("JWT token not found");
        return;
      }

      const response = await fetch(`http://${ip}:5000/leadopenedtickets`, {
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
      console.log("Fetched Lead Tickets:", data.tickets);
    } catch (error) {
      console.error("Error fetching lead tickets:", error.message);
    } finally {
      setLoading(false);
    }
  };


    
    const handleCreateTicket = async () => {
        try {
          const token = await SecureStore.getItemAsync("token");
    
          const response = await fetch(`http://${ip}:5000/createticket`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              gotName: assignedTo,
              gotcontent: ticketContent,
            }),
          });
    
          const data = await response.json();
    
          if (!response.ok)
            throw new Error(data.error || "Failed to create ticket");
    
          setShowForm(false);
          setAssignedTo("");
          setTicketContent("");
          fetchLeadTickets();
          ToastAndroid.show("Ticket created successfully!", ToastAndroid.SHORT);
        } catch (error) {
           ToastAndroid.show( error.message || "Error", ToastAndroid.SHORT);
        }
      };
    
      useEffect(() => {
        fetchLeadTickets();
      }, []);
    

  const renderTicket = ({ item }) => {
    const { firstMessage } = item;
    const formattedTime = firstMessage?.timestamp
      ? new Date(firstMessage.timestamp).toLocaleString()
      : "";

    return (
      <TouchableOpacity
        style={dynamic.ticket}
        onPress={() => navigation.navigate("Chat", { ticketId: item.ticketId })}
      >
        <View style={dynamic.rowBetween}>
          <Text style={dynamic.ticketTitle}>
            {item.ticketId}: {item.assignedTo || "Unknown"}
          </Text>
          <Text style={dynamic.time}>{formattedTime}</Text>
        </View>
        <Text style={dynamic.message}>
           Sender : {firstMessage?.senderName || "Unknown"}
         </Text>
        <Text style={dynamic.message}>
          {firstMessage?.content || "No message yet"}
        </Text>
      </TouchableOpacity>
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
      <Text style={dynamic.title}>My Open Tickets</Text>
      <FlatList
        data={tickets}
        keyExtractor={(item) => item.ticketId}
        renderItem={renderTicket}
        ListEmptyComponent={<Text>No open tickets available.</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
          />
          {showForm && (
                  <View style={dynamic.card}>
                    <Text style={dynamic.cardTitle}>Create New Ticket</Text>
          
                    <Text style={dynamic.label}>Assigned To:</Text>
                    <View style={dynamic.pickerWrapper}>
                      <Picker
                        selectedValue={assignedTo}
                        onValueChange={(itemValue) => setAssignedTo(itemValue)}
                      >
                        <Picker.Item
                          label="Select a lead/admin..."
                          value=""
                          enabled={false}
                        />
                        <Picker.Item label="A001 (Gowri)" value="Gowri" />
                        <Picker.Item label="L001 (Sathish)" value="Sathish" />
                        <Picker.Item label="L002 (Abinaya)" value="Abinaya" />
                        <Picker.Item label="L003 (Pooja)" value="Pooja" />
                        <Picker.Item label="L004 (Subha)" value="Subha" />
                        <Picker.Item label="L005 (Vaishnavi)" value="Vaishnavi" />
                        <Picker.Item label="L006 (Pavi)" value="Pavi" />
                        <Picker.Item label="L007 (Oswald)" value="Oswald" />
                        <Picker.Item label="L008 (Gowri)" value="Gowri" />
                      </Picker>
                    </View>
          
                    <Text style={dynamic.label}>Reason:</Text>
                    <View style={dynamic.pickerWrapper}>
                      <Picker
                        selectedValue={ticketContent}
                        onValueChange={(itemValue) => setTicketContent(itemValue)}
                      >
                        <Picker.Item
                          label="Select a reason..."
                          value=""
                          enabled={false}
                        />
                        <Picker.Item
                          label="Unable to access portal"
                          value="Unable to access portal"
                        />
                        <Picker.Item
                          label="Issue with login credentials"
                          value="Issue with login credentials"
                        />
                        <Picker.Item
                          label="Incorrect data on dashboard"
                          value="Incorrect data on dashboard"
                        />
                        <Picker.Item
                          label="Need help with onboarding"
                          value="Need help with onboarding"
                        />
                        <Picker.Item
                          label="Requesting account access update"
                          value="Requesting account access update"
                        />
                        <Picker.Item
                          label="Error loading student records"
                          value="Error loading student records"
                        />
                      </Picker>
                    </View>
          
                    <TouchableOpacity
                      style={dynamic.createBtn}
                      onPress={handleCreateTicket}
                    >
                      <Text style={dynamic.createBtnText}>Submit Ticket</Text>
                    </TouchableOpacity>
                  </View>
          )}
          <TouchableOpacity
                  style={dynamic.floatingBtn}
                  onPress={() => setShowForm(!showForm)}
                >
                  <Text style={dynamic.floatingBtnText}>+</Text>
                </TouchableOpacity>
    </View>
  );
};

export default LeadTicket;
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
    marginTop: height * 0.025,
    marginBottom: height * 0.015,
  },

  topRight: {
    alignItems: "flex-end",
    marginBottom: height * 0.015,
  },
  globalCloseBtn: {
    color: "#FFFFFF",
    fontSize: width * 0.04,
    fontWeight: "600",
    marginRight: width * 0.01,
  },

  closedTicketBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#34495E",
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.035,
    borderRadius: width * 0.035,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    marginTop: -height * 0.055,
    marginBottom: height * 0.015,
  },

  arrowIcon: {
    marginTop: height * 0.003,
    color: "#FFFFFF",
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
    fontSize: width * 0.042,
    fontWeight: "600",
    color: "#111827",
    fontFamily: "serif",
  },
  time: {
    fontSize: width * 0.03,
    color: "#6B7280",
  },
  message: {
    marginTop: height * 0.009,
    fontSize: width * 0.04,
    color: "#374151",
  },
  closeBtn: {
    alignSelf: "flex-end",
    backgroundColor: "#EF4444",
    paddingVertical: height * 0.008,
    paddingHorizontal: width * 0.035,
    borderRadius: width * 0.015,
    marginTop: -height * 0.025,
  },
  closeBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: width * 0.037,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  floatingBtn: {
    position: "absolute",
    right: width * 0.05,
    bottom: height * 0.025,
    backgroundColor: "#34495E",
    borderRadius: width * 0.14,
    width: width * 0.14,
    height: width * 0.14,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  floatingBtnText: {
    fontSize: width * 0.075,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: width * 0.03,
    padding: width * 0.04,
    marginHorizontal: width * 0.025,
    marginBottom: height * 0.025,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 4,
  },
  cardTitle: {
    fontSize: width * 0.05,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: height * 0.015,
  },
  label: {
    fontSize: width * 0.035,
    fontWeight: "600",
    color: "#374151",
    marginTop: height * 0.012,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: width * 0.02,
    marginTop: height * 0.008,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  createBtn: {
    backgroundColor: "#34495E",
    paddingVertical: height * 0.012,
    borderRadius: width * 0.02,
    marginTop: height * 0.02,
    alignItems: "center",
  },
  createBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: width * 0.042,
  },
});


