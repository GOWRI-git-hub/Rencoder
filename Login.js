import React, { useState, useEffect } from "react";
import { useIP } from "../components/IPContext";
import * as SecureStore from "expo-secure-store";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  ToastAndroid,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// const ip = "192.168.1.6";

 //const ip = process.env.EXPO_PUBLIC_IP;
 // console.log("ipp", ip);

const Login = () => {
  const ip = useIP();
   // console.log("login   ipp", ip);

  const { width, height } = useWindowDimensions();
  const dynamic = getDynamic(width, height);
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("lead");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(null);
  const [isValidOtp, setIsValidOtp] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const validateEmail = (text) => {
    setEmail(text);
    setIsValidEmail(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text));
  };

  const validateOtp = (text) => {
    setOtp(text);
    setIsValidOtp(/^\d{6}$/.test(text));
  };

  const sendOtp = async () => {
    try {
      if (resendCooldown > 0) {
        ToastAndroid.show(
          "Please wait before resending OTP",
          ToastAndroid.SHORT
        );
        return;
      }

      if (!isValidEmail) {
        ToastAndroid.show("Enter a valid email!", ToastAndroid.SHORT);
        return;
      }

      setLoading(true);

      const response = await fetch(`http://${ip}:5000/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, roal: role }),
      });

      const data = await response.json();
      if (data.success) {
        setIsOtpSent(true);
        setResendCooldown(30);
        setOtp("");
        setIsValidOtp(null);
        ToastAndroid.show("OTP sent to your email", ToastAndroid.SHORT);
      } else {
        ToastAndroid.show(
          data.message || "Failed to send OTP",
          ToastAndroid.SHORT
        );
      }
    } catch (error) {
      console.error("OTP error:", error);
      ToastAndroid.show("Server error while sending OTP", ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      if (!isValidOtp) {
        ToastAndroid.show("Enter a valid 6-digit OTP", ToastAndroid.SHORT);
        return;
      }

      const response = await fetch(`http://${ip}:5000/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp, roal: role }),
      });

      const data = await response.json();
      if (data.success) {
        await SecureStore.setItemAsync("token", data.token);
        await SecureStore.setItemAsync("email", data.user.email);
        await SecureStore.setItemAsync("roal", data.user.roal);
        await SecureStore.setItemAsync("Id", data.user.Id);

        ToastAndroid.show("Login successful", ToastAndroid.SHORT);
        navigation.replace("TabNavigator");
      } else {
        ToastAndroid.show(data.message || "Invalid OTP", ToastAndroid.SHORT);
      }
    } catch (error) {
      console.log("OTP verify error:", error);
      ToastAndroid.show("Server error during verification", ToastAndroid.SHORT);
    }
  };

  return (
    <View style={dynamic.container}>
      <Image
        source={{
          uri: "https://renambl.blr1.cdn.digitaloceanspaces.com/rcoders/web/Rencoders_logo.png",
        }}
        style={dynamic.logo}
      />

      <Text style={dynamic.title}>Welcome Back!</Text>

      <View
        style={[
          dynamic.inputContainer,
          isValidEmail === false && dynamic.errorBorder,
        ]}
      >
        <TextInput
          style={dynamic.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={validateEmail}
          keyboardType="email-address"
        />
        {isValidEmail !== null && (
          <Ionicons
            name={isValidEmail ? "checkmark-circle" : "close-circle"}
            size={20}
            color={isValidEmail ? "green" : "red"}
            style={dynamic.icon}
          />
        )}
      </View>
      {isOtpSent && (
        <View
          style={[
            dynamic.inputContainer,
            isValidOtp === false && dynamic.errorBorder,
          ]}
        >
          <TextInput
            style={dynamic.input}
            placeholder="Enter OTP"
            placeholderTextColor="#999"
            value={otp}
            onChangeText={validateOtp}
            keyboardType="numeric"
          />
          {isValidOtp !== null && (
            <Ionicons
              name={isValidOtp ? "checkmark-circle" : "close-circle"}
              size={20}
              color={isValidOtp ? "green" : "red"}
              style={dynamic.icon}
            />
          )}
        </View>
      )}

      <View style={dynamic.radioContainer}>
        <TouchableOpacity
          onPress={() => setRole("admin")}
          style={[
            dynamic.roleButton,
            role === "admin" && dynamic.roleButtonActive,
          ]}
        >
          <Text
            style={[
              dynamic.roleText,
              role === "admin" && dynamic.roleTextActive,
            ]}
          >
            Admin
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setRole("lead")}
          style={[
            dynamic.roleButton,
            role === "lead" && dynamic.roleButtonActive,
          ]}
        >
          <Text
            style={[
              dynamic.roleText,
              role === "lead" && dynamic.roleTextActive,
            ]}
          >
            Support
          </Text>
        </TouchableOpacity>
      </View>

      {isOtpSent && (
        <TouchableOpacity onPress={sendOtp} disabled={resendCooldown > 0}>
          <Text style={dynamic.forgotPassword}>
            {resendCooldown > 0
              ? `Resend OTP in ${resendCooldown}s`
              : "Didn't get OTP? Resend."}
          </Text>
        </TouchableOpacity>
      )}

      {!isOtpSent ? (
        <TouchableOpacity style={dynamic.button} onPress={sendOtp}>
          <Text style={dynamic.buttonText}>
            {loading ? "Sending..." : "Send OTP"}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={dynamic.button} onPress={verifyOtp}>
          <Text style={dynamic.buttonText}>
            {loading ? "Sending..." : " Verify"}
            {/* Verify */}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity>
        <Text style={dynamic.signUpText}>
          Don't have an account? <Text style={dynamic.signUpLink}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const getDynamic = (width, height) => ({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    justifyContent: "center",
    width,
    height,
    paddingHorizontal: width * 0.09,
  },

  title: {
    fontSize: width * 0.07,
    fontWeight: "bold",
    color: "#333",
    marginBottom: height * 0.025,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: width * 0.025,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: width * 0.0375,
    marginBottom: height * 0.01875,
    width: "100%",
    height: height * 0.06875,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: width * 0.01,
    shadowOffset: { width: 0, height: height * 0.0025 },
    elevation: 2,
  },

  input: {
    flex: 1,
    fontSize: width * 0.04,
    color: "#333",
  },

  icon: {
    marginLeft: width * 0.025,
  },

  errorBorder: {
    borderColor: "red",
  },

  radioContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: height * 0.01875,
  },

  roleButton: {
    flex: 1,
    paddingVertical: height * 0.0125,
    borderRadius: width * 0.075,
    alignItems: "center",
    marginHorizontal: width * 0.0125,
    backgroundColor: "#f0f0f0",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: width * 0.0125,
    shadowOffset: { width: 0, height: height * 0.00375 },
  },

  roleButtonActive: {
    backgroundColor: "rgb(61, 114, 66)",
    elevation: 5,
    shadowOpacity: 0.2,
    shadowRadius: width * 0.015,
  },

  roleText: {
    fontSize: width * 0.04,
    color: "#333",
    fontWeight: "bold",
  },

  roleTextActive: {
    color: "#fff",
  },

  forgotPassword: {
    fontSize: width * 0.04,
    color: "rgb(234, 90, 7)",
    marginBottom: height * 0.025,
    textAlign: "right",
    width: width * 0.8,
    fontWeight: "600",
  },

  button: {
    backgroundColor: "rgb(61, 114, 66)",
    width: width * 0.8,
    height: height * 0.0625,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: width * 0.025,
    marginBottom: height * 0.025,
    paddingHorizontal: width * 0.3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: width * 0.0125,
    shadowOffset: { width: 0, height: height * 0.00375 },
    elevation: 5,
  },

  buttonText: {
    fontSize: width * 0.04,
    color: "#fff",
    fontWeight: "bold",
  },

  signUpText: {
    fontSize: width * 0.044,
    color: "#555",
  },

  signUpLink: {
    color: "rgb(61, 114, 66)",
    fontWeight: "bold",
  },

  logo: {
    width: width * 0.4,
    height: width * 0.4,
    resizeMode: "contain",
  },
});

export default Login;
