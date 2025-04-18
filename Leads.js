import React, { useEffect, useState } from "react";
import { useIP } from "../components/IPContext";
import CryptoJS from "react-native-crypto-js";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";

import {
  useWindowDimensions,
  View,
  Text,
  FlatList,
  dynamicheet,
  Image,
  TouchableOpacity,
  ToastAndroid,
  ImageBackground,
} from "react-native";

//const ip = process.env.EXPO_PUBLIC_IP;

const secretKey = "secretkey_16byte";
const decryptData = (encryptedText) => {
  //console.log("dddd", encryptedText);
  try {
    if (!encryptedText) {
      console.log("no data");
      return "No Data Provided";
    }
    const key = CryptoJS.enc.Utf8.parse(secretKey);
    const iv = CryptoJS.enc.Utf8.parse("fixed16byteIV_");

    const bytes = CryptoJS.AES.decrypt(encryptedText, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedText) {
      console.error("Decrypt failed:  wrong on key/IV.");
      return "Invalid Data";
    }
    return decryptedText;
  } catch (error) {
    console.error("Error decrypting data:", error);
    return "Decryption Failed";
  }
};

const Leads = () => {
  const ip = useIP();
  const { width, height } = useWindowDimensions();
  const dynamic = getDynamic(width, height);
  const navigation = useNavigation();
  const [leads, setLeads] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");

        const response = await fetch(`http://${ip}:5000/leaddata`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ roal: "lead" }),
        });

        const data = await response.json();
        console.log("Fetched data:", data);

        if (!response.ok) {
          setErrorMessage(data.message || "Something went wrong");
          setLeads([]);
        } else {
          setLeads(data.leadData);
          const decrylead = data.leadData.map((lead) => ({
            ...lead,
            email: decryptData(lead.email),
            password: decryptData(lead.password),
          }));
          setLeads(decrylead);
          // console.log("email.lead", data.leadData);
        }
      } catch (error) {
        setErrorMessage("Failed to fetch data");
        console.error("Error fetching leads:", error);
      }
    };

    fetchLeads();
  }, []);
  return (
    <View style={dynamic.container}>
      <Text style={dynamic.title}>Lead List</Text>

      {errorMessage ? (
        <Text style={dynamic.errorText}>{errorMessage}</Text>
      ) : leads.length > 0 ? (
        <FlatList
          data={leads}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View>
              <TouchableOpacity
                style={dynamic.card}
                onPress={() =>
                  navigation.navigate("Leadscreen", { lead: item })
                }
              >
                <Image source={{ uri: item.image }} style={dynamic.image} />

                <View style={dynamic.infoContainer}>
                  <Text style={dynamic.name}>
                    {item.firstname} {item.lastname}
                  </Text>
                  <Text style={dynamic.info}>{item.Id}</Text>
                  <Text style={dynamic.info}>{item.email}</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      ) : (
        <Text style={dynamic.noDataText}>No leads found</Text>
      )}
    </View>
  );
};
const getDynamic = (width, height) => ({
  container: {
    flex: 1,
    padding: width * 0.05,
    backgroundColor: "rgb(217, 219, 201)",
  },
  title: {
    fontSize: width * 0.07,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: width * 0.05,

    marginBottom: width * 0.03,
    color: "#34495E",
    fontFamily: "serif",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgb(221, 221, 209)",
    padding: width * 0.03,
    marginVertical: width * 0.02,
    borderRadius: 15,
    shadowColor: "rgba(0, 0, 0, 0.5)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: width * 0.25,
    height: width * 0.22,
    borderRadius: 5,
    marginRight: width * 0.04,
    borderWidth: width * 0.005,
    borderColor: "#ddd",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: width * 0.04,
    fontWeight: "bold",
    color: "#34495E",
    marginBottom: width * 0.02,
    fontFamily: "serif",
  },
  info: {
    fontSize: width * 0.037,
    color: "#333",
    marginBottom: width * 0.001,
    fontFamily: "serif",
  },
  errorText: {
    color: "#E74C3C",
    fontSize: width * 0.037,
    textAlign: "center",
    marginTop: width * 0.02,
  },
  noDataText: {
    fontSize: width * 0.037,
    color: "#ccc",
    textAlign: "center",
    marginTop: width * 0.05,
  },
});
export default Leads;
