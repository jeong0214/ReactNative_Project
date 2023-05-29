import React from "react";

import { createStackNavigator } from "@react-navigation/stack";

import MainPage from "../pages/MainPage";
import MapPage from "../pages/MapPage";
import ContactPage from "../pages/ContactPage";

const Stack = createStackNavigator();
const StackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          height: 80,
          backgroundColor: "transparent",
          elevation: 0,
        },
        headerTintColor: "#333",
        headerBackTitleVisible: false,
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="MainPage"
        component={MainPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="ContactPage" component={ContactPage} />
      <Stack.Screen name="MapPage" component={MapPage} />
    </Stack.Navigator>
  );
};
export default StackNavigator;
