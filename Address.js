import React, { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { useIP } from "../components/IPContext";
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function Address() {
  const ip = useIP();
  const { width, height } = useWindowDimensions();
  const dynamic = getDynamic(width, height);

  const [profile, setProfile] = useState("");
 // const ip = process.env.EXPO_PUBLIC_IP;
  const navigate = useNavigation();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        console.log("toknens", token);
        if (!token) {
          navigate.replace("Login");
          console.log("Token is null");
          return;
        }

        const response = await fetch(`http://${ip}:5000/leadprofile`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        setProfile(data);
        console.log("dsadfasdf", profile);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);
  return (
    <View style={dynamic.container}>
      <TouchableOpacity
        style={dynamic.backButton}
        onPress={() => navigate.goBack()}
      >
        <FontAwesome name="arrow-left" size={24} color="#444" />
      </TouchableOpacity>
      <MapView
        style={dynamic.map}
        initialRegion={{
          latitude: 13.0827,
          longitude: 80.2707,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{ latitude: 13.0827, longitude: 80.2707 }}
          title="Your Location"
          description="Chennai, Tamil Nadu"
        />
      </MapView>

      <View style={dynamic.addressCard}>
        <MaterialIcons name="location-on" size={24} color="#2C3E50" />
        <Text style={dynamic.addressText}>{profile.address}</Text>
      </View>

      <TouchableOpacity style={dynamic.button}>
        <Text style={dynamic.buttonText}>Set Location</Text>
      </TouchableOpacity>
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
    backgroundColor: "#F4F6F7",
    alignItems: "center",
  },
  map: {
    width: width,
    height: height * 0.5,
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: width * 0.04,
    borderRadius: width * 0.025,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: height * 0.005 },
    shadowOpacity: 0.2,
    shadowRadius: width * 0.03,
    elevation: 3,
    width: width * 0.9,
    marginVertical: height * 0.02,
  },
  addressText: {
    fontSize: width * 0.04,
    color: "#2C3E50",
    marginLeft: width * 0.025,
  },
  button: {
    backgroundColor: "#3498DB",
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.07,
    borderRadius: width * 0.025,
    marginTop: height * 0.01,
    shadowColor: "#3498DB",
    shadowOffset: { width: 0, height: height * 0.005 },
    shadowOpacity: 0.3,
    shadowRadius: width * 0.03,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontSize: width * 0.04,
    fontWeight: "bold",
  },
});
