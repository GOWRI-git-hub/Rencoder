import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { useIP } from "../components/IPContext";
import {
  dynamicheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  ImageBackground,
  TouchableOpacity,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
//import { Ionicons } from "@expo/vector-icons"; // or use MaterialIcons if preferred

const Home = () => {
   const ip = useIP();
  const { width, height } = useWindowDimensions();
  const dynamic = getDynamic(width, height);
  const navigation = useNavigation();
  const [role, setRole] = useState(null);
  const [roal, setroal] = useState("lead");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(null);
  const [leadstut, setleadstut] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const displayedStudents = showAll ? students : students.slice(0, 3);
  //const ip = process.env.EXPO_PUBLIC_IP;

  useEffect(() => {
    const getUserData = async () => {
      try {
        const email = await SecureStore.getItemAsync("email");
        const token = await SecureStore.getItemAsync("token");
        const userRole = await SecureStore.getItemAsync("roal");
        // const leadid = await SecureStore.getItemAsync("Id");
        // setleadId(leadid);
        // console.log("leadid", leadId);
        if (!token || !email) {
          console.log("Unauthorized user. Redirecting...");
          navigation.replace("Login");
          return;
        }
        setRole(userRole);
        if (userRole === "admin") {
          fetchStudents(token);
          countlead();
        } else {
          leadstudent();
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };

    getUserData();
  }, [navigation]);

  const fetchStudents = async (token) => {
    console.log("gotedd");
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
      console.log("studentsss data", students);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const countlead = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");

      const response = await fetch(`http://${ip}:5000/countlead`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roal }),
      });
      const data = await response.json();
      if (data.success) {
        console.log("count..", count);
        setCount(data.count);
      }
    } catch (error) {
      console.error("Error fetching lead count:", error);
      setCount(null);
    }
  };

  //get leads student details
  const leadstudent = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");

      const leadId = await SecureStore.getItemAsync("Id");
      if (!leadId) {
        console.error("Lead ID is missing.");
        return;
      }
      const response = await fetch(`http://${ip}:5000/leadstudent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ leadId }),
      });
      const data = await response.json();
      if (data.success) {
        setleadstut(data.user);
      }
    } catch (error) {
      console.error("Error fetching lead count:", error);
      setCount(null);
    }
  };

  return (
    <View style={dynamic.container}>
      {role === "admin" ? (
        <ImageBackground
          source={{
            uri: "https://i.pinimg.com/474x/c2/31/33/c2313363141f8730c006f20f01b7903c.jpg",
          }}
          style={dynamic.backgroundImage}
          resizeMode="stretch"
        >
          <Text style={dynamic.header}>Welcome Admin</Text>
          <View style={dynamic.dashboardContainer}>
            <View style={dynamic.card}>
              <Text style={dynamic.cardTitle}>🎓 Total Enrolled</Text>
              <Text style={dynamic.cardNumber}>{students.length}</Text>
            </View>
            <View style={dynamic.card}>
              <Text
                style={dynamic.cardTitle}
                onPress={() => navigation.navigate("Leads")}
              >
                📊 Leads Acquired
              </Text>
              <Text style={dynamic.cardNumber}>
                {count !== null ? count : "Loading..."}
              </Text>
            </View>
          </View>
          <View style={dynamic.transactionsContainer}>
            <Text style={dynamic.transactionTitle}>
              📋 Recent Added (Students)
            </Text>
            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <ScrollView
                contentContainerStyle={{ paddingBottom: 10 }}
                showsVerticalScrollIndicator={false}
              >
                <FlatList
                  data={displayedStudents}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={dynamic.transactionCard}
                      onPress={() =>
                        navigation.navigate("Student", { lead: item })
                      }
                    >
                      <Text style={dynamic.studentText}>📌 {item.leadId}</Text>
                      <Text>
                        Name: {item.firstName} {item.lastName}
                      </Text>
                    </TouchableOpacity>
                  )}
                  scrollEnabled={false}
                />

                {students.length > 3 && (
                  <TouchableOpacity onPress={() => setShowAll(!showAll)}>
                    <Text
                      style={{
                        color: "rgb(36, 86, 91)",
                        textAlign: "center",
                        marginTop: 10,
                        fontSize: 15,
                        fontWeight: "bold",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {showAll ? "See Less" : "See More"}
                      {/* <MaterialIcons
                        name={
                          showAll ? "keyboard-arrow-up" : "keyboard-arrow-down"
                        }
                        size={20}
                        color="rgb(36, 86, 91)"
                        style={{ marginLeft: 4 }} 
                      /> */}
                    </Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}
          </View>
        </ImageBackground>
      ) : (
        <ImageBackground
          source={{
            uri: "https://i.pinimg.com/474x/c2/31/33/c2313363141f8730c006f20f01b7903c.jpg",
          }}
          style={dynamic.backgroundImages}
          resizeMode="stretch"
        >
          <Text style={dynamic.headers}>
            Welcome {role === "lead" ? "Lead" : "User"}
          </Text>
          {role === "lead" && (
            <View style={dynamic.listContainer}>
              <View>
                <Text style={dynamic.countText}>
                  Total Students: {leadstut?.length || 0}
                </Text>
              </View>
              <FlatList
                data={leadstut}
                keyExtractor={(item) => item.studentId}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={dynamic.transactionCards}
                    onPress={() =>
                      navigation.navigate("Student", { lead: item })
                    }
                  >
                    <Text style={dynamic.studentTexts}>
                      <FontAwesome
                        name="graduation-cap"
                        size={20}
                        color="black"
                      />
                      {"  "}
                      {item.firstName} {item.lastName}
                    </Text>
                    <TouchableOpacity
                      style={dynamic.editIcon}
                      onPress={() =>
                        navigation.navigate("Update", { lead: item })
                      }
                    >
                      <MaterialIcons
                        name="mode-edit-outline"
                        size={24}
                        color="black"
                      />
                    </TouchableOpacity>
                    <Text>
                      {/* <FontAwesome name="registered" size={24} color="black" />{" "} */}
                      {item.studentId}
                    </Text>
                    <Text>
                      {/* <FontAwesome name="calendar" size={24} color="black" />{" "} */}
                      {item.dob}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </ImageBackground>
      )}
      <StatusBar style="auto" />
    </View>
  );
};

const getDynamic = (width, height) => ({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4",
    alignItems: "center",
  },

  backgroundImage: {
    width: width * 1,
    height: height * 0.47,
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    fontSize: width * 0.08,
    fontWeight: "bold",
    marginTop: width * 0.9,
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
    fontFamily: "serif",
  },
  dashboardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: width * 1,
    marginBottom: width * 0.05,
    top: width * 0.55,
    padding: width * 0.02,
  },
  card: {
    backgroundColor: "#FFF",
    padding: width * 0.02,
    borderRadius: 15,
    width: width * 0.46,
    alignItems: "center",
    elevation: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  cardTitle: {
    fontSize: width * 0.04,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "serif",
  },
  cardNumber: {
    fontSize: width * 0.06,
    fontWeight: "bold",
    color: "rgb(36, 86, 91)",
    marginTop: width * 0.01,
  },
  transactionsContainer: {
    top: width * 0.56,
    width: width * 0.9,
    paddingVertical: width * 0.05,
    paddingHorizontal: width * 0.05,
    backgroundColor: "rgb(241, 240, 240)",
    borderRadius: 15,
    elevation: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    marginBottom: 60,
    height: height * 0.4,
    overflow: "hidden",
    //justifyContent: "center",
  },
  transactionTitle: {
    fontSize: width * 0.045,
    fontWeight: "bold",
    marginBottom: width * 0.03,
    color: "#333",
    textAlign: "center",
    fontFamily: "serif",
  },
  transactionCard: {
    backgroundColor: "#f8f8f8",
    padding: width * 0.04,
    marginBottom: width * 0.02,
    borderRadius: 10,
    borderLeftWidth: width * 0.015,
    borderLeftColor: "rgb(36, 86, 91)",
    //maxHeight: 120,
    // overflow: "hidden",
    // justifyContent: "center",
  },
  studentText: {
    fontSize: width * 0.04,
    fontWeight: "bold",
    color: "#333",
  },

  studentTexts: {
    fontSize: width * 0.04,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "serif",
  },

  headers: {
    fontSize: width * 0.08,
    fontWeight: "bold",
    marginTop: 320,
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
    fontFamily: "serif",
  },
  notice: {
    fontSize: width * 0.05,
    color: "red",
    marginTop: width * 0.05,
  },
  backgroundImages: {
    alignItems: "center",
    justifyContent: "center",
    width: width * 1,
    height: height * 0.47,
  },
  listContainer: {
    width: width * 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: width * 0.04,
    borderRadius: 20,
    top: width * 0.6,
    minHeight: height * 0.6,
    maxHeight: width * 0.8,
    marginBottom: height * 0.1,
    fontFamily: "serif",
  },
  transactionCards: {
    backgroundColor: "#fff",
    padding: width * 0.04,
    marginVertical: width * 0.02,
    borderRadius: 10,
    borderLeftWidth: width * 0.015,
    borderLeftColor: "rgb(36, 86, 91)",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },

  editIcon: {
    padding: width * 0.03,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -width * 0.1,
    width: "20%",
    marginLeft: width * 0.7,
  },
  countText: {
    fontSize: width * 0.04,
    fontWeight: "bold",
    color: "#333",
    marginBottom: width * 0.01,
    fontFamily: "serif",
  },
});
export default Home;
