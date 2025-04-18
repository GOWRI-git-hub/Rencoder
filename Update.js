import React, { useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { useIP } from "../components/IPContext";
import {
  View,
  Text,
  Button,
  dynamicheet,
  ToastAndroid,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { MaterialIcons } from "@expo/vector-icons";

const statusSteps = [
  { label: "Call Scheduled", value: "Call Scheduled" },
  { label: "Meeting Scheduled", value: "Meeting Scheduled" },
  { label: "Course Selected", value: "Course Selected" },
  { label: "Payment Completed", value: "Payment Completed" },
  { label: "Onboarded", value: "Onboarded" },
];

const UpdateScreen = ({ route }) => {
  const ip = useIP();
  const { width, height } = useWindowDimensions();
  const dynamic = getDynamic(width, height);

  const { lead } = route.params;
  const [currentStatus, setCurrentStatus] = useState(lead.currentStatus);
  const [sourceType, setSourceType] = useState(lead.sourceType);
  const [referralSource, setReferralSource] = useState(lead.referralSource);
  const [studentId, setStudentId] = useState(lead.studentId);
   // const ip = process.env.EXPO_PUBLIC_IP;

  useEffect(() => {
    setStudentId(lead.studentId);
    setCurrentStatus(lead.currentStatus);
    setSourceType(lead.sourceType);
    setReferralSource(lead.referralSource);
  }, [lead]);

  const handleUpdate = async () => {
    const updatedLead = {
      studentId,
      sourceType,
      referralSource,
      currentStatus,
    };
    console.log("Updated student:", updatedLead);

    try {
      const token = await SecureStore.getItemAsync("token");

      const response = await fetch(`http://${ip}:5000/updatestudent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedLead),
      });
      const data = await response.json();
      if (!response.ok) {
        const errorMessage = data?.message || data?.error || "Update failed!";
        ToastAndroid.show(errorMessage, ToastAndroid.LONG);
        return;
      }

      ToastAndroid.show("Student updated successfully!", ToastAndroid.SHORT);
      //  setSourceType("");
      //  setReferralSource("");
      //  setCurrentStatus("");
    } catch (error) {
      console.error("Update error:", error);
      ToastAndroid.show("Failed to update student.", ToastAndroid.SHORT);
    }
  };

  return (
    <View style={dynamic.container}>
      <Text style={dynamic.title}>Update Student Info</Text>

      {/* Source Type Picker */}
      <View style={dynamic.pickerContainer}>
        <Text style={dynamic.label}>Select Source Type</Text>
        <Picker
          selectedValue={sourceType}
          onValueChange={(itemValue) => setSourceType(itemValue)}
          style={dynamic.picker}
        >
          <Picker.Item label="Select" />
          <Picker.Item label="Virtual-Mode" value="Virtual-Mode" />
          <Picker.Item label="Offline-Mode" value="Offline-Mode" />
        </Picker>
      </View>

      {/* Referral Source Picker */}
      <View style={dynamic.pickerContainer}>
        <Text style={dynamic.label}>Select Referral Source</Text>
        <Picker
          selectedValue={referralSource}
          onValueChange={(itemValue) => setReferralSource(itemValue)}
          style={dynamic.picker}
        >
          <Picker.Item label="Select" value="" />
          <Picker.Item label="Friends" value="Friends" />
          <Picker.Item label="LinkedIn" value="LinkedIn" />
          <Picker.Item label="Company-site" value="Company-site" />
          <Picker.Item label="Employees" value="Employees" />
          <Picker.Item label="By College" value="By College" />
        </Picker>
      </View>

      {/* Current Status Picker */}
      <View style={dynamic.pickerContainer}>
        <Text style={dynamic.label}>Select Current Status</Text>
        <Picker
          selectedValue={currentStatus}
          onValueChange={(itemValue) => setCurrentStatus(itemValue)}
          style={dynamic.picker}
        >
          {statusSteps.map((step) => (
            <Picker.Item
              key={step.value}
              label={step.label}
              value={step.value}
            />
          ))}
        </Picker>
      </View>

      {/* Progress Tracker */}
      <View style={dynamic.progressContainer}>
        <FlatList
          data={statusSteps}
          keyExtractor={(item) => item.value}
          renderItem={({ item, index }) => {
            const isActive =
              statusSteps.findIndex((s) => s.value === currentStatus) >= index;
            return (
              <View style={dynamic.stepContainer}>
                {/* Progress Line */}
                {index > 0 && (
                  <View
                    style={[dynamic.line, isActive && dynamic.lineActive]}
                  />
                )}

                {/* Circle Indicator */}
                <View
                  style={[dynamic.circle, isActive && dynamic.circleActive]}
                >
                  {isActive && (
                    <MaterialIcons name="check" size={18} color="white" />
                  )}
                </View>

                {/* Step Label */}
                <Text
                  style={[dynamic.stepText, isActive && dynamic.stepTextActive]}
                >
                  {item.label}
                </Text>
              </View>
            );
          }}
          // nestedScrollEnabled={true}
          // showsVerticalScrollIndicator={false}
          // contentContainerStyle={{ paddingBottom: 30 }}
        />
      </View>

      {/* Update Button */}
      <TouchableOpacity
        style={[
          dynamic.updateButton,
          currentStatus === "Onboarded" && dynamic.joinedButton,
        ]}
        onPress={handleUpdate}
      >
        <Text style={dynamic.buttonText}>
          {currentStatus === "Onboarded" ? "Joined" : "Update"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// dynamic

const getDynamic = (width, height) => ({
  container: {
    flex: 1,
    padding: width * 0.05,
    backgroundColor: "#F4F4F4",
  },
  title: {
    fontSize: width * 0.055,
    fontWeight: "bold",
    marginTop: height * 0.025,
    marginBottom: height * 0.025,
    textAlign: "center",
    fontFamily: "serif",
    color: "#34495E",
  },
  pickerContainer: {
    marginBottom: height * 0.025,
  },
  label: {
    fontSize: width * 0.043,
    fontWeight: "bold",
    color: "#34495E",
    fontFamily: "serif",
  },
  picker: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  progressContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: height * 0.025,
    marginLeft: width * 0.05,
    marginTop: height * 0.025,
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: height * 0.0375,
  },
  line: {
    position: "absolute",
    width: 2,
    height: height * 0.0625,
    backgroundColor: "#ddd",
    left: width * 0.0375,
    top: height * -0.0375,
  },
  lineActive: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  circle: {
    width: width * 0.075,
    height: width * 0.075,
    borderRadius: width * 0.05,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginRight: width * 0.0625,
  },
  circleActive: {
    backgroundColor: "rgb(41, 69, 44)",
  },
  stepText: {
    fontSize: width * 0.0375,
    color: "#888",
    fontFamily: "serif",
  },
  stepTextActive: {
    fontWeight: "bold",
    fontSize: width * 0.04,
    color: "rgb(82, 81, 81)",
  },
  updateButton: {
    backgroundColor: "#34495E",
    padding: width * 0.0325,
    borderRadius: width * 0.025,
    alignItems: "center",
    marginTop: height * 0.00625,
  },
  joinedButton: {
    backgroundColor: "rgb(30, 75, 57)",
  },
  buttonText: {
    color: "white",
    fontSize: width * 0.05,
    fontWeight: "bold",
  },
});

export default UpdateScreen;
