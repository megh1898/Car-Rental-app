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
import { auth, db } from "../../config/firebase";
import * as Location from "expo-location";
import { AntDesign } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";

export default class MyBooking extends React.Component {
  constructor() {
    super();
    this.state = {
      data: [],
      loader: false,
    };
  }

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
        var _obj = doc.data();
        _obj.id = doc.id;
        if (_obj.bookingBy.uid === auth.currentUser.uid) {
          _data.push(_obj);
        }
        this.setState({ data: _data, loader: false });
      });
    });
  };

  logout_user = () => {
    signOut(auth)
      .then(() => {
        // The user is now logged out.
        console.log("User logged out successfully!");
        this.props.navigation.navigate("Login");
      })
      .catch((error) => {
        // An error occurred while logging out.
        console.error("Error logging out user: ", error);
      });
  };

  render() {
    const { data, loader } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <AntDesign name="menuunfold" size={30} color={theme.black} />
          <Text style={[styles.heading, { flex: 1, paddingLeft: 10, fontSize: 16 }]}>
            My Booking
          </Text>
          <TouchableOpacity activeOpacity={0.6} onPress={this.logout_user}>
            <AntDesign name="logout" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {loader ? (
          <View style={styles.loadingMain}>
            <ActivityIndicator color={theme.primary} />
          </View>
        ) : (
          <ScrollView>
            {data.length !== 0 ? (
              data.map((val, i) => {
                return (
                  <View key={i} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={{ justifyContent: "space-between", alignItems: "center", height: 80 }}>
                        <Image
                          resizeMode="contain"
                          source={{ uri: val.photos[0]?.url_thumbnail }}
                          style={styles.vehicleImage}
                        />
                        <Text style={[styles.name, { fontFamily: theme.bold }]}>{val.vehicle_name}</Text>
                      </View>
                      <AntDesign name="swap" size={24} color="black" />
                      <View style={{ justifyContent: "space-between", alignItems: "center", height: 80 }}>
                        <View style={styles.circle}>
                          <Text style={[styles.circleText, { textTransform: "uppercase" }]}>
                            {val.bookingBy.email.charAt(0)}
                          </Text>
                        </View>
                        <Text style={[styles.name, { fontFamily: theme.bold }]}>{val.bookingBy.email}</Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: "row" }}>
                      <View style={styles.left}></View>
                      <View style={styles.right}>
                        <Text style={[styles.name, { fontFamily: theme.bold }]}>
                          Name: {val.user_email}
                        </Text>
                        <Text style={styles.name}>
                          Seating capacity: {val.capacity}
                        </Text>
                        <Text style={styles.name}>
                          Rental Price: ${val.rental_price}
                        </Text>
                        <Text style={styles.name}>Doors: {val.doors}</Text>
                        <View style={styles.badge}>
                          <Ionicons
                            name="location-outline"
                            size={18}
                            color="black"
                          />
                          <Text
                            style={[styles.name, { fontSize: 12, fontFamily: theme.bold }]}
                          >
                            Pickup: {val.pickup_location}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.footer}>
                      {val.status === "Rejected" && (
                        <View style={styles.cardFooter}>
                          <Text style={styles.cardFooterText}>Rejected</Text>
                        </View>
                      )}

                      {val.status === "Accepted" && (
                        <View
                          style={[styles.cardFooter, { backgroundColor: theme.success }]}
                        >
                          <Text style={styles.cardFooterText}>Accepted</Text>
                        </View>
                      )}

                      {val.status === "Pending" && (
                        <View
                          style={[styles.cardFooter, { backgroundColor: theme.grey }]}
                        >
                          <Text style={styles.cardFooterText}>Pending</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.noBookingFound}>
                <Text style={[styles.cardFooterText, { color: theme.grey }]}>
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
  container: {
    flex: 1,
    backgroundColor: theme.white,
    padding: 15,
  },
  card: {
    borderWidth: 1,
    marginVertical: 5,
    borderRadius: 10,
    elevation: 2,
    backgroundColor: theme.white,
    padding: 10,
    alignItems: "center",
    borderColor: theme.greylight,
  },
  vehicleImage: {
    height: 60,
    width: 60,
  },
  right: {
    flex: 1,
  },
  left: {
    marginRight: 10,
  },
  name: {
    fontFamily: theme.semiBold,
    marginVertical: 2,
  },
  cardFooter: {
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
  cardFooterText: {
    color: theme.white,
    fontSize: 12,
    fontFamily: theme.bold,
  },
  footer: {
    borderColor: theme.greylight,
    borderTopWidth: 1,
    width: "100%",
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  badge: {
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  heading: {
    fontFamily: theme.semiBold,
    marginBottom: 10,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 5,
    borderBottomWidth: 1,
    borderColor: theme.greylight,
    paddingBottom: 10,
  },
  circle: {
    height: 50,
    width: 50,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: theme.primary,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.greylight,
  },
  circleText: {
    fontFamily: theme.bold,
    fontSize: 20,
  },
  noBookingFound: {
    alignItems: "center",
    marginTop: 100,
  },
});
