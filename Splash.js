import React, { useEffect } from "react";
import { View, Image, StyleSheet, Animated,useWindowDimensions } from "react-native";

const Splash = ({ navigation }) => {
   const { width, height } = useWindowDimensions();
    const dynamic = getDynamic(width, height);
  const fadeAnim = new Animated.Value(0); 
  const scaleAnim = new Animated.Value(0.5); 

  useEffect(() => {
    // Start animations in parallel (fade-in + scale up)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, 
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1, 
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      navigation.replace("Login");
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={{
          uri: "https://renambl.blr1.cdn.digitaloceanspaces.com/rcoders/web/Rencoders_logo.png",
        }}
        style={[
          styles.logo,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      />
    </View>
  );
};

const getDynamic = (width, height) => ({
  container: {
    flex: 1,
    backgroundColor: "rgb(167, 161, 160)",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: width * 0.5, 
    height: width * 0.5, 
    resizeMode: "contain",
  },
});


export default Splash;
