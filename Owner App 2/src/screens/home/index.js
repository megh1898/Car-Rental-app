import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import theme from "../../../theme";

import { onSnapshot, collection } from "firebase/firestore";
import { db, auth } from "../../config/firebase";
import * as Location from "expo-location";
import { AntDesign } from "@expo/vector-icons";
import { signOut } from "firebase/auth";

export default class Home extends React.Component {
  constructor() {
    super();
    this.state = {
      data: [],
      loader: false,
    };
  }

  getData = () => {
    const collectionRef = collection(db, "Listing");
    const unsub = onSnapshot(collectionRef, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        console.log("Document ID: ", doc.id);
        console.log("Document Data: ", doc.data());
      });
    });
  };

//request location 
  componentDidMount = () => {
    (async () => {
      this.setState({ loader: true });
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      this.setState({ location: location?.coords });
    })();

    // get data from firestore
    const collectionRef = collection(db, "Listing");
    var _data = [];
    const unsub = onSnapshot(collectionRef, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        console.log("Document ID: ", doc.data());
        var _obj = doc.data();
        _obj.id = doc.id;
        if (auth?.currentUser?.uid === _obj.user_id) {
          _data.push(_obj);
        }
        _data.push(_obj);
        this.setState({ data: _data, loader: false });
      });
    });
  };

  logout_user = () => {
    signOut(auth)
      .then(() => {
        console.log("User logged out successfully!");
        this.props.navigation.navigate("Login");
      })
      .catch((error) => {
        console.error("Error logging out user: ", error);
      });
  };
  render() {
    const { data } = this.state;
    return (
      <View style={styles.conatiner}>
        <View style={styles._header}>
          <AntDesign name="menuunfold" size={30} color={theme.black} />
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => this.logout_user()}
          >
            <AntDesign name="logout" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <Text style={styles._heading}>My Listing </Text>
        {this.state.loader ? (
          <View style={styles.loadingMain}>
            <ActivityIndicator color={theme.primary} />
          </View>
        ) : (
          <ScrollView>
            {/* <Text style={styles._heading}></Text> */}

            {data.length !== 0 ? (
              data.map((val, i) => {
                return (
                  <View key={i} style={styles._card}>
                    <View style={{ flexDirection: "row" }}>
                      <View style={styles._left}>
                        <Image
                          resizeMode="contain"
                          source={{ uri: val.photos[0]?.url_thumbnail }}
                          style={styles._vehicle_image}
                        />
                      </View>
                      <View style={styles._right}>
                        <Text
                          style={[styles._name, { fontFamily: theme.bold }]}
                        >
                          Name:{val.vehicle_name}
                        </Text>
                        <Text style={styles._name}>
                          Seating capacity:{val.capacity}
                        </Text>
                        <Text style={styles._name}>
                          Rental Price:{val.rental_price}
                        </Text>
                        <Text style={styles._name}>Doors:{val.doors}</Text>
                        <View style={styles._badge}>
                          <Text
                            style={[
                              styles._name,
                              { fontSize: 12, fontFamily: theme.bold },
                            ]}
                          >
                            License Plate:{val.license_plate}
                          </Text>
                        </View>
                        {/*  */}
                      </View>
                    </View>
                    <View style={styles._footer}>
                      <View style={styles._card_footer}>
                        <Text style={styles._card_footerText}>
                          Rental Price
                        </Text>
                        <Text style={styles._card_footerText}>
                          ${val.rental_price}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            ) : (
              <View
                style={{
                  alignItems: "center",
                  marginTop: 100,
                }}
              >
                <Text style={[styles._card_footerText, { color: theme.grey }]}>
                  No Booking Found!
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  conatiner: {
    flex: 1,
    backgroundColor: theme.white,
    padding: 15,
  },
  _card: {
    borderWidth: 1,
    marginVertical: 5,
    borderRadius: 10,
    elevation: 2,
    backgroundColor: theme.white,
    padding: 10,
    alignItems: "center",
    borderColor: theme.greylight,
  },
  _vehicle_image: {
    height: 90,
    width: 90,
  },
  _right: {
    flex: 1,
  },
  _left: {
    marginRight: 10,
  },
  _name: {
    fontFamily: theme.semiBold,
    marginVertical: 2,
  },
  _card_footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.primary,
    elevation: 5,
    borderRadius: 10,
    height: 44,
    marginTop: 10,
    paddingHorizontal: 20,
  },
  _card_footerText: {
    color: theme.white,
    fontSize: 15,
    fontFamily: theme.bold,
  },
  _footer: {
    borderColor: theme.greylight,
    borderTopWidth: 1,
    width: "100%",
    marginTop: 10,
  },
  _badge: {
    backgroundColor: theme.greylight,
    padding: 3,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  loadingMain: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  _header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  _heading: {
    fontFamily: theme.semiBold,
  },
});
