import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from "react-native";
import theme from "../../../theme";
import { auth } from "../../config/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

function Login ({ navigation }){
  const [email, setemail] = useState("roney@gmail.com");
  const [password, setpassword] = useState("Test123");

  useEffect(() => {
    (async () => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          // const uid = user.uid;
          navigation.navigate("MyTabs");
        }
      });
    })();
  },);

  function SignIn (){
    signInWithEmailAndPassword(auth, email, password)
      .then(async () => {
        navigation.navigate("MyTabs");
        setemail("");
        setpassword("");
      })
      .catch((error) => {
        const errorMessage = error.message;
        Alert.alert(errorMessage);
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles._top_section}>
        <Image
          source={require("../../../assets/app_icon.png")}
          style={styles._icon}
        />
        <Text style={styles._app_title}>EV Car Owner</Text>
      </View>
      <View style={styles.containerInner}>
        <Text style={styles._title}>Sign In</Text>
        <Text style={styles._desc}>Hi there! Nice to see you again.</Text>

        <View>
          <View style={styles._fields_view}>
            <Text style={styles._label}>Email</Text>

            <TextInput
              placeholder="Your email address"
              value={email}
              onChangeText={setemail}
              style={styles._input}
            />
          </View>
          <View style={styles._fields_view}>
            <Text style={styles._label}>Password</Text>
            <TextInput
              placeholder="Enter password"
              secureTextEntry
              value={password}
              onChangeText={setpassword}
              style={styles._input}
            />
          </View>

          <TouchableOpacity style={styles._login_btn} onPress={() => SignIn()}>
            <Text style={styles._login_btnText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
let styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.white,
    padding: 10,
  },
  containerInner: {
    marginHorizontal: 20,
    justifyContent: "space-between",
    paddingVertical: 30,
  },

  _title: {
    fontSize: 26,
    fontFamily: theme.bold,
    color: theme.secondary,
  },

  _login_btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.primary,
    elevation: 5,
    borderRadius: 10,
    height: 54,
    marginBottom: 30,
    marginTop: 35,
  },
  _login_btnText: {
    color: theme.white,
    fontSize: 17,
    fontFamily: theme.semiBold,
    marginLeft: 15,
  },
  _input: {
    fontFamily: theme.medium,
    borderBottomWidth: 1,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
    borderColor: theme.greylight,
    fontSize: 16,
  },
  _fields_view: {
    marginTop: 20,
  },
  _label: {
    fontFamily: theme.semiBold,
    color: theme.primary,
    fontSize: 14,
    marginVertical: 10,
  },

  _top_section: {
    alignSelf: "center",
    marginTop: 50,
  },
  _icon: {
    height: 63,
    width: 89,
  },
  _app_title: {
    fontFamily: theme.semiBold,
    color: theme.grey,
    fontSize: 16,
  },
  _desc: {
    fontFamily: theme.regular,
    color: theme.grey,
    fontSize: 16,
    marginTop: 10,
  },
});
export default Login;
