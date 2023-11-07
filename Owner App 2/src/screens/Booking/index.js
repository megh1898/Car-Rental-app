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

import { onSnapshot, collection, updateDoc, doc } from "firebase/firestore";
import { db, auth } from "../../config/firebase";
import * as Location from "expo-location";
import { AntDesign } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";

export default class Booking extends React.Component {
  constructor() {
    super();
    this.state = {
      data: [],
      loader: false,
    };
  }
// Fetch booking data from firestore
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

    const collectionRef = collection(db, "Booking");
    var _data = [];
    const unsub = onSnapshot(collectionRef, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        console.log("Document ID: ", doc.data());
        var _obj = doc.data();
        _obj.id = doc.id;

        if (auth?.currentUser?.uid === _obj.user_id) {
          _data.push(_obj);
        }
        this.setState({ data: _data, loader: false });
      });
    });
  };

  // accept booking
  accept_booking = (_id) => {
    this.setState({ loader: true });
    const documentRef = doc(db, "Booking", _id);
    const dataToUpdate = {
      status: "Accepted",
    };

    updateDoc(documentRef, dataToUpdate)
      .then(() => {
        console.log("Document updated successfully!");
        this.setState({ loader: false });
      })
      .catch((error) => {
        console.error("Error updating document: ", error);
        this.setState({ loader: false });
      });
  };

// reject booking
  reject_booking = (_id) => {
    this.setState({ loader: true });

    const documentRef = doc(db, "Booking", _id);

    const dataToUpdate = {
      status: "Rejected",
    };

    updateDoc(documentRef, dataToUpdate)
      .then(() => {
        console.log("Document updated successfully!");
        this.setState({ loader: false });
      })
      .catch((error) => {
        this.setState({ loader: false });
        console.error("Error updating document: ", error);
      });
  };

  // user logout
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

    // render the booking confirmation code (if status is 'Accepted')
    renderConfirmationCode = (status, confirmationCode) => {
      if (status === "Accepted" && confirmationCode) {
        return (
          <View style={styles._confirmation_code_container}>
            <Text style={styles._confirmation_code_text}>
              Confirmation Code: {confirmationCode}
            </Text>
          </View>
        );
      }
      return null;
    };

  render() {
    const { location, data } = this.state;
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

        <Text style={styles._heading}>Booking Request </Text>
        {this.state.loader ? (
          <View style={styles.loadingMain}>
            <ActivityIndicator color={theme.primary} />
          </View>
        ) : (
          <ScrollView>
            {/* render booking data */}
            {data.length !== 0 ? (
              data.map((val, i) => {
                return (
                  <View key={i} style={styles._card}>
                    <View
                      style={[
                        styles._badge,
                        {
                          alignSelf: "flex-end",
                          backgroundColor:
                            val.status === "Accepted"
                              ? theme.success
                              : val.status === "Pending"
                              ? theme.greylight
                              : theme.primary,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles._status_text,
                          {
                            color:
                              val.status === "Pending"
                                ? theme.secondary
                                : theme.white,
                          },
                        ]}
                      >
                        {val.status}
                      </Text>
                    </View>
                    <View style={styles._card_header}>
                      <View
                        style={{
                          justifyContent: "space-between",
                          alignItems: "center",
                          height: 80,
                        }}
                      >
                        <View style={styles._circle}>
                          <Text style={styles._circle_text}>A</Text>
                        </View>
                        <Text
                          style={[styles._name, { fontFamily: theme.bold }]}
                        >
                          {val.vehicle_name}
                        </Text>
                      </View>

                      <AntDesign name="swap" size={24} color="black" />
                      <View
                        style={{
                          justifyContent: "space-between",
                          alignItems: "center",
                          height: 80,
                        }}
                      >
                        <Image
                          resizeMode="contain"
                          source={{ uri: val.photos[0]?.url_thumbnail }}
                          style={styles._vehicle_image}
                          onError={(error) => console.log("Image Loading Error:", error)}
                        />
                        <Text
                          style={[styles._name, { fontFamily: theme.bold }]}
                        >
                          {val.vehicle_name}
                        </Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: "row" }}>
                      <View style={styles._left}></View>
                      <View style={styles._right}>
                        <Text
                          style={[styles._name, { fontFamily: theme.bold }]}
                        >
                          Name:{val.bookingBy.email}
                        </Text>
                        {/* <Text style={styles._name}>
                          Seating capacity:{val.capicity}
                        </Text> */}
                        <Text style={styles.name}>License Plate: {val.license_plate}</Text>
                        <Text style={styles._name}>
                          Rental Price:{val.rental_price}
                        </Text>
                        <Text style={styles._name}>Doors:{val.doors}</Text>
                        <View style={styles._badge}>
                          <Ionicons
                            name="location-outline"
                            size={18}
                            color="black"
                          />
                          <Text
                            style={[
                              styles._name,
                              { fontSize: 12, fontFamily: theme.bold },
                            ]}
                          >
                            Pickup:{val.pickup_location}
                          </Text>
                        </View>
                        {/*  */}

                      </View>
                    </View>

                    {val.status === "Accepted" && (
                      <View style={styles._footer}>
                        <TouchableOpacity
                          style={[
                            styles._card_footer,
                            { backgroundColor: theme.success, opacity: 0.6 },
                          ]}
                          disabled
                          activeOpacity={0.7}
                        >
                          <Text style={styles._card_footerText}>Accepted</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {val.status === "Rejected" && (
                      <View style={styles._footer}>
                        <TouchableOpacity
                          style={[
                            styles._card_footer,
                            { backgroundColor: theme.primary, opacity: 0.6 },
                          ]}
                          disabled
                          activeOpacity={0.7}
                        >
                          <Text style={styles._card_footerText}>Rejected</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles._card_footer,
                            { backgroundColor: theme.success },
                          ]}
                          activeOpacity={0.7}
                          onPress={() => this.accept_booking(val.id)}
                        >
                          <Text style={styles._card_footerText}>Accept</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    {val.status === "Pending" && (
                      <View style={styles._footer}>
                        <TouchableOpacity
                          style={styles._card_footer}
                          activeOpacity={0.7}
                          onPress={() => this.reject_booking(val.id)}
                        >
                          <Text style={styles._card_footerText}>Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles._card_footer,
                            { backgroundColor: theme.success },
                          ]}
                          activeOpacity={0.7}
                          onPress={() => this.accept_booking(val.id)}
                        >
                          <Text style={styles._card_footerText}>Accept</Text>
                        </TouchableOpacity>
                      </View>
                    )}
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
    height: 60,
    width: 60,
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
    justifyContent: "center",
    backgroundColor: theme.primary,
    elevation: 5,
    borderRadius: 10,
    height: 44,
    marginTop: 10,
    paddingHorizontal: 20,
    flex: 1,
    marginHorizontal: 10,
  },
  _card_footerText: {
    color: theme.white,
    fontSize: 12,
    fontFamily: theme.bold,
  },
  _footer: {
    borderColor: theme.greylight,
    borderTopWidth: 1,
    width: "100%",
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  _badge: {
    backgroundColor: theme.greylight,
    padding: 3,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
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
    marginBottom: 10,
  },

  _card_header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 5,
    borderBottomWidth: 1,
    borderColor: theme.greylight,
    paddingBottom: 10,
  },
  _circle: {
    height: 50,
    width: 50,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: theme.primary,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.greylight,
  },
  _circle_text: {
    fontFamily: theme.bold,
    fontSize: 20,
  },
  _status_text: {
    fontFamily: theme.bold,
    fontSize: 12,
  },
});
