import React, { useState } from "react";
import * as SecureStore from "expo-secure-store";
import { useIP } from "../components/IPContext";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  dynamicheet,
  ToastAndroid,
  useWindowDimensions,
  Button,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as Notifications from "expo-notifications";
//const ip = process.env.EXPO_PUBLIC_IP;


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const Add = () => {
  const ip = useIP();
  const { width, height } = useWindowDimensions();
  const dynamic = getDynamic(width, height);
  const [leadId, setleadId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [learningMode, setLearningMode] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  
  const handleSubmit = async () => {
    const studentData = {
      leadId,
      studentId,
      firstName,
      lastName,
      dob,
      address,
      selectedCourse,
      paymentStatus,
      learningMode,
      sourceType,
      referralSource,
      currentStatus,
    };

    try {
            const token = await SecureStore.getItemAsync("token");
      
      const response = await fetch(`http://${ip}:5000/addbyadmin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(studentData),
      });

      const data = await response.json();

      if (response.ok) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Student Added ✅",
            body: `${firstName}${lastName} has been enrolled successfully.`,
            sound: "default",
            color: "#25D366",
          },
          trigger: null, 
        });

        console.log("Server Response:", data);
        setleadId("");
        setStudentId("");
        setFirstName("");
        setLastName("");
        setDob("");
        setAddress("");
        setSelectedCourse("");
        setPaymentStatus("");
        setLearningMode("");
        setSourceType("");
        setReferralSource("");
        setCurrentStatus("");
        
               ToastAndroid.show(
                 "Form Submitted Successfully!",
                 ToastAndroid.SHORT
               );

      } else {
        ToastAndroid.show(
          `Error: ${data.error || "Something went wrong"}`,
          ToastAndroid.LONG
        );
      }
    } catch (error) {
      console.error("Failed to submit:", error);
      ToastAndroid.show(
        "Failed to submit. Please try again.",
        ToastAndroid.SHORT
      );
    }
  };
  const handleConfirm = (event, date) => {
    setShowPicker(false);
    if (date) {
      setSelectedDate(date);
      setDob(date.toISOString().split("T")[0]);
    }
  };
  return (
    <View style={dynamic.container}>
      <Text style={dynamic.heading}>Add Student</Text>
      <TextInput
        style={dynamic.input}
        placeholder="Student ID"
        value={studentId}
        onChangeText={setStudentId}
      />
      <TextInput
        style={dynamic.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={dynamic.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />

      <TextInput
        style={dynamic.input}
        placeholder="Date of Birth (YYYY-MM-DD)"
        value={dob}
        onChangeText={setDob}
      />
      <TextInput
        style={dynamic.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />
      <View style={dynamic.pickerContainer}>
        <Text style={dynamic.label}>Select Course</Text>
        <Picker
          selectedValue={selectedCourse}
          onValueChange={(itemValue) => setSelectedCourse(itemValue)}
          style={dynamic.picker}
        >
          <Picker.Item label="Select" />
          <Picker.Item label="Mern stack" value="Mern stack" />
          <Picker.Item label="JAVA" value="JAVA" />
          <Picker.Item label="Python" value="Python" />
          <Picker.Item label="Data Structure" value="Data Structure" />
        </Picker>
      </View>
      <View style={dynamic.pickerContainer}>
        <Text style={dynamic.label}>Learning Mode:</Text>
        <Picker
          selectedValue={learningMode}
          onValueChange={(itemValue) => setLearningMode(itemValue)}
          style={dynamic.picker}
        >
          <Picker.Item label="Select" />
          <Picker.Item label="Virtual-Mode" value="Virtual-Mode" />
          <Picker.Item label="Offline-Mode" value="Offline-Mode" />
        </Picker>
      </View>
      <View style={dynamic.pickerContainer}>
        <Text style={dynamic.label}>Payment Status:</Text>
        <Picker
          selectedValue={paymentStatus}
          onValueChange={(itemValue) => setPaymentStatus(itemValue)}
          style={dynamic.picker}
        >
          <Picker.Item label="Select" />
          <Picker.Item label="Paid" value="Online" />
          <Picker.Item label="UnPaid" value="Offline" />
        </Picker>
      </View>
      <View style={dynamic.pickerContainer}>
        <Text style={dynamic.label}>Select Lead-ID</Text>
        <Picker
          selectedValue={leadId}
          onValueChange={(itemValue) => setleadId(itemValue)}
          style={dynamic.picker}
        >
          <Picker.Item label="Select" />
          <Picker.Item label="L001" value="L001" />
          <Picker.Item label="L002" value="L002" />
          <Picker.Item label="L003" value="L003" />
          <Picker.Item label="L004" value="L004" />
          <Picker.Item label="L005" value="L005" />
          <Picker.Item label="L006" value="L006" />
          <Picker.Item label="L007" value="L007" />
          <Picker.Item label="L008" value="L008" />
        </Picker>
      </View>
      <TouchableOpacity style={dynamic.button} onPress={handleSubmit}>
        <Text style={dynamic.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const getDynamic = (width, height) => ({
  container: {
    flex: 1,
    padding: width * 0.05,
    backgroundColor: "rgb(217, 219, 201)",
  },
  heading: {
    fontSize: width * 0.06,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: width * 0.04,
    color: "#34495E",
    fontFamily: "serif",
    marginTop: width * 0.06,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "rgb(226, 227, 213)",
    borderRadius: 10,
    padding: width * 0.03,
    fontSize: width * 0.04,
    marginBottom: width * 0.03,
  },
  pickerContainer: {
    marginBottom: width * 0.03,
  },
  label: {
    fontSize: width * 0.04,
    fontWeight: "bold",
    color: "#34495E",
    fontFamily: "serif",
  },
  picker: {
    backgroundColor: "rgb(226, 227, 213)",
    borderWidth: width * 0.005,
    borderColor: "#ccc",
  },
  button: {
    backgroundColor: "#34495E",
    padding: width * 0.04,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    fontSize: width * 0.04,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default Add;
