import { NavigationContainer } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import { View, Image, ActivityIndicator } from "react-native";
import StackNavigator from "./navigation/StackNavigator";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import Intro from "./pages/Intro";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [fontsLoaded] = useFonts({
    Cafe24Ssurround: require("./assets/fonts/Cafe24Ssurround.ttf"),
    Cafe24SsurroundAir: require("./assets/fonts/Cafe24SsurroundAir.ttf"),
  });

  useEffect(() => {
    // 데이터 로딩 등의 비동기 작업 수행
    // 작업이 완료되면 setIsLoading(false)로 로딩 상태 변경
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  if (isLoading) {
    return <Intro />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="black" />
      <StackNavigator />
    </NavigationContainer>
  );
}
