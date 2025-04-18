import React, { useEffect, useState } from "react";
import { useIP } from "../components/IPContext";
import * as SecureStore from "expo-secure-store";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  ImageBackground,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import CryptoJS from "react-native-crypto-js";
import { useNavigation } from "@react-navigation/native";

const Accounts = () => {
  const ip = useIP();
  //const ip = process.env.EXPO_PUBLIC_IP;
  const [profile, setProfile] = useState(null);
  const secretKey = "secretkey_16byte";
  const navigate = useNavigation();
  const decryptData = (text) => {
    const key = CryptoJS.enc.Utf8.parse(secretKey);
    const iv = CryptoJS.enc.Utf8.parse("fixed16byteIV_");
    const encrypted = CryptoJS.AES.decrypt(text, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString(CryptoJS.enc.Utf8);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        if (!token) {
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
        const decryptedEmail = decryptData(data.email);
        setProfile({ ...data, email: decryptedEmail });
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: "https://i.pinimg.com/474x/ae/46/19/ae4619db3c3ceb421726290257b527ff.jpg",
        }}
        style={styles.bgimage}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigate.goBack()}
        >
          <FontAwesome name="arrow-left" size={24} color="#444" />
        </TouchableOpacity>
        {profile ? (
          <>
            <View style={styles.imageContainer}>
              <Image source={{ uri: profile.image }} style={styles.image} />
            </View>

            <View style={styles.card}>
              <ProfileRow
                icon="user"
                label={`${profile.firstname} ${profile.lastname}`}
              />
              <ProfileRow icon="calendar" label={profile.dob} />
              <ProfileRow icon="email" label={profile.email} materialIcon />
              <ProfileRow
                icon="location-on"
                label={profile.address}
                materialIcon
              />
              <ProfileRow icon="info" label={profile.status} materialIcon />
            </View>
          </>
        ) : (
          <ActivityIndicator
            size="large"
            color="#2C3E50"
            style={styles.loader}
          />
        )}
      </ImageBackground>
    </View>
  );
};

const ProfileRow = ({ icon, label, materialIcon }) => (
  <View style={styles.cardRow}>
    {materialIcon ? (
      <MaterialIcons name={icon} size={24} color="#2C3E50" />
    ) : (
      <FontAwesome name={icon} size={24} color="#2C3E50" />
    )}
    <Text style={styles.cardText}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  backButton: {
    position: "absolute",
    top: 70,
    left: 20,
    padding: 10,
    borderRadius: 50,
    zIndex: 10,
  },
  container: {
    flex: 1,
    backgroundColor: "#F4F6F7",
    alignItems: "center",
  },
  bgimage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  imageContainer: {
    marginTop: 90,
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: "hidden",
    marginVertical: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  card: {
    backgroundColor: "rgba(21, 20, 20, 0.1)",
    padding: 20,
    borderRadius: 15,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    width: "90%",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 22,
    borderBottomWidth: 1,
    borderBottomColor: "#ECF0F1",
  },
  cardText: {
    fontSize: 16,
    color: "#2C3E50",
    marginLeft: 15,
    fontFamily: "serif",
    fontWeight: "600",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Accounts;
