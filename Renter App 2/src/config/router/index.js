import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  AntDesign,
  FontAwesome,
  Ionicons,
  MaterialIcons,
  SimpleLineIcons,
  Feather,
} from "@expo/vector-icons";

import { Login, Home, MyBooking } from "./../../screens";
import theme from "../../../theme";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MyTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? (
              <AntDesign name="find" size={24} color={theme.primary} />
            ) : (
              <AntDesign name="find" size={24} color={theme.gray} />
            );
          } else if (route.name === "MyBooking") {
            iconName = focused ? (
              <MaterialIcons
                name="add-location-alt"
                size={24}
                color={theme.primary}
              />
            ) : (
              <MaterialIcons
                name="add-location-alt"
                size={24}
                color={theme.gray}
              />
            );
          }
          return iconName;
        },
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
        tabBarLabelStyle: {
          fontFamily: theme.semiBold,
          paddingBottom: 5,
        },
        tabBarStyle: {
          height: 60,
          elevation: 10,
        },
        tabBarShowLabel: true,
      })}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{ headerShown: false, title: "Search" }}
      />
      <Tab.Screen
        name="MyBooking"
        component={MyBooking}
        options={{ headerShown: false, title: "My Booking" }}
      />
    </Tab.Navigator>
  );
};
let Navigation = (props) => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={Login}
          options={{
            headerShown: false,
            presentation: "card",
            animationTypeForReplace: "pop",
            animation: "slide_from_right",
          }}
        />

        <Stack.Screen
          name="MyTabs"
          component={MyTabs}
          options={{
            headerShown: false,
            presentation: "card",
            animationTypeForReplace: "pop",
            animation: "slide_from_right",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export default Navigation;
