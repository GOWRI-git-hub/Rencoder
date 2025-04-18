import React, { useEffect, useState } from "react";
import { useIP } from "../components/IPContext";
import { View, Text, ScrollView, TouchableOpacity,useWindowDimensions,ToastAndroid } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Checkbox } from "react-native-paper";
import * as SecureStore from "expo-secure-store";


const Releado = () => {
  const ip = useIP();
  const [students, setStudents] = useState([]);
  const [leads, setLeads] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const { width, height } = useWindowDimensions();
  const dynamic = getDynamic(width, height);

 // const ip = process.env.EXPO_PUBLIC_IP;

  // Fetch students
  const fetchStudents = async () => {
    const token = await SecureStore.getItemAsync("token");

    console.log("Fetching students...");
    try {
      const response = await fetch(`http://${ip}:5000/studentdata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setStudents(data);
      console.log("Students data:", data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  // Fetch leads
    const fetchLeads = async () => {
      try {
    const token = await SecureStore.getItemAsync("token");

    console.log("Fetching leads...");
      const response = await fetch(`http://${ip}:5000/leaddata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roal: "lead" }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setLeads(data.leadData);
      console.log("Leads data:", data.leadData);
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  };

  // On mount
  useEffect(() => {
    fetchStudents();
    fetchLeads();
  }, []);

  const toggleStudent = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

    const handleSubmit = async () => {
      try {
        if (!selectedLeadId || selectedStudents.length === 0) {
          ToastAndroid.show(
            "Please select at least one student and a lead.",
            ToastAndroid.SHORT
          );
          // Alert.alert("Please select at least one student and a lead.");
          return;
        }
        const token = await SecureStore.getItemAsync("token");

        const response = await fetch(`http://${ip}:5000/reassign-students`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            leadId: selectedLeadId,
            studentIds: selectedStudents,
          }),
        });

        const result = await response.json();

          if (response.ok) {
            ToastAndroid.show(
              "Students reassigned successfully!",
              ToastAndroid.SHORT
            );
          setSelectedStudents([]);
          setSelectedLeadId("");
          } else {
              ToastAndroid.show(result.message || "Failed to reassign.", ToastAndroid.LONG);
        }
      } catch (error) {
          ToastAndroid.show(
            `Error: ${error.message || "Something went wrong"}`,
            ToastAndroid.LONG
          );
        //Alert.alert("Error", error.message);
      }
  };
  console.log("Assigning students:", selectedStudents);
  console.log("To lead:", selectedLeadId);

    return (
      <View style={dynamic.container}>
        <Text style={dynamic.titles}>Select Students to Reassign:</Text>
        <ScrollView style={dynamic.scrollView}>
          {students.map((student) => (
            <View key={student.studentId} style={dynamic.studentCard}>
              <Checkbox
                status={
                  selectedStudents.includes(student.studentId)
                    ? "checked"
                    : "unchecked"
                }
                onPress={() => toggleStudent(student.studentId)}
              />
              <Text style={dynamic.studentText}>
                {student.studentId} ({student.firstName || "Student"}
                {student.lastName || "Student"})
              </Text>
            </View>
          ))}

          <Text style={dynamic.title}>Select Lead to Assign:</Text>

          <View style={dynamic.pickerContainer}>
            <Picker
              selectedValue={selectedLeadId}
              onValueChange={(value) => setSelectedLeadId(value)}
            >
              <Picker.Item label="Select Lead" value="" />
              {leads.map((lead) => (
                <Picker.Item
                  key={lead.Id}
                  label={`${lead.Id}  -  ${lead.firstname || "Lead"}`}
                  value={lead.Id}
                />
              ))}
            </Picker>
          </View>

          <TouchableOpacity style={dynamic.button} onPress={handleSubmit}>
            <Text style={dynamic.buttonText}>Reassign Leads</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
};


const getDynamic = (width, height) => ({
  container: {
    flex: 1,
    //padding: width * 0.05,
    backgroundColor: "rgb(217, 219, 201)",
  },
  scrollView: {
    padding: width * 0.04,
  },
  titles: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    marginVertical: height * 0.015,
    marginTop: height * 0.05,
    margin: height * 0.02,
    fontFamily: "serif",
    color: "#34495E",
  },
  title: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    marginVertical: height * 0.015,
    fontFamily: "serif",
    color: "#34495E",

    // marginRight: height * 0.05,
  },
  studentCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: height * 0.01,
    padding: width * 0.03,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: width * 0.03,
    backgroundColor: "rgb(221, 221, 209)",
  },
  studentText: {
    marginLeft: width * 0.015,
    fontSize: width * 0.038,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: width * 0.03,
    marginBottom: height * 0.02,
  },
  button: {
    backgroundColor: "#34495E",
    paddingVertical: height * 0.015,
    borderRadius: width * 0.03,
    alignItems: "center",
    elevation: 2,
    marginBottom: height * 0.05,
    marginTop: height * 0.02,
  },
  buttonText: {
    fontSize: width * 0.042,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default Releado;
