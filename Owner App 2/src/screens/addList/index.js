import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from "react-native";
import theme from "../../../theme";
import { addDoc, collection } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import * as Location from "expo-location";
import Autocomplete from "react-native-autocomplete-input";

const AddList = () => {
  const [open, setOpen] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [query, setQuery] = useState("");
  const [photos, setPhotos] = useState([]);
  const [capacity, setCapacity] = useState("");
  const [doors, setDoors] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [rentalPrice, setRentalPrice] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      Location(location?.coords);
    })();
  
    // Fetch vehicle data from the URL
    fetch("https://roneykandoria.github.io/vehicles.api/vehicles.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      setVehicles(data);
    })
    .catch((error) => {
      console.error("Error fetching vehicle data: ", error);
      Alert.alert("Error fetching vehicle data");
    });
  }, []);

  useEffect(() => {
    if (selectedVehicle) {
      setCapacity(selectedVehicle.seats_min.toString());
      setDoors(selectedVehicle.doors.toString());
      setPhotos(selectedVehicle.images || []);
    }
  }, [selectedVehicle]);

  // geocoding
  const doForwardGeocode = async () => {
    try {
      const geocodedLocation = await Location.geocodeAsync(pickupLocation);

      const result = geocodedLocation[0];
      if (result === undefined) {
        Alert.alert("No coordinates found");
        return null;
      }

      return {
        latitude: result.latitude,
        longitude: result.longitude,
      };
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  const confirm = async () => {
    try {
      let currentLocation = await Location.getCurrentPositionAsync({});

      if (
        query === "" ||
        capacity === "" ||
        doors === "" ||
        licensePlate === "" ||
        pickupLocation === "" ||
        rentalPrice === ""
      ) {
        Alert.alert("All fields are required");
        return;
      }

      const coords = await doForwardGeocode();
      if (coords === null) {
        return; // If forward geocoding fails, do not proceed
      }

      const vehicleData = {
        user_id: auth.currentUser.uid,
        user_email: auth.currentUser.email,
        coords: coords,
        vehicle_name: query,
        capacity: capacity,
        doors: doors,
        photos: photos,
        license_plate: licensePlate,
        pickup_location: pickupLocation,
        rental_price: rentalPrice,
        ...selectedVehicle,
        
      };

      const collectionRef = collection(db, "Listing");
      await addDoc(collectionRef, vehicleData);

      Alert.alert("Listing added successfully");

      // Clear form fields
      setQuery("");
      setPhotos([]);
      setCapacity("");
      setDoors("");
      setLicensePlate("");
      setPickupLocation("");
      setRentalPrice("");
      setSelectedVehicle(null);
    } catch (error) {
      console.error("Error adding document: ", error);
      Alert.alert("Failed to add listing. Please try again.");
    }
  };

  const findVehicles = (query) => {
    if (query === "") {
      return [];
    }
    const regex = new RegExp(`${query.trim()}`, "i");
    return vehicles.filter(
      (vehicle) => vehicle.make.search(regex) >= 0
    );
  };

  const comp = (a, b) => a.toLowerCase().trim() === b.toLowerCase().trim();

  const onVehicleSelect = (item) => {
    setSelectedVehicle(item);
    setQuery(item?.make + " " + item?.model + " " + item?.trim);
    setOpen(false);
    setPhotos(item?.images);
  };

const onDropdownShow = () => {
  setOpen(true); 
};

const onDropdownClose = () => {
  setOpen(false); 
};

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={[styles.title, { marginBottom: 4 }]}>Vehicle Name</Text>
        <Autocomplete
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.inputBar}
          data={
            vehicles.length === 1 && comp(query, vehicles[0].make)
              ? []
              : findVehicles(query)
          }
          defaultValue={
            selectedVehicle
              ? selectedVehicle.make + " " + selectedVehicle.model + " " + selectedVehicle.trim
              : query
          }
          onChangeText={(text) => setQuery(text)}
          placeholder="Example: Audi A7 TFSIe"
          hideResults={open}
          onOpen={onDropdownShow}
          onClose={onDropdownClose}
          flatListProps={{
            keyboardShouldPersistTaps: "always",
            keyExtractor: (item) => item?.handle,
            scrollEnabled: false,
            renderItem: ({ item }) => (
              <TouchableOpacity onPress={() => onVehicleSelect(item)}>
                <Text style={styles.listText}>
                  {item?.make} {item?.model} {item?.trim}
                </Text>
              </TouchableOpacity>
            ),
          }}
        />

        {/* Display photos */}
        {photos.length !== 0 && (
          <Text style={[styles.title, { marginBottom: 4 }]}>
            Photo of the vehicle
          </Text>
        )}
        <View style={styles.imageRow}>
          {photos.map((val, i) => (
            <View style={styles.imageContainer} key={i}>
              <Image
                resizeMode="contain"
                source={{ uri: val.url_thumbnail }}
                style={styles.images}
              />
            </View>
          ))}
        </View>

        {/* Seating Capacity */}
        <Text style={[styles.title, { marginBottom: 4 }]}>Seating Capacity</Text>
        <TextInput
          placeholder="Example: 6"
          keyboardType="numeric"
          value={capacity}
          onChangeText={(e) => setCapacity(e)}
          style={[
            styles.inputBar,
            { borderWidth: 1, borderColor: theme.greylight },
          ]}
        />

        {/* Doors in car */}
        <Text style={[styles.title, { marginBottom: 4 }]}>Doors</Text>
        <TextInput
          placeholder="Example: 6"
          keyboardType="numeric"
          value={doors}
          onChangeText={(e) => setDoors(e)}
          style={[
            styles.inputBar,
            { borderWidth: 1, borderColor: theme.greylight },
          ]}
        />
        {/* License Plate */}
        <Text style={[styles.title, { marginBottom: 4 }]}>License Plate</Text>
        <TextInput
          placeholder="Example: BLHT281"
          value={licensePlate}
          onChangeText={(e) => setLicensePlate(e)}
          style={[
            styles.inputBar,
            { borderWidth: 1, borderColor: theme.greylight },
          ]}
        />
        {/* Location  */}
        <Text style={[styles.title, { marginBottom: 4 }]}>
          Pickup location address
        </Text>
        <TextInput
          placeholder="Example: 153 Main Street, Seattle, Washington, USA)"
          value={pickupLocation}
          multiline={true}
          numberOfLines={4}
          onChangeText={(e) => setPickupLocation(e)}
          style={[
            styles.inputBar,
            {
              borderWidth: 1,
              borderColor: theme.greylight,
              textAlignVertical: "top",
            },
          ]}
        />
        {/* Price */}
        <Text style={[styles.title, { marginBottom: 4 }]}>Rental Price($)</Text>
        <TextInput
          placeholder="Example: $250"
          keyboardType="numeric"
          value={rentalPrice}
          onChangeText={(e) => setRentalPrice(e)}
          style={[
            styles.inputBar,
            {
              borderWidth: 1,
              borderColor: theme.greylight,
              textAlignVertical: "top",
            },
          ]}
        />
        {/* save Button */}
        <Pressable
          style={[styles.button, styles.buttonClose]}
          onPress={confirm}
        >
          <Text style={styles.textStyle}>Save</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.white,
    padding: 20,
  },
  imageContainer: {
    height: 100,
    width: 100,
    borderColor: theme.primary,
    borderWidth: 1,
    borderRadius: 10,
    margin: 5,
  },
  images: {
    height: 100,
    width: 100,
    borderRadius: 10,
  },
  inputBar: {
    fontFamily: theme.medium,
    minHeight: 50,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    paddingHorizontal: 15,
  },
  title: {
    marginTop: 10,
    fontFamily: theme.semiBold,
  },
  imageRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  listText: {
    fontFamily: theme.regular,
    fontSize: 16,
    paddingVertical: 5,
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
});

export default AddList;
