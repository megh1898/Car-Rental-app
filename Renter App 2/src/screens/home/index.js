import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Pressable,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import theme from "../../../theme";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import {
  doc,
  onSnapshot,
  setDoc,
  collection,
  addDoc,
} from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import * as Location from "expo-location";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";

const getRandomFutureDate = () => {
  const today = new Date();
  const futureDate = new Date(
    today.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000
  );
  return futureDate;
};

export default function EvMap() {
  const [data, setData] = useState([]);
  const [location, setLocation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location?.coords);
    })();
    const collectionRef = collection(db, "Listing");
    var _data = [];
    const unsub = onSnapshot(collectionRef, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        var _obj = doc.data();
        _obj.id = doc.id;
        _data.push(_obj);
      });
      setData(_data);
      setShowLoader(false);
    });

    return () => unsub(); // Clean up the snapshot listener
  }, []);

  const bookNow = () => {
    if (!selected) {
      return;
    }

    var _vehicle_data = {
      bookingBy: {
        uid: auth?.currentUser?.uid,
        email: auth?.currentUser?.email,
      },
      status: "Pending",
      ...selected,
    };
    const collectionRef = collection(db, "Booking");

    // Add the new document to the collection
    addDoc(collectionRef, _vehicle_data)
      .then((docRef) => {
        Alert.alert("Your request sent successfully");
        setModalVisible(false);
        setSelected(null);
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
      });
  };

  const logoutUser = () => {
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AntDesign name="menuunfold" size={30} color={theme.black} />
        <Text style={styles.heading}>Find vehicles</Text>
        <TouchableOpacity activeOpacity={0.6} onPress={logoutUser}>
          <AntDesign name="logout" size={24} color="black" />
        </TouchableOpacity>
      </View>
      {showLoader ? (
        <View style={styles.loadingMain}>
          <ActivityIndicator color={theme.primary} />
          <Text style={{ color: theme.primary }}>Finding Vehicles</Text>
        </View>
      ) : (
        <MapView
          style={styles.map}
          region={{
            latitude: location?.latitude || 24.7402457,
            longitude: location?.longitude || 69.7668323,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {data.map((marker, index) => (
            <Marker
              draggable
              key={index}
              coordinate={{
                latitude: marker.coords?.latitude,
                longitude: marker.coords?.longitude,
              }}
              onPress={() => {
                setSelected(marker);
                setModalVisible(true);
              }}
            >
              <View
                style={{
                  backgroundColor: theme.white,
                  padding: 5,
                  borderRadius: 4,
                }}
              >
                <Text style={{ fontFamily: theme.bold }}>
                  ${marker.rental_price}
                </Text>
              </View>
              <Image
                source={require("../../../assets/location-pin.png")}
                resizeMode="contain"
                style={{ height: 40, width: 40 }}
              />
            </Marker>
          ))}
        </MapView>
      )}

      {/* Filter modal */}
      <View style={styles.centeredView}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={[styles.header, { paddingHorizontal: 0 }]}>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.filter}>Booking</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.reset}>Cancel</Text>
                </TouchableOpacity>
              </View>

              {selected && (
                <ScrollView style={styles.modalInner}>
                  {/* Photo of the vehicle */}
                  <Text style={styles.reset}>Photo of the vehicle</Text>
                  <ScrollView horizontal={true}>
                    <View style={styles.imageRow}>
                      {selected?.photos.map((val, i) => (
                        <View style={styles.imageContainer} key={i}>
                          <Image
                            resizeMode="contain"
                            key={i}
                            source={{ uri: val.url_thumbnail }}
                            style={styles.images}
                          />
                        </View>
                      ))}
                    </View>
                  </ScrollView>

                  {/* Vehicle details */}
                  <View style={styles.row}>
                    <Text style={styles.reset}>Vehicle Name</Text>
                    <Text style={styles.reset}>{selected?.vehicle_name}</Text>
                  </View>

                  <View style={styles.row}>
                    <Text style={styles.reset}>Seating Capacity</Text>
                    <Text style={styles.reset}>{selected?.capacity}</Text>
                  </View>

                  <View style={styles.row}>
                    <Text style={styles.reset}>Doors</Text>
                    <Text style={styles.reset}>{selected?.doors}</Text>
                  </View>

                  <View style={styles.row}>
                    <Text style={styles.reset}>License Plate</Text>
                    <Text style={styles.reset}>{selected?.license_plate}</Text>
                  </View>

                  <View style={styles.row}>
                    <Text style={styles.reset}>Rental Price</Text>
                    <Text style={styles.reset}>${selected?.rental_price}</Text>
                  </View>

                  {/* Location and contact */}
                  <View style={styles.row}>
                    <View style={styles.badge}>
                      <Ionicons name="location-outline" size={20} color="black" />
                      <Text style={[styles.name, { fontFamily: theme.bold }]}>
                        {selected?.pickup_location}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.row}>
                    <View style={styles.badge}>
                      <MaterialCommunityIcons
                        name="email-outline"
                        size={20}
                        color="black"
                      />
                      <Text style={[styles.name, { fontFamily: theme.bold }]}>
                        {selected?.user_email}
                      </Text>
                    </View>
                  </View>
                </ScrollView>
              )}

              {/* Book Now button */}
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={bookNow}
                disabled={!selected}
              >
                <Text style={styles.textStyle}>Book Now</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.white,
  },
  map: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingMain: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heading: {
    color: theme.black,
    flex: 1,
    fontFamily: theme.bold,
    paddingLeft: 10,
    fontSize: 20,
  },
  centeredView: {
    flex: 1,
  },
  modalView: {
    backgroundColor: "white",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    flex: 1,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
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
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  filter: {
    fontFamily: theme.medium,
    fontSize: 20,
  },
  reset: {
    fontFamily: theme.semiBold,
    fontSize: 16,
  },
  modalInner: {
    flex: 1,
    marginTop: 50,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 4,
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
  imageRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  images: {
    height: 100,
    width: 100,
    borderRadius: 10,
  },
  imageContainer: {
    height: 100,
    width: 100,
    borderColor: theme.primary,
    borderWidth: 1,
    borderRadius: 10,
    margin: 5,
    marginTop: 0,
  },
});
