import React, { useEffect, useState } from "react";
import { useIP } from "../components/IPContext";
import {
  Text,
  View,
  Image,
  ImageBackground,
  ToastAndroid,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import CryptoJS from "react-native-crypto-js";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
//const ip = process.env.EXPO_PUBLIC_IP;

const Profile = () => {
  const ip = useIP();
  const { width, height } = useWindowDimensions();
  const dynamic = getDynamic(width, height);
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const secretKey = "secretkey_16byte";

  const decryptData = (text) => {
    const key = CryptoJS.enc.Utf8.parse(secretKey);
    const iv = CryptoJS.enc.Utf8.parse("fixed16byteIV_");
    const encrypted = CryptoJS.AES.decrypt(text, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        console.log("toknens", token);
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

  //logout
  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("email");
    await SecureStore.deleteItemAsync("roal");
    await SecureStore.deleteItemAsync("Id");

    // await SecureStore.deleteItemAsync("userEmail");
    // await SecureStore.deleteItemAsync("userPassword");
    console.log("data removed");
    ToastAndroid.show("Logout Successful!", ToastAndroid.SHORT);
    navigation.replace("Login");
  };
  const handlepassword = async () => {
    ToastAndroid.show("move the password page!", ToastAndroid.SHORT);
    navigation.navigate("Password");
  };
  const handleaccount = async () => {
    navigation.navigate("Accounts");
  };
  const handleaddress = async () => {
    navigation.navigate("Address");
  };
  const handlenotification = async () => {
    navigation.navigate("Notification");
  };
  const handledevices = async () => {
   // navigation.navigate("Devices");
  };
  const handlechat = async () => {
     navigation.navigate("Ticket");
  };
  return (
    <View style={dynamic.container}>
      <ImageBackground
        source={{
          uri: "https://i.pinimg.com/736x/4b/67/13/4b6713c47b48ac786f4c0bf341634ef0.jpg",
        }}
        style={dynamic.backgroundImage}
        imageStyle={{ borderTopLeftRadius: 17, borderTopRightRadius: 17 }}
        resizeMode="stretch"
      >
        {/* Profile Image */}

        <View style={dynamic.profileContainer}>
          {profile?.image ? (
            <Image
              source={{ uri: profile.image }}
              style={dynamic.profileImage}
            />
          ) : (
            <Text style={dynamic.errorText}>No Profile Image</Text>
          )}
        </View>
        <Text style={dynamic.profileName}>
          {profile?.firstname} {profile?.lastname}
        </Text>
        <Text style={dynamic.quotes}>
          "Lead by learning, grow by guiding, and let your impact show."
        </Text>
      </ImageBackground>

      {/* Profile Details */}
      <View style={dynamic.floatingouter}>
        <TouchableOpacity onPress={handleaddress} style={dynamic.section}>
          <View style={dynamic.profileicons}>
            <Ionicons name="location" size={24} color="#999" />
            <Text style={dynamic.sectionTitle}>My Address</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#999" />
        </TouchableOpacity>

        <View style={dynamic.separator}></View>

        <TouchableOpacity onPress={handleaccount} style={dynamic.section}>
          <View style={dynamic.profileicons}>
            <MaterialCommunityIcons
              name="account-circle"
              size={24}
              color="#999"
            />
            <Text style={dynamic.sectionTitle}>Account</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      <View style={dynamic.outer}>
        {/* <TouchableOpacity style={dynamic.section} onPress={handlenotification}>
          <View style={dynamic.profileicons}>
            <Ionicons
              name="notifications-circle-outline"
              size={24}
              color="#999"
            />
            <Text style={dynamic.sectionTitle}>Notifications</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#999" />
        </TouchableOpacity> */}

        <View style={dynamic.separator} />
        <TouchableOpacity style={dynamic.section} onPress={handlechat}>
          <View style={dynamic.profileicons}>
            <Ionicons name="ticket-outline" size={24} color="#999" />
            <Text style={dynamic.sectionTitle}>Tickets</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={dynamic.section} onPress={handledevices}>
          <View style={dynamic.profileicons}>
            <MaterialCommunityIcons name="devices" size={24} color="#999" />
            <Text style={dynamic.sectionTitle}>Devices</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#999" />
        </TouchableOpacity>

        <View style={dynamic.separator} />
        <TouchableOpacity style={dynamic.section} onPress={handlepassword}>
          <View style={dynamic.profileicons}>
            <MaterialCommunityIcons
              name="form-textbox-password"
              size={24}
              color="#999"
            />
            <Text style={dynamic.sectionTitle}>password</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#999" />
        </TouchableOpacity>

        <View style={dynamic.separator} />
        <TouchableOpacity onPress={handleLogout} style={dynamic.section}>
          <View style={dynamic.profileicons}>
            <Ionicons name="log-out" size={24} color="#999" />
            <Text style={dynamic.sectionTitle}>SignOut</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={24} color="#999" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getDynamic = (width, height) => ({
  container: {
    flex: 1,
    backgroundColor: "#f7f6f5",
    alignItems: "center",
    borderColor: "#ddd",
    paddingBottom: width * 0.05,
  },
  backgroundImage: {
    width: width * 1,
    height: height * 0.37,
    justifyContent: "center",
    alignItems: "center",
  },
  profileContainer: {
    position: "absolute",
    bottom: height * 0.17,
    backgroundColor: "#f7f6f5",
    borderRadius: 50,
    padding: width * 0.01,
    elevation: 10, // Shadow effect//140
  },
  profileImage: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: 50,
  },

  profileName: {
    fontSize: width * 0.06,
    fontWeight: "bold",
    marginTop: width * 0.31,
    textAlign: "center",
    color: "rgb(151, 156, 80)",
    fontFamily: "serif",
  },
  quotes: {
    fontSize: width * 0.04,
    fontFamily: "serif",
    textAlign: "center",
    color: "#ffffff",
    marginTop: width * 0.02,
    paddingHorizontal: width * 0.1,
  },
  floatingouter: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: width * 0.04, // Adds gap between sections
    elevation: 4,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: width * 0.02,
    paddingHorizontal: width * 0.01,
    marginTop: -width * 0.07,
    minWidth: width * 0.9,
  },
  outer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: width * 0.04,
    elevation: 4,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: width * 0.04,
    paddingHorizontal: width * 0.01,
    minWidth: width * 0.9,
  },
  section: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: "90%",
    paddingVertical: width * 0.03,
    paddingHorizontal: width * 0.05,
    marginTop: width * 0.05,
  },
  profileicons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    columnGap: width * 0.04,
  },
  sectionTitle: {
    fontSize: width * 0.045,
    fontWeight: "600",
    color: "#333",
    textTransform: "capitalize",
  },
});

export default Profile;
