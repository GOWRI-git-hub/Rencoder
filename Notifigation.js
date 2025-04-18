

import React, { useState } from "react";
import { View, Text, dynamicheet, Switch ,TouchableOpacity,useWindowDimensions} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";


export default function Notification() {
   const { width, height } = useWindowDimensions();
    const dynamic = getDynamic(width, height);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [appUpdates, setAppUpdates] = useState(true);
  const [promotionalOffers, setPromotionalOffers] = useState(false);
  const [eventReminders, setEventReminders] = useState(true);
  const navigate = useNavigation();
  return (
    <View style={dynamic.container}>
      <Text style={dynamic.header}>Notification Settings</Text>
      <TouchableOpacity
        style={dynamic.backButton}
        onPress={() => navigate.goBack()}
      >
        <FontAwesome name="arrow-left" size={24} color="#444" />
      </TouchableOpacity>
      <View style={dynamic.notificationRow}>
        <Text style={dynamic.label}>Email Notifications</Text>
        <Switch
          value={emailNotifications}
          onValueChange={() => setEmailNotifications(!emailNotifications)}
        />
      </View>

      <View style={dynamic.notificationRow}>
        <Text style={dynamic.label}>SMS Notifications</Text>
        <Switch
          value={smsNotifications}
          onValueChange={() => setSmsNotifications(!smsNotifications)}
        />
      </View>

      <View style={dynamic.notificationRow}>
        <Text style={dynamic.label}>App Updates</Text>
        <Switch
          value={appUpdates}
          onValueChange={() => setAppUpdates(!appUpdates)}
        />
      </View>

      <View style={dynamic.notificationRow}>
        <Text style={dynamic.label}>Promotional Offers</Text>
        <Switch
          value={promotionalOffers}
          onValueChange={() => setPromotionalOffers(!promotionalOffers)}
        />
      </View>

      <View style={dynamic.notificationRow}>
        <Text style={dynamic.label}>Event Reminders</Text>
        <Switch
          value={eventReminders}
          onValueChange={() => setEventReminders(!eventReminders)}
        />
      </View>
    </View>
  );
}
const getDynamic = (width, height) => ({
  backButton: {
    position: "absolute",
    top: height * 0.08,
    left: width * 0.05, 
    padding: width * 0.025,
    borderRadius: width * 0.125, 
    zIndex: 10,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: width * 0.05, 
  },
  header: {
    fontSize: width * 0.053,
    fontWeight: "bold",
    marginBottom: height * 0.035, 
    color: "#2C3E50",
    marginTop: height * 0.06, 
    marginLeft: width * 0.16,
    fontFamily: "serif",
  },
  notificationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // backgroundColor: "white",
    padding: width * 0.013,
    borderRadius: width * 0.05,
    marginVertical: height * 0.006, 
    borderBottomColor: "#EAEDED",
    borderBottomWidth: 1,
  },
  label: {
    fontSize: width * 0.042, 
    color: "#34495E",
    fontFamily: "serif",
  },
});
