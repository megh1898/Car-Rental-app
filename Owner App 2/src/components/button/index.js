import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import theme from "../../../theme";
const Button = ({ type, title, onPress }) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: type === 1 ? theme.primary : theme.white },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.buttonText,
          {
            color:
              type === 1 ? theme.white : type === 2 ? "#F75555" : "#12D18E",
          },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};
let styles = StyleSheet.create({
  button: {
    height: 61,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontFamily: theme.bold,
  },
});
export default Button;
