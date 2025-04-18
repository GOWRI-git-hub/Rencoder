// import {
//   View,
//   Text,
//   StyleSheet,
//   ImageBackground,
//   TouchableOpacity,
// } from "react-native";
// //import { useIP } from "../components/IPContext";
// import React from "react";
// import { useNavigation } from "@react-navigation/native";
// import { FontAwesome, MaterialIcons } from "@expo/vector-icons";

// const Student = ({ route }) => {
//   const { lead } = route.params;
//   const navigation = useNavigation();

//   return (
//     <View style={styles.container}>
//       <ImageBackground
//         source={{
//           uri: "https://i.pinimg.com/736x/7c/a8/1c/7ca81c302138bf2c4f7e509e6a5bb3c8.jpg",
//         }}
//         style={styles.bgimage}
//       >
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//         >
//           <FontAwesome name="arrow-left" size={24} color="#444" />
//         </TouchableOpacity>

//         <Text style={styles.heading}>Student Details</Text>
//         <View style={styles.card}>
//           <ProfileRow icon="badge" label={`${lead.studentId}`} materialIcon />

//           <ProfileRow
//             icon="user"
//             label={`${lead.firstName} ${lead.lastName}`}
//           />

         
//           <ProfileRow icon="calendar" label={lead.dob} />

          
//           <ProfileRow icon="map-marker" label={lead.address} />

         
//           <ProfileRow icon="book" label={lead.selectedCourse} />

         
//           <ProfileRow icon="school" label={lead.learningMode} materialIcon />

          
//           <ProfileRow icon="external-link" label={lead.sourceType} />

          

//           <ProfileRow
//             icon="person-search"
//             label={lead.referralSource}
//             materialIcon
//           />

//           <ProfileRow icon="info-circle" label={lead.currentStatus} />

         
//           <ProfileRow icon="credit-card" label={lead.paymentStatus} />

         
//         </View>
//       </ImageBackground>
//     </View>
//   );
// };
// const ProfileRow = ({ icon, label, materialIcon }) => (
//   <View style={styles.cardRow}>
//     {materialIcon ? (
//       <MaterialIcons name={icon} size={24} color="#2C3E50" />
//     ) : (
//       <FontAwesome name={icon} size={24} color="#2C3E50" />
//     )}
//     <Text style={styles.cardText}>{label}</Text>
//   </View>
// );


// const styles = StyleSheet.create({
//   backButton: {
//     position: "absolute",
//     top: 42,
//     left: 20,
//     padding: 10,
//     borderRadius: 50,
//     zIndex: 10,
//   },
//   heading: {
//     fontSize: 22,
//     color: "#2C3E50",
//     top:20,
//     marginLeft: 15,
//     marginBottom:30,
//     fontFamily: "serif",
//     fontWeight: "bold",
//   },
//   container: {
//     flex: 1,
//     backgroundColor: "#F4F6F7",
//     alignItems: "center",
//   },
//   bgimage: {
//     flex: 1,
//     resizeMode: "cover",
//     justifyContent: "center",
//     alignItems: "center",
//     width: "100%",
//     height: "100%",
//   },
//   imageContainer: {
//     marginTop: 90,
//     width: 150,
//     height: 150,
//     borderRadius: 75,
//     overflow: "hidden",
//     marginVertical: 30,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 6,
//     elevation: 10,
//     borderWidth: 2,
//     borderColor: "#FFF",
//   },
//   image: {
//     width: "100%",
//     height: "100%",
//   },
//   card: {
//     backgroundColor: "rgba(21, 20, 20, 0.1)",
//     padding: 20,
//     borderRadius: 15,
//     shadowColor: "rgba(0, 0, 0, 0.1)",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//     elevation: 3,
//     width: "90%",
//   },
//   cardRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 22,
//     borderBottomWidth: 1,
//     borderBottomColor: "#ECF0F1",
//   },
//   cardText: {
//     fontSize: 16,
//     color: "#2C3E50",
//     marginLeft: 15,
//     fontFamily: "serif",
//     fontWeight: "600",
//   },
//   loader: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });

// export default Student;



import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  ToastAndroid,
} from "react-native";
import { useIP } from "../components/IPContext";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";

const Student = ({ route }) => {
    const ip = useIP();
  const { lead } = route.params;
  const navigation = useNavigation();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ ...lead });

   const handleUpdate = async () => {
     try {
       const { _id, ...dataToSend } = formData;
       const response = await fetch( `http://${ip}:5000/studentupdate`,
         {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify(formData),
         }
       );
       const result = await response.json();

       if (response.ok) {
         ToastAndroid.show(
           "Student data updated successfully!",
           ToastAndroid.SHORT
         );
         setEditMode(false);
         navigation.navigate("Home");
       } else {
         ToastAndroid.show(
           `Error: ${result.message || "Update failed"}`,
           ToastAndroid.SHORT
         );
       }
     } catch (error) {
        ToastAndroid.show("Server not reachable", ToastAndroid.SHORT);
     }
   };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: "https://i.pinimg.com/736x/7c/a8/1c/7ca81c302138bf2c4f7e509e6a5bb3c8.jpg",
        }}
        style={styles.bgimage}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome name="arrow-left" size={24} color="#444" />
        </TouchableOpacity>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text style={styles.heading}>Student Details</Text>
          <TouchableOpacity
            onPress={() => {
              if (editMode) {
                handleUpdate(); 
              } else {
                setEditMode(true); 
              }
            }}
          >
            <FontAwesome
              name={editMode ? "save" : "edit"}
              size={24}
              color="#2C3E50"
              style={{ marginLeft: 25, marginTop: 10 }}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <EditableRow
            icon="badge"
            value={formData.studentId}
            editable={false}
            materialIcon
          />
          <EditableRow
            icon="user"
            value={`${formData.firstName} ${formData.lastName}`}
            onChangeText={(text) => {
              const [firstName, lastName] = text.split(" ");
              setFormData({ ...formData, firstName, lastName });
            }}
            editable={editMode}
          />
          <EditableRow
            icon="calendar"
            value={formData.dob}
            onChangeText={(text) => setFormData({ ...formData, dob: text })}
            editable={editMode}
          />
          <EditableRow
            icon="map-marker"
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            editable={editMode}
          />
          <EditableRow
            icon="book"
            value={formData.selectedCourse}
            onChangeText={(text) =>
              setFormData({ ...formData, selectedCourse: text })
            }
            editable={editMode}
          />
          <EditableRow
            icon="school"
            value={formData.learningMode}
            onChangeText={(text) =>
              setFormData({ ...formData, learningMode: text })
            }
            editable={editMode}
            materialIcon
          />
          <EditableRow
            icon="external-link"
            value={formData.sourceType}
            onChangeText={(text) =>
              setFormData({ ...formData, sourceType: text })
            }
            editable={editMode}
          />
          <EditableRow
            icon="person-search"
            value={formData.referralSource}
            onChangeText={(text) =>
              setFormData({ ...formData, referralSource: text })
            }
            editable={editMode}
            materialIcon
          />
          <EditableRow
            icon="info-circle"
            value={formData.currentStatus}
            onChangeText={(text) =>
              setFormData({ ...formData, currentStatus: text })
            }
            editable={editMode}
          />
          <EditableRow
            icon="credit-card"
            value={formData.paymentStatus}
            onChangeText={(text) =>
              setFormData({ ...formData, paymentStatus: text })
            }
            editable={editMode}
          />
        </View>
      </ImageBackground>
    </View>
  );
};
const EditableRow = ({
  icon,
  value,
  onChangeText,
  editable,
  materialIcon,
}) => (
  <View
    style={[
      styles.cardRow,
      { borderBottomColor: editable ? "#666" : "#ECF0F1" },
    ]}
  >
    {materialIcon ? (
      <MaterialIcons name={icon} size={24} color="#2C3E50" />
    ) : (
      <FontAwesome name={icon} size={24} color="#2C3E50" />
    )}
    {editable ? (
      <TextInput
        style={styles.cardText}
        value={value}
        onChangeText={onChangeText}
        placeholder="Edit..."
      />
    ) : (
      <Text style={styles.cardText}>{value}</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  backButton: {
    position: "absolute",
    top: 42,
    left: 20,
    padding: 10,
    borderRadius: 50,
    zIndex: 10,
  },
  heading: {
    fontSize: 22,
    color: "#2C3E50",
    top: 20,
    // marginLeft: 15,
    marginBottom: 30,
    fontFamily: "serif",
    fontWeight: "bold",
    marginLeft: 25,
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
  },
  cardText: {
    fontSize: 16,
    color: "#2C3E50",
    marginLeft: 15,
    fontFamily: "serif",
    fontWeight: "600",
    flex: 1,
    paddingVertical: 0,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Student;