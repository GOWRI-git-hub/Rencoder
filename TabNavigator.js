
import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";

import Home from "../components/Home";
import Profile from "../components/Profile";
import Add from "../components/Add";
import Update from "../components/Update";
import Leads from "../components/Leads";
import Releado from "../components/Releado";
//import Ticket from "../components/Ticket";
//import Leadchat from "../components/Leadchat";
import LeadTicket from "../components/LeadTicket";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const getRole = async () => {
      const userRole = await SecureStore.getItemAsync("roal");
      setRole(userRole);
    };
    getRole();
  }, []);

  if (!role) {
    return null;
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Home") iconName = "home-outline";
          else if (route.name === "Leads") iconName = "list-outline";
          else if (route.name === "Add") iconName = "add-circle-outline";
          else if (route.name === "Update") iconName = "create-outline";
          else if (route.name === "Profile") iconName = "person-outline";
          else if (route.name === "Releado") iconName = "people-outline";
          else if (route.name === "Ticket") iconName = "pricetag-outline";
         // else if (route.name == "Leadchat") iconName = "pricetag-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#34495E",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { backgroundColor: "rgb(251, 252, 248)" },
      })}
    >
      {role === "admin" ? (
        <>
          <Tab.Screen name="Home" component={Home} />
          <Tab.Screen name="Leads" component={Leads} />
          {/* <Tab.Screen name="Ticket" component={Ticket} /> */}
          <Tab.Screen name="Releado" component={Releado} />
          <Tab.Screen name="Add" component={Add} />
          <Tab.Screen name="Profile" component={Profile} />
        </>
      ) : (
        <>
          <Tab.Screen name="Home" component={Home} />
          <Tab.Screen name="Update" component={Update} />
          <Tab.Screen name="Ticket" component={LeadTicket} />
          <Tab.Screen name="Profile" component={Profile} />
        </>
      )}
    </Tab.Navigator>
  );
};

export { TabNavigator };