import React, { useState } from "react";
import * as SecureStore from "expo-secure-store";
import { useIP } from "../components/IPContext";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ToastAndroid,
  dynamicheet,
  ImageBackground,
  useWindowDimensions,
} from "react-native";
import CryptoJS from "react-native-crypto-js";
import { FontAwesome } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

//const ip = process.env.EXPO_PUBLIC_IP;
const Password = () => {
  const ip = useIP();
  const { width, height } = useWindowDimensions();
  const dynamic = getDynamic(width, height);

  const navigate = useNavigation();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isValidPassword, setIsValidPassword] = useState(null);

  const secretKey = "secretkey_16byte";

  // Encryption function
  const encryptData = (text) => {
    const key = CryptoJS.enc.Utf8.parse(secretKey);
    const iv = CryptoJS.enc.Utf8.parse("fixed16byteIV_");
    const encrypted = CryptoJS.AES.encrypt(text, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
  };

  // Verify Old Password
  const verifyOldPassword = async () => {
    if (!oldPassword) {
      ToastAndroid.show("Old password is required!", ToastAndroid.SHORT);
      return;
    }
    const enoldPassword = encryptData(oldPassword);

    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        ToastAndroid.show(
          "Authentication error! Please log in again.",
          ToastAndroid.SHORT
        );
        return;
      }
      const response = await fetch(`http://${ip}:5000/verify-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enoldPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        setIsVerified(true);
        ToastAndroid.show("Old password verified!", ToastAndroid.SHORT);
      } else {
        ToastAndroid.show(
          `Error: ${data.error || "Something went wrong"}`,
          ToastAndroid.LONG
        );
        // ToastAndroid.show("Old password Invalied!", ToastAndroid.SHORT);
      }
    } catch (error) {
      ToastAndroid.show(`Error: ${data.error || "failed"}`, ToastAndroid.SHORT);
    }
  };
  //validation
  // const validatePassword = (password) => {
  //   const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6}$/;
  //   setNewPassword(password);
  //   setIsValidPassword(passwordPattern.test(password));
  // };

  // Update Password
  const updatePassword = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        ToastAndroid.show(
          "Authentication error! Please log in again.",
          ToastAndroid.SHORT
        );
        return;
      }
      const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6}$/;

      if (!oldPassword) {
        ToastAndroid.show("Old password is required!", ToastAndroid.SHORT);
        return;
      }

      if (!newPassword) {
        ToastAndroid.show("New password is required!", ToastAndroid.SHORT);
        return;
      }

      if (!passwordPattern.test(newPassword)) {
        ToastAndroid.show(
          "Password must be exactly 6 characters with letters & numbers!",
          ToastAndroid.SHORT
        );
        return;
      }

      if (newPassword !== confirmPassword) {
        ToastAndroid.show("Passwords do not match!", ToastAndroid.SHORT);
        return;
      }
      const enoldPassword = encryptData(oldPassword);
      const ennewPassword = encryptData(newPassword);

      if (enoldPassword === ennewPassword) {
        ToastAndroid.show(
          "New password cannot be same as old password!",
          ToastAndroid.SHORT
        );
        return;
      }

      const response = await fetch(`http://${ip}:5000/newpassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enoldPassword, ennewPassword }),
      });

      const data = await response.json();
      if (data.success) {
        ToastAndroid.show("Password updated successfully!", ToastAndroid.SHORT);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setIsVerified(false);
        setIsValidPassword(null);
        setpassIcon(true);
      } else {
        // ToastAndroid.show("Failed to update password.", ToastAndroid.SHORT);
        ToastAndroid.show(
          `Error: ${data.error || "Something went wrong"}`,
          ToastAndroid.LONG
        );
      }
    } catch (error) {
      ToastAndroid.show("Something went wrong.", ToastAndroid.SHORT);
    }
  };

  return (
    <View style={dynamic.container}>
      <ImageBackground
        source={{
          uri: "https://i.pinimg.com/736x/2e/51/8e/2e518e6c0fb1f4c88b29417c7aed145b.jpg",
        }}
        style={dynamic.backgroundImage}
        imageStyle={{ borderTopLeftRadius: 17, borderTopRightRadius: 17 }}
        resizeMode="stretch"
      >
        <TouchableOpacity
          style={dynamic.backButton}
          onPress={() => navigate.goBack()}
        >
          <FontAwesome name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
      </ImageBackground>
      <View style={dynamic.card}>
        <Text style={dynamic.title}>Change Password</Text>
        <View style={dynamic.inputContainer}>
          <TextInput
            secureTextEntry
            value={oldPassword}
            onChangeText={setOldPassword}
            placeholder="Enter Old Password"
            style={dynamic.input}
          />
          {isVerified && (
            <Icon
              name="check-circle"
              size={20}
              color="green"
              style={dynamic.icon}
            />
          )}
        </View>

        <TouchableOpacity style={dynamic.button} onPress={verifyOldPassword}>
          <Text style={dynamic.buttonText}>Verify Old Password</Text>
        </TouchableOpacity>

        {isVerified && (
          <>
            <TextInput
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter New Password"
              style={dynamic.input}
            />

            <TextInput
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm New Password"
              style={dynamic.input}
            />

            <TouchableOpacity style={dynamic.button} onPress={updatePassword}>
              <Text style={dynamic.buttonText}>Update Password</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

// dynamic

const getDynamic = (width, height) => ({
  backButton: {
    position: "absolute",
    top: height * 0.05,
    left: width * 0.05,
    padding: width * 0.025,
    borderRadius: width * 0.125,
    zIndex: 10,
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundImage: {
    width: "100%",
    height: height * 0.44,
    position: "absolute",
    top: 0,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: width * 0.05,
    padding: width * 0.05,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: height * 0.0025 },
    shadowOpacity: 0.2,
    shadowRadius: width * 0.013,
    position: "absolute",
    top: "40%",
  },
  title: {
    fontSize: width * 0.058,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: height * 0.025,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#F5F5F5",
    borderRadius: width * 0.027,
    padding: width * 0.03,
    fontSize: width * 0.042,
    marginBottom: height * 0.018,
    marginTop: height * 0.0125,
  },
  button: {
    backgroundColor: "#34495E",
    paddingVertical: height * 0.015,
    borderRadius: width * 0.027,
    alignItems: "center",
    marginVertical: height * 0.006,
    elevation: 3,
  },
  buttonText: {
    fontSize: width * 0.042,
    color: "#fff",
    fontWeight: "bold",
  },
  icon: {
    position: "absolute",
    right: width * 0.04,
    bottom: height * 0.03125,
  },
});
export default Password;
