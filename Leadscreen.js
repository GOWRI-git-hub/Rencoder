import React, { useState } from "react";
import { useIP } from "../components/IPContext";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";

import {
  View,
  Text,
  Image,
  TextInput,
  dynamicheet,
  ScrollView,
  Button,
  TouchableOpacity,
  ToastAndroid,
  useWindowDimensions,
} from "react-native";
const Leadscreen = ({ route }) => {
  const ip = useIP();
  const { width, height } = useWindowDimensions();
  const dynamic = getDynamic(width, height);
 // const ip = process.env.EXPO_PUBLIC_IP;
  const { lead } = route.params;
  const [isEditing, setIsEditing] = useState(false);
  const [Id, setId] = useState(lead.Id);
  const [firstName, setFirstName] = useState(lead.firstname);
  const [lastName, setLastName] = useState(lead.lastname);
  const [dob, setDob] = useState(lead.dob);
  const [phoneNo, setPhoneNo] = useState(lead.phoneNo);
  const [email, setEmail] = useState(lead.email);
  const [password, setPassword] = useState(lead.password);
  const [address, setAddress] = useState(lead.address);
  const [profileImage, setProfileImage] = useState(lead.image);
  const [status, setstatus] = useState(lead.status);
  const navigate = useNavigation();

  const handleSubmit = async () => {
    const updatedLead = {
      Id: Id,
      firstname: firstName,
      lastname: lastName,
      dob: dob,
      phoneNo: phoneNo,
      email: email,
      address: address,
      password: password,
      image: profileImage,
      status: status,
    };
    console.log("updated", updatedLead);
    try {
      const token = await SecureStore.getItemAsync("token");

      const response = await fetch(`http://${ip}:5000/updatelead`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedLead),
      });
      const data = await response.json();
      if (!response.ok) {
        ToastAndroid.show(
          `Error: ${data?.error || data?.message || "Something went wrong"}`,
          ToastAndroid.LONG
        );
        //console.error("Backend error:", data);
        return;
      }

      ToastAndroid.show(
        data.message || "Lead updated successfully!",
        ToastAndroid.SHORT
      );
      console.log("Lead updated:", data.updatedLead);
    } catch (error) {
      console.error("Frontend error:", error);
      ToastAndroid.show("Failed to update lead.", ToastAndroid.SHORT);
    }
  };
  return (
    <View style={dynamic.container}>
      {!isEditing && (
        <View style={dynamic.imageContainer}>
          <TouchableOpacity
            style={dynamic.backButton}
            onPress={() => navigate.goBack()}
          >
            <FontAwesome name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Image source={{ uri: lead.image }} style={dynamic.image} />
        </View>
      )}
      <ScrollView
        contentContainerStyle={dynamic.content}
        showsVerticalScrollIndicator={false}
      >
        {isEditing ? (
          <>
            <TouchableOpacity
              style={dynamic.closeButton}
              onPress={() => navigate.goBack()}
            >
              <FontAwesome name="close" size={24} color="#222" />
            </TouchableOpacity>
            <View style={dynamic.inputContainer}>
              <View style={dynamic.row}>
                <Text style={dynamic.label}>First Name</Text>
                <View style={dynamic.inputRow}>
                  <TextInput
                    style={dynamic.input}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Enter First Name"
                  />
                </View>
              </View>

              <View style={dynamic.row}>
                <Text style={dynamic.label}>Last Name:</Text>
                <View style={dynamic.inputRow}>
                  <TextInput
                    style={dynamic.input}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Enter Last Name"
                  />
                </View>
              </View>

              <View style={dynamic.row}>
                <Text style={dynamic.label}>DOB:</Text>
                <View style={dynamic.inputRow}>
                  <TextInput
                    style={dynamic.input}
                    value={dob}
                    onChangeText={setDob}
                    placeholder="Enter DOB"
                  />
                </View>
              </View>

              <View style={dynamic.row}>
                <Text style={dynamic.label}>Email:</Text>
                <View style={dynamic.inputRow}>
                  <TextInput
                    style={dynamic.input}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    placeholder="Enter Email"
                  />
                </View>
              </View>

              <View style={dynamic.row}>
                <Text style={dynamic.label}>Password:</Text>
                <View style={dynamic.inputRow}>
                  <TextInput
                    style={dynamic.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter Password"
                  />
                </View>
              </View>

              <View style={dynamic.row}>
                <Text style={dynamic.label}>Phone Number</Text>
                <View style={dynamic.inputRow}>
                  <TextInput
                    style={dynamic.input}
                    value={phoneNo}
                    onChangeText={setPhoneNo}
                    keyboardType="phone-pad"
                    placeholder="Enter phone number"
                  />
                </View>
              </View>
              <View style={dynamic.row}>
                <Text style={dynamic.label}>Address:</Text>
                <View style={dynamic.inputRow}>
                  <TextInput
                    style={dynamic.input}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Enter Address"
                  />
                </View>
              </View>

              <View style={dynamic.row}>
                <Text style={dynamic.label}>Image URL:</Text>
                <View style={dynamic.inputRow}>
                  <TextInput
                    style={dynamic.input}
                    value={profileImage}
                    onChangeText={setProfileImage}
                    placeholder="Enter Image URL"
                  />
                </View>
              </View>

              <View style={dynamic.row}>
                <Text style={dynamic.label}>Status:</Text>
                <View style={dynamic.inputRow}>
                  <TextInput
                    style={dynamic.input}
                    value={status}
                    onChangeText={setstatus}
                    placeholder="Enter Status"
                  />
                </View>
              </View>
              <TouchableOpacity style={dynamic.button} onPress={handleSubmit}>
                <Text style={dynamic.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
          </>
        ) : (
          <View style={dynamic.card}>
            <View style={dynamic.cardRow}>
              <FontAwesome name="user" size={24} color="#34495E" />
              <Text style={dynamic.cardText}>
                {firstName} {lastName}
              </Text>
            </View>

            <View style={dynamic.cardRow}>
              <FontAwesome name="calendar" size={24} color="#34495E" />
              <Text style={dynamic.cardText}>{dob}</Text>
            </View>

            <View style={dynamic.cardRow}>
              <MaterialIcons name="email" size={24} color="#34495E" />
              <Text style={dynamic.cardText}>{email}</Text>
            </View>

            <View style={dynamic.cardRow}>
              <MaterialIcons name="location-on" size={24} color="#34495E" />
              <Text style={dynamic.cardText}>{address}</Text>
            </View>

            <View style={dynamic.cardRow}>
              <MaterialIcons name="info" size={24} color="#34495E" />
              <Text style={dynamic.cardText}>{status}</Text>
            </View>
            <TouchableOpacity
              style={dynamic.button}
              onPress={() => setIsEditing(!isEditing)}
            >
              <Text style={dynamic.buttonText}>
                {isEditing ? "Cancel" : "Edit"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const getDynamic = (width, height) => ({
  backButton: {
    position: "absolute",
    top: width * 0.08,
    left: width * 0.05,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: width * 0.03,
    borderRadius: width * 0.125,
    zIndex: 10,
  },
  closeButton: {
    position: "absolute",
    top: width * 0.2,
    right: width * 0.075,
    padding: width * 0.03,
    borderRadius: width * 0.125,
    zIndex: 10,
  },
  container: {
    flex: 1,
    backgroundColor: "#D7D3BF",
  },
  imageContainer: {
    height: width * 0.975,
    width: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderBottomLeftRadius: width * 0.075,
    borderBottomRightRadius: width * 0.075,
  },
  content: {
    paddingTop: width * 0.05,
    paddingHorizontal: width * 0.05,
    paddingBottom: width * 0.025,
  },
  inputContainer: {
    backgroundColor: "rgb(221, 221, 209)",
    padding: width * 0.04,
    borderRadius: width * 0.025,
    marginTop: width * 0.125,
    marginBottom: width * 0.025,
  },
  row: {
    marginBottom: width * 0.075,
  },
  label: {
    fontSize: width * 0.043,
    color: "#34495E",
    fontWeight: "600",
    marginBottom: width * 0.015,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingVertical: width * 0.0075,
  },
  input: {
    flex: 1,
    fontSize: width * 0.04,
    paddingVertical: width * 0.0125,
    height: width * 0.1,
    paddingHorizontal: width * 0.025,
  },
  button: {
    backgroundColor: "#34495E",
    paddingVertical: width * 0.025,
    borderRadius: width * 0.03,
    alignItems: "center",
    marginVertical: width * 0.025,
    elevation: 4,
    width: "100%",
  },
  buttonText: {
    fontSize: width * 0.04,
    color: "#FFF",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#D7D3BF",
    padding: width * 0.025,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: width * 0.0875,
  },
  cardText: {
    fontSize: width * 0.043,
    color: "#34495E",
    marginLeft: width * 0.05,
    fontFamily: "serif",
    fontWeight: "bold",
  },
});

export default Leadscreen;
