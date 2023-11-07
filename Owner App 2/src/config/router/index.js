import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome, Ionicons, FontAwesome5 } from "@expo/vector-icons";
// screens
import { Login, Home, AddList, Profile } from "./../../screens";
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
              <FontAwesome5 name="car-alt" size={24} color={theme.primary} />
            ) : (
              <FontAwesome5 name="car-alt" size={24} color={theme.gray} />
            );
          } else if (route.name === "AddList") {
            iconName = focused ? (
              <Ionicons name="add-circle" size={24} color={theme.primary} />
            ) : (
              <Ionicons name="add-circle" size={24} color={theme.gray} />
            );
          } else if (route.name === "Profile") {
            iconName = focused ? (
              <FontAwesome
                name="user-circle-o"
                size={24}
                color={theme.primary}
              />
            ) : (
              <FontAwesome name="user-circle-o" size={24} color={theme.gray} />
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
        options={{
          title: "My Listing",
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="AddList"
        options={{
          title: "Create a Listing",
        }}
        component={AddList}
        // options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{ headerShown: false }}
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
