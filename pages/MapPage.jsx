import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Text,
  Animated,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import Geocoder from "react-native-geocoding";
import axios from "axios";
import CCTVData from "./CCTVData";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SMS from "expo-sms";

const API_KEY = "AIzaSyDplkqI3SV3a24gnObFpcsCHAN7xbCdiLw";
const { width: screenWidth } = Dimensions.get("window");

Geocoder.init(API_KEY);

export default function MapPage({ navigation, route }) {
  // cctv 데이터
  let [data] = useState(CCTVData);
  // input요소
  const { departure, MDestination } = route.params;
  const [start, setStart] = useState(departure);
  const [destination, setDestination] = useState(MDestination);
  // 지도기능
  const [coordinate, setCoordinate] = useState({ latitude: 0, longitude: 0 });
  const [initialRegion, setInitialRegion] = useState(null);
  const [startRegion, setStartRegion] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destinationRegion, setDestinationRegion] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [cctvMarkers, setCCTVMarkers] = useState([]);
  const [showCCTV, setShowCCTV] = useState(false);
  const [isSirenOn, setIsSirenOn] = useState(false);
  const [soundObject, setSoundObject] = useState(null);
  const [isInfoVisible, setIsInfoVisible] = useState(true);
  const [infoBoxAnimation] = useState(new Animated.Value(0));
  const handleMainPress = () => {
    navigation.navigate("MainPage");
  };

  useEffect(() => {
    const initialCoordinate = { latitude: 37.123, longitude: -122.456 };
    setCoordinate(initialCoordinate);
  }, []);

  console.log("Coordinate:", coordinate);
  // 마커이미지

  const markers = [
    {
      type: "currentLocation",
      coordinate: { latitude: 37.78825, longitude: -122.4524 },
      image: require("../assets/img/me.png"),
    },
    {
      type: "start",
      coordinate: { latitude: 37.78825, longitude: -122.4324 },
      image: require("../assets/img/start.png"),
    },
    {
      type: "destination",
      coordinate: { latitude: 37.7876, longitude: -122.4214 },
      image: require("../assets/img/arrive.png"),
    },
    {
      type: "cctv",
      coordinate: { latitude: 37.786, longitude: -122.43 },
      image: require("../assets/img/cctv.png"),
    },
  ];

  // 화면상 출력
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted")
          return console.log("Location permission denied");
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        setInitialRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        setCurrentLocation({ latitude, longitude });
        const address = await reverseGeocodeCoordinates(latitude, longitude);
        setStart(address);
      } catch (error) {
        console.log("Error getting current location:", error);
      }
    })();
  }, []);

  // 검색창

  useEffect(() => {
    // 페이지가 열릴 때 애니메이션을 실행하여 초기값으로 보여주도록 설정
    Animated.timing(infoBoxAnimation, {
      toValue: isInfoVisible ? 0 : 1, // 수정된 부분
      duration: 0,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleFormCloseButtonPress = () => {
    Animated.timing(infoBoxAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleMenuButtonPress = () => {
    setIsInfoVisible(true);
    Animated.timing(infoBoxAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const infoBoxStyles = {
    opacity: infoBoxAnimation,
    transform: [
      {
        translateY: infoBoxAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [100, 0],
        }),
      },
    ],
  };

  //변경되는 위치에 맞춰 출발지 변경
  useEffect(() => {
    const subscription = Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 10,
      },
      ({ coords: { latitude, longitude } }) =>
        setCurrentLocation({ latitude, longitude })
    );
    return () => subscription && subscription.remove();
  }, []);

  // 네비게이션 기능
  const handleNavigation = async () => {
    try {
      let selectedStart = start;
      if (!start && currentLocation) {
        // 출발지가 비어있는 경우 현재 위치를 출발지로 설정
        const { latitude, longitude } = currentLocation;
        const address = await reverseGeocodeCoordinates(latitude, longitude);
        selectedStart = address;
      }

      const startCoordinates = await geocodeAddress(selectedStart);
      const destinationCoordinates = await geocodeAddress(destination);

      if (!startCoordinates || !destinationCoordinates) {
        throw new Error("Failed to geocode start or destination coordinates");
      }

      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${startCoordinates.latitude},${startCoordinates.longitude}&destination=${destinationCoordinates.latitude},${destinationCoordinates.longitude}&mode=walking&key=${API_KEY}`
      );

      const { data } = response;

      if (data.routes.length === 0) {
        //  루트를 못찾을 시 폴리라인을 출발지와 목적지 사이에 직선으로 라인 생성
        setRouteCoordinates([startCoordinates, destinationCoordinates]);
      } else {
        const route = data.routes[0];
        const points = route.overview_polyline.points;
        const decodedCoordinates = decodePolyline(points);
        setRouteCoordinates(decodedCoordinates);
      }
    } catch (error) {
      console.log("Error fetching route:", error);
    }
  };
  // 지오코딩으로 주소를 좌표로 변환
  const convertToKorean = async (address) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&language=ko&key=${API_KEY}`
      );

      const results = response.data.results;
      if (results.length > 0) {
        const koreanAddress = results[0].formatted_address;
        return koreanAddress;
      } else {
        throw new Error("No Korean address found.");
      }
    } catch (error) {
      console.log("Korean address conversion error:", error);
      return address;
    }
  };
  // 지오코딩 주소를 좌표로 반환
  const geocodeAddress = async (address) => {
    try {
      const response = await Geocoder.from(address);
      if (response.status !== "OK") {
        throw new Error("Geocoding failed");
      }

      if (response.results.length === 0) {
        throw new Error("No results found for the address");
      }

      const { lat, lng } = response.results[0].geometry.location;
      if (!lat || !lng) {
        throw new Error("Latitude or longitude is undefined");
      }
      return {
        latitude: lat,
        longitude: lng,
      };
    } catch (error) {
      console.log("Geocoding error:", error);
      throw error;
    }
  };
  // 폴리라인 지도상의 경로 선 출력
  const decodePolyline = (encoded) => {
    let poly = [];
    let index = 0,
      len = encoded.length;
    let lat = 0,
      lng = 0;

    while (index < len) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      let point = {
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      };
      poly.push(point);
    }
    return poly;
  };
  // 출력된 지도에 위치 클릭 시 주소 input 출발지 목적지 입력
  const handleMapPress = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const address = await reverseGeocodeCoordinates(latitude, longitude);

    if (!start) {
      setStart(address);
      setStartRegion({ latitude, longitude }); // 출발지 위치 저장
    } else if (!destination) {
      setDestination(address);
      setDestinationRegion({ latitude, longitude });
    }
  };
  // 역지오코딩으로 좌표를 통해서 주소를 알아낸 후 convertToKorean함수로 주소명을 한국어로 변환
  const reverseGeocodeCoordinates = async (latitude, longitude) => {
    try {
      const response = await Geocoder.from({ lat: latitude, lng: longitude });
      if (response.status !== "OK") {
        throw new Error("Geocoding failed");
      }

      if (response.results.length === 0) {
        throw new Error("No results found for the address");
      }

      const address = response.results[0].formatted_address;
      const koreanAddress = await convertToKorean(address);
      return koreanAddress;
    } catch (error) {
      console.log("Reverse geocoding error:", error);
      throw error;
    }
  };
  // CCTV 마커를 추가하는 함수
  const addCCTVMarkers = () => {
    if (showCCTV) {
      const markers = data[0].response.body.items
        .map((cctv, index) => {
          const { crdntX, crdntY } = cctv;
          const latitude = parseFloat(crdntY);
          const longitude = parseFloat(crdntX);
          if (isNaN(latitude) || isNaN(longitude)) {
            return null; // 유효하지 않은 좌표는 null 대신 무시합니다.
          }
          return {
            coordinate: {
              latitude,
              longitude,
            },
          };
        })
        .filter((marker) => marker !== null);

      setCCTVMarkers(markers);
    } else {
      setCCTVMarkers([]);
    }
  };
  useEffect(() => {
    addCCTVMarkers();
  }, [showCCTV]);

  // 경보기 기능

  const playAudio = async () => {
    try {
      if (isSirenOn) {
        const newSoundObject = new Audio.Sound();
        await newSoundObject.loadAsync(require("../assets/sound/siren.mp3"));
        console.log("Sound loaded successfully!");
        await newSoundObject.setVolumeAsync(1.0); // Set volume to maximum
        await newSoundObject.setIsLoopingAsync(true); // Set the sound to loop
        await newSoundObject.playAsync();
        setSoundObject(newSoundObject);

        let message = "위급상황입니다. ";
        if (currentLocation) {
          const { latitude, longitude } = currentLocation;
          const address = await reverseGeocodeCoordinates(latitude, longitude);
          message += `지금 제 위치는 ${address}입니다.`;
        } else {
          message += "지금 제 위치는 알 수 없음입니다.";
        }

        const isAvailable = await SMS.isAvailableAsync();
        if (isAvailable) {
          const storedContacts = await AsyncStorage.getItem("contacts");
          if (storedContacts) {
            const parsedContacts = JSON.parse(storedContacts);
            if (parsedContacts.length > 0) {
              const firstContact = parsedContacts[0];
              const phoneNumber = firstContact.phoneNumber;
              const { result } = await SMS.sendSMSAsync([phoneNumber], message);
              if (result === "sent") {
                console.log("Message sent successfully!");
              } else {
                console.log("Failed to send message.");
              }
            }
          }
        } else {
          console.log("SMS is not available on this device.");
        }
      } else {
        if (soundObject) {
          await soundObject.stopAsync();
          await soundObject.unloadAsync();
          setSoundObject(null);
        }
      }
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  const handlePlaySound = async () => {
    setIsSirenOn(!isSirenOn);
    await playAudio();
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        region={initialRegion}
        onPress={handleMapPress}
      >
        {/* 내 위치 마커 */}
        {!!initialRegion && (
          <Marker coordinate={currentLocation}>
            <Image
              source={markers[0].image}
              style={{ width: 30, height: 30 }}
            />
          </Marker>
        )}
        {/* 출발지 마커 */}
        {!!startRegion && (
          <Marker coordinate={startRegion} pinColor="green">
            <Image
              source={markers[1].image}
              style={{ width: 30, height: 30 }}
            />
          </Marker>
        )}
        {/* 목적지 마커 */}
        {!!destinationRegion && (
          <Marker coordinate={destinationRegion} pinColor="red">
            <Image
              source={markers[2].image}
              style={{ width: 30, height: 30 }}
            />
          </Marker>
        )}
        {/* 경로표시 */}
        {!!routeCoordinates && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={3}
            strokeColor="blue"
          />
        )}
        {/* CCTV 마커 표시 */}
        {cctvMarkers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker.coordinate}
            title="CCTV"
            image={markers[3].image}
          />
        ))}
      </MapView>
      <Animated.View
        style={[
          styles.searchForm,
          infoBoxStyles,
          { zIndex: isInfoVisible ? 1 : -1 },
        ]}
      >
        <View style={styles.searchInput}>
          <TextInput
            placeholder="출발지"
            value={start}
            onChangeText={(text) => setStart(text)}
            style={[
              styles.mapInput,
              styles.mapInputS,
              { backgroundColor: "#F2F8FF" },
            ]}
          />
          <TextInput
            placeholder="목적지"
            value={destination}
            onChangeText={(text) => setDestination(text)}
            style={[
              styles.mapInput,
              styles.mapInputD,
              { backgroundColor: "#F2F8FF" },
            ]}
          />
        </View>
        <TouchableOpacity onPress={handleNavigation} style={styles.searchBtn}>
          <Image source={require("../assets/img/search.png")} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.searchClose}
          onPress={handleFormCloseButtonPress}
        >
          <Image source={require("../assets/img/arrowTop.png")} />
        </TouchableOpacity>
      </Animated.View>

      {isInfoVisible && (
        <View style={styles.infoBox}>
          <View style={styles.infoBoxD}>
            <Text numberOfLines={1} style={styles.infoBoxT}>
              {start}
            </Text>
            <Image source={require("../assets/img/arrow.png")} />
            <Text numberOfLines={1} style={styles.infoBoxT}>
              {destination}
            </Text>
          </View>
          <TouchableOpacity onPress={handleMenuButtonPress}>
            <Image source={require("../assets/img/menu.png")} />
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity onPress={handleMainPress} style={styles.MainLink}>
        <Image source={require("../assets/img/home.png")} />
      </TouchableOpacity>
      {/* CCTV 표시 여부를 토글하는 버튼 */}
      <TouchableOpacity
        style={[styles.cctvToggle, { opacity: showCCTV ? 1 : 0.6 }]}
        onPress={() => setShowCCTV(!showCCTV)}
      >
        <Image source={require("../assets/img/cctvUi.png")} />
      </TouchableOpacity>
      {/* 신고버튼 */}
      <TouchableOpacity style={styles.Declaration} onPress={handlePlaySound}>
        <Image source={require("../assets/img/siren.png")} />
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  searchForm: {
    paddingTop: 45,
    paddingBottom: 20,
    position: "absolute",
    backgroundColor: "#fff",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  searchInput: {
    width: "60%",
  },
  mapInput: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: "100%",
  },
  mapInputS: {
    borderTopLeftRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
  },
  mapInputD: {
    borderBottomLeftRadius: 8,
  },
  searchBtn: {
    paddingVertical: 35,
    paddingHorizontal: 10,
    backgroundColor: "#87CDFF",
    borderBottomRightRadius: 8,
    borderTopRightRadius: 8,
  },
  searchClose: {
    position: "absolute",
    bottom: "-39%",
    alignItems: "center",
    width: "30%",
    backgroundColor: "#eaeaea",
    paddingVertical: 8,
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
  },
  infoBox: {
    width: "80%",
    flexDirection: "row",
    position: "absolute",
    justifyContent: "space-between",
    top: "10%",
    left: "50%",
    marginLeft: -(screenWidth * 0.4),
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    zIndex: 0,
  },
  infoBoxD: {
    width: "70%",
    flexDirection: "row",
  },
  infoBoxT: {
    width: "50%",
  },
  MainLink: {
    position: "absolute",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 30,
    bottom: "10%",
    left: "50%",
    marginLeft: -(screenWidth * 0.07),
    shadowColor: "#000",
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cctvToggle: {
    position: "absolute",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 30,
    bottom: "40%",
    right: "5%",
    shadowColor: "#000",
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  Declaration: {
    position: "absolute",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 30,
    bottom: "50%",
    right: "5%",
    shadowColor: "#000",
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
